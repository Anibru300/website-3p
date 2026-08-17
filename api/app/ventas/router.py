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


def get_pedidos_vivos_excel(busqueda: str = "", limit: int | None = None):
    """Lee los pedidos vivos reales desde el Excel de pendientes por facturar."""
    settings = get_settings()
    excel_path = Path(settings.pedidos_pendientes_facturar_excel_path)

    if not excel_path.exists():
        return []

    try:
        wb = load_workbook(filename=str(excel_path), read_only=True, data_only=True)
    except Exception:
        return []

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
        importe_total = totales.get("importe_total", 0.0)
        total_facturado = totales.get("total_facturado", 0.0)

        # Ignorar pedidos que ya quedaron en cero por redondeo
        if saldo_pendiente <= 0.01:
            continue

        # Clasificación automática por montos (más confiable que el texto del Excel)
        if total_facturado > 0.01:
            estado_calculado = "Parcial"
        else:
            estado_calculado = "Pendiente"

        # Moneda de origen del pedido (defecto MXN si no viene)
        moneda_val = _normalize_text(c.get("MONEDA") or c.get("MONEDA_PEDIDO") or "MXN").upper()
        if moneda_val not in ("USD", "MXN", "PESOS", "DOLARES", "DÓLARES"):
            moneda_val = "MXN"
        if moneda_val in ("PESOS",):
            moneda_val = "MXN"
        if moneda_val in ("DOLARES", "DÓLARES"):
            moneda_val = "USD"

        resultados.append({
            "folio": folio,
            "cliente": cliente,
            "fecha": fecha.isoformat() if hasattr(fecha, "isoformat") else fecha,
            "importe_total": importe_total,
            "total_facturado": total_facturado,
            "saldo_pendiente": saldo_pendiente,
            "estado": estado_calculado,
            "estado_original": _normalize_text(c.get("STATUS_GENERAL")),
            "moneda": moneda_val,
            "dias_pendiente": dias_pendiente,
        })

    resultados.sort(key=lambda x: x["fecha"] or "", reverse=True)
    if limit:
        resultados = resultados[:limit]
    return resultados


@router.get("/pedidos-vivos")
def pedidos_vivos(
    limit: int = Query(50, ge=1, le=500),
    busqueda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    resultados = get_pedidos_vivos_excel(busqueda=busqueda, limit=limit)
    return {"data": resultados}


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


def _to_float(value):
    if value is None:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def _iso_date(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value) if value else None


def _read_seguimiento_documental(wb):
    """Lee la hoja 'Seguimiento_Documental' cuyos headers están en la fila 4.

    Las primeras filas contienen metadatos (título, vacías); los datos reales
    empiezan en la fila 5.
    """
    sheet_name = "Seguimiento_Documental"
    if sheet_name not in wb.sheetnames:
        return []
    ws = wb[sheet_name]
    rows_iter = ws.iter_rows(values_only=True)

    # Saltar filas hasta encontrar los headers en la fila 4 (índice 3)
    for _ in range(3):
        next(rows_iter, None)

    headers = [_normalize_text(cell) for cell in next(rows_iter, [])]
    if not headers:
        return []

    data = []
    for row in rows_iter:
        if not row or all(v is None for v in row):
            continue
        item = {}
        for h, v in zip(headers, row):
            if h:
                item[h] = v
        data.append(item)
    return data


@router.get("/historial")
def historial_ventas(
    limit: int = Query(500, ge=1, le=5000),
    busqueda: str = Query(""),
    cliente: str = Query(""),
    codigo: str = Query(""),
    moneda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    """Lee el historial de ventas desde el Excel de facturación.

    Filtra solo filas donde 'Tipo de Fila' contenga la palabra 'factura'.
    Permite buscar por cliente, código, descripción o moneda.
    """
    settings = get_settings()
    excel_path = Path(settings.ventas_facturacion_excel_path)

    if not excel_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"No se encontró el archivo de ventas: {excel_path}",
        )

    try:
        wb = load_workbook(filename=str(excel_path), read_only=True, data_only=True)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"No se pudo abrir el archivo de ventas. Puede estar abierto en Excel. Error: {exc}",
        )

    try:
        filas = _read_seguimiento_documental(wb)
    finally:
        wb.close()

    busqueda_lower = busqueda.lower().strip()
    cliente_lower = cliente.lower().strip()
    codigo_lower = codigo.lower().strip()
    moneda_upper = moneda.upper().strip()

    resultados = []
    for item in filas:
        tipo_fila = _normalize_text(item.get("Tipo de Fila")).lower()
        if "factura" not in tipo_fila:
            continue

        cliente_val = _normalize_text(item.get("Cliente Pedido"))
        codigo_val = _normalize_text(item.get("Codigo Producto"))
        descripcion_val = _normalize_text(item.get("Descripcion Producto"))
        moneda_val = _normalize_text(item.get("Moneda")).upper()

        # Filtro por búsqueda general
        if busqueda_lower and not any(
            busqueda_lower in campo
            for campo in (cliente_val.lower(), codigo_val.lower(), descripcion_val.lower())
        ):
            continue

        # Filtros específicos
        if cliente_lower and cliente_lower not in cliente_val.lower():
            continue
        if codigo_lower and codigo_lower not in codigo_val.lower():
            continue
        if moneda_upper and moneda_upper not in moneda_val:
            continue

        cantidad = _to_float(item.get("Cantidad"))
        precio_unitario = _to_float(item.get("Precio Unitario"))
        importe_partida = _to_float(item.get("Importe Partida"))
        tipo_cambio = _to_float(item.get("Tipo de Cambio"))

        resultados.append({
            "cliente": cliente_val,
            "codigo": codigo_val,
            "descripcion": descripcion_val,
            "cantidad": cantidad,
            "precio_unitario": precio_unitario,
            "importe_partida": importe_partida,
            "moneda": moneda_val or "MXN",
            "tipo_cambio": tipo_cambio,
            "almacen": _normalize_text(item.get("Nombre Almacen Linea")),
            "folio_factura": _normalize_text(item.get("Folio Factura")),
            "folio_pedido": _normalize_text(item.get("Folio Pedido")),
            "fecha_factura": _iso_date(item.get("Fecha Factura")),
            "fecha_pedido": _iso_date(item.get("Fecha Pedido")),
        })

    resultados.sort(key=lambda x: (x["cliente"] or "", x["fecha_factura"] or "", x["codigo"] or ""))
    return {"data": resultados[:limit]}


@router.get("/historial/metadata")
def historial_ventas_metadata(user: dict = Depends(get_current_user)):
    """Devuelve listas únicas de clientes y códigos del historial de ventas."""
    settings = get_settings()
    excel_path = Path(settings.ventas_facturacion_excel_path)

    if not excel_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"No se encontró el archivo de ventas: {excel_path}",
        )

    try:
        wb = load_workbook(filename=str(excel_path), read_only=True, data_only=True)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"No se pudo abrir el archivo de ventas. Puede estar abierto en Excel. Error: {exc}",
        )

    try:
        filas = _read_seguimiento_documental(wb)
    finally:
        wb.close()

    clientes = sorted(
        {_normalize_text(item.get("Cliente Pedido")) for item in filas if "factura" in _normalize_text(item.get("Tipo de Fila")).lower() and _normalize_text(item.get("Cliente Pedido"))}
    )
    codigos = sorted(
        {_normalize_text(item.get("Codigo Producto")) for item in filas if "factura" in _normalize_text(item.get("Tipo de Fila")).lower() and _normalize_text(item.get("Codigo Producto"))}
    )

    return {"clientes": clientes, "codigos": codigos}
