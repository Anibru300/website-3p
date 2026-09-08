// Datos curados de SBM (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["sbm"] (generado desde Excel) por código exacto.
// SBM = Société Bourguignonne de Mécanique (Clénay, Borgoña, Francia, desde 1946).
// Fabricante de calefacción radiante cerámica a gas; 100% fabricado en Francia,
// exporta a 65+ países. Marca verificada en sbm.fr.
// Categorías alineadas a la clasificación oficial (sbm.fr): élevage/criadoras
// (series XLA, ZRFS, FA), régulation (VisioLON/Sunmaster) y repuestos de gas.
// Fuentes: sbm.fr, fichas oficiales XLA, 20ZRFS y VisioLON (PDF).
// Nota: los fittings hidráulicos (códigos tipo 100B-12, 12FJX, B3455) son genéricos
// que 3P agrupa bajo el bloque SBM; no son fabricados por SBM Francia.

export const sbmCurated = {
  categorias: [
    { id: "criadoras", es: "Criadoras (éleveuses)", en: "Gas brooders" },
    { id: "quemadores", es: "Quemadores y repuestos", en: "Burners & parts" },
    { id: "control", es: "Control y regulación", en: "Control & regulation" },
    { id: "seguridad", es: "Válvulas y seguridad de gas", en: "Gas valves & safety" },
    { id: "gas", es: "Cuadros y regulación de gas", en: "Gas trains & regulation" },
    { id: "fittings", es: "Conectores y fittings", en: "Connectors & fittings" },
    { id: "filtros", es: "Filtros de aire", en: "Air filters" },
    { id: "kits", es: "Kits y accesorios de montaje", en: "Mounting kits & accessories" },
    { id: "electrico", es: "Eléctricos", en: "Electrical" },
  ],
  productos: {
    // Criadoras completas (oficialmente "éleveuses"; series XLA, ZRFS y FA)
    "3032002": {
      categoria: "criadoras",
      info: {
        es: "Criadora de la familia evolutiva ZRFS de SBM (infrarrojo radiante cerámico a gas).",
        en: "Brooder from SBM's ZRFS evolutionary family (ceramic gas radiant infrared).",
      },
    },
    "3124040": {
      categoria: "criadoras",
      info: {
        es: "Criadora de la serie FA de SBM, configurada para prueba de cuadro de gas.",
        en: "SBM FA-series brooder, set up for gas control panel testing.",
      },
    },
    "3174020": {
      categoria: "criadoras",
      info: {
        es: "Criadora radiante cerámica de la serie FA de SBM (infrarrojo por panel cerámico).",
        en: "SBM FA-series ceramic radiant brooder (ceramic panel infrared).",
      },
    },
    "3184070": {
      categoria: "criadoras",
      info: {
        es: "Criadora automática de infrarrojo cerámico, serie XLA de SBM; para gas natural o propano con encendido 50%/100%/STOP.",
        en: "Automatic ceramic infrared brooder, SBM XLA series; for natural gas or propane with 50%/100%/STOP ignition.",
      },
    },
    "3194004": { categoria: "criadoras" },

    // Quemadores, cerámicas, empaques y repuestos de criadoras
    "3020002": { categoria: "quemadores" },
    "3080003": { categoria: "quemadores" },
    "3160002": { categoria: "quemadores" },
    "3170000": { categoria: "quemadores" },
    "3170001": { categoria: "quemadores" },
    "3174020-E": { categoria: "quemadores" },
    "3180001": { categoria: "quemadores" },
    "5010400-MUESTRAS": { categoria: "quemadores" },
    "5016400-MUESTRA": { categoria: "quemadores" },
    "5016900": { categoria: "quemadores" },
    "5016901": { categoria: "quemadores" },
    "9804005": { categoria: "quemadores" },
    "9804007": { categoria: "quemadores" },
    "9804008": { categoria: "quemadores" },

    // Control y regulación (línea oficial Régulation: VisioLON, Sunmaster)
    "12ABB MUESTRA": { categoria: "control" },
    "8050203": {
      categoria: "control",
      info: {
        es: "Módulo de control VisioLON de SBM para radiantes; compatible con el ordenador de gestión de granja Sunmaster SAT (comunicación LonWorks).",
        en: "SBM VisioLON control module for radiant heaters; compatible with the Sunmaster SAT farm management computer (LonWorks communication).",
      },
    },
    "8050203 PRUE": { categoria: "control" },
    "8791002": { categoria: "control" },
    "8792001": { categoria: "control" },
    "8792001-C": { categoria: "control" },
    "8792002": { categoria: "control" },
    "8891007": { categoria: "control" },
    "8891012": { categoria: "control" },
    "ELE-0881": { categoria: "control" },

    // Válvulas, blocks de seguridad y encendido
    "3002-3001": { categoria: "seguridad" },
    "34431": { categoria: "seguridad" },
    "34431-PRUEBA": { categoria: "seguridad" },
    "3802001": { categoria: "seguridad" },
    "3802001.": { categoria: "seguridad" },
    "3803000": { categoria: "seguridad" },
    "3804001.": { categoria: "seguridad" },
    "3805000": { categoria: "seguridad" },
    "3805010": { categoria: "seguridad" },
    "3807000": { categoria: "seguridad" },
    "3807000-2": { categoria: "seguridad" },
    "3807000-2 PRUEBA": { categoria: "seguridad" },
    "3807000-3": { categoria: "seguridad" },
    "3807000-4": { categoria: "seguridad" },
    "3807001": { categoria: "seguridad" },
    "9800000": { categoria: "seguridad" },
    "9801002": { categoria: "seguridad" },
    "9801004": { categoria: "seguridad" },
    "9802005": { categoria: "seguridad" },
    "9803001": { categoria: "seguridad" },
    "9803002": { categoria: "seguridad" },
    "OARA-1": { categoria: "seguridad" },

    // Cuadros de gas, reguladores, filtros y manómetros
    "11000": { categoria: "gas" },
    "11001": { categoria: "gas" },
    "60F-6": { categoria: "gas" },
    "63.100.30": { categoria: "gas" },
    "3701115": { categoria: "gas" },
    "9700001": { categoria: "gas" },
    "9702001": { categoria: "gas" },
    "9801000": { categoria: "gas" },
    "9801001": { categoria: "gas" },
    "E-136": { categoria: "gas" },
    "G32A-KIT": { categoria: "gas" },
    "Q010038": { categoria: "gas" },
    "REG": { categoria: "gas" },
    "TA6.": { categoria: "gas" },

    // Conectores y fittings (genéricos; 3P los agrupa bajo el bloque SBM)
    "100B-12": { categoria: "fittings" },
    "101B-12": { categoria: "fittings" },
    "101B-4": { categoria: "fittings" },
    "110B-12-4": { categoria: "fittings" },
    "122B-4-4": { categoria: "fittings" },
    "123B-8-4": { categoria: "fittings" },
    "12FJX-12MP": { categoria: "fittings" },
    "12MJBKHD-12MP": { categoria: "fittings" },
    "12MP-12MP": { categoria: "fittings" },
    "4MP-4FPX": { categoria: "fittings" },
    "68F-6-4": { categoria: "fittings" },
    "69F-6-4": { categoria: "fittings" },
    "B3455-4-4": { categoria: "fittings" },

    // Filtros de aire para criadoras
    "3800013": { categoria: "filtros" },
    "3800015 SBM": { categoria: "filtros" },
    "3800017": { categoria: "filtros" },
    "3800018": { categoria: "filtros" },
    "3800019": { categoria: "filtros" },

    // Kits y accesorios de montaje
    "DUCHEA": { categoria: "kits" },
    "HEASKITEXT": { categoria: "kits" },
    "HEASKITEXTMOY": { categoria: "kits" },
    "HEASMANG": { categoria: "kits" },
    "HEASTORNKITEXT": { categoria: "kits" },

    // Eléctricos (portafusibles y fusibles)
    "10X38 MUESTRA": { categoria: "electrico" },
    "10X38-CF.": { categoria: "electrico" },
    "10X386A MUESTRA": { categoria: "electrico" },
  },
};
