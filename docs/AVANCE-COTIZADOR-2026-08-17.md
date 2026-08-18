# Avance del Cotizador Web — 17 de agosto de 2026

## ✅ Lo que ya funciona

### Backend
- Endpoint `/api/cotizaciones/precio-referencia` que devuelve el último precio facturado de un código (prioriza al cliente, luego precio general).
- Endpoint `POST /api/cotizaciones` para guardar cotizaciones en SQLite (`api/app/data/cotizaciones.db`).
- Endpoint `GET /api/cotizaciones` para listar cotizaciones guardadas.
- Endpoint `GET /api/cotizaciones/{id}/pdf` para generar y descargar el PDF.
- Endpoint `GET /api/cotizaciones/vendedores` que lee la hoja `FIRMAS` de `Y:\COTIZACIONES\1. COTIZADOR\2. COTIZADOR 2.0.xlsm`.
- Cálculo automático de subtotal, IVA 16% y total.
- Folio generado automáticamente al estilo del Excel: `CLIENTE YYMMDD`.
- Campos nuevos guardados: leyenda de envío, con/sin descuento, con/sin stock en León, vendedor/firma.
- Caché en memoria y en disco para el historial de ventas (cargas rápidas).
- Logs añadidos al endpoint de guardado para facilitar la depuración.

### Frontend
- Página `/cotizador` accesible solo para usuarios logueados.
- Botón de acceso desde el dashboard operativo.
- Cliente como lista desplegable con los clientes del historial de ventas.
- Código como lista desplegable con códigos del historial de ventas.
- Descripción y almacén se cargan automáticamente al seleccionar código.
- Precio unitario de referencia se carga automáticamente (editable).
- Moneda USD/MXN.
- Condiciones de pago: Contado, 15 días, 30 días, 60 días, 70 días, 90 días.
- Campo de folio editable (se genera automáticamente).
- Campo libre para leyenda de envío (LAB, etc.).
- Toggles Con/Sin descuento y Con/Sin stock en León.
- Select de **Vendedor / Firma** con los nombres de la hoja `FIRMAS` del Excel del cotizador.
- El vendedor seleccionado aparece como firma en el PDF.
- Tabla de productos con cantidad, precio unitario, descuento (condicional) y total.
- Mejor manejo de errores en `apiFetch` y en el botón Guardar (logs en consola).
- Build de producción actualizado en `dist/`.

## 🔍 Investigación del cierre de sesión al guardar
- Se agregaron logs detallados en frontend y backend.
- Se hizo una prueba local de `POST /api/cotizaciones` con un token válido y respondió `200 OK` correctamente.
- El backend registró la petición: `127.0.0.1 - "POST /api/cotizaciones HTTP/1.1" 200 OK`.
- Posibles causas si vuelve a pasar:
  1. Token JWT expirado (duración: 8 horas).
  2. La petición no llegó al backend por algún proxy/intermediario.
  3. Error de CORS/credenciales (menos probable porque los GET funcionan).
- **Próxima prueba:** intentar guardar desde el navegador. Si se cierra la sesión, revisar la consola del navegador (F12) para ver el mensaje exacto de `apiFetch`.

## ⚠️ Notas importantes
- El backend fue reiniciado manualmente para aplicar los cambios. Si las tareas programadas (`3P-Website-Backend` y `3P-Website-Tunnel`) no se reiniciaron, conviene detenerlas y volverlas a ejecutar desde el Task Scheduler para que usen el código actualizado.
- El túnel de Cloudflare debe estar activo para que la API sea accesible desde internet (`api.3psadecv.com`).

## 📋 Pendientes para mañana

1. **Verificar en producción que Guardar ya no cierre sesión**
   - Probar desde el navegador con la consola abierta (F12).
   - Si hay 401, revisar la duración del token y la hora del servidor/cliente.
   - Si hay error de red/CORS, revisar Cloudflare y el túnel.

2. **Mejorar el PDF**
   - Ajustar el diseño para que sea más parecido al Excel (logo, bordes, leyendas).
   - Incluir la leyenda de envío, descuento y stock en León de forma más visible.
   - Incluir firma real/imagen si se decide en el futuro.

3. **Guardar copia en carpeta de cotizaciones**
   - Opcional: guardar el PDF generado en `Y:\COTIZACIONES\...` además de la base de datos.

4. **Enviar por correo**
   - Opcional futuro: integrar envío de correo con el PDF adjunto (reemplazar la macro de Outlook).

5. **Historial de cotizaciones**
   - Página para ver, buscar y reutilizar cotizaciones guardadas.

## 📝 Notas técnicas
- Base de cotizaciones: `api/app/data/cotizaciones.db` (no se sube al repo).
- Excel de firmas: `Y:\COTIZACIONES\1. COTIZADOR\2. COTIZADOR 2.0.xlsm`, hoja `FIRMAS`.
- Vendedores detectados: `America Ruiz`, `Carlos Urbina`, `CYNTHIA HERNANDEZ`.
