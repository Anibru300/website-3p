import sqlite3
from contextlib import contextmanager
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

from app.config import get_settings

_pool = None


def _get_pool() -> ThreadedConnectionPool:
    global _pool
    if _pool is None:
        settings = get_settings()
        _pool = ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=settings.postgres_host,
            port=settings.postgres_port,
            dbname=settings.postgres_db,
            user=settings.postgres_user,
            password=settings.postgres_password,
        )
    return _pool


@contextmanager
def postgres_cursor(cursor_factory=RealDictCursor):
    pool = _get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor(cursor_factory=cursor_factory)
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        pool.putconn(conn)


# ---------------------------------------------------------------------------
# SQLite local para usuarios del portal (no va al repositorio)
# ---------------------------------------------------------------------------

def _ensure_users_db():
    settings = get_settings()
    path = Path(settings.users_db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                nombre TEXT NOT NULL,
                rol TEXT NOT NULL DEFAULT 'user',
                activo INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # ---------------------------------------------------------------------------
        # CRM (tablas en SQLite de usuarios del portal)
        # ---------------------------------------------------------------------------
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_entidades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                nombre TEXT NOT NULL,
                rfc TEXT,
                razon_social TEXT,
                telefono TEXT,
                email TEXT,
                notas TEXT,
                activo INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_contactos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                nombre TEXT NOT NULL,
                puesto TEXT,
                telefono TEXT,
                email TEXT,
                principal INTEGER NOT NULL DEFAULT 0,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_ubicaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                nombre TEXT,
                tipo TEXT,
                direccion TEXT,
                ciudad TEXT,
                estado TEXT,
                pais TEXT,
                coordenadas TEXT,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_portales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                nombre TEXT,
                url TEXT,
                usuario TEXT,
                password TEXT,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_documentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                tipo TEXT,
                nombre_archivo TEXT,
                ruta_archivo TEXT,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )

        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_contactos_entidad ON crm_contactos(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_ubicaciones_entidad ON crm_ubicaciones(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_portales_entidad ON crm_portales(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_documentos_entidad ON crm_documentos(entidad_id)")

        conn.commit()
    finally:
        conn.close()


@contextmanager
def users_connection():
    _ensure_users_db()
    settings = get_settings()
    conn = sqlite3.connect(str(settings.users_db_path))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
