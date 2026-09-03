import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchExistenciasPorCodigos,
  fetchHistorialVentasMetadata,
  fetchPrecioReferencia,
  fetchProductoFotoBlobUrl,
  fetchVendedoresCotizaciones,
  guardarCotizacion,
  verCotizacionPdf,
  trackEvent,
} from '../utils/api';
import VendedoresManager from '../components/cotizador/VendedoresManager';
import {
  ArrowLeft,
  Calculator,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';

const MONEDAS = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'MXN', label: 'Pesos Mexicanos (MXN)' },
];

const CONDICIONES = [
  'Contado',
  '15 días de crédito',
  '30 días de crédito',
  '60 días de crédito',
  '70 días',
  '90 días de crédito',
];

function formatCurrency(value, moneda = 'USD') {
  if (value == null) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
  }).format(num);
}

function formatNumber(value) {
  if (value == null) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('es-MX').format(num);
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin coincidencias',
  className = '',
  id,
  allowFreeText = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ? String(value) : '');
  const [coords, setCoords] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);

  const computeCoords = () => {
    if (!inputRef.current) return null;
    const rect = inputRef.current.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const minHeight = 120;
    const preferredMaxHeight = 260;

    let placement = 'bottom';
    let maxHeight = Math.min(preferredMaxHeight, Math.max(spaceBelow, minHeight));

    if (spaceBelow < minHeight && spaceAbove > spaceBelow) {
      placement = 'top';
      maxHeight = Math.min(preferredMaxHeight, Math.max(spaceAbove, minHeight));
    }

    return {
      top: placement === 'bottom'
        ? rect.bottom
        : rect.top - maxHeight,
      left: rect.left,
      width: rect.width,
      placement,
      maxHeight,
    };
  };

  const openDropdown = () => {
    setQuery(value ? String(value) : '');
    setHighlightedIndex(-1);
    setCoords(computeCoords());
    setOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery(value ? String(value) : '');
    setCoords(null);
    setHighlightedIndex(-1);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown, value]);

  useEffect(() => {
    function handleScroll() {
      if (open) closeDropdown();
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [closeDropdown, open, value]);

  useEffect(() => {
    if (!open) return;
    function handleResize() {
      setCoords(computeCoords());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemsRef.current[highlightedIndex]) {
      itemsRef.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => String(opt).toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(String(opt));
    setOpen(false);
    setCoords(null);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        openDropdown();
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) {
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      } else if (allowFreeText && query) {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  const displayValue = open ? query : value ? String(value) : '';

  return (
    <div className={`relative ${className}`} ref={wrapperRef} id={id}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setHighlightedIndex(-1);
          if (!open) openDropdown();
          if (allowFreeText) {
            onChange(val);
          } else if (!val) {
            onChange('');
          }
        }}
        onFocus={openDropdown}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red pr-8"
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={() => {
          if (open) {
            closeDropdown();
          } else {
            openDropdown();
            inputRef.current?.focus();
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        tabIndex={-1}
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && coords && (
        <div
          className="fixed z-[100] bg-white border border-gray-200 rounded-xl shadow-lg overflow-auto"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
            maxHeight: coords.maxHeight,
            marginTop: coords.placement === 'bottom' ? '4px' : '0',
            marginBottom: coords.placement === 'top' ? '4px' : '0',
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {allowFreeText ? 'Presiona Enter o Tab para usar este texto' : emptyMessage}
            </div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                key={String(opt)}
                ref={(el) => { itemsRef.current[idx] = el; }}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${
                  String(opt) === String(value) ? 'bg-red-50 text-p3-red font-medium' : 'text-gray-700'
                } ${idx === highlightedIndex ? 'bg-red-100' : ''}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CotizadorPage() {
  const navigateTo = (url) => {
    window.history.pushState({ path: url }, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const { user, logout } = useAuth();

  const [cliente, setCliente] = useState('');
  const [atencion, setAtencion] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [condiciones, setCondiciones] = useState('Contado');
  const [tiempoEntrega, setTiempoEntrega] = useState(
    'De 3-5 días después de su orden de compra y/o existencias en almacén y/o proveedor.'
  );
  const [leyendaEnvio, setLeyendaEnvio] = useState('');
  const [conDescuento, setConDescuento] = useState(false);
  const [conStockLeon, setConStockLeon] = useState(false);
  const [conFotos, setConFotos] = useState(false);
  const [folio, setFolio] = useState('');
  const [lineas, setLineas] = useState([]);

  const [clientesOptions, setClientesOptions] = useState([]);
  const [codigosOptions, setCodigosOptions] = useState([]);
  const [descripcionesMap, setDescripcionesMap] = useState({});
  const [existenciasMap, setExistenciasMap] = useState({});
  const [loadingExistencias, setLoadingExistencias] = useState(false);
  const [loadingPrecio, setLoadingPrecio] = useState({});
  const [fotosMap, setFotosMap] = useState({});
  const [loadingFotos, setLoadingFotos] = useState({});
  const [fotoModal, setFotoModal] = useState({ open: false, url: null, codigo: '' });
  const createdFotoUrlsRef = useRef(new Set());
  const [vendedoresOptions, setVendedoresOptions] = useState([]);
  const [vendedor, setVendedor] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [cotizacionGuardada, setCotizacionGuardada] = useState(null);
  const [error, setError] = useState(null);

  const [editingPrecioId, setEditingPrecioId] = useState(null);
  const [rawPrecio, setRawPrecio] = useState('');

  // Cargar catálogos de clientes y códigos desde historial de ventas
  useEffect(() => {
    fetchHistorialVentasMetadata()
      .then((meta) => {
        setClientesOptions(meta.clientes || []);
        setCodigosOptions(meta.codigos || []);
      })
      .catch(() => {});

    fetchVendedoresCotizaciones()
      .then((res) => {
        const lista = (res.vendedores || []).map((v) => v.nombre || v);
        setVendedoresOptions(lista);
        // Default al usuario logueado si está en la lista
        const nombreUsuario = user?.nombre || '';
        if (nombreUsuario && lista.includes(nombreUsuario)) {
          setVendedor(nombreUsuario);
        } else if (lista.length > 0) {
          setVendedor(lista[0]);
        }
      })
      .catch(() => {});
  }, [user?.nombre]);

  // Precargar descripciones
  useEffect(() => {
    if (codigosOptions.length === 0) return;
    // Cargamos descripciones por lotes para no saturar
    const cargarDescripciones = async () => {
      const map = {};
      const batch = codigosOptions.slice(0, 200); // primeros 200 para rapidez
      await Promise.all(
        batch.map(async (codigo) => {
          try {
            const data = await fetchPrecioReferencia(codigo, '');
            if (data.descripcion) {
              map[codigo] = data.descripcion;
            }
          } catch {
            // ignorar
          }
        })
      );
      setDescripcionesMap(map);
    };
    cargarDescripciones();
  }, [codigosOptions]);

  // Precargar existencias y material en vales para los códigos del historial
  useEffect(() => {
    if (codigosOptions.length === 0) return;
    const cargarExistencias = async () => {
      setLoadingExistencias(true);
      try {
        const res = await fetchExistenciasPorCodigos(codigosOptions.slice(0, 500));
        setExistenciasMap(res.data || {});
      } catch {
        // ignorar
      } finally {
        setLoadingExistencias(false);
      }
    };
    cargarExistencias();
  }, [codigosOptions]);

  // Cargar existencias para códigos que se agregan manualmente en las líneas
  useEffect(() => {
    const codigos = [...new Set(lineas.map((l) => l.codigo).filter(Boolean))];
    if (codigos.length === 0) return;
    const faltantes = codigos.filter((c) => !existenciasMap[c]);
    if (faltantes.length === 0) return;

    const cargarExistenciasLineas = async () => {
      setLoadingExistencias(true);
      try {
        const res = await fetchExistenciasPorCodigos(faltantes);
        setExistenciasMap((prev) => ({ ...prev, ...(res.data || {}) }));
      } catch {
        // ignorar
      } finally {
        setLoadingExistencias(false);
      }
    };
    cargarExistenciasLineas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineas]);

  // Cargar fotos de producto para los códigos seleccionados en las líneas
  useEffect(() => {
    const codigos = [...new Set(lineas.map((l) => l.codigo).filter(Boolean))];
    let cancelled = false;

    setFotosMap((prev) => {
      const next = {};
      for (const c of codigos) {
        if (prev[c]) next[c] = prev[c];
      }
      // Revocar URLs de códigos que ya no están en ninguna línea
      Object.entries(prev).forEach(([c, url]) => {
        if (url && !next[c]) {
          URL.revokeObjectURL(url);
          createdFotoUrlsRef.current.delete(url);
        }
      });
      return next;
    });

    const faltantes = codigos.filter(
      (c) => !fotosMap[c] && !loadingFotos[c]
    );
    if (faltantes.length === 0) return;

    const cargarFotos = async () => {
      setLoadingFotos((prev) => {
        const next = { ...prev };
        for (const c of faltantes) next[c] = true;
        return next;
      });
      const resultados = await Promise.allSettled(
        faltantes.map(async (codigo) => {
          try {
            const url = await fetchProductoFotoBlobUrl(codigo);
            return { codigo, url };
          } catch {
            return { codigo, url: null };
          }
        })
      );
      if (cancelled) {
        resultados.forEach((r) => {
          if (r.status === 'fulfilled' && r.value.url) {
            URL.revokeObjectURL(r.value.url);
          }
        });
        return;
      }
      setFotosMap((prev) => {
        const next = { ...prev };
        for (const r of resultados) {
          if (r.status === 'fulfilled' && r.value.url) {
            next[r.value.codigo] = r.value.url;
            createdFotoUrlsRef.current.add(r.value.url);
          }
        }
        return next;
      });
      setLoadingFotos((prev) => {
        const next = { ...prev };
        for (const c of faltantes) next[c] = false;
        return next;
      });
    };

    cargarFotos();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineas]);

  // Limpiar object URLs de fotos al desmontar el componente
  useEffect(() => {
    const urls = createdFotoUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const agregarLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        id: generateUUID(),
        codigo: '',
        descripcion: '',
        almacen: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento_pct: 0,
        stock_leon: 0,
      },
    ]);
  };

  const eliminarLinea = (id) => {
    setLineas((prev) => {
      const linea = prev.find((l) => l.id === id);
      if (linea?.codigo) {
        setFotosMap((fotosPrev) => {
          const url = fotosPrev[linea.codigo];
          if (url) {
            URL.revokeObjectURL(url);
            createdFotoUrlsRef.current.delete(url);
          }
          const next = { ...fotosPrev };
          delete next[linea.codigo];
          return next;
        });
      }
      return prev.filter((l) => l.id !== id);
    });
    if (codigoTimeoutsRef.current[id]) {
      clearTimeout(codigoTimeoutsRef.current[id]);
      delete codigoTimeoutsRef.current[id];
    }
    setLoadingPrecio((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setLoadingFotos((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const generarFolio = useCallback((clienteValue) => {
    const clienteLimpio = String(clienteValue || cliente).trim().toUpperCase().split(' ')[0];
    if (!clienteLimpio) return '';
    const hoy = new Date();
    const yy = String(hoy.getFullYear()).slice(-2);
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${clienteLimpio} ${yy}${mm}${dd}`;
  }, [cliente]);

  // Actualizar folio cuando cambia el cliente (solo si el usuario no lo editó manualmente)
  useEffect(() => {
    if (!folio || folio === generarFolio(cliente)) {
      setFolio(generarFolio(cliente));
    }
  }, [cliente, folio, generarFolio]);

  const actualizarLinea = (id, campo, valor) => {
    const camposNumericos = ['cantidad', 'precio_unitario', 'descuento_pct', 'stock_leon'];
    let valorNormalizado = valor;
    if (camposNumericos.includes(campo)) {
      const num = Number(valor);
      valorNormalizado = Number.isNaN(num) ? 0 : num;
      if (campo === 'descuento_pct') {
        valorNormalizado = Math.max(0, Math.min(100, valorNormalizado));
      }
    }
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return { ...l, [campo]: valorNormalizado };
      })
    );
  };

  const cargarPrecioReferencia = useCallback(
    async (lineaId, codigo) => {
      if (!codigo) return;
      setLoadingPrecio((prev) => ({ ...prev, [lineaId]: true }));
      try {
        const data = await fetchPrecioReferencia(codigo, cliente);
        setLineas((prev) =>
          prev.map((l) => {
            if (l.id !== lineaId) return l;
            return {
              ...l,
              descripcion: data.descripcion || l.descripcion,
              almacen: data.almacen || l.almacen,
              precio_unitario: data.precio_unitario || l.precio_unitario,
            };
          })
        );
      } catch {
        // ignorar
      } finally {
        setLoadingPrecio((prev) => ({ ...prev, [lineaId]: false }));
      }
    },
    [cliente]
  );

  const codigoTimeoutsRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(codigoTimeoutsRef.current).forEach((t) => clearTimeout(t));
      codigoTimeoutsRef.current = {};
    };
  }, []);

  const handleCodigoChange = (lineaId, codigo) => {
    const codigoLimpio = String(codigo || '').trim();
    actualizarLinea(lineaId, 'codigo', codigoLimpio);
    if (descripcionesMap[codigoLimpio]) {
      actualizarLinea(lineaId, 'descripcion', descripcionesMap[codigoLimpio]);
    }
    // debounce para precio
    if (codigoTimeoutsRef.current[lineaId]) {
      clearTimeout(codigoTimeoutsRef.current[lineaId]);
    }
    codigoTimeoutsRef.current[lineaId] = setTimeout(() => {
      cargarPrecioReferencia(lineaId, codigoLimpio);
      delete codigoTimeoutsRef.current[lineaId];
    }, 400);
  };

  // Al desactivar descuentos, resetear porcentajes para que UI y backend coincidan
  useEffect(() => {
    if (!conDescuento) {
      setLineas((prev) =>
        prev.map((l) => ({ ...l, descuento_pct: 0 }))
      );
    }
  }, [conDescuento]);

  const lineasCalculadas = useMemo(() => {
    return lineas.map((l) => {
      const descuentoAplicable = conDescuento ? (l.descuento_pct || 0) : 0;
      const precioConDesc = l.precio_unitario * (1 - descuentoAplicable / 100);
      const total = (l.cantidad || 0) * precioConDesc;
      return { ...l, precioConDesc, total };
    });
  }, [lineas, conDescuento]);

  const totales = useMemo(() => {
    const subtotal = lineasCalculadas.reduce((sum, l) => sum + (l.total || 0), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }, [lineasCalculadas]);

  const guardar = async () => {
    if (!cliente.trim()) {
      setError('Falta el nombre del cliente.');
      return;
    }
    if (lineas.length === 0) {
      setError('Agrega al menos una línea de producto.');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      const data = {
        folio,
        cliente,
        atencion,
        moneda,
        condiciones,
        tiempo_entrega: tiempoEntrega,
        leyenda_envio: leyendaEnvio,
        con_descuento: conDescuento,
        con_stock_leon: conStockLeon,
        con_fotos: conFotos,
        vendedor,
        lineas: lineas.map((l) => ({
          codigo: l.codigo,
          descripcion: l.descripcion,
          almacen: l.almacen,
          cantidad: Number(l.cantidad) || 0,
          precio_unitario: Number(l.precio_unitario) || 0,
          descuento_pct: conDescuento ? Number(l.descuento_pct) || 0 : 0,
          stock_leon: Number(l.stock_leon) || 0,
        })),
      };
      console.log('[CotizadorPage] Enviando payload:', data);
      const result = await guardarCotizacion(data);
      console.log('[CotizadorPage] Guardado exitoso:', result);
      trackEvent('cotizacion_guardar', {
        path: '/cotizador',
        metadata: {
          cotizacion_id: result.id,
          cliente: data.cliente,
          moneda: data.moneda,
          total_lineas: data.lineas.length,
          con_descuento: conDescuento,
          con_fotos: conFotos,
        },
      });
      setCotizacionGuardada(result);
      // Abrir PDF automáticamente en una nueva pestaña al guardar
      try {
        await verCotizacionPdf(result.id);
        trackEvent('cotizacion_pdf', {
          path: '/cotizador',
          metadata: { cotizacion_id: result.id, origen: 'auto_guardar' },
        });
      } catch (pdfErr) {
        console.error('[CotizadorPage] Error al abrir PDF tras guardar:', pdfErr);
        setError('Cotización guardada, pero no se pudo abrir el PDF automáticamente.');
      }
    } catch (err) {
      console.error('[CotizadorPage] Error al guardar:', err);
      setError(err.message || 'Ocurrió un error al guardar la cotización.');
    } finally {
      setGuardando(false);
    }
  };

  const [abriendoPdf, setAbriendoPdf] = useState(false);

  const abrirPdf = async () => {
    if (!cotizacionGuardada?.id) return;
    setAbriendoPdf(true);
    try {
      await verCotizacionPdf(cotizacionGuardada.id);
      trackEvent('cotizacion_pdf', {
        path: '/cotizador',
        metadata: { cotizacion_id: cotizacionGuardada.id, origen: 'boton_ver_pdf' },
      });
    } catch (err) {
      console.error('[CotizadorPage] Error al abrir PDF:', err);
      setError(err.message || 'Ocurrió un error al abrir el PDF.');
    } finally {
      setAbriendoPdf(false);
    }
  };

  useEffect(() => {
    if (lineas.length === 0) agregarLinea();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="w-full px-4 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Regresar al dashboard"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <Calculator className="text-p3-red" size={24} />
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Cotizador 3P</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-600">
                {user?.nombre || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 lg:px-8 py-6">
        <div className="mx-auto max-w-[95%] space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {cotizacionGuardada && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Cotización guardada: {cotizacionGuardada.folio}</p>
                <p className="text-sm">Total: {formatCurrency(cotizacionGuardada.total, moneda)}</p>
              </div>
              <button
                onClick={abrirPdf}
                disabled={abriendoPdf}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Eye size={18} />
                {abriendoPdf ? 'Abriendo PDF...' : 'Ver PDF'}
              </button>
            </div>
          )}

          {/* Administrar vendedores / firmas */}
          <VendedoresManager />

          {/* Datos generales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-p3-red" />
              Datos generales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folio</label>
                <input
                  type="text"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                  placeholder="Se genera automáticamente"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se genera automáticamente al seleccionar cliente. Puedes editarlo.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <SearchableSelect
                  value={cliente}
                  onChange={setCliente}
                  options={clientesOptions}
                  placeholder="Buscar cliente..."
                  emptyMessage="No se encontraron clientes"
                  allowFreeText
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atención a</label>
                <input
                  type="text"
                  value={atencion}
                  onChange={(e) => setAtencion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                  placeholder="Persona de contacto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <SearchableSelect
                  value={moneda}
                  onChange={setMoneda}
                  options={MONEDAS.map((m) => m.value)}
                  placeholder="Buscar moneda..."
                  emptyMessage="No se encontraron monedas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones de pago
                </label>
                <SearchableSelect
                  value={condiciones}
                  onChange={setCondiciones}
                  options={CONDICIONES}
                  placeholder="Buscar condición..."
                  emptyMessage="No se encontraron condiciones"
                  allowFreeText
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de entrega
                </label>
                <input
                  type="text"
                  value={tiempoEntrega}
                  onChange={(e) => setTiempoEntrega(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendedor / Firma
                </label>
                <input
                  type="text"
                  list="vendedores-list"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                  placeholder="Nombre del vendedor o firma"
                />
                <datalist id="vendedores-list">
                  {vendedoresOptions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leyenda de envío / entrega
                </label>
                <input
                  type="text"
                  value={leyendaEnvio}
                  onChange={(e) => setLeyendaEnvio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                  placeholder="Ej. LAB, entrega en domicilio, etc."
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => setConDescuento((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    conDescuento
                      ? 'bg-p3-red text-white border-p3-red'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {conDescuento ? 'Con descuento' : 'Sin descuento'}
                </button>
                <button
                  type="button"
                  onClick={() => setConStockLeon((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    conStockLeon
                      ? 'bg-p3-red text-white border-p3-red'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {conStockLeon ? 'Con stock en León' : 'Sin stock en León'}
                </button>
                <button
                  type="button"
                  onClick={() => setConFotos((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    conFotos
                      ? 'bg-p3-red text-white border-p3-red'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {conFotos ? 'Con fotos en cotización' : 'Sin fotos en cotización'}
                </button>
              </div>
            </div>
          </div>

          {/* Líneas de producto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Package size={18} className="text-p3-red" />
                Productos
              </h2>
              <button
                onClick={agregarLinea}
                className="flex items-center gap-2 px-3 py-1.5 bg-p3-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Agregar producto
              </button>
            </div>

            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <div className="min-w-[1400px] px-5 sm:px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-2 py-2 text-center font-medium w-20">Foto</th>
                      <th className="px-2 py-2 text-left font-medium w-48">Código</th>
                      <th className="px-2 py-2 text-left font-medium min-w-[360px]">Descripción</th>
                      <th className="px-2 py-2 text-left font-medium w-32">Almacén</th>
                      <th className="px-2 py-2 text-right font-medium w-24">Existencia</th>
                      <th className="px-2 py-2 text-right font-medium w-24">En vales</th>
                      <th className="px-2 py-2 text-right font-medium w-24">Cantidad</th>
                      <th className="px-2 py-2 text-right font-medium w-32">P. Unitario</th>
                      {conDescuento && (
                        <th className="px-2 py-2 text-right font-medium w-24">Desc %</th>
                      )}
                      {conStockLeon && (
                        <th className="px-2 py-2 text-center font-medium w-28">Stock León</th>
                      )}
                      <th className="px-2 py-2 text-right font-medium w-32">Total</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineasCalculadas.map((l) => (
                      <tr key={l.id} className="border-t border-gray-100">
                        <td className="px-2 py-2 align-top text-center">
                          {loadingFotos[l.codigo] ? (
                            <div className="w-10 h-10 mx-auto flex items-center justify-center">
                              <div className="w-5 h-5 border border-p3-red border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : fotosMap[l.codigo] ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFotoModal({
                                  open: true,
                                  url: fotosMap[l.codigo],
                                  codigo: l.codigo,
                                })
                              }
                              className="w-12 h-12 mx-auto rounded border border-gray-200 overflow-hidden hover:border-p3-red focus:outline-none focus:ring-2 focus:ring-p3-red"
                              title={`Ver foto de ${l.codigo}`}
                            >
                              <img
                                src={fotosMap[l.codigo]}
                                alt={l.codigo}
                                className="w-full h-full object-contain"
                              />
                            </button>
                          ) : (
                            <div
                              className="w-10 h-10 mx-auto flex items-center justify-center text-gray-300"
                              title="Sin foto disponible"
                            >
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="relative">
                            <SearchableSelect
                              value={l.codigo}
                              onChange={(val) => handleCodigoChange(l.id, val)}
                              options={codigosOptions}
                              placeholder="Buscar código..."
                              emptyMessage="No se encontraron códigos"
                              className="text-xs"
                              allowFreeText
                            />
                            {loadingPrecio[l.id] && (
                              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 border border-p3-red border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top min-w-[360px]">
                          <input
                            type="text"
                            value={l.descripcion}
                            onChange={(e) => actualizarLinea(l.id, 'descripcion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-sm"
                            placeholder="Descripción"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="text"
                            value={l.almacen}
                            onChange={(e) => actualizarLinea(l.id, 'almacen', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs"
                            placeholder="Almacén"
                          />
                        </td>
                        <td className="px-2 py-2 align-top text-right">
                          <span className="text-xs text-gray-700">
                            {loadingExistencias && !existenciasMap[l.codigo]
                              ? '...'
                              : formatNumber((existenciasMap[l.codigo]?.existencia_total ?? 0))}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top text-right">
                          <span className="text-xs text-gray-700">
                            {loadingExistencias && !existenciasMap[l.codigo]
                              ? '...'
                              : formatNumber((existenciasMap[l.codigo]?.material_en_vales ?? 0))}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={l.cantidad}
                            onChange={(e) => actualizarLinea(l.id, 'cantidad', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs text-right"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          {editingPrecioId === l.id ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={rawPrecio}
                              autoFocus
                              onChange={(e) => setRawPrecio(e.target.value)}
                              onBlur={() => {
                                actualizarLinea(l.id, 'precio_unitario', rawPrecio);
                                setEditingPrecioId(null);
                                setRawPrecio('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  actualizarLinea(l.id, 'precio_unitario', rawPrecio);
                                  setEditingPrecioId(null);
                                  setRawPrecio('');
                                }
                              }}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs text-right"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPrecioId(l.id);
                                setRawPrecio(String(l.precio_unitario ?? ''));
                              }}
                              className="w-full px-2 py-1.5 text-xs text-right bg-transparent hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                            >
                              {formatCurrency(l.precio_unitario, moneda)}
                            </button>
                          )}
                        </td>
                        {conDescuento && (
                          <td className="px-2 py-2 align-top">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={l.descuento_pct}
                              onChange={(e) => actualizarLinea(l.id, 'descuento_pct', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs text-right"
                            />
                          </td>
                        )}
                        {conStockLeon && (
                          <td className="px-2 py-2 align-top">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={l.stock_leon}
                              onChange={(e) => actualizarLinea(l.id, 'stock_leon', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs text-right"
                            />
                          </td>
                        )}
                        <td className="px-2 py-2 align-top text-right font-medium text-gray-700">
                          {formatCurrency(l.total, moneda)}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <button
                            onClick={() => eliminarLinea(l.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar línea"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {lineas.length >= 4 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                Si agregas más productos o descripciones muy largas, el PDF podría exportarse en
                más de una hoja.
              </div>
            )}

            {/* Totales */}
            <div className="mt-6 flex flex-col items-end gap-2">
              <div className="flex justify-between w-full sm:w-72 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(totales.subtotal, moneda)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-72 text-sm">
                <span className="text-gray-600">IVA 16%:</span>
                <span className="font-medium">{formatCurrency(totales.iva, moneda)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-72 text-lg font-bold text-gray-800 border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(totales.total, moneda)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={guardar}
              disabled={guardando}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-p3-red text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {guardando ? 'Guardando...' : 'Guardar cotización'}
            </button>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-500">
            * El precio de referencia se carga automáticamente del historial de ventas (último precio
            facturado a este cliente, o el último precio general si no aplica). El folio se genera
            automáticamente al estilo del Excel: CLIENTE + YYMMDD.
          </p>
        </div>
      </main>

      {/* Modal de foto de producto */}
      {fotoModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setFotoModal({ open: false, url: null, codigo: '' })}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFotoModal({ open: false, url: null, codigo: '' })}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-700 hover:text-p3-red shadow-sm z-10"
            >
              <X size={20} />
            </button>
            <img
              src={fotoModal.url}
              alt={fotoModal.codigo}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="text-center text-sm text-gray-700 py-2 font-medium bg-white">
              {fotoModal.codigo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
