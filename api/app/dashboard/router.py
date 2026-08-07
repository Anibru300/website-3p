from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/resumen")
def dashboard_resumen(user: dict = Depends(get_current_user)):
    resumen = {
        "pedidos_vivos": 0,
        "vales_abiertos": 0,
        "productos_bajo_minimo": 0,
        "movimientos_90d": 0,
        "facturas_pendientes_cobranza": 0,
    }

    queries = {
        "pedidos_vivos": "SELECT COUNT(*) FROM v_pedidos_vivos WHERE saldo_pendiente > 0.01",
        "vales_abiertos": """
            SELECT COUNT(*) FROM vales v
            JOIN vale_lineas vl ON v.id = vl.vale_id
            WHERE v.estado = 'abierto' AND vl.cantidad_viva > 0
        """,
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

    with postgres_cursor() as cur:
        for key, sql in queries.items():
            try:
                cur.execute(sql)
                row = cur.fetchone()
                resumen[key] = row["count"] if row else 0
            except Exception:
                # Si la vista o tabla no existe, dejar en 0
                pass

    return {"resumen": resumen}
