import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel

from app.auth.dependencies import get_current_user, require_admin
from app.database import users_connection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class EventPayload(BaseModel):
    event_type: str
    path: Optional[str] = None
    section: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[str] = None
    referrer: Optional[str] = None


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def record_analytics_event(
    request: Request,
    event_type: str,
    user: Optional[dict] = None,
    path: Optional[str] = None,
    section: Optional[str] = None,
    session_id: Optional[str] = None,
    metadata: Optional[str] = None,
    referrer: Optional[str] = None,
):
    """Registra un evento de analytics. Puede usarse desde otros routers."""
    try:
        ip = _get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        with users_connection() as conn:
            conn.execute(
                """
                INSERT INTO analytics_events
                (session_id, user_email, user_id, event_type, path, section, metadata, ip, user_agent, referrer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id or str(uuid.uuid4()),
                    user.get("email") if user else None,
                    user.get("id") if user else None,
                    event_type,
                    path,
                    section,
                    metadata,
                    ip,
                    user_agent,
                    referrer,
                ),
            )
            conn.commit()
    except Exception as exc:
        logger.warning("[analytics] No se pudo registrar evento: %s", exc)


@router.post("/event")
def track_event(
    request: Request,
    payload: EventPayload,
    user: Optional[dict] = Depends(get_current_user),
):
    """Endpoint público/autenticado para registrar eventos desde el frontend."""
    record_analytics_event(
        request,
        event_type=payload.event_type,
        user=user,
        path=payload.path,
        section=payload.section,
        session_id=payload.session_id,
        metadata=payload.metadata,
        referrer=payload.referrer,
    )
    return {"detail": "Evento registrado"}


def _tipo_path_clause(tipo: str) -> tuple[str, list]:
    """Devuelve cláusula WHERE y parámetros para filtrar por tipo de tráfico."""
    if tipo == "publico":
        return """
            AND (
                path IS NULL OR path = '/' OR path = ''
                OR (
                    path NOT LIKE '/admin%'
                    AND path NOT LIKE '/dashboard%'
                    AND path NOT LIKE '/cotizador%'
                    AND path NOT LIKE '/login%'
                )
            )
        """, []
    if tipo == "admin":
        return """
            AND (
                path LIKE '/admin%'
                OR path LIKE '/dashboard%'
                OR path LIKE '/cotizador%'
                OR path LIKE '/login%'
            )
        """, []
    return "", []


@router.get("/resumen")
def resumen(
    dias: int = Query(default=30, ge=1, le=365),
    tipo: str = Query(default="todos", pattern="^(todos|publico|admin)$"),
    user: dict = Depends(require_admin),
):
    """Resumen de analytics para el panel de admin."""
    since = (_now() - timedelta(days=dias)).isoformat()
    tipo_clause, tipo_params = _tipo_path_clause(tipo)

    with users_connection() as conn:
        total_visitas = conn.execute(
            f"SELECT COUNT(*) FROM analytics_events WHERE created_at > ? {tipo_clause}",
            (since, *tipo_params),
        ).fetchone()[0]

        visitantes_unicos = conn.execute(
            f"""
            SELECT COUNT(DISTINCT session_id) FROM analytics_events
            WHERE created_at > ? {tipo_clause}
            """,
            (since, *tipo_params),
        ).fetchone()[0]

        usuarios_unicos = conn.execute(
            f"""
            SELECT COUNT(DISTINCT user_email) FROM analytics_events
            WHERE created_at > ? AND user_email IS NOT NULL {tipo_clause}
            """,
            (since, *tipo_params),
        ).fetchone()[0]

        secciones = conn.execute(
            f"""
            SELECT section, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? AND section IS NOT NULL AND section != '' {tipo_clause}
            GROUP BY section
            ORDER BY total DESC
            LIMIT 10
            """,
            (since, *tipo_params),
        ).fetchall()

        paginas = conn.execute(
            f"""
            SELECT path, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? AND path IS NOT NULL AND path != '' {tipo_clause}
            GROUP BY path
            ORDER BY total DESC
            LIMIT 10
            """,
            (since, *tipo_params),
        ).fetchall()

        usuarios = conn.execute(
            """
            SELECT user_email, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? AND user_email IS NOT NULL
            GROUP BY user_email
            ORDER BY total DESC
            LIMIT 10
            """,
            (since,),
        ).fetchall()

        por_mes = conn.execute(
            f"""
            SELECT strftime('%Y-%m', created_at) AS mes, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {tipo_clause}
            GROUP BY mes
            ORDER BY mes ASC
            """,
            (since, *tipo_params),
        ).fetchall()

        ultimos = conn.execute(
            f"""
            SELECT
                id,
                session_id,
                user_email,
                event_type,
                path,
                section,
                ip,
                user_agent,
                created_at
            FROM analytics_events
            WHERE created_at > ? {tipo_clause}
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (since, *tipo_params),
        ).fetchall()

    return {
        "dias": dias,
        "tipo": tipo,
        "total_eventos": total_visitas,
        "visitantes_unicos": visitantes_unicos,
        "usuarios_unicos": usuarios_unicos,
        "secciones_mas_visitadas": [dict(r) for r in secciones],
        "paginas_mas_visitadas": [dict(r) for r in paginas],
        "usuarios_mas_activos": [dict(r) for r in usuarios],
        "eventos_por_mes": [dict(r) for r in por_mes],
        "actividad_reciente": [dict(r) for r in ultimos],
    }


@router.get("/visitas")
def listar_visitas(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    dias: int = Query(default=30, ge=1, le=365),
    tipo: str = Query(default="todos", pattern="^(todos|publico|admin)$"),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    tipo_clause, tipo_params = _tipo_path_clause(tipo)

    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT
                id,
                session_id,
                user_email,
                event_type,
                path,
                section,
                ip,
                user_agent,
                created_at
            FROM analytics_events
            WHERE created_at > ? {tipo_clause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (since, *tipo_params, limit, skip),
        ).fetchall()

        total = conn.execute(
            f"SELECT COUNT(*) FROM analytics_events WHERE created_at > ? {tipo_clause}",
            (since, *tipo_params),
        ).fetchone()[0]

    return {"total": total, "skip": skip, "limit": limit, "tipo": tipo, "data": [dict(r) for r in rows]}
