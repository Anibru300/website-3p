import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchDashboardResumen,
  fetchExistencias,
  fetchVales,
  fetchPedidosVivos,
  fetchSanAntonioOrdenes,
} from '../utils/api';
import {
  Package,
  ClipboardList,
  ShoppingCart,
  FileText,
  LogOut,
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  Filter,
  Inbox,
  TrendingUp,
} from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: TrendingUp },
  { id: 'existencias', label: 'Existencias', icon: Package },
  { id: 'vales', label: 'Material en vales', icon: ClipboardList },
  { id: 'pedidos', label: 'Pedidos abiertos', icon: ShoppingCart },
  { id: 'san-antonio', label: 'San Antonio', icon: FileText },
];

const RESPONSABLES = [
  { id: '', label: 'Todos', color: 'gray' },
  { id: 'joan', label: 'Vales con Joan', color: 'blue' },
  { id: 'abelardo', label: 'Vales con Abelardo', color: 'emerald' },
  { id: 'aaron', label: 'Vales con Aaron', color: 'violet' },
  { id: 'otros', label: 'Otros vales', color: 'amber' },
];

function EmptyState({ message = 'Sin datos', icon = Inbox }) {
  const IconComponent = icon;
  return (
    <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
      <div className="mx-auto w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
        <IconComponent className="text-gray-400" size={28} />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-1">No se encontraron registros para mostrar.</p>
    </div>
  );
}

function DataTable({ columns, rows, emptyMessage = 'Sin datos', emptyIcon = Inbox }) {
  if (!rows || rows.length === 0) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wide text-xs">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-left whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3 text-gray-700 whitespace-nowrap">
                  {col.format ? col.format(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ label, value, icon, color = 'bg-p3-blue', subtext = '' }) {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm`}>
        <IconComponent size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="text-p3-red" size={22} />}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {count !== undefined && (
        <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {count} registros
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [resumen, setResumen] = useState(null);
  const [existencias, setExistencias] = useState([]);
  const [vales, setVales] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [sanAntonio, setSanAntonio] = useState(null);

  // Filters
  const [existenciasQuery] = useState('limit=500');
  const [valesQuery, setValesQuery] = useState('limit=500');
  const [valesResponsable, setValesResponsable] = useState('');
  const [pedidosQuery] = useState('limit=500');
  const [sanAntonioQuery] = useState('limit=500');
  const [existenciasSearch, setExistenciasSearch] = useState('');

  const existenciasFiltradas = useMemo(() => {
    const term = existenciasSearch.trim().toLowerCase();
    if (!term) return existencias;
    return existencias.filter((item) =>
      (item.codigo?.toLowerCase() || '').includes(term) ||
      (item.descripcion?.toLowerCase() || '').includes(term)
    );
  }, [existencias, existenciasSearch]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '500' });
    if (valesResponsable) params.set('responsable', valesResponsable);
    setValesQuery(params.toString());
  }, [valesResponsable]);

  const loadResumen = async () => {
    try {
      setError(null);
      const data = await fetchDashboardResumen();
      setResumen(data.resumen);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTabData = useCallback(async (tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'existencias') {
        const data = await fetchExistencias(existenciasQuery);
        setExistencias(data.data);
      } else if (tab === 'vales') {
        const data = await fetchVales(valesQuery);
        setVales(data.data);
      } else if (tab === 'pedidos') {
        const data = await fetchPedidosVivos(pedidosQuery);
        setPedidos(data.data);
      } else if (tab === 'san-antonio') {
        const data = await fetchSanAntonioOrdenes(sanAntonioQuery);
        setSanAntonio(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [existenciasQuery, valesQuery, pedidosQuery, sanAntonioQuery]);

  useEffect(() => {
    loadResumen();
  }, []);

  useEffect(() => {
    if (activeTab !== 'resumen') {
      loadTabData(activeTab);
    }
  }, [activeTab, existenciasQuery, valesQuery, pedidosQuery, sanAntonioQuery, loadTabData]);

  const formatCurrency = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  };

  const formatNumber = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const renderResumen = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pedidos abiertos" value={resumen?.pedidos_vivos} icon={ShoppingCart} color="bg-p3-blue" subtext="Pendientes o parcialmente facturados" />
        <KpiCard label="Vales abiertos" value={resumen?.vales_abiertos} icon={ClipboardList} color="bg-orange-500" subtext="Con material vivo" />
        <KpiCard label="Productos bajo mínimo" value={resumen?.productos_bajo_minimo} icon={AlertCircle} color="bg-red-500" />
        <KpiCard label="Movimientos 90 días" value={resumen?.movimientos_90d} icon={Package} color="bg-green-600" />
      </div>
      <p className="text-sm text-gray-500">
        Selecciona una pestaña superior para ver el detalle de cada área.
      </p>
    </div>
  );

  const renderExistencias = () => (
    <div className="space-y-4">
      <SectionHeader title="Existencias por producto" count={existenciasFiltradas.length} icon={Package} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar código o descripción..."
            value={existenciasSearch}
            onChange={(e) => setExistenciasSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
          />
        </div>
      </div>
      <DataTable
        rows={existenciasFiltradas}
        columns={[
          { key: 'codigo', label: 'Código' },
          { key: 'descripcion', label: 'Descripción' },
          {
            key: 'existencia_en_vales',
            label: 'Existencia en vales',
            format: (_, row) => formatNumber(row.material_en_vales),
          },
          {
            key: 'existencia_en_almacen',
            label: 'Existencia en almacén',
            format: (_, row) => formatNumber((row.existencia_total ?? 0) - (row.material_en_vales ?? 0)),
          },
          {
            key: 'existencia_total_final',
            label: 'Existencia total',
            format: (_, row) => formatNumber(row.existencia_total),
          },
        ]}
        emptyMessage="No se encontraron existencias"
        emptyIcon={Package}
      />
    </div>
  );

  const renderVales = () => (
    <div className="space-y-4">
      <SectionHeader title="Material en vales abiertos" count={vales.length} icon={ClipboardList} />
      <div className="flex flex-wrap gap-2">
        {RESPONSABLES.map((r) => {
          const isActive = valesResponsable === r.id;
          const colorClasses = {
            gray: isActive ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200',
            blue: isActive ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200',
            emerald: isActive ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-200',
            violet: isActive ? 'bg-violet-600 text-white' : 'bg-white text-violet-600 hover:bg-violet-50 border-violet-200',
            amber: isActive ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 hover:bg-amber-50 border-amber-200',
          };
          return (
            <button
              key={r.id}
              onClick={() => setValesResponsable(r.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${colorClasses[r.color]}`}
            >
              <Users size={16} />
              {r.label}
            </button>
          );
        })}
      </div>
      <DataTable
        rows={vales}
        columns={[
          { key: 'folio', label: 'Folio' },
          { key: 'entregado_a', label: 'Entregado a' },
          { key: 'fecha_salida', label: 'Fecha' },
          { key: 'codigo', label: 'Código' },
          { key: 'descripcion', label: 'Descripción' },
          { key: 'cantidad', label: 'Cantidad', format: formatNumber },
          { key: 'almacen_origen', label: 'Almacén' },
          { key: 'estado', label: 'Estado' },
        ]}
        emptyMessage="No hay vales abiertos actualmente"
        emptyIcon={ClipboardList}
      />
    </div>
  );

  const renderPedidos = () => (
    <div className="space-y-6">
      <SectionHeader title="Pedidos vivos" count={pedidos.length} icon={ShoppingCart} />
      <DataTable
        rows={pedidos}
        columns={[
          { key: 'folio', label: 'Folio' },
          { key: 'cliente', label: 'Cliente' },
          { key: 'fecha', label: 'Fecha' },
          { key: 'importe_total', label: 'Importe', format: formatCurrency },
          { key: 'total_facturado', label: 'Facturado', format: formatCurrency },
          { key: 'saldo_pendiente', label: 'Saldo', format: formatCurrency },
          { key: 'estado', label: 'Estado' },
          { key: 'dias_pendiente', label: 'Días' },
        ]}
        emptyMessage="No hay pedidos vivos pendientes"
        emptyIcon={ShoppingCart}
      />
    </div>
  );

  const renderSanAntonio = () => (
    <div className="space-y-8">
      {sanAntonio?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <span>{sanAntonio.error}</span>
        </div>
      )}
      <section>
        <SectionHeader title="Órdenes de compra" count={sanAntonio?.total ?? 0} icon={FileText} />
        <DataTable
          rows={sanAntonio?.cabeceras || []}
          columns={[
            { key: 'folio', label: 'Folio' },
            { key: 'nopedido', label: 'No. pedido' },
            { key: 'fechaoc', label: 'Fecha OC' },
            { key: 'moneda', label: 'Moneda' },
            { key: 'condicionespago', label: 'Condiciones pago' },
            { key: 'totaloc', label: 'Total' },
            { key: 'estadooc', label: 'Estado' },
            { key: 'cargadaportal', label: 'Cargada portal' },
          ]}
          emptyMessage="No se encontraron órdenes de San Antonio"
          emptyIcon={FileText}
        />
      </section>
      <section>
        <SectionHeader title="Partidas visibles" count={(sanAntonio?.partidas || []).length} icon={Filter} />
        <DataTable
          rows={sanAntonio?.partidas || []}
          columns={[
            { key: 'folio', label: 'Folio' },
            { key: 'posicion', label: 'Pos' },
            { key: 'codigo', label: 'Código' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'cantidadpedido', label: 'Cantidad', format: formatNumber },
            { key: 'preciounitario', label: 'Precio unit', format: formatCurrency },
            { key: 'entregada', label: 'Entregada', format: formatNumber },
            { key: 'saldo', label: 'Saldo', format: formatNumber },
            { key: 'estadolinea', label: 'Estado' },
          ]}
          emptyMessage="Sin partidas"
          emptyIcon={Filter}
        />
      </section>
    </div>
  );

  const tabContent = {
    resumen: renderResumen(),
    existencias: renderExistencias(),
    vales: renderVales(),
    pedidos: renderPedidos(),
    'san-antonio': renderSanAntonio(),
  };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-p3-red text-white p-2 rounded-lg shadow-sm">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Dashboard Operativo 3P</h1>
                <p className="text-xs text-gray-500">{user?.nombre} · {user?.rol}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => activeTab === 'resumen' ? loadResumen() : loadTabData(activeTab)}
                className="p-2 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                title="Recargar"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-p3-red text-white border-p3-red shadow-md'
                    : 'bg-white text-gray-600 hover:text-p3-red hover:bg-red-50 border-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {tabContent[activeTab]}
          </div>
        )}
      </div>
    </div>
  );
}
