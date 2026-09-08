// Datos curados de AMT (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["amt"] (generado desde Excel) por código exacto.
// AMT = Agricultural Mfg. & Textiles, Inc. (Laurens, Carolina del Sur, EE. UU.,
// desde 1975; amt-usa.com). Fabricante/distribuidor de equipo de suspensión e izaje
// para avicultura: "la mayor selección de malacates y bandas de huevo en inventario
// en América del Norte". Los 3 productos 3P coinciden con SKUs oficiales AMT
// verificados foto contra foto en amt-usa.com.
// Categorías alineadas a la taxonomía oficial: Winches & Accessories, Pulleys,
// Cord & Cable Fittings.

export const amtCurated = {
  categorias: [
    { id: "winches", es: "Malacates", en: "Winches" },
    { id: "poleas", es: "Poleas", en: "Pulleys" },
    { id: "cord", es: "Ajustadores y cordón", en: "Cord adjusters" },
  ],
  productos: {
    // Winches & Accessories (línea oficial)
    "102368 AMT": {
      categoria: "winches",
      info: {
        es: "Malacate de techo H3000 (3,000 lb) de AMT para ajustar líneas de bebida y alimentación; transmisión de tornillo sinfín autorretenible. Aviso oficial: engrasar los engranes antes de cada ciclo y usar taladro solo a baja velocidad.",
        en: "AMT H3000 ceiling winch (3,000 lb) for adjusting feed and water lines; self-locking worm gear drive. Official notice: grease gears before each cycle and use a drill only at low speed.",
      },
    },

    // Pulleys (línea oficial)
    "100420 AMT": {
      categoria: "poleas",
      info: {
        es: "Polea maestra de hierro fundido de 3½\" con soporte zincado; ranura profunda para cable hasta 1/4\", capacidad máxima 400 lb. Para líneas de cortina, comederos y bebederos.",
        en: '3½" cast iron master pulley with galvanized bracket; deep groove for cable up to 1/4", 400 lb max capacity. For curtain, feeder and drinker lines.',
      },
    },

    // Cord & Cable Fittings (línea oficial)
    "19200 AMT": {
      categoria: "cord",
      info: {
        es: "Ajustador de cordón (cord adjuster) de 1/8\" para equipo suspendido; ajusta la altura de bebederos y comederos suspendidos. SKU oficial AMT 19200.",
        en: '1/8" cord adjuster for suspended equipment; adjusts the height of suspended drinkers and feeders. Official AMT SKU 19200.',
      },
    },
  },
};
