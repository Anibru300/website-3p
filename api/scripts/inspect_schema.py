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
    cur.execute(
        """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position;
        """,
        (table_name,),
    )
    return cur.fetchall()


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

    # Tablas con relación a productos que tengan UUID
    print("\n=== Tablas con columna 'id' UUID y referencias a productos ===")
    cur.execute("""
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND data_type = 'uuid'
          AND column_name = 'id'
        ORDER BY table_name;
    """)
    uuid_tables = cur.fetchall()
    for t in uuid_tables:
        print(f"  - {t[0]}")

    tables = ["vales", "vale_lineas", "v_facturas_cobranza", "v_pedidos_vivos", "sae_productos", "sae_almacenes", "productos", "ubicaciones"]
    for table in tables:
        print(f"\n=== {table} ===")
        try:
            columns = get_columns(cur, table)
            if not columns:
                print("  (no existe o no tiene columnas)")
            for col in columns:
                print(f"  - {col[0]} ({col[1]})")
        except Exception as e:
            print(f"  ERROR: {e}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
