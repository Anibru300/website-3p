#!/usr/bin/env python3
"""
Crea o actualiza el usuario administrador del portal 3P.

Uso recomendado (la contraseña se lee del entorno, no queda en historial):
    set AUTH_PASSWORD=Lumina38
    python api/scripts/create_admin.py

O de forma interactiva:
    python api/scripts/create_admin.py

No incluyas contraseñas en el código ni en el repositorio.
"""

import os
import sys
from getpass import getpass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth.utils import get_password_hash
from app.database import users_connection

DEFAULT_EMAIL = "trespsadecv@hotmail.com"
DEFAULT_NAME = "Administrador 3P"
DEFAULT_ROL = "admin"


def main():
    email = os.getenv("AUTH_EMAIL", DEFAULT_EMAIL).strip() or DEFAULT_EMAIL
    nombre = os.getenv("AUTH_NAME", DEFAULT_NAME).strip() or DEFAULT_NAME
    rol = os.getenv("AUTH_ROL", DEFAULT_ROL).strip() or DEFAULT_ROL
    password = os.getenv("AUTH_PASSWORD", "").strip()

    if not password:
        password = getpass(f"Contraseña para {email}: ")
        if not password:
            print("Error: la contraseña no puede estar vacía.")
            sys.exit(1)
        confirm = getpass("Confirma la contraseña: ")
        if password != confirm:
            print("Error: las contraseñas no coinciden.")
            sys.exit(1)

    hashed = get_password_hash(password)

    with users_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO users (email, hashed_password, nombre, rol, activo)
            VALUES (?, ?, ?, ?, 1)
            ON CONFLICT(email) DO UPDATE SET
                hashed_password = excluded.hashed_password,
                nombre = excluded.nombre,
                rol = excluded.rol,
                activo = 1
            """,
            (email, hashed, nombre, rol),
        )
        conn.commit()

    print(f"Usuario '{email}' creado/actualizado correctamente.")


if __name__ == "__main__":
    main()
