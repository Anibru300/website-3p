import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchCrmResumen,
  fetchCrmEntidades,
  fetchCrmPortales,
  crearEntidadCrm,
} from '../utils/api';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Lock,
  FileText,
  Search,
  Plus,
  X,
  Eye,
  LogOut,
  Shield,
  Menu,
  ChevronRight,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'crms', label: 'CRMs', icon: Briefcase },
  { id: 'portales', label: 'Portales', icon: Lock },
];

const CRM_SUBTABS = [
  { id: 'general', label: 'General' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'proveedores', label: 'Proveedores' },
];

const TIPO_LABEL = {
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  ambos: 'Ambos',
};

const TIPO_BADGE = {
  cliente: 'bg-blue-100 text-blue-700',
  proveedor: 'bg-emerald-100 text-emerald-700',
  ambos: 'bg-violet-100 text-violet-700',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('crms');
  const [activeCrmTab, setActiveCrmTab] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [resumen, setResumen] = useState(null);
  const [entidades, setEntidades] = useState([]);
  const [totalEntidades, setTotalEntidades] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [skip, setSkip] = useState(0);
  const LIMIT = 10;

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'cliente',
    nombre: '',
    rfc: '',
    razon_social: '',
    telefono: '',
    email: '',
    notas: '',
  });

  // Portales
  const [portales, setPortales] = useState([]);
  const [totalPortales, setTotalPortales] = useState(0);
  const [portalesSearch, setPortalesSearch] = useState('');
  const [portalesSkip, setPortalesSkip] = useState(0);
  const PORTALES_LIMIT = 20;

  const tipoQuery = useMemo(() => {
    if (activeCrmTab === 'clientes') return 'cliente';
    if (activeCrmTab === 'proveedores') return 'proveedor';
    return tipoFiltro;
  }, [activeCrmTab, tipoFiltro]);

  async function cargarDatos(resetSkip = true) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (tipoQuery) params.set('tipo', tipoQuery);
      if (search.trim()) params.set('q', search.trim());
      const currentSkip = resetSkip ? 0 : skip;
      params.set('skip', String(currentSkip));
      params.set('limit', String(LIMIT));

      const [resumenData, entidadesData] = await Promise.all([
        fetchCrmResumen(),
        fetchCrmEntidades(params.toString()),
      ]);

      setResumen(resumenData);
      setEntidades(entidadesData.data || []);
      setTotalEntidades(entidadesData.total || 0);
      if (resetSkip) setSkip(0);
    } catch (err) {
      setError(err.message || 'Error al cargar el CRM');
    } finally {
      setLoading(false);
    }
  }

  async function cargarPortales(resetSkip = true) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (portalesSearch.trim()) params.set('q', portalesSearch.trim());
      const currentSkip = resetSkip ? 0 : portalesSkip;
      params.set('skip', String(currentSkip));
      params.set('limit', String(PORTALES_LIMIT));

      const data = await fetchCrmPortales(params.toString());
      setPortales(data.data || []);
      setTotalPortales(data.total || 0);
      if (resetSkip) setPortalesSkip(0);
    } catch (err) {
      setError(err.message || 'Error al cargar los portales');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeSection === 'crms') {
      cargarDatos(true);
    } else if (activeSection === 'portales') {
      cargarPortales(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, activeCrmTab, tipoQuery, search, portalesSearch]);

  useEffect(() => {
    if (activeSection === 'crms') {
      cargarDatos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  useEffect(() => {
    if (activeSection === 'portales') {
      cargarPortales(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalesSkip]);

  function handleOpenModal() {
    setForm({
      tipo: activeCrmTab === 'proveedores' ? 'proveedor' : 'cliente',
      nombre: '',
      rfc: '',
      razon_social: '',
      telefono: '',
      email: '',
      notas: '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      await crearEntidadCrm(form);
      setShowModal(false);
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || 'Error al crear la entidad');
    } finally {
      setSaving(false);
    }
  }

  function renderSidebar() {
    return (
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="bg-p3-red text-white p-1.5 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-bold text-gray-900">Admin 3P</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-p3-red text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    );
  }

  function renderTopBar() {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Panel de Administración
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              title="Regresar al dashboard"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Regresar</span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  function renderResumenCards() {
    if (!resumen) return null;
    const items = [
      { label: 'Clientes', value: resumen.clientes || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Proveedores', value: resumen.proveedores || 0, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Contactos', value: resumen.contactos || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Ubicaciones', value: resumen.ubicaciones || 0, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Portales', value: resumen.portales || 0, icon: Lock, color: 'text-p3-red', bg: 'bg-red-50' },
      { label: 'Documentos', value: resumen.documentos || 0, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-lg ${item.bg} ${item.color} mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    );
  }

  function renderEntidadesTable() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold">Nombre</th>
              <th className="py-3 px-3 font-semibold">RFC</th>
              <th className="py-3 px-3 font-semibold">Contacto principal</th>
              <th className="py-3 px-3 font-semibold text-center">Ubicaciones</th>
              <th className="py-3 px-3 font-semibold text-center">Portales</th>
              <th className="py-3 px-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entidades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No se encontraron entidades.
                </td>
              </tr>
            ) : (
              entidades.map((entidad) => (
                <tr key={entidad.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        TIPO_BADGE[entidad.tipo] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {TIPO_LABEL[entidad.tipo] || entidad.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-900">{entidad.nombre}</td>
                  <td className="py-3 px-3 text-gray-600">{entidad.rfc || '-'}</td>
                  <td className="py-3 px-3 text-gray-600">{entidad.contacto_principal || '-'}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{entidad.total_ubicaciones || 0}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{entidad.total_portales || 0}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => (window.location.href = `/admin/crms/entidad/${entidad.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPagination() {
    const pages = Math.ceil(totalEntidades / LIMIT);
    const currentPage = Math.floor(skip / LIMIT) + 1;
    if (pages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Mostrando {skip + 1}-{Math.min(skip + entidades.length, totalEntidades)} de {totalEntidades}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSkip((s) => Math.max(0, s - LIMIT))}
            disabled={skip === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-600 px-2">
            {currentPage} / {pages}
          </span>
          <button
            onClick={() => setSkip((s) => Math.min((pages - 1) * LIMIT, s + LIMIT))}
            disabled={skip + LIMIT >= totalEntidades}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  function renderCrmGeneral() {
    return (
      <div>
        {renderResumenCards()}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Entidades del CRM</h2>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              Nueva entidad
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o RFC..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              />
            </div>
            <select
              value={activeCrmTab === 'general' ? tipoFiltro : ''}
              onChange={(e) => setTipoFiltro(e.target.value)}
              disabled={activeCrmTab !== 'general'}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Todos los tipos</option>
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-500">Cargando entidades...</p>
            </div>
          ) : (
            <>
              {renderEntidadesTable()}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    );
  }

  function renderCrmSection() {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          {CRM_SUBTABS.map((tab) => {
            const active = activeCrmTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCrmTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-p3-red text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-p3-red hover:bg-red-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {renderCrmGeneral()}
      </div>
    );
  }

  function renderPortalesTable() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
              <th className="py-3 px-3 font-semibold">Empresa</th>
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold">Portal</th>
              <th className="py-3 px-3 font-semibold">URL</th>
              <th className="py-3 px-3 font-semibold">Usuario</th>
              <th className="py-3 px-3 font-semibold">Contraseña</th>
              <th className="py-3 px-3 font-semibold">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {portales.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No se encontraron portales.
                </td>
              </tr>
            ) : (
              portales.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3 font-medium text-gray-900">{p.entidad}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        TIPO_BADGE[p.entidad_tipo] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {TIPO_LABEL[p.entidad_tipo] || p.entidad_tipo}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-700">{p.portal || '-'}</td>
                  <td className="py-3 px-3 text-gray-600">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-p3-blue hover:underline"
                      >
                        {p.url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-700 font-mono text-xs">{p.usuario || '-'}</td>
                  <td className="py-3 px-3 text-gray-700 font-mono text-xs">{p.password || '-'}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{p.notas || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPortalesPagination() {
    const pages = Math.ceil(totalPortales / PORTALES_LIMIT);
    const currentPage = Math.floor(portalesSkip / PORTALES_LIMIT) + 1;
    if (pages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Mostrando {portalesSkip + 1}-{Math.min(portalesSkip + portales.length, totalPortales)} de {totalPortales}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPortalesSkip((s) => Math.max(0, s - PORTALES_LIMIT))}
            disabled={portalesSkip === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-600 px-2">
            {currentPage} / {pages}
          </span>
          <button
            onClick={() => setPortalesSkip((s) => Math.min((pages - 1) * PORTALES_LIMIT, s + PORTALES_LIMIT))}
            disabled={portalesSkip + PORTALES_LIMIT >= totalPortales}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  function renderPortalesSection() {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Portales de clientes y proveedores</h2>
            <p className="text-xs text-gray-500">Usuarios y contraseñas de acceso a portales.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={portalesSearch}
              onChange={(e) => setPortalesSearch(e.target.value)}
              placeholder="Buscar por empresa, portal o usuario..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500">Cargando portales...</p>
          </div>
        ) : (
          <>
            {renderPortalesTable()}
            {renderPortalesPagination()}
          </>
        )}
      </div>
    );
  }

  function renderModal() {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Nueva entidad</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              >
                <option value="cliente">Cliente</option>
                <option value="proveedor">Proveedor</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                <input
                  type="text"
                  value={form.rfc}
                  onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón social</label>
                <input
                  type="text"
                  value={form.razon_social}
                  onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !form.nombre.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      {renderTopBar()}
      <div className="flex">
        {renderSidebar()}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px]">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <LayoutDashboard size={16} />
              <ChevronRight size={14} />
              <span className="capitalize">{activeSection}</span>
            </div>

            {error && !showModal && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <X size={18} />
                {error}
              </div>
            )}

            {activeSection === 'crms' && renderCrmSection()}
            {activeSection === 'portales' && renderPortalesSection()}
          </div>
        </main>
      </div>
      {renderModal()}
    </div>
  );
}
