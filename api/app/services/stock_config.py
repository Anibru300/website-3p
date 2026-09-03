"""Configuración de stock mínimo personalizado por producto.

La fuente base de los mínimos es SAE (`stock_min` en `sae_existencias`), pero
no todos los productos lo tienen. Esta tabla guarda overrides por código
(`cve_art`): si un producto tiene configuración aquí, esa manda; si no, se usa
el mínimo de SAE cuando es mayor a 0; si no hay ninguno, el producto no alerta.

Regla única en todo el sistema (dashboard, alertas y catálogo admin).
"""

from app.database import users_connection


def obtener_configs() -> dict:
    """Devuelve {codigo: stock_min} con toda la configuración personalizada."""
    with users_connection() as conn:
        filas = conn.execute(
            "SELECT codigo, stock_min FROM stock_config"
        ).fetchall()
    return {f["codigo"]: float(f["stock_min"]) for f in filas}


def minimo_efectivo(stock_min_sae, custom):
    """Mínimo que aplica al producto.

    custom (configurado en el panel) manda sobre SAE. En SAE, 0 o NULL
    significa "sin mínimo configurado". Devuelve None si no hay mínimo.
    """
    if custom is not None:
        return float(custom)
    if stock_min_sae is not None and float(stock_min_sae) > 0:
        return float(stock_min_sae)
    return None


def merge_config(rows, configs: dict) -> list:
    """Agrega a cada fila stock_min_custom, minimo_efectivo, origen y bajo_minimo.

    Cada fila debe traer al menos: codigo, existencia, stock_min (el de SAE).
    """
    resultado = []
    for fila in rows:
        codigo = fila["codigo"]
        custom = configs.get(codigo)
        efectivo = minimo_efectivo(fila.get("stock_min"), custom)
        origen = "manual" if custom is not None else ("sae" if efectivo is not None else "ninguno")
        existencia = float(fila.get("existencia") or 0)
        fila = dict(fila)
        fila["existencia"] = existencia
        fila["stock_min_sae"] = float(fila["stock_min"]) if fila.get("stock_min") is not None else None
        fila["stock_min_custom"] = custom
        fila["minimo_efectivo"] = efectivo
        fila["origen"] = origen
        fila["bajo_minimo"] = efectivo is not None and existencia <= efectivo
        resultado.append(fila)
    return resultado
