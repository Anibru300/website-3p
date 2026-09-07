// Datos curados de LUBING (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["lubing"] (generado desde Excel) por código exacto.
// Categorías alineadas a las líneas oficiales: Drinking-, Conveyor- y Climate-Systems.
// Fuentes: lubing.com / lubing.de, manuales oficiales y distribuidores autorizados.

export const lubingCurated = {
  categorias: [
    { id: "bebida", es: "Sistemas de bebida", en: "Drinking systems" },
    { id: "clima", es: "Sistemas de clima", en: "Climate systems" },
    { id: "transporte", es: "Sistemas de transporte", en: "Conveyor systems" },
    { id: "alimentacion", es: "Alimentación (Novicor)", en: "Feeding (Novicor)" },
    { id: "agua", es: "Preparación de agua y dosificación", en: "Water supply & dosing" },
    { id: "electrico", es: "Componentes eléctricos", en: "Electrical components" },
    { id: "montaje", es: "Accesorios y montaje", en: "Accessories & hardware" },
  ],
  productos: {
    // Sistemas de bebida (línea oficial Drinking-Systems)
    "13200800": { categoria: "bebida" },
    "13701903": { categoria: "bebida" },
    "302002900": { categoria: "bebida" },
    "302003600": { categoria: "bebida" },
    "302401300": { categoria: "bebida" },
    "302402100": { categoria: "bebida" },
    "302403601": { categoria: "bebida" },
    "302501500": { categoria: "bebida" },
    "302501501": { categoria: "bebida" },
    "302501502": { categoria: "bebida" },
    "3201-00 V": {
      categoria: "bebida",
      info: {
        es: "Regulador de presión OPTIMA LUBING para líneas de bebida; ajuste de columna de agua hasta 1 m.",
        en: "LUBING OPTIMA water pressure regulator for drinking lines; water column adjustment up to 1 m.",
      },
    },
    "3201-101": {
      categoria: "bebida",
      info: {
        es: "Válvula de autolavado (flushing) para reguladores de línea de bebida LUBING.",
        en: "Flushing valve for LUBING drinking line regulators.",
      },
    },
    "3201-6": {
      categoria: "bebida",
      info: {
        es: "Regulador de presión de línea LUBING con manguera de 600 mm para líneas de bebida.",
        en: "LUBING line pressure regulator with 600 mm hose for drinking lines.",
      },
    },
    "3325-00": { categoria: "bebida" },
    "4024": {
      categoria: "bebida",
      info: {
        es: "Niple bebedero LUBING Type D para pollo de engorda, ponedoras y reproductoras.",
        en: "LUBING Type D drinking nipple for broilers, layers and breeders.",
      },
    },
    "4079-01": {
      categoria: "bebida",
      info: {
        es: "Niple J-Lock LUBING (Type C), cuerpo de plástico amarillo, con acción vertical y lateral.",
        en: "LUBING J-Lock nipple (Type C), yellow plastic body, vertical and side action.",
      },
    },
    "4102": { categoria: "bebida" },
    "4255": {
      categoria: "bebida",
      info: {
        es: "Respiadero (breather unit) con desagüe para extremo de línea de bebida.",
        en: "Breather unit with drain for the end of drinking lines.",
      },
    },
    "4255-6": { categoria: "bebida" },
    // Verificado: oficialmente "regulador de pendiente" (Gefällesteller), no rompedor de presión
    "4274": {
      categoria: "bebida",
      info: {
        es: "Regulador de pendiente LUBING para compensar diferencias de altura de 10 cm entre líneas de bebida.",
        en: "LUBING slope regulator to compensate 10 cm height difference between drinking lines.",
      },
    },
    "4275": {
      categoria: "bebida",
      info: {
        es: "Regulador de pendiente LUBING para compensar diferencias de altura de 15 cm entre líneas de bebida.",
        en: "LUBING slope regulator to compensate 15 cm height difference between drinking lines.",
      },
    },
    "4276": {
      categoria: "bebida",
      info: {
        es: "Regulador de pendiente LUBING para compensar diferencias de altura de 20 cm entre líneas de bebida.",
        en: "LUBING slope regulator to compensate 20 cm height difference between drinking lines.",
      },
    },
    "4276-6": { categoria: "bebida" },
    "4311-00": { categoria: "bebida" },
    "4311-00 E": { categoria: "bebida" },
    "4312-00": { categoria: "bebida" },
    "4901300": { categoria: "bebida" },

    // Sistemas de clima (línea oficial Climate-Systems: pad cooling y fogging)
    "011148": {
      categoria: "clima",
      info: {
        es: "Panel para sistema de enfriamiento evaporativo (pad cooling) LUBING.",
        en: "Panel for LUBING evaporative cooling (pad cooling) system.",
      },
    },
    "222110": { categoria: "clima" },
    "7340": {
      categoria: "clima",
      info: {
        es: "Boquilla de latón 0,2 mm para el sistema de nebulización de alta presión Top Climate LUBING.",
        en: "0.2 mm brass nozzle for the LUBING Top Climate high-pressure fogging system.",
      },
    },
    "7631": { categoria: "clima" },
    "7820": {
      categoria: "clima",
      info: {
        es: "Boquilla FlexClamp de latón 0,2 mm para sistema de nebulización de alta presión LUBING.",
        en: "0.2 mm FlexClamp brass nozzle for LUBING high-pressure fogging system.",
      },
    },
    "7930": { categoria: "clima" },

    // Sistemas de transporte (línea oficial Conveyor-Systems)
    "1855152200": { categoria: "transporte" },
    "1855400402": { categoria: "transporte" },
    "4821": {
      categoria: "transporte",
      info: {
        es: "Rollo de cadena transportadora Type 500 para sistema Conveyor LUBING.",
        en: "Type 500 conveyor chain roll for the LUBING Conveyor system.",
      },
    },

    // NOVICOR es marca Roxell (no LUBING): tubo/curvas para sinfín de alimentación Flex-Auger
    "L3100542": {
      categoria: "alimentacion",
      info: {
        es: "Curva NOVICOR (marca Roxell) para sistema de alimentación por sinfín Flex-Auger.",
        en: "NOVICOR bend (Roxell brand) for the Flex-Auger feed system.",
      },
    },
    "L3200300": {
      categoria: "alimentacion",
      info: {
        es: "Tubo NOVICOR FA90 (marca Roxell) para sistema de alimentación por sinfín Flex-Auger.",
        en: "NOVICOR FA90 tube (Roxell brand) for the Flex-Auger feed system.",
      },
    },
    "L3200326": {
      categoria: "alimentacion",
      info: {
        es: "Curva de 45° NOVICOR FA90 (marca Roxell) para sistema de alimentación por sinfín.",
        en: "45° NOVICOR FA90 bend (Roxell brand) for the auger feed system.",
      },
    },

    // Preparación de agua y dosificación
    "1-60-F1": { categoria: "agua" },
    "3870-1": { categoria: "agua" },
    "7401": { categoria: "agua" },
    "WP1\"-DF": { categoria: "agua" },
    "4237-1": {
      categoria: "agua",
      info: {
        es: "Dosificador proporcional Dosatron D25 (0,2–2 %) integrado en sistemas de bebida LUBING.",
        en: "Dosatron D25 proportional doser (0.2–2%) integrated in LUBING drinking systems.",
      },
    },

    // Componentes eléctricos
    "132": { categoria: "electrico" },
    "5130010": { categoria: "electrico" },
    "7163": { categoria: "electrico" },

    // Accesorios y montaje
    "01/04/2020": { categoria: "montaje" },
    "1/4-20X1/2": { categoria: "montaje" },
    "12040": { categoria: "montaje" },
    "14181": { categoria: "montaje" },
    "16701165": { categoria: "montaje" },
    "200550": { categoria: "montaje" },
    "2205035": { categoria: "montaje" },
    "222200": { categoria: "montaje" },
    "222720": { categoria: "montaje" },
    "23185-A": { categoria: "montaje" },
    "3006203": { categoria: "montaje" },
    "301200300": { categoria: "montaje" },
    "301300101": { categoria: "montaje" },
    "3100302": { categoria: "montaje" },
    "3303-00": { categoria: "montaje" },
    "3305-00": { categoria: "montaje" },
    "3342-00": { categoria: "montaje" },
    "40681": { categoria: "montaje" },
    "4213-05": { categoria: "montaje" },
    "4315": { categoria: "montaje" },
    "4351": { categoria: "montaje" },
    "4363": { categoria: "montaje" },
    "4376": { categoria: "montaje" },
    "4381": { categoria: "montaje" },
  },
};
