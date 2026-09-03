# Guía de fuentes de datos

**Última actualización:** 2026-09-03 (Fase 1 del plan de consolidación)
**Regla de oro:** los Excel son fuentes maestras operativas. El sistema **nunca** escribe
en ellos, solo lee. `BD_ALMACEN_3P.xlsx` (E1) es la base de almacén: **NO EDITARLA NUNCA,
solo consulta**, ni desde Excel ni desde ningún proceso del sistema.

---

## 1. Catálogo de fuentes

| ID | Fuente | Ruta | Hojas usadas | Alimenta | Actualizador | Ritmo | Estado monitoreado |
|----|--------|------|--------------|----------|--------------|-------|--------------------|
| E1 | BD_ALMACEN_3P.xlsx | `Y:/ALMACEN/Mejora Continua ALMACEN/Nuevo Control de Almacen/BASE DE DATOS/` | VALES, DETALLE_VALES, FOTOS_PRODUCTOS | Vales, fotos (dashboard) | Almacén | Diario | Cada hora (vigilante) |
| E2 | BD pedidos pendientes por facturar.xlsx | `Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/` | PEDIDOS, DETALLE_PEDIDOS | Pedidos abiertos | Ventas/Almacén | Diario | Cada hora |
| E3 | VENTAS_FACTURACION_BASE.xlsx | `Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/` | Seguimiento_Documental (headers fila 4) | Historial de ventas | Ventas | Diario | Cada hora |
| E4 | COTIZADOR 2.0.xlsm | `Y:/COTIZACIONES/1. COTIZADOR/` | FIRMAS | Cotizador (vendedores) | Ventas | Raro | Cada hora |
| E5 | SAN_ANTONIO_SEGUIMIENTO.xlsx | `C:/Users/Ventas-3P/Desktop/SAN ANTONIO/` | OC_CABECERA, OC_PARTIDAS | Sección San Antonio | Proyecto S.A. | Semanal | Cada hora |
| E6 | Excel CRM | `Y:/CRM´S/` (con acento) | varias | CRM (import a SQLite) | Ventas | Bajo | Manual (script) |
| S1 | PostgreSQL `cj_assistant` | localhost | sae_existencias, sae_productos, sae_almacenes, sae_movimientos_inventario | Existencias, valor de inventario, movimientos | ETL externo (usuario) | Según ETL | Cada hora |
| L1 | SQLite `data/users.db` | raíz del repo | users, login_attempts, analytics_events, alertas_enviadas, crm_* | Login, analytics, alertas, CRM | El sistema | Continuo | Backup diario |
| L2 | SQLite `data/cotizaciones.db` | raíz del repo | cotizaciones guardadas | Cotizaciones de clientes | El sistema | Continuo | Backup diario |
| L3 | SQLite `data/inventario_historico.db` | raíz del repo | snapshots valor inventario | Gráfica histórica | Endpoint snapshot | Diario (programar) | Backup diario |

> La BD SQLite activa es SIEMPRE la de `data/` en la raíz (se resuelve desde
> `users_db_path`). Si ves `api/data/`, es residuo: el 2026-09-03 se renombró a
> `api/data_respaldo-2026-09-03/` y su contenido quedó respaldado en
> `data/backups/2026-09-03/`.

---

## 2. Cómo se monitorea (Fase 1)

- **`GET /health/datos`** (sin auth): estado de cada fuente Excel (existe, mtime,
  edad en horas, tamaño, filas, validación de hojas/columnas) y frescura del espejo SAE.
  Estados posibles: `ok`, `inaccesible`, `vacio`, `esquema_invalido`.
- **Vigilante de alertas** (`app/analytics/alertas.py`): cada hora evalúa las fuentes.
  Si una crítica (E1, E2, E3) está inaccesible, con esquema inválido o más vieja que su
  umbral (`MAX_AGE_HORAS` en `app/services/fuentes.py`), genera alerta `fuentes_datos`
  visible en `GET /api/analytics/alertas/avanzadas` (admin). Con SMTP configurado
  también envía correo (dedupe 24 h).
- **Umbrales de antigüedad actuales:** vales 24 h · pedidos 48 h · ventas 72 h ·
  San Antonio 8 días · cotizador sin umbral.

## 3. Qué hacer cuando una fuente falla

1. Abrir `https://api.3psadecv.com/health/datos` (o `http://localhost:8000/health/datos`)
   y ver el `detalle` de la fuente en rojo.
2. Casos:
   - `inaccesible` → verificar que la unidad `Y:` esté montada en el servidor y que el
     archivo siga en la ruta indicada (¿lo movieron?).
   - `esquema_invalido` → el detalle dice qué hoja o columna falta; alguien renombró
     algo en el Excel. Corregir el nombre **en el Excel** a como estaba.
   - `desactualizada` (alerta) → normalmente significa que el área no ha capturado;
     si lleva muchos días, confirmar con almacén/ventas que el archivo siga en uso.

## 4. Respaldos

- **Comando:** `cd api && .venv/Scripts/python.exe tools/backup_sqlite.py`
- Copia las 3 SQLite a `data/backups/YYYY-MM-DD/` (verifica integridad antes y después).
- Retención: 30 días (borra carpetas más viejas). Cambiar con `--retencion N`.
- **Recomendado:** tarea programada diaria de Windows (Task Scheduler) con el comando
  de arriba, idealmente a una hora en que nadie esté usando el sistema.
- Los respaldos **no** incluyen los Excel (viven en `Y:`; su respaldo es
  responsabilidad del servidor de archivos).

## 5. Comandos útiles

```bash
# Tests
cd api && .venv/Scripts/python.exe -m pytest tests/ -q

# Estado de fuentes (backend corriendo)
curl http://localhost:8000/health/datos

# Respaldo manual
cd api && .venv/Scripts/python.exe tools/backup_sqlite.py

# Importar CRM desde Excel (manual; OJO: sobrescribe cambios hechos en el panel — Fase 3 lo corrige)
cd api && .venv/Scripts/python.exe scripts/importar_crm_excel.py

# Sync manual de vales/pedidos a tablas sync_*
cd api && .venv/Scripts/python.exe -m app.sync.job

# Validar que sync_* es idéntico al Excel directo (antes de activar el flag)
cd api && .venv/Scripts/python.exe tools/validar_sync.py
```

## 6. Sync Excel → SQLite (Fase 2)

- **Fuentes:** E1 vales (cada 30 min) y E2 pedidos. E3/E4/E5 siguen en lectura en vivo.
- **Flag:** `USE_SYNC_TABLES` en `api/.env`. `true` = los getters leen las tablas
  `sync_*`; `false` = lectura en vivo del Excel (rollback inmediato).
- **Solo lectura:** el job copia el Excel a `data/cache/` y lee la copia
  (`read_only`, nunca `save`). BD_ALMACEN_3P nunca se escribe.
- **Tablas:** `sync_sheets` (hojas como JSON), `sync_log` (bitácora ok/error).
- **Panel:** Admin → **Fuentes** muestra el último sync por fuente y permite forzarlo
  (`GET/POST /api/admin/fuente-sync`).
- **Alertas:** con el flag activo, sync fallido o con >24 h sin éxito aparece en la
  alerta `fuentes_datos` (vigilante horario, panel de alertas).
- **Tarea programada:** cada 30 min (comando `app.sync.job`), verificable en `sync_log`.

## 6. Riesgos conocidos y estado

| Riesgo | Mitigación actual | Fase que lo resuelve |
|--------|-------------------|----------------------|
| Fallo silencioso (R1) | `/health/datos` + alerta `fuentes_datos` | ✅ Fase 1 |
| Renombre de hojas/columnas (R3) | Validación de esquema en `/health/datos` | ✅ Fase 1 (detección); Fase 2 (resiliencia) |
| Doble copia de SQLite (R7) | `api/data/` renombrada con respaldo | ✅ Fase 1 |
| Sin respaldos (R10) | `backup_sqlite.py` + schedule recomendado | ✅ Fase 1 |
| Dependencia de red en vivo (R2) | Sync programado E1/E2 + flag `USE_SYNC_TABLES` | ✅ Fase 2 |
| Conflicto CRM bidireccional (R6) | Detectado (latente: sin ediciones en panel al 2026-09-03) | Fase 3 (import solo-altas) |
| Snapshots históricos con huecos (R9) | Detectado | Fase 3 (schedule diario) |
| Rutas al puesto Ventas-3P (R12) | Detectado (E5) | Fase 2/3 (mover a red) |

> **Nota 2026-09-03:** la tabla `sae_movimientos_inventario` del espejo SAE lleva
> sin sincronizar desde el 2026-07-17 (mientras `sae_existencias` sí está al día).
> La sección Movimientos del dashboard puede estar desactualizada — revisar el ETL.
