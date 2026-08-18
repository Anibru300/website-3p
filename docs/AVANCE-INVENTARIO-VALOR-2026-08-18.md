# Avance: Historial de valor del inventario — 18 de agosto de 2026

## ✅ Estado actual

Se implementó una nueva pestaña en el dashboard para ver la evolución histórica del valor del inventario como gráfica de líneas.

### Backend
- Tabla SQLite: `inventario_valor_historico` en `api/app/data/inventario_historico.db`.
- Endpoint `POST /api/inventario/valor-historico/snapshot`: calcula y guarda el valor actual del inventario (total + por almacén).
- Endpoint `GET /api/inventario/valor-historico`: devuelve la serie histórica.
- Autenticación dual: JWT de usuario o `X-Service-Token` para scripts.
- Valor calculado como `SUM(exist * costo_promedio)` en MXN.

### Frontend
- Nueva pestaña **"Valor de inventario"** en `DashboardPage.jsx`.
- Gráfica SVG de líneas: total + cada almacén.
- KPIs: valor actual, cambio vs día anterior, días registrados.
- Selector de rango de fechas.
- Botón "Guardar snapshot hoy".
- Respaldo automático: al abrir la pestaña, si no hay snapshot del día, se genera.

### Automatización
- Script: `scripts/inventario-snapshot-daily.ps1`.
- Tarea programada: `3P-Inventario-Snapshot-Diario` configurada con dos triggers:
  - Al iniciar sesión (con 2 minutos de delay para esperar al backend).
  - Diariamente a las 08:00 a.m.
- Script usa `http://localhost:8000` por defecto (se ejecuta en la misma computadora del backend).
- Script espera a que la API responda (máx. 5 min) y reintenta 3 veces.

## ✅ Configuración completada

1. **`SERVICE_TOKEN` ya está en `api/.env`.**
2. **Backend y túnel se reiniciaron y responden.**
3. **Tarea de snapshot probada manualmente y funcionando.**

## 🔧 Correcciones aplicadas tras el reinicio

- `scripts/inventario-snapshot-daily.ps1`:
  - Se corrigió `Join-Path` para PowerShell 5.1 (anidando rutas).
  - Se cambió la URL por defecto a `http://localhost:8000`.
- `api/tools/register-autostart.ps1`:
  - Se agregó delay de 1 minuto al inicio de sesión para backend y túnel.
  - Se agregó `-MultipleInstances IgnoreNew` para evitar duplicados.

## 📁 Archivos modificados/creados

- `api/app/inventario/router.py` — endpoints y tabla SQLite.
- `api/app/auth/dependencies.py` — helper para validar token directamente.
- `api/app/config.py` — agregó `service_token`.
- `api/.env.example` — documentó `SERVICE_TOKEN`.
- `scripts/inventario-snapshot-daily.ps1` — script de snapshot.
- `src/utils/api.js` — helpers frontend.
- `src/pages/DashboardPage.jsx` — pestaña y gráfica.
- `docs/AVANCE-INVENTARIO-VALOR-2026-08-18.md` — este documento.

## 🔍 Pruebas realizadas

- Build frontend exitoso: `npm run build`.
- Snapshot local guardó 15 registros (1 total + 14 almacenes).
- Endpoint GET devuelve datos correctamente.
- Re-escritura de snapshot no duplica registros (`ON CONFLICT`).
- Tarea programada `3P-Inventario-Snapshot-Diario` ejecutada manualmente con resultado `0`.
- Backend y túnel respondiendo tras reinicio manual:
  - `http://localhost:8000/health` → `{"status":"ok"}`
  - `https://api.3psadecv.com/health` → `200`

## 📝 Notas para siguiente sesión

- El próximo reinicio confirmará si backend, túnel y snapshot se levantan solos con los delays configurados.
- Revisar log del snapshot en `api/logs/inventario-snapshot.log` después del próximo encendido.
- Considerar agregar más indicadores (por ejemplo, valorización en USD) si se requiere en el futuro.
