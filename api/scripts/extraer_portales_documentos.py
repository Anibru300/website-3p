#!/usr/bin/env python3
"""
Extrae información de portales desde manuales Word/PDF y la sincroniza con
la tabla crm_portales de SQLite.

Uso:
    api/.venv/Scripts/python.exe scripts/extraer_portales_documentos.py
    api/.venv/Scripts/python.exe scripts/extraer_portales_documentos.py --dir "Y:/ruta"

El script:
- Lee archivos .docx y .pdf de la carpeta indicada.
- Extrae URL, usuario y contraseña de cada manual.
- Busca la entidad relacionada en crm_entidades por nombre flexible.
- Inserta o actualiza el registro en crm_portales.
- Encripta las contraseñas usando la misma función del backend.
"""

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from docx import Document
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "python-docx no está instalado. Instálalo con: pip install python-docx"
    ) from exc

try:
    from PyPDF2 import PdfReader
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "PyPDF2 no está instalado. Instálalo con: pip install PyPDF2"
    ) from exc

from app.admin.crm import _encrypt_password
from app.database import users_connection

DEFAULT_DIR = Path("Y:/1 - CONTROL DE ALMACEN/ERNESTO/Manuales Portales Clientes Ventas")

# Mapeo manual para entidades cuyo nombre en el archivo no coincide fácilmente
# con el nombre en base de datos.
MAPEO_ENTIDADES = {
    "AVIGRUPO": ["AVIGRUPO"],
    "BACHOCO": ["BACHOCO"],
    "MONTEBLANCO": ["MONTEBLANCO", "LABORATORIOS MONTEBLANCO"],
    "PILGRIMS": ["PILGRIMS", "Pilgrims"],
    "PROAN": ["PROAN"],
    "SAN ANTONIO": ["SAN ANTONIO"],
    "PLATAFORMA DE LICITACIONES AVIGRUPO": ["AVIGRUPO"],
}


def normalizar(texto):
    """Normaliza texto para comparaciones flexibles."""
    if texto is None:
        return ""
    texto = str(texto).strip().lower()
    texto = re.sub(r"\s+", " ", texto)
    texto = re.sub(r"[^a-z0-9áéíóúüñ ]", "", texto)
    return texto.strip()


def extraer_texto_docx(ruta):
    doc = Document(str(ruta))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extraer_texto_pdf(ruta):
    reader = PdfReader(str(ruta))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def limpiar_password(valor):
    """Quita notas entre paréntesis, espacios sobrantes y texto colado."""
    if not valor:
        return None
    # Quitar notas entre paréntesis
    valor = re.sub(r"\s*\(.*?\)", "", valor).strip()
    # Quitar palabras mayúsculas típicas de encabezados que se pegan en PDFs
    valor = re.sub(r"\s*(PASO|INGRESAR|SELECCIONA|INDICARA|HISTORICO|DETALLE|COTIZACION|SOLICITADA|PRODUCTOS|PENDIENTE|CONSIDEREN|INFORMACION)\s*.*$", "", valor, flags=re.IGNORECASE).strip()
    # Cortar en el primer espacio si lo hubiera (para PDFs que pegan texto)
    if " " in valor:
        valor = valor.split()[0]
    return valor if valor else None


def extraer_url(lineas):
    """Extrae la URL del texto, reconstruyendo líneas partidas por PDFs."""
    for i, linea in enumerate(lineas):
        if re.match(r"https?://", linea):
            partes = [linea]
            j = i + 1
            while j < len(lineas) and lineas[j] and re.match(
                r"^[a-zA-Z0-9/\.\-_\?\=\&\#\%\:\~]+$", lineas[j]
            ):
                partes.append(lineas[j])
                j += 1
            return "".join(partes)
    return None


def extraer_usuario(texto):
    """Extrae el usuario del texto."""
    m = re.search(r"^\s*[Uu]suario\s*[:=]\s*(.+?)\s*$", texto, re.MULTILINE)
    if m:
        valor = m.group(1).strip()
        # Algunos PDFs pegan "Usuario: TPX...PASO 2"
        valor = re.sub(r"\s+(PASO|SELECCIONAR|INGRESAR).*", "", valor, flags=re.IGNORECASE)
        return valor.strip()
    return None


def extraer_password(texto):
    """Extrae la contraseña del texto."""
    # Caso normal: "Contraseña: valor"
    m = re.search(r"^\s*[Cc]ontrase[ñÑ�]a\s*[:=]\s*(.+?)\s*$", texto, re.MULTILINE)
    if m:
        return limpiar_password(m.group(1).strip())
    # Caso especial de PDFs: "CONTRASEÑA TEMPORAL 123456"
    m = re.search(r"contrase[ñÑ�]a\s+temporal\s*(\d+)", texto, re.IGNORECASE)
    if m:
        return m.group(1)
    return None


def extraer_datos(texto):
    """Extrae URL, usuario y contraseña del texto de un manual."""
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    url = extraer_url(lineas)
    usuario = extraer_usuario(texto)
    password = extraer_password(texto)
    return {"url": url, "usuario": usuario, "password": password}


def entidad_desde_nombre_archivo(nombre_archivo):
    """Intenta obtener el nombre de la entidad desde el nombre del archivo."""
    nombre_limpio = re.sub(r"\.(docx|pdf)$", "", nombre_archivo, flags=re.IGNORECASE)

    # "MANUAL PARA EL PORTAL DE AVIGRUPO" -> AVIGRUPO
    m = re.search(r"PORTAL(?:\s+DE)?\s+([^.]+)", nombre_limpio.upper())
    if m:
        return m.group(1).strip()

    # "MANUAL PORTAL PLATAFORMA DE LICITACIONES AVIGRUPO"
    if "LICITACIONES" in nombre_limpio.upper():
        return "PLATAFORMA DE LICITACIONES AVIGRUPO"

    return nombre_limpio.strip()


def buscar_entidad_flexible(conn, nombre):
    """Busca entidad por coincidencia flexible de nombre."""
    if not nombre:
        return None

    norm = normalizar(nombre)
    if not norm:
        return None

    # Primero intentar coincidencia exacta normalizada
    cursor = conn.execute(
        "SELECT id, nombre FROM crm_entidades WHERE activo = 1"
    )
    for r in cursor:
        if normalizar(r["nombre"]) == norm:
            return r["id"]

    # Luego por substring (más corto = más específico)
    mejores = []
    cursor = conn.execute(
        "SELECT id, nombre FROM crm_entidades WHERE activo = 1"
    )
    for r in cursor:
        norm_db = normalizar(r["nombre"])
        if not norm_db:
            continue
        if norm in norm_db or norm_db in norm:
            mejores.append((r["id"], len(norm_db)))

    if mejores:
        mejores.sort(key=lambda x: x[1])
        return mejores[0][0]

    return None


def resolver_entidad(conn, nombre_archivo):
    """Resuelve el ID de entidad a partir del nombre del archivo."""
    entidad_nombre = entidad_desde_nombre_archivo(nombre_archivo)
    candidatos = MAPEO_ENTIDADES.get(entidad_nombre.upper(), [entidad_nombre])

    for candidato in candidatos:
        entidad_id = buscar_entidad_flexible(conn, candidato)
        if entidad_id:
            return entidad_id, candidato

    return None, entidad_nombre


def upsert_portal(conn, entidad_id, nombre, url, usuario, password, notas=None):
    """Inserta o actualiza un portal, encriptando la contraseña."""
    if not password:
        password_enc = ""
    else:
        password_enc = _encrypt_password(password)

    # Buscar un portal vacío de la misma entidad para reutilizar primero
    existente = conn.execute(
        """
        SELECT id FROM crm_portales
        WHERE entidad_id = ?
          AND (url IS NULL OR url = '')
          AND (usuario IS NULL OR usuario = '')
          AND (password IS NULL OR password = '')
        LIMIT 1
        """,
        (entidad_id,),
    ).fetchone()

    # Si no hay vacío, buscar por nombre exacto
    if not existente:
        existente = conn.execute(
            "SELECT id FROM crm_portales WHERE entidad_id = ? AND lower(trim(nombre)) = ?",
            (entidad_id, nombre.lower()),
        ).fetchone()

    if existente:
        conn.execute(
            """
            UPDATE crm_portales
            SET nombre = ?, url = ?, usuario = ?, password = ?, notas = ?
            WHERE id = ?
            """,
            (nombre, url, usuario, password_enc, notas, existente["id"]),
        )
        return "actualizado", existente["id"]
    else:
        cur = conn.execute(
            """
            INSERT INTO crm_portales (entidad_id, nombre, url, usuario, password, notas)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (entidad_id, nombre, url, usuario, password_enc, notas),
        )
        return "creado", cur.lastrowid


def procesar_archivo(conn, ruta):
    """Procesa un archivo .docx o .pdf y sincroniza su información."""
    nombre_archivo = ruta.name
    print(f"\nProcesando: {nombre_archivo}")

    ext = ruta.suffix.lower()
    if ext == ".docx":
        texto = extraer_texto_docx(ruta)
    elif ext == ".pdf":
        texto = extraer_texto_pdf(ruta)
    else:
        print(f"  Extensión no soportada: {ext}")
        return {"estado": "omitido", "motivo": "extensión no soportada"}

    datos = extraer_datos(texto)
    print(f"  URL: {datos['url']}")
    print(f"  Usuario: {datos['usuario']}")
    print(f"  Contraseña: {'***' if datos['password'] else None}")

    entidad_id, entidad_nombre = resolver_entidad(conn, nombre_archivo)
    if not entidad_id:
        print(f"  [!] No se encontró entidad para '{entidad_nombre}'. Omitiendo.")
        return {"estado": "omitido", "motivo": f"entidad no encontrada: {entidad_nombre}"}

    row = conn.execute(
        "SELECT nombre FROM crm_entidades WHERE id = ?", (entidad_id,)
    ).fetchone()
    nombre_entidad_bd = row["nombre"] if row else entidad_nombre
    print(f"  Entidad: {nombre_entidad_bd} (id={entidad_id})")

    # Nombre del portal
    nombre_portal = entidad_desde_nombre_archivo(nombre_archivo)
    if "LICITACIONES" in nombre_archivo.upper():
        nombre_portal = "Plataforma de Licitaciones"
    elif not datos["url"] and not datos["usuario"] and datos["password"]:
        nombre_portal = "Portal (información parcial)"

    notas = None
    if "LICITACIONES" in nombre_archivo.upper():
        notas = "Portal de licitaciones de AVIGRUPO. El acceso se registra con correo personal; la contraseña temporal es 123456."

    estado, portal_id = upsert_portal(
        conn,
        entidad_id,
        nombre_portal,
        datos["url"],
        datos["usuario"],
        datos["password"],
        notas,
    )
    conn.commit()
    print(f"  [OK] Portal {estado} (id={portal_id})")

    return {"estado": estado, "portal_id": portal_id, "entidad": nombre_entidad_bd}


def main():
    parser = argparse.ArgumentParser(
        description="Extrae portales desde manuales Word/PDF hacia crm_portales"
    )
    parser.add_argument(
        "--dir",
        type=Path,
        default=None,
        help="Carpeta con manuales de portales (por defecto Y:/1 - CONTROL DE ALMACEN/ERNESTO/Manuales Portales Clientes Ventas)",
    )
    args = parser.parse_args()

    base_dir = args.dir or DEFAULT_DIR
    if not base_dir.exists():
        print(f"ERROR: No existe el directorio {base_dir}")
        print("Usa --dir para especificar la ruta correcta.")
        sys.exit(1)

    # Priorizar .docx sobre .pdf cuando exista el mismo nombre base
    todos = sorted(base_dir.glob("*.docx")) + sorted(base_dir.glob("*.pdf"))
    bases_docx = {p.stem for p in base_dir.glob("*.docx")}
    archivos = []
    for p in todos:
        if p.suffix.lower() == ".pdf" and p.stem in bases_docx:
            continue
        archivos.append(p)

    if not archivos:
        print(f"No se encontraron archivos .docx ni .pdf en {base_dir}")
        sys.exit(0)

    print(f"Extrayendo portales desde: {base_dir}")
    print(f"Archivos encontrados: {len(archivos)}")
    print("=" * 60)

    resultados = []
    with users_connection() as conn:
        for ruta in archivos:
            try:
                res = procesar_archivo(conn, ruta)
                resultados.append({"archivo": ruta.name, **res})
            except Exception as exc:
                print(f"  [ERR] Error: {exc}")
                resultados.append({"archivo": ruta.name, "estado": "error", "motivo": str(exc)})

    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    creados = sum(1 for r in resultados if r.get("estado") == "creado")
    actualizados = sum(1 for r in resultados if r.get("estado") == "actualizado")
    omitidos = sum(1 for r in resultados if r.get("estado") == "omitido")
    errores = sum(1 for r in resultados if r.get("estado") == "error")
    print(f"  Creados: {creados}")
    print(f"  Actualizados: {actualizados}")
    print(f"  Omitidos: {omitidos}")
    print(f"  Errores: {errores}")

    for r in resultados:
        if r["estado"] in ("omitido", "error"):
            print(f"  - {r['archivo']}: {r.get('motivo', r['estado'])}")

    print("\nExtracción finalizada.")


if __name__ == "__main__":
    main()
