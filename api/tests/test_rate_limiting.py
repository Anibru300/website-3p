"""Pruebas del rate limiting por IP con tolerancia a NAT corporativo."""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth.security import (  # noqa: E402
    MAX_ATTEMPTS_IP_ABSOLUTO,
    get_remaining_attempts,
    is_ip_blocked,
    record_login_attempt,
)
from app.database import users_connection  # noqa: E402

IP_NAT = "201.150.20.30"
IP_ATACANTE = "185.220.101.4"


@pytest.fixture(autouse=True)
def limpiar():
    with users_connection() as conn:
        conn.execute("DELETE FROM login_attempts")
        conn.commit()
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM login_attempts")
        conn.commit()


class TestToleranciaNAT:
    def test_varios_usuarios_misma_ip_misma_cantidad_no_bloquea(self):
        """Simula NAT: 5 fallos pero repartidos en 1-2 cuentas legitimas."""
        for i in range(5):
            email = "usuario1@empresa.com" if i < 3 else "usuario2@empresa.com"
            record_login_attempt(IP_NAT, email, exito=False)
        assert is_ip_blocked(IP_NAT) is False

    def test_spraying_multiples_cuentas_bloquea(self):
        """5 fallos contra 5 cuentas distintas = password spraying."""
        for i in range(5):
            record_login_attempt(IP_ATACANTE, f"victima{i}@correo.com", exito=False)
        assert is_ip_blocked(IP_ATACANTE) is True

    def test_umbral_absoluto_bloquea_sin_dispersion(self):
        """15+ fallos aunque sea una sola cuenta siempre bloquea la IP."""
        for _ in range(MAX_ATTEMPTS_IP_ABSOLUTO):
            record_login_attempt(IP_ATACANTE, "una@cuenta.com", exito=False)
        assert is_ip_blocked(IP_ATACANTE) is True

    def test_logins_exitosos_no_cuentan(self):
        for _ in range(20):
            record_login_attempt(IP_NAT, "ok@empresa.com", exito=True)
        assert is_ip_blocked(IP_NAT) is False

    def test_ips_diferentes_independientes(self):
        for i in range(5):
            record_login_attempt(IP_ATACANTE, f"v{i}@c.com", exito=False)
        assert is_ip_blocked(IP_ATACANTE) is True
        assert is_ip_blocked(IP_NAT) is False

    def test_emails_vacios_no_cuentan_como_dispersion(self):
        """Fallos sin email no deben activar el criterio de dispersión."""
        for _ in range(5):
            record_login_attempt(IP_NAT, "", exito=False)
        assert is_ip_blocked(IP_NAT) is False


class TestRemainingAttempts:
    def test_restantes_ip_respeta_umbral_absoluto(self):
        for _ in range(5):
            record_login_attempt(IP_NAT, "a@b.com", exito=False)
        restantes = get_remaining_attempts(IP_NAT, "a@b.com")
        assert restantes["ip"] == MAX_ATTEMPTS_IP_ABSOLUTO - 5

    def test_restantes_sin_intentos(self):
        restantes = get_remaining_attempts("10.9.9.9", "nuevo@correo.com")
        assert restantes["ip"] == MAX_ATTEMPTS_IP_ABSOLUTO
        assert restantes["account"] == 10


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
