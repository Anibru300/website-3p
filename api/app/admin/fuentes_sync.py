"""Endpoints admin para el estado y control del sync Excel -> SQLite (Fase 2).

Lista TODAS las fuentes Excel que usa el sistema (E1-E5) con nombre de
archivo, ubicación, estado de salud y —para las que tienen sync— la última
sincronización y el botón de forzar.
"""

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.database import users_connection
from app.services.fuentes import FUENTES_EXCEL, _revisar_excel
from app.sync import db as sync_db
from app.sync.job import FUENTES_HABILITADAS, sincronizar_fuente

router = APIRouter(prefix="/fuente-sync", tags=["admin", "sync"])


@router.get("")
def estado_fuentes_sync():
    """Estado completo de todas las fuentes Excel + sync de las habilitadas."""
    with users_connection() as conn:
        sync_db.init_sync_db(conn)
        fuentes = []
        for fuente_id, spec in FUENTES_EXCEL.items():
            salud = _revisar_excel(fuente_id, spec)
            info = {
                "id": fuente_id,
                "archivo": salud["ruta"].replace("\\", "/").split("/")[-1],
                "ruta": salud["ruta"],
                "existe": salud["existe"],
                "estado": salud["estado"],
                "detalle": salud["detalle"],
                "mtime": salud["mtime"],
                "edad_horas": salud["edad_horas"],
                "filas_excel": salud["filas"],
                "modo": "sync" if fuente_id in FUENTES_HABILITADAS else "lectura_en_vivo",
            }
            if fuente_id in FUENTES_HABILITADAS:
                ultimo = sync_db.ultimo_sync(conn, fuente_id)
                info["ultimo_sync"] = dict(ultimo) if ultimo else None
                sheets = conn.execute(
                    "SELECT hoja, filas, updated_at FROM sync_sheets WHERE fuente = ? ORDER BY hoja",
                    (fuente_id,),
                ).fetchall()
                info["hojas"] = [dict(f) for f in sheets]
            fuentes.append(info)
    return {
        "use_sync_tables": get_settings().use_sync_tables,
        "fuentes": fuentes,
    }


@router.post("/{fuente}")
def forzar_sync(fuente: str):
    """Ejecuta la sincronización de una fuente ahora (lee Excel solo lectura)."""
    if fuente not in FUENTES_HABILITADAS:
        raise HTTPException(status_code=404, detail=f"Fuente no habilitada para sync: {fuente}")
    return sincronizar_fuente(fuente)
