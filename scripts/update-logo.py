from PIL import Image
from pathlib import Path

BASE = Path(r"G:\Mi unidad\pagina web\3p-website")
SRC = BASE / "images" / "LOGO 3P.png"

img = Image.open(SRC).convert("RGBA")

# 1. Logo principal para header (alto suficiente para pantallas retina)
header_w = 600
header_h = int(img.height * (header_w / img.width))
header = img.resize((header_w, header_h), Image.LANCZOS)
header.save(BASE / "public" / "images" / "logo-3p-header.png", "PNG")

# 2. Logo principal para hero/about/login (alta resolución)
login_w = 1152
login = img.resize((login_w, int(img.height * (login_w / img.width))), Image.LANCZOS)
login.save(BASE / "public" / "images" / "logo-3p-login.png", "PNG")

# 3. Logo raíz (usado en schema.org y fallback)
img.save(BASE / "logo.png", "PNG")

# 4. Favicon/iconos cuadrados con fondo blanco y logo centrado
def make_square_icon(src_img, size, padding_factor=0.1):
    """Crea un icono cuadrado con el logo completo centrado y padding."""
    # Calcular tamaño del logo dentro del canvas respetando padding
    canvas = size
    available = int(canvas * (1 - 2 * padding_factor))
    # Escalar logo manteniendo aspecto
    ratio = min(available / src_img.width, available / src_img.height)
    new_w = int(src_img.width * ratio)
    new_h = int(src_img.height * ratio)
    scaled = src_img.resize((new_w, new_h), Image.LANCZOS)
    # Crear fondo blanco
    icon = Image.new("RGBA", (canvas, canvas), (255, 255, 255, 255))
    x = (canvas - new_w) // 2
    y = (canvas - new_h) // 2
    icon.paste(scaled, (x, y), scaled)
    return icon

icons = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "icon-192x192.png": 192,
    "icon-512x512.png": 512,
}

for filename, size in icons.items():
    icon = make_square_icon(img, size, padding_factor=0.08)
    icon.save(BASE / "public" / filename, "PNG")

print("Logos actualizados correctamente.")
