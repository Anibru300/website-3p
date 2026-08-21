from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor
from app.services.excel import get_pedidos_vivos_excel, get_vales_abiertos_count

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/resumen")
def dashboard_resumen(user: dict = Depends(get_current_user)):
    resumen = {
        "pedidos_vivos": 0,
        "vales_abiertos": 0,
        "productos_bajo_minimo": 0,
        "movimientos_90d": 0,
        "facturas_pendientes_cobranza": 0,
        "monto_pendiente_mxn": 0,
        "monto_pendiente_usd": 0,
    }

    # Pedidos vivos desde el Excel de pendientes por facturar
    try:
        pedidos = get_pedidos_vivos_excel()
        resumen["pedidos_vivos"] = len(pedidos)
        for p in pedidos:
            moneda = (p.get("moneda") or "MXN").upper().strip()
            saldo = float(p.get("saldo_pendiente") or 0)
            if moneda == "USD":
                resumen["monto_pendiente_usd"] += saldo
            else:
                resumen["monto_pendiente_mxn"] += saldo
    except Exception:
        resumen["pedidos_vivos"] = 0

    # Vales abiertos desde el Excel de almacén (misma fuente que la sección de vales)
    try:
        resumen["vales_abiertos"] = get_vales_abiertos_count()
    except Exception:
        resumen["vales_abiertos"] = 0

    queries = {
        "productos_bajo_minimo": """
            SELECT COUNT(*) FROM sae_existencias
            WHERE exist <= stock_min
        """,
        "movimientos_90d": """
            SELECT COUNT(*) FROM sae_movimientos_inventario
            WHERE fecha_doc >= CURRENT_DATE - INTERVAL '90 days'
        """,
        "facturas_pendientes_cobranza": """
            SELECT COUNT(*) FROM v_facturas_cobranza
            WHERE estado_cobranza IN ('Pendiente', 'Vencida')
        """,
    }

    try:
        with postgres_cursor() as cur:
            for key, sql in queries.items():
                try:
                    cur.execute(sql)
                    row = cur.fetchone()
                    resumen[key] = row["count"] if row else 0
                except Exception:
                    # Si la vista o tabla no existe, dejar en 0
                    pass
    except Exception:
        # Si no hay conexión a PostgreSQL, devolver estructura vacía
        pass

    return {"resumen": resumen}
