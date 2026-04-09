# 🌐 MEMORIA - PROYECTO WEB, CATÁLOGOS Y MARKETING 3P
> Última actualización: 2026-04-01
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

### Arquitectura Actual: MULTIPÁGINA (hash router casero)
- **Router:** Hash-based casero (sin react-router-dom) para compatibilidad 100% con GitHub Pages
- **Landing (`/`):** Hero video, About, Servicios, Stats, BrandShowcase (grid clickeable), Galería PDF, Clientes, Contacto
- **Chore-Time (`/#/marcas/chore-time`):** Página dedicada con 25 productos en existencia + fotos reales + filtros por categoría
- **Otras marcas (`/#/marcas/:id`):** Página placeholder "Próximamente"

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

### Marcas Distribuidas (9 principales)
1. ROXELL (Bélgica)
2. LUBING (Alemania)
3. LANDMECO (Dinamarca)
4. GEORGIA POULTRY (USA)
5. CHORE-TIME (USA)
6. MS Schippers (Países Bajos)
7. AMT (USA)
8. ALKE (Holanda)
9. TIGSA (España)

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
CHORE_TIME, FANCOM, SBM, SCHIPPERS, LUBING, ALKE, LB_WHITE, ROXELL, TIGSA

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
- [ ] Crear páginas dedicadas para Fancom, Roxell, Lubing, etc.
- [ ] Configurar EmailJS
- [ ] Mejorar SEO de cada página de marca

---

*Este archivo se actualiza al final de cada sesión de trabajo en el proyecto web/marketing.*
