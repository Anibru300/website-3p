import base64
import io
import logging
from datetime import timedelta

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.auth.dependencies import get_current_user, require_admin
from app.auth.security import (
    increment_failed_login,
    is_account_blocked,
    is_ip_blocked,
    record_login_attempt,
    reset_account_lockout,
)
from app.auth.utils import create_access_token, verify_password
from app.config import get_settings
from app.database import users_connection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["auth"])


class TotpVerifyRequest(BaseModel):
    email: str
    temp_token: str
    code: str


class TotpSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    qr_base64: str


class TotpEnableRequest(BaseModel):
    code: str


class LoginResponse(BaseModel):
    access_token: str | None = None
    token_type: str = "bearer"
    requires_totp: bool = False
    temp_token: str | None = None
    user: dict | None = None


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _create_temp_token(email: str) -> str:
    """Token de corta duración para el flujo de 2FA."""
    return create_access_token(
        data={"sub": email, "totp_step": True},
        expires_delta=timedelta(minutes=5),
    )


def _verify_temp_token(token: str) -> str | None:
    from app.auth.utils import decode_access_token

    payload = decode_access_token(token)
    if not payload:
        return None
    if not payload.get("totp_step"):
        return None
    return payload.get("sub")


@router.post("/auth/login", response_model=LoginResponse)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    ip = _get_client_ip(request)
    email = form_data.username.lower().strip()

    # Rate limiting por IP
    if is_ip_blocked(ip):
        logger.warning("[auth] IP bloqueada por intentos fallidos: %s", ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos fallidos. Intenta más tarde.",
        )

    # Bloqueo de cuenta
    bloqueado, hasta = is_account_blocked(email)
    if bloqueado:
        logger.warning("[auth] Cuenta bloqueada: %s", email)
        msg = "Cuenta bloqueada temporalmente por intentos fallidos."
        if hasta:
            msg += f" Intenta después de {hasta.strftime('%H:%M')}."
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=msg,
        )

    with users_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, nombre, rol, hashed_password, totp_enabled FROM users WHERE email = ? AND activo = 1",
            (email,),
        )
        user = cur.fetchone()

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        record_login_attempt(ip, email, False)
        increment_failed_login(email)
        remaining = 10 - user["intentos_fallidos"] - 1 if user else 10
        logger.warning("[auth] Login fallido para %s desde %s", email, ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Credenciales incorrectas. Intentos restantes: {max(0, remaining)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Credenciales correctas
    record_login_attempt(ip, email, True)
    reset_account_lockout(email)

    # Si tiene 2FA habilitado, devolver token temporal
    if user["totp_enabled"]:
        return LoginResponse(
            requires_totp=True,
            temp_token=_create_temp_token(email),
            user={"id": user["id"], "email": user["email"], "nombre": user["nombre"], "rol": user["rol"]},
        )

    # Sin 2FA, generar token final
    remember = form_data.scopes and "remember" in form_data.scopes
    settings = get_settings()
    expire_minutes = 30 * 24 * 60 if remember else settings.access_token_expire_minutes
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=expire_minutes),
    )

    return LoginResponse(
        access_token=access_token,
        user={"id": user["id"], "email": user["email"], "nombre": user["nombre"], "rol": user["rol"]},
    )


@router.post("/auth/verify-totp", response_model=LoginResponse)
def verify_totp(payload: TotpVerifyRequest):
    email = _verify_temp_token(payload.temp_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión de verificación inválida o expirada.",
        )

    with users_connection() as conn:
        user = conn.execute(
            "SELECT id, email, nombre, rol, totp_secret, totp_enabled FROM users WHERE email = ? AND activo = 1",
            (email,),
        ).fetchone()

    if not user or not user["totp_enabled"] or not user["totp_secret"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA no configurado para este usuario.",
        )

    totp = pyotp.TOTP(user["totp_secret"])
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de verificación incorrecto.",
        )

    settings = get_settings()
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return LoginResponse(
        access_token=access_token,
        user={"id": user["id"], "email": user["email"], "nombre": user["nombre"], "rol": user["rol"]},
    )


@router.post("/auth/totp/setup", response_model=TotpSetupResponse)
def setup_totp(user: dict = Depends(require_admin)):
    """Genera un secreto TOTP y QR para configurar 2FA. No habilita aún."""
    secret = pyotp.random_base32()
    issuer = "3P Admin"
    provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user["email"], issuer_name=issuer
    )

    qr = qrcode.make(provisioning_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return TotpSetupResponse(
        secret=secret,
        provisioning_uri=provisioning_uri,
        qr_base64=f"data:image/png;base64,{qr_base64}",
    )


@router.post("/auth/totp/enable")
def enable_totp(payload: TotpEnableRequest, user: dict = Depends(require_admin)):
    """Habilita 2FA validando el código generado con el secreto proporcionado."""
    # El secreto se envía en el mismo request para simplificar el flujo del frontend.
    # En producción se podría guardar en sesión temporal.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Usa /auth/totp/setup y luego /auth/totp/enable-with-secret",
    )


class TotpEnableWithSecretRequest(BaseModel):
    secret: str
    code: str


@router.post("/auth/totp/enable-with-secret")
def enable_totp_with_secret(payload: TotpEnableWithSecretRequest, user: dict = Depends(require_admin)):
    totp = pyotp.TOTP(payload.secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación incorrecto.",
        )

    with users_connection() as conn:
        conn.execute(
            "UPDATE users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?",
            (payload.secret, user["id"]),
        )
        conn.commit()

    return {"detail": "2FA habilitado correctamente"}


@router.post("/auth/totp/disable")
def disable_totp(user: dict = Depends(require_admin)):
    with users_connection() as conn:
        conn.execute(
            "UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?",
            (user["id"],),
        )
        conn.commit()
    return {"detail": "2FA deshabilitado correctamente"}


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return user
