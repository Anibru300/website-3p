from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor

router = APIRouter(prefix="/api/ventas", tags=["ventas"])


@router.get("/pedidos-vivos")
def pedidos_vivos(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            cve_doc AS folio,
            fecha_doc AS fecha,
            cliente,
            importe_pedido AS importe_total,
            total_facturado,
            saldo_pendiente,
            estado_facturacion AS estado,
            (CURRENT_DATE - fecha_doc) AS dias_pendiente
        FROM v_pedidos_vivos
        WHERE saldo_pendiente > 0.01
          AND estado_facturacion IN ('PENDIENTE', 'PARCIAL')
        -- La vista no tiene un estado 'abierto'; los valores reales son PENDIENTE, PARCIAL y FACTURADO.
        -- Solo consideramos pedidos con saldo pendiente y no totalmente facturados.
    """
    params = {}
    if busqueda:
        sql += """
            AND (
                LOWER(cve_doc) LIKE LOWER(%(busqueda)s)
                OR LOWER(cliente) LIKE LOWER(%(busqueda)s)
            )
        """
        params["busqueda"] = f"%{busqueda}%"
    sql += " ORDER BY fecha_doc DESC LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}


@router.get("/facturas-cobranza")
def facturas_cobranza(
    limit: int = Query(50, ge=1, le=500),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            cve_doc AS folio,
            cliente,
            fecha_doc,
            importe_total AS total,
            estado_cobranza
        FROM v_facturas_cobranza
        WHERE estado_cobranza IN ('Pendiente', 'Vencida')
        ORDER BY fecha_doc DESC
        LIMIT %(limit)s
    """
    with postgres_cursor() as cur:
        cur.execute(sql, {"limit": limit})
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}


@router.get("/seguimiento-documental")
def seguimiento_documental(
    folio_pedido: str = Query(""),
    limit: int = Query(50, ge=1, le=500),
    user: dict = Depends(get_current_user),
):
    sql = """
        SELECT
            folio_pedido,
            fecha_pedido,
            cliente,
            codigo,
            descripcion,
            cantidad_pedido,
            folio_remision,
            cantidad_remision,
            folio_factura,
            cantidad_factura,
            estatus_linea
        FROM v_seguimiento_documental
        WHERE 1=1
    """
    params = {}
    if folio_pedido:
        sql += " AND folio_pedido = %(folio_pedido)s"
        params["folio_pedido"] = folio_pedido
    sql += " ORDER BY folio_pedido, codigo LIMIT %(limit)s"
    params["limit"] = limit

    with postgres_cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}
