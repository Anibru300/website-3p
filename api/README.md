# CJ_OS Core API (backend local del portal 3P)

Backend FastAPI que alimenta el área privada `/dashboard` del sitio web de 3P.

## Responsabilidad

- Leer información operativa desde **PostgreSQL `cj_assistant`** (datos replicados desde SAE).
- Leer el Excel maestro de **San Antonio** en modo **solo lectura**.
- **Nunca** tocar archivos originales de SAE ni Excel originales.
- Gestionar usuarios del portal con contraseñas hasheadas (bcrypt).
- Emitir tokens JWT para sesiones seguras.

## Requisitos

- Python 3.10+
- PostgreSQL con la base `cj_assistant` actualizada desde los backups de SAE.
- Excel `SAN_ANTONIO_SEGUIMIENTO.xlsx` en la ruta configurada.

## Instalación

```bash
cd api
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
```

## Configuración

```bash
cp .env.example .env
```

Edita `.env` con las credenciales reales de PostgreSQL y la ruta del Excel.

## Crear usuario administrador

```bash
cd api
.venv/Scripts/python scripts/create_admin.py
```

El script pedirá la contraseña de forma interactiva. Por defecto crea el usuario:

- Email: `trespsadecv@hotmail.com`
- Nombre: `Administrador 3P`
- Rol: `admin`

También puedes usar variables de entorno (útil para automatizar):

```powershell
$env:AUTH_EMAIL="trespsadecv@hotmail.com"
$env:AUTH_NAME="Administrador 3P"
$env:AUTH_PASSWORD="Lumina38"
.venv/Scripts/python scripts/create_admin.py
```

> **Nunca guardes la contraseña en archivos que se suban a Git.**

## Ejecutar el servidor

Se recomienda usar **PowerShell** o **cmd** en Windows para evitar problemas con el directorio de trabajo:

```powershell
cd api
.venv/Scripts/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

En Git Bash el manejo de procesos en segundo plano puede ser inconsistente.

El backend estará disponible en `http://localhost:8000`.

## Probar

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=trespsadecv@hotmail.com&password=Lumina38"
```

## Documentación de endpoints

Una vez corriendo, visita:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

El contrato completo esperado por el frontend está en `docs/guias/API-CJ-OS-CORE.md`.

## Conexión con backups de SAE

La web siempre lee el último estado disponible en PostgreSQL. La actualización corre por los scripts de CJ_OS (`modules/almacen/sync_sae_inventario.py`, `modules/ventas/sync_sae_ventas.py`, etc.). La API no dispara ETLs.

## Despliegue

Este backend está pensado para correr en la computadora/servidor local de 3P. El frontend en GitHub Pages se conectará a la URL donde corra esta API. Para acceso remoto seguro se recomienda:

- **Cloudflare Tunnel** (gratuito, fácil, no requiere IP pública).
- Un VPS con dominio propio (`api.3psadecv.com`).

