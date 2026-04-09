import os

IMG_DIR = r"G:\Mi unidad\pagina web\CATALOGO\CHORE_TIME\02-imagenes_procesadas"
codigos = [
    "14337","2529-839","27772","40741","41308","41309","41315","41317",
    "42013","42208-1000","42372","48299","48564","48608","49646","49649",
    "49651","49652","49673","49674","49983","51763","51861","6854-4","3259-120"
]

print("--- AUDITORIA DE FOTOS PROCESADAS ---\n")
for cod in codigos:
    matches = []
    cod_clean = cod.replace("-","").upper()
    for f in os.listdir(IMG_DIR):
        if f.lower().endswith(".png"):
            f_clean = f.replace("-","").upper()
            if cod_clean in f_clean:
                matches.append(f)
    if not matches:
        print(f"{cod}: SIN FOTOS")
        continue
    
    # Elegir mejor: preferir sin_fondo > vista1 > mayor tamaño
    best = None
    best_score = (-1, -1, "")
    for m in matches:
        path = os.path.join(IMG_DIR, m)
        size = os.path.getsize(path)
        score = 0
        lower = m.lower()
        if "sin_fondo" in lower:
            score += 1000
        if "vista1" in lower:
            score += 500
        if "vista2" in lower:
            score += 400
        if "vista3" in lower:
            score += 300
        # También priorizar si el nombre del archivo incluye el código exacto con guiones
        if cod in m:
            score += 200
        # Tupla para desempate: score, tamaño
        tup = (score, size, m)
        if tup > best_score:
            best_score = tup
            best = m
    print(f"{cod}: {len(matches)} fotos -> MEJOR: {best} ({best_score[1]} bytes)")
    for m in matches:
        mark = "  <- MEJOR" if m == best else ""
        print(f"   - {m}{mark}")
