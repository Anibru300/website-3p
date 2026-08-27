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


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


# ---------------------------------------------------------------------------
# Esquemas Pydantic
# ---------------------------------------------------------------------------


class EntidadCreate(BaseModel):
    id_externo: Optional[str] = None
    tipo: str = Field(..., pattern="^(cliente|proveedor|ambos)$")
    nombre: str
    razon_social: Optional[str] = None
    rfc: Optional[str] = None
    tipo_persona: Optional[str] = Field(default=None, pattern="^(Física|Moral)$")
    regimen_fiscal: Optional[str] = None
    uso_cfdi: Optional[str] = None
    correo_cfdi: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    condicion_pago: Optional[str] = None
    dias_credito: Optional[str] = None
    vendedor: Optional[str] = None
    link_documentos: Optional[str] = None
    industria: Optional[str] = None
    interes_principal: Optional[str] = None
    puntuacion: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = Field(default="Activo")
    notas: Optional[str] = None


class EntidadUpdate(BaseModel):
    id_externo: Optional[str] = None
    tipo: Optional[str] = Field(default=None, pattern="^(cliente|proveedor|ambos)$")
    nombre: Optional[str] = None
    razon_social: Optional[str] = None
    rfc: Optional[str] = None
    tipo_persona: Optional[str] = Field(default=None, pattern="^(Física|Moral)$")
    regimen_fiscal: Optional[str] = None
    uso_cfdi: Optional[str] = None
    correo_cfdi: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    condicion_pago: Optional[str] = None
    dias_credito: Optional[str] = None
    vendedor: Optional[str] = None
    link_documentos: Optional[str] = None
    industria: Optional[str] = None
    interes_principal: Optional[str] = None
    puntuacion: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None
    notas: Optional[str] = None


class EntidadOut(BaseModel):
    id: int
    id_externo: Optional[str]
    tipo: str
    nombre: str
    razon_social: Optional[str]
    rfc: Optional[str]
    tipo_persona: Optional[str]
    regimen_fiscal: Optional[str]
    uso_cfdi: Optional[str]
    correo_cfdi: Optional[str]
    telefono: Optional[str]
    email: Optional[str]
    condicion_pago: Optional[str]
    dias_credito: Optional[str]
    vendedor: Optional[str]
    link_documentos: Optional[str]
    industria: Optional[str]
    interes_principal: Optional[str]
    puntuacion: Optional[int]
    status: Optional[str]
    notas: Optional[str]
    activo: int
    created_at: Optional[str]
    updated_at: Optional[str]
    contacto_principal: Optional[str] = None
    total_contactos: int = 0
    total_granjas: int = 0
    total_ubicaciones: int = 0
    total_paqueterias: int = 0
    total_portales: int = 0
    total_descuentos: int = 0
    ciudad: Optional[str] = None
    estado: Optional[str] = None


class ContactoCreate(BaseModel):
    nombre: str
    puesto: Optional[str] = None
    departamento: Optional[str] = None
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    correos_facturas: Optional[str] = None
    direccion_entrega: Optional[str] = None
    principal: int = Field(default=0, ge=0, le=1)
    notas: Optional[str] = None


class ContactoUpdate(ContactoCreate):
    pass


class ContactoOut(ContactoCreate):
    id: int
    entidad_id: int


class GranjaCreate(BaseModel):
    granja_id_externo: Optional[str] = None
    nombre: str
    tipo: Optional[str] = None
    paso: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_puesto: Optional[str] = None
    contacto_telefono: Optional[str] = None
    contacto_correo: Optional[str] = None
    comentarios: Optional[str] = None


class GranjaUpdate(GranjaCreate):
    pass


class GranjaOut(GranjaCreate):
    id: int
    entidad_id: int
    activo: int


class UbicacionCreate(BaseModel):
    granja_id: Optional[int] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = Field(default=None, pattern="^(oficina|granja|bodega|fiscal|envio|otro)$")
    calle: Optional[str] = None
    numero: Optional[str] = None
    colonia: Optional[str] = None
    cp: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    coordenadas: Optional[str] = None
    link_mapa: Optional[str] = None
    notas: Optional[str] = None


class UbicacionUpdate(UbicacionCreate):
    pass


class UbicacionOut(UbicacionCreate):
    id: int
    entidad_id: int


class PaqueteriaCreate(BaseModel):
    ubicacion_id: Optional[int] = None
    paqueteria_id_externo: Optional[str] = None
    tipo_envio: Optional[str] = None
    paqueteria: Optional[str] = None
    ocurre_domicilio: Optional[str] = None
    atencion_a: Optional[str] = None
    telefono: Optional[str] = None
    correo_guia: Optional[str] = None
    tipo_pago: Optional[str] = None
    facturado_a: Optional[str] = None
    status: Optional[str] = Field(default="Activo")
    comentarios: Optional[str] = None


class PaqueteriaUpdate(PaqueteriaCreate):
    pass


class PaqueteriaOut(PaqueteriaCreate):
    id: int
    entidad_id: int


class PortalCreate(BaseModel):
    nombre: Optional[str] = None
    url: Optional[str] = None
    usuario: Optional[str] = None
    password: str
    persona_apoyo: Optional[str] = None
    notas: Optional[str] = None


class PortalUpdate(BaseModel):
    nombre: Optional[str] = None
    url: Optional[str] = None
    usuario: Optional[str] = None
    password: Optional[str] = None
    persona_apoyo: Optional[str] = None
    notas: Optional[str] = None


class PortalOut(BaseModel):
    id: int
    entidad_id: int
    nombre: Optional[str]
    url: Optional[str]
    usuario: Optional[str]
    password: str
    persona_apoyo: Optional[str]
    notas: Optional[str]


class DescuentoCreate(BaseModel):
    marca: Optional[str] = None
    descuento: Optional[str] = None
    notas: Optional[str] = None


class DescuentoUpdate(DescuentoCreate):
    pass


class DescuentoOut(DescuentoCreate):
    id: int
    entidad_id: int


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


def _portal_row_with_password(row) -> dict:
    p_dict = dict(row)
    try:
        p_dict["password"] = _decrypt_password(p_dict["password"])
    except Exception as exc:
        logger.warning("[crm] No se pudo descifrar password del portal %s: %s", p_dict.get("id"), exc)
        p_dict["password"] = ""
    return p_dict


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
                    (SELECT COUNT(*) FROM crm_entidades WHERE activo = 1 AND tipo = 'ambos') AS ambos,
                    (SELECT COUNT(*) FROM crm_contactos c
                     JOIN crm_entidades e ON e.id = c.entidad_id WHERE e.activo = 1) AS contactos,
                    (SELECT COUNT(*) FROM crm_granjas g
                     JOIN crm_entidades e ON e.id = g.entidad_id WHERE e.activo = 1 AND g.activo = 1) AS granjas,
                    (SELECT COUNT(*) FROM crm_ubicaciones u
                     JOIN crm_entidades e ON e.id = u.entidad_id WHERE e.activo = 1) AS ubicaciones,
                    (SELECT COUNT(*) FROM crm_paqueterias p
                     JOIN crm_entidades e ON e.id = p.entidad_id WHERE e.activo = 1) AS paqueterias,
                    (SELECT COUNT(*) FROM crm_portales p
                     JOIN crm_entidades e ON e.id = p.entidad_id WHERE e.activo = 1) AS portales,
                    (SELECT COUNT(*) FROM crm_descuentos d
                     JOIN crm_entidades e ON e.id = d.entidad_id WHERE e.activo = 1) AS descuentos,
                    (SELECT COUNT(*) FROM crm_documentos d
                     JOIN crm_entidades e ON e.id = d.entidad_id WHERE e.activo = 1) AS documentos
                """
            ).fetchone()
        )
    return totals


@router.get("/portales")
def listar_portales(
    q: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
):
    """Devuelve todos los portales de todas las entidades con contraseñas descifradas."""
    with users_connection() as conn:
        conditions = ["e.activo = 1"]
        params: list = []
        if q:
            conditions.append("(e.nombre LIKE ? OR p.nombre LIKE ? OR p.usuario LIKE ?)")
            like = f"%{q}%"
            params.extend([like, like, like])

        where_clause = "WHERE " + " AND ".join(conditions)

        rows = conn.execute(
            f"""
            SELECT
                p.id,
                p.entidad_id,
                e.nombre AS entidad,
                e.tipo AS entidad_tipo,
                p.nombre AS portal,
                p.url,
                p.usuario,
                p.password,
                p.persona_apoyo,
                p.notas
            FROM crm_portales p
            JOIN crm_entidades e ON e.id = p.entidad_id
            {where_clause}
            ORDER BY e.nombre ASC, p.nombre ASC
            LIMIT ? OFFSET ?
            """,
            (*params, limit, skip),
        ).fetchall()

        total = conn.execute(
            f"""
            SELECT COUNT(*)
            FROM crm_portales p
            JOIN crm_entidades e ON e.id = p.entidad_id
            {where_clause}
            """,
            tuple(params),
        ).fetchone()[0]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [_portal_row_with_password(r) for r in rows],
    }


@router.get("/entidades")
def listar_entidades(
    tipo: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    industria: Optional[str] = Query(default=None),
    id_externo: Optional[str] = Query(default=None),
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
            conditions.append("(e.nombre LIKE ? OR e.rfc LIKE ? OR e.razon_social LIKE ?)")
            like = f"%{q}%"
            params.extend([like, like, like])
        if status:
            conditions.append("e.status = ?")
            params.append(status)
        if industria:
            conditions.append("e.industria = ?")
            params.append(industria)
        if id_externo:
            conditions.append("e.id_externo LIKE ?")
            params.append(f"%{id_externo}%")

        where_clause = "WHERE " + " AND ".join(conditions)

        rows = conn.execute(
            f"""
            SELECT
                e.*,
                (SELECT c.nombre FROM crm_contactos c
                 WHERE c.entidad_id = e.id AND c.principal = 1 LIMIT 1) AS contacto_principal,
                (SELECT COUNT(*) FROM crm_contactos c WHERE c.entidad_id = e.id) AS total_contactos,
                (SELECT COUNT(*) FROM crm_granjas g WHERE g.entidad_id = e.id AND g.activo = 1) AS total_granjas,
                (SELECT COUNT(*) FROM crm_ubicaciones u WHERE u.entidad_id = e.id) AS total_ubicaciones,
                (SELECT COUNT(*) FROM crm_paqueterias p WHERE p.entidad_id = e.id) AS total_paqueterias,
                (SELECT COUNT(*) FROM crm_portales p WHERE p.entidad_id = e.id) AS total_portales,
                (SELECT COUNT(*) FROM crm_descuentos d WHERE d.entidad_id = e.id) AS total_descuentos,
                (SELECT u.ciudad FROM crm_ubicaciones u
                 WHERE u.entidad_id = e.id ORDER BY u.id ASC LIMIT 1) AS ciudad,
                (SELECT u.estado FROM crm_ubicaciones u
                 WHERE u.entidad_id = e.id ORDER BY u.id ASC LIMIT 1) AS estado
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
    now = _now_iso()
    with users_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO crm_entidades (
                id_externo, tipo, nombre, razon_social, rfc, tipo_persona,
                regimen_fiscal, uso_cfdi, correo_cfdi, telefono, email,
                condicion_pago, dias_credito, vendedor, link_documentos,
                industria, interes_principal, puntuacion, status, notas, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.id_externo,
                payload.tipo,
                payload.nombre,
                payload.razon_social,
                payload.rfc,
                payload.tipo_persona,
                payload.regimen_fiscal,
                payload.uso_cfdi,
                payload.correo_cfdi,
                payload.telefono,
                payload.email,
                payload.condicion_pago,
                payload.dias_credito,
                payload.vendedor,
                payload.link_documentos,
                payload.industria,
                payload.interes_principal,
                payload.puntuacion,
                payload.status,
                payload.notas,
                now,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_entidades WHERE id = ?", (cur.lastrowid,)).fetchone()

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
        granjas = conn.execute(
            "SELECT * FROM crm_granjas WHERE entidad_id = ? AND activo = 1 ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()
        ubicaciones = conn.execute(
            "SELECT * FROM crm_ubicaciones WHERE entidad_id = ? ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()
        paqueterias = conn.execute(
            "SELECT * FROM crm_paqueterias WHERE entidad_id = ? ORDER BY paqueteria ASC",
            (entidad_id,),
        ).fetchall()
        portales_raw = conn.execute(
            "SELECT * FROM crm_portales WHERE entidad_id = ? ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()
        descuentos = conn.execute(
            "SELECT * FROM crm_descuentos WHERE entidad_id = ? ORDER BY marca ASC",
            (entidad_id,),
        ).fetchall()
        documentos = conn.execute(
            "SELECT * FROM crm_documentos WHERE entidad_id = ? ORDER BY created_at DESC",
            (entidad_id,),
        ).fetchall()

    return {
        "entidad": dict(entidad),
        "contactos": [dict(c) for c in contactos],
        "granjas": [dict(g) for g in granjas],
        "ubicaciones": [dict(u) for u in ubicaciones],
        "paqueterias": [dict(p) for p in paqueterias],
        "portales": [_portal_row_with_password(p) for p in portales_raw],
        "descuentos": [dict(d) for d in descuentos],
        "documentos": [dict(d) for d in documentos],
    }


@router.put("/entidades/{entidad_id}")
def actualizar_entidad(entidad_id: int, payload: EntidadUpdate):
    with users_connection() as conn:
        entidad = conn.execute(
            "SELECT id FROM crm_entidades WHERE id = ? AND activo = 1", (entidad_id,)
        ).fetchone()
        if entidad is None:
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        data["updated_at"] = _now_iso()
        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [entidad_id]

        conn.execute(f"UPDATE crm_entidades SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_entidades WHERE id = ?", (entidad_id,)).fetchone()

    return dict(row)


@router.delete("/entidades/{entidad_id}")
def eliminar_entidad(entidad_id: int):
    with users_connection() as conn:
        entidad = conn.execute(
            "SELECT id FROM crm_entidades WHERE id = ? AND activo = 1", (entidad_id,)
        ).fetchone()
        if entidad is None:
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        conn.execute(
            "UPDATE crm_entidades SET activo = 0, status = 'Inactivo', updated_at = ? WHERE id = ?",
            (_now_iso(), entidad_id),
        )
        conn.commit()

    return {"detail": "Entidad eliminada"}


# ---------------------------------------------------------------------------
# Contactos
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/contactos")
def listar_contactos(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            "SELECT * FROM crm_contactos WHERE entidad_id = ? ORDER BY principal DESC, nombre ASC",
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


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
            INSERT INTO crm_contactos (
                entidad_id, nombre, puesto, departamento, telefono, whatsapp,
                email, correos_facturas, direccion_entrega, principal, notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.nombre,
                payload.puesto,
                payload.departamento,
                payload.telefono,
                payload.whatsapp,
                payload.email,
                payload.correos_facturas,
                payload.direccion_entrega,
                payload.principal,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_contactos WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/contactos/{contacto_id}")
def actualizar_contacto(contacto_id: int, payload: ContactoUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_contactos WHERE id = ?", (contacto_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

        entidad_id = row["entidad_id"]
        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        if data.get("principal") == 1:
            conn.execute(
                "UPDATE crm_contactos SET principal = 0 WHERE entidad_id = ?",
                (entidad_id,),
            )

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [contacto_id]
        conn.execute(f"UPDATE crm_contactos SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_contactos WHERE id = ?", (contacto_id,)).fetchone()

    return dict(row)


@router.delete("/contactos/{contacto_id}")
def eliminar_contacto(contacto_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_contactos WHERE id = ?", (contacto_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

        conn.execute("DELETE FROM crm_contactos WHERE id = ?", (contacto_id,))
        conn.commit()

    return {"detail": "Contacto eliminado"}


# ---------------------------------------------------------------------------
# Granjas
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/granjas")
def listar_granjas(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            "SELECT * FROM crm_granjas WHERE entidad_id = ? AND activo = 1 ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


@router.post("/entidades/{entidad_id}/granjas", status_code=status.HTTP_201_CREATED)
def crear_granja(entidad_id: int, payload: GranjaCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        cur = conn.execute(
            """
            INSERT INTO crm_granjas (
                entidad_id, granja_id_externo, nombre, tipo, paso,
                contacto_nombre, contacto_puesto, contacto_telefono, contacto_correo, comentarios
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.granja_id_externo,
                payload.nombre,
                payload.tipo,
                payload.paso,
                payload.contacto_nombre,
                payload.contacto_puesto,
                payload.contacto_telefono,
                payload.contacto_correo,
                payload.comentarios,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_granjas WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/granjas/{granja_id}")
def actualizar_granja(granja_id: int, payload: GranjaUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_granjas WHERE id = ? AND activo = 1", (granja_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Granja no encontrada")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [granja_id]
        conn.execute(f"UPDATE crm_granjas SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_granjas WHERE id = ?", (granja_id,)).fetchone()

    return dict(row)


@router.delete("/granjas/{granja_id}")
def eliminar_granja(granja_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_granjas WHERE id = ? AND activo = 1", (granja_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Granja no encontrada")

        conn.execute("UPDATE crm_granjas SET activo = 0 WHERE id = ?", (granja_id,))
        conn.commit()

    return {"detail": "Granja eliminada"}


# ---------------------------------------------------------------------------
# Ubicaciones / Domicilios
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/ubicaciones")
def listar_ubicaciones(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            """
            SELECT u.*, g.nombre AS granja_nombre
            FROM crm_ubicaciones u
            LEFT JOIN crm_granjas g ON g.id = u.granja_id
            WHERE u.entidad_id = ?
            ORDER BY u.nombre ASC
            """,
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


@router.post("/entidades/{entidad_id}/ubicaciones", status_code=status.HTTP_201_CREATED)
def crear_ubicacion(entidad_id: int, payload: UbicacionCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        if payload.granja_id:
            granja = conn.execute(
                "SELECT id FROM crm_granjas WHERE id = ? AND entidad_id = ? AND activo = 1",
                (payload.granja_id, entidad_id),
            ).fetchone()
            if granja is None:
                raise HTTPException(status_code=400, detail="Granja no válida para esta entidad")

        cur = conn.execute(
            """
            INSERT INTO crm_ubicaciones (
                entidad_id, granja_id, nombre, tipo, calle, numero, colonia, cp,
                ciudad, estado, pais, direccion, coordenadas, link_mapa, notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.granja_id,
                payload.nombre,
                payload.tipo,
                payload.calle,
                payload.numero,
                payload.colonia,
                payload.cp,
                payload.ciudad,
                payload.estado,
                payload.pais,
                payload.direccion,
                payload.coordenadas,
                payload.link_mapa,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_ubicaciones WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/ubicaciones/{ubicacion_id}")
def actualizar_ubicacion(ubicacion_id: int, payload: UbicacionUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_ubicaciones WHERE id = ?", (ubicacion_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        entidad_id = row["entidad_id"]
        if data.get("granja_id"):
            granja = conn.execute(
                "SELECT id FROM crm_granjas WHERE id = ? AND entidad_id = ? AND activo = 1",
                (data["granja_id"], entidad_id),
            ).fetchone()
            if granja is None:
                raise HTTPException(status_code=400, detail="Granja no válida para esta entidad")

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [ubicacion_id]
        conn.execute(f"UPDATE crm_ubicaciones SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_ubicaciones WHERE id = ?", (ubicacion_id,)).fetchone()

    return dict(row)


@router.delete("/ubicaciones/{ubicacion_id}")
def eliminar_ubicacion(ubicacion_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_ubicaciones WHERE id = ?", (ubicacion_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")

        conn.execute("DELETE FROM crm_ubicaciones WHERE id = ?", (ubicacion_id,))
        conn.commit()

    return {"detail": "Ubicación eliminada"}


# ---------------------------------------------------------------------------
# Paqueterías
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/paqueterias")
def listar_paqueterias(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            """
            SELECT p.*, u.nombre AS ubicacion_nombre
            FROM crm_paqueterias p
            LEFT JOIN crm_ubicaciones u ON u.id = p.ubicacion_id
            WHERE p.entidad_id = ?
            ORDER BY p.paqueteria ASC
            """,
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


@router.post("/entidades/{entidad_id}/paqueterias", status_code=status.HTTP_201_CREATED)
def crear_paqueteria(entidad_id: int, payload: PaqueteriaCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        if payload.ubicacion_id:
            ubicacion = conn.execute(
                "SELECT id FROM crm_ubicaciones WHERE id = ? AND entidad_id = ?",
                (payload.ubicacion_id, entidad_id),
            ).fetchone()
            if ubicacion is None:
                raise HTTPException(status_code=400, detail="Ubicación no válida para esta entidad")

        cur = conn.execute(
            """
            INSERT INTO crm_paqueterias (
                entidad_id, ubicacion_id, paqueteria_id_externo, tipo_envio, paqueteria,
                ocurre_domicilio, atencion_a, telefono, correo_guia, tipo_pago,
                facturado_a, status, comentarios
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.ubicacion_id,
                payload.paqueteria_id_externo,
                payload.tipo_envio,
                payload.paqueteria,
                payload.ocurre_domicilio,
                payload.atencion_a,
                payload.telefono,
                payload.correo_guia,
                payload.tipo_pago,
                payload.facturado_a,
                payload.status,
                payload.comentarios,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_paqueterias WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/paqueterias/{paqueteria_id}")
def actualizar_paqueteria(paqueteria_id: int, payload: PaqueteriaUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_paqueterias WHERE id = ?", (paqueteria_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Paquetería no encontrada")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        entidad_id = row["entidad_id"]
        if data.get("ubicacion_id"):
            ubicacion = conn.execute(
                "SELECT id FROM crm_ubicaciones WHERE id = ? AND entidad_id = ?",
                (data["ubicacion_id"], entidad_id),
            ).fetchone()
            if ubicacion is None:
                raise HTTPException(status_code=400, detail="Ubicación no válida para esta entidad")

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [paqueteria_id]
        conn.execute(f"UPDATE crm_paqueterias SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_paqueterias WHERE id = ?", (paqueteria_id,)).fetchone()

    return dict(row)


@router.delete("/paqueterias/{paqueteria_id}")
def eliminar_paqueteria(paqueteria_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_paqueterias WHERE id = ?", (paqueteria_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Paquetería no encontrada")

        conn.execute("DELETE FROM crm_paqueterias WHERE id = ?", (paqueteria_id,))
        conn.commit()

    return {"detail": "Paquetería eliminada"}


# ---------------------------------------------------------------------------
# Portales
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/portales")
def listar_portales_entidad(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            "SELECT * FROM crm_portales WHERE entidad_id = ? ORDER BY nombre ASC",
            (entidad_id,),
        ).fetchall()

    return {"data": [_portal_row_with_password(r) for r in rows]}


@router.post("/entidades/{entidad_id}/portales", status_code=status.HTTP_201_CREATED)
def crear_portal(entidad_id: int, payload: PortalCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        encrypted_password = _encrypt_password(payload.password)

        cur = conn.execute(
            """
            INSERT INTO crm_portales (entidad_id, nombre, url, usuario, password, persona_apoyo, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entidad_id,
                payload.nombre,
                payload.url,
                payload.usuario,
                encrypted_password,
                payload.persona_apoyo,
                payload.notas,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_portales WHERE id = ?", (cur.lastrowid,)).fetchone()

    result = dict(row)
    result["password"] = payload.password
    return result


@router.put("/portales/{portal_id}")
def actualizar_portal(portal_id: int, payload: PortalUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_portales WHERE id = ?", (portal_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Portal no encontrado")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        plain_password = data.pop("password", None)
        if plain_password:
            data["password"] = _encrypt_password(plain_password)

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [portal_id]
        conn.execute(f"UPDATE crm_portales SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_portales WHERE id = ?", (portal_id,)).fetchone()

    result = dict(row)
    result["password"] = plain_password if plain_password else _decrypt_password(result["password"])
    return result


@router.delete("/portales/{portal_id}")
def eliminar_portal(portal_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_portales WHERE id = ?", (portal_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Portal no encontrado")

        conn.execute("DELETE FROM crm_portales WHERE id = ?", (portal_id,))
        conn.commit()

    return {"detail": "Portal eliminado"}


# ---------------------------------------------------------------------------
# Descuentos
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/descuentos")
def listar_descuentos(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            "SELECT * FROM crm_descuentos WHERE entidad_id = ? ORDER BY marca ASC",
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


@router.post("/entidades/{entidad_id}/descuentos", status_code=status.HTTP_201_CREATED)
def crear_descuento(entidad_id: int, payload: DescuentoCreate):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        cur = conn.execute(
            "INSERT INTO crm_descuentos (entidad_id, marca, descuento, notas) VALUES (?, ?, ?, ?)",
            (entidad_id, payload.marca, payload.descuento, payload.notas),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM crm_descuentos WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/descuentos/{descuento_id}")
def actualizar_descuento(descuento_id: int, payload: DescuentoUpdate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_descuentos WHERE id = ?", (descuento_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Descuento no encontrado")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [descuento_id]
        conn.execute(f"UPDATE crm_descuentos SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_descuentos WHERE id = ?", (descuento_id,)).fetchone()

    return dict(row)


@router.delete("/descuentos/{descuento_id}")
def eliminar_descuento(descuento_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_descuentos WHERE id = ?", (descuento_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Descuento no encontrado")

        conn.execute("DELETE FROM crm_descuentos WHERE id = ?", (descuento_id,))
        conn.commit()

    return {"detail": "Descuento eliminado"}


# ---------------------------------------------------------------------------
# Documentos
# ---------------------------------------------------------------------------


@router.get("/entidades/{entidad_id}/documentos")
def listar_documentos(entidad_id: int):
    with users_connection() as conn:
        if not _entidad_existe(conn, entidad_id):
            raise HTTPException(status_code=404, detail="Entidad no encontrada")

        rows = conn.execute(
            "SELECT * FROM crm_documentos WHERE entidad_id = ? ORDER BY created_at DESC",
            (entidad_id,),
        ).fetchall()

    return {"data": [dict(r) for r in rows]}


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
        row = conn.execute("SELECT * FROM crm_documentos WHERE id = ?", (cur.lastrowid,)).fetchone()

    return dict(row)


@router.put("/documentos/{documento_id}")
def actualizar_documento(documento_id: int, payload: DocumentoCreate):
    with users_connection() as conn:
        row = conn.execute("SELECT * FROM crm_documentos WHERE id = ?", (documento_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Documento no encontrado")

        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        set_clause = ", ".join(f"{k} = ?" for k in data.keys())
        values = list(data.values()) + [documento_id]
        conn.execute(f"UPDATE crm_documentos SET {set_clause} WHERE id = ?", values)
        conn.commit()

        row = conn.execute("SELECT * FROM crm_documentos WHERE id = ?", (documento_id,)).fetchone()

    return dict(row)


@router.delete("/documentos/{documento_id}")
def eliminar_documento(documento_id: int):
    with users_connection() as conn:
        row = conn.execute("SELECT id FROM crm_documentos WHERE id = ?", (documento_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Documento no encontrado")

        conn.execute("DELETE FROM crm_documentos WHERE id = ?", (documento_id,))
        conn.commit()

    return {"detail": "Documento eliminado"}
