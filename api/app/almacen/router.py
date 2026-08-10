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
        WITH existencias_por_producto AS (
            SELECT cve_art, SUM(exist) AS existencia_total
            FROM sae_existencias
            WHERE exist > 0
            GROUP BY cve_art
        )
        SELECT
            epp.cve_art AS codigo,
            MAX(COALESCE(p.descripcion, sp.descripcion, '')) AS descripcion,
            epp.existencia_total,
            COALESCE((
                SELECT SUM(vl.cantidad_viva)
                FROM vale_lineas vl
                JOIN vales v ON vl.vale_id = v.id
                JOIN productos p2 ON vl.producto_id = p2.id
                WHERE v.estado = 'abierto'
                  AND (p2.codigo_sae = epp.cve_art OR p2.sku = epp.cve_art)
            ), 0) AS material_en_vales
        FROM existencias_por_producto epp
        LEFT JOIN productos p ON p.codigo_sae = epp.cve_art OR p.sku = epp.cve_art
        LEFT JOIN sae_productos sp ON sp.cve_art = epp.cve_art
        WHERE 1=1
    """
    params = {}
    if busqueda:
        sql += """
            AND (
                LOWER(epp.cve_art) LIKE LOWER(%(busqueda)s)
                OR LOWER(COALESCE(p.descripcion, sp.descripcion, '')) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"
    sql += " GROUP BY epp.cve_art, epp.existencia_total ORDER BY MAX(COALESCE(p.descripcion, sp.descripcion, '')) LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}


@router.get("/vales")
def vales(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query(""),
    responsable: str = Query("", description="Filtrar por responsable: joan, abelardo, aaron u otros"),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            v.id,
            v.folio,
            v.fecha AS fecha_salida,
            v.entregado_a,
            p.sku AS codigo,
            p.descripcion,
            vl.cantidad,
            u.codigo AS almacen_origen,
            v.estado
        FROM vales v
        JOIN vale_lineas vl ON v.id = vl.vale_id
        JOIN productos p ON vl.producto_id = p.id
        LEFT JOIN ubicaciones u ON vl.ubicacion_origen_id = u.id
        WHERE v.estado = 'abierto' AND vl.cantidad_viva > 0
    """
    params = {}
    if busqueda:
        sql += """
            AND (
                LOWER(v.folio) LIKE LOWER(%(busqueda)s)
                OR LOWER(v.entregado_a) LIKE LOWER(%(busqueda)s)
                OR LOWER(p.sku) LIKE LOWER(%(busqueda)s)
                OR LOWER(p.descripcion) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"
    if responsable:
        responsable_lower = responsable.lower().strip()
        if responsable_lower == "otros":
            sql += """
                AND LOWER(v.entregado_a) NOT IN ('joan', 'abelardo', 'aaron')
            """
        else:
            sql += """
                AND LOWER(v.entregado_a) LIKE LOWER(%(responsable)s)
            """
            params["responsable"] = f"%{responsable_lower}%"
    sql += " ORDER BY v.fecha DESC LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}
