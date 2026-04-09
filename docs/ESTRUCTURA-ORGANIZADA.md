# 🗂️ Estructura Organizada del Proyecto

## Estructura Limpia Propuesta

```
3p-website/
├── 📁 .github/              # Configuración de GitHub (workflows, etc)
├── 📁 .vscode/              # Configuración de VS Code
├── 📁 docs/                 # Documentación del proyecto
│   ├── guias/
│   └── recursos/
├── 📁 public/               # Archivos estáticos
│   ├── 📁 images/
│   │   ├── brands/          # Logos de marcas
│   │   ├── catalog/         # Imágenes de productos
│   │   └── icons/           # Iconos del sitio
│   ├── 📁 videos/           # Videos 360°
│   ├── 📁 catalogs/         # PDFs de catálogos
│   └── favicon.ico
├── 📁 src/
│   ├── 📁 components/       # Componentes React
│   │   ├── ui/              # Componentes base (Button, Card, etc)
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── product/         # ProductCard, ProductGrid, etc
│   │   └── shared/          # Componentes compartidos
│   ├── 📁 context/          # Contextos de React
│   ├── 📁 data/             # Datos (productos, configuraciones)
│   ├── 📁 hooks/            # Custom hooks
│   ├── 📁 pages/            # Páginas principales
│   ├── 📁 styles/           # Estilos globales
│   └── 📁 utils/            # Utilidades y helpers
├── 📁 scripts/              # Scripts de automatización
├── 📄 .gitignore
├── 📄 index.html
├── 📄 package.json
├── 📄 README.md
└── 📄 vite.config.js
```

## Archivos a ELIMINAR (limpieza)

### Carpetas temporales/cache:
- `.contexto-kimi/` → Mover a `.github/` o `docs/`
- `node_modules/.cache/` → Ya está en .gitignore
- `dist/` → Se regenera con cada build

### Archivos duplicados o sin usar:
- Archivos de debug (`debug_*.html`)
- Archivos de log antiguos
- Scripts de Python en raíz si no se usan

### Materiales de trabajo (mover a `docs/assets/`):
- `CATALOGO AUTORIZADO PARA PAGINA WEB/` → `docs/materiales/`
- Archivos Word, Excel del catálogo → `docs/fuentes/`

## Archivos a CONSERVAR en raíz

Solo estos archivos deben estar en la raíz:
1. `index.html`
2. `package.json`
3. `package-lock.json`
4. `vite.config.js`
5. `tailwind.config.js` (si existe)
6. `README.md`
7. `.gitignore`

Todo lo demás va en subcarpetas organizadas.
