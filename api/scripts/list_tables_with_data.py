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

    # Tablas/vistas potencialmente relevantes
    patterns = ["vale", "pedido", "factura", "cobranza", "existencia", "movimiento", "almacen", "venta", "remision"]

    print("=== Tablas/vistas que coinciden con patrones relevantes ===")
    cur.execute("""
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cur.fetchall()
    for table, ttype in tables:
        if any(p in table.lower() for p in patterns):
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table};")
                count = cur.fetchone()[0]
                print(f"  {table} ({ttype}): {count} registros")
            except Exception as e:
                print(f"  {table} ({ttype}): ERROR {e}")

    conn.close()


if __name__ == "__main__":
    main()
