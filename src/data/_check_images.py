import os, re

base = r'G:\Mi unidad\pagina web\3p-website\public\images\catalogo\chore-time'
existing = set(os.listdir(base))

js_path = r'G:\Mi unidad\pagina web\3p-website\src\data\choreTimeProducts.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'imagen:\s*"([^"]+)"', content)
for m in matches:
    fname = os.path.basename(m)
    if fname not in existing:
        print('FALTA:', fname)
