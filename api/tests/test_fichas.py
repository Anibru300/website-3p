"""Pruebas del módulo Fichas técnicas / documentos de producto (/api/fichas).

Flujo cubierto:
1. Subir un PDF válido lo registra y guarda el archivo en disco (versión nueva).
2. GET /publicas + GET pdf público sin token.
3. Dos documentos del mismo producto con tipos distintos no se pisan.
4. Re-subir mismo (marca, codigo, tipo): historial (anterior vigente=0) y archivos distintos.
5. Documento privado: no aparece en /publicas ni sirve su pdf; el admin sí lo ve.
6. Usuario rol "user": lectura OK, escrituras 403.
7. Validaciones: .txt -> 422, PDF que excede el límite -> 413.
8. DELETE = desactivación lógica; PATCH activo=1 lo reactiva.
9. Código inexistente -> 404; marca inexistente -> 404.
10. Documento cuyo archivo fue borrado del disco -> 404 en /pdf.
11. Migración idempotente del schema legacy (tabla `fichas`).
12. Producto sin documentos -> {"data": []}.
"""

import os
import sqlite3
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_TMP_DB = Path(__file__).parent / "_test_users.db"
_TMP_FICHAS_DB = Path(__file__).parent / "_test_fichas.db"
_TMP_FICHAS_DIR = Path(__file__).parent / "_test_fichas_files"
os.environ["USERS_DB_PATH"] = str(_TMP_DB)
os.environ["FICHAS_DB_PATH"] = str(_TMP_FICHAS_DB)
os.environ["FICHAS_DIR"] = str(_TMP_FICHAS_DIR)
os.environ.setdefault("JWT_SECRET", "test-secret-de-pruebas-suficientemente-largo")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth.dependencies import get_current_user, get_current_user_optional  # noqa: E402
from app.database import fichas_db_path  # noqa: E402
from app.fichas import service as svc  # noqa: E402
from app.main import app  # noqa: E402

PDF_MINIMO = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n"
PRODUCTOS_STUB = [
    {"codigo": "ABC-123", "descripcion": "Producto ABC"},
    {"codigo": "DEF-456", "descripcion": "Producto DEF"},
]


@pytest.fixture(autouse=True)
def limpiar_documentos(monkeypatch):
    monkeypatch.setattr(svc, "productos_de_marca", lambda slug: list(PRODUCTOS_STUB))
    with svc.fichas_connection() as conn:
        conn.execute("DELETE FROM documentos_producto")
        conn.commit()
    yield
    with svc.fichas_connection() as conn:
        conn.execute("DELETE FROM documentos_producto")
        conn.commit()


@pytest.fixture
def cliente_auth():
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


def _subir_pdf(client, marca="fancom", codigo="ABC-123", tipo="ficha_tecnica",
               contenido=PDF_MINIMO, nombre="ficha.pdf", **extra):
    data = {"marca": marca, "codigo": codigo, "tipo": tipo, **extra}
    return client.post("/api/fichas", data=data, files={"pdf": (nombre, contenido, "application/pdf")})


# 1 -------------------------------------------------------------------------


def test_subir_pdf_valido(cliente_auth):
    r = _subir_pdf(cliente_auth)
    assert r.status_code == 200
    doc = r.json()
    assert doc["marca"] == "fancom"
    assert doc["codigo"] == "ABC-123"
    assert doc["tipo"] == "ficha_tecnica"
    assert doc["tipo_nombre"] == "Ficha técnica"
    assert doc["descripcion"] == "Producto ABC"
    assert doc["nombre_archivo"] == "ficha.pdf"
    assert doc["tamano"] == len(PDF_MINIMO)
    assert doc["version"] == "1.0"
    assert doc["publico"] == 1 and doc["vigente"] == 1 and doc["activo"] == 1
    assert doc["usuario_carga"] == "admin@test"
    assert doc["url"] == f"/api/fichas/{doc['id']}/pdf"
    # El archivo quedó en disco dentro de la carpeta de la marca/codigo/tipo
    assert svc.ruta_archivo(doc).exists()

    # Aparece en el listado privado con la descripción resuelta
    r = cliente_auth.get("/api/fichas")
    assert r.status_code == 200
    datos = r.json()["data"]
    assert len(datos) == 1
    assert datos[0]["descripcion"] == "Producto ABC"


def test_listar_tipos(cliente_auth):
    r = cliente_auth.get("/api/fichas/tipos")
    assert r.status_code == 200
    tipos = r.json()["data"]
    assert [t["codigo"] for t in tipos] == [
        "ficha_tecnica", "especificacion_tecnica", "manual", "catalogo",
        "certificado", "hoja_seguridad", "instructivo", "otro",
    ]
    assert all(t["activo"] == 1 for t in tipos)


# 2 -------------------------------------------------------------------------


def test_publicas_y_pdf_sin_token(cliente_auth):
    doc = _subir_pdf(cliente_auth).json()
    cliente = TestClient(app)  # sin token

    r = cliente.get("/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"})
    assert r.status_code == 200
    publicas = r.json()["data"]
    assert len(publicas) == 1
    assert publicas[0]["id"] == doc["id"]
    assert publicas[0]["tipo"] == "ficha_tecnica"
    assert publicas[0]["url"] == f"/api/fichas/{doc['id']}/pdf"

    r = cliente.get(publicas[0]["url"])
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content == PDF_MINIMO

    # /publicas exige marca y codigo
    assert cliente.get("/api/fichas/publicas", params={"marca": "fancom"}).status_code == 422


# 3 -------------------------------------------------------------------------


def test_dos_tipos_mismo_producto_no_se_pisan(cliente_auth):
    r1 = _subir_pdf(cliente_auth, tipo="ficha_tecnica", nombre="ficha.pdf")
    r2 = _subir_pdf(cliente_auth, tipo="manual", nombre="manual.pdf")
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json()["id"] != r2.json()["id"]

    datos = cliente_auth.get("/api/fichas").json()["data"]
    assert len(datos) == 2
    tipos = {d["tipo"] for d in datos}
    assert tipos == {"ficha_tecnica", "manual"}

    # Archivos distintos en disco y ambos servibles
    assert svc.ruta_archivo(r1.json()) != svc.ruta_archivo(r2.json())
    assert svc.ruta_archivo(r1.json()).exists()
    assert svc.ruta_archivo(r2.json()).exists()
    publicas = cliente_auth.get(
        "/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"}
    ).json()["data"]
    assert len(publicas) == 2


# 4 -------------------------------------------------------------------------


def test_segunda_subida_crea_historial(cliente_auth):
    primera = _subir_pdf(cliente_auth, nombre="v1.pdf").json()
    assert primera["version"] == "1.0"

    nuevo_contenido = PDF_MINIMO + b" contenido nuevo"
    r = _subir_pdf(cliente_auth, contenido=nuevo_contenido, nombre="v2.pdf")
    assert r.status_code == 200
    segunda = r.json()
    assert segunda["id"] != primera["id"]
    assert segunda["version"] == "1.1"  # auto-incrementada

    # El anterior sigue existiendo pero ya no es vigente
    docs = cliente_auth.get("/api/fichas").json()["data"]
    assert len(docs) == 2
    por_id = {d["id"]: d for d in docs}
    assert por_id[primera["id"]]["vigente"] == 0
    assert por_id[segunda["id"]]["vigente"] == 1

    # Ambos archivos existen en disco (nunca se sobrescribe)
    assert svc.ruta_archivo(primera).exists()
    assert svc.ruta_archivo(segunda).exists()
    assert primera["archivo"] != segunda["archivo"]

    # El pdf vigente sirve el contenido nuevo
    r = TestClient(app).get(segunda["url"])
    assert r.content == nuevo_contenido

    # Filtro por vigente
    vigentes = cliente_auth.get("/api/fichas", params={"vigente": 1}).json()["data"]
    assert [d["id"] for d in vigentes] == [segunda["id"]]


# 5 -------------------------------------------------------------------------


def test_documento_privado(cliente_auth):
    doc = _subir_pdf(cliente_auth, publico="0", nombre="privado.pdf").json()
    assert doc["publico"] == 0

    # Sí aparece en el listado privado
    datos = cliente_auth.get("/api/fichas").json()["data"]
    assert [d["id"] for d in datos] == [doc["id"]]

    # NO aparece en públicas
    publicas = TestClient(app).get(
        "/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"}
    ).json()["data"]
    assert publicas == []

    # Su pdf: 404 sin JWT, 200 con admin (preview del dashboard)
    assert TestClient(app).get(doc["url"]).status_code == 404
    app.dependency_overrides[get_current_user_optional] = lambda: {
        "email": "admin@test", "nombre": "Admin", "rol": "admin",
    }
    try:
        r = TestClient(app).get(doc["url"])
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
    finally:
        app.dependency_overrides.clear()

    # Un usuario autenticado NO admin tampoco lo ve
    app.dependency_overrides[get_current_user_optional] = lambda: {
        "email": "user@test", "nombre": "Usuario", "rol": "user",
    }
    try:
        assert TestClient(app).get(doc["url"]).status_code == 404
    finally:
        app.dependency_overrides.clear()


# 6 -------------------------------------------------------------------------


def test_usuario_normal_no_admin(cliente_user):
    r = _subir_pdf(cliente_user)
    assert r.status_code == 403

    app.dependency_overrides[get_current_user] = lambda: {
        "email": "admin@test", "nombre": "Admin", "rol": "admin",
    }
    doc = _subir_pdf(TestClient(app)).json()
    app.dependency_overrides[get_current_user] = lambda: {
        "email": "user@test", "nombre": "Usuario", "rol": "user",
    }

    assert cliente_user.delete(f"/api/fichas/{doc['id']}").status_code == 403
    assert cliente_user.patch(f"/api/fichas/{doc['id']}", json={"publico": 0}).status_code == 403

    # Las lecturas privadas sí funcionan con rol "user"
    assert cliente_user.get("/api/fichas").status_code == 200
    assert cliente_user.get("/api/fichas/tipos").status_code == 200
    assert cliente_user.get("/api/fichas/productos", params={"marca": "fancom"}).status_code == 200


# 7 -------------------------------------------------------------------------


def test_rechaza_txt(cliente_auth):
    r = cliente_auth.post(
        "/api/fichas",
        data={"marca": "fancom", "codigo": "ABC-123", "tipo": "ficha_tecnica"},
        files={"pdf": ("notas.txt", b"hola", "text/plain")},
    )
    assert r.status_code == 422


def test_rechaza_pdf_muy_grande(cliente_auth, monkeypatch):
    monkeypatch.setattr(svc, "MAX_PDF_BYTES", 64)  # límite pequeño para el test
    grande = b"%PDF" + b"0" * 100
    r = cliente_auth.post(
        "/api/fichas",
        data={"marca": "fancom", "codigo": "ABC-123", "tipo": "ficha_tecnica"},
        files={"pdf": ("grande.pdf", grande, "application/pdf")},
    )
    assert r.status_code == 413


# 8 -------------------------------------------------------------------------


def test_delete_logico_y_reactivacion(cliente_auth):
    doc = _subir_pdf(cliente_auth).json()
    ruta = svc.ruta_archivo(doc)

    r = cliente_auth.delete(f"/api/fichas/{doc['id']}")
    assert r.status_code == 200
    assert r.json() == {"id": doc["id"], "eliminado": True}

    # Desaparece de públicas pero sigue en el listado privado (activo=0)
    publicas = TestClient(app).get(
        "/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"}
    ).json()["data"]
    assert publicas == []
    inactivos = cliente_auth.get("/api/fichas", params={"activo": 0}).json()["data"]
    assert [d["id"] for d in inactivos] == [doc["id"]]
    # Sin filtro activo sigue apareciendo (el filtrado es explícito)
    assert [d["id"] for d in cliente_auth.get("/api/fichas").json()["data"]] == [doc["id"]]
    activos = cliente_auth.get("/api/fichas", params={"activo": 1}).json()["data"]
    assert activos == []

    # El archivo físico NO se borra
    assert ruta.exists()

    # Repetir el delete: 404 no, 200 idempotente lógico (sigue existiendo la fila)
    assert cliente_auth.delete(f"/api/fichas/{doc['id']}").status_code == 200

    # PATCH activo=1 lo reactiva y vuelve a públicas
    r = cliente_auth.patch(f"/api/fichas/{doc['id']}", json={"activo": 1})
    assert r.status_code == 200
    assert r.json()["activo"] == 1
    assert r.json()["fecha_modificacion"]
    publicas = TestClient(app).get(
        "/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"}
    ).json()["data"]
    assert [p["id"] for p in publicas] == [doc["id"]]


def test_patch_404_si_no_existe(cliente_auth):
    r = cliente_auth.patch("/api/fichas/9999", json={"publico": 0})
    assert r.status_code == 404


# 9 -------------------------------------------------------------------------


def test_codigo_inexistente_404(cliente_auth):
    r = _subir_pdf(cliente_auth, codigo="NO-EXISTE")
    assert r.status_code == 404
    assert "NO-EXISTE" in r.json()["detail"]


def test_marca_inexistente_404(cliente_auth):
    r = _subir_pdf(cliente_auth, marca="chore-time")
    assert r.status_code == 404


def test_excel_no_disponible_500(cliente_auth, monkeypatch):
    def _explota(slug):
        raise svc.ExcelNoDisponible("No se encontró el Excel de almacén")
    monkeypatch.setattr(svc, "productos_de_marca", _explota)
    r = _subir_pdf(cliente_auth)
    assert r.status_code == 500


# 10 ------------------------------------------------------------------------


def test_pdf_con_archivo_borrado_404(cliente_auth):
    doc = _subir_pdf(cliente_auth).json()
    svc.ruta_archivo(doc).unlink()
    r = TestClient(app).get(doc["url"])
    assert r.status_code == 404


# 11 ------------------------------------------------------------------------


def test_migracion_legacy_fichas():
    db_path = fichas_db_path()
    conn = sqlite3.connect(str(db_path))
    try:
        conn.execute("DROP TABLE IF EXISTS fichas")
        conn.execute(
            """
            CREATE TABLE fichas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                marca TEXT NOT NULL,
                codigo TEXT NOT NULL,
                descripcion TEXT DEFAULT '',
                nombre_archivo TEXT NOT NULL,
                archivo TEXT NOT NULL,
                tamano INTEGER NOT NULL DEFAULT 0,
                fecha TEXT NOT NULL,
                usuario TEXT DEFAULT '',
                UNIQUE(marca, codigo)
            )
            """
        )
        conn.execute(
            """
            INSERT INTO fichas (marca, codigo, descripcion, nombre_archivo, archivo, tamano, fecha, usuario)
            VALUES ('fancom', 'LEG-001', 'Producto legacy', 'legado.pdf', 'fancom/LEG-001.pdf', 10, '2026-01-01T00:00:00+00:00', 'legacy@test')
            """
        )
        conn.commit()
    finally:
        conn.close()

    # Al abrir una conexión se ejecuta el ensure con la migración idempotente
    docs = svc.listar_documentos(codigo="LEG-001")
    assert len(docs) == 1
    doc = docs[0]
    assert doc["tipo"] == "ficha_tecnica"
    assert doc["publico"] == 1 and doc["vigente"] == 1 and doc["activo"] == 1
    assert doc["descripcion"] == "Producto legacy"
    assert doc["archivo"] == "fancom/LEG-001.pdf"  # ruta relativa preservada tal cual
    assert doc["usuario_carga"] == "legacy@test"

    # La tabla legacy ya no existe (migración aplicada una sola vez)
    conn = sqlite3.connect(str(db_path))
    try:
        legacy = conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'fichas'"
        ).fetchone()
    finally:
        conn.close()
    assert legacy is None


# 12 ------------------------------------------------------------------------


def test_publicas_producto_sin_docs(cliente_auth):
    r = TestClient(app).get("/api/fichas/publicas", params={"marca": "fancom", "codigo": "ABC-123"})
    assert r.status_code == 200
    assert r.json() == {"data": []}
