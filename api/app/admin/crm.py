import base64
import hashlib
import logging
from datetime import datetime
from typing import Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.config import get_settings
from app.database import users_connection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/crm", tags=["admin-crm"])


def _get_fernet() -> Fernet:
    """Devuelve una instancia de Fernet con una clave determinista derivada de JWT_SECRET."""
    settings = get_settings()
    digest = hashlib.sha256(settings.jwt_secret.encode("utf-8")).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def _encrypt_password(plain: str) -> str:
    return _get_fernet().encrypt(plain.encode("utf-8")).decode("utf-8")


def _decrypt_password(encrypted: str) -> str:
    return _get_fernet().decrypt(encrypted.encode("utf-8")).decode("utf-8")


# ---------------------------------------------------------------------------
# Esquemas Pydantic
# ---------------------------------------------------------------------------


class EntidadCreate(BaseModel):
    tipo: str = Field(..., pattern="^(cliente|proveedor|ambos)$")
    nombre: str
    rfc: Optional[str] = None
    razon_social: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    notas: Optional[str] = None


class EntidadOut(BaseModel):
    id: int
    tipo: str
    nombre: str
    rfc: Optional[str]
    razon_social: Optional[str]
    telefono: Optional[str]
    email: Optional[str]
    notas: Optional[str]
    activo: int
    contacto_principal: Optional[str] = None
    total_ubicaciones: int = 0
    total_portales: int = 0


class ContactoCreate(BaseModel):
    nombre: str
    puesto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    principal: int = Field(default=0, ge=0, le=1)
    notas: Optional[str] = None


class ContactoOut(ContactoCreate):
    id: int
    entidad_id: int


class UbicacionCreate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = Field(default=None, pattern="^(oficina|granja|bodega|otro)$")
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    coordenadas: Optional[str] = None
    notas: Optional[str] = None


class UbicacionOut(UbicacionCreate):
    id: int
    entidad_id: int


class PortalCreate(BaseModel):
    nombre: Optional[str] = None
    url: Optional[str] = None
    usuario: Optional[str] = None
    password: str
    notas: Optional[str] = None


class PortalOut(BaseModel):
    id: int
    entidad_id: int
    nombre: Optional[str]
    url: Optional[str]
    usuario: Optional[str]
    password: str
    notas: Optional[str]


class DocumentoCreate(BaseModel):
    tipo: Optional[str] = None
    nombre_archivo: Optional[str] = None
    ruta_archivo: Optional[str] = None
    notas: Optional[str] = None


class DocumentoOut(DocumentoCreate):
    id: int
    entidad_id: int
    created_at: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _entidad_existe(conn, entidad_id: int) -> bool:
    row = conn.execute(
        "SELECT id FROM crm_entidades WHERE id = ? AND activo = 1", (entidad_id,)
    ).fetchone()
    return row is not None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/resumen")
def resumen_crm():
    with users_connection() as conn:
        totals = dict(
            conn.execute(
                """
                SELECT
                    (SELECT COUNT(*) FROM crm_entidades WHERE activo = 1) AS entidades,
                    (SELECT COUNT(*) FROM crm_entidades WHERE activo = 1 AND tipo = 'cliente') AS clientes,
                    (SELECT COUNT(*) FROM crm_entidades WHERE activo = 1 AND tipo = 'proveedor') AS proveedores,
                    (SELECT COUNT(*) FROM crm_contactos) AS contactos,
                    (SELECT COUNT(*) FROM crm_ubicaciones) AS ubicaciones,
                    (SELECT COUNT(*) FROM crm_portales) AS portales,
                    (SELECT COUNT(*) FROM crm_documentos) AS documentos
                """
            ).fetchone()
        )
    return totals


@router.get("/entidades")
def listar_entidades(
    tipo: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    with users_connection() as conn:
        conditions = ["e.activo = 1"]
        params: list = []
        if tipo:
            conditions.append("e.tipo = ?")
            params.append(tipo)
        if q:
            conditions.append("(e.nombre LIKE ? OR e.rfc LIKE ?)")
            like = f"%{q}%"
            params.extend([like, like])

        where_clause = "WHERE " + " AND ".join(conditions)

        rows = conn.execute(
            f"""
            SELECT
                e.id,
                e.tipo,
                e.nombre,
                e.rfc,
                e.razon_social,
                e.telefono,
                e.email,
                e.notas,
                e.activo,
                (SELECT c.nombre FROM crm_contactos c
                 WHERE c.entidad_id = e.id AND c.principal = 1 LIMIT 1) AS contacto_principal,
                (SELECT COUNT(*) FROM crm_ubicaciones u WHERE u.entidad_id = e.id) AS total_ubicaciones,
                (SELECT COUNT(*) FROM crm_portales p WHERE p.entidad_id = e.id) AS total_portales
            FROM crm_entidades e
            {where_clause}
            ORDER BY e.nombre ASC
            LIMIT ? OFFSET ?
            """,
            (*params, limit, skip),
        ).fetchall()

        total = conn.execute(
            f"SELECT COUNT(*) FROM crm_entidades e {where_clause}",
            tuple(params),
        ).fetchone()[0]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [dict(row) for row in rows],
    }


@router.post("/entidades", status_code=status.HTTP_201_CREATED)
def crear_entidad(payload: EntidadCreate):
    with users_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO crm_entidades (tipo, nombre, rfc, razon_social, telefono, email, notas, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.tipo,
                payload.nombre,
                payload.rfc,
                payload.razon_social,
                payload.telefono,
                payload.email,
                payload.notas,
                datetime.utcnow().isoformat(),
            ),
        )
        conn.commit()
        entidad_id = cur.lastrowid

        row = conn.execute(
            "SELECT * FROM crm_entidades WHERE id = ?", (entidad_id,)
        ).fetchone()

    return dict(row)


@router.get("/entidades/{entidad_id}")
def detalle_entidad(entidad_id: int):
    with users_connection() as conn:
        entidad = conn.execute(
            "SELECT * FROM crm_entidades WHERE id = ? AND activo = 1", (entidad_id,)
        ).fetchone()
        if entidad is None:
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        contactos = conn.execute(
            "SELECT * FROM crm_contactos WHERE entidad_id = ? ORDER BY principal DESC, nombre ASC",
            (entidad_id,),
        ).fetchall()
        ubicaciones = conn.execute(
            "SELECT * FROM crm_ubicaciones WHERE entidad_id = ? ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()
        portales_raw = conn.execute(
            "SELECT * FROM crm_portales WHERE entidad_id = ? ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()
        documentos = conn.execute(
            "SELECT * FROM crm_documentos WHERE entidad_id = ? ORDER BY created_at DESC",
            (entidad_id,),
        ).fetchall()

    portales = []
    for p in portales_raw:
        p_dict = dict(p)
        try:
            p_dict["password"] = _decrypt_password(p_dict["password"])
        except Exception as exc:
            logger.warning("[crm] No se pudo descifrar password del portal %s: %s", p_dict.get("id"), exc)
            p_dict["password"] = ""
        portales.append(p_dict)

    return {
        "entidad": dict(entidad),
        "contactos": [dict(c) for c in contactos],
        "ubicaciones": [dict(u) for u in ubicaciones],
        "portales": portales,
        "documentos": [dict(d) for d in documentos],
    }


@router.post("/entidades/{entidad_id}/contactos", status_code=status.HTTP_201_CREATED)
def crear_contacto(entidad_id: int, payload: ContactoCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        if payload.principal == 1:
            conn.execute(
                "UPDATE crm_contactos SET principal = 0 WHERE entidad_id = ?",
                (entidad_id,),
            )

        cur = conn.execute(
            """
            INSERT INTO crm_contactos (entidad_id, nombre, puesto, telefono, email, principal, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.nombre,
                payload.puesto,
                payload.telefono,
                payload.email,
                payload.principal,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM crm_contactos WHERE id = ?", (cur.lastrowid,)
        ).fetchone()

    return dict(row)


@router.post("/entidades/{entidad_id}/ubicaciones", status_code=status.HTTP_201_CREATED)
def crear_ubicacion(entidad_id: int, payload: UbicacionCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        cur = conn.execute(
            """
            INSERT INTO crm_ubicaciones
                (entidad_id, nombre, tipo, direccion, ciudad, estado, pais, coordenadas, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.nombre,
                payload.tipo,
                payload.direccion,
                payload.ciudad,
                payload.estado,
                payload.pais,
                payload.coordenadas,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM crm_ubicaciones WHERE id = ?", (cur.lastrowid,)
        ).fetchone()

    return dict(row)


@router.post("/entidades/{entidad_id}/portales", status_code=status.HTTP_201_CREATED)
def crear_portal(entidad_id: int, payload: PortalCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        encrypted_password = _encrypt_password(payload.password)

        cur = conn.execute(
            """
            INSERT INTO crm_portales (entidad_id, nombre, url, usuario, password, notas)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.nombre,
                payload.url,
                payload.usuario,
                encrypted_password,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM crm_portales WHERE id = ?", (cur.lastrowid,)
        ).fetchone()

    result = dict(row)
    result["password"] = payload.password
    return result


@router.post("/entidades/{entidad_id}/documentos", status_code=status.HTTP_201_CREATED)
def crear_documento(entidad_id: int, payload: DocumentoCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        cur = conn.execute(
            """
            INSERT INTO crm_documentos (entidad_id, tipo, nombre_archivo, ruta_archivo, notas)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.tipo,
                payload.nombre_archivo,
                payload.ruta_archivo,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM crm_documentos WHERE id = ?", (cur.lastrowid,)
        ).fetchone()

    return dict(row)
