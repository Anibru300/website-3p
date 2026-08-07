from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.dependencies import get_current_user
from app.auth.utils import create_access_token, verify_password
from app.config import get_settings
from app.database import users_connection

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with users_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, nombre, rol, hashed_password FROM users WHERE email = ? AND activo = 1",
            (form_data.username,),
        )
        user = cur.fetchone()

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "nombre": user["nombre"],
            "rol": user["rol"],
        },
    }


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return user
