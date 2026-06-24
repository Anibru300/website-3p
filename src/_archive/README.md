# Archivo de componentes y datos inactivos

Esta carpeta contiene código que ya no se usa en la interfaz activa del sitio, pero que se conserva por si se necesita recuperar en el futuro.

## Contenido

### `pages/FancomPage.jsx`
Página dedicada a la marca Fancom. Fue desactivada del sitio el 24 de junio de 2026; Fancom ahora aparece como "Próximamente" en la galería de catálogos.

### `data/fancomProducts.js`
Datos de productos Fancom usados por `FancomPage.jsx`. Ya no se consumen en la aplicación activa.

## Cómo reactivar

Si en algún momento se quiere volver a mostrar el catálogo de Fancom:

1. Mover `pages/FancomPage.jsx` de vuelta a `src/pages/`.
2. Mover `data/fancomProducts.js` de vuelta a `src/data/`.
3. Actualizar `src/App.jsx` para renderizar `FancomPage` en la ruta `/marcas/fancom`.
4. Cambiar el estado de Fancom en `src/components/product/CatalogGallery.jsx` de `coming-soon` a `active`.
