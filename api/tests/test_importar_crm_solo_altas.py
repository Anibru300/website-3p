"""Pruebas del importador de CRM en modo solo-altas (Fase 3).

Verifica la regla de verdad única: el panel admin manda, el import no debe
pisar ediciones existentes salvo que se pase actualizar=True.
"""

import os
import sqlite3
import sys
from pathlib import Path

import pytest
from openpyxl import Workbook

_TMP_DB = Path(__file__).parent / "_test_users.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

import importar_crm_excel as imp  # noqa: E402

SCHEMA_ENTIDADES = """
    CREATE TABLE crm_entidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_externo TEXT,
        tipo TEXT,
        nombre TEXT,
        razon_social TEXT,
        rfc TEXT,
        telefono TEXT,
        email TEXT,
        condicion_pago TEXT,
        dias_credito TEXT,
        vendedor TEXT,
        industria TEXT,
        status TEXT,
        notas TEXT,
        activo INTEGER DEFAULT 1,
        updated_at TEXT
    )
"""


@pytest.fixture()
def conn():
    c = sqlite3.connect(":memory:")
    c.row_factory = sqlite3.Row
    c.execute(SCHEMA_ENTIDADES)
    yield c
    c.close()


def _excel_clientes(path, filas):
    """filas: lista de tuplas (id_cliente, nombre, telefono)."""
    wb = Workbook()
    ws = wb.active
    ws.title = "CAT_CLIENTES"
    ws.append(["ID CLIENTE", "NOMBRE CLIENTE", "TELEFONO"])
    for f in filas:
        ws.append(list(f))
    wb.save(path)
    wb.close()


class TestSoloAltas:
    def test_segunda_corrida_no_pisa_ediciones_del_panel(self, conn, tmp_path):
        xlsx = tmp_path / "crm.xlsm"
        _excel_clientes(xlsx, [("1", "Cliente Uno", "111"), ("2", "Cliente Dos", "222")])

        r1 = imp.procesar_cat_clientes(conn, xlsx)
        assert r1["creadas"] == 2

        # El panel admin edita el teléfono del cliente 1
        conn.execute(
            "UPDATE crm_entidades SET telefono = '9999999' WHERE nombre = 'Cliente Uno'"
        )
        conn.commit()

        # El Excel cambia el teléfono y agrega un cliente nuevo
        _excel_clientes(xlsx, [("1", "Cliente Uno", "555"), ("2", "Cliente Dos", "222"), ("3", "Cliente Tres", "333")])

        r2 = imp.procesar_cat_clientes(conn, xlsx)  # modo solo-altas (default)
        assert r2["creadas"] == 1  # solo el cliente nuevo
        assert r2["actualizadas"] == 0

        telefono = conn.execute(
            "SELECT telefono FROM crm_entidades WHERE nombre = 'Cliente Uno'"
        ).fetchone()["telefono"]
        assert telefono == "9999999"  # la edición del panel sobrevive

    def test_actualizar_true_pisa_datos(self, conn, tmp_path):
        xlsx = tmp_path / "crm.xlsm"
        _excel_clientes(xlsx, [("1", "Cliente Uno", "111")])

        imp.procesar_cat_clientes(conn, xlsx)
        conn.execute(
            "UPDATE crm_entidades SET telefono = '9999999' WHERE nombre = 'Cliente Uno'"
        )
        conn.commit()

        _excel_clientes(xlsx, [("1", "Cliente Uno", "555")])
        r = imp.procesar_cat_clientes(conn, xlsx, actualizar=True)

        assert r["actualizadas"] == 1
        telefono = conn.execute(
            "SELECT telefono FROM crm_entidades WHERE nombre = 'Cliente Uno'"
        ).fetchone()["telefono"]
        assert telefono == "555"

    def test_no_duplica_entidadesexistentes(self, conn, tmp_path):
        xlsx = tmp_path / "crm.xlsm"
        _excel_clientes(xlsx, [("1", "Cliente Uno", "111")])

        imp.procesar_cat_clientes(conn, xlsx)
        r = imp.procesar_cat_clientes(conn, xlsx)

        assert r["creadas"] == 0
        n = conn.execute("SELECT COUNT(*) FROM crm_entidades").fetchone()[0]
        assert n == 1


def teardown_module():
    try:
        if _TMP_DB.exists():
            _TMP_DB.unlink()
    except OSError:
        pass
    for suffix in ("-wal", "-shm", "-journal"):
        p = Path(str(_TMP_DB) + suffix)
        if p.exists():
            try:
                p.unlink()
            except OSError:
                pass
