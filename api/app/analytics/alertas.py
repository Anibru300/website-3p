"""Alertas avanzadas de analytics: pico de tráfico y países no esperados.

Estrategia:
- Pico de tráfico: compara las últimas 24h contra el promedio diario y la
  desviación estándar de los 30 días anteriores (mismo filtro de tráfico
  público que el dashboard). Dispara solo si hay volumen mínimo absoluto y
  el pico supera max(3x promedio, promedio + 3 desviaciones), para no
  alertar por variaciones normales.
- Países no esperados: si ALERTAS_PAISES_PERMITIDOS está configurado,
  reporta tráfico de países fuera de esa lista.

Notificaciones por correo con deduplicación: la tabla alertas_enviadas
guarda (tipo, dedupe_key) y se respeta un cooldown de 24h para no enviar
correos repetidos por el mismo evento.
"""

import logging
from datetime import datetime, timedelta, timezone
from statistics import pstdev
from typing import Optional

from app.config import get_settings
from app.database import users_connection
from app.services.email import correo_configurado, enviar_correo

logger = logging.getLogger(__name__)


def _public_where() -> str:
    # Import perezoso para evitar circularidad con app.analytics.router.
    from app.analytics.router import _public_where_clause

    return _public_where_clause()

COOLDOWN_HORAS = 24
MINIMO_EVENTOS_24H = 50
FACTOR_MULTIPLO = 3.0
FACTOR_DESVIACION = 3.0
DIAS_HISTORICOS = 30


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


def _evaluar_pico(conn) -> Optional[dict]:
    ahora = _ahora()
    limite_24h = (ahora - timedelta(hours=24)).isoformat()
    hoy = ahora.strftime("%Y-%m-%d")

    ultimas_24h = conn.execute(
        f"SELECT COUNT(*) FROM analytics_events WHERE created_at >= ? {_public_where()}",
        (limite_24h,),
    ).fetchone()[0]

    filas = conn.execute(
        f"""
        SELECT strftime('%Y-%m-%d', created_at) AS dia, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= ? {_public_where()}
        GROUP BY dia
        """,
        ((ahora - timedelta(days=DIAS_HISTORICOS)).isoformat(),),
    ).fetchall()
    historicos = [r["total"] for r in filas if r["dia"] != hoy]

    if not historicos:
        return None

    promedio = sum(historicos) / len(historicos)
    desviacion = pstdev(historicos) if len(historicos) > 1 else 0.0
    umbral = max(promedio * FACTOR_MULTIPLO, promedio + FACTOR_DESVIACION * desviacion)

    if ultimas_24h >= MINIMO_EVENTOS_24H and ultimas_24h > umbral:
        return {
            "tipo": "pico_trafico",
            "activa": True,
            "eventos_24h": ultimas_24h,
            "promedio_diario_historico": round(promedio, 1),
            "desviacion_estandar": round(desviacion, 1),
            "umbral": round(umbral, 1),
            "dias_historicos": len(historicos),
            "motivo": (
                f"{ultimas_24h} eventos en las últimas 24h superan el umbral "
                f"({umbral:.1f} = máx(3x promedio {promedio:.1f}, promedio + 3σ {desviacion:.1f}))"
            ),
        }
    return {
        "tipo": "pico_trafico",
        "activa": False,
        "eventos_24h": ultimas_24h,
        "promedio_diario_historico": round(promedio, 1),
        "desviacion_estandar": round(desviacion, 1),
        "umbral": round(umbral, 1),
    }


def _evaluar_paises(conn) -> Optional[dict]:
    permitidos = {
        p.strip()
        for p in get_settings().alertas_paises_permitidos.split(",")
        if p.strip()
    }
    if not permitidos:
        return None  # Sin configuración no se evalúa esta alerta.

    filas = conn.execute(
        f"""
        SELECT COALESCE(country, 'Desconocido') AS pais, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= ? {_public_where()}
          AND country IS NOT NULL AND country != '' AND country != 'Desconocido'
        GROUP BY pais
        ORDER BY total DESC
        """,
        ((_ahora() - timedelta(days=7)).isoformat(),),
    ).fetchall()

    no_esperados = [dict(r) for r in filas if r["pais"] not in permitidos]
    if not no_esperados:
        return {
            "tipo": "pais_no_esperado",
            "activa": False,
            "paises_no_esperados": [],
            "paises_permitidos": sorted(permitidos),
        }

    # Detalle por país no esperado: ciudades e IPs principales.
    detalle = []
    for p in no_esperados[:5]:
        top = conn.execute(
            """
            SELECT COALESCE(city, 'Desconocida') AS ciudad, ip, COUNT(*) AS total
            FROM analytics_events
            WHERE country = ? AND created_at >= ?
            GROUP BY ciudad, ip
            ORDER BY total DESC
            LIMIT 5
            """,
            (p["pais"], (_ahora() - timedelta(days=7)).isoformat()),
        ).fetchall()
        detalle.append({
            "pais": p["pais"],
            "total": p["total"],
            "top_ciudades_ips": [dict(r) for r in top],
        })

    return {
        "tipo": "pais_no_esperado",
        "activa": True,
        "paises_no_esperados": [p["pais"] for p in no_esperados],
        "paises_permitidos": sorted(permitidos),
        "detalle": detalle,
        "motivo": (
            f"Tráfico en los últimos 7 días desde países fuera de la lista "
            f"esperada: {', '.join(p['pais'] for p in no_esperados)}"
        ),
    }


def _evaluar_fuentes() -> Optional[dict]:
    """Revisa la salud de las fuentes de datos (Excel y espejo SAE).

    Alerta cuando una fuente crítica es inaccesible, tiene el esquema
    inválido (hojas/columnas renombradas) o lleva demasiado tiempo sin
    actualizarse respecto a su ritmo operativo (ver MAX_AGE_HORAS).
    """
    from app.services.fuentes import MAX_AGE_HORAS, estado_fuentes

    estado = estado_fuentes()
    problemas = []

    for nombre, fuente in estado["excel"].items():
        if fuente["estado"] in ("inaccesible", "esquema_invalido"):
            problemas.append({
                "fuente": nombre,
                "problema": fuente["estado"],
                "detalle": fuente["detalle"],
            })
            continue
        max_age = MAX_AGE_HORAS.get(nombre)
        edad = fuente.get("edad_horas")
        if max_age is not None and edad is not None and edad > max_age:
            problemas.append({
                "fuente": nombre,
                "problema": "desactualizada",
                "detalle": f"Última modificación hace {edad}h (máx {max_age}h)",
            })

    if get_settings().use_sync_tables:
        try:
            from app.sync.db import ultimo_sync, ultimo_sync_ok

            with users_connection() as conn:
                for fuente in ("vales", "pedidos"):
                    ultimo = ultimo_sync(conn, fuente)
                    if ultimo and ultimo.get("estado") == "error":
                        problemas.append({
                            "fuente": fuente,
                            "problema": "sync_fallido",
                            "detalle": f"Último sync con error: {ultimo.get('error', 'N/D')}",
                        })
                        continue
                    ok = ultimo_sync_ok(conn, fuente)
                    if not ok:
                        problemas.append({
                            "fuente": fuente,
                            "problema": "sync_desactualizado",
                            "detalle": "No hay ningún sync exitoso registrado",
                        })
                        continue
                    try:
                        fin = datetime.fromisoformat(ok["fin"])
                        if fin.tzinfo is None:
                            fin = fin.replace(tzinfo=timezone.utc)
                        edad_h = (_ahora() - fin).total_seconds() / 3600
                    except ValueError:
                        continue
                    if edad_h > 24:
                        problemas.append({
                            "fuente": fuente,
                            "problema": "sync_desactualizado",
                            "detalle": f"Último sync exitoso hace {round(edad_h, 1)}h",
                        })
        except Exception:  # noqa: BLE001
            pass

    sae = estado.get("sae", {})
    if sae.get("estado") != "ok":
        problemas.append({
            "fuente": "sae_postgres",
            "problema": sae.get("estado", "desconocido"),
            "detalle": sae.get("detalle", ""),
        })

    if not problemas:
        return {
            "tipo": "fuentes_datos",
            "activa": False,
            "fuentes_ok": True,
        }

    return {
        "tipo": "fuentes_datos",
        "activa": True,
        "fuentes_ok": False,
        "problemas": problemas,
        "motivo": (
            "Problemas detectados en fuentes de datos: "
            + "; ".join(f"{p['fuente']} ({p['problema']})" for p in problemas)
        ),
    }


def _evaluar_stock() -> Optional[dict]:
    """Productos bajo el stock mínimo definido en SAE (stock_min).

    Los mínimos los manda SAE, no hay configuración local. Sin dedupe de
    ocultamiento: mientras haya productos bajo mínimo la alerta se muestra
    en el panel. Si el espejo Postgres no responde, no se evalúa (la alerta
    de fuentes_datos ya reporta ese problema).
    """
    try:
        # Import perezoso para evitar circularidad con app.inventario.router.
        from app.inventario.router import consultar_productos_bajo_minimo

        resultado = consultar_productos_bajo_minimo(limit=10)
    except Exception as exc:  # noqa: BLE001
        logger.warning("[alertas] No se pudo evaluar stock bajo: %s", exc)
        return None

    total = resultado["total"]
    productos = resultado["productos"]
    if total == 0:
        return {
            "tipo": "stock_bajo",
            "activa": False,
            "total": 0,
            "productos": [],
        }

    return {
        "tipo": "stock_bajo",
        "activa": True,
        "total": total,
        "productos": productos,
        "motivo": (
            f"{total} productos con existencia en o bajo el stock mínimo "
            f"definido en SAE. Más críticos: "
            + ", ".join(
                f"{p['codigo']} ({p['existencia']:g}/{p['stock_min']:g})"
                for p in productos[:5]
            )
        ),
    }


def _notificacion_reciente(conn, tipo: str, dedupe_key: str) -> bool:
    """True si ya se notificó este evento dentro del cooldown."""
    limite = (_ahora() - timedelta(hours=COOLDOWN_HORAS)).isoformat()
    row = conn.execute(
        "SELECT enviado_at FROM alertas_enviadas WHERE tipo = ? AND dedupe_key = ?",
        (tipo, dedupe_key),
    ).fetchone()
    if not row:
        return False
    try:
        enviado = datetime.fromisoformat(row["enviado_at"])
        if enviado.tzinfo is None:
            enviado = enviado.replace(tzinfo=timezone.utc)
        return enviado >= datetime.fromisoformat(limite)
    except ValueError:
        return False


def _marcar_notificado(conn, tipo: str, dedupe_key: str):
    conn.execute(
        """
        INSERT INTO alertas_enviadas (tipo, dedupe_key, enviado_at)
        VALUES (?, ?, ?)
        ON CONFLICT(tipo, dedupe_key) DO UPDATE SET enviado_at = excluded.enviado_at
        """,
        (tipo, dedupe_key, _ahora().isoformat()),
    )
    conn.commit()


def _intentar_notificar(conn, alerta: dict, dedupe_key: str):
    """Envía correo si aplica y respeta cooldown. Nunca lanza excepciones."""
    try:
        if not alerta.get("activa"):
            return
        if _notificacion_reciente(conn, alerta["tipo"], dedupe_key):
            logger.info("[alertas] %s (%s) ya notificado dentro del cooldown", alerta["tipo"], dedupe_key)
            return
        s = get_settings()
        destinatarios = [d.strip() for d in s.alertas_email_to.split(",") if d.strip()]
        if not correo_configurado():
            logger.info("[alertas] %s activa pero SMTP no configurado; solo panel.", alerta["tipo"])
            _marcar_notificado(conn, alerta["tipo"], dedupe_key)
            return
        cuerpo = (
            f"Alerta de analytics: {alerta['tipo']}\n"
            f"Fecha: {_ahora().astimezone().strftime('%d/%m/%Y %H:%M')}\n"
            f"Motivo: {alerta.get('motivo', 'N/D')}\n\n"
            f"Detalle:\n{_formatear_detalle(alerta)}\n"
        )
        if enviar_correo(destinatarios, f"[3P Analytics] Alerta: {alerta['tipo']}", cuerpo):
            _marcar_notificado(conn, alerta["tipo"], dedupe_key)
    except Exception as exc:
        logger.warning("[alertas] Error al notificar %s: %s", alerta.get("tipo"), exc)


def _formatear_detalle(alerta: dict) -> str:
    lineas = []
    for clave, valor in alerta.items():
        if clave in ("tipo", "activa", "motivo", "detalle"):
            continue
        lineas.append(f"- {clave}: {valor}")
    for item in alerta.get("detalle", []):
        lineas.append(f"- {item['pais']}: {item['total']} eventos")
        for t in item.get("top_ciudades_ips", []):
            lineas.append(f"    * {t['ciudad']} / {t['ip']}: {t['total']}")
    return "\n".join(lineas) or "Sin detalle"


def evaluar_alertas(notificar: bool = True) -> dict:
    """Evalúa las alertas avanzadas. Si notificar=True intenta enviar correos
    (con deduplicación de 24h). Devuelve el estado completo para el panel."""
    with users_connection() as conn:
        pico = _evaluar_pico(conn)
        paises = _evaluar_paises(conn)
        fuentes = _evaluar_fuentes()
        stock = _evaluar_stock()

        if notificar:
            if pico and pico.get("activa"):
                _intentar_notificar(conn, pico, dedupe_key="pico_24h")
            if paises and paises.get("activa"):
                clave = ",".join(sorted(paises["paises_no_esperados"]))
                _intentar_notificar(conn, paises, dedupe_key=f"paises:{clave}")
            if fuentes and fuentes.get("activa"):
                clave = ",".join(
                    f"{p['fuente']}:{p['problema']}" for p in fuentes.get("problemas", [])
                )
                _intentar_notificar(conn, fuentes, dedupe_key=f"fuentes:{clave}")
            if stock and stock.get("activa"):
                _intentar_notificar(conn, stock, dedupe_key=f"stock:{stock['total']}")

    activas = [a for a in (pico, paises, fuentes, stock) if a and a.get("activa")]
    return {
        "evaluado_en": _ahora().isoformat(),
        "alertas_activas": len(activas),
        "pico_trafico": pico,
        "pais_no_esperado": paises,
        "fuentes_datos": fuentes,
        "stock_bajo": stock,
    }
