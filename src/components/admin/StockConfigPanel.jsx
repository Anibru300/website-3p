import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

/**
 * Panel "Stock": configuración del stock mínimo por producto.
 *
 * Muestra todos los productos de SAE con su existencia (total o por almacén
 * filtrado), el mínimo de SAE y un mínimo personalizado editable. El mínimo
 * efectivo (personalizado > SAE > 0) es el que usan las alertas del dashboard
 * y del panel de alertas.
 */

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'configurados', label: 'Configurados' },
  { id: 'sin_minimo', label: 'Sin mínimo' },
  { id: 'bajo_minimo', label: 'Bajo mínimo' },
];

const ORIGEN_LABEL = {
  manual: { texto: 'Manual', clases: 'text-violet-700 bg-violet-50 border-violet-200' },
  sae: { texto: 'SAE', clases: 'text-blue-700 bg-blue-50 border-blue-200' },
  ninguno: { texto: 'Sin mínimo', clases: 'text-gray-500 bg-gray-50 border-gray-200' },
};

const LIMITE = 50;

export default function StockConfigPanel() {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [almacenes, setAlmacenes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [cveAlm, setCveAlm] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState('');
  const [borrando, setBorrando] = useState('');

  // Input inline por producto: { [codigo]: string }
  const [minimos, setMinimos] = useState({});

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const params = new URLSearchParams({ filtro, limit: LIMITE, offset });
      if (busquedaAplicada) params.set('busqueda', busquedaAplicada);
      if (cveAlm) params.set('cve_alm', cveAlm);
      const data = await apiFetch(`/api/admin/stock-config/catalogo?${params}`);
      setProductos(data.productos);
      setTotal(data.total);
      setMinimos(
        Object.fromEntries(
          data.productos.map((p) => [
            p.codigo,
            p.stock_min_custom != null ? String(p.stock_min_custom) : '',
          ])
        )
      );
    } catch (e) {
      setError(e.message || 'No se pudo cargar el catálogo');
    } finally {
      setCargando(false);
    }
  }, [busquedaAplicada, cveAlm, filtro, offset]);

  useEffect(() => {
    apiFetch('/api/almacen/subalmacenes')
      .then((data) => setAlmacenes(data.data || []))
      .catch(() => setAlmacenes([]));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const aplicarBusqueda = (e) => {
    e.preventDefault();
    setOffset(0);
    setBusquedaAplicada(busqueda.trim());
  };

  const cambiarFiltro = (nuevo) => {
    setOffset(0);
    setFiltro(nuevo);
  };

  const cambiarAlmacen = (nuevo) => {
    setOffset(0);
    setCveAlm(nuevo);
  };

  const guardar = async (codigo) => {
    const valor = minimos[codigo]?.trim();
    setGuardando(codigo);
    setError('');
    try {
      if (valor === '') {
        await apiFetch(`/api/admin/stock-config/${encodeURIComponent(codigo)}`, {
          method: 'DELETE',
        });
      } else {
        const num = Number(valor);
        if (Number.isNaN(num) || num < 0) {
          setError('El mínimo debe ser un número mayor o igual a 0');
          return;
        }
        await apiFetch('/api/admin/stock-config', {
          method: 'PUT',
          body: JSON.stringify({ codigo, stock_min: num }),
        });
      }
      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo guardar');
    } finally {
      setGuardando('');
    }
  };

  const quitar = async (codigo) => {
    setBorrando(codigo);
    setError('');
    try {
      await apiFetch(`/api/admin/stock-config/${encodeURIComponent(codigo)}`, {
        method: 'DELETE',
      });
      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo quitar la configuración');
    } finally {
      setBorrando('');
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const paginaActual = Math.floor(offset / LIMITE) + 1;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Package size={18} className="text-p3-red" />
          <h2 className="text-lg font-bold text-gray-800">Stock mínimo por producto</h2>
        </div>
        <p className="text-sm text-gray-500">
          El mínimo personalizado manda sobre el de SAE. Los productos sin mínimo (ni
          personalizado ni en SAE) no generan alertas. Al elegir un almacén solo se
          muestran los productos que tienen existencia en ese almacén.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <form onSubmit={aplicarBusqueda} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código o descripción..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p3-blue"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-p3-blue text-white text-sm font-medium rounded-lg hover:bg-p3-blue-light transition-colors"
            >
              Buscar
            </button>
          </form>

          <select
            value={cveAlm}
            onChange={(e) => cambiarAlmacen(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-p3-blue"
          >
            <option value="">Todos los almacenes</option>
            {almacenes.map((a) => (
              <option key={a.cve_alm} value={a.cve_alm}>
                {a.nombre || `Almacén ${a.cve_alm}`}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => cambiarFiltro(f.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  filtro === f.id
                    ? 'bg-p3-blue text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="py-2 px-4">Código</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4 text-right">Existencia{cveAlm ? ' (alm.)' : ''}</th>
                <th className="py-2 px-4 text-right">Mín. SAE</th>
                <th className="py-2 px-4 text-right">Mín. personalizado</th>
                <th className="py-2 px-4">Origen</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    Cargando productos...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    Sin productos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                productos.map((p) => {
                  const origen = ORIGEN_LABEL[p.origen] || ORIGEN_LABEL.ninguno;
                  return (
                    <tr key={p.codigo} className={p.bajo_minimo ? 'bg-red-50/50' : ''}>
                      <td className="py-2 px-4 font-mono text-xs text-gray-600">{p.codigo}</td>
                      <td className="py-2 px-4 text-gray-800 max-w-[280px] truncate">
                        {p.descripcion || '—'}
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-gray-900">
                        {p.existencia}
                      </td>
                      <td className="py-2 px-4 text-right text-gray-500">
                        {p.stock_min_sae != null && p.stock_min_sae > 0 ? p.stock_min_sae : '—'}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={minimos[p.codigo] ?? ''}
                          onChange={(e) =>
                            setMinimos((prev) => ({ ...prev, [p.codigo]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') guardar(p.codigo);
                          }}
                          placeholder="—"
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-p3-blue"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 border ${origen.clases}`}
                        >
                          {origen.texto}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {p.bajo_minimo ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                            <AlertTriangle size={12} /> Bajo mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <Check size={12} /> OK
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => guardar(p.codigo)}
                          disabled={guardando === p.codigo || borrando === p.codigo}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-p3-blue rounded-md hover:bg-p3-blue-light disabled:opacity-50"
                          title="Guardar mínimo (vacío = quitar)"
                        >
                          <Save size={12} />
                          {guardando === p.codigo ? '...' : 'Guardar'}
                        </button>{' '}
                        {p.stock_min_custom != null && (
                          <button
                            onClick={() => quitar(p.codigo)}
                            disabled={guardando === p.codigo || borrando === p.codigo}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
                            title="Quitar mínimo personalizado"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
          <span>
            {total.toLocaleString()} producto{total !== 1 ? 's' : ''} · página {paginaActual} de{' '}
            {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMITE))}
              disabled={offset === 0 || cargando}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setOffset(offset + LIMITE)}
              disabled={offset + LIMITE >= total || cargando}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
