#!/usr/bin/env python3
"""
Catalogo Chore Time - VERSION LETRA GRANDE
Nombre, descripcion y SKU mas grandes
"""
import os
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.utils import ImageReader
from PIL import Image
import qrcode
import io

OUTPUT_PDF = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\catalogo_mejorado_v2\Catalogo_Chore_Time_Grande.pdf"
IMAGENES_DIR = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\02-imagenes_procesadas"
LOGO_PATH = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\logo_3p_rgba.png"
PAGE_SIZE = 1080

COLORES = {
    'naranja': HexColor('#FF6600'),
    'azul': HexColor('#003366'),
    'azul_claro': HexColor('#1a5276'),
    'gris': HexColor('#333333'),
    'gris_claro': HexColor('#F8F9FA'),
    'blanco': white
}

# Mapeo SKU -> imagen
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
        {"sku": "41308", "nombre": "TARJETA IMS8", "desc": "Compatible con sistemas Chore-Time. Disenada para controlar y monitorear funciones criticas."},
        {"sku": "41309", "nombre": "TARJETA SWITCH", "desc": "Controla multiples circuitos de alimentacion. Esencial para la distribucion eficiente."},
        {"sku": "49646", "nombre": "TARJETA KEY BOARD CT2", "desc": "Tarjeta de control avanzada para sistemas de gestion ambiental."},
        {"sku": "49652", "nombre": "TARJETA APAGADORES C-TRONIC", "desc": "Interfaz de teclado para paneles de control CT2. Materiales de alta durabilidad."},
    ]},
    3: {"categoria": "TARJETAS ELECTRONICAS", "pagina": "2/7", "items": [
        {"sku": "49673", "nombre": "TARJETA IMSCM 16 CT2", "desc": "Tarjeta de comunicacion y control para modulos de 16 salidas. Compatible CT2."},
        {"sku": "49674", "nombre": "TARJETA FUNC CT2", "desc": "Tarjeta funcional para paneles CT2. Integra funciones de monitoreo y control."},
        {"sku": "49983", "nombre": "TARJETA HI CT2 REPARACION", "desc": "Tarjeta de reparacion para paneles HI CT2. Solucion economica."},
        {"sku": "51861", "nombre": "TARJETA REELEVADORES CT3 RM4", "desc": "Tarjeta de reelevadores disenada para sistemas CT3 y RM4."},
    ]},
    4: {"categoria": "DISPLAYS Y TECLADOS", "pagina": "3/7", "items": [
        {"sku": "41315", "nombre": "TECLADO KDCM1", "desc": "Teclado resistente para paneles KDCM1. Ideal para entornos de granja con polvo."},
        {"sku": "41317", "nombre": "DISPLAY 8X40", "desc": "Pantalla de 8 lineas por 40 caracteres. Compatible con modulos 8, 16, 24 y 32."},
        {"sku": "49651", "nombre": "DISPLAY 240X320 CT2", "desc": "Pantalla grafica a color de 240x320 pixeles. Interfaz intuitiva."},
        {"sku": "3259-120", "nombre": "MOTORREDUCTOR 3/4HP", "desc": "Motorreductor trifasico de 3/4 HP para ventiladores industriales."},
    ]},
    5: {"categoria": "MOTORES Y MECANICO", "pagina": "4/7", "items": [
        {"sku": "48608", "nombre": "MOTOR 1.5HP", "desc": "Motor de 1.5 HP para ventilacion avicola. Alta eficiencia energetica."},
        {"sku": "42372", "nombre": "POLEA PIOLA Y NUDO", "desc": "Conjunto para sistemas de ventilacion. Asegura transmision eficiente."},
        {"sku": "27772", "nombre": "ENSAMBLE DE POLEA DOBLE", "desc": "Ensamble de polea doble para transmision de bandas. Acero resistente."},
        {"sku": "14337", "nombre": "REGULADOR DE ALTURA", "desc": "Regulador para equipos de alimentacion o bebederos. Ajuste rapido."},
    ]},
    6: {"categoria": "SENSORES Y CONTROL", "pagina": "5/7", "items": [
        {"sku": "42013", "nombre": "PLATO CONTROL INTERMEDIO", "desc": "Plato para sistemas C2 Plus. Distribuye el alimento de manera uniforme."},
        {"sku": "40741", "nombre": "SENSOR DE TEMPERATURA", "desc": "Sensor de alta precision para sistemas de control ambiental. Respuesta rapida."},
        {"sku": "48299", "nombre": "SENSOR DE HUMEDAD RELATIVA", "desc": "Sensor para paneles Intelligra. Mide con precision el ambiente."},
        {"sku": "48564", "nombre": "TRANSFORMADOR 24V CT1", "desc": "Transformador de 24V para paneles CT1. Alimentacion estable y segura."},
    ]},
    7: {"categoria": "ELECTRICO Y ALIMENTACION", "pagina": "6/7", "items": [
        {"sku": "49649", "nombre": "FUENTE DE PODER 65W", "desc": "Fuente conmutada de 65W. Compatible con paneles de control Chore-Time."},
        {"sku": "42208-1000", "nombre": "CABLE DUPLEX BLINDADO", "desc": "Cable para sensores. Protege la senal contra interferencias."},
        {"sku": "6854-4", "nombre": "TUBO 10 FT 4 HOYOS", "desc": "Tubo de 10 pies con 4 hoyos. Compatible con sistemas de bebedero."},
        {"sku": "51763", "nombre": "WIRE HANGER", "desc": "Soporte de suspension para tuberias y equipos de granja. Acero galvanizado."},
    ]},
    8: {"categoria": "ACCESORIOS Y ESTRUCTURA", "pagina": "7/7", "items": [
        {"sku": "2529-839", "nombre": "DECAL C-TRONICS 2 FRONT", "desc": "Decal frontal para equipos C-Tronics 2. Etiqueta original Chore-Time."},
    ]},
}

def cargar_imagen(sku, max_size=(320, 200)):
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
    
    # Imagen
    img = cargar_imagen(sku)
    if img:
        c.drawImage(img, x + (w-300)/2, y + h - 200, width=300, height=180, preserveAspectRatio=True)
    
    # Numero circulo
    c.setFillColor(COLORES['naranja'])
    c.circle(x + 25, y + h - 30, 16, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(x + 25, y + h - 35, str(num))
    
    # NOMBRE PRODUCTO - MAS GRANDE (16pt)
    c.setFillColor(COLORES['azul'])
    c.setFont("Helvetica-Bold", 16)
    nombre = producto["nombre"][:28]
    c.drawString(x + 50, y + h - 35, nombre)
    
    # SKU - MAS GRANDE (13pt)
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 13)
    c.drawString(x + 50, y + h - 55, f"SKU: {sku}")
    
    # DESCRIPCION - MAS GRANDE (11pt)
    c.setFillColor(COLORES['gris'])
    c.setFont("Helvetica", 11)
    
    # Dividir descripcion en lineas
    palabras = producto["desc"].split()
    lineas = []
    linea_actual = ""
    for palabra in palabras:
        if len(linea_actual + " " + palabra) <= 45:
            linea_actual += " " + palabra if linea_actual else palabra
        else:
            lineas.append(linea_actual)
            linea_actual = palabra
    if linea_actual:
        lineas.append(linea_actual)
    
    for i, linea in enumerate(lineas[:3]):
        c.drawString(x + 15, y + h - 220 - (i * 16), linea)
    
    # Boton COTIZAR - MAS GRANDE
    c.setFillColor(COLORES['naranja'])
    c.roundRect(x + w - 100, y + 12, 85, 30, 5, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(x + w - 57, y + 30, "COTIZAR")

def portada(c):
    c.setFillColor(COLORES['azul'])
    c.rect(0, 0, PAGE_SIZE, PAGE_SIZE, fill=True, stroke=False)
    
    # Lineas decorativas
    c.setStrokeColor(COLORES['azul_claro'])
    c.setLineWidth(2)
    for i in range(-5, 15):
        c.line(i * 100, 0, i * 100 + 200, PAGE_SIZE)
    
    # Recuadro
    c.setFillColor(COLORES['azul'])
    c.roundRect(150, 250, 780, 580, 20, fill=True, stroke=False)
    c.setStrokeColor(COLORES['naranja'])
    c.setLineWidth(4)
    c.roundRect(150, 250, 780, 580, 20, fill=False, stroke=True)
    
    # Logo
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
    
    # Header
    c.setFillColor(COLORES['azul'])
    c.rect(0, 1000, PAGE_SIZE, 80, fill=True, stroke=False)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 32)
    c.drawString(40, 1045, datos["categoria"])
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 28)
    c.drawRightString(1040, 1045, datos["pagina"])
    
    # Productos
    items = datos["items"]
    if len(items) >= 4:
        posiciones = [(40, 520, 490, 470), (550, 520, 490, 470), (40, 30, 490, 470), (550, 30, 490, 470)]
    elif len(items) == 3:
        posiciones = [(40, 520, 490, 470), (550, 520, 490, 470), (295, 30, 490, 470)]
    elif len(items) == 2:
        posiciones = [(40, 380, 490, 470), (550, 380, 490, 470)]
    else:
        posiciones = [(295, 380, 490, 470)]
    
    for i, item in enumerate(items):
        if i < len(posiciones):
            dibujar_producto(c, *posiciones[i], item, i + 1)
    
    # Footer
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
    
    y = 680
    for label, valor in datos_contacto:
        c.setFont("Helvetica-Bold", 18)
        c.drawRightString(520, y, label)
        c.setFont("Helvetica", 18)
        c.drawString(540, y, valor)
        y -= 45
    
    # WhatsApp
    c.setFillColor(COLORES['naranja'])
    c.roundRect(340, 380, 400, 90, 15, fill=True, stroke=False)
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_SIZE/2, 445, "WHATSAPP")
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(PAGE_SIZE/2, 405, "477 128 4661")
    
    # QR
    qr = generar_qr()
    if qr:
        c.drawImage(qr, 440, 140, width=200, height=200, preserveAspectRatio=True)
    
    c.setFillColor(COLORES['blanco'])
    c.setFont("Helvetica", 16)
    c.drawCentredString(PAGE_SIZE/2, 120, "Escanea para WhatsApp Directo")
    
    c.setFillColor(COLORES['naranja'])
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(PAGE_SIZE/2, 60, '"Partner de los Productores de Pollos"')

def main():
    print("=" * 60)
    print("CREANDO CATALOGO CHORE TIME - LETRA GRANDE")
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
    print("CATALOGO CREADO - LETRA GRANDE")
    print("=" * 60)
    print(f"Tamaño: {tamano:.2f} MB")
    print(f"Ubicacion: {OUTPUT_PDF}")
    print("\nTAMAÑOS DE FUENTE:")
    print("  - Nombre producto: 16pt (antes 13pt)")
    print("  - SKU: 13pt (antes 10pt)")
    print("  - Descripcion: 11pt (antes 9pt)")
    print("  - Boton COTIZAR: 12pt")
    print("=" * 60)

if __name__ == "__main__":
    main()
