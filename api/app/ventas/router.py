import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from openpyxl import load_workbook

from app.auth.dependencies import get_current_user
from app.config import get_settings
from app.database import postgres_cursor

router = APIRouter(prefix="/api/ventas", tags=["ventas"])


def _normalize_text(value):
    if value is None:
        return ""
    return str(value).strip()


def _read_excel_sheet(wb, sheet_name):
    if sheet_name not in wb.sheetnames:
        return []
    ws = wb[sheet_name]
    headers = [_normalize_text(cell.value) for cell in ws[1]]
    data = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row or all(v is None for v in row):
            continue
        item = {}
        for h, v in zip(headers, row):
            if h:
                item[h] = v
        data.append(item)
    return data


@router.get("/pedidos-vivos")
def pedidos_vivos(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    """Pedidos vivos reales: leídos desde el Excel de pendientes por facturar."""
    settings = get_settings()
    excel_path = Path(settings.pedidos_pendientes_facturar_excel_path)

    if not excel_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"No se encontró el archivo de pedidos: {excel_path}",
        )

    try:
        wb = load_workbook(filename=str(excel_path), read_only=True, data_only=True)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"No se pudo abrir el archivo de pedidos. Puede estar abierto en Excel. Error: {exc}",
        )

    try:
        cabeceras = _read_excel_sheet(wb, "PEDIDOS")
        detalles = _read_excel_sheet(wb, "DETALLE_PEDIDOS")
    finally:
        wb.close()

    # Agregar totales por folio desde el detalle
    agg = {}
    for d in detalles:
        folio = _normalize_text(d.get("FOLIO_PEDIDO"))
        if not folio:
            continue
        if folio not in agg:
            agg[folio] = {
                "importe_total": 0.0,
                "total_facturado": 0.0,
                "saldo_pendiente": 0.0,
            }
        cant_pedida = d.get("CANT_PEDIDA", 0) or 0
        precio_unitario = d.get("PRECIO_UNITARIO", 0) or 0
        total_facturado = d.get("TOTAL_FACTURADO", 0) or 0
        pendiente_facturar = d.get("PENDIENTE_FACTURAR", 0) or 0
        try:
            agg[folio]["importe_total"] += float(cant_pedida) * float(precio_unitario)
            agg[folio]["total_facturado"] += float(total_facturado)
            agg[folio]["saldo_pendiente"] += float(pendiente_facturar)
        except (ValueError, TypeError):
            continue

    busqueda_lower = busqueda.lower().strip()
    resultados = []
    for c in cabeceras:
        folio = _normalize_text(c.get("FOLIO_PEDIDO"))
        if not folio:
            continue
        cliente = _normalize_text(c.get("CLIENTE"))
        if busqueda_lower and (
            busqueda_lower not in folio.lower()
            and busqueda_lower not in cliente.lower()
        ):
            continue

        fecha = c.get("FECHA_PEDIDO")
        dias_pendiente = None
        if isinstance(fecha, datetime.datetime):
            dias_pendiente = (datetime.date.today() - fecha.date()).days
        elif isinstance(fecha, datetime.date):
            dias_pendiente = (datetime.date.today() - fecha).days

        totales = agg.get(folio, {})
        saldo_pendiente = totales.get("saldo_pendiente", 0.0)
        # Ignorar pedidos que ya quedaron en cero por redondeo
        if saldo_pendiente <= 0.01:
            continue

        resultados.append({
            "folio": folio,
            "cliente": cliente,
            "fecha": fecha.isoformat() if hasattr(fecha, "isoformat") else fecha,
            "importe_total": totales.get("importe_total", 0.0),
            "total_facturado": totales.get("total_facturado", 0.0),
            "saldo_pendiente": saldo_pendiente,
            "estado": _normalize_text(c.get("STATUS_GENERAL")),
            "dias_pendiente": dias_pendiente,
        })

    resultados.sort(key=lambda x: x["fecha"] or "", reverse=True)
    return {"data": resultados[:limit]}


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
