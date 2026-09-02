import logging
from datetime import datetime, timedelta, timezone

from app.database import users_connection

logger = logging.getLogger(__name__)

MAX_ATTEMPTS_IP = 5
# Umbral duro por IP: se bloquea sin importar a cuántas cuentas apuntaron.
MAX_ATTEMPTS_IP_ABSOLUTO = 15
# El umbral MAX_ATTEMPTS_IP solo aplica si los fallos se reparten entre al
# menos estas cuentas distintas (patrón de password spraying). Así, varios
# usuarios legítimos detrás de un NAT corporativo que fallen cada uno pocas
# veces NO bloquean la IP compartida.
MIN_EMAILS_DISTINTOS_IP = 3
MAX_ATTEMPTS_ACCOUNT = 10
WINDOW_MINUTES = 15
LOCKOUT_MINUTES = 30


def _now() -> datetime:
    return datetime.now(timezone.utc)


def record_login_attempt(ip: str, email: str, exito: bool):
    """Registra un intento de login en la base de datos."""
    with users_connection() as conn:
        # Guardar siempre en UTC para que los filtros por fecha funcionen correctamente.
        created_at = _now().isoformat()
        conn.execute(
            "INSERT INTO login_attempts (ip, email, exito, created_at) VALUES (?, ?, ?, ?)",
            (ip, email, 1 if exito else 0, created_at),
        )
        # Limpiar intentos antiguos para no crecer indefinidamente
        cutoff = (_now() - timedelta(minutes=WINDOW_MINUTES * 4)).isoformat()
        conn.execute("DELETE FROM login_attempts WHERE created_at < ?", (cutoff,))
        conn.commit()


def _count_failed_attempts(conn, field: str, value: str) -> int:
    cutoff = (_now() - timedelta(minutes=WINDOW_MINUTES)).isoformat()
    row = conn.execute(
        f"""
        SELECT COUNT(*) FROM login_attempts
        WHERE {field} = ? AND exito = 0 AND created_at > ?
        """,
        (value, cutoff),
    ).fetchone()
    return row[0] if row else 0


def _ip_failed_stats(conn, ip: str) -> tuple[int, int]:
    """Devuelve (intentos fallidos, emails distintos) de una IP en la ventana."""
    cutoff = (_now() - timedelta(minutes=WINDOW_MINUTES)).isoformat()
    row = conn.execute(
        """
        SELECT COUNT(*), COUNT(DISTINCT email) FROM login_attempts
        WHERE ip = ? AND exito = 0 AND created_at > ?
          AND email IS NOT NULL AND email != ''
        """,
        (ip, cutoff),
    ).fetchone()
    return (row[0] if row else 0), (row[1] if row else 0)


def is_ip_blocked(ip: str) -> bool:
    """Bloqueo por IP con tolerancia a NAT corporativo.

    - Bloquea siempre al umbral absoluto (15 fallos, sin importar dispersión).
    - Antes de eso, solo bloquea si los fallos apuntan a >=3 cuentas
      distintas (password spraying), no por fallos concentrados en una sola
      cuenta (eso ya lo cubre el bloqueo por cuenta).
    """
    with users_connection() as conn:
        failed, distinct_emails = _ip_failed_stats(conn, ip)
        if failed >= MAX_ATTEMPTS_IP_ABSOLUTO:
            return True
        return failed >= MAX_ATTEMPTS_IP and distinct_emails >= MIN_EMAILS_DISTINTOS_IP


def is_account_blocked(email: str) -> tuple[bool, datetime | None]:
    """Devuelve (bloqueado, hasta_cuando). Considera bloqueo por intentos y bloqueo manual de cuenta."""
    with users_connection() as conn:
        user = conn.execute(
            "SELECT bloqueado_hasta, intentos_fallidos FROM users WHERE email = ? AND activo = 1",
            (email,),
        ).fetchone()

        if user and user["bloqueado_hasta"]:
            bloqueado_hasta = datetime.fromisoformat(user["bloqueado_hasta"])
            if bloqueado_hasta.tzinfo is None:
                bloqueado_hasta = bloqueado_hasta.replace(tzinfo=timezone.utc)
            if bloqueado_hasta > _now():
                return True, bloqueado_hasta

        failed = _count_failed_attempts(conn, "email", email)
        if failed >= MAX_ATTEMPTS_ACCOUNT:
            bloqueado_hasta = _now() + timedelta(minutes=LOCKOUT_MINUTES)
            conn.execute(
                "UPDATE users SET bloqueado_hasta = ?, intentos_fallidos = ? WHERE email = ?",
                (bloqueado_hasta.isoformat(), failed, email),
            )
            conn.commit()
            return True, bloqueado_hasta

        return False, None


def reset_account_lockout(email: str):
    """Limpia el bloqueo de cuenta tras un login exitoso."""
    with users_connection() as conn:
        conn.execute(
            "UPDATE users SET bloqueado_hasta = NULL, intentos_fallidos = 0 WHERE email = ?",
            (email,),
        )
        conn.commit()


def increment_failed_login(email: str):
    """Incrementa contador de intentos fallidos de la cuenta."""
    with users_connection() as conn:
        conn.execute(
            "UPDATE users SET intentos_fallidos = intentos_fallidos + 1 WHERE email = ?",
            (email,),
        )
        conn.commit()


def get_remaining_attempts(ip: str, email: str) -> dict[str, int]:
    with users_connection() as conn:
        ip_failed, _ = _ip_failed_stats(conn, ip)
        email_failed = _count_failed_attempts(conn, "email", email)
    return {
        "ip": max(0, MAX_ATTEMPTS_IP_ABSOLUTO - ip_failed),
        "account": max(0, MAX_ATTEMPTS_ACCOUNT - email_failed),
    }
