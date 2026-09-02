"""Resolución confiable de la IP real del cliente y datos geográficos del proxy.

El backend se expone públicamente a través de un túnel Cloudflare
(cloudflared) que corre en la misma máquina, por lo que las peticiones
tuneladas llegan con peer 127.0.0.1 y traen los headers estándar de
Cloudflare (CF-Connecting-IP, CF-IPCountry).

Regla de confianza:
- Si el peer es loopback (cloudflared local o desarrollo), se confían los
  headers del proxy: CF-Connecting-IP primero, X-Forwarded-For después.
- Si el peer NO es loopback (conexión directa por LAN/Internet), se ignoran
  por completo los headers falsificables y se usa la IP del socket. Esto
  evita el spoofing de IP/X-Forwarded-For en el rate limiting y analytics.
"""

from typing import Optional

from fastapi import Request

# Nombres de país en español para los códigos ISO de CF-IPCountry.
# Mantiene consistencia con ip-api.com (que devuelve nombre completo).
_CF_COUNTRY_NAMES = {
    "MX": "México",
    "CO": "Colombia",
    "US": "Estados Unidos",
    "ES": "España",
    "AR": "Argentina",
    "CL": "Chile",
    "PE": "Perú",
    "BR": "Brasil",
    "EC": "Ecuador",
    "VE": "Venezuela",
    "GT": "Guatemala",
    "CR": "Costa Rica",
    "PA": "Panamá",
    "DO": "República Dominicana",
    "UY": "Uruguay",
    "PY": "Paraguay",
    "BO": "Bolivia",
    "HN": "Honduras",
    "SV": "El Salvador",
    "NI": "Nicaragua",
    "CA": "Canadá",
    "DE": "Alemania",
    "FR": "Francia",
    "GB": "Reino Unido",
    "IT": "Italia",
    "PT": "Portugal",
    "NL": "Países Bajos",
    "CN": "China",
    "JP": "Japón",
    "IN": "India",
    "RU": "Rusia",
    "KR": "Corea del Sur",
}


def _is_loopback(ip: str) -> bool:
    return ip in ("127.0.0.1", "::1", "localhost")


def get_client_ip_and_country(request: Request) -> tuple[str, Optional[str]]:
    """Devuelve (ip_real, codigo_pais_cf|None).

    Solo se confían los headers de proxy cuando el peer es loopback
    (cloudflared corre en la misma máquina). En cualquier otro caso se
    usa la IP del socket y se ignoran los headers para evitar spoofing.
    """
    peer = request.client.host if request.client else "unknown"

    if _is_loopback(peer):
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip:
            country = request.headers.get("cf-ipcountry")
            return cf_ip.strip(), country.strip().upper() if country else None
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip(), None
        return peer, None

    # Conexión directa: los headers no son confiables.
    return peer, None


def get_client_ip(request: Request) -> str:
    """Solo la IP real del cliente (ver get_client_ip_and_country)."""
    ip, _ = get_client_ip_and_country(request)
    return ip


def cf_country_name(code: Optional[str]) -> Optional[str]:
    """Convierte código ISO de CF-IPCountry a nombre de país; None si vacío."""
    if not code:
        return None
    code = code.strip().upper()
    if not code or code == "XX":
        return None
    return _CF_COUNTRY_NAMES.get(code, code)
