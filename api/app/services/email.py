"""Envío de correo vía SMTP para notificaciones del backend.

Toda la configuración viene de variables de entorno (ver .env.example).
Si no hay SMTP configurado, las funciones devuelven False y el caller
debe limitarse a registrar la alerta en logs/panel.
"""

import logging
import smtplib
from email.message import EmailMessage
from typing import Iterable

from app.config import get_settings

logger = logging.getLogger(__name__)


def correo_configurado() -> bool:
    s = get_settings()
    return bool(s.smtp_host and s.alertas_email_to)


def enviar_correo(destinatarios: Iterable[str], asunto: str, cuerpo: str) -> bool:
    """Envía un correo por SMTP. Devuelve True si se envió, False si no."""
    s = get_settings()
    destinatarios = [d.strip() for d in destinatarios if d and d.strip()]
    if not s.smtp_host or not destinatarios:
        logger.info(
            "[email] SMTP no configurado (smtp_host vacío o sin destinatarios). "
            "Correo no enviado: %s",
            asunto,
        )
        return False

    remitente = s.smtp_from or s.smtp_user
    if not remitente:
        logger.warning("[email] Falta SMTP_FROM/SMTP_USER; no se puede enviar.")
        return False

    mensaje = EmailMessage()
    mensaje["From"] = remitente
    mensaje["To"] = ", ".join(destinatarios)
    mensaje["Subject"] = asunto
    mensaje.set_content(cuerpo)

    try:
        if int(s.smtp_port) == 465:
            with smtplib.SMTP_SSL(s.smtp_host, int(s.smtp_port), timeout=20) as smtp:
                if s.smtp_user:
                    smtp.login(s.smtp_user, s.smtp_password)
                smtp.send_message(mensaje)
        else:
            with smtplib.SMTP(s.smtp_host, int(s.smtp_port), timeout=20) as smtp:
                smtp.ehlo()
                if s.smtp_tls:
                    smtp.starttls()
                    smtp.ehlo()
                if s.smtp_user:
                    smtp.login(s.smtp_user, s.smtp_password)
                smtp.send_message(mensaje)
        logger.info("[email] Correo enviado a %s: %s", destinatarios, asunto)
        return True
    except Exception as exc:
        logger.warning("[email] Error enviando correo '%s': %s", asunto, exc)
        return False
