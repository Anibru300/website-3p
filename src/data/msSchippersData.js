/**
 * Datos de MS Schippers para la página de catálogo.
 * Incluye líneas de producto de higiene/bioseguridad y catálogo individual
 * procesado desde el Excel de existencias del almacén 41.
 */

export const msSchippersBrand = {
  id: 'ms-schippers',
  name: 'MS Schippers',
  origin: 'Países Bajos',
  slogan: 'Higiene y bioseguridad para granjas avícolas y porcícolas',
  description:
    'MS Schippers es líder europeo en productos de higiene, limpieza, desinfección y bioseguridad para la industria ganadera. Distribuimos sus soluciones de forma oficial en México desde León, Guanajuato.',
  keywords:
    'MS Schippers, higiene granjas, bioseguridad, limpieza avícola, desinfección porcicultura, DIOclean, DryCare, TopFoam, HyBag',
  color: '#0F766E',
  logo: '/images/brands/ms-schippers.svg',
  officialUrl: 'https://www.msschippers.com',
  whatsapp: '524771284661',
  phone: '+52 477 128 4661',
  email: 'trespsadecv@hotmail.com',
};

export const msSchippersLines = [
  {
    id: 'dioclean',
    name: 'DIOclean',
    tagline: 'Potabilización del agua de bebida',
    category: 'Tratamiento de agua',
    description:
      'Dióxido de cloro estabilizado para el tratamiento del agua de bebida en granjas avícolas, porcícolas y bovinas. Elimina biofilm, patógenos y mejora la ingesta de agua y alimento.',
    benefits: [
      'Elimina el biofilm existente en tuberías y previene su formación',
      'Acaba con patógenos y reduce la presión de enfermedades',
      'No depende del pH (efectivo de pH 2 a 10)',
      'No corroe el sistema de agua potable después de la dosificación',
      '260 % más eficaz que desinfectantes a base de cloro',
      'No afecta olor ni sabor del agua',
      'Aplicable en bajas concentraciones (50 - 100 PPM)',
      'No bloquea los niples de bebida',
    ],
    applications: ['Agua de bebida', 'Limpieza de tuberías', 'Control de biofilm'],
    image: '/images/catalogo/schippers/dioclean.jpg',
    pdfs: {
      a: { url: '/catalogs/DIOcleanA2025.pdf', label: 'Folleto DIOclean (frente)', size: '2.6 MB' },
      b: { url: '/catalogs/DIOCleanB2025.pdf', label: 'Folleto DIOclean (reverso)', size: '2.6 MB' },
    },
    color: 'from-blue-600 to-cyan-600',
    bgColor: '#0EA5E9',
  },
  {
    id: 'drycare',
    name: 'MS DryCare',
    tagline: 'Polvo secante de alta absorción',
    category: 'Manejo de lecho',
    description:
      'Polvo secante con alta capacidad de absorción (>200 %) que ayuda a mantener un ambiente de vida limpio y con olor agradable. Ideal para áreas de cría de aves y cerdos.',
    benefits: [
      'Absorción de humedad superior al 200 %',
      'Buena distribución sin generar polvo en el aire',
      'Fragancia a eucalipto para ambiente confortable',
      'pH neutro que previene irritación',
      'Cubre adecuadamente la superficie',
      'Reduce y neutraliza olores desagradables',
    ],
    applications: ['Lecho de aves', 'Lecho de cerdos', 'Zonas húmedas', 'Mantenimiento de nave'],
    image: '/images/catalogo/schippers/drycare.jpg',
    pdfs: {
      a: { url: '/catalogs/DryCareA2025.pdf', label: 'Folleto DryCare (frente)', size: '2.8 MB' },
      b: { url: '/catalogs/DryCareB2025.pdf', label: 'Folleto DryCare (reverso)', size: '3.8 MB' },
    },
    color: 'from-amber-500 to-orange-500',
    bgColor: '#F97316',
  },
  {
    id: 'topfoam',
    name: 'MS TopFoam Power',
    tagline: 'El limpiador de espuma más potente',
    category: 'Limpieza de granjas',
    description:
      'Limpiador espumoso de alta adherencia para la limpieza de galpones, galeras y equipos antes de la desinfección. Elimina contaminación orgánica intensa y ahorra tiempo, agua y producto.',
    benefits: [
      'Ahorra un 30 % de tiempo de mano de obra y un 30 % de agua',
      'Excelente adherencia a superficies verticales (>60 min)',
      'Penetra activamente la suciedad',
      'Elimina grasa, proteína, estiércol, pienso y orina',
      'Reduce la carga de patógenos antes de la desinfección',
      'Nueva fórmula con aroma fresco y sin EDTA',
      'Biodegradable',
    ],
    applications: ['Limpieza de galpones', 'Limpieza de galeras', 'Equipos de granja', 'Pre-desinfección'],
    image: '/images/catalogo/schippers/topfoam-power.jpg',
    pdfs: {
      a: { url: '/catalogs/TopFoamA2025.pdf', label: 'Folleto TopFoam (frente)', size: '7.5 MB' },
      b: { url: '/catalogs/TopFoamB2025.pdf', label: 'Folleto TopFoam (reverso)', size: '9.3 MB' },
    },
    color: 'from-green-600 to-emerald-700',
    bgColor: '#059669',
  },
  {
    id: 'hybag',
    name: 'HyBag + MS TopFoam Power',
    tagline: 'Sistema de dosificación limpio y seguro',
    category: 'Sistema de dosificación',
    description:
      'Sistema de bolsa HyBag diseñado para MS TopFoam Power. Garantiza un rendimiento óptimo, elimina el contacto directo con producto químico y mantiene un estándar alto y consistente.',
    benefits: [
      'Rendimiento 100 % óptimo con TopFoam Power',
      'Limpia hasta 280 m² con un solo HyBag',
      'Sin riesgo de contacto directo con químicos',
      'Acople rápido y fácil',
      'Funciona en todas las posiciones y ángulos',
      'Ergonómico, elimina levantamiento pesado',
      'Bolsas vacías van a reciclaje de plástico',
    ],
    applications: ['Dosificación de limpiador', 'Limpieza de instalaciones', 'Higiene de granja'],
    image: '/images/catalogo/schippers/hybag.jpg',
    pdfs: {
      a: { url: '/catalogs/FolletoHyBagA2025.pdf', label: 'Folleto HyBag (frente)', size: '2.8 MB' },
      b: { url: '/catalogs/FolletoHyBagB2025.pdf', label: 'Folleto HyBag (reverso)', size: '2.0 MB' },
    },
    color: 'from-teal-600 to-cyan-700',
    bgColor: '#0D9488',
  },
];

/**
 * Categorías para filtrar líneas de producto.
 */
export const msSchippersCategories = [
  { id: 'todas', nombre: 'Todas las líneas' },
  { id: 'agua', nombre: 'Tratamiento de agua' },
  { id: 'lecho', nombre: 'Manejo de lecho' },
  { id: 'limpieza', nombre: 'Limpieza de granjas' },
  { id: 'dosificacion', nombre: 'Dosificación' },
];

/**
 * Catálogo individual de productos del almacén 41.
 * Procesado desde CATALOGO MS.xlsx (hojas CATALOGO y EXISTENCIA).
 */
export const msSchippersProducts = [
  { codigo: '806012', nombre: 'Acomplamiento inox 2x1/4" rosca macho KEW', stock: 49, categoria: 'equipo', image: '/images/catalogo/schippers/stainless-connector.jpg'},
  { codigo: '4310099', nombre: 'Conexión rRacor KEW 1/4" rosca exterior MACHO pipa', stock: 10, categoria: 'equipo', image: '/images/catalogo/schippers/coupling-kew-male.jpg'},
  { codigo: '4309532', nombre: 'DIGI DOSER DI-O 10', stock: 2, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-10.png'},
  { codigo: '44309530', nombre: 'DIGI DOSER DI-O 2', stock: 11, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-2.jpg'},
  { codigo: '4309531', nombre: 'DIGI DOSER DI-O 5', stock: 3, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-5.png'},
  { codigo: '0807075C', nombre: 'ESPUMADORA C/ CONEX RAPID LS10', stock: 6, categoria: 'equipo', image: '/images/catalogo/schippers/espumadora-ls10.png'},
  { codigo: '808017', nombre: 'GREEN LINE 1.3', stock: 4, categoria: 'equipo', image: '/images/catalogo/schippers/greenline-mono-13.jpg'},
  { codigo: '807020', nombre: 'HY BAG PISTOLAESPUMADORA', stock: 5, categoria: 'equipo', image: '/images/catalogo/schippers/hybag-pistola-espumadora.png'},
  { codigo: 'CONEXRAPID', nombre: 'MS Conexión rápida', stock: 0, categoria: 'equipo' },
  { codigo: '0807173', nombre: 'MS Rosca de 0.7 MM', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-07mm.jpg'},
  { codigo: '0807174', nombre: 'MS Rosca de 0.8 MM', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-08mm.jpg'},
  { codigo: '0807175', nombre: 'MS Rosca de 0.9 MM', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-09mm.jpg'},
  { codigo: '3409680', nombre: 'PALA SONAJERA ROJA', stock: 0, categoria: 'equipo' },
  { codigo: '809599', nombre: 'PISTOLA ALTA PRESION KEW', stock: 0, categoria: 'equipo' },
  { codigo: '809660', nombre: 'PISTOLA ALTA PRESION KEW (ROJA)', stock: 9, categoria: 'equipo', image: '/images/catalogo/schippers/spray-gun-st2600.jpg'},
  { codigo: '3P GUN', nombre: 'PISTOLA NEBULIZADORA', stock: 2, categoria: 'equipo' },
  { codigo: '804589', nombre: 'conexión racor KEW 1/4" rosca interior HEMBRA pipa', stock: 23, categoria: 'equipo', image: '/images/catalogo/schippers/coupling-kew-female.jpg'},
  { codigo: '1905202', nombre: 'ANIMAL', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/animal.jpg' },
  { codigo: '1905201', nombre: 'ANIMAL 10 kg', stock: 44, categoria: 'higiene', image: '/images/catalogo/schippers/animal-10kg.jpg' },
  { codigo: '2506634/32', nombre: 'DIO CLEAN', stock: 198, categoria: 'higiene', image: '/images/catalogo/schippers/dioclean.jpg' },
  { codigo: '2509887', nombre: 'DRY CARE', stock: 904, categoria: 'higiene', image: '/images/catalogo/schippers/drycare.jpg' },
  { codigo: '2509913', nombre: 'FOOD ALK', stock: 25, categoria: 'higiene', image: '/images/catalogo/schippers/food-alk.jpg' },
  { codigo: '2505283', nombre: 'HY BAG', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/hybag.jpg' },
  { codigo: '2505283BOX', nombre: 'HY BAG CAJA CON 12', stock: 273, categoria: 'higiene', image: '/images/catalogo/schippers/hybag.jpg' },
  { codigo: 'MS PEROFIXER', nombre: 'PEROFIXER', stock: 0, categoria: 'higiene' },
  { codigo: 'Q5', nombre: 'Q5 G10 1LT CAUTERNARIO DE AMONIO', stock: 0, categoria: 'higiene' },
  { codigo: 'Q5-20', nombre: 'Q5 G10 20 LT CAUTERNARIO DE AMONIO', stock: 36, categoria: 'higiene' },
  { codigo: '2505222', nombre: 'T&T', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/tt-cleaner.jpg' },
  { codigo: '2505277', nombre: 'TOP FOAM POWER', stock: 1334, categoria: 'higiene', image: '/images/catalogo/schippers/topfoam-power.jpg' },
  { codigo: 'TERMOFER', nombre: 'DESINFECTANTE TRMOFER 1 LT', stock: 26, categoria: 'otro' },
  { codigo: '8800425', nombre: 'Bomba Acid, 10 litros, 5 bar, 1 bar inyector', stock: 0, categoria: 'refaccion', specs: 'Bomba de membrana dosificadora para ácidos orgánicos', image: '/images/catalogo/schippers/bomba-acid.png'},
  { codigo: '8800457', nombre: 'Bomba Di-O-Clean, 10 litros, 5 bar', stock: 2, categoria: 'refaccion', image: '/images/catalogo/schippers/dio-pump-10l.jpg'},
  { codigo: '8800430', nombre: 'Cabezal de bomba K, Digi Doser Acid', stock: 0, categoria: 'refaccion', specs: 'Refacción de bomba de membrana dosificadora de ácidos', image: '/images/catalogo/schippers/cabezal-bomba-acid.png'},
  { codigo: '8804514', nombre: 'Cabezal de bomba K, Digi Doser Di-O', stock: 4, categoria: 'refaccion', specs: 'Refacción para bomba de membrana Digi Doser Di-O', image: '/images/catalogo/schippers/cabezal-bomba-dio.png'},
  { codigo: '8804578', nombre: 'Inyector Acid, 3 bar, 1/2" 4x6', stock: 5, categoria: 'refaccion', specs: 'Refacción del inyector para bomba de membrana dosificadora', image: '/images/catalogo/schippers/inyector-acid.png'},
  { codigo: '8804949', nombre: 'Kit reparación GreenLine', stock: 7, categoria: 'refaccion', specs: 'Kit de O-ring (empaques) para mantenimiento de GreenLine', image: '/images/catalogo/schippers/kit-reparacion-greenline.png'},
  { codigo: '200075552', nombre: 'MS Boquilla de baja presión', stock: 6, categoria: 'refaccion' },
  { codigo: '8800286', nombre: 'MS Control De Sequedad 72 Cm Digi Doser (Sensor de nivel)', stock: 1, categoria: 'refaccion', image: '/images/catalogo/schippers/dry-run-guard.jpg'},
  { codigo: '8804535', nombre: 'Manguera de pres./asp. Digi Doser Di-O, 2 m', stock: 3, categoria: 'refaccion', specs: 'Manguera para inyector de bomba de membrana dosificadora', image: '/images/catalogo/schippers/manguera-pres-asp-dio.png'},
  { codigo: '8804594', nombre: 'Manguera de presión Digi Doser, 2m 4x6', stock: 2, categoria: 'refaccion', specs: 'Refacción manguera del inyector para bomba de membrana dosificadora', image: '/images/catalogo/schippers/manguera-presion-dio.png'},
  { codigo: '8800244', nombre: 'Pieza en T 90°, 40 x 1/2" x 40', stock: 2, categoria: 'refaccion', specs: 'T de PVC con reducción a 1/2" para conexión hidráulica', image: '/images/catalogo/schippers/pieza-t-90.png'},
  { codigo: '8800610', nombre: 'Repartidor de señal con cable', stock: 2, categoria: 'refaccion', specs: 'Refacción de manguera para bomba de membrana dosificadora', image: '/images/catalogo/schippers/repartidor-senal.png'},
  { codigo: '8804961', nombre: 'Tubo succión inox para Greenline', stock: 1, categoria: 'refaccion', image: '/images/catalogo/schippers/suction-lance-greenline.jpg'},
  { codigo: '2506634', nombre: 'Di-O-Clean Combi componente B, 0.425 kg', stock: 1, categoria: 'higiene', image: '/images/catalogo/schippers/dioclean-component-b.jpg', specs: 'Componente B (sólido) para preparar solución de dióxido de cloro' },
  { codigo: '4309530', nombre: 'MS Digi Doser Di-O 2', stock: 18, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-2.jpg', specs: 'Sistema dosificador para agregar Di-O-Clean al agua de bebida' },
  { codigo: '4309535', nombre: 'MS Digi Doser Acid 2', stock: 2, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-acid-2.jpg', specs: 'Sistema dosificador para ácidos orgánicos' },
  { codigo: '5070 WALL', nombre: 'MS Motobomba TopFoam Wall Demo', stock: 1, categoria: 'equipo', specs: 'Motobomba de pared para aplicación de espuma TopFoam' },
];

/**
 * Categorías para filtrar el catálogo individual.
 */
export const msSchippersProductCategories = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'higiene', nombre: 'Productos de higiene' },
  { id: 'equipo', nombre: 'Equipos y accesorios' },
  { id: 'refaccion', nombre: 'Refacciones' },
  { id: 'otro', nombre: 'Otros' },
];

/**
 * Mapeo de categoría a color/etiqueta visual.
 */
export const msSchippersCategoryMeta = {
  higiene: { label: 'Higiene', color: 'bg-green-100 text-green-700' },
  equipo: { label: 'Equipo', color: 'bg-blue-100 text-blue-700' },
  refaccion: { label: 'Refacción', color: 'bg-amber-100 text-amber-700' },
  otro: { label: 'Otro', color: 'bg-gray-100 text-gray-700' },
};

/**
 * Genera mensaje de WhatsApp para cotizar una línea de producto.
 */
export const whatsappLineUrl = (line, phone = msSchippersBrand.whatsapp) => {
  const text = encodeURIComponent(
    `Hola, me interesa cotizar productos de la línea MS Schippers: ${line.name}`
  );
  return `https://wa.me/${phone}?text=${text}`;
};

/**
 * Genera mensaje de WhatsApp para cotizar un producto específico.
 */
export const whatsappProductUrl = (product, phone = msSchippersBrand.whatsapp) => {
  const text = encodeURIComponent(
    `Hola, me interesa cotizar el producto MS Schippers: ${product.codigo} - ${product.nombre}`
  );
  return `https://wa.me/${phone}?text=${text}`;
};
