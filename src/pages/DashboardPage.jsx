import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchDashboardResumen,
  fetchExistencias,
  fetchVales,
  fetchPedidosVivos,
  fetchFacturasCobranza,
  fetchSanAntonioOrdenes,
} from '../utils/api';
import { Package, ClipboardList, ShoppingCart, FileText, LogOut, Search, RefreshCw, AlertCircle } from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: FileText },
  { id: 'existencias', label: 'Existencias', icon: Package },
  { id: 'vales', label: 'Material en vales', icon: ClipboardList },
  { id: 'pedidos', label: 'Pedidos abiertos', icon: ShoppingCart },
  { id: 'san-antonio', label: 'San Antonio', icon: FileText },
];

function DataTable({ columns, rows, emptyMessage = 'Sin datos' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
        <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                  {row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ label, value, icon, color = 'bg-p3-blue' }) {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`${color} text-white w-12 h-12 rounded-xl flex items-center justify-center`}>
        <IconComponent size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      </div>
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
  const [facturas, setFacturas] = useState([]);
  const [sanAntonio, setSanAntonio] = useState(null);

  // Filters
  const [existenciasQuery, setExistenciasQuery] = useState('limit=50');
  const [valesQuery] = useState('limit=50');
  const [pedidosQuery] = useState('limit=50');
  const [sanAntonioQuery] = useState('limit=50');

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
        const [ped, fac] = await Promise.all([
          fetchPedidosVivos(pedidosQuery),
          fetchFacturasCobranza('limit=5'),
        ]);
        setPedidos(ped.data);
        setFacturas(fac.data);
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

  const renderResumen = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Pedidos vivos" value={resumen?.pedidos_vivos} icon={ShoppingCart} color="bg-p3-blue" />
        <KpiCard label="Vales abiertos" value={resumen?.vales_abiertos} icon={ClipboardList} color="bg-orange-500" />
        <KpiCard label="Productos bajo mínimo" value={resumen?.productos_bajo_minimo} icon={AlertCircle} color="bg-red-500" />
        <KpiCard label="Movimientos 90 días" value={resumen?.movimientos_90d} icon={Package} color="bg-green-600" />
        <KpiCard label="Facturas pendientes cobranza" value={resumen?.facturas_pendientes_cobranza} icon={FileText} color="bg-purple-600" />
      </div>
      <p className="text-sm text-gray-500">
        Selecciona una pestaña superior para ver el detalle de cada área.
      </p>
    </div>
  );

  const renderExistencias = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar código o descripción..."
            onChange={(e) => setExistenciasQuery(`limit=50&busqueda=${encodeURIComponent(e.target.value)}`)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
          />
        </div>
      </div>
      <DataTable
        rows={existencias}
        columns={[
          { key: 'codigo', label: 'Código' },
          { key: 'descripcion', label: 'Descripción' },
          { key: 'almacen', label: 'Alm' },
          { key: 'nombre_almacen', label: 'Almacén' },
          { key: 'existencia', label: 'Existencia' },
          { key: 'stock_min', label: 'Stock mín' },
          { key: 'stock_max', label: 'Stock máx' },
          { key: 'comprometido_recibir', label: 'Por recibir' },
        ]}
      />
    </div>
  );

  const renderVales = () => (
    <div className="space-y-4">
      <DataTable
        rows={vales}
        columns={[
          { key: 'folio', label: 'Folio' },
          { key: 'entregado_a', label: 'Entregado a' },
          { key: 'fecha_salida', label: 'Fecha' },
          { key: 'codigo', label: 'Código' },
          { key: 'descripcion', label: 'Descripción' },
          { key: 'cantidad', label: 'Cantidad' },
          { key: 'almacen_origen', label: 'Almacén' },
          { key: 'estado', label: 'Estado' },
        ]}
        emptyMessage="No hay material vivo en vales abiertos"
      />
    </div>
  );

  const renderPedidos = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pedidos vivos</h3>
        <DataTable
          rows={pedidos}
          columns={[
            { key: 'folio', label: 'Folio' },
            { key: 'cliente', label: 'Cliente' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'importe_total', label: 'Importe' },
            { key: 'total_facturado', label: 'Facturado' },
            { key: 'saldo_pendiente', label: 'Saldo' },
            { key: 'estado', label: 'Estado' },
            { key: 'dias_pendiente', label: 'Días' },
          ]}
          emptyMessage="No hay pedidos vivos pendientes"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Facturas cobranza</h3>
        <DataTable
          rows={facturas}
          columns={[
            { key: 'folio', label: 'Folio' },
            { key: 'cliente', label: 'Cliente' },
            { key: 'fecha_doc', label: 'Fecha' },
            { key: 'total', label: 'Total' },
            { key: 'estado_cobranza', label: 'Estado' },
          ]}
          emptyMessage="No hay facturas pendientes de cobranza"
        />
      </section>
    </div>
  );

  const renderSanAntonio = () => (
    <div className="space-y-6">
      {sanAntonio?.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{sanAntonio.error}</div>
      )}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Órdenes de compra ({sanAntonio?.total ?? 0})
        </h3>
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
        />
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Partidas visibles</h3>
        <DataTable
          rows={sanAntonio?.partidas || []}
          columns={[
            { key: 'folio', label: 'Folio' },
            { key: 'posicion', label: 'Pos' },
            { key: 'codigo', label: 'Código' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'cantidadpedido', label: 'Cantidad' },
            { key: 'preciounitario', label: 'Precio unit' },
            { key: 'entregada', label: 'Entregada' },
            { key: 'saldo', label: 'Saldo' },
            { key: 'estadolinea', label: 'Estado' },
          ]}
          emptyMessage="Sin partidas"
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-p3-red text-white p-2 rounded-lg">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard Operativo 3P</h1>
                <p className="text-xs text-gray-500">{user?.nombre} · {user?.rol}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-p3-red text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-p3-red hover:bg-red-50 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
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
