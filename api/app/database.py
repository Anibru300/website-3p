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

def _add_column_if_missing(conn, table: str, column: str, definition: str):
    """Agrega una columna si aún no existe. Ignora el error si ya existe."""
    try:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
    except sqlite3.OperationalError as exc:
        if "duplicate column name" not in str(exc).lower():
            raise


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
                id_externo TEXT,
                tipo TEXT NOT NULL,
                nombre TEXT NOT NULL,
                razon_social TEXT,
                rfc TEXT,
                tipo_persona TEXT,
                regimen_fiscal TEXT,
                uso_cfdi TEXT,
                correo_cfdi TEXT,
                telefono TEXT,
                email TEXT,
                condicion_pago TEXT,
                dias_credito TEXT,
                vendedor TEXT,
                link_documentos TEXT,
                industria TEXT,
                interes_principal TEXT,
                puntuacion INTEGER,
                status TEXT DEFAULT 'Activo',
                notas TEXT,
                activo INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        # Migraciones: columnas agregadas al esquema original
        _add_column_if_missing(conn, "users", "totp_secret", "TEXT")
        _add_column_if_missing(conn, "users", "totp_enabled", "INTEGER NOT NULL DEFAULT 0")
        _add_column_if_missing(conn, "users", "bloqueado_hasta", "TIMESTAMP")
        _add_column_if_missing(conn, "users", "intentos_fallidos", "INTEGER NOT NULL DEFAULT 0")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                email TEXT,
                exito INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at)")

        _add_column_if_missing(conn, "crm_entidades", "id_externo", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "razon_social", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "tipo_persona", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "regimen_fiscal", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "uso_cfdi", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "correo_cfdi", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "telefono", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "condicion_pago", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "dias_credito", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "vendedor", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "link_documentos", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "industria", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "interes_principal", "TEXT")
        _add_column_if_missing(conn, "crm_entidades", "puntuacion", "INTEGER")
        _add_column_if_missing(conn, "crm_entidades", "status", "TEXT DEFAULT 'Activo'")
        _add_column_if_missing(conn, "crm_entidades", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_contactos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                nombre TEXT NOT NULL,
                puesto TEXT,
                departamento TEXT,
                telefono TEXT,
                whatsapp TEXT,
                email TEXT,
                correos_facturas TEXT,
                direccion_entrega TEXT,
                principal INTEGER NOT NULL DEFAULT 0,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )
        _add_column_if_missing(conn, "crm_contactos", "departamento", "TEXT")
        _add_column_if_missing(conn, "crm_contactos", "whatsapp", "TEXT")
        _add_column_if_missing(conn, "crm_contactos", "correos_facturas", "TEXT")
        _add_column_if_missing(conn, "crm_contactos", "direccion_entrega", "TEXT")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_granjas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                granja_id_externo TEXT,
                nombre TEXT NOT NULL,
                tipo TEXT,
                paso TEXT,
                contacto_nombre TEXT,
                contacto_puesto TEXT,
                contacto_telefono TEXT,
                contacto_correo TEXT,
                activo INTEGER NOT NULL DEFAULT 1,
                comentarios TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_ubicaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                granja_id INTEGER,
                nombre TEXT,
                tipo TEXT,
                calle TEXT,
                numero TEXT,
                colonia TEXT,
                cp TEXT,
                ciudad TEXT,
                estado TEXT,
                pais TEXT,
                direccion TEXT,
                coordenadas TEXT,
                link_mapa TEXT,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE,
                FOREIGN KEY (granja_id) REFERENCES crm_granjas(id) ON DELETE SET NULL
            )
            """
        )
        _add_column_if_missing(conn, "crm_ubicaciones", "granja_id", "INTEGER")
        _add_column_if_missing(conn, "crm_ubicaciones", "calle", "TEXT")
        _add_column_if_missing(conn, "crm_ubicaciones", "numero", "TEXT")
        _add_column_if_missing(conn, "crm_ubicaciones", "colonia", "TEXT")
        _add_column_if_missing(conn, "crm_ubicaciones", "cp", "TEXT")
        _add_column_if_missing(conn, "crm_ubicaciones", "link_mapa", "TEXT")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_paqueterias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                ubicacion_id INTEGER,
                paqueteria_id_externo TEXT,
                tipo_envio TEXT,
                paqueteria TEXT,
                ocurre_domicilio TEXT,
                atencion_a TEXT,
                telefono TEXT,
                correo_guia TEXT,
                tipo_pago TEXT,
                facturado_a TEXT,
                status TEXT DEFAULT 'Activo',
                comentarios TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE,
                FOREIGN KEY (ubicacion_id) REFERENCES crm_ubicaciones(id) ON DELETE SET NULL
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
                persona_apoyo TEXT,
                notas TEXT,
                FOREIGN KEY (entidad_id) REFERENCES crm_entidades(id) ON DELETE CASCADE
            )
            """
        )
        _add_column_if_missing(conn, "crm_portales", "persona_apoyo", "TEXT")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS crm_descuentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entidad_id INTEGER NOT NULL,
                marca TEXT,
                descuento TEXT,
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

        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_entidades_id_externo ON crm_entidades(id_externo)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_entidades_tipo ON crm_entidades(tipo)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_entidades_status ON crm_entidades(status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_entidades_industria ON crm_entidades(industria)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_entidades_nombre ON crm_entidades(nombre)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_contactos_entidad ON crm_contactos(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_contactos_principal ON crm_contactos(entidad_id, principal)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_granjas_entidad ON crm_granjas(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_ubicaciones_entidad ON crm_ubicaciones(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_ubicaciones_granja ON crm_ubicaciones(granja_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_paqueterias_entidad ON crm_paqueterias(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_portales_entidad ON crm_portales(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_descuentos_entidad ON crm_descuentos(entidad_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_crm_documentos_entidad ON crm_documentos(entidad_id)")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                user_email TEXT,
                user_id INTEGER,
                event_type TEXT NOT NULL,
                path TEXT,
                section TEXT,
                metadata TEXT,
                ip TEXT,
                user_agent TEXT,
                referrer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_section ON analytics_events(section)")

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
