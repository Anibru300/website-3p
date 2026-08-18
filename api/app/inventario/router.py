import datetime
import sqlite3
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from app.auth.dependencies import get_current_user, get_current_user_from_token
from app.config import get_settings
from app.database import postgres_cursor

router = APIRouter(prefix="/api/inventario", tags=["inventario"])


# ---------------------------------------------------------------------------
# SQLite local para historial de valor del inventario
# ---------------------------------------------------------------------------


def _inventario_historico_db_path() -> Path:
    settings = get_settings()
    base = Path(settings.users_db_path).resolve().parent
    base.mkdir(parents=True, exist_ok=True)
    return base / "inventario_historico.db"


def _init_inventario_historico_db():
    path = _inventario_historico_db_path()
    conn = sqlite3.connect(str(path))
    try:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS inventario_valor_historico (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha DATE NOT NULL,
                cve_alm TEXT,
                nombre_alm TEXT,
                existencia_total REAL DEFAULT 0,
                valor_total REAL DEFAULT 0,
                moneda TEXT DEFAULT 'MXN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(fecha, cve_alm)
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def _db_connection():
    _init_inventario_historico_db()
    conn = sqlite3.connect(str(_inventario_historico_db_path()))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Autenticación dual: JWT de usuario o token de servicio
# ---------------------------------------------------------------------------


def _require_snapshot_auth(
    authorization: str | None = Header(None, alias="Authorization"),
    x_service_token: str | None = Header(None, alias="X-Service-Token"),
):
    """Permite llamadas con JWT normal (frontend) o service token (scripts)."""
    settings = get_settings()
    service_token = settings.service_token

    if x_service_token and service_token and x_service_token == service_token:
        return {"auth_type": "service"}

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:]
        user = get_current_user_from_token(token)
        return {"auth_type": "user", "user": user}

    raise HTTPException(status_code=401, detail="Autenticación requerida")


# ---------------------------------------------------------------------------
# Endpoints existentes
# ---------------------------------------------------------------------------


@router.get("/movimientos")
def movimientos(
    limit: int = Query(50, ge=1, le=500),
    fecha: datetime.date | None = Query(None, description="YYYY-MM-DD"),
    user: dict = Depends(get_current_user),
):
    target_date = fecha or datetime.date.today()
    sql = """
        SELECT
            m.fecha_doc,
            m.cve_art AS codigo,
            m.almacen,
            m.tipo_doc,
            c.descripcion AS concepto,
            m.cantidad,
            m.existencia,
            m.referencia
        FROM sae_movimientos_inventario m
        LEFT JOIN sae_conceptos_movimiento c ON m.cve_cpto = c.cve_cpto
        WHERE m.fecha_doc = %(fecha)s
        ORDER BY m.cve_art, m.almacen
        LIMIT %(limit)s
    """
    with postgres_cursor() as cur:
        cur.execute(sql, {"fecha": target_date, "limit": limit})
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}


# ---------------------------------------------------------------------------
# Historial de valor del inventario
# ---------------------------------------------------------------------------


def _calcular_valor_inventario_actual():
    """Devuelve el valor actual por almacén y el total consolidado."""
    sql = """
        SELECT
            e.cve_alm,
            MAX(a.descripcion) AS nombre,
            SUM(e.exist) AS existencia_total,
            SUM(e.exist * COALESCE(p.costo_promedio, 0)) AS valor_total
        FROM sae_existencias e
        LEFT JOIN sae_almacenes a ON e.cve_alm = a.cve_alm
        LEFT JOIN sae_productos p ON e.cve_art = p.cve_art
        WHERE e.exist > 0
        GROUP BY e.cve_alm
        ORDER BY valor_total DESC
    """
    with postgres_cursor() as cur:
        cur.execute(sql)
        rows = cur.fetchall()

    almacenes = []
    total_existencia = 0.0
    total_valor = 0.0

    for row in rows:
        row_dict = dict(row)
        existencia = float(row_dict["existencia_total"] or 0)
        valor = float(row_dict["valor_total"] or 0)
        total_existencia += existencia
        total_valor += valor
        almacenes.append({
            "cve_alm": row_dict["cve_alm"],
            "nombre_alm": row_dict["nombre"] or f"Almacén {row_dict['cve_alm']}",
            "existencia_total": existencia,
            "valor_total": valor,
        })

    return {
        "almacenes": almacenes,
        "total": {
            "cve_alm": "TOTAL",
            "nombre_alm": "Total",
            "existencia_total": total_existencia,
            "valor_total": total_valor,
        },
    }


@router.post("/valor-historico/snapshot")
def guardar_snapshot_valor_inventario(
    auth: dict = Depends(_require_snapshot_auth),
):
    """Calcula y guarda el valor del inventario para el día actual."""
    _init_inventario_historico_db()
    hoy = datetime.date.today().isoformat()

    valores = _calcular_valor_inventario_actual()
    registros = [valores["total"], *valores["almacenes"]]

    path = _inventario_historico_db_path()
    conn = sqlite3.connect(str(path))
    try:
        cur = conn.cursor()
        guardados = 0
        for r in registros:
            cur.execute(
                """
                INSERT INTO inventario_valor_historico
                (fecha, cve_alm, nombre_alm, existencia_total, valor_total, moneda)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(fecha, cve_alm) DO UPDATE SET
                    nombre_alm = excluded.nombre_alm,
                    existencia_total = excluded.existencia_total,
                    valor_total = excluded.valor_total,
                    moneda = excluded.moneda,
                    created_at = CURRENT_TIMESTAMP
                """,
                (
                    hoy,
                    r["cve_alm"],
                    r["nombre_alm"],
                    r["existencia_total"],
                    r["valor_total"],
                    "MXN",
                ),
            )
            guardados += 1
        conn.commit()
    finally:
        conn.close()

    return {
        "fecha": hoy,
        "registros_guardados": guardados,
        "valor_total": valores["total"]["valor_total"],
    }


@router.get("/valor-historico")
def obtener_historial_valor_inventario(
    fecha_desde: datetime.date | None = Query(None, description="YYYY-MM-DD"),
    fecha_hasta: datetime.date | None = Query(None, description="YYYY-MM-DD"),
    user: dict = Depends(get_current_user),
):
    """Devuelve el historial de valor del inventario (total + por almacén)."""
    _init_inventario_historico_db()

    params = []
    sql = "SELECT * FROM inventario_valor_historico WHERE 1=1"

    if fecha_desde:
        sql += " AND fecha >= ?"
        params.append(fecha_desde.isoformat())
    if fecha_hasta:
        sql += " AND fecha <= ?"
        params.append(fecha_hasta.isoformat())

    sql += " ORDER BY fecha ASC, CASE WHEN cve_alm IS NULL THEN 0 ELSE 1 END, cve_alm"

    path = _inventario_historico_db_path()
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        data = [dict(row) for row in rows]
    finally:
        conn.close()

    return {"data": data}
