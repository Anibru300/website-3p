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
                device_type TEXT,
                browser TEXT,
                os TEXT,
                country TEXT,
                city TEXT,
                screen_width INTEGER,
                screen_height INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        _add_column_if_missing(conn, "analytics_events", "device_type", "TEXT")
        _add_column_if_missing(conn, "analytics_events", "browser", "TEXT")
        _add_column_if_missing(conn, "analytics_events", "os", "TEXT")
        _add_column_if_missing(conn, "analytics_events", "country", "TEXT")
        _add_column_if_missing(conn, "analytics_events", "city", "TEXT")
        _add_column_if_missing(conn, "analytics_events", "screen_width", "INTEGER")
        _add_column_if_missing(conn, "analytics_events", "screen_height", "INTEGER")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_section ON analytics_events(section)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_device ON analytics_events(device_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_browser ON analytics_events(browser)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_os ON analytics_events(os)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(country)")

        # Deduplicación de notificaciones de alertas avanzadas (cooldown por correo)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS alertas_enviadas (
                tipo TEXT NOT NULL,
                dedupe_key TEXT NOT NULL,
                enviado_at TEXT NOT NULL,
                PRIMARY KEY (tipo, dedupe_key)
            )
            """
        )

        # Vendedores/firmas del cotizador (antes en el Excel COTIZADOR 2.0.xlsm)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS vendedores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE NOT NULL,
                firma_path TEXT,
                activo INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Stock mínimo personalizado por producto (override al stock_min de SAE).
        # Un solo mínimo por código; el filtro por almacén solo aplica a la vista.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stock_config (
                codigo TEXT PRIMARY KEY,
                stock_min REAL NOT NULL,
                notas TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

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


# ---------------------------------------------------------------------------
# SQLite local del módulo Logística (demanda / abastecimiento / asignación /
# recepciones). Mismo patrón que users.db: ruta configurable, DDL idempotente.
# ---------------------------------------------------------------------------


def logistica_db_path() -> Path:
    settings = get_settings()
    if settings.logistica_db_path:
        return Path(settings.logistica_db_path)
    return Path(settings.users_db_path).resolve().parent / "logistica.db"


def _agregar_columna_si_falta(conn, tabla: str, columna: str, definicion: str):
    """ALTER TABLE aditivo idempotente (SQLite no soporta IF NOT EXISTS en ADD COLUMN)."""
    columnas = {fila[1] for fila in conn.execute(f"PRAGMA table_info({tabla})").fetchall()}
    if columna not in columnas:
        conn.execute(f"ALTER TABLE {tabla} ADD COLUMN {columna} {definicion}")


def _ensure_logistica_db():
    path = logistica_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS demanda (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                material TEXT NOT NULL,
                cantidad REAL NOT NULL,
                referencia TEXT NOT NULL DEFAULT '',
                cliente TEXT DEFAULT '',
                fecha_requerida TEXT,
                prioridad TEXT NOT NULL DEFAULT 'media',
                estatus TEXT NOT NULL DEFAULT 'pendiente',
                origen TEXT NOT NULL DEFAULT 'auto',
                justificacion TEXT DEFAULT '',
                observaciones TEXT DEFAULT '',
                activa INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tipo, material, referencia)
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_demanda_material ON demanda(material, activa)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_demanda_estatus ON demanda(estatus, activa)")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS abastecimiento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folio TEXT UNIQUE,
                material TEXT NOT NULL,
                cantidad REAL NOT NULL,
                proveedor TEXT DEFAULT '',
                oc TEXT DEFAULT '',
                fecha_solicitud TEXT,
                fecha_estimada TEXT,
                estatus TEXT NOT NULL DEFAULT 'solicitado',
                observaciones TEXT DEFAULT '',
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_abast_material ON abastecimiento(material)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_abast_oc ON abastecimiento(oc)")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS asignacion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                abastecimiento_id INTEGER NOT NULL,
                demanda_id INTEGER NOT NULL,
                cantidad REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (abastecimiento_id) REFERENCES abastecimiento(id) ON DELETE CASCADE,
                FOREIGN KEY (demanda_id) REFERENCES demanda(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_asign_abast ON asignacion(abastecimiento_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_asign_demanda ON asignacion(demanda_id)")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS recepcion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                abastecimiento_id INTEGER NOT NULL,
                cantidad REAL NOT NULL,
                fecha_recepcion TEXT NOT NULL,
                documento TEXT DEFAULT '',
                ubicacion TEXT DEFAULT '',
                usuario TEXT DEFAULT '',
                observaciones TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (abastecimiento_id) REFERENCES abastecimiento(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_recep_abast ON recepcion(abastecimiento_id)")

        # Vinculación con entradas por compra del espejo SAE (cuadre logística vs almacén)
        for columna, definicion in (
            ("mov_sae_id", "INTEGER"),
            ("cuadrada", "INTEGER NOT NULL DEFAULT 0"),
        ):
            try:
                conn.execute(f"ALTER TABLE recepcion ADD COLUMN {columna} {definicion}")
            except sqlite3.OperationalError as exc:
                if "duplicate column name" not in str(exc).lower():
                    raise

        # Claves SAE de cliente/proveedor (enriquecimiento aditivo; texto libre)
        _agregar_columna_si_falta(conn, "demanda", "cliente_clave", "TEXT NOT NULL DEFAULT ''")
        _agregar_columna_si_falta(conn, "abastecimiento", "proveedor_clave", "TEXT NOT NULL DEFAULT ''")

        conn.commit()
    finally:
        conn.close()


@contextmanager
def logistica_connection():
    _ensure_logistica_db()
    conn = sqlite3.connect(str(logistica_db_path()))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# SQLite local del módulo Fichas técnicas (PDF de fichas/especificaciones por
# producto). Mismo patrón que logistica.db: ruta configurable, DDL idempotente.
# ---------------------------------------------------------------------------


def fichas_db_path() -> Path:
    settings = get_settings()
    if settings.fichas_db_path:
        return Path(settings.fichas_db_path)
    return Path(settings.users_db_path).resolve().parent / "fichas.db"


# Catálogo de tipos de documento (seed; orden fijo usado también en ordenamiento).
TIPOS_DOCUMENTO_SEED = (
    ("ficha_tecnica", "Ficha técnica", 1),
    ("especificacion_tecnica", "Especificación técnica", 2),
    ("manual", "Manual", 3),
    ("catalogo", "Catálogo", 4),
    ("certificado", "Certificado", 5),
    ("hoja_seguridad", "Hoja de seguridad", 6),
    ("instructivo", "Instructivo", 7),
    ("otro", "Otro", 8),
)


def _ensure_fichas_db():
    path = fichas_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tipos_documento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT NOT NULL UNIQUE,
                nombre TEXT NOT NULL,
                orden INTEGER NOT NULL DEFAULT 0,
                activo INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documentos_producto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                marca TEXT NOT NULL,
                codigo TEXT NOT NULL,
                descripcion TEXT DEFAULT '',
                tipo_documento_id INTEGER NOT NULL REFERENCES tipos_documento(id),
                nombre_documento TEXT DEFAULT '',
                descripcion_documento TEXT DEFAULT '',
                numero_documento TEXT DEFAULT '',
                version TEXT DEFAULT '1.0',
                nombre_archivo TEXT NOT NULL,
                archivo TEXT NOT NULL,
                tamano INTEGER NOT NULL DEFAULT 0,
                mime_type TEXT DEFAULT 'application/pdf',
                fecha_documento TEXT DEFAULT '',
                publico INTEGER NOT NULL DEFAULT 1,
                vigente INTEGER NOT NULL DEFAULT 1,
                activo INTEGER NOT NULL DEFAULT 1,
                fecha_carga TEXT NOT NULL,
                usuario_carga TEXT DEFAULT '',
                fecha_modificacion TEXT,
                usuario_modificacion TEXT DEFAULT ''
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_doc_prod_marca_codigo ON documentos_producto(marca, codigo)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_doc_prod_tipo ON documentos_producto(tipo_documento_id)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_doc_prod_visibilidad ON documentos_producto(publico, vigente, activo)"
        )

        # Seed de tipos solo si la tabla está vacía (no toca altas/bajas manuales).
        n_tipos = conn.execute("SELECT COUNT(*) FROM tipos_documento").fetchone()[0]
        if n_tipos == 0:
            conn.executemany(
                "INSERT INTO tipos_documento (codigo, nombre, orden) VALUES (?, ?, ?)",
                TIPOS_DOCUMENTO_SEED,
            )

        # Migración del schema legacy (tabla `fichas`, una ficha por producto):
        # pasa las filas a documentos_producto como ficha_tecnica pública/vigente
        # y elimina la tabla vieja. Idempotente: al terminar ya no existe `fichas`.
        legacy = conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'fichas'"
        ).fetchone()
        if legacy is not None:
            tipo_id = conn.execute(
                "SELECT id FROM tipos_documento WHERE codigo = 'ficha_tecnica'"
            ).fetchone()[0]
            for fila in conn.execute(
                """
                SELECT marca, codigo, descripcion, nombre_archivo, archivo, tamano, fecha, usuario
                FROM fichas
                """
            ):
                marca, codigo, descripcion, nombre_archivo, archivo, tamano, fecha, usuario = fila
                conn.execute(
                    """
                    INSERT INTO documentos_producto (
                        marca, codigo, descripcion, tipo_documento_id, nombre_documento,
                        nombre_archivo, archivo, tamano, publico, vigente, activo,
                        fecha_carga, usuario_carga
                    ) VALUES (?, ?, ?, ?, '', ?, ?, ?, 1, 1, 1, ?, ?)
                    """,
                    (
                        marca,
                        codigo,
                        descripcion,
                        tipo_id,
                        nombre_archivo,
                        archivo,
                        tamano,
                        fecha,
                        usuario,
                    ),
                )
            conn.execute("DROP TABLE fichas")

        conn.commit()
    finally:
        conn.close()


@contextmanager
def fichas_connection():
    _ensure_fichas_db()
    conn = sqlite3.connect(str(fichas_db_path()))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
