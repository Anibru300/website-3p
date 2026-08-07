from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor

router = APIRouter(prefix="/api/almacen", tags=["almacen"])


@router.get("/existencias")
def existencias(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query("", description="Filtrar por código o descripción"),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            e.cve_art AS codigo,
            p.descripcion,
            a.cve_alm AS almacen,
            a.descripcion AS nombre_almacen,
            e.exist AS existencia,
            e.stock_min,
            e.stock_max,
            0 AS comprometido_recibir
        FROM sae_existencias e
        JOIN sae_productos p ON e.cve_art = p.cve_art
        JOIN sae_almacenes a ON e.cve_alm = a.cve_alm
        WHERE e.exist > 0
    """
    params = {}
    if busqueda:
        sql += """
            AND (
                LOWER(e.cve_art) LIKE LOWER(%(busqueda)s)
                OR LOWER(p.descripcion) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"
    sql += " ORDER BY p.descripcion, a.cve_alm LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}


@router.get("/vales")
def vales(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            v.id,
            v.folio,
            v.fecha_emision AS fecha_salida,
            v.entregado_a,
            vl.codigo,
            vl.descripcion,
            vl.cantidad,
            vl.almacen_origen AS almacen,
            v.estado
        FROM vales v
        JOIN vale_lineas vl ON v.id = vl.vale_id
        WHERE v.estado = 'abierto' AND vl.cantidad_viva > 0
    """
    params = {}
    if busqueda:
        sql += """
            AND (
                LOWER(v.folio) LIKE LOWER(%(busqueda)s)
                OR LOWER(v.entregado_a) LIKE LOWER(%(busqueda)s)
                OR LOWER(vl.codigo) LIKE LOWER(%(busqueda)s)
                OR LOWER(vl.descripcion) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"
    sql += " ORDER BY v.fecha_emision DESC LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}
