#!/usr/bin/env python3
"""Validación de que los datos de sync_* son idénticos a los del Excel directo.

Para cada fuente habilitada sincroniza y luego compara la salida de cada
consumidor ejecutado con rows del Excel vs rows de sync (mismo código de
parseo, distinta fuente de rows). Normaliza fechas a ISO para comparar.

Uso:
    .venv/Scripts/python.exe tools/validar_sync.py
Salida: tabla de resultados; exit 0 solo si todo es idéntico.
"""

import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.excel import (  # noqa: E402
    _fotos_from_rows,
    _load_fotos_rows_excel,
    _load_pedidos_excel,
    _load_vales_excel,
    _material_en_vales_from_rows,
    _pedido_detalle_from_rows,
    _pedidos_vivos_from_rows,
    _vales_abiertos_from_rows,
)
from app.sync import db as sync_db  # noqa: E402
from app.sync.job import sincronizar_fuente  # noqa: E402
from app.database import users_connection  # noqa: E402


def _normalizar(valor):
    if isinstance(valor, (datetime, date)):
        return valor.isoformat()
    if isinstance(valor, float):
        return round(valor, 6)
    if isinstance(valor, dict):
        return {k: _normalizar(v) for k, v in valor.items()}
    if isinstance(valor, list):
        return [_normalizar(v) for v in valor]
    return valor


def _comparar(nombre, live, sync):
    live_n, sync_n = _normalizar(live), _normalizar(sync)
    if live_n == sync_n:
        return (nombre, "IDENTICO", "")
    # Resumen del diff
    if isinstance(live_n, dict) and isinstance(sync_n, dict):
        solo_live = set(live_n) - set(sync_n)
        solo_sync = set(sync_n) - set(live_n)
        distintos = [k for k in live_n.keys() & sync_n.keys() if live_n[k] != sync_n[k]][:5]
        detalle = f"solo_live={list(solo_live)[:3]} solo_sync={list(solo_sync)[:3]} distintos={distintos}"
    elif isinstance(live_n, list) and isinstance(sync_n, list):
        detalle = f"len live={len(live_n)} sync={len(sync_n)}"
        for i, (a, b) in enumerate(zip(live_n, sync_n)):
            if a != b:
                detalle += f" | primer diff idx={i}: {a} != {b}"
                break
    else:
        detalle = f"{str(live_n)[:100]} != {str(sync_n)[:100]}"
    return (nombre, "DIFERENTE", detalle)


def validar_vales():
    resultados = []
    cabs_live, dets_live = _load_vales_excel()
    with users_connection() as conn:
        sheets = sync_db.cargar_sheets(conn, "vales") or {}
    cabs_sync = sheets.get("VALES", [])
    dets_sync = sheets.get("DETALLE_VALES", [])

    resultados.append(_comparar(
        "material_en_vales",
        _material_en_vales_from_rows(cabs_live, dets_live),
        _material_en_vales_from_rows(cabs_sync, dets_sync),
    ))
    resultados.append(_comparar(
        "vales_abiertos",
        _vales_abiertos_from_rows(cabs_live, dets_live),
        _vales_abiertos_from_rows(cabs_sync, dets_sync),
    ))
    resultados.append(_comparar(
        "fotos_map",
        _fotos_from_rows(_load_fotos_rows_excel()),
        _fotos_from_rows(sheets.get("FOTOS_PRODUCTOS", [])),
    ))
    return resultados


def validar_pedidos():
    resultados = []
    cabs_live, dets_live = _load_pedidos_excel()
    with users_connection() as conn:
        sheets = sync_db.cargar_sheets(conn, "pedidos") or {}
    cabs_sync = sheets.get("PEDIDOS", [])
    dets_sync = sheets.get("DETALLE_PEDIDOS", [])

    resultados.append(_comparar(
        "pedidos_vivos",
        _pedidos_vivos_from_rows(cabs_live, dets_live),
        _pedidos_vivos_from_rows(cabs_sync, dets_sync),
    ))
    folio = ""
    live = _pedidos_vivos_from_rows(cabs_live, dets_live)
    if live:
        folio = live[0]["folio"]
    resultados.append(_comparar(
        f"pedido_detalle({folio or 'sin folio'})",
        _pedido_detalle_from_rows(dets_live, folio),
        _pedido_detalle_from_rows(dets_sync, folio),
    ))
    return resultados


def main() -> int:
    print("== Sincronizando fuentes ==")
    for fuente in ("vales", "pedidos"):
        r = sincronizar_fuente(fuente)
        if r["estado"] == "ok":
            print(f"[OK] {fuente}: {r['filas']} filas")
        else:
            print(f"[ERROR] {fuente}: {r['error']}")
            return 1

    print("\n== Validación de datos (Excel vivo vs sync_*) ==")
    todos = validar_vales() + validar_pedidos()
    ancho = max(len(n) for n, _, _ in todos)
    fallos = 0
    for nombre, estado, detalle in todos:
        print(f"  {nombre:<{ancho}}  {estado}" + (f"  -> {detalle}" if detalle else ""))
        if estado != "IDENTICO":
            fallos += 1

    if fallos:
        print(f"\n[RESULTADO] {fallos} validación(es) con diferencias. NO activar USE_SYNC_TABLES.")
        return 1
    print("\n[RESULTADO] Todo idéntico. Es seguro activar USE_SYNC_TABLES=true.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
