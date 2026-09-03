#!/usr/bin/env python3
"""Respaldo de las bases de datos SQLite del sistema con retención.

Copia users.db, cotizaciones.db e inventario_historico.db (resueltas desde
users_db_path, igual que el backend) a data/backups/YYYY-MM-DD/. Si la carpeta
del día ya existe, agrega sufijo con hora. Borra respaldos con más de
RETENCION_DIAS días.

Uso:
    .venv/Scripts/python.exe tools/backup_sqlite.py
    .venv/Scripts/python.exe tools/backup_sqlite.py --retencion 30
"""

import argparse
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings  # noqa: E402

RETENCION_DIAS = 30
BASES = ["users.db", "cotizaciones.db", "inventario_historico.db"]


def _db_dir() -> Path:
    base = Path(get_settings().users_db_path).resolve().parent
    base.mkdir(parents=True, exist_ok=True)
    return base


def _verificar_integridad(db_path: Path) -> bool:
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        try:
            conn.execute("PRAGMA quick_check").fetchone()
        finally:
            conn.close()
        return True
    except sqlite3.Error:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--retencion", type=int, default=RETENCION_DIAS)
    args = parser.parse_args()

    db_dir = _db_dir()
    hoy = datetime.now().strftime("%Y-%m-%d")
    destino = db_dir / "backups" / hoy
    if destino.exists():
        destino = destino.with_name(f"{hoy}-{datetime.now().strftime('%H%M')}")
    destino.mkdir(parents=True, exist_ok=True)

    copiados = []
    faltantes = []
    for nombre in BASES:
        origen = db_dir / nombre
        if not origen.exists():
            faltantes.append(nombre)
            continue
        if not _verificar_integridad(origen):
            print(f"[SKIP] {nombre}: falló integridad (quick_check), no se respalda")
            faltantes.append(nombre)
            continue
        shutil.copy2(origen, destino / nombre)
        copiados.append(nombre)

    # Probar que las copias se pueden abrir.
    for nombre in copiados:
        if not _verificar_integridad(destino / nombre):
            print(f"[ERROR] La copia de {nombre} no pasó integridad")
            return 1

    # Retención: borrar carpetas de respaldo antiguas.
    eliminados = []
    backups_root = db_dir / "backups"
    for carpeta in sorted(backups_root.iterdir()):
        if not carpeta.is_dir():
            continue
        try:
            fecha = datetime.strptime(carpeta.name[:10], "%Y-%m-%d")
        except ValueError:
            continue  # carpeta con nombre inesperado, no tocar
        if (datetime.now() - fecha).days > args.retencion:
            shutil.rmtree(carpeta)
            eliminados.append(carpeta.name)

    print(f"[OK] Respaldo en {destino}")
    print(f"     Copiadas: {', '.join(copiados) or 'ninguna'}")
    if faltantes:
        print(f"     Omitidas: {', '.join(faltantes)}")
    if eliminados:
        print(f"     Retención: eliminadas {len(eliminados)} carpeta(s): {', '.join(eliminados)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
