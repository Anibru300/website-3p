"""Lógica de negocio del módulo Logística.

Puente entre la necesidad de material (demanda), lo que Logística consigue
(abastecimiento/OC), la relación entre ambos (asignación) y lo que llega a
almacén (recepciones).

La demanda es una proyección persistida con ciclo de vida, no información
maestra: se regenera desde fuentes existentes (detalle de pedidos pendientes
y stock mínimo efectivo de SAE). La descripción de productos, clientes y
existencias siempre se leen de su fuente original; aquí solo se conservan
claves y cantidades.

Reglas de negocio (validadas en este servicio):
- R1: la cantidad asignada nunca supera la cantidad abastecida.
- R2: la cantidad recibida nunca supera la cantidad comprada/abastecida.
- R3: pendiente de recibir = abastecido - recibido (calculado, no almacenado).
- R5: una demanda cuya cobertura (suma de asignaciones) >= cantidad queda
  `cubierta` y no debe re-solicitarse (anti-duplicidad).
"""

from datetime import date, datetime, timedelta
from typing import Optional

from app.database import logistica_connection, postgres_cursor
from app.services.stock_config import merge_config, obtener_configs

TIPOS_DEMANDA = ("PEDIDO", "STOCK", "OTRA")
PRIORIDADES = ("baja", "media", "alta", "critica")

_ERROR_ASIGNACION = "La cantidad asignada supera la cantidad abastecida."
_ERROR_RECEPCION = "La cantidad recibida supera la cantidad comprada."


# ---------------------------------------------------------------------------
# Cálculos agregados (R1-R4)
# ---------------------------------------------------------------------------

def _suma_por_abastecimiento(conn) -> dict:
    """abastecimiento_id -> {asignado, asignado_pedido, asignado_stock, recibido}."""
    totales = {}
    for row in conn.execute(
        """
        SELECT a.abastecimiento_id AS aid,
               SUM(a.cantidad) AS asignado
        FROM asignacion a
        JOIN demanda d ON d.id = a.demanda_id
        GROUP BY a.abastecimiento_id
        """
    ).fetchall():
        totales[row["aid"]] = {
            "asignado": float(row["asignado"] or 0),
            "asignado_pedido": 0.0,
            "asignado_stock": 0.0,
            "recibido": 0.0,
        }
    for row in conn.execute(
        """
        SELECT a.abastecimiento_id AS aid, d.tipo, SUM(a.cantidad) AS cant
        FROM asignacion a
        JOIN demanda d ON d.id = a.demanda_id
        GROUP BY a.abastecimiento_id, d.tipo
        """
    ).fetchall():
        t = totales.setdefault(row["aid"], {"asignado": 0.0, "asignado_pedido": 0.0, "asignado_stock": 0.0, "recibido": 0.0})
        if row["tipo"] == "PEDIDO":
            t["asignado_pedido"] = float(row["cant"] or 0)
        elif row["tipo"] == "STOCK":
            t["asignado_stock"] = float(row["cant"] or 0)
    for row in conn.execute(
        "SELECT abastecimiento_id AS aid, SUM(cantidad) AS recibido FROM recepcion GROUP BY abastecimiento_id"
    ).fetchall():
        t = totales.setdefault(row["aid"], {"asignado": 0.0, "asignado_pedido": 0.0, "asignado_stock": 0.0, "recibido": 0.0})
        t["recibido"] = float(row["recibido"] or 0)
    return totales


def _cubierto_por_demanda(conn) -> dict:
    """demanda_id -> cantidad cubierta (suma de asignaciones)."""
    return {
        row["did"]: float(row["cant"] or 0)
        for row in conn.execute(
            "SELECT demanda_id AS did, SUM(cantidad) AS cant FROM asignacion GROUP BY demanda_id"
        ).fetchall()
    }


def calcular_estatus_abastecimiento(ab: dict, totales: dict) -> str:
    """Estatus derivado: recibido > parcial > transito > solicitado."""
    if ab.get("estatus") == "cancelado":
        return "cancelado"
    recibido = totales.get(ab["id"], {}).get("recibido", 0.0)
    cantidad = float(ab["cantidad"])
    if cantidad > 0 and recibido >= cantidad:
        return "recibido"
    if recibido > 0:
        return "parcial"
    if totales.get(ab["id"], {}).get("asignado", 0.0) > 0:
        return "transito"
    return "solicitado"


def es_atrasado(ab: dict, totales: dict, hoy: Optional[date] = None) -> bool:
    fecha_estimada = ab.get("fecha_estimada")
    if not fecha_estimada:
        return False
    hoy = hoy or date.today()
    try:
        estimada = date.fromisoformat(str(fecha_estimada)[:10])
    except ValueError:
        return False
    pendiente = float(ab["cantidad"]) - totales.get(ab["id"], {}).get("recibido", 0.0)
    return estimada < hoy and pendiente > 0


def calcular_estatus_demanda(cantidad: float, cubierto: float) -> str:
    if cantidad <= 0:
        return "cubierta"
    if cubierto >= cantidad:
        return "cubierta"
    if cubierto > 0:
        return "parcial"
    return "pendiente"


# ---------------------------------------------------------------------------
# Descripciones de materiales (lectura de SAE, sin duplicar maestros)
# ---------------------------------------------------------------------------

_QUERY_DESCRIPCIONES = """
    SELECT cve_art AS codigo, COALESCE(descripcion, '') AS descripcion
    FROM sae_productos
    WHERE cve_art = ANY(%(codigos)s)
"""


def describir_materiales(codigos: list[str]) -> dict:
    """{codigo: descripcion} para una lista de códigos (una sola consulta SAE)."""
    codigos = [str(c) for c in codigos if c]
    if not codigos:
        return {}
    try:
        with postgres_cursor() as cur:
            cur.execute(_QUERY_DESCRIPCIONES, {"codigos": codigos})
            return {str(r["codigo"]): r["descripcion"] for r in cur.fetchall()}
    except Exception:  # noqa: BLE001 - el espejo puede no responder; no es crítico
        return {}


# ---------------------------------------------------------------------------
# Regeneración de demanda (PEDIDO desde sync/Excel, STOCK desde SAE)
# ---------------------------------------------------------------------------

_QUERY_STOCK_OBJETIVO = """
    SELECT
        e.cve_art AS codigo,
        MAX(COALESCE(p.descripcion, '')) AS descripcion,
        SUM(e.exist) AS existencia,
        MAX(e.stock_min) AS stock_min,
        MAX(e.stock_max) AS stock_max
    FROM sae_existencias e
    LEFT JOIN sae_productos p ON p.cve_art = e.cve_art
    GROUP BY e.cve_art
"""


def _a_iso(valor) -> Optional[str]:
    """Normaliza fecha (date/datetime/str) a 'YYYY-MM-DD'; None si no aplica."""
    if valor is None or valor == "":
        return None
    if isinstance(valor, datetime):
        return valor.date().isoformat()
    if isinstance(valor, date):
        return valor.isoformat()
    texto = str(valor).strip()
    return texto[:10] if texto else None


def _generar_demanda_pedido() -> list[dict]:
    """Filas de demanda por pedido desde DETALLE_PEDIDOS (sync_sheets o Excel)."""
    from app.services.excel import _pedidos_rows

    _, detalles = _pedidos_rows()
    generadas = []
    for d in detalles:
        codigo = str(d.get("CODIGO") or "").strip()
        folio = str(d.get("FOLIO_PEDIDO") or "").strip()
        if not codigo or not folio:
            continue
        try:
            pendiente = float(d.get("CANT_PENDIENTE_SURTIR") or 0)
        except (TypeError, ValueError):
            continue
        if pendiente <= 0:
            continue
        generadas.append(
            {
                "tipo": "PEDIDO",
                "material": codigo,
                "referencia": folio,
                "cantidad": pendiente,
                "cliente": str(d.get("CLIENTE") or "").strip(),
                "fecha_requerida": _a_iso(d.get("FECHA_ENTREGA_TENTATIVA")),
            }
        )
    return generadas


def _generar_demanda_stock() -> list[dict]:
    """Filas de demanda por stock: productos bajo el mínimo efectivo.

    Cantidad necesaria = max(0, objetivo - existencia), donde objetivo =
    stock_max de SAE si es mayor al mínimo efectivo; si no, el mínimo.
    """
    configs = obtener_configs()
    with postgres_cursor() as cur:
        cur.execute(_QUERY_STOCK_OBJETIVO, {})
        filas = merge_config([dict(r) for r in cur.fetchall()], configs)

    generadas = []
    for f in filas:
        if not f["bajo_minimo"]:
            continue
        existencia = float(f["existencia"])
        minimo = float(f["minimo_efectivo"])
        stock_max = 0.0
        # merge_config no expone stock_max; lo leemos del campo crudo si existe
        stock_max_raw = f.get("stock_max") or 0
        try:
            stock_max = float(stock_max_raw)
        except (TypeError, ValueError):
            stock_max = 0.0
        objetivo = stock_max if stock_max > minimo else minimo
        necesaria = objetivo - existencia
        if necesaria <= 0:
            continue
        generadas.append(
            {
                "tipo": "STOCK",
                "material": str(f["codigo"]),
                "referencia": "",
                "cantidad": necesaria,
                "cliente": "",
                "fecha_requerida": None,
            }
        )
    return generadas


def regenerar_demanda() -> dict:
    """Regenera la demanda PEDIDO y STOCK (upsert por clave natural).

    - Inserta/actualiza filas cuya necesidad sigue vigente.
    - Desactiva (activa=0) las demandas automáticas que ya no aplican.
    - Conserva prioridad, observaciones y justificación editadas por Logística.
    - Recalcula el estatus de cobertura de todas las demandas activas (R5).
    """
    try:
        pedido = _generar_demanda_pedido()
    except Exception:  # noqa: BLE001 - la fuente Excel puede fallar; no romper
        pedido = []
    try:
        stock = _generar_demanda_stock()
    except Exception:  # noqa: BLE001 - el espejo puede no responder
        stock = []

    generadas = pedido + stock
    activas = {(g["tipo"], g["material"], g["referencia"]) for g in generadas}

    with logistica_connection() as conn:
        for g in generadas:
            conn.execute(
                """
                INSERT INTO demanda (tipo, material, referencia, cantidad, cliente,
                                     fecha_requerida, origen, activa, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'auto', 1, CURRENT_TIMESTAMP)
                ON CONFLICT(tipo, material, referencia) DO UPDATE SET
                    cantidad = excluded.cantidad,
                    cliente = excluded.cliente,
                    fecha_requerida = excluded.fecha_requerida,
                    activa = 1,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (g["tipo"], g["material"], g["referencia"], g["cantidad"],
                 g["cliente"], g["fecha_requerida"]),
            )
        # Desactivar demandas automáticas que ya no tienen necesidad vigente
        for row in conn.execute(
            "SELECT id, tipo, material, referencia FROM demanda WHERE origen = 'auto' AND activa = 1"
        ).fetchall():
            if (row["tipo"], row["material"], row["referencia"]) not in activas:
                conn.execute(
                    "UPDATE demanda SET activa = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (row["id"],),
                )
        conn.commit()
        _recalcular_estatus_demandas(conn)

    return {
        "generadas": len(generadas),
        "por_pedido": len(pedido),
        "por_stock": len(stock),
    }


def _recalcular_estatus_demandas(conn):
    cubierto = _cubierto_por_demanda(conn)
    for row in conn.execute("SELECT id, cantidad, estatus FROM demanda WHERE activa = 1").fetchall():
        nuevo = calcular_estatus_demanda(float(row["cantidad"]), cubierto.get(row["id"], 0.0))
        if nuevo != row["estatus"]:
            conn.execute(
                "UPDATE demanda SET estatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (nuevo, row["id"]),
            )
    conn.commit()


# ---------------------------------------------------------------------------
# Validaciones de reglas (R1 / R2)
# ---------------------------------------------------------------------------

def validar_asignacion(conn, abastecimiento_id: int, demanda_id: int, cantidad: float):
    """R1: la suma de asignaciones (incl. la nueva) no supera lo abastecido.

    Además exige que el material de la demanda coincida con el abastecimiento,
    para que el destino (pedido/stock) quede cuadrado por material.
    """
    ab = conn.execute(
        "SELECT * FROM abastecimiento WHERE id = ?", (abastecimiento_id,)
    ).fetchone()
    if not ab:
        raise ValueError("Abastecimiento no encontrado")
    dem = conn.execute("SELECT * FROM demanda WHERE id = ?", (demanda_id,)).fetchone()
    if not dem:
        raise ValueError("Demanda no encontrada")
    if str(dem["material"]).strip() != str(ab["material"]).strip():
        raise ValueError(
            f"El material de la demanda ({dem['material']}) no coincide con el del abastecimiento ({ab['material']})"
        )
    if cantidad <= 0:
        raise ValueError("La cantidad asignada debe ser mayor a cero")
    ya = _suma_por_abastecimiento(conn).get(abastecimiento_id, {}).get("asignado", 0.0)
    if ya + cantidad > float(ab["cantidad"]) + 1e-9:
        raise ValueError(_ERROR_ASIGNACION)


def validar_recepcion(conn, abastecimiento_id: int, cantidad: float):
    """R2: la suma de recepciones (incl. la nueva) no supera lo comprado."""
    ab = conn.execute(
        "SELECT * FROM abastecimiento WHERE id = ?", (abastecimiento_id,)
    ).fetchone()
    if not ab:
        raise ValueError("Abastecimiento no encontrado")
    if cantidad <= 0:
        raise ValueError("La cantidad recibida debe ser mayor a cero")
    recibido = _suma_por_abastecimiento(conn).get(abastecimiento_id, {}).get("recibido", 0.0)
    if recibido + cantidad > float(ab["cantidad"]) + 1e-9:
        raise ValueError(_ERROR_RECEPCION)


# ---------------------------------------------------------------------------
# Serialización (listas con desglose calculado)
# ---------------------------------------------------------------------------

def listar_demanda(tipo=None, estatus=None, prioridad=None, busqueda=None) -> list[dict]:
    with logistica_connection() as conn:
        cubierto = _cubierto_por_demanda(conn)
        sql = "SELECT * FROM demanda WHERE activa = 1"
        params: list = []
        if tipo in TIPOS_DEMANDA:
            sql += " AND tipo = ?"
            params.append(tipo)
        if busqueda:
            sql += " AND (material LIKE ? OR referencia LIKE ? OR cliente LIKE ?)"
            like = f"%{busqueda}%"
            params += [like, like, like]
        filas = [dict(r) for r in conn.execute(sql, params).fetchall()]

    descripciones = describir_materiales([f["material"] for f in filas])
    resultado = []
    for f in filas:
        cub = cubierto.get(f["id"], 0.0)
        cantidad = float(f["cantidad"])
        est = calcular_estatus_demanda(cantidad, cub)
        if estatus and est != estatus:
            continue
        if prioridad and f["prioridad"] != prioridad:
            continue
        f["descripcion"] = descripciones.get(f["material"], "")
        f["cantidad"] = cantidad
        f["cubierto"] = cub
        f["pendiente"] = max(0.0, cantidad - cub)
        f["estatus"] = est
        resultado.append(f)
    return resultado


def listar_abastecimientos(filtro="todo", busqueda=None) -> list[dict]:
    hoy = date.today()
    limite_proximos = hoy + timedelta(days=7)
    with logistica_connection() as conn:
        totales = _suma_por_abastecimiento(conn)
        sql = "SELECT * FROM abastecimiento WHERE estatus != 'cancelado'"
        params: list = []
        if busqueda:
            sql += " AND (material LIKE ? OR oc LIKE ? OR proveedor LIKE ? OR folio LIKE ?)"
            like = f"%{busqueda}%"
            params += [like, like, like, like]
        filas = [dict(r) for r in conn.execute(sql, params).fetchall()]

    descripciones = describir_materiales([f["material"] for f in filas])
    resultado = []
    for f in filas:
        t = totales.get(f["id"], {"asignado": 0.0, "asignado_pedido": 0.0, "asignado_stock": 0.0, "recibido": 0.0})
        cantidad = float(f["cantidad"])
        recibido = t["recibido"]
        f.update(
            descripcion=descripciones.get(f["material"], ""),
            cantidad=cantidad,
            asignado=t["asignado"],
            asignado_pedido=t["asignado_pedido"],
            asignado_stock=t["asignado_stock"],
            sin_asignar=max(0.0, cantidad - t["asignado"]),
            recibido=recibido,
            pendiente_recibir=max(0.0, cantidad - recibido),
            estatus=calcular_estatus_abastecimiento(f, totales),
            atrasado=es_atrasado(f, totales, hoy),
        )
        f["destino"] = _destino_resumen(f)
        # Pedidos relacionados (referencias de demandas asignadas)
        f["pedidos"] = _pedidos_de_abastecimiento(f["id"])
        if filtro == "todo":
            resultado.append(f)
        elif filtro == "pedidos" and t["asignado_pedido"] > 0:
            resultado.append(f)
        elif filtro == "stock" and t["asignado_stock"] > 0:
            resultado.append(f)
        elif filtro == "sin_asignar" and f["sin_asignar"] > 0:
            resultado.append(f)
        elif filtro == "atrasados" and f["atrasado"]:
            resultado.append(f)
        elif filtro == "proximos":
            try:
                est = date.fromisoformat(str(f["fecha_estimada"])[:10])
            except (TypeError, ValueError):
                est = None
            if est and hoy <= est <= limite_proximos and f["pendiente_recibir"] > 0:
                resultado.append(f)
    return resultado


def _destino_resumen(ab: dict) -> str:
    partes = []
    if ab["asignado_pedido"] > 0:
        partes.append(f"Pedido {ab['asignado_pedido']:g}")
    if ab["asignado_stock"] > 0:
        partes.append(f"Stock {ab['asignado_stock']:g}")
    if ab["sin_asignar"] > 0:
        partes.append(f"Sin asignar {ab['sin_asignar']:g}")
    return " · ".join(partes)


def _pedidos_de_abastecimiento(abastecimiento_id: int) -> list[str]:
    with logistica_connection() as conn:
        rows = conn.execute(
            """
            SELECT DISTINCT d.referencia
            FROM asignacion a
            JOIN demanda d ON d.id = a.demanda_id
            WHERE a.abastecimiento_id = ? AND d.tipo = 'PEDIDO' AND d.referencia != ''
            """,
            (abastecimiento_id,),
        ).fetchall()
    return [r["referencia"] for r in rows]


def listar_asignaciones() -> list[dict]:
    """Matriz por abastecimiento: comprado / pedido / stock / sin asignar / recibido / pendiente."""
    abastecimientos = listar_abastecimientos(filtro="todo")
    with logistica_connection() as conn:
        detalle = {}
        for row in conn.execute(
            """
            SELECT a.id, a.abastecimiento_id, a.demanda_id, a.cantidad,
                   d.tipo, d.material, d.referencia, d.cliente
            FROM asignacion a
            JOIN demanda d ON d.id = a.demanda_id
            ORDER BY a.abastecimiento_id, a.id
            """
        ).fetchall():
            detalle.setdefault(row["abastecimiento_id"], []).append(dict(row))
    for ab in abastecimientos:
        ab["detalle"] = detalle.get(ab["id"], [])
    return abastecimientos


def listar_recepciones(abastecimiento_id=None) -> list[dict]:
    sql = """
        SELECT r.*, a.folio, a.oc, a.material, a.proveedor
        FROM recepcion r
        JOIN abastecimiento a ON a.id = r.abastecimiento_id
    """
    params: list = []
    if abastecimiento_id:
        sql += " WHERE r.abastecimiento_id = ?"
        params.append(abastecimiento_id)
    sql += " ORDER BY r.fecha_recepcion DESC, r.id DESC"
    with logistica_connection() as conn:
        filas = [dict(r) for r in conn.execute(sql, params).fetchall()]
    descripciones = describir_materiales([f["material"] for f in filas])
    movs = _movs_por_ids([int(f["mov_sae_id"]) for f in filas if f.get("mov_sae_id")])
    for f in filas:
        f["descripcion"] = descripciones.get(f["material"], "")
        f["cantidad"] = float(f["cantidad"])
        mov = movs.get(int(f["mov_sae_id"])) if f.get("mov_sae_id") else None
        if mov:
            f["mov_cantidad"] = float(mov["cantidad"])
            f["mov_fecha_doc"] = str(mov["fecha_doc"])[:10]
            f["mov_referencia"] = mov["referencia"]
            f["mov_almacen"] = mov["almacen"]
            f["mov_proveedor"] = mov["nombre_tercero"]
            f["discrepancia"] = f["cantidad"] != f["mov_cantidad"]
        else:
            f["mov_cantidad"] = None
            f["mov_fecha_doc"] = None
            f["mov_referencia"] = None
            f["mov_almacen"] = None
            f["mov_proveedor"] = None
            f["discrepancia"] = False
    return filas


def resumen() -> dict:
    abastecimientos = listar_abastecimientos(filtro="todo")
    demandas = listar_demanda()
    hoy = date.today()
    limite = hoy + timedelta(days=7)

    por_llegar = sum(a["pendiente_recibir"] for a in abastecimientos)
    en_transito = [a for a in abastecimientos if a["pendiente_recibir"] > 0]
    atrasados = [a for a in en_transito if a["atrasado"]]
    proximos = [
        a for a in en_transito
        if a["fecha_estimada"] and hoy <= date.fromisoformat(str(a["fecha_estimada"])[:10]) <= limite
    ]
    return {
        "por_llegar": por_llegar,
        "para_pedidos": sum(a["asignado_pedido"] for a in en_transito),
        "para_stock": sum(a["asignado_stock"] for a in en_transito),
        "atrasado_piezas": sum(a["pendiente_recibir"] for a in atrasados),
        "atrasado_oc": len(atrasados),
        "proximos_7_dias": sum(a["pendiente_recibir"] for a in proximos),
        "proximos_7_dias_oc": len(proximos),
        "sin_asignar": sum(a["sin_asignar"] for a in abastecimientos),
        "sin_asignar_oc": len([a for a in abastecimientos if a["sin_asignar"] > 0]),
        "demandas_pendientes": len([d for d in demandas if d["estatus"] in ("pendiente", "parcial")]),
        "demandas_cubiertas": len([d for d in demandas if d["estatus"] == "cubierta"]),
        "oc_pendientes": len(en_transito),
    }


def cobertura_material(material: str) -> dict:
    """Anti-duplicidad: necesidad vs cubierto vs en tránsito para un material."""
    material = str(material).strip()
    demandas = [d for d in listar_demanda(busqueda=None) if d["material"] == material]
    abastecimientos = [a for a in listar_abastecimientos(filtro="todo") if a["material"] == material]
    necesidad = sum(d["pendiente"] for d in demandas)
    cubierto = sum(d["cubierto"] for d in demandas)
    en_transito = sum(a["pendiente_recibir"] for a in abastecimientos)
    return {
        "material": material,
        "necesidad": necesidad,
        "cubierto": cubierto,
        "en_transito": en_transito,
        "suficiente": en_transito >= necesidad > 0 or (necesidad == 0 and cubierto >= 0),
        "demandas": demandas,
        "abastecimientos": abastecimientos,
    }


# ---------------------------------------------------------------------------
# Vinculación con entradas por compra de SAE (cuadre Logística vs almacén)
# ---------------------------------------------------------------------------

# Concepto 1 = Compras (entrada). Ver sae_conceptos_movimiento.
_QUERY_ENTRADAS_COMPRA = """
    SELECT id, cve_art AS material, cantidad, fecha_doc, referencia,
           almacen, cve_clpv, nombre_tercero
    FROM sae_movimientos_inventario
    WHERE cve_cpto = 1
"""


def _norm_proveedor(texto: str) -> str:
    """Texto normalizado para comparación floja de nombres de proveedor."""
    return "".join(c for c in str(texto or "").lower() if c.isalnum())


def _movs_por_ids(ids: list[int]) -> dict:
    if not ids:
        return {}
    try:
        with postgres_cursor() as cur:
            cur.execute(
                _QUERY_ENTRADAS_COMPRA + " AND id = ANY(%(ids)s)",
                {"ids": ids},
            )
            return {int(r["id"]): dict(r) for r in cur.fetchall()}
    except Exception:  # noqa: BLE001
        return {}


def candidatas_sae(abastecimiento_id: int) -> dict:
    """Entradas por compra de SAE candidatas a cuadrar con un abastecimiento.

    Filtro: mismo material y fecha posterior a la solicitud (si existe).
    Excluye movimientos ya vinculados a cualquier recepción. Ordena primero
    las del mismo proveedor.
    """
    with logistica_connection() as conn:
        ab = conn.execute(
            "SELECT * FROM abastecimiento WHERE id = ?", (abastecimiento_id,)
        ).fetchone()
        if not ab:
            raise ValueError("Abastecimiento no encontrado")
        vinculados = {
            row["mov_sae_id"]
            for row in conn.execute(
                "SELECT mov_sae_id FROM recepcion WHERE mov_sae_id IS NOT NULL"
            ).fetchall()
        }

    try:
        with postgres_cursor() as cur:
            sql = _QUERY_ENTRADAS_COMPRA + " AND cve_art = %(material)s"
            params = {"material": str(ab["material"])}
            if ab["fecha_solicitud"]:
                sql += " AND fecha_doc >= %(desde)s"
                params["desde"] = str(ab["fecha_solicitud"])[:10]
            sql += " ORDER BY fecha_doc DESC LIMIT 100"
            cur.execute(sql, params)
            movs = [dict(r) for r in cur.fetchall()]
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"No se pudo consultar el espejo SAE: {exc}")

    objetivo = _norm_proveedor(ab["proveedor"])
    candidatas = []
    for m in movs:
        if int(m["id"]) in vinculados:
            continue
        m["mismo_proveedor"] = bool(
            objetivo and objetivo in _norm_proveedor(m["nombre_tercero"])
        )
        candidatas.append(m)
    # Mismo proveedor primero; dentro de cada grupo, las más recientes primero
    candidatas.sort(key=lambda m: m["fecha_doc"], reverse=True)
    candidatas.sort(key=lambda m: not m["mismo_proveedor"])
    return {
        "abastecimiento_id": abastecimiento_id,
        "material": ab["material"],
        "proveedor_oc": ab["proveedor"],
        "candidatas": candidatas,
    }


def vincular_recepcion_sae(recepcion_id: int, mov_sae_id: int) -> dict:
    """Vincula una recepción existente con su entrada por compra en SAE."""
    with logistica_connection() as conn:
        rec = conn.execute("SELECT * FROM recepcion WHERE id = ?", (recepcion_id,)).fetchone()
        if not rec:
            raise ValueError("Recepción no encontrada")
        ocupado = conn.execute(
            "SELECT id FROM recepcion WHERE mov_sae_id = ? AND id != ?",
            (mov_sae_id, recepcion_id),
        ).fetchone()
        if ocupado:
            raise ValueError(
                f"Esa entrada de SAE ya está vinculada a la recepción {ocupado['id']}"
            )
        movs = _movs_por_ids([int(mov_sae_id)])
        mov = movs.get(int(mov_sae_id))
        if not mov:
            raise ValueError("No existe la entrada de compra en el espejo SAE")
        conn.execute(
            "UPDATE recepcion SET mov_sae_id = ?, cuadrada = 1 WHERE id = ?",
            (int(mov_sae_id), recepcion_id),
        )
        conn.commit()
    return {
        "recepcion_id": recepcion_id,
        "mov_sae_id": int(mov_sae_id),
        "cuadrada": True,
        "mov": mov,
        "discrepancia": float(rec["cantidad"]) != float(mov["cantidad"]),
    }
