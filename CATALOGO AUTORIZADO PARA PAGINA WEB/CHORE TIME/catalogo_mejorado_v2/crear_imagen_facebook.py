#!/usr/bin/env python3
"""
Crear imagen para publicación de Facebook
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Dimensiones recomendadas para Facebook (1200x630 es ideal para posts)
WIDTH = 1200
HEIGHT = 630

# Colores corporativos
NARANJA = (255, 102, 0)
AZUL = (0, 51, 102)
BLANCO = (255, 255, 255)
GRIS_OSCURO = (51, 51, 51)

def crear_imagen_publicacion():
    # Crear imagen
    img = Image.new('RGB', (WIDTH, HEIGHT), AZUL)
    draw = ImageDraw.Draw(img)
    
    # Fondo con degradado sutil
    for y in range(HEIGHT):
        alpha = y / HEIGHT
        r = int(AZUL[0] + (30 * alpha))
        g = int(AZUL[1] + (30 * alpha))
        b = int(AZUL[2] + (50 * alpha))
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Cargar logo si existe
    logo_path = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\logo_3p_rgba.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        # Redimensionar logo
        logo_width = 200
        ratio = logo_width / logo.width
        logo_height = int(logo.height * ratio)
        logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        # Pegar logo (esquina superior derecha)
        if logo.mode == 'RGBA':
            img.paste(logo, (WIDTH - logo_width - 40, 30), logo)
        else:
            img.paste(logo, (WIDTH - logo_width - 40, 30))
    
    # Intentar usar fuentes del sistema
    try:
        font_titulo = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 72)
        font_subtitulo = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 48)
        font_texto = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 32)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 36)
    except:
        font_titulo = ImageFont.load_default()
        font_subtitulo = font_titulo
        font_texto = font_titulo
        font_cta = font_titulo
    
    # Título principal
    titulo = "CATÁLOGO CHORE TIME"
    bbox = draw.textbbox((0, 0), titulo, font=font_titulo)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    
    # Sombra del texto
    draw.text((x+3, 153), titulo, font=font_titulo, fill=(0, 0, 0, 100))
    draw.text((x, 150), titulo, font=font_titulo, fill=NARANJA)
    
    # Subtítulo
    subtitulo = "Refacciones y Equipos para Granjas Avícolas"
    bbox = draw.textbbox((0, 0), subtitulo, font=font_subtitulo)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, 240), subtitulo, font=font_subtitulo, fill=BLANCO)
    
    # Línea decorativa
    line_y = 320
    draw.rectangle([350, line_y, 850, line_y+5], fill=NARANJA)
    
    # Productos destacados
    productos = [
        "✓ Tarjetas Electrónicas",
        "✓ Displays y Teclados",
        "✓ Motores y Reductores",
        "✓ Sensores y Control"
    ]
    
    y_start = 360
    for i, prod in enumerate(productos):
        draw.text((100 + (i % 2) * 500, y_start + (i // 2) * 50), 
                  prod, font=font_texto, fill=BLANCO)
    
    # Caja de llamada a la acción
    cta_box_y = 520
    # Sombra
    draw.rounded_rectangle([298, cta_box_y+3, 902, cta_box_y+63], 
                          radius=10, fill=(0, 0, 0, 100))
    # Caja naranja
    draw.rounded_rectangle([295, cta_box_y, 900, cta_box_y+60], 
                          radius=10, fill=NARANJA)
    
    # Texto CTA
    cta_text = "📞 COTIZA AHORA: 477 128 4661"
    bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, cta_box_y + 12), cta_text, font=font_cta, fill=BLANCO)
    
    # Guardar imagen
    output_path = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\catalogo_mejorado_v2\imagen_facebook_catalogo.jpg"
    img.save(output_path, quality=95)
    print(f"[OK] Imagen creada: {output_path}")
    print(f"[DIM] Dimensiones: {WIDTH}x{HEIGHT}px (optimizado para Facebook)")
    
    return output_path

def crear_imagen_stories():
    """Crear versión vertical para Stories/Reels (1080x1920)"""
    WIDTH = 1080
    HEIGHT = 1920
    
    img = Image.new('RGB', (WIDTH, HEIGHT), AZUL)
    draw = ImageDraw.Draw(img)
    
    # Fondo degradado
    for y in range(HEIGHT):
        alpha = y / HEIGHT
        r = int(AZUL[0] + (50 * alpha))
        g = int(AZUL[1] + (30 * alpha))
        b = int(AZUL[2] + (80 * alpha))
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Cargar logo
    logo_path = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\logo_3p_rgba.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        logo_width = 300
        ratio = logo_width / logo.width
        logo_height = int(logo.height * ratio)
        logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        x_logo = (WIDTH - logo_width) // 2
        if logo.mode == 'RGBA':
            img.paste(logo, (x_logo, 80), logo)
        else:
            img.paste(logo, (x_logo, 80))
    
    # Fuentes más grandes para stories
    try:
        font_grande = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 90)
        font_mediana = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 60)
        font_normal = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 48)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 56)
    except:
        font_grande = ImageFont.load_default()
        font_mediana = font_grande
        font_normal = font_grande
        font_cta = font_grande
    
    # Título
    titulo = "CATÁLOGO"
    bbox = draw.textbbox((0, 0), titulo, font=font_grande)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, 450), titulo, font=font_grande, fill=NARANJA)
    
    titulo2 = "CHORE TIME"
    bbox = draw.textbbox((0, 0), titulo2, font=font_grande)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, 560), titulo2, font=font_grande, fill=BLANCO)
    
    # Subtítulo
    subtitulo = "Refacciones Originales"
    bbox = draw.textbbox((0, 0), subtitulo, font=font_mediana)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, 700), subtitulo, font=font_mediana, fill=BLANCO)
    
    # Línea decorativa
    draw.rectangle([200, 800, 880, 810], fill=NARANJA)
    
    # Lista de productos
    productos = [
        "📦 Tarjetas Electrónicas",
        "🖥️ Displays y Teclados",
        "⚙️ Motores y Reductores",
        "🌡️ Sensores de Temperatura",
        "🔌 Fuentes de Poder",
        "🏗️ Accesorios y Tubería"
    ]
    
    y_start = 900
    for i, prod in enumerate(productos):
        bbox = draw.textbbox((0, 0), prod, font=font_normal)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2
        draw.text((x, y_start + i * 90), prod, font=font_normal, fill=BLANCO)
    
    # Caja CTA
    cta_y = 1600
    draw.rounded_rectangle([140, cta_y, 940, cta_y+100], 
                          radius=15, fill=NARANJA)
    
    cta_text = "📲 WhatsApp: 477 128 4661"
    bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, cta_y + 22), cta_text, font=font_cta, fill=BLANCO)
    
    # Web
    web_text = "www.3p.com.mx"
    bbox = draw.textbbox((0, 0), web_text, font=font_normal)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    draw.text((x, 1750), web_text, font=font_normal, fill=BLANCO)
    
    # Guardar
    output_path = r"G:\Mi unidad\pagina web\3p-website\CATALOGO AUTORIZADO PARA PAGINA WEB\CHORE TIME\catalogo_mejorado_v2\imagen_stories_catalogo.jpg"
    img.save(output_path, quality=95)
    print(f"[OK] Imagen Stories creada: {output_path}")
    print(f"[DIM] Dimensiones: {WIDTH}x{HEIGHT}px (optimizado para Instagram/Facebook Stories)")
    
    return output_path

if __name__ == "__main__":
    print("=" * 60)
    print("CREANDO IMÁGENES PARA REDES SOCIALES")
    print("=" * 60)
    
    crear_imagen_publicacion()
    print()
    crear_imagen_stories()
    
    print()
    print("=" * 60)
    print("¡LISTO! Usa estas imágenes para tu publicación.")
    print("=" * 60)
