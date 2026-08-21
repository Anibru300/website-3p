import os, re

base = r'C:\Projects\PAGINA WEB 3P\public\images\catalogo\chore-time'
existing = set(os.listdir(base))

js_path = r'C:\Projects\PAGINA WEB 3P\src\data\choreTimeProducts.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'imagen:\s*"([^"]+)"', content)
for m in matches:
    fname = os.path.basename(m)
    if fname not in existing:
        print('FALTA:', fname)
