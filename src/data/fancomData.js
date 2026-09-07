// Datos curados de FANCOM (categorías y enriquecimiento verificado).
// Se fusiona con brandCatalogs["fancom"] (generado desde Excel) por código exacto.
// Fuente de verificación: fancom.com y documentación oficial (ver notas por producto).

export const fancomCurated = {
  categorias: [
    { id: "clima", es: "Control de clima y automatización", en: "Climate control & automation" },
    { id: "ventilacion", es: "Ventilación", en: "Ventilation" },
    { id: "sensores", es: "Sensores y medición", en: "Sensors & measurement" },
    { id: "actuadores", es: "Actuadores, malacates y pesaje", en: "Actuators, winches & weighing" },
    { id: "enfriamiento", es: "Enfriamiento y humidificación", en: "Cooling & humidification" },
    { id: "conectividad", es: "Conectividad y comunicación", en: "Connectivity & communication" },
    { id: "electricos", es: "Componentes eléctricos", en: "Electrical components" },
    { id: "montaje", es: "Tornillería y montaje", en: "Hardware & mounting" },
  ],
  productos: {
    // Control de clima y automatización
    A1240667: { categoria: "clima" },
    "A1471008.05": { categoria: "clima" },
    "A1471009.05": { categoria: "clima" },
    A1471020: { categoria: "clima" },
    A1471022: { categoria: "clima" },
    A1471032: { categoria: "clima" },
    "A1541022.05": { categoria: "clima" },
    "A1541032.05": { categoria: "clima" },
    "A1755026.01": { categoria: "clima" },
    A1755030: { categoria: "clima" },
    "A1755051.05": { categoria: "clima" },
    A1755055: { categoria: "clima" },
    A1755110: { categoria: "clima" },
    "A1755112.05": { categoria: "clima" },
    A1799021: { categoria: "clima" },
    // Código con descripción original con falta ortográfica ("TJETA"); se corrige aquí.
    A3470070: {
      categoria: "clima",
      descripcion: "TARJETA IOB 5T4 BOARD A0 F35,37",
    },
    "A3470119.06": { categoria: "clima" },
    A3480036: { categoria: "clima" },
    A3739026: { categoria: "clima" },
    A3755045: { categoria: "clima" },
    A3799020: { categoria: "clima" },
    A3851003: { categoria: "clima" },
    "A5100101.60": { categoria: "clima" },
    // Chip de actualización para Lumina 765.e (serie de cultivo de hongos de Fancom).
    "A5103024.14": {
      categoria: "clima",
      info: {
        es: "Actualización (chip) para la computadora de clima Lumina 765.e, serie Fancom para cultivo de hongos.",
        en: "Update chip for the Lumina 765.e climate computer, Fancom series for mushroom growing.",
      },
    },
    A5105085: { categoria: "clima" },
    "A5105085-GAR": { categoria: "clima" },

    // Ventilación
    A160316: { categoria: "ventilacion" },
    A2319057: { categoria: "ventilacion" },
    A2319072: { categoria: "ventilacion" },
    A2319259: { categoria: "ventilacion" },
    A2859537: { categoria: "ventilacion" },
    A2859544: { categoria: "ventilacion" },
    A3080040: { categoria: "ventilacion" },
    // Código con descripción original con doble C ("CONECCION"); se corrige aquí.
    A3859034: {
      categoria: "ventilacion",
      descripcion: "KIT DE CONEXION PARA FANTURA",
    },
    // Trampa de luz PERIdark, fabricada por Pericoli.
    A4319015: {
      categoria: "ventilacion",
      info: {
        es: "Trampa de luz PERIdark (fabricada por Pericoli) para reducción de luz en entradas de aire y ventanas de ventilación.",
        en: "PERIdark light trap (manufactured by Pericoli) for light reduction on air inlets and ventilation windows.",
      },
    },
    A4319057: { categoria: "ventilacion" },
    "A57.001.DSSN": { categoria: "ventilacion" },

    // Sensores y medición
    A1270082: { categoria: "sensores" },
    A1612012: { categoria: "sensores" },
    A3015020: { categoria: "sensores" },
    A3015026: { categoria: "sensores" },
    // Sonda de compostaje SC.7 para controladores Fancom.
    A34250047: {
      categoria: "sensores",
      info: {
        es: "Sonda de compostaje SC.7 para controladores Fancom.",
        en: "SC.7 compost probe for Fancom controllers.",
      },
    },
    A4240006: { categoria: "sensores" },
    A4240007: { categoria: "sensores" },
    // Sensor de CO2 de 5000 ppm para sistemas de control de clima Fancom.
    "A4270025.05": {
      categoria: "sensores",
      info: {
        es: "Sensor de CO2 (rango 5000 ppm) para sistemas de control de clima Fancom.",
        en: "CO2 sensor (5000 ppm range) for Fancom climate control systems.",
      },
    },
    // Medidor de agua con salida de pulso para monitoreo de consumo.
    A5261001: {
      categoria: "sensores",
      info: {
        es: "Medidor de agua con salida de pulso para monitoreo de consumo.",
        en: "Water meter with pulse output for consumption monitoring.",
      },
    },
    "A5261001 P": {
      categoria: "sensores",
      info: {
        es: "Medidor de agua con salida de pulso para monitoreo de consumo.",
        en: "Water meter with pulse output for consumption monitoring.",
      },
    },

    // Actuadores, malacates y pesaje
    A1339015: { categoria: "actuadores" },
    // Motor para malacate Fancom LM-50.
    A1369008: {
      categoria: "actuadores",
      info: {
        es: "Motor para malacate Fancom LM-50.",
        en: "Fancom LM-50 winch motor.",
      },
    },
    "A1369008.01 ENG": {
      categoria: "actuadores",
      info: {
        es: "Motor para malacate Fancom LM-50.",
        en: "Fancom LM-50 winch motor.",
      },
    },
    A1755111: { categoria: "actuadores" },
    A3026002: { categoria: "actuadores" },
    A4270003: { categoria: "actuadores" },
    A5450007: { categoria: "actuadores" },

    // Enfriamiento y humidificación
    // Código exacto del catálogo incluye punto final ("A1270040 .").
    "A1270040 .": { categoria: "enfriamiento" },
    A2453039: { categoria: "enfriamiento" },
    A2453081: { categoria: "enfriamiento" },
    "A2453081 REP": { categoria: "enfriamiento" },

    // Conectividad y comunicación
    "A1471007.01": { categoria: "conectividad" },
    A1755035: { categoria: "conectividad" },
    "A5150040.06": { categoria: "conectividad" },

    // Componentes eléctricos
    A1015002: { categoria: "electricos" },
    A1712003: { categoria: "electricos" },
    // Duplicado del catálogo con punto final; se conserva como código aparte.
    "A1712003.": { categoria: "electricos" },
    A2160014: { categoria: "electricos" },
    A2431001: { categoria: "electricos" },
    A2431002: { categoria: "electricos" },
    "A2431008.01": { categoria: "electricos" },
    A2431070: { categoria: "electricos" },
    "A2431070-GAR": { categoria: "electricos" },
    A2459083: { categoria: "electricos" },
    // Duplicado del catálogo con punto final; se conserva como código aparte.
    "A2459083.": { categoria: "electricos" },
    A2459540: { categoria: "electricos" },
    A2533007: { categoria: "electricos" },
    A2598004: { categoria: "electricos" },
    A5030043: { categoria: "electricos" },

    // Tornillería y montaje
    // Ojo: en el catálogo existen "A-6001" (con guion) y "A6001" como códigos distintos.
    "A-6001": { categoria: "montaje" },
    A6001: { categoria: "montaje" },
    A2319252: { categoria: "montaje" },
    A3859141: { categoria: "montaje" },
  },
};
