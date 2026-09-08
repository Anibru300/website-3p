// Datos curados de L.B. WHITE (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["lbwhite"] (generado desde Excel) por código exacto.
// L.B. White Company, LLC (Onalaska, Wisconsin, EE. UU., fundada 1947; filial de
// Modine Manufacturing desde 2025). Líder en calefactores de aire forzado de tiro
// directo para agricultura; línea Guardian® 2.0. Marca verificada en lbwhite.com.
// Categorías alineadas a la línea oficial Guardian: controles de encendido, válvulas
// de gas, eléctricos, motores/ventilación, interruptores de seguridad y gabinete.
// Fuentes: lbwhite.com, tabla oficial de especificaciones vía distribuidor (Hog Slat).
// Notas de terminología oficial: AD = encendido por chispa directa (Direct Spark
// Ignition), el número = miles de BTU/h (250 = 250,000 BTU/h); "tricapa" = recubrimiento
// oficial Tri-Shield® (galvanizado + epóxico + poliéster).

export const lbwhiteCurated = {
  categorias: [
    { id: "heater", es: "Heater Guardian®", en: "Guardian® heaters" },
    { id: "encendido", es: "Controles y encendido", en: "Ignition & controls" },
    { id: "gas", es: "Válvulas de gas", en: "Gas valves" },
    { id: "electrico", es: "Eléctricos", en: "Electrical" },
    { id: "ventilacion", es: "Motores y ventilación", en: "Motors & ventilation" },
    { id: "seguridad", es: "Interruptores de seguridad", en: "Safety switches" },
    { id: "gabinete", es: "Gabinete y chapa", en: "Cabinet & sheet metal" },
  ],
  productos: {
    // Calefactor completo
    "HEASPARK TRI": {
      categoria: "heater",
      info: {
        es: "Calefactor Guardian® 250 de L.B. White: aire forzado de tiro directo, hasta 250,000 BTU/h, gabinete con recubrimiento Tri-Shield® de tres capas.",
        en: "L.B. White Guardian® 250 heater: direct-fired forced air, up to 250,000 BTU/h, Tri-Shield® three-layer coated cabinet.",
      },
    },

    // Controles y encendido
    "500-24157": { categoria: "encendido" },
    "524900": { categoria: "encendido" },
    "570021": { categoria: "encendido" },
    "571333": { categoria: "encendido" },
    "574196": { categoria: "encendido" },
    "574286": { categoria: "encendido" },
    "574287": { categoria: "encendido" },

    // Válvulas de gas
    "522076": { categoria: "gas" },
    "522076.": { categoria: "gas" },
    "573774": { categoria: "gas" },

    // Eléctricos
    "509615": { categoria: "electrico" },
    "574289": { categoria: "electrico" },

    // Motores y ventilación
    "500-133429": { categoria: "ventilacion" },
    "520169": {
      categoria: "ventilacion",
      info: {
        es: "Motor para calefactor Guardian AD250 (encendido por chispa directa), generaciones 1.0 y 2.0.",
        en: "Motor for the Guardian AD250 heater (direct spark ignition), 1.0 and 2.0 generations.",
      },
    },
    "520169 NS": { categoria: "ventilacion" },
    "570481": { categoria: "ventilacion" },

    // Interruptores de seguridad
    "505566": { categoria: "seguridad" },
    "573099": { categoria: "seguridad" },
    "574239": { categoria: "seguridad" },

    // Gabinete y chapa
    "574421": { categoria: "gabinete" },
    "574424": { categoria: "gabinete" },
  },
};
