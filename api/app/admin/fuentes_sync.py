"""Endpoints admin para el estado y control del sync Excel -> SQLite (Fase 2)."""

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.database import users_connection
from app.sync import db as sync_db
from app.sync.job import FUENTES_HABILITADAS, sincronizar_fuente

router = APIRouter(prefix="/fuente-sync", tags=["admin", "sync"])


@router.get("")
def estado_fuentes_sync():
    """Último sync por fuente habilitada + estado del feature flag."""
    with users_connection() as conn:
        sync_db.init_sync_db(conn)
        fuentes = {}
        for fuente in FUENTES_HABILITADAS:
            ultimo = sync_db.ultimo_sync(conn, fuente)
            if ultimo:
                ultimo = dict(ultimo)
            sheets = conn.execute(
                "SELECT hoja, filas, updated_at FROM sync_sheets WHERE fuente = ? ORDER BY hoja",
                (fuente,),
            ).fetchall()
            fuentes[fuente] = {
                "ultimo_sync": ultimo,
                "hojas": [dict(f) for f in sheets],
            }
    return {
        "use_sync_tables": get_settings().use_sync_tables,
        "fuentes_habilitadas": list(FUENTES_HABILITADAS),
        "fuentes": fuentes,
    }


@router.post("/{fuente}")
def forzar_sync(fuente: str):
    """Ejecuta la sincronización de una fuente ahora (lee Excel solo lectura)."""
    if fuente not in FUENTES_HABILITADAS:
        raise HTTPException(status_code=404, detail=f"Fuente no habilitada: {fuente}")
    return sincronizar_fuente(fuente)
