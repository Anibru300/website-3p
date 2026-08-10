import os
from pathlib import Path

import psycopg2


def load_env():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())


def main():
    load_env()
    conn = psycopg2.connect(
        host=os.environ.get("POSTGRES_HOST", "localhost"),
        port=os.environ.get("POSTGRES_PORT", "5432"),
        dbname=os.environ.get("POSTGRES_DB", "cj_assistant"),
        user=os.environ.get("POSTGRES_USER", ""),
        password=os.environ.get("POSTGRES_PASSWORD", ""),
    )
    cur = conn.cursor()

    print("=== Estados de vales ===")
    cur.execute("SELECT estado, COUNT(*) FROM vales GROUP BY estado;")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\n=== Vales abiertos con cantidad_viva > 0 ===")
    cur.execute("""
        SELECT COUNT(*) 
        FROM vales v 
        JOIN vale_lineas vl ON v.id = vl.vale_id 
        WHERE v.estado = 'abierto' AND vl.cantidad_viva > 0;
    """)
    print(f"  Total: {cur.fetchone()[0]}")

    print("\n=== Primeros 5 vales (cualquier estado) ===")
    cur.execute("""
        SELECT v.id, v.folio, v.estado, v.entregado_a, v.fecha
        FROM vales v
        LIMIT 5;
    """)
    for row in cur.fetchall():
        print(f"  {row}")

    print("\n=== Primeras 5 lineas de vales ===")
    cur.execute("""
        SELECT vl.id, vl.vale_id, vl.producto_id, vl.cantidad, vl.cantidad_viva
        FROM vale_lineas vl
        LIMIT 5;
    """)
    for row in cur.fetchall():
        print(f"  {row}")

    conn.close()


if __name__ == "__main__":
    main()
