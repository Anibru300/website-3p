// Datos curados de ALKE (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["alke"] (generado desde Excel) por código exacto.
// ALKE = Alke B.V. (Scherpenzeel, Países Bajos, fundada 1974 por Alphen y
// Keurhorst; "Heating Technology"). Fabricante de calefactores infrarrojos a gas
// para avicultura (series cerámica 41/61/81 y Global), presente en 90+ países.
// Marca verificada en alke.nl y en el manual oficial Alke Ceramic 41-61-81.
// Fuentes: alke.nl, manual oficial (marzo 2018), listas de partes impresas por Alke.
// Nota de veracidad: el termopar M8x1 es parte de consumo oficial ALKE (#28);
// la longitud 520, el "fusible oculto" y la extensión L250 NO están publicadas
// por ALKE — se tratan como especificación comercial, no como dato del fabricante.

export const alkeCurated = {
  categorias: [
    { id: "termopares", es: "Termopares", en: "Thermocouples" },
    { id: "accesorios", es: "Accesorios", en: "Accessories" },
  ],
  productos: {
    // Termopares (parte de consumo oficial ALKE, manual 41/61/81)
    "202015": {
      categoria: "termopares",
      info: {
        es: "Termopar de repuesto genuino ALKE, rosca M8x1, para el dispositivo de seguridad de gas (flame failure valve) de criadoras de la serie cerámica 41/61/81; pieza de consumo oficial.",
        en: "Genuine ALKE replacement thermocouple, M8x1 thread, for the gas safety device (flame failure valve) of the 41/61/81 ceramic brooder series; official consumable part.",
      },
    },

    // Accesorios (canal de distribución; no listado como parte OEM ALKE)
    "198000": {
      categoria: "accesorios",
      info: {
        es: "Extensión de termopar con racores M8xM8 para alargar el cableado del termopar en instalaciones de gas.",
        en: "Thermocouple extension with M8xM8 fittings to extend thermocouple wiring in gas installations.",
      },
    },
  },
};
