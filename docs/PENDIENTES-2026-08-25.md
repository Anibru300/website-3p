# Avance y pendientes — 2026-08-25

## Lo realizado hoy

### 1. Login caído por CORS / error 530
- **Problema:** `api.3psadecv.com` devolvía error 530 (túnel caído) y el navegador mostraba error de CORS.
- **Solución:** se reinició el backend CJ_OS Core API y el túnel de Cloudflare.
- **Commit:** incluido en los cambios del día.
- **Archivos tocados:** `api/tools/restart-backend.ps1`, `api/tools/restart-tunnel.ps1`, `api/app/ventas/router.py` (fallback defensivo de seguimiento documental).

### 2. Filtro multi-cliente y multi-código en Historial de ventas
- El endpoint `/api/ventas/historial` ahora acepta listas en `cliente` y `codigo`.
- Se creó el componente `MultiSearchableSelect` en `DashboardPage.jsx` para seleccionar varios valores con chips.
- **Commit:** `07c7bb4`
- **Archivos:** `api/app/ventas/router.py`, `src/pages/DashboardPage.jsx`, `src/utils/api.js`

### 3. Filtro por fechas y exportar a Excel en Historial de ventas
- Se agregaron filtros `fecha_desde` y `fecha_hasta` al endpoint `/api/ventas/historial`.
- Se creó el endpoint `POST /api/ventas/historial/exportar` que genera un Excel formateado con `openpyxl`:
  - Encabezados rojos con texto blanco.
  - Bordes, anchos de columna, formato de moneda y fecha.
  - Filas USD resaltadas.
  - Fila de totales por moneda.
  - Autofiltro y primera fila congelada.
- En el frontend se agregaron inputs de rango de fecha, botones rápidos (Mes actual, Mes anterior, Año actual, Limpiar fechas) y botón verde **Exportar Excel**.
- **Commit:** `c358ebd`
- **Archivos:** `api/app/ventas/router.py`, `src/pages/DashboardPage.jsx`, `src/utils/api.js`

---

## Mejoras propuestas para seguir mañana

### A. Gestión de usuarios y permisos por secciones
**Prioridad alta — el usuario lo pidió expresamente.**

Objetivo: que cada usuario solo vea las pestañas/secciones que le correspondan.

**Secciones a controlar:**
- Resumen
- Existencias
- Material en vales
- Pedidos abiertos
- Historial de ventas
- San Antonio
- Valor de inventario
- Cotizador
- Administración de usuarios

**Modelo sugerido:**
- Agregar campo `permisos` (JSON) en tabla `users` de SQLite, o usar roles predefinidos.
- Administradores (`rol = admin`) ven todo.
- Backend: CRUD de usuarios (`/api/users`) y validación de permisos por endpoint.
- Frontend: ocultar pestañas según permisos + pantalla de administración.
- Script para crear varios usuarios desde archivo o variables de entorno.

**Preguntas pendientes para el usuario:**
1. ¿Qué secciones quiere restringir?
2. ¿Qué usuarios necesita y a qué secciones accede cada uno?
3. ¿Prefiere roles predefinidos (admin, ventas, almacén, gerencia) o permisos personalizados por usuario?

---

### B. Historial de ventas — mejoras adicionales
- [ ] Gráficas por cliente / código / mes.
- [ ] Top clientes y top códigos del período filtrado.
- [ ] Comparativo año vs año o mes vs mes.
- [ ] Exportar también a PDF resumen.
- [ ] Guardar filtros preferidos por usuario.

---

### C. Dashboard / UX
- [ ] KPIs con alertas visuales (productos bajo mínimo, facturas vencidas, pedidos sin remisionar).
- [ ] Gráficas en la pestaña Resumen.
- [ ] Modo oscuro.
- [ ] Recordar última pestaña activa del usuario.

---

### D. Almacén / inventario
- [ ] Mostrar foto del producto en existencias.
- [ ] Alertas por stock bajo.
- [ ] Historial de movimientos por código.
- [ ] Reporte de inventario valorizado con formato profesional y exportación a Excel.

---

### E. Cotizador
- [ ] Guardar cotizaciones en base de datos y listarlas.
- [ ] Reutilizar cotización como plantilla.
- [ ] Enviar cotización por correo directo desde el portal.

---

### F. Seguridad / auditoría
- [ ] Logs de quién consultó / exportó qué.
- [ ] Sesiones con expiración más corta y renovación automática.
- [ ] Forzar cambio de contraseña en primer login.

---

### G. Backend / infraestructura
- [ ] Health check más completo (PostgreSQL, Excel, túnel).
- [ ] Notificación por correo si el backend o túnel se caen.
- [ ] Caché más eficiente para el historial de ventas.
- [ ] Recrear vista `v_seguimiento_documental` en PostgreSQL con columna `folio_pedido` (pendiente desde el día de hoy).

---

## Estado de servicios al cerrar el día

- Backend CJ_OS Core API: **corriendo** en `http://localhost:8000`.
- Túnel Cloudflare `api.3psadecv.com`: **conectado**.
- Frontend desplegado en GitHub Pages: **último push `c358ebd`**.

## Próximo paso recomendado para mañana

Definir con el usuario la **gestión de usuarios y permisos por secciones** (sección A) e implementarla.
