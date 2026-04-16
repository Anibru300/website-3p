#!/usr/bin/env python3
"""
Catalogo Chore Time - VERSION OPTIMIZADA
- Imagen mas grande y centrada
- Descripcion mas grande
- Mejor aprovechamiento del espacio
- Sin espacio desperdiciado
"""
import os
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.utils import ImageReader
from PIL import Image
import qrcode
import io

OUTPUT_PDF = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\catalogo_mejorado_v2\Catalogo_Chore_Time_Optimizado_v2.pdf"
IMAGENES_DIR = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\02-imagenes_procesadas"
LOGO_PATH = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\logo_3p_rgba.png"
PAGE_SIZE = 1080

COLORES = {
    'naranja': HexColor('#FF6600'),
    'azul': HexColor('#003366'),
    'azul_claro': HexColor('#1a5276'),
    'gris': HexColor('#333333'),
    'gris_claro': HexColor('#F5F5F5'),
    'blanco': white
}

IMAGENES_PRODUCTOS = {
    "41308": "41308_TARJETA_IMS8_SWITCH_sin_fondo.png",
    "41309": "TARJETA_APAGADORES_41309_CHORE_TIME_vista1_sin_fondo.png",
    "49646": "49646_TARJETA_RM8_C-TRONIC_vista1.png",
    "49652": "KEY_BOARD_CT2_49652_CHORE_TIME_vista3_reverso_sin_fondo.png",
    "49673": "49673_TARJETA_IMSCM_16_CT2_vista1.png",
    "49674": "49674_TARJETA_vista1.png",
    "49983": "49983_TARJETA_HI_CT2_REPARACION_vista1.png",
    "51861": "51861_TARJETA_REELEVADORES_CT3_RM4_vista1.png",
    "41315": "TECLADO_KDCM1_41315_CHORE_TIME_vista1_sin_fondo.png",
    "41317": "DISPLAY_8X40_41317_CHORE_TIME_vista1_sin_fondo.png",
    "49651": "49651_DISPLAY_240_X_320_CT2_vista2.png",
    "3259-120": "3259-120_MOTORREDUCTOR_3-4HP_vista1.png",
    "48608": "48608_MOTOR_1.5HP_vista1.png",
    "42372": "42372_POLEA_PIOLA_Y_NUDO_PARA_VENTILA_vista1.png",
    "27772": "ENSAMBLE_DE_POLEA_DOBLE_27772_CHORE_TIME_vista1_sin_fondo (2).png",
    "14337": "REGULADOR_DE_ALTURA_14337_CHORE_TIME_vista1_sin_fondo.png",
    "42013": "PLATO_CONTROL_INTERMEDIO_42013_CHORE_TIME_vista1_sin_fondo.png",
    "40741": "SENSOR_DE_TEMPERATURA_40741_CHORE_TIME_vista1_sin_fondo.png",
    "48299": "48299_SENSOR_DE_HUMEDAD_RELATIVA_INTELLIGRA_vista1 (1).png",
    "48564": "48564_TRANSFORMADOR_MODELO_24_CT_1_vista1.png",
    "49649": "FUENTE_PODER_65W_49649_CHORE_TIME_vista2_sin_fondo.png",
    "42208-1000": "CABLE_DUPLEX_BLINDADO_42208-1000_CHORE_TIME_vista4_frente_sin_fondo.png",
    "6854-4": "6854-4_TUBO_DE_10_FT_4_HOYOS_CHORETIME_vista2.png",
    "51763": "51763_WIRE_HANGER_Y_STRA_HANGER_vista1.png",
    "2529-839": "DECAL C-TRONICS 2 FRONT- 2529-839.png",
}

PRODUCTOS = {
    2: {"categoria": "TARJETAS ELECTRONICAS", "pagina": "1/7", "items": [
        {"sku": "41308", "nombre": "TARJETA IMS8", "desc": "Compatible con sistemas Chore-Time. Control y monitoreo de funciones criticas."},
        {"sku": "41309", "nombre": "TARJETA SWITCH", "desc": "Controla multiples circuitos de alimentacion. Distribucion eficiente garantizada."},
        {"sku": "49646", "nombre": "TARJETA KEY BOARD CT2", "desc": "Control avanzado para gestion ambiental. Materiales de alta durabilidad."},
        {"sku": "49652", "nombre": "TARJETA APAGADORES C-TRONIC", "desc": "Interfaz de teclado para paneles CT2. Fabricacion industrial de calidad."},
    ]},
    3: {"categoria": "TARJETAS ELECTRONICAS", "pagina": "2/7", "items": [
        {"sku": "49673", "nombre": "TARJETA IMSCM 16 CT2", "desc": "Comunicacion y control para 16 salidas. Totalmente compatible con CT2."},
        {"sku": "49674", "nombre": "TARJETA FUNC CT2", "desc": "Funcional para paneles CT2. Monitoreo y control integrado en un modulo."},
        {"sku": "49983", "nombre": "TARJETA HI CT2 REPARACION", "desc": "Solucion economica para paneles HI CT2. Extiende la vida util del equipo."},
        {"sku": "51861", "nombre": "TARJETA REELEVADORES CT3 RM4", "desc": "Proteccion de circuitos para sistemas CT3 y RM4. Alta confiabilidad."},
    ]},
    4: {"categoria": "DISPLAYS Y TECLADOS", "pagina": "3/7", "items": [
        {"sku": "41315", "nombre": "TECLADO KDCM1", "desc": "Resistente para entornos de granja. Protegido contra polvo y humedad."},
        {"sku": "41317", "nombre": "DISPLAY 8X40", "desc": "8 lineas por 40 caracteres. Compatible con modulos 8, 16, 24 y 32."},
        {"sku": "49651", "nombre": "DISPLAY 240X320 CT2", "desc": "Grafica a color 240x320 pixeles. Interfaz intuitiva y facil de usar."},
        {"sku": "3259-120", "nombre": "MOTORREDUCTOR 3/4HP", "desc": "Trifasico para ventiladores industriales. Potencia y durabilidad garantizadas."},
    ]},
    5: {"categoria": "MOTORES Y MECANICO", "pagina": "4/7", "items": [
        {"sku": "48608", "nombre": "MOTOR 1.5HP", "desc": "Ventilacion avicola de alta eficiencia. Bajo consumo energetico."},
        {"sku": "42372", "nombre": "POLEA PIOLA Y NUDO", "desc": "Transmision eficiente para sistemas de ventilacion. Acero resistente."},
        {"sku": "27772", "nombre": "ENSAMBLE DE POLEA DOBLE", "desc": "Transmision de bandas robusta. Fabricado en acero anticorrosivo."},
        {"sku": "14337", "nombre": "REGULADOR DE ALTURA", "desc": "Ajuste rapido para equipos de alimentacion y bebederos. Facil manejo."},
    ]},
    6: {"categoria": "SENSORES Y CONTROL", "pagina": "5/7", "items": [
        {"sku": "42013", "nombre": "PLATO CONTROL INTERMEDIO", "desc": "Para sistemas C2 Plus. Distribucion uniforme y controlada del alimento."},
        {"sku": "40741", "nombre": "SENSOR DE TEMPERATURA", "desc": "Alta precision para control ambiental. Respuesta rapida y exacta."},
        {"sku": "48299", "nombre": "SENSOR DE HUMEDAD RELATIVA", "desc": "Para paneles Intelligra. Medicion precisa del ambiente de la granja."},
        {"sku": "48564", "nombre": "TRANSFORMADOR 24V CT1", "desc": "Alimentacion estable y segura para paneles CT1. Proteccion integrada."},
    ]},
    7: {"categoria": "ELECTRICO Y ALIMENTACION", "pagina": "6/7", "items": [
        {"sku": "49649", "nombre": "FUENTE DE PODER 65W", "desc": "Conmutada de 65W. Compatible con diversos paneles Chore-Time."},
        {"sku": "42208-1000", "nombre": "CABLE DUPLEX BLINDADO", "desc": "Protege senales contra interferencias. Ideal para sensores."},
        {"sku": "6854-4", "nombre": "TUBO 10 FT 4 HOYOS", "desc": "Alimentacion de 10 pies con 4 hoyos. Compatible bebederos Chore-Time."},
        {"sku": "51763", "nombre": "WIRE HANGER", "desc": "Suspension para tuberias y equipos. Acero galvanizado de alta resistencia."},
    ]},
    8: {"categoria": "ACCESORIOS Y ESTRUCTURA", "pagina": "7/7", "items": [
        {"sku": "2529-839", "nombre": "DECAL C-TRONICS 2 FRONT", "desc": "Etiqueta frontal original para equipos C-Tronics 2. Calidad Chore-Time."},
    ]},
}

def cargar_imagen(sku, max_size=(400, 280)):
    if sku not in IMAGENES_PRODUCTOS:
        return None
    img_path = os.path.join(IMAGENES_DIR, IMAGENES_PRODUCTOS[sku])
    if not os.path.exists(img_path):
        return None
    try:
        img = Image.open(img_path)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[3])
            else:
                background.paste(img)
            img = background
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        return ImageReader(buffer)
    except:
        return None

def generar_qr():
    try:
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
        qr.add_data('https://wa.me/524771284661')
        qr.make(fit=True)
        img = qr.make_image(fill_color="#003366", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return ImageReader(buffer)
    except:
        return None

def dibujar_producto(c, x, y, w, h, producto, num):
    sku = producto["sku"]
    
    # Fondo
    c.setFillColor(COLORES['gris_claro'])
    c.roundRect(x, y, w, h, 10, fill=True, stroke=False)
    
    # Borde naranja
    c.setStrokeColor(COLORES['naranja'])
    c.setLineWidth(3)
    c.roundRect(x, y, w, h, 10, fill=False, stroke=True)
    
    # IMAGEN MAS GRANDE Y CENTRADA
    img = cargar_imagen(sku, max_size=(400, 260))
    if img:
        # Centrar imagen horizontalmente
        img_width = 380
        img_height = 240
        img_x = x + (w - img_width) / 2
        img_y = y + h - 260
        c.drawImage(img, img_x, img_y, width=img_width, height=img_height, preserveAspectRatio=True)
    else:
        # Placeholder centrado
        c.setFillColor(COLORES['blanco'])
        c.rect(x + 50, y + h - 250, w - 100, 230, fill=True, stroke=False)
        c.setFillColor(COLORES['gris'])
        c.setFont("Helvetica", 14)
        c.drawCentredString(x + w/2, y + h - 140, f"[SKU: {sku}]")
    
    # Numero circulo - posicion ajustada
    c.setFillColor(COLORES['naranja'])
    c.circle(x + 22, y + h - 290, 14, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(x + 22, y + h - 295, str(num))
    
    # NOMBRE PRODUCTO - 22pt EXTRA GRANDE
    c.setFillColor(COLORES['azul'])
    c.setFont("Helvetica-Bold", 22)
    nombre = producto["nombre"][:26]
    c.drawString(x + 45, y + h - 285, nombre)
    
    # SKU - 18pt naranja EXTRA GRANDE
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 18)
    c.drawString(x + 45, y + h - 315, f"SKU: {sku}")
    
    # DESCRIPCION EXTRA GRANDE - 19pt
    c.setFillColor(COLORES['gris'])
    c.setFont("Helvetica", 19)
    
    # Dividir descripcion
    palabras = producto["desc"].split()
    lineas = []
    linea_actual = ""
    for palabra in palabras:
        if len(linea_actual + " " + palabra) <= 35:
            linea_actual += " " + palabra if linea_actual else palabra
        else:
            lineas.append(linea_actual)
            linea_actual = palabra
    if linea_actual:
        lineas.append(linea_actual)
    
    # Espaciado entre líneas aumentado a 24
    for i, linea in enumerate(lineas[:3]):
        c.drawString(x + 12, y + h - 345 - (i * 24), linea)
    
    # Boton COTIZAR - mas ancho
    c.setFillColor(COLORES['naranja'])
    c.roundRect(x + w - 95, y + 10, 85, 28, 5, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(x + w - 52, y + 27, "COTIZAR")

def portada(c):
    c.setFillColor(COLORES['azul'])
    c.rect(0, 0, PAGE_SIZE, PAGE_SIZE, fill=True, stroke=False)
    
    c.setStrokeColor(COLORES['azul_claro'])
    c.setLineWidth(2)
    for i in range(-5, 15):
        c.line(i * 100, 0, i * 100 + 200, PAGE_SIZE)
    
    c.setFillColor(COLORES['azul'])
    c.roundRect(150, 250, 780, 580, 20, fill=True, stroke=False)
    c.setStrokeColor(COLORES['naranja'])
    c.setLineWidth(4)
    c.roundRect(150, 250, 780, 580, 20, fill=False, stroke=True)
    
    if os.path.exists(LOGO_PATH):
        c.drawImage(ImageReader(LOGO_PATH), 440, 620, width=200, height=200, preserveAspectRatio=True)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 70)
    c.drawCentredString(PAGE_SIZE/2, 580, "CATALOGO")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 56)
    c.drawCentredString(PAGE_SIZE/2, 510, "CHORE TIME")
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica", 24)
    c.drawCentredString(PAGE_SIZE/2, 460, "Refacciones y Equipos para Granjas Avicolas")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(PAGE_SIZE/2, 380, "3P S.A. de C.V.")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(PAGE_SIZE/2, 180, "DESLIZA PARA VER MAS")
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica", 14)
    c.drawCentredString(PAGE_SIZE/2, 80, "Distribuidor Autorizado  |  www.3p.com.mx  |  Tel: 477 128 4661")

def pagina_productos(c, datos):
    c.setFillColor(COLORES['blanco'])
    c.rect(0, 0, PAGE_SIZE, PAGE_SIZE, fill=True, stroke=False)
    
    c.setFillColor(COLORES['azul'])
    c.rect(0, 1000, PAGE_SIZE, 80, fill=True, stroke=False)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 32)
    c.drawString(40, 1045, datos["categoria"])
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 28)
    c.drawRightString(1040, 1045, datos["pagina"])
    
    items = datos["items"]
    if len(items) >= 4:
        # 2x2 grid - cajas mas altas para aprovechar espacio
        posiciones = [
            (35, 500, 500, 490),   # Arriba izquierda
            (545, 500, 500, 490),  # Arriba derecha
            (35, 5, 500, 490),     # Abajo izquierda
            (545, 5, 500, 490)     # Abajo derecha
        ]
    elif len(items) == 3:
        posiciones = [
            (35, 500, 500, 490),
            (545, 500, 500, 490),
            (290, 5, 500, 490)
        ]
    elif len(items) == 2:
        posiciones = [(35, 350, 500, 490), (545, 350, 500, 490)]
    else:
        posiciones = [(290, 350, 500, 490)]
    
    for i, item in enumerate(items):
        if i < len(posiciones):
            dibujar_producto(c, *posiciones[i], item, i + 1)
    
    c.setFillColor(COLORES['azul'])
    c.rect(0, 0, PAGE_SIZE, 50, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica", 12)
    c.drawCentredString(PAGE_SIZE/2, 30, "3P S.A. de C.V. - Distribuidor Autorizado Chore-Time  |  www.3p.com.mx  |  477 128 4661")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(PAGE_SIZE/2, 70, f"<  {int(datos['pagina'].split('/')[0])} / 7  >")

def contacto(c):
    c.setFillColor(COLORES['azul'])
    c.rect(0, 0, PAGE_SIZE, PAGE_SIZE, fill=True, stroke=False)
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 46)
    c.drawCentredString(PAGE_SIZE/2, 950, "NECESITAS UNA COTIZACION?")
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(PAGE_SIZE/2, 880, "Contactanos")
    
    c.setStrokeColor(COLORES['naranja'])
    c.setLineWidth(3)
    c.line(300, 830, 780, 830)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(PAGE_SIZE/2, 760, "3P S.A. de C.V.")
    
    datos_contacto = [
        ("Direccion:", "Industrial del Norte 201, Leon, Gto."),
        ("Telefono:", "+52 477 128 4661"),
        ("Telefono:", "+52 479 229 8907"),
        ("Email:", "trespsadecv@hotmail.com"),
        ("Web:", "www.3p.com.mx"),
    ]
    
    y = 700
    for label, valor in datos_contacto:
        c.setFont("Helvetica-Bold", 26)
        c.drawRightString(520, y, label)
        c.setFont("Helvetica", 26)
        c.drawString(540, y, valor)
        y -= 55
    
    c.setFillColor(COLORES['naranja'])
    c.roundRect(340, 320, 400, 90, 15, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_SIZE/2, 385, "WHATSAPP")
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(PAGE_SIZE/2, 345, "477 128 4661")
    
    qr = generar_qr()
    if qr:
        c.drawImage(qr, 440, 80, width=200, height=200, preserveAspectRatio=True)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica", 16)
    c.drawCentredString(PAGE_SIZE/2, 60, "Escanea para WhatsApp Directo")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(PAGE_SIZE/2, 60, '"Partner de los Productores de Pollos"')

def main():
    print("=" * 60)
    print("CREANDO CATALOGO CHORE TIME - OPTIMIZADO")
    print("Imagen grande | Descripcion grande | Sin espacio desperdiciado")
    print("=" * 60)
    
    c = canvas.Canvas(OUTPUT_PDF, pagesize=(PAGE_SIZE, PAGE_SIZE))
    
    print("[1/9] Portada...")
    portada(c)
    c.showPage()
    
    for p in range(2, 9):
        if p in PRODUCTOS:
            print(f"[{p}/9] Pagina {PRODUCTOS[p]['pagina']}...")
            pagina_productos(c, PRODUCTOS[p])
            c.showPage()
    
    print("[9/9] Pagina de contacto...")
    contacto(c)
    c.showPage()
    
    c.save()
    
    tamano = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print("\n" + "=" * 60)
    print("CATALOGO OPTIMIZADO CREADO")
    print("=" * 60)
    print(f"Tamaño: {tamano:.2f} MB")
    print(f"Ubicacion: {OUTPUT_PDF}")
    print("\nMEJORAS:")
    print("  + Imagen: 380x240px (centrada en el cuadro)")
    print("  + Nombre: 22pt negrita (EXTRA GRANDE)")
    print("  + SKU: 18pt negrita naranja (EXTRA GRANDE)")
    print("  + Descripcion: 19pt (EXTRA LEGIBLE)")
    print("  + Espaciado entre lineas aumentado")
    print("  + Cajas aprovechan mejor el espacio vertical")
    print("=" * 60)

if __name__ == "__main__":
    main()
