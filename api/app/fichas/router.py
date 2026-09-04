"""Router del módulo Fichas técnicas / documentos de producto (/api/fichas).

Los admins suben PDFs de fichas, manuales, certificados, etc. por producto
(marca + código) desde el dashboard privado; el sitio público consume los
documentos públicos y vigentes con endpoints sin autenticación
(/api/fichas/publicas y /api/fichas/{id}/pdf). Las escrituras son solo para
admin (require_admin); el endpoint del PDF también sirve documentos privados
a un admin autenticado (preview en el dashboard).
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.auth.dependencies import get_current_user, get_current_user_optional, require_admin
from app.fichas import service as svc

router = APIRouter(prefix="/api/fichas", tags=["fichas"])


# ---------------------------------------------------------------------------
# Endpoints privados (JWT)
# ---------------------------------------------------------------------------


@router.get("/tipos")
def tipos_documento(user: dict = Depends(get_current_user)):
    """Catálogo de tipos de documento activos (ficha técnica, manual, ...)."""
    return {"data": svc.listar_tipos()}


@router.get("/marcas")
def listar_marcas(user: dict = Depends(get_current_user)):
    """Marcas disponibles para subir documentos (slug + nombre comercial)."""
    return {"data": svc.listar_marcas()}


@router.get("/productos")
def productos_por_marca(marca: str, user: dict = Depends(get_current_user)):
    """Productos de una marca desde el Excel de almacén (para elegir a quién se le sube el documento)."""
    try:
        return {"data": svc.productos_de_marca(marca)}
    except svc.MarcaNoSoportada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except svc.ExcelNoDisponible as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("")
def listar_documentos(
    marca: str | None = Query(None),
    codigo: str | None = Query(None),
    q: str | None = Query(None),
    tipo: str | None = Query(None),
    publico: int | None = Query(None),
    vigente: int | None = Query(None),
    activo: int | None = Query(None),
    user: dict = Depends(get_current_user),
):
    return {
        "data": svc.listar_documentos(
            marca=marca, codigo=codigo, q=q, tipo=tipo,
            publico=publico, vigente=vigente, activo=activo,
        )
    }


@router.post("")
def subir_documento(
    marca: str = File(...),
    codigo: str = File(...),
    tipo: str = File(...),
    pdf: UploadFile = File(...),
    nombre_documento: str = File(""),
    descripcion_documento: str = File(""),
    numero_documento: str = File(""),
    version: str = File(""),
    fecha_documento: str = File(""),
    publico: str = File("1"),
    user: dict = Depends(require_admin),
):
    """Sube una nueva versión del documento (marca, codigo, tipo). Máx 25 MB.

    Requiere que el código exista en la hoja de la marca del Excel de almacén.
    Si ya hay un documento vigente del mismo tipo, pasa a historial (vigente=0).
    """
    if not pdf.filename or not pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Solo se permiten archivos PDF")

    contenido = bytearray()
    while True:
        chunk = pdf.file.read(1024 * 1024)
        if not chunk:
            break
        contenido.extend(chunk)
        if len(contenido) > svc.MAX_PDF_BYTES:
            raise HTTPException(
                status_code=413, detail="El PDF supera el tamaño máximo permitido (25 MB)"
            )

    try:
        doc = svc.guardar_documento(
            marca=marca,
            codigo=codigo,
            tipo=tipo,
            contenido=bytes(contenido),
            nombre_original=pdf.filename,
            usuario=user.get("email", ""),
            nombre_documento=nombre_documento,
            descripcion_documento=descripcion_documento,
            numero_documento=numero_documento,
            version=version,
            fecha_documento=fecha_documento,
            publico=1 if publico != "0" else 0,
        )
    except svc.MarcaNoSoportada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except svc.ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except svc.TipoDocumentoNoValido as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except svc.ExcelNoDisponible as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return doc


class DocumentoUpdate(BaseModel):
    nombre_documento: str | None = None
    descripcion_documento: str | None = None
    numero_documento: str | None = None
    version: str | None = None
    fecha_documento: str | None = None
    publico: int | None = None
    vigente: int | None = None
    activo: int | None = None


@router.patch("/{doc_id}")
def editar_documento(
    doc_id: int,
    cambios: DocumentoUpdate,
    user: dict = Depends(require_admin),
):
    """Edita metadatos/visibilidad de un documento (reactivar, publicar, etc.)."""
    doc = svc.actualizar_documento(doc_id, cambios.model_dump(), user.get("email", ""))
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return doc


@router.delete("/{doc_id}")
def borrar_documento(doc_id: int, user: dict = Depends(require_admin)):
    """Eliminación lógica (activo=0). No borra la fila ni el archivo físico."""
    if not svc.eliminar_documento(doc_id, user.get("email", "")):
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return {"id": doc_id, "eliminado": True}


# ---------------------------------------------------------------------------
# Endpoints públicos (sin JWT; el sitio público los consume con CORS)
# ---------------------------------------------------------------------------


@router.get("/publicas")
def documentos_publicos(marca: str = Query(...), codigo: str = Query(...)):
    """Documentos públicos, vigentes y activos de un producto (sitio público)."""
    return {"data": svc.listar_publicas(marca=marca, codigo=codigo)}


@router.get("/{doc_id}/pdf")
def descargar_pdf(doc_id: int, user: dict | None = Depends(get_current_user_optional)):
    """Sirve el PDF si es público/vigente/activo, o si quien lo pide es admin.

    Cualquier otro caso responde 404 para no revelar la existencia de
    documentos privados.
    """
    doc = svc.obtener_documento(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    es_admin = user is not None and user.get("rol") == "admin"
    if not es_admin and not svc.visible_publicamente(doc):
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    try:
        ruta = svc.ruta_archivo(doc)
    except ValueError:
        raise HTTPException(status_code=404, detail="Documento no encontrado") from None
    if not ruta.exists():
        raise HTTPException(status_code=404, detail="El archivo del documento no existe en el servidor")
    return FileResponse(
        str(ruta),
        media_type="application/pdf",
        filename=doc["nombre_archivo"],
        content_disposition_type="inline",
    )
