#!/usr/bin/env python3
"""
Stub local de CJ_OS Core API para desarrollo del portal 3P.

No reemplaza al backend real. Solo devuelve datos de ejemplo con la
estructura esperada por src/utils/api.js para poder probar el dashboard.

Uso:
    python scripts/api-stub/server.py

Por defecto corre en http://localhost:8000
Configura en el frontend:
    VITE_API_BASE_URL=http://localhost:8000
"""

import json
import re
import secrets
import sys
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

PORT = 8000
VALID_USERNAME = "admin"
VALID_PASSWORD = "admin123"  # Solo para pruebas locales


def json_response(handler, status, data):
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode("utf-8"))


def parse_body(handler):
    content_length = int(handler.headers.get("Content-Length", 0))
    if content_length == 0:
        return {}
    body = handler.rfile.read(content_length).decode("utf-8")
    content_type = handler.headers.get("Content-Type", "")
    if "application/x-www-form-urlencoded" in content_type:
        return {k: v[0] if len(v) == 1 else v for k, v in parse_qs(body).items()}
    if "application/json" in content_type:
        return json.loads(body)
    return {"raw": body}


def generate_token():
    return secrets.token_urlsafe(32)


def check_auth(handler):
    auth = handler.headers.get("Authorization", "")
    match = re.match(r"Bearer\s+(.+)", auth)
    if not match:
        return None
    return match.group(1)


class StubHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().isoformat()}] {format % args}")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        token = check_auth(self)

        if path == "/api/me":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "id": 1,
                "username": "admin",
                "nombre": "Administrador",
                "rol": "admin"
            })

        if path == "/api/dashboard/resumen":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "resumen": {
                    "pedidos_vivos": 12,
                    "vales_abiertos": 5,
                    "productos_bajo_minimo": 8,
                    "movimientos_90d": 1420,
                    "facturas_pendientes_cobranza": 23
                }
            })

        if path == "/api/almacen/existencias":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "data": [
                    {
                        "codigo": "ART-001",
                        "descripcion": "Motor de ventilador 36\"",
                        "almacen": "01",
                        "nombre_almacen": "Almacén Principal",
                        "existencia": 120,
                        "stock_min": 10,
                        "stock_max": 200,
                        "comprometido_recibir": 15
                    },
                    {
                        "codigo": "ART-002",
                        "descripcion": "Banda transportadora 10m",
                        "almacen": "02",
                        "nombre_almacen": "Almacén Norte",
                        "existencia": 8,
                        "stock_min": 20,
                        "stock_max": 100,
                        "comprometido_recibir": 0
                    }
                ]
            })

        if path == "/api/almacen/vales":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "data": [
                    {
                        "folio": "V-0001",
                        "entregado_a": "Juan Pérez",
                        "fecha_salida": "2026-08-01",
                        "codigo": "ART-001",
                        "descripcion": "Motor de ventilador 36\"",
                        "cantidad": 5,
                        "almacen_origen": "01",
                        "estado": "abierto"
                    }
                ]
            })

        if path == "/api/ventas/pedidos-vivos":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "data": [
                    {
                        "folio": "P-1234",
                        "cliente": "Granja Avícola del Centro",
                        "fecha": "2026-07-15",
                        "importe_total": 125000.00,
                        "total_facturado": 50000.00,
                        "saldo_pendiente": 75000.00,
                        "estado": "Parcial",
                        "dias_pendiente": 12
                    }
                ]
            })

        if path == "/api/ventas/facturas-cobranza":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "data": [
                    {
                        "folio": "F-5678",
                        "cliente": "Granja Avícola del Centro",
                        "fecha_doc": "2026-07-20",
                        "total": 50000.00,
                        "estado_cobranza": "Pendiente"
                    }
                ]
            })

        if path == "/api/inventario/movimientos":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "data": [
                    {
                        "fecha_doc": datetime.now().strftime("%Y-%m-%d"),
                        "codigo": "ART-001",
                        "almacen": "01",
                        "tipo_doc": "Entrada",
                        "concepto": "Compra",
                        "cantidad": 50,
                        "existencia": 120,
                        "referencia": "OC-0001"
                    }
                ]
            })

        if path == "/api/san-antonio/ordenes":
            if not token:
                return json_response(self, 401, {"detail": "No autorizado"})
            return json_response(self, 200, {
                "total": 1,
                "cabeceras": [
                    {
                        "folio": "OC-0001",
                        "nopedido": "PED-001",
                        "fechaoc": "2026-06-01",
                        "moneda": "USD",
                        "condicionespago": "30 días",
                        "totaloc": 25000.00,
                        "estadooc": "Abierta",
                        "cargadaportal": "Sí"
                    }
                ],
                "partidas": [
                    {
                        "folio": "OC-0001",
                        "posicion": 1,
                        "codigo": "ART-001",
                        "descripcion": "Motor de ventilador 36\"",
                        "cantidadpedido": 100,
                        "preciounitario": 250.00,
                        "entregada": 40,
                        "saldo": 60,
                        "estadolinea": "Parcial"
                    }
                ]
            })

        return json_response(self, 404, {"detail": "Ruta no encontrada"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/auth/login":
            body = parse_body(self)
            username = body.get("username", "")
            password = body.get("password", "")
            if username == VALID_USERNAME and password == VALID_PASSWORD:
                return json_response(self, 200, {
                    "access_token": generate_token(),
                    "token_type": "bearer",
                    "user": {
                        "id": 1,
                        "username": "admin",
                        "nombre": "Administrador",
                        "rol": "admin"
                    }
                })
            return json_response(self, 401, {"detail": "Credenciales incorrectas"})

        return json_response(self, 404, {"detail": "Ruta no encontrada"})


def run():
    server = HTTPServer(("", PORT), StubHandler)
    print(f"CJ_OS Core API stub corriendo en http://localhost:{PORT}")
    print(f"Usuario de prueba: {VALID_USERNAME} / {VALID_PASSWORD}")
    print("Presiona Ctrl+C para detener.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        sys.exit(0)


if __name__ == "__main__":
    run()
