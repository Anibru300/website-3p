const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('cjos_token');
}

export function setToken(token) {
  localStorage.setItem('cjos_token', token);
}

export function removeToken() {
  localStorage.removeItem('cjos_token');
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error('[apiFetch] 401 en', endpoint, 'status:', response.status, 'headers:', Object.fromEntries(response.headers.entries()));
    removeToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { detail: await response.text() };
  }

  if (!response.ok) {
    console.error('[apiFetch] Error', response.status, 'en', endpoint, 'respuesta:', data);
    throw new Error(data.detail || `Error ${response.status}`);
  }

  return data;
}

export async function loginUser(username, password) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
}

export async function fetchMe() {
  return apiFetch('/api/me');
}

export async function fetchDashboardResumen() {
  return apiFetch('/api/dashboard/resumen');
}

export async function fetchExistencias(query = '') {
  return apiFetch(`/api/almacen/existencias?${query}`);
}

export async function fetchExistenciasPorCodigos(codigos = []) {
  if (!codigos || codigos.length === 0) return { data: {} };
  return apiFetch('/api/almacen/existencias-por-codigos', {
    method: 'POST',
    body: JSON.stringify({ codigos }),
  });
}

export async function fetchSubalmacenes() {
  return apiFetch('/api/almacen/subalmacenes');
}

export async function fetchVales(query = '') {
  return apiFetch(`/api/almacen/vales?${query}`);
}

export async function fetchPedidosVivos(query = '') {
  return apiFetch(`/api/ventas/pedidos-vivos?${query}`);
}

export async function fetchHistorialVentas(query = '') {
  return apiFetch(`/api/ventas/historial?${query}`);
}

export async function fetchHistorialVentasMetadata() {
  return apiFetch('/api/ventas/historial/metadata');
}

export async function exportarHistorialVentas(filtros, filename = 'historial_ventas.xlsx') {
  const token = getToken();
  const url = `${API_BASE}/api/ventas/historial/exportar`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(filtros),
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {
      detail = await response.text();
    }
    throw new Error(detail);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export async function fetchPrecioReferencia(codigo, cliente = '') {
  const params = new URLSearchParams({ codigo });
  if (cliente) params.set('cliente', cliente);
  return apiFetch(`/api/cotizaciones/precio-referencia?${params.toString()}`);
}

export async function fetchVendedoresCotizaciones() {
  return apiFetch('/api/cotizaciones/vendedores');
}

export async function guardarCotizacion(data) {
  return apiFetch('/api/cotizaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listarCotizaciones(query = '') {
  return apiFetch(`/api/cotizaciones?${query}`);
}

export function obtenerCotizacionPdfUrl(id) {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/cotizaciones/${id}/pdf`;
}

export async function descargarCotizacionPdf(id, filename = `cotizacion-${id}.pdf`) {
  const token = getToken();
  const url = obtenerCotizacionPdfUrl(id);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status} al descargar el PDF`);
  }

  const blob = await response.blob();

  // Fallback: descarga normal
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
  return { success: true, method: 'download' };
}


export async function verCotizacionPdf(id) {
  const token = getToken();
  const url = obtenerCotizacionPdfUrl(id);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status} al abrir el PDF`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  // El objectUrl se libera después de unos segundos para dar tiempo a que el visor cargue
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  return { success: true };
}

export async function fetchFacturasCobranza(query = '') {
  return apiFetch(`/api/ventas/facturas-cobranza?${query}`);
}

export async function fetchSeguimientoDocumental(query = '') {
  return apiFetch(`/api/ventas/seguimiento-documental?${query}`);
}

export async function fetchMovimientosInventario(query = '') {
  return apiFetch(`/api/inventario/movimientos?${query}`);
}

export async function guardarSnapshotValorInventario() {
  return apiFetch('/api/inventario/valor-historico/snapshot', {
    method: 'POST',
  });
}

export async function fetchHistorialValorInventario({ fecha_desde, fecha_hasta } = {}) {
  const params = new URLSearchParams();
  if (fecha_desde) params.set('fecha_desde', fecha_desde);
  if (fecha_hasta) params.set('fecha_hasta', fecha_hasta);
  const query = params.toString();
  return apiFetch(`/api/inventario/valor-historico${query ? `?${query}` : ''}`);
}

export async function fetchSanAntonioOrdenes(query = '') {
  return apiFetch(`/api/san-antonio/ordenes?${query}`);
}

export async function fetchCrmResumen() {
  return apiFetch('/api/admin/crm/resumen');
}

export async function fetchCrmEntidades(query = '') {
  return apiFetch(`/api/admin/crm/entidades?${query}`);
}

export async function crearEntidadCrm(data) {
  return apiFetch('/api/admin/crm/entidades', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCrmEntidad(id) {
  return apiFetch(`/api/admin/crm/entidades/${id}`);
}

export async function crearContactoCrm(entidadId, data) {
  return apiFetch(`/api/admin/crm/entidades/${entidadId}/contactos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function crearUbicacionCrm(entidadId, data) {
  return apiFetch(`/api/admin/crm/entidades/${entidadId}/ubicaciones`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function crearPortalCrm(entidadId, data) {
  return apiFetch(`/api/admin/crm/entidades/${entidadId}/portales`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getProductoFotoUrl(codigo) {
  return `${API_BASE}/api/almacen/foto-producto/${encodeURIComponent(codigo)}`;
}

export async function fetchProductoFotoBlobUrl(codigo) {
  if (!codigo || String(codigo).trim() === '') {
    return null;
  }

  const url = getProductoFotoUrl(codigo);
  const token = getToken();

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
  }

  // 204 = sin foto registrada; 404 = endpoint/producto no encontrado.
  // En ambos casos tratamos como "sin foto" para no mostrar error al usuario.
  if (response.status === 204 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
