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

    print("=== Columnas de sae_existencias ===")
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sae_existencias'
        ORDER BY ordinal_position;
    """)
    for row in cur.fetchall():
        print(f"  - {row[0]} ({row[1]})")

    print("\n=== Columnas de sae_almacenes ===")
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sae_almacenes'
        ORDER BY ordinal_position;
    """)
    for row in cur.fetchall():
        print(f"  - {row[0]} ({row[1]})")

    print("\n=== Valorización por almacén (muestra) ===")
    cur.execute("""
        SELECT 
            e.cve_alm,
            a.descripcion,
            SUM(e.exist * COALESCE(p.costo_promedio, 0)) AS valor_total
        FROM sae_existencias e
        LEFT JOIN sae_almacenes a ON e.cve_alm = a.cve_alm
        LEFT JOIN sae_productos p ON e.cve_art = p.cve_art
        WHERE e.exist > 0
        GROUP BY e.cve_alm, a.descripcion
        ORDER BY valor_total DESC
        LIMIT 10;
    """)
    for row in cur.fetchall():
        print(f"  {row}")

    conn.close()


if __name__ == "__main__":
    main()
