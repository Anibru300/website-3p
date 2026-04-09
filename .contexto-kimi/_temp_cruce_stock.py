import pandas as pd
import os

# Leer Excel
df = pd.read_excel(r'G:\Mi unidad\pagina web\CATALOGO\CHORE_TIME\03-catalogos_pdf\11 - A-11 CHORETIME.xlsx', header=None, skiprows=4)
df.columns = ['CODIGO','DESCRIPCION','3P','EXIST_ALMACEN','FOTO1','FOTO2','EXTRA']
df = df.dropna(subset=['CODIGO'])
df['CODIGO'] = df['CODIGO'].astype(str).str.strip().str.replace('.0','',regex=False)
df['EXIST_NUM'] = pd.to_numeric(df['EXIST_ALMACEN'], errors='coerce').fillna(0)
con_stock = df[df['EXIST_NUM'] > 0].copy()

print(f'Total SKUs en Excel: {len(df)}')
print(f'SKUs con stock > 0: {len(con_stock)}')
print('\n--- Productos con stock ---')
print(con_stock[['CODIGO','DESCRIPCION','EXIST_NUM']].to_string(index=False))

img_dir = r'G:\Mi unidad\pagina web\CATALOGO\CHORE_TIME\02-imagenes_procesadas'
imgs = [f for f in os.listdir(img_dir) if f.lower().endswith('.png')]
print(f'\nTotal imagenes PNG: {len(imgs)}')

print('\n--- CRUCE: Productos con stock y con al menos 1 foto ---')
resultados = []
for _, row in con_stock.iterrows():
    cod = str(row['CODIGO'])
    matching = [i for i in imgs if cod in i]
    resultados.append({
        'CODIGO': cod,
        'DESCRIPCION': row['DESCRIPCION'],
        'STOCK': int(row['EXIST_NUM']),
        'FOTOS': len(matching)
    })
    if matching:
        print(f"{cod} | {row['DESCRIPCION']} | stock={int(row['EXIST_NUM'])} | fotos={len(matching)}")
        for m in matching[:5]:
            print(f'   - {m}')

print('\n--- Productos con stock pero SIN foto ---')
for r in resultados:
    if r['FOTOS'] == 0:
        print(f"{r['CODIGO']} | {r['DESCRIPCION']} | stock={r['STOCK']}")
