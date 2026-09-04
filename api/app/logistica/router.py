"""Router del módulo Logística (/api/logistica).

Lectura para cualquier usuario autenticado; altas, ediciones, borrados y
regeneración de demanda requieren rol admin (mismo criterio que el resto del
portal; la Fase 4 de roles finos lo ajustará).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user, require_admin
from app.database import logistica_connection, postgres_cursor
from app.services import logistica as svc

router = APIRouter(prefix="/api/logistica", tags=["logistica"])


# ---------------------------------------------------------------------------
# Schemas de entrada
# ---------------------------------------------------------------------------

class DemandaIn(BaseModel):
    material: str = Field(min_length=1)
    cantidad: float = Field(gt=0)
    justificacion: str = Field(min_length=1)
    prioridad: str = Field("media", pattern="^(baja|media|alta|critica)$")
    fecha_requerida: str | None = None
    observaciones: str | None = None
    cliente_clave: str = ""


class DemandaPatch(BaseModel):
    prioridad: str | None = Field(None, pattern="^(baja|media|alta|critica)$")
    observaciones: str | None = None
    cliente_clave: str | None = None


class AbastecimientoIn(BaseModel):
    material: str = Field(min_length=1)
    cantidad: float = Field(gt=0)
    proveedor: str | None = None
    proveedor_clave: str = ""
    oc: str | None = None
    fecha_estimada: str | None = None
    fecha_solicitud: str | None = None
    observaciones: str | None = None


class AbastecimientoPatch(BaseModel):
    cantidad: float | None = Field(None, gt=0)
    proveedor: str | None = None
    proveedor_clave: str | None = None
    oc: str | None = None
    fecha_estimada: str | None = None
    observaciones: str | None = None
    estatus: str | None = Field(None, pattern="^(solicitado|transito|parcial|recibido|cancelado)$")


class AsignacionIn(BaseModel):
    abastecimiento_id: int
    demanda_id: int
    cantidad: float = Field(gt=0)


class RecepcionIn(BaseModel):
    abastecimiento_id: int
    cantidad: float = Field(gt=0)
    fecha_recepcion: str
    documento: str | None = None
    ubicacion: str | None = None
    observaciones: str | None = None


# ---------------------------------------------------------------------------
# Resumen y cobertura (anti-duplicidad)
# ---------------------------------------------------------------------------

@router.get("/resumen")
def get_resumen(user: dict = Depends(get_current_user)):
    return svc.resumen()


@router.get("/cobertura/{material}")
def get_cobertura(material: str, user: dict = Depends(get_current_user)):
    return svc.cobertura_material(material)


# ---------------------------------------------------------------------------
# Demanda (necesidades)
# ---------------------------------------------------------------------------

@router.get("/demanda")
def get_demanda(
    tipo: str | None = Query(None, pattern="^(PEDIDO|STOCK|OTRA)$"),
    estatus: str | None = Query(None, pattern="^(pendiente|parcial|cubierta)$"),
    prioridad: str | None = Query(None, pattern="^(baja|media|alta|critica)$"),
    busqueda: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    return {"data": svc.listar_demanda(tipo=tipo, estatus=estatus, prioridad=prioridad, busqueda=busqueda)}


@router.post("/demanda")
def crear_demanda(body: DemandaIn, user: dict = Depends(require_admin)):
    """Alta manual de necesidad (solo tipo OTRA; PEDIDO/STOCK se generan solas)."""
    with logistica_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO demanda (tipo, material, referencia, cantidad, prioridad,
                                 fecha_requerida, origen, justificacion, observaciones,
                                 cliente_clave)
            VALUES ('OTRA', ?, '', ?, ?, ?, 'manual', ?, ?, ?)
            """,
            (
                body.material.strip(),
                body.cantidad,
                body.prioridad,
                body.fecha_requerida,
                body.justificacion.strip(),
                body.observaciones,
                body.cliente_clave.strip(),
            ),
        )
        conn.commit()
        dem = dict(conn.execute("SELECT * FROM demanda WHERE id = ?", (cur.lastrowid,)).fetchone())
    dem["descripcion"] = svc.describir_materiales([dem["material"]]).get(dem["material"], "")
    return dem


@router.put("/demanda/{demanda_id}")
def editar_demanda(demanda_id: int, body: DemandaPatch, user: dict = Depends(require_admin)):
    """Edita prioridad/observaciones de cualquier demanda activa."""
    with logistica_connection() as conn:
        actual = conn.execute(
            "SELECT id FROM demanda WHERE id = ? AND activa = 1", (demanda_id,)
        ).fetchone()
        if not actual:
            raise HTTPException(status_code=404, detail="Demanda no encontrada")
        conn.execute(
            """
            UPDATE demanda SET
                prioridad = COALESCE(?, prioridad),
                observaciones = COALESCE(?, observaciones),
                cliente_clave = COALESCE(?, cliente_clave),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (body.prioridad, body.observaciones, body.cliente_clave, demanda_id),
        )
        conn.commit()
    return {"id": demanda_id, "actualizado": True}


@router.delete("/demanda/{demanda_id}")
def cerrar_demanda(demanda_id: int, user: dict = Depends(require_admin)):
    """Cierra (desactiva) una demanda; no borra historial ni asignaciones."""
    with logistica_connection() as conn:
        cur = conn.execute(
            "UPDATE demanda SET activa = 0, estatus = 'cerrada', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (demanda_id,),
        )
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Demanda no encontrada")
    return {"id": demanda_id, "cerrada": True}


@router.post("/demanda/regenerar")
def regenerar(user: dict = Depends(require_admin)):
    """Regenera la demanda PEDIDO y STOCK desde las fuentes existentes."""
    return svc.regenerar_demanda()


# ---------------------------------------------------------------------------
# Abastecimientos (OC / material en tránsito)
# ---------------------------------------------------------------------------

@router.get("/abastecimientos")
def get_abastecimientos(
    filtro: str = Query("todo", pattern="^(todo|pedidos|stock|atrasados|proximos|sin_asignar)$"),
    busqueda: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    return {"data": svc.listar_abastecimientos(filtro=filtro, busqueda=busqueda)}


@router.post("/abastecimientos")
def crear_abastecimiento(body: AbastecimientoIn, user: dict = Depends(require_admin)):
    with logistica_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO abastecimiento (material, cantidad, proveedor, proveedor_clave,
                                        oc, fecha_solicitud, fecha_estimada, observaciones,
                                        created_by)
            VALUES (?, ?, ?, ?, ?, COALESCE(?, date('now')), ?, ?, ?)
            """,
            (
                body.material.strip(),
                body.cantidad,
                (body.proveedor or "").strip(),
                body.proveedor_clave.strip(),
                (body.oc or "").strip(),
                body.fecha_solicitud,
                body.fecha_estimada,
                body.observaciones,
                user.get("email", ""),
            ),
        )
        aid = cur.lastrowid
        conn.execute("UPDATE abastecimiento SET folio = ? WHERE id = ?", (f"ABS-{aid:04d}", aid))
        conn.commit()
    return {"id": aid, "folio": f"ABS-{aid:04d}"}


@router.put("/abastecimientos/{abastecimiento_id}")
def editar_abastecimiento(
    abastecimiento_id: int, body: AbastecimientoPatch, user: dict = Depends(require_admin)
):
    with logistica_connection() as conn:
        actual = conn.execute(
            "SELECT * FROM abastecimiento WHERE id = ?", (abastecimiento_id,)
        ).fetchone()
        if not actual:
            raise HTTPException(status_code=404, detail="Abastecimiento no encontrado")
        nueva_cantidad = body.cantidad if body.cantidad is not None else float(actual["cantidad"])
        # R1: la cantidad nunca puede quedar por debajo de lo ya asignado
        asignado = svc._suma_por_abastecimiento(conn).get(abastecimiento_id, {}).get("asignado", 0.0)
        if nueva_cantidad < asignado - 1e-9:
            raise HTTPException(status_code=422, detail="La cantidad no puede ser menor a lo ya asignado")
        conn.execute(
            """
            UPDATE abastecimiento SET
                cantidad = ?,
                proveedor = COALESCE(?, proveedor),
                proveedor_clave = COALESCE(?, proveedor_clave),
                oc = COALESCE(?, oc),
                fecha_estimada = COALESCE(?, fecha_estimada),
                observaciones = COALESCE(?, observaciones),
                estatus = COALESCE(?, estatus),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                nueva_cantidad,
                (body.proveedor or "").strip() or None,
                (body.proveedor_clave or "").strip() or None,
                (body.oc or "").strip() or None,
                body.fecha_estimada,
                body.observaciones,
                body.estatus,
                abastecimiento_id,
            ),
        )
        conn.commit()
    return {"id": abastecimiento_id, "actualizado": True}


@router.delete("/abastecimientos/{abastecimiento_id}")
def eliminar_abastecimiento(abastecimiento_id: int, user: dict = Depends(require_admin)):
    with logistica_connection() as conn:
        recibido = svc._suma_por_abastecimiento(conn).get(abastecimiento_id, {}).get("recibido", 0.0)
        if recibido > 0:
            raise HTTPException(
                status_code=409,
                detail="No se puede eliminar: ya tiene recepciones registradas (cancelarlo en su lugar)",
            )
        cur = conn.execute("DELETE FROM abastecimiento WHERE id = ?", (abastecimiento_id,))
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Abastecimiento no encontrado")
    return {"id": abastecimiento_id, "eliminado": True}


# ---------------------------------------------------------------------------
# Asignaciones (relación abastecimiento <-> demanda)
# ---------------------------------------------------------------------------

@router.get("/asignaciones")
def get_asignaciones(
    oc: str | None = Query(None), material: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    data = svc.listar_asignaciones()
    if oc:
        data = [a for a in data if oc.lower() in (a.get("oc") or "").lower()]
    if material:
        data = [a for a in data if material.lower() in a["material"].lower()]
    return {"data": data}


@router.post("/asignaciones")
def crear_asignacion(body: AsignacionIn, user: dict = Depends(require_admin)):
    with logistica_connection() as conn:
        try:
            svc.validar_asignacion(conn, body.abastecimiento_id, body.demanda_id, body.cantidad)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        cur = conn.execute(
            "INSERT INTO asignacion (abastecimiento_id, demanda_id, cantidad) VALUES (?, ?, ?)",
            (body.abastecimiento_id, body.demanda_id, body.cantidad),
        )
        svc._recalcular_estatus_demandas(conn)
        conn.commit()
    return {"id": cur.lastrowid}


@router.delete("/asignaciones/{asignacion_id}")
def eliminar_asignacion(asignacion_id: int, user: dict = Depends(require_admin)):
    with logistica_connection() as conn:
        cur = conn.execute("DELETE FROM asignacion WHERE id = ?", (asignacion_id,))
        svc._recalcular_estatus_demandas(conn)
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return {"id": asignacion_id, "eliminado": True}


# ---------------------------------------------------------------------------
# Recepciones (almacén)
# ---------------------------------------------------------------------------

@router.get("/recepciones")
def get_recepciones(
    abastecimiento_id: int | None = Query(None),
    user: dict = Depends(get_current_user),
):
    return {"data": svc.listar_recepciones(abastecimiento_id=abastecimiento_id)}


@router.post("/recepciones")
def crear_recepcion(body: RecepcionIn, user: dict = Depends(require_admin)):
    with logistica_connection() as conn:
        try:
            svc.validar_recepcion(conn, body.abastecimiento_id, body.cantidad)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        cur = conn.execute(
            """
            INSERT INTO recepcion (abastecimiento_id, cantidad, fecha_recepcion,
                                   documento, ubicacion, usuario, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                body.abastecimiento_id,
                body.cantidad,
                body.fecha_recepcion,
                (body.documento or "").strip(),
                (body.ubicacion or "").strip(),
                user.get("email", ""),
                body.observaciones,
            ),
        )
        conn.commit()
    return {"id": cur.lastrowid}


class VincularIn(BaseModel):
    mov_sae_id: int


@router.get("/abastecimientos/{abastecimiento_id}/candidatas-sae")
def get_candidatas_sae(abastecimiento_id: int, user: dict = Depends(get_current_user)):
    """Entradas por compra de SAE candidatas a cuadrar con este abastecimiento."""
    try:
        return svc.candidatas_sae(abastecimiento_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/recepciones/{recepcion_id}/vincular")
def vincular_recepcion(
    recepcion_id: int, body: VincularIn, user: dict = Depends(require_admin)
):
    """Vincula una recepción con su entrada por compra del espejo SAE."""
    try:
        return svc.vincular_recepcion_sae(recepcion_id, body.mov_sae_id)
    except ValueError as exc:
        detalle = str(exc)
        raise HTTPException(
            status_code=409 if "ya está vinculada" in detalle else 422,
            detail=detalle,
        )


# ---------------------------------------------------------------------------
# Catálogos auxiliares
# ---------------------------------------------------------------------------

_QUERY_PROVEEDORES = """
    SELECT clave, nombre
    FROM sae_proveedores
    WHERE status IS NULL OR UPPER(status) NOT LIKE '%%BAJA%%'
    ORDER BY nombre
"""


@router.get("/proveedores")
def get_proveedores(
    busqueda: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    """Catálogo de proveedores desde SAE (para selects del formulario de OC)."""
    sql = _QUERY_PROVEEDORES
    params = {}
    if busqueda:
        sql = """
            SELECT clave, nombre
            FROM sae_proveedores
            WHERE (LOWER(nombre) LIKE LOWER(%(busqueda)s) OR clave LIKE %(busqueda)s)
            ORDER BY nombre
        """
        params["busqueda"] = f"%{busqueda}%"
    try:
        with postgres_cursor() as cur:
            cur.execute(sql, params)
            filas = [dict(r) for r in cur.fetchall()]
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"Catálogo de proveedores no disponible: {exc}")
    return {"data": filas}


# ---------------------------------------------------------------------------
# Clientes y proveedores: datos fiscales/contacto desde el espejo SAE
# ---------------------------------------------------------------------------


@router.get("/clientes")
def get_clientes(
    busqueda: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    """Autocomplete de clientes SAE (clave / nombre / RFC)."""
    try:
        return {"data": svc.buscar_clientes(busqueda)}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"Catálogo de clientes no disponible: {exc}")


@router.get("/clientes/{clave}")
def get_cliente(clave: str, user: dict = Depends(get_current_user)):
    """Detalle fiscal/contacto de un cliente SAE."""
    try:
        data = svc.detalle_cliente(clave)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"Datos del cliente no disponibles: {exc}")
    if data is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return data


@router.get("/proveedores/{clave}")
def get_proveedor(clave: str, user: dict = Depends(get_current_user)):
    """Detalle fiscal/contacto/bancario de un proveedor SAE."""
    try:
        data = svc.detalle_proveedor(clave)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"Datos del proveedor no disponibles: {exc}")
    if data is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return data
