import logging
import threading
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.admin.router import router as admin_router
from app.almacen.router import router as almacen_router
from app.auth.router import router as auth_router
from app.config import get_settings
from app.dashboard.router import router as dashboard_router
from app.inventario.router import router as inventario_router
from app.cotizaciones.router import router as cotizaciones_router
from app.san_antonio.router import router as san_antonio_router
from app.services.excel import precargar_historial_cache
from app.ventas.router import router as ventas_router

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()
    if not settings.jwt_secret:
        raise RuntimeError(
            "JWT_SECRET no está configurado. "
            "Configura la variable de entorno JWT_SECRET en api/.env antes de arrancar el servidor."
        )

    # Validar rutas de Excel configuradas (solo advertencia; no fallar para no romper endpoints que no las usan)
    excel_paths = {
        "SAN_ANTONIO_EXCEL_PATH": settings.san_antonio_excel_path,
        "VALES_EXCEL_PATH": settings.vales_excel_path,
        "PEDIDOS_PENDIENTES_FACTURAR_EXCEL_PATH": settings.pedidos_pendientes_facturar_excel_path,
        "VENTAS_FACTURACION_EXCEL_PATH": settings.ventas_facturacion_excel_path,
        "COTIZADOR_VENDEDORES_EXCEL_PATH": settings.cotizador_vendedores_excel_path,
    }
    for name, path in excel_paths.items():
        if not Path(path).exists():
            logger.warning("[%s] No se encontró el archivo configurado: %s", name, path)

    app = FastAPI(
        title=settings.app_name,
        description="API operativa de CJ_OS Core para el portal web de 3P.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(dashboard_router)
    app.include_router(almacen_router)
    app.include_router(ventas_router)
    app.include_router(cotizaciones_router)
    app.include_router(inventario_router)
    app.include_router(san_antonio_router)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    @app.on_event("startup")
    def startup_precargar_cache():
        # Precargar el historial de ventas en segundo plano para que la
        # primera petición no tenga que leer el Excel completo.
        thread = threading.Thread(target=precargar_historial_cache, daemon=True)
        thread.start()

    return app


app = create_app()
