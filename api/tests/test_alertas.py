"""Pruebas de alertas avanzadas: pico de tráfico, países no esperados y
notificación por correo con deduplicación."""

import os
import socket
import sys
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.analytics.alertas import evaluar_alertas  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.database import users_connection  # noqa: E402


def _insertar_eventos(pais="México", ciudad="León", ip="187.190.10.20", path="/"):
    def _ins(ts, p=pais, c=ciudad, ip=ip, path=path):
        with users_connection() as conn:
            conn.execute(
                """
                INSERT INTO analytics_events
                (session_id, event_type, path, ip, country, city, created_at)
                VALUES (?, 'page_view', ?, ?, ?, ?, ?)
                """,
                (f"s-{ts}", path, ip, p, c, ts),
            )
            conn.commit()

    return _ins


@pytest.fixture(autouse=True)
def limpiar():
    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.execute("DELETE FROM alertas_enviadas")
        conn.commit()
    yield
    with users_connection() as conn:
        conn.execute("DELETE FROM analytics_events")
        conn.execute("DELETE FROM alertas_enviadas")
        conn.commit()


def _sembrar_historico_normal(insertar, dias=10, por_dia=5):
    ahora = datetime.now(timezone.utc)
    for d in range(1, dias + 1):
        for i in range(por_dia):
            ts = (ahora - timedelta(days=d, hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            insertar(ts)


class TestPicoTrafico:
    def test_pico_detectado(self):
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=5)
        ahora = datetime.now(timezone.utc)
        for i in range(100):
            ts = (ahora - timedelta(minutes=i * 5)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)
        resultado = evaluar_alertas(notificar=False)
        pico = resultado["pico_trafico"]
        assert pico["activa"] is True
        assert pico["eventos_24h"] == 100
        assert pico["promedio_diario_historico"] == 5

    def test_trafico_normal_no_alerta(self):
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=5)
        ahora = datetime.now(timezone.utc)
        for i in range(6):  # 6 eventos hoy, dentro de lo normal
            ts = (ahora - timedelta(minutes=i * 30)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)
        resultado = evaluar_alertas(notificar=False)
        assert resultado["pico_trafico"]["activa"] is False

    def test_volumen_minimo_evita_falsos_positivos(self):
        """3x un promedio de 1 no debe alertar (volumen diminuto)."""
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=1)
        ahora = datetime.now(timezone.utc)
        for i in range(10):  # < MINIMO_EVENTOS_24H (50)
            ts = (ahora - timedelta(minutes=i * 30)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)
        resultado = evaluar_alertas(notificar=False)
        assert resultado["pico_trafico"]["activa"] is False


class TestPaisesNoEsperados:
    def test_pais_fuera_de_lista_alerta(self, monkeypatch):
        monkeypatch.setenv("ALERTAS_PAISES_PERMITIDOS", "México,Colombia")
        get_settings.cache_clear()
        ins = _insertar_eventos()
        ahora = datetime.now(timezone.utc)
        for i in range(3):
            ts = (ahora - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts, p="Rusia", c="Moscú", ip="185.220.101.4")
        resultado = evaluar_alertas(notificar=False)
        alerta = resultado["pais_no_esperado"]
        assert alerta["activa"] is True
        assert "Rusia" in alerta["paises_no_esperados"]
        assert alerta["detalle"][0]["top_ciudades_ips"]

    def test_solo_paises_permitidos_no_alerta(self, monkeypatch):
        monkeypatch.setenv("ALERTAS_PAISES_PERMITIDOS", "México")
        get_settings.cache_clear()
        ins = _insertar_eventos()
        ahora = datetime.now(timezone.utc)
        for i in range(3):
            ts = (ahora - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts, p="México", c="León")
        resultado = evaluar_alertas(notificar=False)
        assert resultado["pais_no_esperado"]["activa"] is False

    def test_sin_configuracion_no_evalua(self, monkeypatch):
        monkeypatch.setenv("ALERTAS_PAISES_PERMITIDOS", "")
        get_settings.cache_clear()
        resultado = evaluar_alertas(notificar=False)
        assert resultado["pais_no_esperado"] is None


class _ServidorSMTPFalso:
    """Servidor SMTP mínimo para capturar correos enviados en pruebas."""

    def __init__(self):
        self.correos = []
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._sock.bind(("127.0.0.1", 0))
        self._sock.listen(1)
        self.puerto = self._sock.getsockname()[1]
        self._hilo = threading.Thread(target=self._atender, daemon=True)
        self._hilo.start()

    def _atender(self):
        while True:
            try:
                conn, _ = self._sock.accept()
            except OSError:
                return
            with conn:
                conn.sendall(b"220 test ESMTP\r\n")
                datos = b""
                en_data = False
                while True:
                    try:
                        chunk = conn.recv(4096)
                    except OSError:
                        break
                    if not chunk:
                        break
                    datos += chunk
                    if en_data and datos.rstrip().endswith(b"."):
                        self.correos.append(datos)
                        conn.sendall(b"250 OK\r\n")
                        en_data = False
                        datos = b""
                        continue
                    for linea in datos.split(b"\r\n"):
                        if linea.upper().startswith((b"EHLO", b"HELO")):
                            conn.sendall(b"250-test\r\n250 AUTH LOGIN\r\n")
                        elif linea.upper().startswith(b"MAIL FROM"):
                            conn.sendall(b"250 OK\r\n")
                        elif linea.upper().startswith(b"RCPT TO"):
                            conn.sendall(b"250 OK\r\n")
                        elif linea.upper().startswith(b"DATA"):
                            conn.sendall(b"354 End data with <CR><LF>.<CR><LF>\r\n")
                            en_data = True
                        elif linea.upper().startswith(b"QUIT"):
                            conn.sendall(b"221 Bye\r\n")
                            return
                        elif linea:
                            conn.sendall(b"250 OK\r\n")
                    datos = b""

    def cerrar(self):
        self._sock.close()


@pytest.fixture()
def smtp_falso(monkeypatch):
    servidor = _ServidorSMTPFalso()
    monkeypatch.setenv("SMTP_HOST", "127.0.0.1")
    monkeypatch.setenv("SMTP_PORT", str(servidor.puerto))
    monkeypatch.setenv("SMTP_USER", "")
    monkeypatch.setenv("SMTP_PASSWORD", "")
    monkeypatch.setenv("SMTP_FROM", "alertas@test.local")
    monkeypatch.setenv("SMTP_TLS", "false")
    monkeypatch.setenv("ALERTAS_EMAIL_TO", "admin@test.local")
    get_settings.cache_clear()
    yield servidor
    servidor.cerrar()
    get_settings.cache_clear()


class TestNotificacionCorreo:
    def test_correo_enviado_una_sola_vez_por_pico(self, smtp_falso):
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=5)
        ahora = datetime.now(timezone.utc)
        for i in range(100):
            ts = (ahora - timedelta(minutes=i * 5)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)

        r1 = evaluar_alertas(notificar=True)
        assert r1["pico_trafico"]["activa"] is True
        assert len(smtp_falso.correos) == 1
        assert b"pico_trafico" in smtp_falso.correos[0]

        # Segunda evaluación dentro del cooldown: NO reenvía.
        r2 = evaluar_alertas(notificar=True)
        assert r2["pico_trafico"]["activa"] is True
        assert len(smtp_falso.correos) == 1

    def test_sin_smtp_no_rompe_y_no_envia(self, monkeypatch):
        monkeypatch.setenv("SMTP_HOST", "")
        monkeypatch.setenv("ALERTAS_EMAIL_TO", "")
        get_settings.cache_clear()
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=5)
        ahora = datetime.now(timezone.utc)
        for i in range(100):
            ts = (ahora - timedelta(minutes=i * 5)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)
        resultado = evaluar_alertas(notificar=True)
        assert resultado["pico_trafico"]["activa"] is True  # la alerta sigue activa

    def test_error_smtp_no_lanza_excepcion(self, monkeypatch):
        monkeypatch.setenv("SMTP_HOST", "127.0.0.1")
        monkeypatch.setenv("SMTP_PORT", "1")  # puerto cerrado
        monkeypatch.setenv("SMTP_USER", "")
        monkeypatch.setenv("SMTP_PASSWORD", "")
        monkeypatch.setenv("SMTP_FROM", "alertas@test.local")
        monkeypatch.setenv("ALERTAS_EMAIL_TO", "admin@test.local")
        get_settings.cache_clear()
        ins = _insertar_eventos()
        _sembrar_historico_normal(ins, dias=10, por_dia=5)
        ahora = datetime.now(timezone.utc)
        for i in range(100):
            ts = (ahora - timedelta(minutes=i * 5)).strftime("%Y-%m-%d %H:%M:%S")
            ins(ts)
        resultado = evaluar_alertas(notificar=True)  # no debe lanzar
        assert resultado["pico_trafico"]["activa"] is True


class TestEndpointAlertasAvanzadas:
    def test_requiere_admin(self):
        from fastapi.testclient import TestClient

        from app.main import app

        with TestClient(app) as c:
            r = c.get("/api/analytics/alertas/avanzadas")
        assert r.status_code in (401, 403, 422)

    def test_con_admin_devuelve_estado(self):
        from fastapi.testclient import TestClient

        from app.auth.dependencies import require_admin
        from app.main import app

        app.dependency_overrides[require_admin] = lambda: {"email": "admin@test", "role": "admin"}
        try:
            with TestClient(app) as c:
                r = c.get("/api/analytics/alertas/avanzadas")
        finally:
            app.dependency_overrides.clear()
        assert r.status_code == 200
        cuerpo = r.json()
        assert "pico_trafico" in cuerpo
        assert "alertas_activas" in cuerpo


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
