// Datos curados de GEORGIA POULTRY (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["georgia-poultry"] (generado desde Excel) por código exacto.
// Georgia Poultry Equipment Co. es la división avícola de distribución de Hog Slat, Inc.
// (Newton Grove, NC, desde 1969); marca de producto propia: GrowerSELECT®.
// Categorías alineadas al flyer oficial "Georgia Poultry - Feed Systems Equipment" (01-2025):
// Feed Systems, Feeder Parts (Classic Flood), Feed Bins, Drive Units y Shocker line.
// Fuentes: hogslat.com (flyer y manual GrowerSELECT Poultry Feed Systems).
// Nota: "FA90" es nomenclatura del sistema (Flex-Auger es marca de Chore-Time);
// el sinfín oficial de Georgia Poultry es Grow-Flex™. Se conservan las descripciones del Excel.

export const georgiaPoultryCurated = {
  categorias: [
    { id: "alimentacion", es: "Sistemas de alimentación", en: "Feed systems" },
    { id: "comederos", es: "Comederos Classic Flood", en: "Classic Flood feeders" },
    { id: "silos", es: "Silos y accesorios", en: "Feed bins & accessories" },
    { id: "accionamiento", es: "Motores y accionamiento", en: "Drive units" },
    { id: "shocker", es: "Línea de choque (shocker)", en: "Shocker line" },
    { id: "clima", es: "Clima y controles", en: "Climate & controls" },
  ],
  productos: {
    // Sistemas de alimentación (línea oficial Feed Systems: auger, tubos, cajetín, clamps)
    "H001": { categoria: "alimentacion" },
    "H006": { categoria: "alimentacion" },
    "H100974-500": { categoria: "alimentacion" },
    "H103028-C": { categoria: "alimentacion" },
    "H13202957-C": { categoria: "alimentacion" },
    "H13204011": { categoria: "alimentacion" },
    "H537": { categoria: "alimentacion" },
    "H538": { categoria: "alimentacion" },
    "H60399": { categoria: "alimentacion" },
    "H60638": { categoria: "alimentacion" },
    "H6942-70": { categoria: "alimentacion" },
    "HS623": { categoria: "alimentacion" },

    // Comederos y partes Classic Flood (línea oficial Feeder Parts)
    "H3102076S": { categoria: "comederos" },
    "H8000-2": {
      categoria: "comederos",
      info: {
        es: "Rejilla de 14 brazos (14 spoke grill) del comedero Classic Flood.",
        en: "14-spoke grill for the Classic Flood feeder.",
      },
    },
    "H8000-3": { categoria: "comederos" },
    "H80005R MX": { categoria: "comederos" },
    "H80006R MX": { categoria: "comederos" },
    "H80007": { categoria: "comederos" },
    "HS525": { categoria: "comederos" },
    "HS577": {
      categoria: "comederos",
      info: {
        es: "Gota Kwik-Start (Kwik-Start Chick Feeder) para la iniciación de pollitos en líneas de alimentación.",
        en: "Kwik-Start drop (Kwik-Start Chick Feeder) for chick initiation on feed lines.",
      },
    },

    // Silos y accesorios (línea oficial Feed Bins)
    "H792": { categoria: "silos" },
    "H926040": {
      categoria: "silos",
      info: {
        es: "Escalera para silo con jaula de seguridad (safety cage); obligatoria por normas OSHA cuando la altura de llenado supera 25 ft.",
        en: "Feed bin ladder with safety cage; required by OSHA standards when fill height exceeds 25 ft.",
      },
    },

    // Motores y unidades de accionamiento (línea oficial Drive Units)
    "H10109148": { categoria: "accionamiento" },
    "H104083": { categoria: "accionamiento" },
    "H13107081": { categoria: "accionamiento" },
    "H13107172": {
      categoria: "accionamiento",
      info: {
        es: "Reductor GrowerSELECT (modelo HSGR002, relación 4.90, 352 RPM) para unidades de accionamiento de líneas de alimentación.",
        en: "GrowerSELECT gear reducer (model HSGR002, ratio 4.90, 352 RPM) for feed line drive units.",
      },
    },
    "H3102548": { categoria: "accionamiento" },
    "HSP03": { categoria: "accionamiento" },

    // Línea de choque (línea oficial Shocker line: hilo, aisladores y resortes
    // que estabilizan los comederos colgantes, p. ej. Classic Flood)
    "H101659": {
      categoria: "shocker",
      info: {
        es: "Resorte para línea de choque (shocker line) de comederos colgantes.",
        en: "Spring for the shocker line of hanging feeders.",
      },
    },
    "H102681": {
      categoria: "shocker",
      info: {
        es: "Aislador con abrazadera para línea de choque (shocker line).",
        en: "Insulator with clamp for the shocker line.",
      },
    },
    "H103168 X": {
      categoria: "shocker",
      info: {
        es: "Hilo conductor de la línea de choque (shocker line) que estabiliza los comederos colgantes.",
        en: "Conductor wire of the shocker line that stabilizes hanging feeders.",
      },
    },

    // Clima y controles
    "H40741": { categoria: "clima" },
    "H500-83201 MX": { categoria: "clima" },
  },
};
