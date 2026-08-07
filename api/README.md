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
curl -X POST http://localhost:8000/api/auth/login \
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

## Despliegue a producción

Este backend está pensado para correr en la computadora/servidor local de 3P, donde ya están PostgreSQL y el Excel de San Antonio. El frontend en GitHub Pages se conectará a la URL pública del backend.

### Opción recomendada: Cloudflare Tunnel

Ventajas:
- Gratuito.
- No requiere IP pública ni abrir puertos del router.
- HTTPS con tu propio dominio (`api.3psadecv.com`).
- Seguro.

Requisitos:
- Cuenta en Cloudflare.
- Dominio `3psadecv.com` apuntando a los DNS de Cloudflare.

### Pasos

1. Configura `api/.env` con las credenciales reales de PostgreSQL.
2. Crea el usuario admin (si aún no existe):

```powershell
cd api
$env:AUTH_EMAIL="trespsadecv@hotmail.com"
$env:AUTH_PASSWORD="Lumina38"
.venv/Scripts/python scripts/create_admin.py
```

3. Configura el túnel (una sola vez):

```powershell
cd api/tools
.\setup-cloudflare-tunnel.ps1
```

El script descargará `cloudflared.exe` automáticamente, abrirá el navegador para autenticar con Cloudflare y creará el túnel apuntando a `api.3psadecv.com`.

4. Inicia el backend y el túnel:

```powershell
cd api/tools
.\start-production.ps1
```

5. Configura la variable `VITE_API_BASE_URL` en GitHub:
   - Ve a **Settings > Secrets and variables > Actions > Variables**.
   - Crea `VITE_API_BASE_URL` con valor `https://api.3psadecv.com`.
   - Haz push a `master` para recompilar el frontend.

### Alternativa: VPS

Si prefieres un VPS, debes migrar también PostgreSQL (`cj_assistant`) y el Excel de San Antonio al servidor, o configurar una VPN para que el VPS acceda a los datos locales.

