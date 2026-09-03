"""Pruebas de alertas de stock bajo (mínimos de SAE) y su endpoint."""

import os
import sys
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.inventario.router as inventario_router  # noqa: E402
from app.analytics.alertas import evaluar_alertas  # noqa: E402


class _CursorFalso:
    def __init__(self, rows):
        self._rows = rows
        self.sql = None
        self.params = None

    def execute(self, sql, params=None):
        self.sql = sql
        self.params = params

    def fetchall(self):
        return list(self._rows)


class _CtxFalso:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self._cursor

    def __exit__(self, *args):
        return False


def _mock_postgres(monkeypatch, rows):
    monkeypatch.setattr(
        inventario_router, "postgres_cursor", lambda: _CtxFalso(_CursorFalso(rows))
    )


def _cliente():
    from fastapi.testclient import TestClient

    from app.auth.dependencies import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: {
        "email": "user@test",
        "nombre": "Usuario Test",
        "rol": "user",
    }
    return TestClient(app), app


class TestEndpointAlertasStock:
    def test_requiere_autenticacion(self):
        from fastapi.testclient import TestClient

        from app.main import app

        with TestClient(app) as c:
            r = c.get("/api/inventario/alertas-stock")
        assert r.status_code in (401, 403, 422)

    def test_con_usuario_devuelve_productos(self, monkeypatch):
        filas = [
            {"codigo": "ART-1", "descripcion": "Bebedero", "existencia": 2, "stock_min": 10},
            {"codigo": "ART-2", "descripcion": "Comedero", "existencia": 0, "stock_min": 5},
        ]
        _mock_postgres(monkeypatch, filas)
        client, app = _cliente()
        try:
            r = client.get("/api/inventario/alertas-stock")
        finally:
            app.dependency_overrides.clear()
        assert r.status_code == 200
        cuerpo = r.json()
        assert cuerpo["total"] == 2
        assert cuerpo["productos"][0]["codigo"] == "ART-1"
        assert isinstance(cuerpo["productos"][0]["existencia"], float)


class TestEvaluarStock:
    def test_con_productos_bajo_minimo_alerta(self, monkeypatch):
        monkeypatch.setattr(
            inventario_router,
            "consultar_productos_bajo_minimo",
            lambda limit=100: {
                "total": 3,
                "productos": [
                    {"codigo": "ART-1", "descripcion": "X", "existencia": 0.0, "stock_min": 10.0}
                ],
            },
        )
        resultado = evaluar_alertas(notificar=False)
        stock = resultado["stock_bajo"]
        assert stock["activa"] is True
        assert stock["total"] == 3
        assert "ART-1" in stock["motivo"]

    def test_sin_productos_no_alerta(self, monkeypatch):
        monkeypatch.setattr(
            inventario_router,
            "consultar_productos_bajo_minimo",
            lambda limit=100: {"total": 0, "productos": []},
        )
        resultado = evaluar_alertas(notificar=False)
        stock = resultado["stock_bajo"]
        assert stock["activa"] is False
        assert stock["total"] == 0

    def test_error_de_postgres_no_rompe_evaluacion(self, monkeypatch):
        def _boom(limit=100):
            raise RuntimeError("postgres caído")

        monkeypatch.setattr(
            inventario_router, "consultar_productos_bajo_minimo", _boom
        )
        resultado = evaluar_alertas(notificar=False)  # no debe lanzar
        assert resultado["stock_bajo"] is None
        assert "alertas_activas" in resultado


def teardown_module():
    try:
        if _TMP_DB.exists():
            _TMP_DB.unlink()
    except OSError:
        pass
    for suffix in ("-wal", "-shm", "-journal"):
        p = Path(str(_TMP_DB) + suffix)
        if p.exists():
            try:
                p.unlink()
            except OSError:
                pass
