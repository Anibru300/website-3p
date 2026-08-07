# 🌐 MEMORIA - PROYECTO WEB, CATÁLOGOS Y MARKETING 3P
> Última actualización: 2026-08-07
> Propósito: Preservar contexto del proyecto comercial/marketing de 3P

---

## 🏢 EMPRESA: 3P S.A. DE C.V.

- **Fundación:** 1997 por Valentino Pierangeli
- **Sede:** Industrial del Norte 201, Fracc. Industrial Del Norte, CP 37200, León, Gto.
- **Giro:** Distribución de equipos de alta tecnología para avícola, porcícola e invernaderos
- **Contacto:** +52 1 477 128 4661, +52 1 479 229 8907 | trespsadecv@hotmail.com / ventas@3p.com.mx

---

## 🌐 PROYECTO WEB: website-3p

### Stack Tecnológico
- React 19 + Vite + Tailwind CSS 3.4
- Lucide React (iconos)
- EmailJS (PENDIENTE configurar)
- Desplegado en GitHub Pages: https://Anibru300.github.io/website-3p/
- Repo: https://github.com/Anibru300/website-3p

### Arquitectura Actual: SPA con React Router
- **Router:** React Router con fallback `404.html` para GitHub Pages
- **Landing (`/`):** Hero, About, Servicios, Stats, BrandShowcase, CatalogGallery, VentilationCalculator, Clientes, ReviewForm, Contacto
- **Marcas (`/marcas/:id`):** Página genérica "Próximamente" para marcas sin catálogo activo
- **Ruta `/marcas/chore-time`:** Redirige a HomePage (marca oculta temporalmente)

### Cambios de diseño corporativo realizados
- ✅ **Quitados efectos infantiles:** Eliminados `ClickParticles` (estrellitas/pollitos al clic) y `PoultryBackground` (animalitos corriendo)
- ✅ **Navegación limpia:** Header multipágina con dropdown de líneas, sin `FloatingNav` ni `ScrollProgress`
- ✅ **Grid de marcas profesional:** Nuevo `BrandShowcase.jsx` con 9 tarjetas de marca que linkan a su página dedicada
- ✅ **Catálogo Chore-Time funcional:** Nuevo `ChoreTimePage.jsx` con productos reales, stock actualizado y fotos profesionales

### Assets Web
- Fotos de productos Chore-Time copiadas a: `public/images/catalogo/chore-time/` (48 imágenes PNG)
- Datos de productos en: `src/data/choreTimeProducts.js`

### Colores Corporativos
- Rojo 3P: `#C41E3A`
- Rojo oscuro: `#9B1B30`
- Azul 3P: `#1E3A8A`
- Azul claro: `#3B82F6`

### Marcas Distribuidas (activas en el sitio)
1. LUBING (Alemania) → enlace oficial: https://lubmesam.com.mx/
2. FANCOM (Países Bajos) → catálogo desactivado, aparece como "Próximamente"
3. MS Schippers (Países Bajos)
4. SBM (Francia)
5. LB White (USA)
6. AMT (USA)
7. ALKE (Países Bajos)
8. TIGSA (España)
9. Georgia Poultry (USA)

### Marcas eliminadas/ocultas
- ~~ROXELL~~ — eliminada completamente del sitio (2026-06-24)
- ~~CHORE-TIME~~ — oculta temporalmente (2026-06-10)

---

## 📦 CATÁLOGOS POR MARCA

### Estructura de Carpetas (OneDrive)
```
G:\Mi unidad\pagina web\CATALOGO\[MARCA]\
├── 01-fotos_originales\
├── 02-imagenes_procesadas\
├── 03-catalogos_pdf\
└── 04-metadata\
```

### Marcas con Catálogo
~~CHORE_TIME~~ (oculto temporalmente), FANCOM, SBM, SCHIPPERS, LUBING, ALKE, LB_WHITE, ROXELL, TIGSA

---

## 🔩 CATÁLOGO CHORE-TIME (FOCO ACTUAL)

### Inventario Real vs Fotos (corte 2026-04-01)
- **Total SKUs en Excel:** 45
- **Con stock > 0:** 43
- **Con stock Y fotos disponibles:** 25 productos (incluye C3259-120)
- **Con stock pero SIN fotos:** 18 productos

### Productos publicados en WEB y PDF (25)
14337, 2529-839, 27772, 40741, 41308, 41309, 41315, 41317, 42013, 42208-1000, 42372, 48299, 48564, 48608, 49646, 49649, 49651, 49652, 49673, 49674, 49983, 51763, 51861, 6854-4, 3259-120

### Estado de Diseño PDF
- **v13:** ReportLab enterprise-grade con azul acero + oro industrial, interactivo, fotos profesionales, stock real.
- **Archivo:** `Catalogo_Chore_Time_3P_v13_fixed.pdf` (compatible con lectores estrictos)
- **Estado web:** Catálogo y marca ocultos temporalmente de la página (junio 2026). El PDF y los assets se conservan.

---

## 🛠️ HERRAMIENTAS DISPONIBLES

- Node.js + npm
- Python 3.11.9 (`py` en PATH)
- Git + GitHub CLI
- VS Code + Kimi CLI
- fpdf2, Pillow, pandas, openpyxl, ReportLab

---

## 💡 BACKLOG MARKETING/WEB

### Catálogo Chore-Time PDF
- [x] Crear generador v13 en ReportLab
- [x] Incluir productos con stock+foto
- [x] Mostrar cantidades reales de stock
- [x] Mejorar portada, índice y página de contacto
- [x] Agregar código QR

### Sitio Web React
- [x] Integrar catálogo Chore-Time al sitio principal
- [x] Migrar productos reales a la web
- [x] Arquitectura multipágina funcional
- [x] Quitar efectos decorativos infantiles
- [x] **Ocultar marca Chore-Time temporalmente** (junio 2026) — ver detalles en "Cambios Recientes"
- [x] **Configurar EmailJS** (junio 2026) — formulario de contacto y reseñas funcionales
- [x] **GitHub Actions CI/CD** — deploy automático en push a master
- [x] **Anti-spam honeypot** en formularios de cotización y reseñas
- [ ] Crear páginas dedicadas para marcas con catálogo activo
- [ ] Mejorar SEO de cada página de marca
- [ ] Mostrar reseñas aprobadas públicamente en el sitio

---

## 🔐 Portal Operativo CJ_OS / Dashboard 3P

> En desarrollo activo a partir de agosto 2026.

### Objetivo
Dar a usuarios autorizados de 3P acceso a información operativa en tiempo real:
existencias, pedidos vivos, material en vales, facturas pendientes de cobranza y órdenes de compra San Antonio.

### Arquitectura
```
website-3p (React/Vite)  ──▶  CJ_OS Core API (FastAPI)  ──▶  PostgreSQL cj_assistant
                                                       └──▶  SAN_ANTONIO_SEGUIMIENTO.xlsx (solo lectura)
```

### Archivos del portal en este repositorio
- `src/context/AuthContext.jsx` — sesión JWT.
- `src/pages/LoginPage.jsx` — pantalla de acceso.
- `src/pages/DashboardPage.jsx` — dashboard con tabs.
- `src/components/auth/ProtectedRoute.jsx` — protección de rutas.
- `src/utils/api.js` — cliente HTTP hacia CJ_OS Core API.
- `.env.example` — variables de entorno del frontend y referencias del backend.
- `docs/guias/API-CJ-OS-CORE.md` — contrato completo de endpoints esperados.

### Endpoints consumidos
- `POST /auth/login`
- `GET /api/me`
- `GET /api/dashboard/resumen`
- `GET /api/almacen/existencias`
- `GET /api/almacen/vales`
- `GET /api/ventas/pedidos-vivos`
- `GET /api/ventas/facturas-cobranza`
- `GET /api/inventario/movimientos`
- `GET /api/san-antonio/ordenes`

### Estado
- ✅ Frontend: login, ruta protegida, dashboard con tabs.
- ✅ Backend FastAPI local: autenticación JWT, endpoints operativos, lectura de Excel San Antonio.
- ✅ Build de producción sin errores.
- ✅ Usuario admin creado: `trespsadecv@hotmail.com` / contraseña hasheada con bcrypt.
- ⏳ Conexión real con PostgreSQL: pendiente a completar credenciales en `api/.env`.
- ⏳ Despliegue del backend: requiere servidor local o túnel (Cloudflare Tunnel recomendado).

---

## 📝 CAMBIOS RECIENTES

### 2026-06-10 — Ocultar marca Chore-Time temporalmente
> **Motivo:** Solicitud del usuario para ocultar la marca y catálogo de Chore-Time mientras se resuelve algo externo. **Nada se borró**, solo se ocultó de la interfaz visual.

**Archivos modificados:**
- `src/components/ui/Brands.jsx` — Comentado objeto CHORE TIME del array `brands`.
- `src/components/layout/Header.jsx` — Comentado Chore-Time del dropdown "Líneas" (desktop y móvil).
- `src/components/layout/Footer.jsx` — Comentado Chore-Time del array `brands` del footer.
- `src/components/shared/BrandShowcase.jsx` — Comentado Chore-Time del array de marcas.
- `src/pages/HomePage.jsx` — Eliminado CHORE-TIME de `description` y `keywords` del SEO.
- `index.html` — Eliminado CHORE-TIME de meta tags `description`, `keywords`, `og:description`.
- `src/components/product/CatalogGallery.jsx` — Sección del catálogo destacado Chore-Time envuelta en `{false && (...)}` (código conservado intacto).
- `src/components/product/ProductSearch.jsx` — Desactivada búsqueda de productos Chore-Time (`const filtered = []`) y comentado enlace "Ver todos los productos".
- `src/App.jsx` — Ruta `/marcas/chore-time` redirige a `<HomePage />` en lugar de `<ChoreTimePage />`.
- `public/sitemap.xml` — URL de chore-time comentada.
- `.contexto-kimi/MEMORIA-PROYECTO-3P-WEB.md` — Actualizado este archivo.

**Cómo revertir:** Descomentar las líneas marcadas con `//` en los archivos listados, quitar el `{false && (...)}` en `CatalogGallery.jsx`, y restaurar la ruta en `App.jsx`.

---

### 2026-06-24 — Mejoras de contenido, reseñas y limpieza
> **Resumen:** Se actualizó la sección de clientes internacionales con banderas reales, se eliminó ROXELL del sitio, se activó el envío real de reseñas por EmailJS, se agregó protección anti-spam y se realizó limpieza de archivos obsoletos.

**Archivos modificados:**
- `src/components/shared/Clients.jsx` — banderas reales con flagcdn.com.
- `src/components/shared/ReviewForm.jsx` — formulario funcional con EmailJS, correo y empresa opcionales, calificación obligatoria, honeypot anti-spam.
- `src/components/shared/Contact.jsx` — agregado honeypot anti-spam.
- `src/translations/index.js` — agregado namespace `reviews` en es/en.
- `src/components/layout/Header.jsx` / `Footer.jsx` — enlaces oficiales de marcas, ROXELL eliminado.
- `src/components/shared/BrandShowcase.jsx` — tarjetas de marca con enlaces oficiales, ROXELL eliminado.
- `src/components/product/CatalogGallery.jsx` — Fancom como "Próximamente".
- `src/pages/HomePage.jsx` — secciones actualizadas (sin newsletter ni testimonios).
- `index.html` / `public/sitemap.xml` — SEO actualizado sin ROXELL.
- `.gitignore` — ignoradas carpetas de materiales y assets generados.
- `docs/SESSION-REPORT.md` — documentación de la sesión.

**Archivos archivados (moved to `src/_archive/`):**
- `src/pages/FancomPage.jsx`
- `src/data/fancomProducts.js`

**Configuración EmailJS activa:**
- Service ID: `service_3prclaq`
- Template ID de reseñas: `template_y153mic`
- Public Key: `bZ5Pz4T6UhA3cDcU1`
- Destinatario de reseñas: `carlos.urbina@3psadecv.com`

### 2026-08-07 — Portal Operativo CJ_OS / Dashboard 3P
> Se retoma el desarrollo del portal privado. Se ajusta el frontend según la arquitectura CJ_OS (PostgreSQL como fuente de verdad, lectura segura del Excel de San Antonio, nunca tocar archivos originales de SAE).

**Archivos modificados/creados:**
- `src/App.jsx` — rutas `/login` y `/dashboard`.
- `src/main.jsx` — envuelve la app en `AuthProvider`.
- `src/components/layout/Header.jsx` — acceso al portal.
- `src/context/AuthContext.jsx` — autenticación JWT.
- `src/pages/LoginPage.jsx` — pantalla de login.
- `src/pages/DashboardPage.jsx` — dashboard con tabs.
- `src/components/auth/ProtectedRoute.jsx` — ruta protegida.
- `src/utils/api.js` — cliente HTTP.
- `.env.example` — variables de entorno frontend/backend.
- `eslint.config.js` — ajustes para archivos de contexto/hook.
- `docs/guias/API-CJ-OS-CORE.md` — contrato de API completo.
- `.contexto-kimi/MEMORIA-PROYECTO-3P-WEB.md` — esta memoria.

**Correcciones de lint frontend:**
- `DashboardPage.jsx` — variables sin usar, dependencias de hooks.
- `AuthContext.jsx` — evitar setState síncrono en effect.
- `Hero.jsx`, `ReviewForm.jsx`, `ThemeContext.jsx`, `PoultryBackground.jsx`, `ChoreTimePage.jsx` — errores menores de lint.

**Notas:**
- `npm run build` ✅ sin errores.
- `npm run lint` aún reporta errores preexistentes en componentes no relacionados con el portal (MsSchippersPage, ProductSearch, ProductVideoViewer, etc.). Se decidió no profundizar en ellos en esta sesión para mantener el foco en el portal.

---

*Este archivo se actualiza al final de cada sesión de trabajo en el proyecto web/marketing.*
