# 3P S.A. DE C.V. - Sitio Web Oficial

Sitio web profesional para 3P S.A. DE C.V., empresa líder en distribución de equipos para la industria avícola, porcícola e invernaderos.

## 🚀 Tecnologías Utilizadas

- **React 19** - Framework de JavaScript
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **EmailJS** - Envío de formularios de contacto y reseñas

## 📁 Ecosistema de repositorios

Este repo contiene **únicamente el sitio web público**. Los proyectos relacionados viven en repos separados:

| Repo | Contenido | Despliegue |
|---|---|---|
| `Anibru300/website-3p` (este) | Sitio web público | GitHub Pages → `3psadecv.com` |
| `Anibru300/plataforma` | App privada (login, dashboard, cotizador, admin, logística) | GitHub Pages → `plataforma.3psadecv.com` |
| `Anibru300/api-3p` | Backend FastAPI (auth, datos, fotos, fichas, cotizaciones PDF, analytics) | Servidor local + Cloudflare Tunnel → `api.3psadecv.com` |

El sitio público solo consume dos endpoints públicos de la API: fichas técnicas de producto (`/api/fichas/publicas`) y eventos de analytics (`/api/analytics/event`). Todo lo demás del sitio es estático.

## 📁 Estructura del Proyecto

```
website-3p/
├── docs/                   # Documentación del proyecto
│   ├── guias/             # Guías operativas vigentes
│   ├── historial/         # Cierres y avances ya cumplidos
│   ├── materiales/        # Entregables y material de trabajo
│   ├── recursos/          # Assets fuente (logos originales)
│   └── fuentes/           # Documentos fuente de la empresa
├── public/                 # Archivos estáticos del sitio
│   ├── images/            # Imágenes del sitio
│   ├── catalogs/          # PDFs de catálogos
│   ├── models/            # Modelos 3D (GLB)
│   └── logo.png           # Logo principal
├── scripts/                # Scripts de automatización
│   ├── deploy/            # Scripts de publicación a GitHub Pages
│   └── legacy/            # Scripts de un solo uso (archivados)
├── src/
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas (Home, marcas, contacto...)
│   ├── context/           # Contextos (tema, idioma)
│   ├── utils/             # Utilidades (cliente API de fichas/analytics)
│   ├── App.jsx            # Componente principal
│   ├── index.css          # Estilos globales
│   └── main.jsx           # Punto de entrada
├── CATALOGO AUTORIZADO PARA PAGINA WEB/   # PDFs fuente de catálogos
├── index.html             # HTML principal
├── tailwind.config.js     # Configuración de Tailwind
└── package.json           # Dependencias
```

## 🌐 Sitio público

El sitio público incluye:

1. **Inicio (Hero)** - Presentación de la empresa con estadísticas
2. **Nosotros** - Historia desde 1997, misión, visión y valores
3. **Servicios** - Venta, importación, exportación, instalación, capacitación
4. **Marcas** - LUBING, FANCOM, MS Schippers, SBM, LB White, AMT, ALKE, TIGSA, Georgia Poultry
5. **Clientes** - Principales clientes nacionales e internacionales
6. **Contacto** - Formulario y datos de contacto
7. **Reseñas** - Formulario de reseñas con envío por EmailJS

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

> El backend (`api-3p`) debe estar corriendo en `http://localhost:8000` para que las
> fichas técnicas y el analytics funcionen en desarrollo. Ver `Anibru300/api-3p`.

### Compilar para producción

```bash
# Crear build de producción
npm run build

# Los archivos estarán en la carpeta /dist
```

### Despliegue

El despliegue a GitHub Pages (`3psadecv.com`) es automático con el push a `master`
(via `.github/workflows/deploy.yml`), o manual con:

```powershell
npm run deploy
```

La variable `VITE_API_BASE_URL` (GitHub → **Settings > Secrets and variables >
Actions > Variables**) apunta a `https://api.3psadecv.com` en producción.

## 📞 Información de Contacto

- **Teléfonos:** (477) 774-83-23 y (477) 774-83-26
- **Email:** trespsadecv@hotmail.com
- **Dirección:** Industrial del Norte 201, Fracc. Industrial Del Norte, CP. 37200, León, Guanajuato

## 📝 Notas

- El sitio es completamente responsive (se adapta a móviles, tablets y desktop)
- Incluye animaciones suaves para mejor experiencia de usuario
- Formulario de contacto con validación y anti-spam (honeypot)
- SEO optimizado con meta tags apropiados
- Colores corporativos: Rojo (#C41E3A) y Azul (#1E3A8A)

---
© 2026 3P S.A. DE C.V. - Todos los derechos reservados
