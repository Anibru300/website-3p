import os

IMG_DIR = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\02-imagenes_procesadas"

BEST_PHOTO = {
    "14337":   "REGULADOR_DE_ALTURA_14337_CHORE_TIME_vista1_sin_fondo.png",
    "2529-839":"DECAL C-TRONICS 2 FRONT- 2529-839.png",
    "27772":   "ENSAMBLE_DE_POLEA_DOBLE_27772_CHORE_TIME_vista1_sin_fondo (2).png",
    "40741":   "SENSOR_DE_TEMPERATURA_40741_CHORE_TIME_vista1_sin_fondo.png",
    "41308":   "41308_TARJETA_IMS8_SWITCH_sin_fondo.png",
    "41309":   "TARJETA_APAGADORES_41309_CHORE_TIME_vista1_sin_fondo.png",
    "41315":   "TECLADO_KDCM1_41315_CHORE_TIME_vista1_sin_fondo.png",
    "41317":   "DISPLAY_8X40_41317_CHORE_TIME_vista1_sin_fondo.png",
    "42013":   "PLATO_CONTROL_INTERMEDIO_42013_CHORE_TIME_vista1_sin_fondo.png",
    "42208-1000":"CABLE_DUPLEX_BLINDADO_42208-1000_CHORE_TIME_vista3_.png",
    "42372":   "42372_POLEA_PIOLA_Y_NUDO_PARA_VENTILA_vista1.png",
    "48299":   "48299_SENSOR_DE_HUMEDAD_RELATIVA_INTELLIGRA_vista1 (1).png",
    "48564":   "48564_TRANSFORMADOR_MODELO_24_CT_1_vista1.png",
    "48608":   "48608_MOTOR_1.5HP_vista1.png",
    "49646":   "49646_TARJETA_RM8_C-TRONIC_vista1.png",
    "49649":   "FUENTE_PODER_65W_49649_CHORE_TIME_vista2_sin_fondo.png",
    "49651":   "49651_DISPLAY_240_X_320_CT2_vista2.png",
    "49652":   "KEY_BOARD_CT2_49652_CHORE_TIME_vista3_reverso_sin_fondo.png",
    "49673":   "49673_TARJETA_IMSCM_16_CT2_vista1.png",
    "49674":   "49674_TARJETA_vista1.png",
    "49983":   "49983_TARJETA_HI_CT2_REPARACION_vista1.png",
    "51763":   "51763_WIRE_HANGER_Y_STRA_HANGER_vista1.png",
    "51861":   "51861_TARJETA_REELEVADORES_CT3_RM4_vista1.png",
    "6854-4":  "6854-4_TUBO_DE_10_FT_4_HOYOS_CHORETIME_vista2.png",
    "3259-120":"3259-120_MOTORREDUCTOR_3-4HP_vista1.png",
}

existing = set(os.listdir(IMG_DIR))
ok = 0
bad = 0
for cod, fname in BEST_PHOTO.items():
    exists = fname in existing
    status = 'OK' if exists else 'FALTA'
    print(f'{cod}: {status} -> {fname}')
    if exists:
        ok += 1
    else:
        bad += 1

print(f'\nTotal OK: {ok}')
print(f'Total FALTAN: {bad}')
