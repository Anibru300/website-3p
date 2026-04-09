# 🧠 MEMORIA EXTENDIDA - PROYECTO 3P S.A. DE C.V.
> Última actualización: 2026-04-01
> Asistente: Kimi Code CLI
> Propósito: Preservar contexto completo del proyecto para sesiones futuras

---

## 🏢 EMPRESA: 3P S.A. DE C.V.

### Información General
- **Razón Social:** 3P S.A. de C.V.
- **Significado:** "Partner de los Productores de Pollos"
- **Fundación:** 1997 por Valentino Pierangeli
- **Sede:** Industrial del Norte 201, Fracc. Industrial Del Norte, CP 37200, León, Guanajuato
- **Gerente General:** C.P. Cynthia Hernández
- **Representante de Dirección para Calidad:** C.P. Cynthia Hernández
- **No. Empleados:** ~19 personas
- **Años de experiencia:** 27+
- **Países atendidos:** 10+
- **Clientes:** 50+ empresas nacionales e internacionales

### Contacto
- **Teléfonos:** +52 1 477 128 4661, +52 1 479 229 8907, +52 1 479 229 8904
- **Email:** trespsadecv@hotmail.com / ventas@3p.com.mx
- **Horario:** Lunes a Viernes 9:00-18:00, Sábado 9:00-13:00

### Giro Principal
- Distribución de equipos de alta tecnología para la **industria avícola, porcícola e invernaderos**
- También comercializan productos de limpieza, desinfección y bioseguridad (MS Schippers)
- Servicios: Venta de equipos, importaciones, exportaciones, capacitación, servicio postventa, instalación

---

## 👥 ESTRUCTURA ORGANIZACIONAL (CONGELADA 11/03/2026)

```
C.P. Cynthia Hernández (Gerente General)
├── Ing. Carlos Urbina → Análisis de Riesgos y Mejora Continua (SIN EQUIPO)
├── C.P. Nubia Muñoz → Contadora → + Diana Serrano (Auxiliar Contable)
├── C.P. Ernesto Reynoso → Ventas y Facturación → + Francisco Morales (Jefe Almacén) + Ulises Martínez (Auxiliar)
├── Ing. Aarón Huerta → Gerencia de Ventas → + Luis Fernando (ATC Centro-Occidente) + Joan Carlos + Maximiliano + Abelardo (Zona Bajío) + Héctor
└── LCI. América Ruiz → Compras-Logística (SIN EQUIPO)
```

### Reglas Críticas de Comunicación
1. **Luis Fernando NO contacta directamente a Almacén/Logística** → debe pasar por Ernesto Reynoso
2. **Ernesto Reynoso es el ÚNICO canal autorizado** para solicitar compras a Logística y marcar prioridades en Almacén
3. **Abelardo** reporta a Aarón Huerta pero se coordina con Ernesto para operaciones
4. **América Ruiz** da entrada en ERP/SAE (NO el Almacén)

---

## 🌐 PROYECTO WEB PRINCIPAL: website-3p

### Tecnologías
- **React 19** + **Vite**
- **Tailwind CSS 3.4**
- **Lucide React** (iconos)
- **EmailJS** (formulario contacto - PENDIENTE CONFIGURAR)
- **GitHub Pages** para hosting
- **Usuario GitHub:** Anibru300
- **URL:** https://Anibru300.github.io/website-3p/

### Estructura del Sitio (SPA)
1. **Hero** - Video de fondo granja avícola, estadísticas animadas
2. **Nosotros** - Historia 1997, misión, visión, valores, timeline
3. **Servicios** - 5 servicios principales + tiempos de entrega
4. **Marcas** - 9 marcas con tarjetas interactivas (TiltCard)
5. **Catálogo** - 6 productos placeholder SIN imágenes reales
6. **Galería de Catálogos** - 6 catálogos marca en SVG/PNG
7. **Clientes** - Nacionales e internacionales + testimonios
8. **Contacto** - Formulario + mapa Google Maps

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

*(También se mencionan FANCOM, DACS, HOG SLAT en algunos componentes)*

### Problemas Conocidos del Sitio
- ⚠️ `Catalog.jsx` tiene solo 6 productos de ejemplo SIN imágenes
- ⚠️ `CatalogByBrand.jsx` está DESACTIVADO (comentado en App.jsx)
- ⚠️ EmailJS sin configurar (placeholders: TU_SERVICE_ID, TU_TEMPLATE_ID, TU_PUBLIC_KEY)
- ⚠️ Catálogo Chore-Time existe como HTML aparte, NO integrado al sitio React

---

## 📦 SISTEMA DE CATÁLOGOS (OneDrive)

### Estructura por Marca
```
G:\Mi unidad\pagina web\CATALOGO\[MARCA]\
├── 01-fotos_originales\
├── 02-imagenes_procesadas\
├── 03-catalogos_pdf\
└── 04-metadata\
```

### Marcas con Carpeta
CHORE_TIME, FANCOM, SBM, SCHIPPERS, LUBING, ALKE, LB_WHITE, ROXELL, TIGSA

### Scripts de Procesamiento (OpenClaw Workspace)
**Ubicación local:** `C:\Users\Carlos\.openclaw\workspace\contexto-3p\`

#### Procesadores de Imagen
- `01-PROCESADOR-3P-AVANZADO.py` → Principal con OpenCV (quita fondos, añade sombras)
- `02-PROCESADOR-3P-V21.py`
- `03-PROCESADOR-MODO-MANUAL.py`
- `04-PROCESADOR-REMBG.py`

#### Extractores PDF
- `01-extractor-base.py`
- `02-extractor-lotes.py`
- `03-extractor-lubing.py`
- `04-extractor-fancom.py`

#### Generadores de Catálogo
- `01-generador-pdf.py`
- `02-generador-auto.py`
- `03-generador-final.py`
- `04-generador-fichas.py`

### Nomenclatura de Archivos
- **Entrada:** `{codigo}_{descripcion}_{vista}.jpg`
- **Salida:** `{DESCRIPCION}_{CODIGO}_{MARCA}_vista{vista}_sin_fondo.png`

---

## 🔩 CATÁLOGO CHORE-TIME (ESTADO ACTUAL)

### PDF Actual
- **Archivo:** `Catalogo_Chore_Time_3P_v12.pdf`
- **Ubicación:** `G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME`
- **Páginas:** 12
- **Productos:** 24 refacciones originales
- **Categorías:** 6
- **Generador:** `catalogo_v12.py` (fpdf2)

### Categorías y Productos
1. **Tarjetas Electrónicas** (8 prod) - 41308, 41309, 49646, 49652, 49673, 49674, 49983, 51861
2. **Displays y Teclados** (3 prod) - 41315, 41317, 49651
3. **Motores y Mecánico** (6 prod) - 3259-120, 48608, 42372, 27772, 14337, 42013
4. **Sensores** (2 prod) - 40741, 48299
5. **Eléctrico y Alimentación** (3 prod) - 48564, 49649, 42208-1000
6. **Accesorios y Estructura** (2 prod) - 6854-4, 51763

### Diseño Actual v12
- **Paleta:** Regla 60-30-10 con púrpura `#491C77`, rojo `#DC0F0F`, fondos claros
- **Portada:** `portada_catalogo.jpg` a pantalla completa
- **Índice:** Tarjetas con barra de color lateral
- **Fichas:** 
  - 1er producto de cada categoría = FICHA DESTACADA (2 fotos grandes, 90mm alto)
  - Resto = FICHA COMPACTA HORIZONTAL (foto principal + mini foto 2, 60mm alto)
- **Contacto:** Página final dividida púrpura/blanco

### Problemas de Diseño Identificados
1. **Tipografía limitada:** Solo usa Helvetica (sin serifa), carece de jerarquía tipográfica sofisticada
2. **Falta de branding de Chore-Time:** No aparece el logo oficial de Chore-Time/CTB
3. **Fichas muy cuadradas/boxy:** Falta redondeo, sombras planas, aspecto "generado por código"
4. **Espaciado inconsistente:** Algunas specs se cortan con "...", márgenes ajustados manualmente
5. **No tiene código QR** para contacto rápido o web
6. **No tiene tabla de contenido digital** ni navegación por números de página en el índice
7. **Falta información de stock:** Solo dice "DISPONIBLE" pero no cantidades
8. **No hay fotos de contexto/de uso:** Solo fotos de producto sobre fondo gris
9. **Portada estática:** Podría ser más impactante con tipografía más grande y claims de valor
10. **No hay íconos ni infografía:** Todo es texto y cajas

---

## 🛠️ HERRAMIENTAS DISPONIBLES EN EL SISTEMA

### Confirmadas Disponibles
- ✅ **Node.js + npm**
- ✅ **Python 3.11.9** (`py` en PATH)
- ✅ **Git + GitHub CLI (gh)**
- ✅ **VS Code + Kimi CLI**
- ✅ **React + Vite + Tailwind** (proyecto configurado)
- ✅ **PyPDF2** (lectura de PDFs confirmada)
- ✅ **Pandas + OpenPyXL** (lectura Excel confirmada)
- ✅ **fpdf2** (generador v12 lo usa)
- ✅ **Pillow (PIL)** (usa el generador v12)

### Posiblemente Instaladas (verificar)
- OpenCV (`cv2`) - usada por procesadores de imagen
- ReportLab - usada por generadores alternativos
- img2pdf
- requests, beautifulsoup4

### Herramientas Web Recomendadas en Documentación
- remove.bg API (50 imgs/mes gratis)
- TinyPNG (compresión)
- PDF24 Tools

### Software Gráfico Sugerido (no confirmado instalado)
- GIMP
- Inkscape
- Scribus
- ImageMagick

---

## 📋 SGC V2 - PENDIENTES CRÍTICOS ISO 9001

### Documentos Obligatorios Pendientes
- [ ] Política de Calidad firmada por Cynthia
- [ ] Objetivos de Calidad medibles
- [ ] Actas de Revisión por la Dirección
- [ ] Programa de Auditorías Internas
- [ ] Lista de Auditores Internos capacitados
- [ ] Procedimiento de Control de NC
- [ ] Procedimiento de Acciones Correctivas
- [ ] Inventario de Equipos de Medición con calibración

### Procedimientos de Almacén (12)
P-ALM-001 a PR-ALM-012 (varios ya creados en formato Word)

### KPIs Establecidos
- Precisión de inventario ≥ 98%
- Tiempo de surtido ≤ 24 horas
- Errores en surtido ≤ 1%
- Satisfacción del cliente ≥ 90%
- Entregas a tiempo ≥ 95%
- Precisión en facturación ≥ 98%

---

## 🚀 AUTOMATIZACIÓN DE DESPLIEGUE WEB

### Scripts Configurados
- `PUBLICAR_3P_WEBSITE.bat` → Acceso directo
- `PUBLICAR_AUTOMATICO.ps1` → Completo (instala gh, autentica, crea repo, deploy)
- `PUBLICAR_RAPIDO.ps1` → Rápido sin interacción
- `deploy-to-github.ps1` → Script alternativo

### Repositorio
- **GitHub:** https://github.com/Anibru300/website-3p
- **Pages:** https://Anibru300.github.io/website-3p/

---

## 💡 IDEAS DE MEJORA PENDIENTES (BACKLOG)

### Catálogo Chore-Time PDF
1. Migrar a ReportLab para mejor control tipográfico
2. Agregar redondeo de esquinas en fichas (simulado con curvas)
3. Incluir logo oficial Chore-Time/CTB
4. Agregar código QR a página de contacto
5. Mostrar cantidades en stock reales desde Excel
6. Crear versión interactiva HTML además del PDF
7. Mejorar portada con claims de valor más grandes
8. Usar una fuente serif para títulos + sans para cuerpo
9. Agregar fotos de contexto o diagramas de instalación
10. Crear índice con números de página reales

### Sitio Web React
1. Integrar catálogo Chore-Time al sitio principal
2. Migrar productos reales de Excel a `Catalog.jsx`
3. Configurar EmailJS con credenciales reales
4. Activar `CatalogByBrand.jsx` con datos reales
5. Reemplazar placeholders SVG de catálogos por imágenes reales

---

## 📝 NOTAS PARA PRÓXIMAS SESIONES

- **Usuario principal:** Ing. Carlos Urbina
- **Rol del asistente:** Apoyar en diseño, desarrollo web, generación de documentos, automatización de catálogos, y SGC V2
- **Estilo preferido:** Profesional, corporativo, limpio. 3P es una empresa seria con 27+ años de trayectoria.
- **Colores dominantes:** Rojo `#C41E3A` y Azul `#1E3A8A` para web. Púrpura/rojo para catálogo Chore-Time.
- **Flujo de trabajo:** Código/scripts en PC local → Resultados/imágenes en OneDrive (`G:\Mi unidad\pagina web\CATALOGO\`)
- **Regla de oro:** Siempre verificar consistencia entre marcas mostradas en diferentes componentes

---

*Este documento se actualiza al final de cada sesión de trabajo significativa.*
