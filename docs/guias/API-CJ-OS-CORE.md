# Contrato de API — CJ_OS Core para Portal Web 3P

> Documento creado el 2026-08-07 para la sesión de desarrollo web de 3P.  
> Propósito: definir los endpoints que el frontend (`website-3p`) espera del backend CJ_OS Core API (FastAPI).

---

## 1. Principios de arquitectura

- El frontend **nunca** toca archivos originales de SAE ni Excel originales.
- El frontend solo habla con **CJ_OS Core API**.
- La API lee de **PostgreSQL (`cj_assistant`)** y, excepcionalmente, del Excel maestro de San Antonio en **solo lectura**.
- Los datos de SAE se replican a PostgreSQL mediante los scripts de CJ_OS; la web no dispara ETLs.

---

## 2. Autenticación

El portal usa JWT. Todas las rutas bajo `/api/*` requieren el header:

```http
Authorization: Bearer <access_token>
```

### `POST /api/auth/login`

Autentica un usuario del portal.

**Request** (`application/x-www-form-urlencoded`):

```
username=admin
password=********
```

**Response 200**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "admin"
  }
}
```

### `GET /api/me`

Devuelve el usuario autenticado.

**Response 200**:

```json
{
  "id": 1,
  "username": "admin",
  "nombre": "Administrador",
  "rol": "admin"
}
```

---

## 3. Dashboard operativo

### `GET /api/dashboard/resumen`

KPIs para la pantalla de inicio del dashboard.

**Response 200**:

```json
{
  "resumen": {
    "pedidos_vivos": 12,
    "vales_abiertos": 5,
    "productos_bajo_minimo": 8,
    "movimientos_90d": 1420,
    "facturas_pendientes_cobranza": 23
  }
}
```

> Nota: el frontend lee `data.resumen`.

---

## 4. Almacén / Inventario

### `GET /api/almacen/existencias`

Existencias por producto y almacén. Equivalente a la query:

```sql
SELECT
    e.cve_art AS codigo,
    p.descripcion,
    a.cve_alm AS almacen_id,
    a.descripcion AS almacen,
    e.exist AS existencia,
    e.stock_min,
    e.stock_max,
    0 AS comprometido_recibir
FROM sae_existencias e
JOIN sae_productos p ON e.cve_art = p.cve_art
JOIN sae_almacenes a ON e.cve_alm = a.cve_alm
WHERE e.exist > 0
ORDER BY p.descripcion, a.cve_alm;
```

**Query params**:

- `limit` (int, default 50)
- `busqueda` (string, opcional) — filtra por código o descripción

**Response 200**:

```json
{
  "data": [
    {
      "codigo": "ART-001",
      "descripcion": "Descripción del producto",
      "almacen": "01",
      "nombre_almacen": "Almacén Principal",
      "existencia": 120,
      "stock_min": 10,
      "stock_max": 200,
      "comprometido_recibir": 0
    }
  ]
}
```

### `GET /api/almacen/vales`

Material vivo en vales abiertos.

**Query params**:

- `limit` (int, default 50)
- `busqueda` (string, opcional)

**Response 200**:

```json
{
  "data": [
    {
      "folio": "V-0001",
      "entregado_a": "Juan Pérez",
      "fecha_salida": "2026-08-01",
      "codigo": "ART-001",
      "descripcion": "Descripción",
      "cantidad": 5,
      "almacen_origen": "01",
      "estado": "abierto"
    }
  ]
}
```

---

## 5. Ventas

### `GET /api/ventas/pedidos-vivos`

Pedidos abiertos con saldo pendiente (`v_pedidos_vivos`).

**Query params**:

- `limit` (int, default 50)
- `busqueda` (string, opcional)

**Response 200**:

```json
{
  "data": [
    {
      "folio": "P-1234",
      "cliente": "Cliente Ejemplo",
      "fecha": "2026-07-15",
      "importe_total": 125000.00,
      "total_facturado": 50000.00,
      "saldo_pendiente": 75000.00,
      "estado": "Parcial",
      "dias_pendiente": 12
    }
  ]
}
```

### `GET /api/ventas/facturas-cobranza`

Facturas pendientes de cobranza (`v_facturas_cobranza`).

**Query params**:

- `limit` (int, default 50)

**Response 200**:

```json
{
  "data": [
    {
      "folio": "F-5678",
      "cliente": "Cliente Ejemplo",
      "fecha_doc": "2026-07-20",
      "total": 50000.00,
      "estado_cobranza": "Pendiente"
    }
  ]
}
```

### `GET /api/ventas/seguimiento-documental`

Seguimiento pedido → remisión → factura (`v_seguimiento_documental`).

**Query params**:

- `folio_pedido` (string, opcional)
- `limit` (int, default 50)

**Response 200**:

```json
{
  "data": [
    {
      "folio_pedido": "P-1234",
      "fecha_pedido": "2026-07-15",
      "cliente": "Cliente Ejemplo",
      "codigo": "ART-001",
      "descripcion": "Descripción",
      "cantidad_pedido": 10,
      "folio_remision": "R-001",
      "cantidad_remision": 6,
      "folio_factura": "F-5678",
      "cantidad_factura": 6,
      "estatus_linea": "Facturado parcial"
    }
  ]
}
```

---

## 6. Inventario — movimientos

### `GET /api/inventario/movimientos`

Últimos movimientos de inventario (`sae_movimientos_inventario`).

**Query params**:

- `limit` (int, default 50)
- `fecha` (YYYY-MM-DD, opcional)

**Response 200**:

```json
{
  "data": [
    {
      "fecha_doc": "2026-08-07",
      "codigo": "ART-001",
      "almacen": "01",
      "tipo_doc": "Entrada",
      "concepto": "Compra",
      "cantidad": 50,
      "existencia": 120,
      "referencia": "OC-0001"
    }
  ]
}
```

---

## 7. San Antonio — Órdenes de compra

### `GET /api/san-antonio/ordenes`

Lee el Excel maestro `SAN_ANTONIO_SEGUIMIENTO.xlsx` en **solo lectura**.

**Query params**:

- `limit` (int, default 50)
- `busqueda` (string, opcional)

**Response 200**:

```json
{
  "total": 15,
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
      "descripcion": "Descripción",
      "cantidadpedido": 100,
      "preciounitario": 250.00,
      "entregada": 40,
      "saldo": 60,
      "estadolinea": "Parcial"
    }
  ]
}
```

> Si el archivo está abierto en Excel, la API debe devolver un error controlado (por ejemplo, 503) con un mensaje claro.

---

## 8. Variables de entorno del backend

Ver `.env.example` en este repositorio y el documento de arquitectura CJ_OS.

---

## 9. Notas de implementación

- El frontend guarda el token en `localStorage` bajo la clave `cjos_token`.
- Si la API responde `401`, el frontend borra el token y redirige a `/login`.
- Todos los endpoints deben devolver JSON. En caso de error, usar `{ "detail": "mensaje" }`.
- Para desarrollo local sin backend, se puede levantar un mock que responda estas mismas estructuras.
