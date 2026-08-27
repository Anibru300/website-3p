import json
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
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _coalesce_device_info(payload: EventPayload) -> dict:
    """Combina los campos explícitos del payload con los que vengan dentro de metadata."""
    explicit = {
        "device_type": payload.device_type,
        "browser": payload.browser,
        "os": payload.os,
        "country": payload.country,
        "city": payload.city,
        "screen_width": payload.screen_width,
        "screen_height": payload.screen_height,
    }

    parsed = {}
    if payload.metadata:
        try:
            parsed = json.loads(payload.metadata)
        except Exception:
            parsed = {}

    result = {}
    for key in explicit:
        result[key] = explicit[key] if explicit[key] is not None else parsed.get(key)
    return result


def record_analytics_event(
    request: Request,
    event_type: str,
    user: Optional[dict] = None,
    path: Optional[str] = None,
    section: Optional[str] = None,
    session_id: Optional[str] = None,
    metadata: Optional[str] = None,
    referrer: Optional[str] = None,
    device_type: Optional[str] = None,
    browser: Optional[str] = None,
    os: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    screen_width: Optional[int] = None,
    screen_height: Optional[int] = None,
):
    """Registra un evento de analytics. Puede usarse desde otros routers."""
    try:
        ip = _get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        with users_connection() as conn:
            conn.execute(
                """
                INSERT INTO analytics_events
                (session_id, user_email, user_id, event_type, path, section, metadata, ip, user_agent, referrer,
                 device_type, browser, os, country, city, screen_width, screen_height)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    device_type,
                    browser,
                    os,
                    country,
                    city,
                    screen_width,
                    screen_height,
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
    device_info = _coalesce_device_info(payload)
    record_analytics_event(
        request,
        event_type=payload.event_type,
        user=user,
        path=payload.path,
        section=payload.section,
        session_id=payload.session_id,
        metadata=payload.metadata,
        referrer=payload.referrer,
        device_type=device_info.get("device_type"),
        browser=device_info.get("browser"),
        os=device_info.get("os"),
        country=device_info.get("country"),
        city=device_info.get("city"),
        screen_width=device_info.get("screen_width"),
        screen_height=device_info.get("screen_height"),
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
                device_type,
                browser,
                os,
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
                device_type,
                browser,
                os,
                referrer,
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


# ---------------------------------------------------------------------------
# Reportes públicos detallados
# ---------------------------------------------------------------------------

def _public_where_clause() -> str:
    """Cláusula WHERE para limitar el análisis al tráfico público del sitio."""
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
    """


@router.get("/publico/por-dia")
def publico_por_dia(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT strftime('%Y-%m-%d', created_at) AS dia, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY dia
            ORDER BY dia ASC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/por-hora")
def publico_por_hora(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT strftime('%H', created_at) AS hora, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY hora
            ORDER BY hora ASC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/dispositivos")
def publico_dispositivos(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(device_type, 'Desconocido') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/navegadores")
def publico_navegadores(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(browser, 'Desconocido') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/sistemas-operativos")
def publico_sistemas_operativos(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(os, 'Desconocido') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/paises")
def publico_paises(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(country, 'Desconocido') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/referrers")
def publico_referrers(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(referrer, 'Directo / Ninguno') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            LIMIT 50
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}


@router.get("/publico/paginas")
def publico_paginas(
    dias: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(require_admin),
):
    since = (_now() - timedelta(days=dias)).isoformat()
    with users_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT COALESCE(path, '/') AS nombre, COUNT(*) AS total
            FROM analytics_events
            WHERE created_at > ? {_public_where_clause()}
            GROUP BY nombre
            ORDER BY total DESC
            LIMIT 50
            """,
            (since,),
        ).fetchall()
    return {"dias": dias, "data": [dict(r) for r in rows]}
