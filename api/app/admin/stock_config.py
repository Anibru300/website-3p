"""Endpoints admin para la configuración de stock mínimo por producto.

Catálogo completo de productos (SAE) con existencias, mínimo de SAE y
mínimo personalizado; alta/edición/borrado de overrides. El mínimo efectivo
(personalizado > SAE > 0) es la misma regla que usan las alertas y el KPI
del dashboard (ver app/services/stock_config.py).
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.database import postgres_cursor, users_connection
from app.services.stock_config import merge_config, obtener_configs

router = APIRouter(prefix="/stock-config", tags=["admin", "stock"])


class StockMinIn(BaseModel):
    codigo: str = Field(min_length=1)
    stock_min: float = Field(ge=0)
    notas: str | None = None


def _catalogo_desde_sae(busqueda: str | None, cve_alm: int | None) -> list:
    """Productos de SAE con existencia agregada (total o de un almacén).

    Cuando se filtra por almacén, solo se devuelven los productos que tienen
    existencia (> 0) en ese almacén.
    """
    params = {}
    almacen_filtro = ""
    if cve_alm is not None:
        almacen_filtro = "AND e.cve_alm = %(cve_alm)s"
        params["cve_alm"] = cve_alm

    sql = f"""
        SELECT
            sp.cve_art AS codigo,
            MAX(COALESCE(sp.descripcion, '')) AS descripcion,
            COALESCE(SUM(e.exist), 0) AS existencia,
            MAX(e.stock_min) AS stock_min
        FROM sae_productos sp
        LEFT JOIN sae_existencias e ON e.cve_art = sp.cve_art {almacen_filtro}
        WHERE 1=1
    """
    if busqueda:
        sql += """
            AND (
                LOWER(sp.cve_art) LIKE LOWER(%(busqueda)s)
                OR LOWER(COALESCE(sp.descripcion, '')) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"

    sql += " GROUP BY sp.cve_art ORDER BY sp.cve_art"

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        filas = [dict(r) for r in cur.fetchall()]

    if cve_alm is not None:
        filas = [f for f in filas if float(f.get("existencia") or 0) > 0]
    return filas


@router.get("/catalogo")
def catalogo_stock(
    busqueda: str | None = Query(None),
    cve_alm: int | None = Query(None),
    filtro: str = Query("todos", pattern="^(todos|configurados|sin_minimo|bajo_minimo)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Catálogo de productos con existencia y mínimo efectivo, paginado."""
    configs = obtener_configs()
    filas = merge_config(_catalogo_desde_sae(busqueda, cve_alm), configs)

    if filtro == "configurados":
        filas = [f for f in filas if f["stock_min_custom"] is not None]
    elif filtro == "sin_minimo":
        filas = [f for f in filas if f["minimo_efectivo"] is None]
    elif filtro == "bajo_minimo":
        filas = [f for f in filas if f["bajo_minimo"]]

    total = len(filas)
    pagina = filas[offset : offset + limit]
    for f in pagina:
        f.pop("stock_min", None)  # ya viene como stock_min_sae
    return {"total": total, "productos": pagina, "offset": offset, "limit": limit}


@router.put("")
def guardar_stock_min(body: StockMinIn):
    """Crea o actualiza el mínimo personalizado de un producto (override a SAE)."""
    codigo = body.codigo.strip()
    if not codigo:
        raise HTTPException(status_code=422, detail="El código no puede estar vacío")

    with users_connection() as conn:
        conn.execute(
            """
            INSERT INTO stock_config (codigo, stock_min, notas, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(codigo) DO UPDATE SET
                stock_min = excluded.stock_min,
                notas = excluded.notas,
                updated_at = CURRENT_TIMESTAMP
            """,
            (codigo, body.stock_min, body.notas),
        )
        conn.commit()
    return {"codigo": codigo, "stock_min": body.stock_min}


@router.delete("/{codigo}")
def eliminar_stock_min(codigo: str):
    """Quita el override; el producto vuelve al mínimo de SAE (o a sin mínimo)."""
    with users_connection() as conn:
        cur = conn.execute("DELETE FROM stock_config WHERE codigo = ?", (codigo,))
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail=f"Sin configuración para {codigo}")
    return {"codigo": codigo, "eliminado": True}
