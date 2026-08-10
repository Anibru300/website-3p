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


def get_columns(cur, table_name):
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position;
    """, (table_name,))
    return cur.fetchall()


def sample(cur, table, limit=3):
    cur.execute(f"SELECT * FROM {table} LIMIT {limit};")
    rows = cur.fetchall()
    cols = [desc[0] for desc in cur.description]
    return cols, rows


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

    tables = ["sae_movimientos_inventario", "sae_pedidos", "sae_pedido_lineas", "sae_facturas", "sae_remisiones"]
    for table in tables:
        print(f"\n=== {table} ===")
        cols = get_columns(cur, table)
        for col in cols:
            print(f"  - {col[0]} ({col[1]})")
        print("\n  Muestra:")
        try:
            scols, rows = sample(cur, table, 2)
            for row in rows:
                print(f"    {dict(zip(scols, row))}")
        except Exception as e:
            print(f"    ERROR: {e}")

    conn.close()


if __name__ == "__main__":
    main()
