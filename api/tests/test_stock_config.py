"""Pruebas de la configuración de stock mínimo (override personalizado)."""

import os
import sys
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.inventario.router as inventario_router  # noqa: E402
from app.database import users_connection  # noqa: E402
from app.services.stock_config import merge_config, minimo_efectivo, obtener_configs  # noqa: E402


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


@pytest.fixture(autouse=True)
def limpiar_config():
    with users_connection() as conn:
        conn.execute("DELETE FROM stock_config")
        conn.commit()
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM stock_config")
        conn.commit()


class TestMinimoEfectivo:
    def test_custom_manda_sobre_sae(self):
        assert minimo_efectivo(10, 5) == 5

    def test_sae_cero_es_sin_minimo(self):
        assert minimo_efectivo(0, None) is None
        assert minimo_efectivo(None, None) is None

    def test_sae_positivo_sin_custom(self):
        assert minimo_efectivo(8, None) == 8

    def test_custom_cero_es_valido(self):
        assert minimo_efectivo(0, 0) == 0


class TestMergeConfig:
    def test_origenes_y_bajo_minimo(self):
        filas = [
            {"codigo": "A1", "descripcion": "X", "existencia": 3, "stock_min": 10},
            {"codigo": "A2", "descripcion": "Y", "existencia": 3, "stock_min": 0},
            {"codigo": "A3", "descripcion": "Z", "existencia": 0, "stock_min": 0},
        ]
        configs = {"A2": 5.0, "A3": 0.0}
        resultado = {f["codigo"]: f for f in merge_config(filas, configs)}

        assert resultado["A1"]["origen"] == "sae"
        assert resultado["A1"]["bajo_minimo"] is True
        assert resultado["A2"]["origen"] == "manual"
        assert resultado["A2"]["minimo_efectivo"] == 5.0
        assert resultado["A2"]["bajo_minimo"] is True
        # Custom 0: alerta cuando no hay existencia
        assert resultado["A3"]["bajo_minimo"] is True


class TestConsultarBajoMinimo:
    def test_custom_alerta_aunque_sae_no_tenga(self, monkeypatch):
        filas = [
            {"codigo": "A1", "descripcion": "X", "existencia": 2, "stock_min": 0},
            {"codigo": "A2", "descripcion": "Y", "existencia": 0, "stock_min": 0},
        ]
        _mock_postgres(monkeypatch, filas)
        with users_connection() as conn:
            conn.execute("INSERT INTO stock_config (codigo, stock_min) VALUES ('A1', 10)")
            conn.commit()

        resultado = inventario_router.consultar_productos_bajo_minimo()
        assert resultado["total"] == 1
        assert resultado["productos"][0]["codigo"] == "A1"
        assert resultado["productos"][0]["stock_min"] == 10

    def test_sin_minimo_no_alerta(self, monkeypatch):
        filas = [{"codigo": "A1", "descripcion": "X", "existencia": 0, "stock_min": 0}]
        _mock_postgres(monkeypatch, filas)
        assert inventario_router.consultar_productos_bajo_minimo()["total"] == 0

    def test_orden_por_faltante(self, monkeypatch):
        filas = [
            {"codigo": "A1", "descripcion": "X", "existencia": 8, "stock_min": 10},
            {"codigo": "A2", "descripcion": "Y", "existencia": 0, "stock_min": 50},
        ]
        _mock_postgres(monkeypatch, filas)
        resultado = inventario_router.consultar_productos_bajo_minimo()
        assert [p["codigo"] for p in resultado["productos"]] == ["A2", "A1"]


class TestCatalogoPorAlmacen:
    def test_almacen_excluye_productos_sin_existencia(self, monkeypatch):
        import app.admin.stock_config as admin_stock

        filas = [
            {"codigo": "A1", "descripcion": "X", "existencia": 5, "stock_min": 0},
            {"codigo": "A2", "descripcion": "Y", "existencia": 0, "stock_min": 0},
        ]
        monkeypatch.setattr(
            admin_stock, "postgres_cursor", lambda: _CtxFalso(_CursorFalso(filas))
        )

        resultado = admin_stock._catalogo_desde_sae(None, 40)
        assert [f["codigo"] for f in resultado] == ["A1"]

    def test_sin_almacen_incluye_todos(self, monkeypatch):
        import app.admin.stock_config as admin_stock

        filas = [
            {"codigo": "A1", "descripcion": "X", "existencia": 5, "stock_min": 0},
            {"codigo": "A2", "descripcion": "Y", "existencia": 0, "stock_min": 0},
        ]
        monkeypatch.setattr(
            admin_stock, "postgres_cursor", lambda: _CtxFalso(_CursorFalso(filas))
        )

        resultado = admin_stock._catalogo_desde_sae(None, None)
        assert [f["codigo"] for f in resultado] == ["A1", "A2"]


class TestEndpointsAdmin:
    def _cliente(self, admin=True):
        from fastapi.testclient import TestClient

        from app.auth.dependencies import get_current_user, require_admin
        from app.main import app

        if admin:
            app.dependency_overrides[require_admin] = lambda: {
                "email": "admin@test", "nombre": "Admin", "rol": "admin",
            }
        app.dependency_overrides[get_current_user] = lambda: {
            "email": "user@test", "nombre": "User", "rol": "user",
        }
        return TestClient(app), app

    def test_requiere_admin(self):
        from fastapi.testclient import TestClient

        from app.main import app

        with TestClient(app) as c:
            r = c.get("/api/admin/stock-config/catalogo")
        assert r.status_code in (401, 403)

    def test_put_upsert_y_delete(self, monkeypatch):
        client, app = self._cliente()
        try:
            r = client.put(
                "/api/admin/stock-config",
                json={"codigo": "ART-1", "stock_min": 7},
            )
            assert r.status_code == 200
            assert obtener_configs().get("ART-1") == 7

            r = client.put(
                "/api/admin/stock-config",
                json={"codigo": "ART-1", "stock_min": 12},
            )
            assert r.status_code == 200
            assert obtener_configs().get("ART-1") == 12

            r = client.delete("/api/admin/stock-config/ART-1")
            assert r.status_code == 200
            assert "ART-1" not in obtener_configs()
        finally:
            app.dependency_overrides.clear()

    def test_put_rechaza_negativo(self):
        client, app = self._cliente()
        try:
            r = client.put(
                "/api/admin/stock-config",
                json={"codigo": "ART-1", "stock_min": -3},
            )
            assert r.status_code == 422
        finally:
            app.dependency_overrides.clear()

    def test_delete_inexistente_404(self):
        client, app = self._cliente()
        try:
            r = client.delete("/api/admin/stock-config/NO-EXISTE")
            assert r.status_code == 404
        finally:
            app.dependency_overrides.clear()


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
