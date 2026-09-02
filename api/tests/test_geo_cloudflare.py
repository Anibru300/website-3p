"""Pruebas de geolocalización con headers de Cloudflare y anti-spoofing."""

import json
import os
import sys
from pathlib import Path

import pytest

# Usar una BD temporal antes de importar la app.
_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from starlette.requests import Request  # noqa: E402

from app.services.client_ip import (  # noqa: E402
    cf_country_name,
    get_client_ip,
    get_client_ip_and_country,
)


def _make_request(headers: dict, client_host: str):
    raw = [(k.lower().encode(), v.encode()) for k, v in headers.items()]
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/analytics/event",
        "headers": raw,
        "client": (client_host, 54321),
    }
    return Request(scope)


class TestConfianzaHeaders:
    def test_cf_connecting_ip_loopback(self):
        req = _make_request(
            {"cf-connecting-ip": "187.190.10.20", "cf-ipcountry": "mx"},
            "127.0.0.1",
        )
        ip, country = get_client_ip_and_country(req)
        assert ip == "187.190.10.20"
        assert country == "MX"

    def test_cf_country_xx_es_none(self):
        assert cf_country_name("XX") is None
        assert cf_country_name("") is None
        assert cf_country_name(None) is None

    def test_cf_country_nombre_español(self):
        assert cf_country_name("mx") == "México"
        assert cf_country_name("CO") == "Colombia"
        assert cf_country_name("ZZ") == "ZZ"  # desconocido devuelve el código

    def test_spoofing_xff_desde_peer_externo(self):
        """X-Forwarded-For desde un peer no loopback NO debe ser confiable."""
        req = _make_request({"x-forwarded-for": "1.2.3.4"}, "192.168.1.50")
        ip, country = get_client_ip_and_country(req)
        assert ip == "192.168.1.50"
        assert country is None

    def test_spoofing_cf_desde_peer_externo(self):
        """CF-Connecting-IP desde un peer no loopback NO debe ser confiable."""
        req = _make_request(
            {"cf-connecting-ip": "1.2.3.4", "cf-ipcountry": "US"},
            "10.0.0.5",
        )
        ip, country = get_client_ip_and_country(req)
        assert ip == "10.0.0.5"
        assert country is None

    def test_xff_loopback_sin_cf(self):
        req = _make_request({"x-forwarded-for": "8.8.8.8, 10.0.0.1"}, "::1")
        ip, _ = get_client_ip_and_country(req)
        assert ip == "8.8.8.8"

    def test_sin_headers_devuelve_peer(self):
        req = _make_request({}, "127.0.0.1")
        ip, country = get_client_ip_and_country(req)
        assert ip == "127.0.0.1"
        assert country is None


@pytest.fixture()
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    # TestClient usa peer "testclient"; lo forzamos a loopback para simular
    # el túnel Cloudflare local (cloudflared) como lo haría producción.
    class _LoopbackASGI:
        def __init__(self, inner):
            self.inner = inner

        async def __call__(self, scope, receive, send):
            if scope["type"] == "http":
                scope["client"] = ("127.0.0.1", 12345)
            await self.inner(scope, receive, send)

    with TestClient(_LoopbackASGI(app)) as c:
        yield c


@pytest.fixture(autouse=True)
def limpiar_eventos():
    from app.database import users_connection

    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.commit()
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.commit()


class TestEventoConGeo:
    def test_evento_con_headers_cf_guarda_pais(self, client):
        resp = client.post(
            "/api/analytics/event",
            json={"event_type": "page_view", "path": "/"},
            headers={
                "cf-connecting-ip": "187.190.10.20",
                "cf-ipcountry": "MX",
                "user-agent": "pytest",
            },
        )
        assert resp.status_code == 200

        from app.database import users_connection

        with users_connection() as conn:
            row = conn.execute(
                "SELECT ip, country FROM analytics_events ORDER BY id DESC LIMIT 1"
            ).fetchone()
        assert row["ip"] == "187.190.10.20"
        assert row["country"] == "México"

    def test_evento_pais_explicito_del_frontend_gana_sobre_cf(self, client):
        resp = client.post(
            "/api/analytics/event",
            json={
                "event_type": "page_view",
                "path": "/",
                "country": "Colombia",
                "city": "Medellín",
            },
            headers={"cf-connecting-ip": "187.190.10.20", "cf-ipcountry": "MX"},
        )
        assert resp.status_code == 200

        from app.database import users_connection

        with users_connection() as conn:
            row = conn.execute(
                "SELECT ip, country, city FROM analytics_events ORDER BY id DESC LIMIT 1"
            ).fetchone()
        assert row["ip"] == "187.190.10.20"
        assert row["country"] == "Colombia"
        assert row["city"] == "Medellín"

    def test_evento_sin_cf_usa_peer(self, client):
        resp = client.post(
            "/api/analytics/event",
            json={"event_type": "page_view", "path": "/test-local"},
        )
        assert resp.status_code == 200

        from app.database import users_connection

        with users_connection() as conn:
            row = conn.execute(
                "SELECT ip, country FROM analytics_events ORDER BY id DESC LIMIT 1"
            ).fetchone()
        assert row["ip"] == "127.0.0.1"


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
