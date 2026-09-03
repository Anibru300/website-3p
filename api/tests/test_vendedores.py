"""Pruebas de vendedores/firmas del cotizador (reemplazo del Excel COTIZADOR 2.0)."""

import os
import sys
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.cotizaciones.router as cot_router  # noqa: E402
from app.database import users_connection  # noqa: E402


@pytest.fixture(autouse=True)
def limpiar_vendedores():
    with users_connection() as conn:
        conn.execute("DELETE FROM vendedores")
        conn.commit()
    cot_router._VENDEDORES_SEMBRADOS = False
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM vendedores")
        conn.commit()
    cot_router._VENDEDORES_SEMBRADOS = False


def _cliente():
    from fastapi.testclient import TestClient

    from app.auth.dependencies import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: {
        "email": "vendedor@test",
        "nombre": "Vendedor Test",
        "rol": "user",
    }
    return TestClient(app), app


class TestMigracionInicial:
    def test_siembra_los_tres_vendedores_historicos(self):
        cot_router._migrar_vendedores_iniciales()
        with users_connection() as conn:
            filas = conn.execute(
                "SELECT nombre, firma_path FROM vendedores ORDER BY nombre"
            ).fetchall()
        assert [f["nombre"] for f in filas] == [
            "America Ruiz",
            "Carlos Urbina",
            "Cynthia Hernandez",
        ]
        assert all(f["firma_path"] and Path(f["firma_path"]).exists() for f in filas)

    def test_migracion_es_idempotente(self):
        cot_router._migrar_vendedores_iniciales()
        cot_router._migrar_vendedores_iniciales()
        with users_connection() as conn:
            n = conn.execute("SELECT COUNT(*) FROM vendedores").fetchone()[0]
        assert n == 3

    def test_no_pisa_registros_existentes(self):
        with users_connection() as conn:
            conn.execute(
                "INSERT INTO vendedores (nombre) VALUES (?)", ("Nuevo Vendedor",)
            )
            conn.commit()
        cot_router._migrar_vendedores_iniciales()
        with users_connection() as conn:
            n = conn.execute("SELECT COUNT(*) FROM vendedores").fetchone()[0]
        assert n == 1  # no sembró nada porque la tabla no estaba vacía


class TestFirmaPath:
    def test_resuelve_desde_sqlite(self):
        cot_router._migrar_vendedores_iniciales()
        path = cot_router._firma_path_para_vendedor("CYNTHIA HERNANDEZ")
        assert path is not None and path.exists()

    def test_nombre_desconocido_sin_firma(self):
        cot_router._migrar_vendedores_iniciales()
        assert cot_router._firma_path_para_vendedor("Fulano de Tal") is None


class TestEndpoints:
    def test_get_lista_vendedores(self):
        client, app = _cliente()
        try:
            r = client.get("/api/cotizaciones/vendedores")
            assert r.status_code == 200
            nombres = [v["nombre"] for v in r.json()["vendedores"]]
            assert "America Ruiz" in nombres
            assert "Vendedor Test" in nombres  # usuario actual incluido
        finally:
            app.dependency_overrides.clear()

    def test_crear_vendedor_sin_firma(self):
        client, app = _cliente()
        try:
            r = client.post("/api/cotizaciones/vendedores", data={"nombre": "Laura Prueba"})
            assert r.status_code == 200
            assert r.json()["tiene_firma"] is False
        finally:
            app.dependency_overrides.clear()

    def test_crear_vendedor_con_firma(self, tmp_path):
        png = tmp_path / "firma.png"
        png.write_bytes(b"\x89PNG\r\n\x1a\n" + b"0" * 64)
        client, app = _cliente()
        try:
            with open(png, "rb") as f:
                r = client.post(
                    "/api/cotizaciones/vendedores",
                    data={"nombre": "Laura Firma"},
                    files={"firma": ("firma.png", f, "image/png")},
                )
            assert r.status_code == 200
            assert r.json()["tiene_firma"] is True
            vendedor_id = r.json()["id"]

            r_firma = client.get(f"/api/cotizaciones/vendedores/{vendedor_id}/firma")
            assert r_firma.status_code == 200
            assert r_firma.content.startswith(b"\x89PNG")
        finally:
            app.dependency_overrides.clear()

    def test_nombre_duplicado_rechazado(self):
        client, app = _cliente()
        try:
            client.post("/api/cotizaciones/vendedores", data={"nombre": "Duplicado"})
            r = client.post("/api/cotizaciones/vendedores", data={"nombre": "Duplicado"})
            assert r.status_code == 409
        finally:
            app.dependency_overrides.clear()

    def test_archivo_no_imagen_rechazado(self):
        client, app = _cliente()
        try:
            r = client.post(
                "/api/cotizaciones/vendedores",
                data={"nombre": "ConTxt"},
                files={"firma": ("nota.txt", b"hola", "text/plain")},
            )
            assert r.status_code == 422
        finally:
            app.dependency_overrides.clear()

    def test_delete_requiere_admin(self):
        client, app = _cliente()
        try:
            r = client.delete("/api/cotizaciones/vendedores/1")
            assert r.status_code in (401, 403)
        finally:
            app.dependency_overrides.clear()

    def test_delete_admin_desactiva(self):
        cot_router._migrar_vendedores_iniciales()
        from fastapi.testclient import TestClient

        from app.auth.dependencies import get_current_user, require_admin
        from app.main import app

        app.dependency_overrides[get_current_user] = lambda: {
            "email": "admin@test", "nombre": "Admin", "rol": "admin",
        }
        app.dependency_overrides[require_admin] = lambda: {
            "email": "admin@test", "nombre": "Admin", "rol": "admin",
        }
        try:
            with users_connection() as conn:
                vid = conn.execute(
                    "SELECT id FROM vendedores WHERE nombre = 'America Ruiz'"
                ).fetchone()["id"]
            r = client_delete = TestClient(app).delete(f"/api/cotizaciones/vendedores/{vid}")
            assert r.status_code == 200
            with users_connection() as conn:
                activo = conn.execute(
                    "SELECT activo FROM vendedores WHERE id = ?", (vid,)
                ).fetchone()["activo"]
            assert activo == 0
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
