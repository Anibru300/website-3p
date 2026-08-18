import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.auth.utils import decode_access_token
from app.database import users_connection

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _validate_user_from_payload(payload: dict | None) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if payload is None:
        raise credentials_exception

    email = payload.get("sub")
    if email is None:
        raise credentials_exception

    with users_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, nombre, rol FROM users WHERE email = ? AND activo = 1",
            (email,),
        )
        user = cur.fetchone()

    if user is None:
        raise credentials_exception

    return dict(user)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    if not token:
        logger.warning("[auth] Peticion sin token")
    payload = decode_access_token(token)
    if payload is None:
        logger.warning("[auth] Token invalido o expirado")
    return _validate_user_from_payload(payload)


def get_current_user_from_token(token: str) -> dict:
    payload = decode_access_token(token)
    return _validate_user_from_payload(payload)
