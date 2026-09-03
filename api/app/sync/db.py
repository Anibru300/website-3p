"""Acceso a las tablas sync_* (snapshots de hojas Excel en SQLite)."""

import json
import re
import sqlite3
from datetime import date, datetime, timezone
from typing import Any, Optional

# Valores que serializamos como ISO desde datetime/date; al cargar se
# reconvierten a datetime para que las filas de sync se comporten igual
# que las leídas en vivo desde Excel (p. ej. cálculo de días pendiente).
_RE_ISO_DT = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS sync_sheets (
    fuente TEXT NOT NULL,
    hoja TEXT NOT NULL,
    mtime TEXT,
    filas INTEGER NOT NULL DEFAULT 0,
    rows_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (fuente, hoja)
)
"""

LOG_SQL = """
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fuente TEXT NOT NULL,
    inicio TEXT NOT NULL,
    fin TEXT,
    estado TEXT NOT NULL,
    filas INTEGER NOT NULL DEFAULT 0,
    mtime TEXT,
    error TEXT,
    creado_at TEXT NOT NULL
)
"""


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serializar_valor(valor: Any) -> Any:
    if isinstance(valor, (datetime, date)):
        return valor.isoformat()
    return valor


def _deserializar_valor(valor: Any) -> Any:
    if isinstance(valor, str) and _RE_ISO_DT.match(valor):
        try:
            return datetime.fromisoformat(valor)
        except ValueError:
            return valor
    return valor


def init_sync_db(conn: sqlite3.Connection):
    """Crea las tablas sync_* si no existen (idempotente)."""
    conn.execute(SCHEMA_SQL)
    conn.execute(LOG_SQL)


def guardar_sheets(
    conn: sqlite3.Connection,
    fuente: str,
    sheets: dict[str, list[dict]],
    mtime: Optional[str],
):
    """Reemplaza las hojas de una fuente con las filas dadas (JSON por hoja)."""
    ahora = _ahora()
    total = 0
    for hoja, rows in sheets.items():
        serializadas = [
            {k: _serializar_valor(v) for k, v in row.items()} for row in rows
        ]
        payload = json.dumps(serializadas, ensure_ascii=False)
        conn.execute(
            """
            INSERT INTO sync_sheets (fuente, hoja, mtime, filas, rows_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(fuente, hoja) DO UPDATE SET
                mtime = excluded.mtime,
                filas = excluded.filas,
                rows_json = excluded.rows_json,
                updated_at = excluded.updated_at
            """,
            (fuente, hoja, mtime, len(rows), payload, ahora),
        )
        total += len(rows)
    return total


def cargar_sheets(conn: sqlite3.Connection, fuente: str) -> Optional[dict[str, list[dict]]]:
    """Devuelve {hoja: [rows]} de la última sync, o None si la fuente no tiene nada."""
    filas = conn.execute(
        "SELECT hoja, rows_json FROM sync_sheets WHERE fuente = ?",
        (fuente,),
    ).fetchall()
    if not filas:
        return None
    resultado = {}
    for fila in filas:
        hoja = fila["hoja"]
        resultado[hoja] = [
            {k: _deserializar_valor(v) for k, v in row.items()}
            for row in json.loads(fila["rows_json"])
        ]
    return resultado


def registrar_sync(
    conn: sqlite3.Connection,
    fuente: str,
    inicio: str,
    estado: str,
    filas: int = 0,
    mtime: Optional[str] = None,
    error: Optional[str] = None,
):
    conn.execute(
        """
        INSERT INTO sync_log (fuente, inicio, fin, estado, filas, mtime, error, creado_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (fuente, inicio, _ahora(), estado, filas, mtime, error, _ahora()),
    )


def ultimo_sync(conn: sqlite3.Connection, fuente: str) -> Optional[dict]:
    fila = conn.execute(
        """
        SELECT fuente, inicio, fin, estado, filas, mtime, error
        FROM sync_log
        WHERE fuente = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (fuente,),
    ).fetchone()
    return dict(fila) if fila else None


def ultimo_sync_ok(conn: sqlite3.Connection, fuente: str) -> Optional[dict]:
    fila = conn.execute(
        """
        SELECT fuente, inicio, fin, estado, filas, mtime, error
        FROM sync_log
        WHERE fuente = ? AND estado = 'ok'
        ORDER BY id DESC
        LIMIT 1
        """,
        (fuente,),
    ).fetchone()
    return dict(fila) if fila else None


def sync_fresco(conn: sqlite3.Connection, fuente: str, max_age_horas: float) -> bool:
    """True si hay un sync 'ok' de la fuente con antigüedad menor al umbral."""
    ultimo = ultimo_sync_ok(conn, fuente)
    if not ultimo or not ultimo.get("fin"):
        return False
    try:
        fin = datetime.fromisoformat(ultimo["fin"])
        if fin.tzinfo is None:
            fin = fin.replace(tzinfo=timezone.utc)
    except ValueError:
        return False
    edad = (datetime.now(timezone.utc) - fin).total_seconds() / 3600
    return edad <= max_age_horas
