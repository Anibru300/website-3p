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
    image: '/images/catalogo/schippers/dioclean-linea.jpg',
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
  { codigo: '806012', nombre: 'Stainless steel connector, 2x 1/4" male thread', stock: 49, categoria: 'equipo', image: '/images/catalogo/schippers/stainless-connector.jpg'},
  { codigo: '4310099', nombre: 'Coupling KEW, 1/4" male thread', stock: 10, categoria: 'equipo', image: '/images/catalogo/schippers/coupling-kew-male.jpg'},
  { codigo: '4309532', nombre: 'MS Digi Doser Di-O 10', stock: 2, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-10.png', lineId: 'dioclean'},
  { codigo: '44309530', nombre: 'DIGI DOSER DI-O 2', stock: 11, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-2.png'},
  { codigo: '4309531', nombre: 'MS Digi Doser Di-O 5', stock: 3, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-5.png', lineId: 'dioclean'},
  { codigo: '0807075C', nombre: 'ESPUMADORA C/ CONEX RAPID LS10', stock: 6, categoria: 'equipo', image: '/images/catalogo/schippers/espumadora-ls10.png', lineId: 'hybag'},
  { codigo: '808017', nombre: 'MS Greenline mono 1.3 tap', stock: 4, categoria: 'equipo', image: '/images/catalogo/schippers/greenline-mono-13.jpg'},
  { codigo: '807020', nombre: 'HY BAG PISTOLAESPUMADORA', stock: 5, categoria: 'equipo', image: '/images/catalogo/schippers/hybag-pistola-espumadora.png', lineId: 'hybag'},
  { codigo: 'CONEXRAPID', nombre: 'MS Conexión rápida', stock: 0, categoria: 'equipo', image: '/images/catalogo/schippers/conexrapid.png'},
  { codigo: '0807173', nombre: 'Restrictor (screw-thread) 0.7 mm', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-07mm.jpg'},
  { codigo: '0807174', nombre: 'Restrictor (screw-thread) 0.8 mm', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-08mm.jpg'},
  { codigo: '0807175', nombre: 'Restrictor (screw-thread) 0.9 mm', stock: 1, categoria: 'equipo', image: '/images/catalogo/schippers/restrictor-09mm.jpg'},
  { codigo: '3409680', nombre: 'Sorting paddle red, 102 cm', stock: 0, categoria: 'equipo' },
  { codigo: '809599', nombre: 'High pressure spray gun ST-2600, KEW (blue)', stock: 0, categoria: 'equipo' },
  { codigo: '809660', nombre: 'High pressure spray gun ST-2600, KEW', stock: 9, categoria: 'equipo', image: '/images/catalogo/schippers/spray-gun-st2600.jpg'},
  { codigo: '3P GUN', nombre: 'PISTOLA NEBULIZADORA', stock: 2, categoria: 'equipo', image: '/images/catalogo/schippers/3p-gun.png'},
  { codigo: '804589', nombre: 'Coupling KEW, 1/4" female thread', stock: 23, categoria: 'equipo', image: '/images/catalogo/schippers/coupling-kew-female.jpg'},
  { codigo: '1905202', nombre: 'MS TopFoam Animal, 20 kg', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/animal.jpg', lineId: 'topfoam'},
  { codigo: '1905201', nombre: 'MS TopFoam Animal, 10 kg', stock: 44, categoria: 'higiene', image: '/images/catalogo/schippers/animal-10kg.jpg', lineId: 'topfoam'},
  { codigo: '2506634/32', nombre: 'Di-O-Clean Combi 20/60 L, componentes A+B', stock: 198, categoria: 'higiene', image: '/images/catalogo/schippers/dioclean.jpg', lineId: 'dioclean'},
  { codigo: '2509887', nombre: 'MS DryCare, 25 kg', stock: 904, categoria: 'higiene', image: '/images/catalogo/schippers/drycare.jpg', lineId: 'drycare'},
  { codigo: '2509913', nombre: 'MS Food Alk 207, 23 kg', stock: 25, categoria: 'higiene', image: '/images/catalogo/schippers/food-alk.jpg' },
  { codigo: '2505283', nombre: 'HyBag® MS TopFoam Power, 12x 2.5 lbs (12x 1,134 kg)', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/hybag.jpg', lineId: 'hybag'},
  { codigo: '2505283BOX', nombre: 'HyBag® MS TopFoam Power, caja con 12 bolsas', stock: 273, categoria: 'higiene', image: '/images/catalogo/schippers/hybag.jpg', lineId: 'hybag'},
  { codigo: 'MS PEROFIXER', nombre: 'PEROFIXER', stock: 0, categoria: 'higiene' },
  { codigo: 'Q5', nombre: 'Q5 G10 1LT CAUTERNARIO DE AMONIO', stock: 0, categoria: 'higiene' },
  { codigo: 'Q5-20', nombre: 'Q5 G10 20 LT CAUTERNARIO DE AMONIO', stock: 36, categoria: 'higiene', image: '/images/catalogo/schippers/q5-20.png'},
  { codigo: '2505222', nombre: 'MS T&T Cleaner 2.0, 22 kg', stock: 0, categoria: 'higiene', image: '/images/catalogo/schippers/tt-cleaner.jpg', lineId: 'topfoam'},
  { codigo: '2505277', nombre: 'MS TopFoam Power, 22 kg', stock: 1334, categoria: 'higiene', image: '/images/catalogo/schippers/topfoam-power.jpg', lineId: 'topfoam'},
  { codigo: 'TERMOFER', nombre: 'DESINFECTANTE TRMOFER 1 LT', stock: 26, categoria: 'otro', image: '/images/catalogo/schippers/termofer.png'},
  { codigo: '8800425', nombre: 'Bomba Acid, 10 litros, 5 bar, 1 bar inyector', stock: 0, categoria: 'refaccion', specs: 'Bomba de membrana dosificadora para ácidos orgánicos', image: '/images/catalogo/schippers/bomba-acid.png', lineId: 'dioclean'},
  { codigo: '8800457', nombre: 'Di-O-Clean pump, 10 L, 5 bar P&P', stock: 2, categoria: 'refaccion', image: '/images/catalogo/schippers/dio-pump-10l.jpg', lineId: 'dioclean'},
  { codigo: '8800430', nombre: 'Cabezal de bomba K, Digi Doser Acid', stock: 0, categoria: 'refaccion', specs: 'Refacción de bomba de membrana dosificadora de ácidos', image: '/images/catalogo/schippers/cabezal-bomba-acid.png', lineId: 'dioclean'},
  { codigo: '8804514', nombre: 'Cabezal de bomba K, Digi Doser Di-O', stock: 4, categoria: 'refaccion', specs: 'Refacción para bomba de membrana Digi Doser Di-O', image: '/images/catalogo/schippers/cabezal-bomba-dio.png', lineId: 'dioclean'},
  { codigo: '8804578', nombre: 'Inyector Acid, 3 bar, 1/2" 4x6', stock: 5, categoria: 'refaccion', specs: 'Refacción del inyector para bomba de membrana dosificadora', image: '/images/catalogo/schippers/inyector-acid.png', lineId: 'dioclean'},
  { codigo: '8804949', nombre: 'Kit reparación GreenLine', stock: 7, categoria: 'refaccion', specs: 'Kit de O-ring (empaques) para mantenimiento de GreenLine', image: '/images/catalogo/schippers/kit-reparacion-greenline.png'},
  { codigo: '200075552', nombre: 'MS Boquilla de baja presión', stock: 6, categoria: 'refaccion' },
  { codigo: '8800286', nombre: 'Dry run guard lasp 72 cm Digi Doser', stock: 1, categoria: 'refaccion', image: '/images/catalogo/schippers/dry-run-guard.jpg', lineId: 'dioclean'},
  { codigo: '8804535', nombre: 'Manguera de pres./asp. Digi Doser Di-O, 2 m', stock: 3, categoria: 'refaccion', specs: 'Manguera para inyector de bomba de membrana dosificadora', image: '/images/catalogo/schippers/manguera-pres-asp-dio.png', lineId: 'dioclean'},
  { codigo: '8804594', nombre: 'Manguera de presión Digi Doser, 2m 4x6', stock: 2, categoria: 'refaccion', specs: 'Refacción manguera del inyector para bomba de membrana dosificadora', image: '/images/catalogo/schippers/manguera-presion-dio.png', lineId: 'dioclean'},
  { codigo: '8800244', nombre: 'Pieza en T 90°, 40 x 1/2" x 40', stock: 2, categoria: 'refaccion', specs: 'T de PVC con reducción a 1/2" para conexión hidráulica', image: '/images/catalogo/schippers/pieza-t-90.png'},
  { codigo: '8800610', nombre: 'Repartidor de señal con cable', stock: 2, categoria: 'refaccion', specs: 'Refacción de manguera para bomba de membrana dosificadora', image: '/images/catalogo/schippers/repartidor-senal.png'},
  { codigo: '8804961', nombre: 'Suction lance stainl. steel MS Greenline', stock: 1, categoria: 'refaccion', image: '/images/catalogo/schippers/suction-lance-greenline.jpg'},
  { codigo: '2506634', nombre: 'Di-O-Clean Combi 20/60 L, component B 0,425 kg', stock: 1, categoria: 'higiene', image: '/images/catalogo/schippers/dioclean-component-b.jpg', specs: 'Componente B (sólido) para preparar solución de dióxido de cloro', lineId: 'dioclean'},
  { codigo: '4309530', nombre: 'MS Digi Doser Di-O 2', stock: 18, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-dio-2.png', specs: 'Sistema dosificador para agregar Di-O-Clean al agua de bebida', lineId: 'dioclean'},
  { codigo: '4309535', nombre: 'MS Digi Doser Acid 2', stock: 2, categoria: 'equipo', image: '/images/catalogo/schippers/digi-doser-acid-2.jpg', specs: 'Sistema dosificador para ácidos orgánicos', lineId: 'dioclean'},
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
