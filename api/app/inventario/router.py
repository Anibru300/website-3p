from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.database import postgres_cursor

router = APIRouter(prefix="/api/inventario", tags=["inventario"])


@router.get("/movimientos")
def movimientos(
    limit: int = Query(50, ge=1, le=500),
    fecha: date | None = Query(None, description="YYYY-MM-DD"),
    user: dict = Depends(get_current_user),
):
    target_date = fecha or date.today()
    sql = """
        SELECT
            m.fecha_doc,
            m.cve_art AS codigo,
            m.almacen,
            m.tipo_doc,
            c.descripcion AS concepto,
            m.cantidad,
            m.existencia,
            m.referencia
        FROM sae_movimientos_inventario m
        LEFT JOIN sae_conceptos_movimiento c ON m.cve_cpto = c.cve_cpto
        WHERE m.fecha_doc = %(fecha)s
        ORDER BY m.cve_art, m.almacen
        LIMIT %(limit)s
    """
    with postgres_cursor() as cur:
        cur.execute(sql, {"fecha": target_date, "limit": limit})
        rows = cur.fetchall()

    return {"data": [dict(row) for row in rows]}
