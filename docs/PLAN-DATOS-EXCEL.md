# Plan de consolidación de datos Excel ↔ Sitio web

**Fecha:** 2026-09-03
**Estado:** propuesta para revisión
**Alcance:** fuentes de datos actuales, riesgos, arquitectura objetivo y plan por fases.

---

## 1. Mapa verificado de fuentes de datos

Lo siguiente fue confirmado leyendo el código (`api/app/config.py`, `api/app/services/excel.py`,
`api/app/*/router.py`, `api/scripts/importar_crm_excel.py`). No hay suposiciones.

### 1.1 Excel leídos EN VIVO por el backend (sin importación intermedia)

El backend abre los archivos directamente desde sus rutas en cada petición (o con caché corta):

| # | Archivo | Hojas que usa | Alimenta qué sección | Quién lo actualiza en la operación |
|---|---------|---------------|----------------------|------------------------------------|
| E1 | `Y:/ALMACEN/Mejora Continua ALMACEN/Nuevo Control de Almacen/BASE DE DATOS/BD_ALMACEN_3P.xlsx` | `VALES`, `DETALLE_VALES`, `FOTOS_PRODUCTOS` | Material en vales, Vales abiertos, fotos de productos (dashboard) | Almacén |
| E2 | `Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/BD pedidos pendientes por facturar.xlsx` | `PEDIDOS`, `DETALLE_PEDIDOS` | Pedidos abiertos (dashboard) | Ventas/Almacén |
| E3 | `Y:/1 - CONTROL DE ALMACEN/BASES DE DATOS/VENTAS_FACTURACION_BASE.xlsx` | `Seguimiento_Documental` | Historial de ventas (dashboard) | Ventas |
| E4 | `Y:/COTIZACIONES/1. COTIZADOR/2. COTIZADOR 2.0.xlsm` | (vendedores/firmas) | Cotizador público | Ventas |
| E5 | `C:/Users/Ventas-3P/Desktop/SAN ANTONIO/SAN_ANTONIO_SEGUIMIENTO.xlsx` | (órdenes) | Sección San Antonio (dashboard) | Proyecto San Antonio |

**E1 es LA BASE SAGRADA: prohibido editarla. Solo consulta.** El código ya la abre
siempre en modo solo-lectura (`read_only=True, data_only=True`) y nunca la escribe;
la regla además es operativa de almacén.

### 1.2 Excel importados a SQLite por script (manual, reejecutable)

| # | Origen | Destino | Script |
|---|--------|---------|--------|
| E6 | `Y:/CRM'S/*.xls*` (clientes, granjas, domicilios, paqueterías, portales, contactos, descuentos) | `data/users.db` → tablas `crm_*` | `api/scripts/importar_crm_excel.py` |

El script hace matching por nombre normalizado y "actualiza si ya existe" — este detalle
es un riesgo (ver R6).

### 1.3 Fuentes que NO son Excel (naturales del sistema)

| Fuente | Contenido | Cómo se actualiza |
|--------|-----------|-------------------|
| PostgreSQL `cj_assistant` (localhost) | Espejo de tablas SAE: `sae_existencias`, `sae_productos`, `sae_almacenes`, `sae_movimientos_inventario` | **ETL externo a este repo** (pendiente confirmar quién y cada cuándo) |
| `data/users.db` (SQLite, activa) | Usuarios/login, `login_attempts`, `analytics_events`, `alertas_enviadas`, CRM importado | El sistema + script de CRM |
| `api/data/cotizaciones.db` | Cotizaciones guardadas por clientes desde el cotizador | El sistema (generada automáticamente) |
| `api/data/inventario_historico.db` | Snapshots de valor de inventario | Endpoint `POST /api/inventario/valor-historico/snapshot` — **no hay job programado** |

> ⚠️ Existen dos copias físicas de las SQLite: `data/` (raíz, **es la activa** porque el
> servicio corre con cwd en la raíz) y `api/data/` (residuo). Riesgo de confusión (R7).

---

## 2. Riesgos actuales (todos verificados en código)

- **R1 — Fallo silencioso.** Si un Excel no existe, está corrupto o la unidad `Y:` no está
  montada, los endpoints devuelven listas vacías con HTTP 200. El dashboard muestra ceros
  y nadie se entera. (`excel.py`: `except Exception: return [], []`).
- **R2 — Dependencia de red en el runtime.** El servicio del backend no puede responder
  vales/pedidos si el servidor de archivos de `Y:` cae, aunque todo lo demás esté bien.
- **R3 — Acoplamiento a nombres exactos.** Si alguien renombra la hoja `DETALLE_VALES`,
  mueve una columna o cambia encabezados, esa sección deja de funcionar sin error claro.
- **R4 — Excel abierto en edición.** Si otro usuario tiene el archivo abierto en Excel en
  la red, la lectura puede fallar o ser inconsistente.
- **R5 — E1 es doblemente crítica.** Es la base sagrada (no editar) Y es fuente en vivo de
  vales y fotos. Una reestructura de carpetas en ALMACEN tumba esas secciones sin aviso.
- **R6 — Conflicto bidireccional del CRM.** El panel admin edita `crm_*` en SQLite, pero
  re-correr `importar_crm_excel.py` **sobrescribe esos cambios** con lo del Excel.
  No está definida la fuente de verdad.
- **R7 — Dos copias de las SQLite.** `api/data/users.db` no tiene las tablas nuevas
  (ej. `login_attempts`); editar o respaldar la copia equivocada pierde datos.
- **R8 — Sin monitoreo de frescura.** No hay forma de saber si "los datos de hoy" son de hoy.
- **R9 — Snapshots históricos sin schedule.** La serie de valor de inventario tiene huecos
  porque nadie dispara el snapshot de forma programada.
- **R10 — Sin respaldos documentados.** Usuarios, analytics y cotizaciones (SQLite) se
  perderían en un incidente de disco.
- **R11 — Rendimiento.** Vales se re-lee completo en cada petición; archivo grande en red = latencia.
- **R12 — Rutas hardcodeadas al puesto `Ventas-3P`.** Especialmente E5 (Escritorio local):
  si el servicio corre bajo otro usuario, esa ruta no existirá.

---

## 3. Arquitectura objetivo (cómo debería funcionar)

**Principio:** los Excel son fuentes maestras operativas (que almacén/ventas controlan);
SQLite/Postgres es la capa de servicio del sitio. El sitio **no debería depender en vivo
de la red** para mostrar datos.

1. **Snapshot programado (sync):** una tarea de Windows Task Scheduler (ya usan ese patrón
   en `api/tools/`) copia/importa los Excel críticos a SQLite cada N minutos, con:
   - validación de esquema (hojas y columnas esperadas presentes),
   - registro de `fuente / último mtime detectado / última sync / filas leídas / estado`,
   - nunca escritura hacia el Excel (regla de oro, especialmente E1).
2. **El backend lee SQLite**, no el Excel. El Excel abierto o la red caída ya no tumban el sitio.
3. **Panel "Estado de datos"** en el admin: una tarjeta por fuente con frescura y estado,
   más alerta por correo si una fuente crítica lleva más de X horas sin actualizarse o es
   inaccesible (reusa `app/services/email.py`, pendiente configurar SMTP).
4. **Respaldo automático diario** de las 3 SQLite a carpeta versionada con retención (p. ej. 30 días).
5. **Fuente de verdad única por dominio:**
   - Operativo (vales, pedidos, ventas, existencias): los Excel/SAE mandan → sitio solo lee.
   - CRM: elegir UNA. Recomendación: el **panel admin (SQLite) es la fuente de verdad** y el
     import de Excel pasa a modo "solo altas nuevas" (no pisa lo editado en panel). Alternativa:
     seguir con Excel como maestra y el panel de solo lectura. Decidir en Fase 3.
   - Nativos (usuarios, analytics, cotizaciones): viven solo en SQLite, con respaldo.

---

## 4. Frecuencias propuestas (a confirmar con operación)

| Fuente | Ritmo real de cambio (estimado) | Propuesta de sync |
|--------|--------------------------------|-------------------|
| E1 Vales (BD_ALMACEN) | Varias veces al día (almacén) | Cada 30 min |
| E2 Pedidos por facturar | Al facturar / capturar pedido | Cada 1 h |
| E3 Ventas facturación | Diario (acumulativo) | Diario (la caché actual de 30 min ya amortigua) |
| Espejo SAE (existencias) | Depende del ETL externo | Verificar frecuencia real; las alertas de stock serán tan buenas como esa frecuencia |
| E4 Cotizador (vendedores) | Raro (altas de vendedor) | Bajo demanda |
| E6 CRM | Bajo | Semanal o bajo demanda (según decisión de fuente de verdad) |
| E5 San Antonio | Según proyecto | Semanal o bajo demanda |
| Snapshot valor de inventario | — | Diario, hora fija (vía Task Scheduler + service_token) |
| Respaldo SQLite | — | Diario |

---

## 5. Plan por fases

### Fase 0 — Inventario y confirmaciones (1 sesión, sin código)
- Llenar la columna "quién/cada cuándo" de la tabla 1.1 con los responsables reales.
- Confirmar: ¿quién mantiene el espejo Postgres de SAE y cada cuándo corre? ¿el panel CRM
  ya tiene ediciones que no existen en los Excel? ¿tamaño aproximado de E1?
- Salida: catálogo de fuentes firmado en `docs/guias/`.

### Fase 1 — Blindaje de lo que ya existe (bajo riesgo, no cambia arquitectura)
- Health extendido: `GET /health/datos` reporta por cada Excel (existe, mtime, filas leídas).
- Alerta de frescura en el vigilante existente (`alertas.py`): fuente crítica > X h sin cambio
  o inaccesible → correo (requiere SMTP) + indicador en panel.
- Backup diario de las 3 SQLite (script + Task Scheduler, retención 30 días).
- Eliminar/renombrar la copia muerta `api/data/` para que no confunda (R7).
- Documentar la regla "E1 nunca se edita" en `api/.env.example` y guía de almacén.
- **Entregable:** nada se rompe, pero cualquier fallo deja de ser silencioso.

### Fase 2 — Desacoplamiento Excel → SQLite (riesgo medio)
- Nuevo módulo `app/sync/`: job que lee los Excel críticos (E1, E2, E3) → tablas SQLite
  `sync_*` con validación de esquema y bitácora.
- Routers cambian de `excel.py` a leer `sync_*` (con feature flag para revertir).
- Panel "Estado de datos" en el admin.
- Task Scheduler corre el job cada 30 min.
- **Entregable:** el sitio sobrevive a caídas de red y a Excel abiertos; datos siempre con
  sello de fecha.

### Fase 3 — Reglas de verdad única y series históricas
- Decisión CRM (ver §3.5) e implementarla en `importar_crm_excel.py`.
- Schedule diario del snapshot de valor de inventario (R9).
- Alertas de stock bajo (umbral por producto) — valor alto, pero **solo tiene sentido con la
  frecuencia real del espejo SAE confirmada en Fase 0**.
- Migrar E5 a ruta de red o a sync (quita la dependencia del Escritorio local, R12).

### Fase 4 — El "plus" funcional (sobre datos ya sólidos)
- Gestión de usuarios y roles (pendiente #1 del backlog).
- Formulario de contacto → crea prospecto en CRM (conecta tráfico real con leads).
- Historial/seguimiento de cotizaciones enviadas en el admin.
- Noticias/promociones administrables en el home.

---

## 6. Orden recomendado y justificación

**Fase 1 → Fase 2 → Fase 3 → Fase 4.**

Razón: todo el "plus" funcional (alertas, formularios, reportes) construye sobre datos
confiables y frescos. Hoy el riesgo más grande no es falta de features, es que una sección
entera pueda estar mostrando ceros por un Excel movido, y nadie lo sabría (R1).

---

## 7. Preguntas pendientes (afectan decisiones del plan)

1. ¿Quién actualiza cada Excel (E1–E5) y con qué frecuencia real?
2. ¿Quién mantiene el espejo PostgreSQL de SAE y cada cuándo se sincroniza?
3. ¿El panel del CRM ya contiene ediciones que NO existen en los Excel de `Y:/CRM'S`?
   (define si el import puede pisar datos).
4. ¿Qué tamaño tiene `BD_ALMACEN_3P.xlsx`? (afecta si la sync cada 30 min es trivial o pesada).
5. ¿Puede montarse una carpeta de red para San Antonio (E5) en lugar del Escritorio local?
