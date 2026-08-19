import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  descargarCotizacionPdf,
  fetchHistorialVentasMetadata,
  fetchPrecioReferencia,
  fetchVendedoresCotizaciones,
  guardarCotizacion,
} from '../utils/api';
import {
  ArrowLeft,
  Calculator,
  Download,
  Package,
  Plus,
  Save,
  Trash2,
  User,
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

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin coincidencias',
  className = '',
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const updateCoords = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (open) setOpen(false);
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery(value ? String(value) : '');
      setCoords(null);
    } else {
      updateCoords();
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function handleResize() {
      updateCoords();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => String(opt).toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(String(opt));
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const openDropdown = () => {
    setQuery(value ? String(value) : '');
    updateCoords();
    setOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef} id={id}>
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value ? String(value) : ''}
        onChange={(e) => {
          setQuery(e.target.value);
          openDropdown();
          if (!e.target.value) {
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
          setOpen((v) => {
            const next = !v;
            if (next) {
              setQuery(value ? String(value) : '');
              updateCoords();
              inputRef.current?.focus();
            }
            return next;
          });
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
          className="fixed z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">{emptyMessage}</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={String(opt)}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${
                  String(opt) === String(value) ? 'bg-red-50 text-p3-red font-medium' : 'text-gray-700'
                }`}
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
  const [folio, setFolio] = useState('');
  const [lineas, setLineas] = useState([]);

  const [clientesOptions, setClientesOptions] = useState([]);
  const [codigosOptions, setCodigosOptions] = useState([]);
  const [descripcionesMap, setDescripcionesMap] = useState({});
  const [loadingPrecio, setLoadingPrecio] = useState({});
  const [vendedoresOptions, setVendedoresOptions] = useState([]);
  const [vendedor, setVendedor] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [cotizacionGuardada, setCotizacionGuardada] = useState(null);
  const [error, setError] = useState(null);

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
        const lista = res.vendedores || [];
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
  }, []);

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

  const agregarLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
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
    setLineas((prev) => prev.filter((l) => l.id !== id));
  };

  const generarFolio = useCallback((clienteValue) => {
    const clienteLimpio = String(clienteValue || cliente).trim().toUpperCase();
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
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return { ...l, [campo]: valor };
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

  const handleCodigoChange = (lineaId, codigo) => {
    actualizarLinea(lineaId, 'codigo', codigo);
    if (descripcionesMap[codigo]) {
      actualizarLinea(lineaId, 'descripcion', descripcionesMap[codigo]);
    }
    // debounce para precio
    const t = setTimeout(() => {
      cargarPrecioReferencia(lineaId, codigo);
    }, 300);
    return () => clearTimeout(t);
  };

  const lineasCalculadas = useMemo(() => {
    return lineas.map((l) => {
      const precioConDesc = l.precio_unitario * (1 - (l.descuento_pct || 0) / 100);
      const total = (l.cantidad || 0) * precioConDesc;
      return { ...l, precioConDesc, total };
    });
  }, [lineas]);

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
      setCotizacionGuardada(result);
    } catch (err) {
      console.error('[CotizadorPage] Error al guardar:', err);
      setError(err.message || 'Ocurrió un error al guardar la cotización.');
    } finally {
      setGuardando(false);
    }
  };

  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const descargarPdf = async () => {
    if (!cotizacionGuardada?.id) return;
    setDescargandoPdf(true);
    try {
      const filename = `${cotizacionGuardada.folio || `cotizacion-${cotizacionGuardada.id}`}.pdf`;
      await descargarCotizacionPdf(cotizacionGuardada.id, filename);
    } catch (err) {
      console.error('[CotizadorPage] Error al descargar PDF:', err);
      setError(err.message || 'Ocurrió un error al descargar el PDF.');
    } finally {
      setDescargandoPdf(false);
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
                onClick={() => (window.location.href = '/dashboard')}
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
        <div className="mx-auto max-w-6xl space-y-6">
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
                onClick={descargarPdf}
                disabled={descargandoPdf}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Download size={18} />
                {descargandoPdf ? 'Preparando PDF...' : 'Descargar PDF'}
              </button>
            </div>
          )}

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
                <SearchableSelect
                  value={vendedor}
                  onChange={setVendedor}
                  options={vendedoresOptions}
                  placeholder="Buscar vendedor..."
                  emptyMessage="No se encontraron vendedores"
                />
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
              <div className="min-w-[900px] px-5 sm:px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-2 py-2 text-left font-medium">Código</th>
                      <th className="px-2 py-2 text-left font-medium">Descripción</th>
                      <th className="px-2 py-2 text-left font-medium">Almacén</th>
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
                        <td className="px-2 py-2 align-top">
                          <div className="relative">
                            <SearchableSelect
                              value={l.codigo}
                              onChange={(val) => handleCodigoChange(l.id, val)}
                              options={codigosOptions}
                              placeholder="Buscar código..."
                              emptyMessage="No se encontraron códigos"
                              className="text-xs"
                            />
                            {loadingPrecio[l.id] && (
                              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 border border-p3-red border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="text"
                            value={l.descripcion}
                            onChange={(e) => actualizarLinea(l.id, 'descripcion', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs"
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
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.precio_unitario}
                            onChange={(e) => actualizarLinea(l.id, 'precio_unitario', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red text-xs text-right"
                          />
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
    </div>
  );
}
