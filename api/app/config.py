import secrets
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
    jwt_secret: str = secrets.token_urlsafe(64)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 horas

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
