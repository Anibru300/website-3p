"""Pruebas del módulo Logística (demanda / abastecimiento / asignación / recepciones).

Casos obligatorios del flujo:
1. Pedido de 50 sin stock  -> demanda PEDIDO = 50 (generada automáticamente).
2. Stock: exist 10, min 30, max 50 -> demanda STOCK = 40 (objetivo - existencia).
3. Pedido 50 + stock 30, OC 80 asignada 50/30 -> PEDIDO=50, STOCK=30, TOTAL=80.
4. Compra 100 con necesidad 80 -> asignado 80, sin asignar 20.
5. OC 80, recepcion 40 -> recibido 40, pendiente 40.
6. Asignar 90 contra 80 -> 422 (R1).
7. Recibir 90 contra 80 -> 422 (R2).
8. Necesidad 50 cubierta por 50 en transito -> demanda 'cubierta', cobertura lo reporta,
   la regeneracion no duplica.
9. Fecha estimada vencida con pendiente -> aparece en 'atrasados', resumen y alerta.
"""

import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_TMP_DB = Path(__file__).parent / "_test_users.db"
_TMP_LOG = Path(__file__).parent / "_test_logistica.db"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ["LOGISTICA_DB_PATH"] = str(_TMP_LOG)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.services.logistica as svc  # noqa: E402
from app.auth.dependencies import get_current_user  # noqa: E402
from app.main import app  # noqa: E402


class _CursorFalso:
    def __init__(self, rows):
        self._rows = rows
        self.sql = None
        self.params = None

    def execute(self, sql, params=None):
        self.sql = sql
        self.params = params

    def fetchall(self):
        return list(self._rows)


class _CtxFalso:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self._cursor

    def __exit__(self, *args):
        return False


def _mock_postgres(monkeypatch, rows):
    monkeypatch.setattr(
        svc, "postgres_cursor", lambda: _CtxFalso(_CursorFalso(rows))
    )


def _mock_pedidos(monkeypatch, detalles, cabeceras=None):
    from app.services import excel as excel_svc

    monkeypatch.setattr(
        excel_svc, "_pedidos_rows", lambda: (cabeceras or [], detalles)
    )


@pytest.fixture(autouse=True)
def limpiar_bd():
    from app.database import logistica_connection

    with logistica_connection() as conn:
        for tabla in ("asignacion", "recepcion", "abastecimiento", "demanda"):
            conn.execute(f"DELETE FROM {tabla}")
        conn.commit()
    yield
    with logistica_connection() as conn:
        for tabla in ("asignacion", "recepcion", "abastecimiento", "demanda"):
            conn.execute(f"DELETE FROM {tabla}")
        conn.commit()


@pytest.fixture
def cliente_admin():
    app.dependency_overrides[get_current_user] = lambda: {
        "email": "admin@test", "nombre": "Admin", "rol": "admin",
    }
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def cliente_user():
    app.dependency_overrides[get_current_user] = lambda: {
        "email": "user@test", "nombre": "Usuario", "rol": "user",
    }
    yield TestClient(app)
    app.dependency_overrides.clear()


def _detalle(folio, codigo, pendiente, cliente="AVIGRUPO", fecha="2026-12-31"):
    return {
        "FOLIO_PEDIDO": folio,
        "CODIGO": codigo,
        "DESCRIPCION": "Producto de prueba",
        "CLIENTE": cliente,
        "CANT_PEDIDA": pendiente,
        "CANT_PENDIENTE_SURTIR": pendiente,
        "FECHA_ENTREGA_TENTATIVA": fecha,
    }


def _fila_stock(codigo, existencia, stock_min, stock_max):
    return {
        "codigo": codigo,
        "descripcion": f"Producto {codigo}",
        "existencia": existencia,
        "stock_min": stock_min,
        "stock_max": stock_max,
    }


def _alta_abastecimiento(cliente, material="2431070", cantidad=80, oc="4500079712",
                         fecha_estimada=None, proveedor="Proveedor X"):
    body = {"material": material, "cantidad": cantidad, "oc": oc,
            "proveedor": proveedor}
    if fecha_estimada:
        body["fecha_estimada"] = fecha_estimada
    r = cliente.post("/api/logistica/abastecimientos", json=body)
    assert r.status_code == 200, r.text
    return r.json()["id"]


def _demandas_por_tipo(cliente, tipo):
    r = cliente.get("/api/logistica/demanda", params={"tipo": tipo})
    assert r.status_code == 200
    return r.json()["data"]


class TestDemandaAutomatica:
    def test_caso1_pedido_genera_demanda(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [])
        r = cliente_admin.post("/api/logistica/demanda/regenerar")
        assert r.status_code == 200
        demandas = _demandas_por_tipo(cliente_admin, "PEDIDO")
        assert len(demandas) == 1
        assert demandas[0]["cantidad"] == 50
        assert demandas[0]["referencia"] == "2026-001"
        assert demandas[0]["cliente"] == "AVIGRUPO"
        assert demandas[0]["estatus"] == "pendiente"

    def test_caso2_stock_objetivo_menos_existencia(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [])
        # existencia 10, min 30, max 50 -> necesidad 40
        _mock_postgres(monkeypatch, [_fila_stock("A1", 10, 30, 50)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        demandas = _demandas_por_tipo(cliente_admin, "STOCK")
        assert len(demandas) == 1
        assert demandas[0]["material"] == "A1"
        assert demandas[0]["cantidad"] == 40

    def test_stock_sin_stock_max_usa_minimo(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [])
        # existencia 5, min 20, max 0 -> objetivo = minimo = 20 -> necesidad 15
        _mock_postgres(monkeypatch, [_fila_stock("B2", 5, 20, 0)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        demandas = _demandas_por_tipo(cliente_admin, "STOCK")
        assert len(demandas) == 1
        assert demandas[0]["cantidad"] == 15

    def test_regenerar_es_idempotente(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        cliente_admin.post("/api/logistica/demanda/regenerar")
        demandas = _demandas_por_tipo(cliente_admin, "PEDIDO")
        assert len(demandas) == 1
        assert demandas[0]["cantidad"] == 50

    def test_regenerar_desactiva_demanda_obsoleta(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        # El pedido se surte: ya no hay pendiente
        _mock_pedidos(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        assert _demandas_por_tipo(cliente_admin, "PEDIDO") == []

    def test_demanda_otra_requiere_justificacion(self, cliente_admin):
        r = cliente_admin.post("/api/logistica/demanda", json={
            "material": "X1", "cantidad": 10, "justificacion": "Muestra para cliente",
        })
        assert r.status_code == 200
        assert r.json()["tipo"] == "OTRA"
        assert r.json()["origen"] == "manual"


class TestAbastecimientoYAsignacion:
    def test_caso3_desglose_pedido_y_stock(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        # existencia 0, min 30, max 30 -> necesidad de stock = 30 (caso del usuario)
        _mock_postgres(monkeypatch, [_fila_stock("2431070", 0, 30, 30)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem_pedido = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        dem_stock = _demandas_por_tipo(cliente_admin, "STOCK")[0]

        aid = _alta_abastecimiento(cliente_admin, cantidad=80)
        for did, cant in ((dem_pedido["id"], 50), (dem_stock["id"], 30)):
            r = cliente_admin.post("/api/logistica/asignaciones", json={
                "abastecimiento_id": aid, "demanda_id": did, "cantidad": cant,
            })
            assert r.status_code == 200, r.text

        abast = cliente_admin.get("/api/logistica/abastecimientos").json()["data"]
        assert len(abast) == 1
        a = abast[0]
        assert a["asignado_pedido"] == 50
        assert a["asignado_stock"] == 30
        assert a["asignado"] == 80
        assert a["sin_asignar"] == 0
        assert "2026-001" in a["pedidos"]

        # Demandas quedan cubiertas
        assert _demandas_por_tipo(cliente_admin, "PEDIDO")[0]["estatus"] == "cubierta"
        assert _demandas_por_tipo(cliente_admin, "STOCK")[0]["estatus"] == "cubierta"

    def test_caso4_compra_mayor_a_necesidad_sin_asignar(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [_fila_stock("2431070", 10, 30, 50)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem_pedido = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        dem_stock = _demandas_por_tipo(cliente_admin, "STOCK")[0]

        aid = _alta_abastecimiento(cliente_admin, cantidad=100)
        for did, cant in ((dem_pedido["id"], 50), (dem_stock["id"], 30)):
            cliente_admin.post("/api/logistica/asignaciones", json={
                "abastecimiento_id": aid, "demanda_id": did, "cantidad": cant,
            })

        a = cliente_admin.get(
            "/api/logistica/abastecimientos", params={"filtro": "sin_asignar"}
        ).json()["data"]
        assert len(a) == 1
        assert a[0]["asignado"] == 80
        assert a[0]["sin_asignar"] == 20

    def test_caso6_asignar_mas_de_lo_abastecido_bloquea(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [_fila_stock("2431070", 10, 30, 50)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem_pedido = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        dem_stock = _demandas_por_tipo(cliente_admin, "STOCK")[0]
        aid = _alta_abastecimiento(cliente_admin, cantidad=80)

        assert cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem_pedido["id"], "cantidad": 50,
        }).status_code == 200
        # 50 + 40 = 90 > 80 -> debe bloquearse
        r = cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem_stock["id"], "cantidad": 40,
        })
        assert r.status_code == 422
        assert "supera la cantidad abastecida" in r.json()["detail"]

    def test_asignacion_exige_mismo_material(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "9999", 10)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        aid = _alta_abastecimiento(cliente_admin, material="2431070", cantidad=10)
        r = cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem["id"], "cantidad": 10,
        })
        assert r.status_code == 422
        assert "no coincide" in r.json()["detail"]

    def test_borrar_asignacion_libera_cupo(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        aid = _alta_abastecimiento(cliente_admin, cantidad=80)
        asig = cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem["id"], "cantidad": 50,
        }).json()
        r = cliente_admin.delete(f"/api/logistica/asignaciones/{asig['id']}")
        assert r.status_code == 200
        abast = cliente_admin.get("/api/logistica/abastecimientos").json()["data"][0]
        assert abast["sin_asignar"] == 80
        assert _demandas_por_tipo(cliente_admin, "PEDIDO")[0]["estatus"] == "pendiente"


class TestRecepciones:
    def _setup_oc80(self, cliente_admin, monkeypatch, fecha_estimada=None):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [_fila_stock("2431070", 10, 30, 50)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem_pedido = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        dem_stock = _demandas_por_tipo(cliente_admin, "STOCK")[0]
        aid = _alta_abastecimiento(cliente_admin, cantidad=80, fecha_estimada=fecha_estimada)
        for did, cant in ((dem_pedido["id"], 50), (dem_stock["id"], 30)):
            cliente_admin.post("/api/logistica/asignaciones", json={
                "abastecimiento_id": aid, "demanda_id": did, "cantidad": cant,
            })
        return aid

    def test_caso5_recepcion_parcial_calcula_pendiente(self, cliente_admin, monkeypatch):
        aid = self._setup_oc80(cliente_admin, monkeypatch)
        r = cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid, "cantidad": 40, "fecha_recepcion": "2026-09-04",
            "documento": "REM-100", "ubicacion": "FANCOM",
        })
        assert r.status_code == 200, r.text

        abast = cliente_admin.get("/api/logistica/abastecimientos").json()["data"][0]
        assert abast["recibido"] == 40
        assert abast["pendiente_recibir"] == 40
        assert abast["estatus"] == "parcial"

        recepciones = cliente_admin.get("/api/logistica/recepciones").json()["data"]
        assert len(recepciones) == 1
        assert recepciones[0]["documento"] == "REM-100"

    def test_caso7_recibir_mas_de_lo_comprado_bloquea(self, cliente_admin, monkeypatch):
        aid = self._setup_oc80(cliente_admin, monkeypatch)
        cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid, "cantidad": 80, "fecha_recepcion": "2026-09-04",
        })
        r = cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid, "cantidad": 10, "fecha_recepcion": "2026-09-05",
        })
        assert r.status_code == 422
        assert "supera la cantidad comprada" in r.json()["detail"]

    def test_recepcion_total_marca_recibido(self, cliente_admin, monkeypatch):
        aid = self._setup_oc80(cliente_admin, monkeypatch)
        cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid, "cantidad": 80, "fecha_recepcion": "2026-09-04",
        })
        abast = cliente_admin.get("/api/logistica/abastecimientos").json()["data"][0]
        assert abast["estatus"] == "recibido"
        assert abast["pendiente_recibir"] == 0


class TestCoberturaYAntiDuplicidad:
    def test_caso8_necesidad_cubierta_no_se_duplica(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        aid = _alta_abastecimiento(cliente_admin, cantidad=50)
        cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem["id"], "cantidad": 50,
        })

        # Re-regenerar con la misma necesidad: no debe crear demanda extra
        cliente_admin.post("/api/logistica/demanda/regenerar")
        assert len(_demandas_por_tipo(cliente_admin, "PEDIDO")) == 1

        cobertura = cliente_admin.get("/api/logistica/cobertura/2431070").json()
        assert cobertura["necesidad"] == 0      # todo cubierto
        assert cobertura["cubierto"] == 50
        assert cobertura["en_transito"] == 50
        assert cobertura["suficiente"] is True


class TestAtrasadosYAlertas:
    def test_caso9_atrasado_aparece_en_filtro_resumen_y_alerta(self, cliente_admin, monkeypatch):
        ayer = (date.today() - timedelta(days=1)).isoformat()
        aid = TestRecepciones()._setup_oc80(cliente_admin, monkeypatch, fecha_estimada=ayer)

        atrasados = cliente_admin.get(
            "/api/logistica/abastecimientos", params={"filtro": "atrasados"}
        ).json()["data"]
        assert len(atrasados) == 1
        assert atrasados[0]["atrasado"] is True

        resumen = cliente_admin.get("/api/logistica/resumen").json()
        assert resumen["atrasado_oc"] == 1
        assert resumen["atrasado_piezas"] == 80
        assert resumen["por_llegar"] == 80
        assert resumen["para_pedidos"] == 50
        assert resumen["para_stock"] == 30
        assert resumen["sin_asignar"] == 0

        from app.analytics.alertas import _evaluar_logistica

        alerta = _evaluar_logistica()
        assert alerta["activa"] is True
        assert alerta["atrasados"] == 1

    def test_proximos_7_dias(self, cliente_admin, monkeypatch):
        en_3_dias = (date.today() + timedelta(days=3)).isoformat()
        TestRecepciones()._setup_oc80(cliente_admin, monkeypatch, fecha_estimada=en_3_dias)
        proximos = cliente_admin.get(
            "/api/logistica/abastecimientos", params={"filtro": "proximos"}
        ).json()["data"]
        assert len(proximos) == 1
        resumen = cliente_admin.get("/api/logistica/resumen").json()
        assert resumen["proximos_7_dias"] == 80

    def test_alertas_sin_novedades(self, cliente_admin):
        from app.analytics.alertas import _evaluar_logistica

        alerta = _evaluar_logistica()
        assert alerta["activa"] is False


class TestAuth:
    def test_lectura_abierta_a_usuario_autenticado(self, cliente_user):
        r = cliente_user.get("/api/logistica/resumen")
        assert r.status_code == 200
        r = cliente_user.get("/api/logistica/demanda")
        assert r.status_code == 200

    def test_escritura_requiere_admin(self, cliente_user):
        r = cliente_user.post("/api/logistica/abastecimientos", json={
            "material": "X", "cantidad": 10,
        })
        assert r.status_code == 403
        r = cliente_user.post("/api/logistica/demanda/regenerar")
        assert r.status_code == 403

    def test_sin_sesion_rechaza(self):
        cliente = TestClient(app)
        assert cliente.get("/api/logistica/resumen").status_code == 401


class TestMatrizAsignaciones:
    def test_matriz_por_oc_con_detalle(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 50)])
        _mock_postgres(monkeypatch, [_fila_stock("2431070", 10, 30, 50)])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem_pedido = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        dem_stock = _demandas_por_tipo(cliente_admin, "STOCK")[0]
        aid = _alta_abastecimiento(cliente_admin, cantidad=80)
        for did, cant in ((dem_pedido["id"], 50), (dem_stock["id"], 30)):
            cliente_admin.post("/api/logistica/asignaciones", json={
                "abastecimiento_id": aid, "demanda_id": did, "cantidad": cant,
            })

        matriz = cliente_admin.get("/api/logistica/asignaciones").json()["data"]
        assert len(matriz) == 1
        fila = matriz[0]
        assert fila["oc"] == "4500079712"
        assert fila["cantidad"] == 80
        assert fila["asignado_pedido"] == 50
        assert fila["asignado_stock"] == 30
        assert fila["sin_asignar"] == 0
        assert fila["recibido"] == 0
        assert fila["pendiente_recibir"] == 80
        tipos = sorted(d["tipo"] for d in fila["detalle"])
        assert tipos == ["PEDIDO", "STOCK"]


# ---------------------------------------------------------------------------
# Vinculación recepciones <-> entradas por compra de SAE (cuadre)
# ---------------------------------------------------------------------------

def _mov_compra(id_, material, cantidad, fecha, referencia, proveedor="LUBING MESOAMERICANA, S.A. DE C.V.", cve_clpv="1002", almacen=2):
    return {
        "id": id_, "material": material, "cantidad": cantidad, "fecha_doc": fecha,
        "referencia": referencia, "almacen": almacen, "cve_clpv": cve_clpv,
        "nombre_tercero": proveedor,
    }


class TestVinculacionSae:
    def _setup_oc_con_recepcion(self, cliente_admin, monkeypatch):
        _mock_pedidos(monkeypatch, [_detalle("2026-001", "2431070", 10)])
        _mock_postgres(monkeypatch, [])
        cliente_admin.post("/api/logistica/demanda/regenerar")
        dem = _demandas_por_tipo(cliente_admin, "PEDIDO")[0]
        aid = _alta_abastecimiento(cliente_admin, material="2431070", cantidad=10,
                                   fecha_estimada="2026-09-10")
        cliente_admin.post("/api/logistica/asignaciones", json={
            "abastecimiento_id": aid, "demanda_id": dem["id"], "cantidad": 10,
        })
        rec = cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid, "cantidad": 10, "fecha_recepcion": "2026-09-04",
        }).json()
        return aid, rec["id"]

    def test_candidatas_excluye_vinculadas_y_ordena_proveedor(self, cliente_admin, monkeypatch):
        aid, _ = self._setup_oc_con_recepcion(cliente_admin, monkeypatch)
        movs = [
            _mov_compra(1, "2431070", 10, date(2026, 7, 10), "2207085"),   # mismo proveedor
            _mov_compra(2, "2431070", 10, date(2026, 7, 12), "2207090",
                        proveedor="OTRO PROVEEDOR S.A."),
        ]
        # La OC de prueba quedó con proveedor genérico; la actualizamos a LUBING
        r_put = cliente_admin.put(f"/api/logistica/abastecimientos/{aid}",
                                  json={"proveedor": "LUBING MESOAMERICANA, S.A. DE C.V."})
        assert r_put.status_code == 200
        _mock_postgres(monkeypatch, movs)
        r = cliente_admin.get(f"/api/logistica/abastecimientos/{aid}/candidatas-sae")
        assert r.status_code == 200
        cands = r.json()["candidatas"]
        assert len(cands) == 2
        assert cands[0]["mismo_proveedor"] is True
        assert cands[0]["id"] == 1

        # Vincular la 1: la candidata 1 desaparece de la lista
        _mock_postgres(monkeypatch, movs)
        rec_id = cliente_admin.get("/api/logistica/recepciones").json()["data"][0]["id"]
        r = cliente_admin.post(f"/api/logistica/recepciones/{rec_id}/vincular",
                               json={"mov_sae_id": 1})
        assert r.status_code == 200, r.text
        assert r.json()["cuadrada"] is True
        assert r.json()["discrepancia"] is False

        _mock_postgres(monkeypatch, movs)
        cands = cliente_admin.get(
            f"/api/logistica/abastecimientos/{aid}/candidatas-sae"
        ).json()["candidatas"]
        assert [c["id"] for c in cands] == [2]

    def test_vincular_detecta_discrepancia(self, cliente_admin, monkeypatch):
        _, rec_id = self._setup_oc_con_recepcion(cliente_admin, monkeypatch)
        movs = [_mov_compra(9, "2431070", 8, date(2026, 7, 10), "2207085")]
        _mock_postgres(monkeypatch, movs)
        r = cliente_admin.post(f"/api/logistica/recepciones/{rec_id}/vincular",
                               json={"mov_sae_id": 9})
        assert r.status_code == 200
        assert r.json()["discrepancia"] is True  # recibimos 10, SAE reporta 8

        recs = cliente_admin.get("/api/logistica/recepciones").json()["data"]
        assert recs[0]["cuadrada"] == 1
        assert recs[0]["mov_referencia"] == "2207085"
        assert recs[0]["mov_cantidad"] == 8
        assert recs[0]["discrepancia"] is True

    def test_vincular_rechaza_movimiento_ocupado(self, cliente_admin, monkeypatch):
        _, rec_id = self._setup_oc_con_recepcion(cliente_admin, monkeypatch)
        movs = [_mov_compra(5, "2431070", 10, date(2026, 7, 10), "2207085")]
        _mock_postgres(monkeypatch, movs)
        assert cliente_admin.post(
            f"/api/logistica/recepciones/{rec_id}/vincular", json={"mov_sae_id": 5}
        ).status_code == 200

        # Segunda recepcion intenta el mismo movimiento
        aid2 = _alta_abastecimiento(cliente_admin, material="2431070", cantidad=5)
        rec2 = cliente_admin.post("/api/logistica/recepciones", json={
            "abastecimiento_id": aid2, "cantidad": 5, "fecha_recepcion": "2026-09-05",
        }).json()
        _mock_postgres(monkeypatch, movs)
        r = cliente_admin.post(f"/api/logistica/recepciones/{rec2['id']}/vincular",
                               json={"mov_sae_id": 5})
        assert r.status_code == 409
        assert "ya está vinculada" in r.json()["detail"]

    def test_vincular_rechaza_movimiento_inexistente(self, cliente_admin, monkeypatch):
        _, rec_id = self._setup_oc_con_recepcion(cliente_admin, monkeypatch)
        _mock_postgres(monkeypatch, [])
        r = cliente_admin.post(f"/api/logistica/recepciones/{rec_id}/vincular",
                               json={"mov_sae_id": 999})
        assert r.status_code == 422

    def test_candidatas_404_abastecimiento_inexistente(self, cliente_admin, monkeypatch):
        _mock_postgres(monkeypatch, [])
        r = cliente_admin.get("/api/logistica/abastecimientos/9999/candidatas-sae")
        assert r.status_code == 404


class TestAlertaEspejoSae:
    def _estado_sae(self, edad_horas):
        ref = (datetime.now(timezone.utc) - timedelta(hours=edad_horas)).isoformat()
        return {
            "revisado_en": datetime.now(timezone.utc).isoformat(),
            "excel": {},
            "sae": {
                "fuente": "sae_postgres",
                "estado": "ok",
                "detalle": "OK",
                "tablas": {
                    "sae_existencias": {"max_upd": ref, "n": 100},
                    "sae_movimientos_inventario": {"max_upd": ref, "n": 100},
                },
            },
        }

    def test_espejo_viejo_genera_problema(self, monkeypatch):
        from app.analytics import alertas as alertas_mod
        from app.services import fuentes as fuentes_mod

        monkeypatch.setattr(fuentes_mod, "estado_fuentes",
                            lambda: self._estado_sae(edad_horas=200))
        resultado = alertas_mod._evaluar_fuentes()
        assert resultado["activa"] is True
        problemas = {(p["fuente"], p["problema"]) for p in resultado["problemas"]}
        assert ("sae_existencias", "espejo_desactualizado") in problemas
        assert ("sae_movimientos_inventario", "espejo_desactualizado") in problemas

    def test_espejo_fresco_no_genera_problema(self, monkeypatch):
        from app.analytics import alertas as alertas_mod
        from app.services import fuentes as fuentes_mod

        monkeypatch.setattr(fuentes_mod, "estado_fuentes",
                            lambda: self._estado_sae(edad_horas=5))
        resultado = alertas_mod._evaluar_fuentes()
        sae_problemas = [
            p for p in resultado.get("problemas", [])
            if p["fuente"].startswith("sae_")
        ]
        assert sae_problemas == []
