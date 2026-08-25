import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor
from app.services.excel import (
    _get_cached_historial,
    get_pedido_detalle_excel,
    get_pedidos_vivos_excel,
    precargar_historial_cache,
)

router = APIRouter(prefix="/api/ventas", tags=["ventas"])
logger = logging.getLogger(__name__)


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
    try:
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
    except Exception as e:
        logger.warning("v_seguimiento_documental fallo, usando fallback Excel: %s", e)
        try:
            detalle = get_pedido_detalle_excel(folio_pedido)
            return {"data": detalle}
        except Exception as e2:
            logger.error("Fallback Excel tambien fallo: %s", e2)
            return {"data": []}


@router.get("/historial")
def historial_ventas(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    busqueda: str = Query(""),
    cliente: List[str] = Query(default_factory=list),
    codigo: List[str] = Query(default_factory=list),
    moneda: str = Query(""),
    user: dict = Depends(get_current_user),
):
    """Lee el historial de ventas desde la caché en memoria.

    Filtra solo filas donde 'Tipo de Fila' contenga la palabra 'factura'.
    Permite buscar por cliente, código, descripción o moneda.
    Soporta paginación con limit/offset.
    """
    cache = _get_cached_historial()
    if not cache["filas"]:
        from app.config import get_settings
        from pathlib import Path

        settings = get_settings()
        excel_path = Path(settings.ventas_facturacion_excel_path)
        if not excel_path.exists():
            raise HTTPException(
                status_code=503,
                detail=f"No se encontró el archivo de ventas: {excel_path}",
            )
        raise HTTPException(
            status_code=503,
            detail="No se pudo cargar el historial de ventas. Puede estar abierto en Excel.",
        )

    busqueda_lower = busqueda.lower().strip()
    clientes_lower = [c.lower().strip() for c in cliente if c and c.strip()]
    codigos_lower = [c.lower().strip() for c in codigo if c and c.strip()]
    moneda_upper = moneda.upper().strip()

    resultados = []
    for fila in cache["filas"]:
        # Filtro por búsqueda general
        if busqueda_lower and not any(
            busqueda_lower in campo
            for campo in (fila["cliente"].lower(), fila["codigo"].lower(), fila["descripcion"].lower())
        ):
            continue

        # Filtros específicos
        if clientes_lower and not any(c in fila["cliente"].lower() for c in clientes_lower):
            continue
        if codigos_lower and not any(c in fila["codigo"].lower() for c in codigos_lower):
            continue
        if moneda_upper and moneda_upper not in fila["moneda"]:
            continue

        resultados.append(fila)

    total = len(resultados)
    totales = {"MXN": 0.0, "USD": 0.0}
    for r in resultados:
        moneda = r["moneda"] if r["moneda"] == "USD" else "MXN"
        totales[moneda] += r["importe_partida"]

    return {
        "data": resultados[offset : offset + limit],
        "total": total,
        "totales": totales,
        "limit": limit,
        "offset": offset,
    }


@router.get("/historial/metadata")
def historial_ventas_metadata(user: dict = Depends(get_current_user)):
    """Devuelve listas únicas de clientes y códigos del historial de ventas."""
    cache = _get_cached_historial()
    if not cache["filas"]:
        from app.config import get_settings
        from pathlib import Path

        settings = get_settings()
        excel_path = Path(settings.ventas_facturacion_excel_path)
        if not excel_path.exists():
            raise HTTPException(
                status_code=503,
                detail=f"No se encontró el archivo de ventas: {excel_path}",
            )
        raise HTTPException(
            status_code=503,
            detail="No se pudo cargar el historial de ventas. Puede estar abierto en Excel.",
        )

    return {"clientes": cache["clientes"], "codigos": cache["codigos"]}
