"""Pruebas de filtros por país/ciudad y comparativa de períodos."""

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.analytics.router import datos_publicos, publico_comparativa  # noqa: E402
from app.database import users_connection  # noqa: E402


def _ins(ts, pais="México", ciudad="León", path="/"):
    with users_connection() as conn:
        conn.execute(
            """
            INSERT INTO analytics_events
            (session_id, event_type, path, ip, country, city, created_at)
            VALUES (?, 'page_view', ?, '187.190.10.20', ?, ?, ?)
            """,
            (f"s-{ts}-{pais}-{ciudad}", path, pais, ciudad, ts),
        )
        conn.commit()


@pytest.fixture(autouse=True)
def limpiar():
    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.commit()
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.commit()


def _sembrar_mezcla():
    ahora = datetime.now(timezone.utc)
    ts = ahora.strftime("%Y-%m-%d %H:%M:%S")
    _ins(ts, pais="México", ciudad="León")
    _ins(ts, pais="México", ciudad="Guadalajara")
    _ins(ts, pais="Colombia", ciudad="Medellín")


class TestFiltrosGeo:
    def test_filtro_pais(self):
        _sembrar_mezcla()
        datos = datos_publicos(7, pais="México")
        total = sum(d["total"] for d in datos["por_dia"])
        assert total == 2
        paises = {p["nombre"] for p in datos["paises"]}
        assert paises == {"México"}

    def test_filtro_ciudad(self):
        _sembrar_mezcla()
        datos = datos_publicos(7, ciudad="Medellín")
        total = sum(d["total"] for d in datos["por_dia"])
        assert total == 1

    def test_filtro_combinado(self):
        _sembrar_mezcla()
        datos = datos_publicos(7, pais="México", ciudad="León")
        total = sum(d["total"] for d in datos["por_dia"])
        assert total == 1

    def test_filtro_ciudad_de_otro_pais_da_cero(self):
        _sembrar_mezcla()
        datos = datos_publicos(7, pais="México", ciudad="Medellín")
        total = sum(d["total"] for d in datos["por_dia"])
        assert total == 0

    def test_sin_filtros_todo(self):
        _sembrar_mezcla()
        datos = datos_publicos(7)
        total = sum(d["total"] for d in datos["por_dia"])
        assert total == 3


class _FakeUser:
    pass


class TestComparativa:
    def test_comparativa_datos(self):
        ahora = datetime.now(timezone.utc)
        for i in range(10):  # últimos 7 días
            ts = (ahora - timedelta(days=1, hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            _ins(ts)
        for i in range(4):  # hace 8-14 días
            ts = (ahora - timedelta(days=8, hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            _ins(ts)

        r = publico_comparativa(dias=7, fecha_desde=None, fecha_hasta=None, pais=None, ciudad=None, user=_FakeUser())
        assert r["actual"]["total"] == 10
        assert r["anterior"]["total"] == 4
        assert r["diferencia_absoluta"] == 6
        assert r["variacion_porcentual"] == 150.0
        assert len(r["actual"]["por_dia"]) >= 1

    def test_comparativa_sin_datos_anteriores(self):
        ahora = datetime.now(timezone.utc)
        for i in range(5):
            ts = (ahora - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            _ins(ts)
        r = publico_comparativa(dias=7, fecha_desde=None, fecha_hasta=None, pais=None, ciudad=None, user=_FakeUser())
        assert r["actual"]["total"] == 5
        assert r["anterior"]["total"] == 0
        assert r["variacion_porcentual"] is None  # sin división entre cero

    def test_comparativa_respeta_filtro_pais(self):
        ahora = datetime.now(timezone.utc)
        for i in range(6):
            ts = (ahora - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            _ins(ts, pais="México")
            _ins(ts, pais="Rusia")
        r = publico_comparativa(dias=7, fecha_desde=None, fecha_hasta=None, pais="México", ciudad=None, user=_FakeUser())
        assert r["actual"]["total"] == 6

    def test_comparativa_con_fechas(self):
        ahora = datetime.now(timezone.utc)
        for i in range(5):
            ts = (ahora - timedelta(days=2, hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            _ins(ts)
        desde = (ahora - timedelta(days=3)).strftime("%Y-%m-%d")
        hasta = (ahora - timedelta(days=1)).strftime("%Y-%m-%d")
        r = publico_comparativa(dias=30, fecha_desde=desde, fecha_hasta=hasta, pais=None, ciudad=None, user=_FakeUser())
        # El período anterior debe terminar un día antes del inicio.
        assert r["actual"]["inicio"] == desde
        assert r["anterior"]["fin"] < desde
        assert r["actual"]["total"] == 5


class TestEndpointsFiltros:
    def test_endpoint_por_dia_con_filtro(self):
        from fastapi.testclient import TestClient

        from app.auth.dependencies import require_admin
        from app.main import app

        _sembrar_mezcla()
        app.dependency_overrides[require_admin] = lambda: {"email": "admin@test", "role": "admin"}
        try:
            with TestClient(app) as c:
                r = c.get("/api/analytics/publico/por-dia?dias=7&pais=México")
        finally:
            app.dependency_overrides.clear()
        assert r.status_code == 200
        assert sum(d["total"] for d in r.json()["data"]) == 2

    def test_endpoint_comparativa_requiere_admin(self):
        from fastapi.testclient import TestClient

        from app.main import app

        with TestClient(app) as c:
            r = c.get("/api/analytics/publico/comparativa?dias=7")
        assert r.status_code in (401, 403, 422)


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
