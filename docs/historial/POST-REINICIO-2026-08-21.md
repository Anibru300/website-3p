# Post-reinicio — 21 de agosto de 2026

## ✅ Qué se hizo antes del reinicio

1. **Migración del proyecto**
   - Se copió el proyecto desde `G:\Mi unidad\pagina web\3p-website` a `C:\Projects\PAGINA WEB 3P`.
   - Se excluyeron `node_modules/`, `api/.venv/`, `dist/` y cachés; se reconstruyeron en la nueva ubicación.
   - Se actualizaron las rutas hardcodeadas en scripts de PowerShell, Python y guías.

2. **Dependencias**
   - `npm install` en `C:\Projects\PAGINA WEB 3P`.
   - Nuevo entorno virtual Python en `C:\Projects\PAGINA WEB 3P\api\.venv`.
   - Se instaló `requirements.txt`.
   - **Pendiente:** agregar `reportlab` a `api/requirements.txt` (se instaló manualmente porque faltaba).

3. **Tareas programadas actualizadas**
   - `3P-Website-Backend` → `C:\Projects\PAGINA WEB 3P\api\tools\start-backend-hidden.ps1`
   - `3P-Website-Tunnel` → `C:\Projects\PAGINA WEB 3P\api\tools\start-tunnel-hidden.ps1`
   - `3P-Morning-Apps` → `C:\Projects\PAGINA WEB 3P\api\tools\start-morning-apps.ps1`
   - `3P-Inventario-Snapshot-Diario` → `C:\Projects\PAGINA WEB 3P\scripts\inventario-snapshot-daily.ps1`

4. **Pruebas exitosas**
   - Backend local: `http://localhost:8000/health` → OK.
   - API pública: `https://api.3psadecv.com/health` → 200.
   - Sitio web: `https://3psadecv.com/` → 200.
   - Guardado de cotización de prueba y generación de PDF desde C: → OK.
   - Build y deploy a GitHub Pages desde C: → OK.

5. **GitHub**
   - Se subieron dos commits con las actualizaciones de rutas y la documentación.

## 🔄 Después del reinicio

### Paso 1 — Verificar arranque automático
Esperar 2-3 minutos después de iniciar sesión (las tareas tienen delay) y verificar:

```powershell
# Ver procesos
tasklist | findstr uvicorn
tasklist | findstr cloudflared

# Verificar rutas (deben mostrar C:\Projects\PAGINA WEB 3P)
Get-Process uvicorn,cloudflared | Select-Object Name, Path
```

### Paso 2 — Verificar sitio y API
```powershell
curl https://api.3psadecv.com/health
curl https://3psadecv.com/
```

### Paso 3 — Liberar espacio de Google Drive
La carpeta antigua no se pudo renombrar porque `GoogleDriveFS.exe` la tiene en uso. Después del reinicio:

1. Cerrar Google Drive (icono en la bandeja del sistema → Salir).
2. Renombrar o eliminar:
   ```
   G:\Mi unidad\pagina web\3p-website
   ```
   Sugerencia: primero renombrar a `3p-website-ELIMINAR` y, si todo sigue funcionando después de unos días, borrarla definitivamente.
3. Volver a abrir Google Drive si se necesita.

### Paso 4 — Pendiente técnico
Agregar `reportlab` al archivo `C:\Projects\PAGINA WEB 3P\api\requirements.txt` para que futuras instalaciones del entorno virtual no requieran instalarlo manualmente.

## 🚀 Siguiente gran tarea
**Acomodar las fotos y armar los catálogos de la página web.**
- Revisar las fotos disponibles en `C:\Projects\PAGINA WEB 3P\public\images`, `images/` y `CATALOGO AUTORIZADO PARA PAGINA WEB/`.
- Mapear productos/categorías con sus imágenes.
- Actualizar las secciones/catálogos del sitio (componentes React en `src/components/product/` y `src/pages/`).
- Hacer build y deploy.
