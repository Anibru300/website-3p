from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.almacen.router import router as almacen_router
from app.auth.router import router as auth_router
from app.config import get_settings
from app.dashboard.router import router as dashboard_router
from app.inventario.router import router as inventario_router
from app.san_antonio.router import router as san_antonio_router
from app.ventas.router import router as ventas_router


def create_app() -> FastAPI:
    settings = get_settings()
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
    app.include_router(dashboard_router)
    app.include_router(almacen_router)
    app.include_router(ventas_router)
    app.include_router(inventario_router)
    app.include_router(san_antonio_router)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
