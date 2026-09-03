from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "CJ_OS Core API"
    debug: bool = False
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Security
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 horas
    service_token: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173,https://3psadecv.com"

    # PostgreSQL
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "cj_assistant"
    postgres_user: str = "cj_user"
    postgres_password: str = ""

    # Users DB (SQLite local, no va al repo)
    users_db_path: str = "./data/users.db"

    # San Antonio Excel (solo lectura)
    san_antonio_excel_path: str = "C:/Users/Ventas-3P/Desktop/SAN ANTONIO/SAN_ANTONIO_SEGUIMIENTO.xlsx"

    # Vales Excel (solo lectura)
    vales_excel_path: str = "Y:/ALMACEN/Mejora Continua ALMACEN/Nuevo Control de Almacen/BASE DE DATOS/BD_ALMACEN_3P.xlsx"

    # Pedidos pendientes por facturar Excel (solo lectura)
    pedidos_pendientes_facturar_excel_path: str = "Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/BD pedidos pendientes por facturar.xlsx"

    # Historial de ventas / facturación Excel (solo lectura)
    ventas_facturacion_excel_path: str = "Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/VENTAS_FACTURACION_BASE.xlsx"

    # Logo para reportes de analytics (ruta relativa a api/ o absoluta)
    analytics_logo_path: str = "../public/images/logo-3p-header.png"

    # Notificaciones por correo (vacío = deshabilitado, solo panel/logs)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_tls: bool = True
    alertas_email_to: str = ""

    # Países considerados esperados en analytics (separados por coma).
    # Vacío = no se evalúa la alerta de país no esperado.
    alertas_paises_permitidos: str = ""

    # Sync Excel -> SQLite (Fase 2). Cuando está activo, los getters de vales,
    # pedidos y fotos leen las tablas sync_* (pobladas por el job programado
    # app.sync.job) en lugar de abrir el Excel en cada petición.
    # false = lectura en vivo del Excel (comportamiento anterior).
    use_sync_tables: bool = False

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
