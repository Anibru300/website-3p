# CIERRE 2026-09-09 — Separación de Plataforma y reestructura de carpetas

## Contexto

Se separó la plataforma privada (login, dashboard, cotizador, logística, administración)
del sitio web público. Antes convivían en un solo proyecto; ahora son dos repositorios
y dos carpetas independientes.

## Nueva estructura de carpetas

```
C:\Projects\PAGINA WEB 3P\
├── pagina web 3p\     → repo Anibru300/website-3p  (sitio público + backend api/)
└── plataforma 3p\     → repo Anibru300/plataforma  (app privada, GitHub Pages)
```

Antes la plataforma estaba en `C:\Projects\plataforma`; se movió dentro de esta carpeta
para tener todo junto. Todo lo que se movió: `api/`, `data/`, `docs/`, `scripts/`,
`dist/`, `.github/`, y los archivos sueltos del repo web.

## Cambios realizados hoy

### 1. Sitio web público (website-3p)
- Se quitaron todos los botones/enlaces que redirigían a la plataforma
  (`https://plataforma.3psadecv.com/login`) del header desktop y móvil.
- Las rutas viejas de la app privada ahora redirigen automáticamente a la plataforma.
- El sitio público ya no contiene nada de la parte privada.
- Commits de hoy: `4ea68ea` y `129d1ea` (ya pusheados a `master`).

### 2. Plataforma (plataforma)
- Repositorio `Anibru300/plataforma`, branch `main`, GitHub Pages activado.
- Dominio propio: `plataforma.3psadecv.com` (CNAME en el repo).
- Funciona por `http://` mientras GitHub provisiona el certificado HTTPS.

### 3. Backend (api/ dentro de website-3p)
- Los scripts `start-backend-hidden.ps1` y `restart-backend.ps1` ahora usan
  `.venv\Scripts\python.exe -m uvicorn` (el launcher `uvicorn.exe` quedó roto al
  mover el venv).
- Todas las rutas de los scripts `.ps1` actualizadas a
  `C:\Projects\PAGINA WEB 3P\pagina web 3p\...`.
- `api/.env` actualizado con la ruta nueva de `USERS_DB_PATH` (resuelve a
  `pagina web 3p\data\users.db`, verificado que existe).
- CORS acepta `http://plataforma.3psadecv.com` y `https://plataforma.3psadecv.com`
  (en `.env` y en `config.py`).
- Nuevo script `api/tools/update-task-paths.ps1` (en BOM/CRLF para PowerShell 5.1).

### 4. Tareas programadas de Windows (TODAS actualizadas, 4 OK)
| Tarea | Qué hace | Frecuencia |
|---|---|---|
| 3P-Website-Backend | Arranca uvicorn al iniciar sesión | Al logon |
| 3P-Website-Tunnel | Arranca cloudflared (api.3psadecv.com) | Al logon |
| 3P-Inventario-Snapshot-Diario | Guarda valor diario de inventario p/ la gráfica | Diaria |
| 3P-Sync-Excel | Sincroniza bases de datos Excel al API | Programada |

## Estado al cierre de hoy (verificado)

- Backend local: `http://localhost:8000/docs` → 200.
- API público: `https://api.3psadecv.com/docs` → 200, túnel Cloudflare activo.
- CORS: preflight desde `http://plataforma.3psadecv.com` → aceptado.
- Plataforma entra por `http://plataforma.3psadecv.com` y el login funciona.
- Postgres conecta; `data/users.db` existe en la ruta nueva.
- HTTPS de la plataforma: pendiente (GitHub provisionando cert Let's Encrypt).
  Hay una verificación automática cada 30 min; al aparecer el cert se activa
  "Enforce HTTPS" sola.

---

## Pendientes para mañana (2026-09-10)

### 1. Verificar conexión y actualización de bases de datos ⚠️ (lo más importante)

El movimiento de carpetas tocó todo lo que lee/escribe archivos con rutas absolutas.
Hay que confirmar que sigue funcionando:

- [ ] **Snapshot diario de inventario**: revisar que la tarea
      `3P-Inventario-Snapshot-Diario` corrió o forzarla
      (`schtasks /Run /TN "3P-Inventario-Snapshot-Diario"`) y confirmar que el
      snapshot de hoy se guardó en la base. Ver el dashboard de administración:
      la gráfica de valor de inventario debe mostrar el punto de hoy.
- [ ] **Sync de Excel** (`3P-Sync-Excel`): revisar `pagina web 3p\api\logs\sync.log`
      — debe tener entradas recientes sin errores de "ruta no encontrada"
      (la base vive en `Y:\1 - CONTROL DE ALMACEN\BASES DE DATOS\BD pedidos\
      pendientes por facturar.xlsx` — esa unidad Y: debe estar accesible).
- [ ] **Pedidos abiertos en la plataforma**: comparar contra el Excel de
      `pendientes por facturar.xlsx` — que los importes (pedido/surtido/pendiente)
      cuadren y no haya pedidos ya facturados que sigan apareciendo.
- [ ] **Usuarios/login**: probar entrar con un usuario distinto al admin y
      confirmar que lee `data\users.db` bien.
- [ ] **Cotizador**: generar una cotización de prueba y confirmar que guarda.
- [ ] Si algo falla por ruta, revisar `pagina web 3p\api\logs\backend.err` y
      `tunnel.err`, y buscar rutas viejas con:
      `grep -r "PAGINA WEB 3P\\\\\\\\api" --include="*.py" --include="*.ps1" --include="*.env" pagina\ web\ 3p`
      (no debe haber ninguna sin el `pagina web 3p` del medio).

### 2. HTTPS de la plataforma
- Si el certificado ya se provisionó, la plataforma queda en
  `https://plataforma.3psadecv.com` (enforce HTTPS ya activado por la tarea
  automática). Confirmar con el usuario que use https.
- Si sigue pendiente: seguir por `http://`, no introducir contraseñas por https
  forzado. GitHub puede tardar hasta 24 h.

### 3. Confirmar arranque automático
- Las 4 tareas quedaron con la ruta nueva, pero conviene verificar una vez:
      `(Get-ScheduledTask '3P-Website-Backend').Actions | fl Execute,Arguments`
  debe mostrar `C:\Projects\PAGINA WEB 3P\pagina web 3p\...` en todas.

### 4. Recordatorios para el usuario
- Cerrar y reabrir cualquier terminal vieja que tuviera el venv activado en la
  ruta anterior (la carpeta ya no existe y el venv se rompió; se usa
  `.venv\Scripts\python.exe` directamente).
- El backend se ejecuta como administrador; si hay que detenerlo:
  `Stop-Process -Name python -Force` y correr `schtasks /Run /TN "3P-Website-Backend"`.

## Comandos útiles

```powershell
# Estado del backend
curl.exe http://localhost:8000/docs

# Estado del túnel
curl.exe https://api.3psadecv.com/docs

# Reiniciar backend y túnel
schtasks /Run /TN "3P-Website-Backend"
schtasks /Run /TN "3P-Website-Tunnel"

# Forzar snapshot y sync
schtasks /Run /TN "3P-Inventario-Snapshot-Diario"
schtasks /Run /TN "3P-Sync-Excel"

# Logs
Get-Content "C:\Projects\PAGINA WEB 3P\pagina web 3p\api\logs\backend.err" -Tail 30
Get-Content "C:\Projects\PAGINA WEB 3P\pagina web 3p\api\logs\sync.log" -Tail 30

# Tests del API (154 tests)
cd "C:\Projects\PAGINA WEB 3P\pagina web 3p\api"
.venv\Scripts\python.exe -m pytest tests -q
```
