


import json
import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest
from urllib.request import urlopen

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel

from app.auth.dependencies import get_current_user_optional, require_admin
from app.database import users_connection
from app.services.client_ip import cf_country_name, get_client_ip_and_country

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


# Caché en memoria para geolocalización por IP.
# Formato: {"ip": {"country": "...", "city": "...", "ts": datetime}}
_geo_cache: dict[str, dict] = {}
_GEO_CACHE_TTL_HOURS = 24


def _is_private_ip(ip: str) -> bool:
    """Determina si una IP es privada/local y no tiene geolocalización pública."""
    if ip in ("unknown", "localhost", "127.0.0.1", "::1"):
        return True
    parts = ip.split(".")
    if len(parts) != 4 or not all(p.isdigit() for p in parts):
        return False
    a, b, c, d = (int(p) for p in parts)
    # 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    if a == 10:
        return True
    if a == 172 and 16 <= b <= 31:
        return True
    if a == 192 and b == 168:
        return True
    # 127.0.0.0/8 ya se cubre arriba
    return False


def _lookup_geo(ip: str) -> tuple[Optional[str], Optional[str]]:
    """Consulta país y ciudad a partir de IP usando ip-api.com, con caché."""
    if _is_private_ip(ip):
        return None, None

    now = _now()
    cached = _geo_cache.get(ip)
    if cached and (now - cached["ts"]).total_seconds() < _GEO_CACHE_TTL_HOURS * 3600:
        return cached.get("country"), cached.get("city")

    try:
        req = UrlRequest(
            f"http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,regionName,city",
            headers={"User-Agent": "3P-Analytics/1.0"},
        )
        with urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if data.get("status") != "success":
            logger.debug("[analytics] Geolocalización no disponible para %s: %s", ip, data.get("message"))
            return None, None
        country = data.get("country")
        city = data.get("city")
        _geo_cache[ip] = {"country": country, "city": city, "ts": now}
        return country, city
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        logger.debug("[analytics] Error consultando geolocalización para %s: %s", ip, exc)
        return None, None


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
        ip, cf_country_code = get_client_ip_and_country(request)
        user_agent = request.headers.get("user-agent", "")
        # Prioridad: país explícito del frontend > CF-IPCountry (vía túnel) > lookup por IP.
        geo_country = country or cf_country_name(cf_country_code)
        geo_city = city
        if not geo_country or not geo_city:
            lookup_country, lookup_city = _lookup_geo(ip)
            geo_country = geo_country or lookup_country
            geo_city = geo_city or lookup_city
        with users_connection() as conn:
            conn.execute(
                """
                INSERT INTO analytics_events
                (session_id, user_email, user_id, event_type, path, section, metadata, ip, user_agent, referrer,
                 device_type, browser, os, country, city, screen_width, screen_height, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    geo_country,
                    geo_city,
                    screen_width,
                    screen_height,
                    _now().isoformat(),
                ),
            )
            conn.commit()
    except Exception as exc:
        logger.warning("[analytics] No se pudo registrar evento: %s", exc)


@router.post("/event")
def track_event(
    request: Request,
    payload: EventPayload,
    user: Optional[dict] = Depends(get_current_user_optional),
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


def _date_clause(
    dias: int,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
) -> tuple[str, tuple]:
    """Devuelve cláusula WHERE y parámetros para filtrar por rango de fechas.

    Si se proporciona fecha_desde y/o fecha_hasta, tienen prioridad sobre 'dias'.
    Las fechas deben venir en formato ISO (YYYY-MM-DD o con hora).
    """
    params: list = []
    clauses: list[str] = []

    if fecha_desde:
        # Formato compatible con SQLite: YYYY-MM-DD HH:MM:SS
        since = f"{fecha_desde} 00:00:00" if len(fecha_desde) <= 10 else fecha_desde.replace("T", " ").split("+")[0].split("Z")[0]
        clauses.append("created_at >= ?")
        params.append(since)
    else:
        since = (_now() - timedelta(days=dias)).isoformat()
        clauses.append("created_at > ?")
        params.append(since)

    if fecha_hasta:
        until = f"{fecha_hasta} 23:59:59" if len(fecha_hasta) <= 10 else fecha_hasta.replace("T", " ").split("+")[0].split("Z")[0]
        clauses.append("created_at <= ?")
        params.append(until)

    return " AND ".join(clauses), tuple(params)


@router.get("/resumen")
def resumen(
    dias: int = Query(default=30, ge=1, le=365),
    tipo: str = Query(default="todos", pattern="^(todos|publico|admin)$"),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    """Resumen de analytics para el panel de admin."""
    date_clause, date_params = _date_clause(dias, fecha_desde, fecha_hasta)
    tipo_clause, tipo_params = _tipo_path_clause(tipo)

    with users_connection() as conn:
        total_visitas = conn.execute(
            f"SELECT COUNT(*) FROM analytics_events WHERE {date_clause} {tipo_clause}",
            (*date_params, *tipo_params),
        ).fetchone()[0]

        visitantes_unicos = conn.execute(
            f"""
            SELECT COUNT(DISTINCT session_id) FROM analytics_events
            WHERE {date_clause} {tipo_clause}
            """,
            (*date_params, *tipo_params),
        ).fetchone()[0]

        usuarios_unicos = conn.execute(
            f"""
            SELECT COUNT(DISTINCT user_email) FROM analytics_events
            WHERE {date_clause} AND user_email IS NOT NULL {tipo_clause}
            """,
            (*date_params, *tipo_params),
        ).fetchone()[0]

        secciones = conn.execute(
            f"""
            SELECT section, COUNT(*) AS total
            FROM analytics_events
            WHERE {date_clause} AND section IS NOT NULL AND section != '' {tipo_clause}
            GROUP BY section
            ORDER BY total DESC
            LIMIT 10
            """,
            (*date_params, *tipo_params),
        ).fetchall()

        paginas = conn.execute(
            f"""
            SELECT path, COUNT(*) AS total
            FROM analytics_events
            WHERE {date_clause} AND path IS NOT NULL AND path != '' {tipo_clause}
            GROUP BY path
            ORDER BY total DESC
            LIMIT 10
            """,
            (*date_params, *tipo_params),
        ).fetchall()

        usuarios = conn.execute(
            f"""
            SELECT user_email, COUNT(*) AS total
            FROM analytics_events
            WHERE {date_clause} AND user_email IS NOT NULL
            GROUP BY user_email
            ORDER BY total DESC
            LIMIT 10
            """,
            (*date_params,),
        ).fetchall()

        por_mes = conn.execute(
            f"""
            SELECT strftime('%Y-%m', created_at) AS mes, COUNT(*) AS total
            FROM analytics_events
            WHERE {date_clause} {tipo_clause}
            GROUP BY mes
            ORDER BY mes ASC
            """,
            (*date_params, *tipo_params),
        ).fetchall()

        por_tipo = conn.execute(
            f"""
            SELECT event_type, COUNT(*) AS total
            FROM analytics_events
            WHERE {date_clause} {tipo_clause}
            GROUP BY event_type
            ORDER BY total DESC
            """,
            (*date_params, *tipo_params),
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
            WHERE {date_clause} {tipo_clause}
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (*date_params, *tipo_params),
        ).fetchall()

    return {
        "dias": dias,
        "tipo": tipo,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "total_eventos": total_visitas,
        "visitantes_unicos": visitantes_unicos,
        "usuarios_unicos": usuarios_unicos,
        "secciones_mas_visitadas": [dict(r) for r in secciones],
        "paginas_mas_visitadas": [dict(r) for r in paginas],
        "usuarios_mas_activos": [dict(r) for r in usuarios],
        "eventos_por_mes": [dict(r) for r in por_mes],
        "eventos_por_tipo": [dict(r) for r in por_tipo],
        "actividad_reciente": [dict(r) for r in ultimos],
    }


@router.get("/visitas")
def listar_visitas(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    dias: int = Query(default=30, ge=1, le=365),
    tipo: str = Query(default="todos", pattern="^(todos|publico|admin)$"),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    date_clause, date_params = _date_clause(dias, fecha_desde, fecha_hasta)
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
            (*date_params, *tipo_params, limit, skip),
        ).fetchall()

        total = conn.execute(
            f"SELECT COUNT(*) FROM analytics_events WHERE {date_clause} {tipo_clause}",
            (*date_params, *tipo_params),
        ).fetchone()[0]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "tipo": tipo,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "data": [dict(r) for r in rows],
    }


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


def _geo_clause(pais: Optional[str] = None, ciudad: Optional[str] = None) -> tuple[str, tuple]:
    """Cláusula WHERE y parámetros para filtrar por país y/o ciudad."""
    clauses: list[str] = []
    params: list = []
    if pais:
        clauses.append("COALESCE(country, 'Desconocido') = ?")
        params.append(pais)
    if ciudad:
        clauses.append("COALESCE(city, 'Desconocida') = ?")
        params.append(ciudad)
    return (" AND " + " AND ".join(clauses)) if clauses else "", tuple(params)


# ---------------------------------------------------------------------------
# Consultas públicas (compartidas entre endpoints /publico/* y el reporte)
# ---------------------------------------------------------------------------


def _q_publico_por_dia(conn, date_clause: str, date_params: tuple) -> list[dict]:
    rows = conn.execute(
        f"""
        SELECT strftime('%Y-%m-%d', created_at) AS dia, COUNT(*) AS total
        FROM analytics_events
        WHERE {date_clause} {_public_where_clause()}
        GROUP BY dia
        ORDER BY dia ASC
        """,
        (*date_params,),
    ).fetchall()
    return [dict(r) for r in rows]


def _q_publico_por_hora(conn, date_clause: str, date_params: tuple) -> list[dict]:
    rows = conn.execute(
        f"""
        SELECT strftime('%H', created_at) AS hora, COUNT(*) AS total
        FROM analytics_events
        WHERE {date_clause} {_public_where_clause()}
        GROUP BY hora
        ORDER BY hora ASC
        """,
        (*date_params,),
    ).fetchall()
    return [dict(r) for r in rows]


def _q_publico_por_dia_hora(conn, date_clause: str, date_params: tuple) -> list[dict]:
    """Matriz día de la semana (0=domingo) x hora (UTC) para el heatmap."""
    rows = conn.execute(
        f"""
        SELECT strftime('%w', created_at) AS dia_semana,
               strftime('%H', created_at) AS hora,
               COUNT(*) AS total
        FROM analytics_events
        WHERE {date_clause} {_public_where_clause()}
        GROUP BY dia_semana, hora
        """,
        (*date_params,),
    ).fetchall()
    return [dict(r) for r in rows]


def _q_publico_agrupado(
    conn,
    date_clause: str,
    date_params: tuple,
    expresion: str,
    limite: Optional[int] = None,
    extra_where: str = "",
) -> list[dict]:
    """Agrupa eventos públicos por una expresión SQL fija (no es input del usuario)."""
    sql = f"""
        SELECT {expresion} AS nombre, COUNT(*) AS total
        FROM analytics_events
        WHERE {date_clause} {_public_where_clause()} {extra_where}
        GROUP BY nombre
        ORDER BY total DESC
    """
    if limite:
        sql += f" LIMIT {int(limite)}"
    rows = conn.execute(sql, (*date_params,)).fetchall()
    return [dict(r) for r in rows]


def datos_publicos(
    dias: int,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
    pais: Optional[str] = None,
    ciudad: Optional[str] = None,
) -> dict:
    """Todas las consultas del dashboard público en una sola pasada.

    La usan los endpoints /publico/* (cada uno toma su rebanada) y la
    generación del reporte exportable.
    """
    date_clause, date_params = _date_clause(dias, fecha_desde, fecha_hasta)
    geo_clause, geo_params = _geo_clause(pais, ciudad)
    date_clause = f"{date_clause}{geo_clause}"
    date_params = (*date_params, *geo_params)
    with users_connection() as conn:
        return {
            "por_dia": _q_publico_por_dia(conn, date_clause, date_params),
            "por_hora": _q_publico_por_hora(conn, date_clause, date_params),
            "por_dia_hora": _q_publico_por_dia_hora(conn, date_clause, date_params),
            "dispositivos": _q_publico_agrupado(
                conn, date_clause, date_params, "COALESCE(device_type, 'Desconocido')"
            ),
            "navegadores": _q_publico_agrupado(
                conn, date_clause, date_params, "COALESCE(browser, 'Desconocido')"
            ),
            "sistemas": _q_publico_agrupado(
                conn, date_clause, date_params, "COALESCE(os, 'Desconocido')"
            ),
            "paises": _q_publico_agrupado(
                conn, date_clause, date_params, "COALESCE(country, 'Desconocido')"
            ),
            "ciudades": _q_publico_agrupado(
                conn,
                date_clause,
                date_params,
                "COALESCE(city, 'Desconocida')",
                limite=20,
                extra_where="AND city IS NOT NULL AND city != ''",
            ),
            "referrers": _q_publico_agrupado(
                conn,
                date_clause,
                date_params,
                "COALESCE(referrer, 'Directo / Ninguno')",
                limite=50,
            ),
            "paginas": _q_publico_agrupado(
                conn, date_clause, date_params, "COALESCE(path, '/')", limite=50
            ),
        }


def _respuesta_publico(datos: list[dict], dias, fecha_desde, fecha_hasta) -> dict:
    return {
        "dias": dias,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "data": datos,
    }


@router.get("/publico/por-dia")
def publico_por_dia(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["por_dia"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/por-hora")
def publico_por_hora(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["por_hora"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/por-dia-hora")
def publico_por_dia_hora(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["por_dia_hora"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/dispositivos")
def publico_dispositivos(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["dispositivos"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/navegadores")
def publico_navegadores(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["navegadores"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/sistemas-operativos")
def publico_sistemas_operativos(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["sistemas"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/paises")
def publico_paises(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["paises"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/ciudades")
def publico_ciudades(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["ciudades"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/referrers")
def publico_referrers(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["referrers"], dias, fecha_desde, fecha_hasta)


@router.get("/publico/paginas")
def publico_paginas(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    datos = datos_publicos(dias, fecha_desde, fecha_hasta, pais, ciudad)
    return _respuesta_publico(datos["paginas"], dias, fecha_desde, fecha_hasta)


@router.get("/reporte/excel")
def reporte_excel(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    """Reporte de tráfico en Excel, con los datos del período seleccionado."""
    from fastapi.responses import Response

    from app.analytics.reporte import generar_reporte_excel
    from app.config import get_settings

    datos = datos_publicos(dias, fecha_desde, fecha_hasta)
    logo = get_settings().analytics_logo_path
    contenido = generar_reporte_excel(datos, dias, fecha_desde, fecha_hasta, logo_path=logo)
    nombre = f"reporte_trafico_{_now().strftime('%Y%m%d')}.xlsx"
    return Response(
        content=contenido,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nombre}"'},
    )


@router.get("/reporte/pdf")
def reporte_pdf(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    """Reporte de tráfico en PDF, con los datos del período seleccionado."""
    from fastapi.responses import Response

    from app.analytics.reporte import generar_reporte_pdf
    from app.config import get_settings

    datos = datos_publicos(dias, fecha_desde, fecha_hasta)
    logo = get_settings().analytics_logo_path
    contenido = generar_reporte_pdf(datos, dias, fecha_desde, fecha_hasta, logo_path=logo)
    nombre = f"reporte_trafico_{_now().strftime('%Y%m%d')}.pdf"
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{nombre}"'},
    )


@router.get("/publico/comparativa")
def publico_comparativa(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    pais: Optional[str] = Query(default=None),
    ciudad: Optional[str] = Query(default=None),
    user: dict = Depends(require_admin),
):
    """Compara el período seleccionado con el período anterior del mismo tamaño.

    Si se dan fechas, el período anterior es el rango inmediato previo de igual
    duración; si no, los `dias` días anteriores a la ventana de `dias`.
    """
    hoy = date.today()
    if fecha_desde or fecha_hasta:
        # Se acepta "YYYY-MM-DD" o ISO con hora; se toma solo la parte fecha.
        inicio = date.fromisoformat(fecha_desde[:10]) if fecha_desde else hoy - timedelta(days=dias)
        fin = date.fromisoformat(fecha_hasta[:10]) if fecha_hasta else hoy
    else:
        fin = hoy
        inicio = fin - timedelta(days=dias)
    duracion = max((fin - inicio).days, 1)
    ant_fin = inicio - timedelta(days=1)
    ant_inicio = inicio - timedelta(days=duracion)

    geo_clause, geo_params = _geo_clause(pais, ciudad)

    def _rango(inicio_d, fin_d):
        where = f"created_at >= ? AND created_at <= ?{geo_clause} {_public_where_clause()}"
        params = (f"{inicio_d} 00:00:00", f"{fin_d} 23:59:59", *geo_params)
        with users_connection() as conn:
            total = conn.execute(
                f"SELECT COUNT(*) FROM analytics_events WHERE {where}", params
            ).fetchone()[0]
            por_dia = conn.execute(
                f"""
                SELECT strftime('%Y-%m-%d', created_at) AS dia, COUNT(*) AS total
                FROM analytics_events
                WHERE {where}
                GROUP BY dia
                ORDER BY dia ASC
                """,
                params,
            ).fetchall()
        return {
            "inicio": inicio_d.isoformat(),
            "fin": fin_d.isoformat(),
            "total": total,
            "por_dia": [dict(r) for r in por_dia],
        }

    actual = _rango(inicio, fin)
    anterior = _rango(ant_inicio, ant_fin)
    diferencia = actual["total"] - anterior["total"]
    variacion = round(diferencia / anterior["total"] * 100, 1) if anterior["total"] > 0 else None

    return {
        "actual": actual,
        "anterior": anterior,
        "diferencia_absoluta": diferencia,
        "variacion_porcentual": variacion,
    }


@router.get("/alertas/avanzadas")
def alertas_avanzadas(
    user: dict = Depends(require_admin),
):
    """Evalúa alertas avanzadas (pico de tráfico, países no esperados) y,
    si hay SMTP configurado, notifica por correo con deduplicación de 24h."""
    from app.analytics.alertas import evaluar_alertas

    return evaluar_alertas(notificar=True)


@router.get("/alertas")
def alertas(
    dias: int = Query(default=30, ge=1, le=365),
    fecha_desde: Optional[str] = Query(default=None),
    fecha_hasta: Optional[str] = Query(default=None),
    umbral_intentos: int = Query(default=5, ge=1),
    user: dict = Depends(require_admin),
):
    """Devuelve alertas de seguridad basadas en eventos de analytics y login_attempts."""
    date_clause, date_params = _date_clause(dias, fecha_desde, fecha_hasta)

    with users_connection() as conn:
        # Intentos de login fallidos en el período
        total_fallidos = conn.execute(
            f"SELECT COUNT(*) FROM login_attempts WHERE exito = 0 AND {date_clause}",
            (*date_params,),
        ).fetchone()[0]

        ips_fallidas = conn.execute(
            f"""
            SELECT ip, COUNT(*) AS total
            FROM login_attempts
            WHERE exito = 0 AND {date_clause}
            GROUP BY ip
            ORDER BY total DESC
            LIMIT 20
            """,
            (*date_params,),
        ).fetchall()

        emails_fallidos = conn.execute(
            f"""
            SELECT email, COUNT(*) AS total
            FROM login_attempts
            WHERE exito = 0 AND {date_clause}
            GROUP BY email
            ORDER BY total DESC
            LIMIT 20
            """,
            (*date_params,),
        ).fetchall()

        intentos_recientes = conn.execute(
            f"""
            SELECT ip, email, exito, created_at
            FROM login_attempts
            WHERE exito = 0 AND {date_clause}
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (*date_params,),
        ).fetchall()

        # IPs con intentos fallidos >= umbral
        ips_sospechosas = [dict(r) for r in ips_fallidas if r["total"] >= umbral_intentos]

        # Eventos de error o acciones inusuales
        eventos_error = conn.execute(
            f"""
            SELECT event_type, path, ip, user_email, COUNT(*) AS total
            FROM analytics_events
            WHERE (event_type LIKE '%error%' OR event_type LIKE '%fail%' OR event_type = 'logout')
            AND {date_clause}
            GROUP BY event_type, ip, path
            ORDER BY total DESC
            LIMIT 20
            """,
            (*date_params,),
        ).fetchall()

    return {
        "dias": dias,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "umbral_intentos": umbral_intentos,
        "alertas_activas": total_fallidos > 0,
        "total_intentos_fallidos": total_fallidos,
        "ips_con_intentos_fallidos": [dict(r) for r in ips_fallidas],
        "emails_con_intentos_fallidos": [dict(r) for r in emails_fallidos],
        "ips_sospechosas": ips_sospechosas,
        "intentos_recientes": [dict(r) for r in intentos_recientes],
        "eventos_error": [dict(r) for r in eventos_error],
    }
