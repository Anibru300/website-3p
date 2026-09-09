export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    removeToken();
    throw new Error('Sesión expirada.');
  }

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { detail: await response.text() };
  }

  if (!response.ok) {
    const error = new Error(data.detail || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Fichas/documentos públicos de productos
// ---------------------------------------------------------------------------

export async function fetchDocumentosPublicos(marca, codigo) {
  const params = new URLSearchParams({ marca, codigo });
  return apiFetch(`/api/fichas/publicas?${params.toString()}`);
}

export function obtenerPdfFichaUrl(id) {
  return `${API_BASE}/api/fichas/${id}/pdf`;
}

// Abre el PDF en pestaña nueva. Para docs públicos basta la URL directa;
// con JWT también funciona para privados usando fetch + blob.
export async function verPdfFicha(id) {
  const token = getToken();
  const url = obtenerPdfFichaUrl(id);

  if (!token) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true };
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    removeToken();
    throw new Error('Sesión expirada.');
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

export async function descargarPdfFicha(id, nombreArchivo = `ficha-${id}.pdf`) {
  const token = getToken();
  const url = obtenerPdfFichaUrl(id);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    removeToken();
    throw new Error('Sesión expirada.');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status} al descargar el PDF`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

function getSessionId() {
  let sessionId = sessionStorage.getItem('cjos_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('cjos_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceInfo() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  let device_type = 'desktop';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    device_type = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'tablet' : 'mobile';
  }

  let browser = 'Otro';
  if (/Edg\/|Edge\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\/|CriOS\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\/|FxiOS\//i.test(ua)) browser = 'Firefox';
  else if (/Opera\/|OPR\//i.test(ua)) browser = 'Opera';

  let os = 'Otro';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|macOS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return {
    device_type,
    browser,
    os,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    language: navigator.language || 'unknown',
    platform,
  };
}

export function trackEvent(eventType, { path, section, metadata } = {}) {
  const token = getToken();
  const deviceInfo = getDeviceInfo();
  const combinedMetadata = {
    ...deviceInfo,
    ...(metadata || {}),
  };

  const payload = {
    event_type: eventType,
    path: path || window.location.pathname,
    section: section || undefined,
    session_id: getSessionId(),
    metadata: JSON.stringify(combinedMetadata),
    referrer: document.referrer || undefined,
    device_type: deviceInfo.device_type,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    screen_width: deviceInfo.screen_width,
    screen_height: deviceInfo.screen_height,
  };

  fetch(`${API_BASE}/api/analytics/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silenciar errores de analytics para no afectar la experiencia
  });
}
