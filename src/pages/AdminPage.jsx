import { Fragment, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchCrmResumen,
  fetchCrmEntidades,
  fetchCrmPortales,
  fetchCrmEntidad,
  crearEntidadCrm,
  actualizarEntidadCrm,
  eliminarEntidadCrm,
  crearContactoCrm,
  actualizarContactoCrm,
  eliminarContactoCrm,
  crearGranjaCrm,
  actualizarGranjaCrm,
  eliminarGranjaCrm,
  crearUbicacionCrm,
  actualizarUbicacionCrm,
  eliminarUbicacionCrm,
  crearPaqueteriaCrm,
  actualizarPaqueteriaCrm,
  eliminarPaqueteriaCrm,
  crearPortalCrm,
  actualizarPortalCrm,
  eliminarPortalCrm,
  crearDescuentoCrm,
  actualizarDescuentoCrm,
  eliminarDescuentoCrm,
  crearDocumentoCrm,
  actualizarDocumentoCrm,
  eliminarDocumentoCrm,
  trackEvent,
  fetchAnalyticsResumen,
  fetchAnalyticsVisitas,
  fetchAnalyticsPublicoPorDia,
  fetchAnalyticsPublicoPorHora,
  fetchAnalyticsPublicoPorDiaHora,
  fetchAnalyticsPublicoDispositivos,
  fetchAnalyticsPublicoNavegadores,
  fetchAnalyticsPublicoSistemasOperativos,
  fetchAnalyticsPublicoPaises,
  fetchAnalyticsPublicoCiudades,
  fetchAnalyticsPublicoReferrers,
  fetchAnalyticsPublicoPaginas,
  fetchAnalyticsAlertas,
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
  Pencil,
  Trash2,
  Save,
  Truck,
  Percent,
  Home,
  Phone,
  Warehouse,
  Tag,
  ExternalLink,
  Globe,
  BarChart3,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'crms', label: 'CRMs', icon: Briefcase },
  { id: 'portales', label: 'Portales', icon: Lock },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const CRM_SUBTABS = [
  { id: 'general', label: 'General' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'proveedores', label: 'Proveedores' },
];

const ENTITY_TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'contactos', label: 'Contactos', icon: Users },
  { id: 'granjas', label: 'Granjas', icon: Warehouse },
  { id: 'ubicaciones', label: 'Domicilios', icon: Home },
  { id: 'paqueterias', label: 'Paqueterías', icon: Truck },
  { id: 'descuentos', label: 'Descuentos', icon: Percent },
  { id: 'documentos', label: 'Documentos', icon: FileText },
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

const STATUS_BADGE = {
  Activo: 'bg-green-100 text-green-700',
  Inactivo: 'bg-gray-100 text-gray-700',
};

function classNames(...c) {
  return c.filter(Boolean).join(' ');
}

function useRouteEntityId() {
  const [entityId, setEntityId] = useState(null);
  useEffect(() => {
    const parse = () => {
      const path = window.location.pathname || '';
      const match = path.match(/\/admin\/crms\/entidad\/(\d+)/);
      setEntityId(match ? parseInt(match[1], 10) : null);
    };
    parse();
    window.addEventListener('popstate', parse);
    return () => window.removeEventListener('popstate', parse);
  }, []);
  return entityId;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const routeEntityId = useRouteEntityId();

  const [activeSection, setActiveSection] = useState('crms');
  const [activeCrmTab, setActiveCrmTab] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    trackEvent('section_view', {
      path: window.location.pathname,
      section: activeSection,
    });
  }, [activeSection]);

  const [view, setView] = useState(routeEntityId ? 'detail' : 'list');
  const [selectedEntityId, setSelectedEntityId] = useState(routeEntityId);
  const [activeEntityTab, setActiveEntityTab] = useState('general');

  const [resumen, setResumen] = useState(null);
  const [entidades, setEntidades] = useState([]);
  const [totalEntidades, setTotalEntidades] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [industriaFiltro, setIndustriaFiltro] = useState('');
  const [skip, setSkip] = useState(0);
  const LIMIT = 10;

  const [modal, setModal] = useState({ type: null, data: null });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ type: null, id: null, name: '' });

  // Detail state
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Portales
  const [portales, setPortales] = useState([]);
  const [totalPortales, setTotalPortales] = useState(0);
  const [portalesSearch, setPortalesSearch] = useState('');
  const [portalesSkip, setPortalesSkip] = useState(0);
  const PORTALES_LIMIT = 20;

  // Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsDias, setAnalyticsDias] = useState(30);
  const [analyticsTipo, setAnalyticsTipo] = useState('todos');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState('general');
  const [analyticsFechaDesde, setAnalyticsFechaDesde] = useState('');
  const [analyticsFechaHasta, setAnalyticsFechaHasta] = useState('');
  const [publicoData, setPublicoData] = useState(null);
  const [publicoLoading, setPublicoLoading] = useState(false);
  const [alertasData, setAlertasData] = useState(null);
  const [alertasLoading, setAlertasLoading] = useState(false);

  const tipoQuery = useMemo(() => {
    if (activeCrmTab === 'clientes') return 'cliente';
    if (activeCrmTab === 'proveedores') return 'proveedor';
    return tipoFiltro;
  }, [activeCrmTab, tipoFiltro]);

  useEffect(() => {
    if (routeEntityId) {
      setSelectedEntityId(routeEntityId);
      setView('detail');
    }
  }, [routeEntityId]);

  function navigateToEntity(entityId) {
    const url = entityId ? `/admin/crms/entidad/${entityId}` : '/admin';
    window.history.pushState({}, '', url);
    setSelectedEntityId(entityId);
    setView(entityId ? 'detail' : 'list');
    if (entityId) {
      setActiveEntityTab('general');
    }
  }

  async function cargarDatos(resetSkip = true) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (tipoQuery) params.set('tipo', tipoQuery);
      if (search.trim()) params.set('q', search.trim());
      if (statusFiltro) params.set('status', statusFiltro);
      if (industriaFiltro) params.set('industria', industriaFiltro);
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

  async function cargarDetalle() {
    if (!selectedEntityId) return;
    setDetailLoading(true);
    setError('');
    try {
      const data = await fetchCrmEntidad(selectedEntityId);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el detalle');
    } finally {
      setDetailLoading(false);
    }
  }

  async function cargarAnalytics() {
    setAnalyticsLoading(true);
    setError('');
    try {
      const data = await fetchAnalyticsResumen(
        analyticsDias,
        analyticsTipo,
        analyticsFechaDesde,
        analyticsFechaHasta
      );
      setAnalyticsData(data);
    } catch (err) {
      setError(err.message || 'Error al cargar analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function cargarAlertas() {
    setAlertasLoading(true);
    try {
      const data = await fetchAnalyticsAlertas(
        analyticsDias,
        analyticsFechaDesde,
        analyticsFechaHasta,
        5
      );
      setAlertasData(data);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
    } finally {
      setAlertasLoading(false);
    }
  }

  async function cargarAnalyticsPublico() {
    setPublicoLoading(true);
    setError('');
    try {
      const [
        porDia,
        porHora,
        porDiaHora,
        dispositivos,
        navegadores,
        sistemas,
        paises,
        ciudades,
        referrers,
        paginas,
      ] = await Promise.all([
        fetchAnalyticsPublicoPorDia(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoPorHora(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoPorDiaHora(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoDispositivos(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoNavegadores(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoSistemasOperativos(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoPaises(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoCiudades(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoReferrers(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
        fetchAnalyticsPublicoPaginas(analyticsDias, analyticsFechaDesde, analyticsFechaHasta),
      ]);
      setPublicoData({
        porDia: porDia.data || [],
        porHora: porHora.data || [],
        porDiaHora: porDiaHora.data || [],
        dispositivos: dispositivos.data || [],
        navegadores: navegadores.data || [],
        sistemas: sistemas.data || [],
        paises: paises.data || [],
        ciudades: ciudades.data || [],
        referrers: referrers.data || [],
        paginas: paginas.data || [],
      });
    } catch (err) {
      setError(err.message || 'Error al cargar analytics público');
    } finally {
      setPublicoLoading(false);
    }
  }

  useEffect(() => {
    if (activeSection === 'crms' && view === 'list') {
      cargarDatos(true);
    } else if (activeSection === 'portales') {
      cargarPortales(true);
    } else if (activeSection === 'analytics') {
      if (analyticsTab === 'general') {
        cargarAnalytics();
      } else {
        cargarAnalyticsPublico();
      }
      cargarAlertas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSection,
    activeCrmTab,
    tipoQuery,
    search,
    statusFiltro,
    industriaFiltro,
    portalesSearch,
    view,
    analyticsDias,
    analyticsTipo,
    analyticsTab,
    analyticsFechaDesde,
    analyticsFechaHasta,
  ]);

  useEffect(() => {
    if (activeSection === 'crms' && view === 'list') {
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

  useEffect(() => {
    if (view === 'detail' && selectedEntityId) {
      cargarDetalle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedEntityId, activeEntityTab]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  function handleOpenEntityModal(data = null) {
    setModal({ type: 'entidad', data });
  }

  async function handleSaveEntity(form) {
    setSaving(true);
    try {
      if (form.id) {
        await actualizarEntidadCrm(form.id, form);
      } else {
        await crearEntidadCrm(form);
      }
      setModal({ type: null, data: null });
      if (view === 'detail' && selectedEntityId) {
        await cargarDetalle();
      }
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || 'Error al guardar la entidad');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEntity() {
    if (!confirmDelete.id) return;
    try {
      await eliminarEntidadCrm(confirmDelete.id);
      setConfirmDelete({ type: null, id: null, name: '' });
      navigateToEntity(null);
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || 'Error al eliminar la entidad');
    }
  }

  async function handleSaveRelacion(apiCall, reload) {
    setSaving(true);
    try {
      await apiCall();
      setModal({ type: null, data: null });
      if (reload) await reload();
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRelacion(apiCall, reload) {
    try {
      await apiCall();
      setConfirmDelete({ type: null, id: null, name: '' });
      if (reload) await reload();
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || 'Error al eliminar');
    }
  }

  // ---------------------------------------------------------------------------
  // Render: Sidebar / Topbar
  // ---------------------------------------------------------------------------

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
                    if (item.id === 'crms') navigateToEntity(null);
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

  // ---------------------------------------------------------------------------
  // Render: CRM Listado
  // ---------------------------------------------------------------------------

  function renderResumenCards() {
    if (!resumen) return null;
    const items = [
      { label: 'Clientes', value: resumen.clientes || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Proveedores', value: resumen.proveedores || 0, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Contactos', value: resumen.contactos || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Granjas', value: resumen.granjas || 0, icon: Warehouse, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Ubicaciones', value: resumen.ubicaciones || 0, icon: MapPin, color: 'text-cyan-600', bg: 'bg-cyan-50' },
      { label: 'Paqueterías', value: resumen.paqueterias || 0, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Portales', value: resumen.portales || 0, icon: Lock, color: 'text-p3-red', bg: 'bg-red-50' },
      { label: 'Descuentos', value: resumen.descuentos || 0, icon: Percent, color: 'text-teal-600', bg: 'bg-teal-50' },
      { label: 'Documentos', value: resumen.documentos || 0, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-6">
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
              <th className="py-3 px-3 font-semibold">ID</th>
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold">Nombre</th>
              <th className="py-3 px-3 font-semibold">RFC</th>
              <th className="py-3 px-3 font-semibold">Ciudad/Estado</th>
              <th className="py-3 px-3 font-semibold">Teléfono</th>
              <th className="py-3 px-3 font-semibold">Contacto principal</th>
              <th className="py-3 px-3 font-semibold text-center">Granjas</th>
              <th className="py-3 px-3 font-semibold text-center">Ubics.</th>
              <th className="py-3 px-3 font-semibold text-center">Portales</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entidades.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  No se encontraron entidades.
                </td>
              </tr>
            ) : (
              entidades.map((entidad) => (
                <tr key={entidad.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">{entidad.id_externo || entidad.id}</td>
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
                  <td className="py-3 px-3 text-gray-600">
                    {[entidad.ciudad, entidad.estado].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{entidad.telefono || '-'}</td>
                  <td className="py-3 px-3 text-gray-600">{entidad.contacto_principal || '-'}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{entidad.total_granjas || 0}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{entidad.total_ubicaciones || 0}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{entidad.total_portales || 0}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_BADGE[entidad.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entidad.status || 'Activo'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => navigateToEntity(entidad.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                      <button
                        onClick={() => handleOpenEntityModal(entidad)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
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

  function renderCrmList() {
    return (
      <div>
        {renderResumenCards()}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Entidades del CRM</h2>
            <button
              onClick={() => handleOpenEntityModal(null)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              Nueva entidad
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="relative">
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
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
            >
              <option value="">Todos los status</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <input
              type="text"
              value={industriaFiltro}
              onChange={(e) => setIndustriaFiltro(e.target.value)}
              placeholder="Industria..."
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
            />
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
    if (view === 'detail') {
      return renderEntityDetail();
    }
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
        {renderCrmList()}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Entity Detail
  // ---------------------------------------------------------------------------

  function renderEntityDetail() {
    const entidad = detail?.entidad;
    if (!entidad && detailLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-500">Cargando ficha...</p>
        </div>
      );
    }
    if (!entidad) {
      return (
        <div className="text-center py-20 text-gray-500">
          No se encontró la entidad.
          <div className="mt-4">
            <button
              onClick={() => navigateToEntity(null)}
              className="px-4 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg"
            >
              Regresar al listado
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToEntity(null)}
              className="p-2 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              title="Regresar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{entidad.nombre}</h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    TIPO_BADGE[entidad.tipo] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {TIPO_LABEL[entidad.tipo] || entidad.tipo}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {entidad.razon_social || entidad.rfc || ''} · {entidad.status || 'Activo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEntityModal(entidad)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
            >
              <Pencil size={16} />
              Editar
            </button>
            <button
              onClick={() =>
                setConfirmDelete({ type: 'entidad', id: entidad.id, name: entidad.nombre })
              }
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {ENTITY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeEntityTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEntityTab(tab.id)}
                  className={classNames(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                    active
                      ? 'text-p3-red border-p3-red bg-red-50/50'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 lg:p-6">
            {activeEntityTab === 'general' && renderTabGeneral(entidad)}
            {activeEntityTab === 'contactos' && renderTabContactos()}
            {activeEntityTab === 'granjas' && renderTabGranjas()}
            {activeEntityTab === 'ubicaciones' && renderTabUbicaciones()}
            {activeEntityTab === 'paqueterias' && renderTabPaqueterias()}
            {activeEntityTab === 'descuentos' && renderTabDescuentos()}
            {activeEntityTab === 'documentos' && renderTabDocumentos()}
          </div>
        </div>
      </div>
    );
  }

  function renderTabGeneral(entidad) {
    const fields = [
      { label: 'ID externo', value: entidad.id_externo },
      { label: 'Nombre', value: entidad.nombre },
      { label: 'Razón social', value: entidad.razon_social },
      { label: 'RFC', value: entidad.rfc },
      { label: 'Tipo de persona', value: entidad.tipo_persona },
      { label: 'Régimen fiscal', value: entidad.regimen_fiscal },
      { label: 'Uso CFDI', value: entidad.uso_cfdi },
      { label: 'Correo CFDI', value: entidad.correo_cfdi },
      { label: 'Teléfono', value: entidad.telefono },
      { label: 'Email', value: entidad.email },
      { label: 'Condición de pago', value: entidad.condicion_pago },
      { label: 'Días de crédito', value: entidad.dias_credito },
      { label: 'Vendedor', value: entidad.vendedor },
      { label: 'Industria', value: entidad.industria },
      { label: 'Interés principal', value: entidad.interes_principal },
      { label: 'Puntuación', value: entidad.puntuacion },
      { label: 'Status', value: entidad.status },
      { label: 'Link documentos', value: entidad.link_documentos, isLink: true },
      { label: 'Notas', value: entidad.notas },
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Información general</h3>
          <button
            onClick={() => handleOpenEntityModal(entidad)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors"
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <div key={f.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              {f.isLink && f.value ? (
                <a
                  href={f.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-p3-blue hover:underline break-all"
                >
                  {f.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-900">{f.value || '-'}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render helpers: tablas de relación
  // ---------------------------------------------------------------------------

  function SectionHeader({ title, onAdd }) {
    return (
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>
    );
  }

  function EmptyState({ message }) {
    return <p className="text-sm text-gray-500 py-6 text-center bg-gray-50 rounded-lg">{message}</p>;
  }

  function ActionButtons({ onEdit, onDelete }) {
    return (
      <div className="inline-flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Contactos
  // ---------------------------------------------------------------------------

  function renderTabContactos() {
    const items = detail?.contactos || [];
    return (
      <div>
        <SectionHeader
          title="Contactos"
          onAdd={() => setModal({ type: 'contacto', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay contactos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-3 font-semibold">Nombre</th>
                  <th className="py-2 px-3 font-semibold">Puesto</th>
                  <th className="py-2 px-3 font-semibold">Departamento</th>
                  <th className="py-2 px-3 font-semibold">Teléfono</th>
                  <th className="py-2 px-3 font-semibold">WhatsApp</th>
                  <th className="py-2 px-3 font-semibold">Email</th>
                  <th className="py-2 px-3 font-semibold">Principal</th>
                  <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-3 font-medium text-gray-900">{item.nombre}</td>
                    <td className="py-2 px-3 text-gray-600">{item.puesto || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.departamento || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.telefono || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.whatsapp || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.email || '-'}</td>
                    <td className="py-2 px-3">
                      {item.principal ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Sí
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ type: 'contacto', data: item })}
                        onDelete={() =>
                          setConfirmDelete({ type: 'contacto', id: item.id, name: item.nombre })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Granjas
  // ---------------------------------------------------------------------------

  function renderTabGranjas() {
    const items = detail?.granjas || [];
    return (
      <div>
        <SectionHeader
          title="Granjas"
          onAdd={() => setModal({ type: 'granja', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay granjas registradas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-3 font-semibold">ID externo</th>
                  <th className="py-2 px-3 font-semibold">Nombre</th>
                  <th className="py-2 px-3 font-semibold">Tipo</th>
                  <th className="py-2 px-3 font-semibold">Paso</th>
                  <th className="py-2 px-3 font-semibold">Contacto</th>
                  <th className="py-2 px-3 font-semibold">Teléfono</th>
                  <th className="py-2 px-3 font-semibold">Correo</th>
                  <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-3 text-gray-500 font-mono text-xs">{item.granja_id_externo || '-'}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{item.nombre}</td>
                    <td className="py-2 px-3 text-gray-600">{item.tipo || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.paso || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">
                      {item.contacto_nombre || '-'} {item.contacto_puesto ? `(${item.contacto_puesto})` : ''}
                    </td>
                    <td className="py-2 px-3 text-gray-600">{item.contacto_telefono || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.contacto_correo || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ type: 'granja', data: item })}
                        onDelete={() =>
                          setConfirmDelete({ type: 'granja', id: item.id, name: item.nombre })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Ubicaciones
  // ---------------------------------------------------------------------------

  function renderTabUbicaciones() {
    const items = detail?.ubicaciones || [];
    return (
      <div>
        <SectionHeader
          title="Domicilios"
          onAdd={() => setModal({ type: 'ubicacion', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay domicilios registrados." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.nombre || 'Domicilio'}</p>
                    <p className="text-xs text-gray-500">{item.tipo || ''}</p>
                  </div>
                  <ActionButtons
                    onEdit={() => setModal({ type: 'ubicacion', data: item })}
                    onDelete={() =>
                      setConfirmDelete({ type: 'ubicacion', id: item.id, name: item.nombre || 'ubicación' })
                    }
                  />
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{item.direccion || [item.calle, item.numero, item.colonia, item.cp, item.ciudad, item.estado].filter(Boolean).join(', ') || '-'}</p>
                  {item.coordenadas && <p className="text-xs font-mono">{item.coordenadas}</p>}
                  {item.link_mapa && (
                    <a
                      href={item.link_mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-p3-blue hover:underline text-xs"
                    >
                      <ExternalLink size={12} />
                      Ver mapa
                    </a>
                  )}
                  {item.notas && <p className="text-xs text-gray-500 mt-2">{item.notas}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Paqueterías
  // ---------------------------------------------------------------------------

  function renderTabPaqueterias() {
    const items = detail?.paqueterias || [];
    return (
      <div>
        <SectionHeader
          title="Paqueterías"
          onAdd={() => setModal({ type: 'paqueteria', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay paqueterías registradas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-3 font-semibold">Paquetería</th>
                  <th className="py-2 px-3 font-semibold">Tipo envío</th>
                  <th className="py-2 px-3 font-semibold">Ocurre/Domicilio</th>
                  <th className="py-2 px-3 font-semibold">Atención a</th>
                  <th className="py-2 px-3 font-semibold">Teléfono</th>
                  <th className="py-2 px-3 font-semibold">Correo guía</th>
                  <th className="py-2 px-3 font-semibold">Tipo pago</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-3 font-medium text-gray-900">{item.paqueteria || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.tipo_envio || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.ocurre_domicilio || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.atencion_a || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.telefono || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.correo_guia || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.tipo_pago || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.status || 'Activo'}</td>
                    <td className="py-2 px-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ type: 'paqueteria', data: item })}
                        onDelete={() =>
                          setConfirmDelete({ type: 'paqueteria', id: item.id, name: item.paqueteria || 'paquetería' })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Portales
  // ---------------------------------------------------------------------------

  function renderTabPortales() {
    const items = detail?.portales || [];
    return (
      <div>
        <SectionHeader
          title="Portales"
          onAdd={() => setModal({ type: 'portal', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay portales registrados." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-p3-red" />
                    <p className="font-medium text-gray-900">{item.nombre || 'Portal'}</p>
                  </div>
                  <ActionButtons
                    onEdit={() => setModal({ type: 'portal', data: item })}
                    onDelete={() =>
                      setConfirmDelete({ type: 'portal', id: item.id, name: item.nombre || 'portal' })
                    }
                  />
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-p3-blue hover:underline break-all"
                    >
                      {item.url}
                    </a>
                  )}
                  <p>Usuario: <span className="font-mono text-xs">{item.usuario || '-'}</span></p>
                  <p>Contraseña: <span className="font-mono text-xs">{item.password || '-'}</span></p>
                  {item.persona_apoyo && <p>Apoyo: {item.persona_apoyo}</p>}
                  {item.notas && <p className="text-xs text-gray-500 mt-2">{item.notas}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Descuentos
  // ---------------------------------------------------------------------------

  function renderTabDescuentos() {
    const items = detail?.descuentos || [];
    const entidad = detail?.entidad;
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Días de crédito</p>
            <p className="text-lg font-bold text-gray-900">{entidad?.dias_credito || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Condición de pago</p>
            <p className="text-lg font-bold text-gray-900">{entidad?.condicion_pago || '-'}</p>
          </div>
        </div>
        <SectionHeader
          title="Descuentos por marca"
          onAdd={() => setModal({ type: 'descuento', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay descuentos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-3 font-semibold">Marca</th>
                  <th className="py-2 px-3 font-semibold">Descuento</th>
                  <th className="py-2 px-3 font-semibold">Notas</th>
                  <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-3 font-medium text-gray-900">{item.marca || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.descuento || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.notas || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ type: 'descuento', data: item })}
                        onDelete={() =>
                          setConfirmDelete({ type: 'descuento', id: item.id, name: item.marca || 'descuento' })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Documentos
  // ---------------------------------------------------------------------------

  function renderTabDocumentos() {
    const items = detail?.documentos || [];
    return (
      <div>
        <SectionHeader
          title="Documentos"
          onAdd={() => setModal({ type: 'documento', data: null })}
        />
        {items.length === 0 ? (
          <EmptyState message="No hay documentos registrados (placeholder)." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-3 font-semibold">Tipo</th>
                  <th className="py-2 px-3 font-semibold">Nombre archivo</th>
                  <th className="py-2 px-3 font-semibold">Ruta</th>
                  <th className="py-2 px-3 font-semibold">Notas</th>
                  <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-3 text-gray-600">{item.tipo || '-'}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{item.nombre_archivo || '-'}</td>
                    <td className="py-2 px-3 text-gray-600 font-mono text-xs">{item.ruta_archivo || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.notas || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ type: 'documento', data: item })}
                        onDelete={() =>
                          setConfirmDelete({ type: 'documento', id: item.id, name: item.nombre_archivo || 'documento' })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Portales global
  // ---------------------------------------------------------------------------

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
              <th className="py-3 px-3 font-semibold">Apoyo</th>
              <th className="py-3 px-3 font-semibold">Notas</th>
              <th className="py-3 px-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {portales.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
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
                  <td className="py-3 px-3 text-gray-600 text-xs">{p.persona_apoyo || '-'}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{p.notas || '-'}</td>
                  <td className="py-3 px-3 text-right">
                    <ActionButtons
                      onEdit={() => setModal({ type: 'portal', data: { ...p, global: true } })}
                      onDelete={() =>
                        setConfirmDelete({ type: 'portal', id: p.id, name: p.portal || 'portal' })
                      }
                    />
                  </td>
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

  function renderAnalyticsSection() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Analytics del portal</h2>
              <p className="text-xs text-gray-500">
                Información privada, no se comparte con terceros.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                {[
                  { id: 'general', label: 'General' },
                  { id: 'publico', label: 'Público detallado' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAnalyticsTab(tab.id)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      analyticsTab === tab.id
                        ? 'bg-p3-red text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <select
                value={analyticsDias}
                onChange={(e) => setAnalyticsDias(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 3 meses</option>
                <option value={365}>Último año</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={analyticsFechaDesde}
                  onChange={(e) => setAnalyticsFechaDesde(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                  title="Desde"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={analyticsFechaHasta}
                  onChange={(e) => setAnalyticsFechaHasta(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
                  title="Hasta"
                />
                {(analyticsFechaDesde || analyticsFechaHasta) && (
                  <button
                    onClick={() => {
                      setAnalyticsFechaDesde('');
                      setAnalyticsFechaHasta('');
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {renderAlertas()}

        {analyticsTab === 'general' && renderAnalyticsGeneral()}
        {analyticsTab === 'publico' && renderAnalyticsPublico()}
      </div>
    );
  }

  function renderAlertas() {
    if (alertasLoading || !alertasData) return null;
    if (!alertasData.alertas_activas) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Shield size={18} />
          No hay alertas de seguridad en el período seleccionado.
        </div>
      );
    }

    const {
      total_intentos_fallidos,
      ips_sospechosas,
      ips_con_intentos_fallidos,
      emails_con_intentos_fallidos,
      intentos_recientes,
    } = alertasData;

    const tieneIpsSospechosas = ips_sospechosas && ips_sospechosas.length > 0;

    return (
      <div className={`border rounded-xl p-4 ${tieneIpsSospechosas ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${tieneIpsSospechosas ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${tieneIpsSospechosas ? 'text-red-800' : 'text-amber-800'}`}>
              Alerta de seguridad
            </h3>
            <p className={`text-sm mt-1 ${tieneIpsSospechosas ? 'text-red-700' : 'text-amber-700'}`}>
              Se detectaron <strong>{total_intentos_fallidos}</strong> intentos de login fallidos en el período.
            </p>

            {ips_sospechosas.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-red-700 uppercase">IPs sospechosas (≥5 intentos)</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ips_sospechosas.map((ip, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-mono">
                      {ip.ip} ({ip.total})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {ips_con_intentos_fallidos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">IPs con intentos fallidos</p>
                  <ul className="space-y-1">
                    {ips_con_intentos_fallidos.slice(0, 10).map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-gray-700">{item.ip}</span>
                        <span className="font-medium text-gray-900">{item.total}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {emails_con_intentos_fallidos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Emails atacados</p>
                  <ul className="space-y-1">
                    {emails_con_intentos_fallidos.slice(0, 10).map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[180px]">{item.email || 'Anónimo'}</span>
                        <span className="font-medium text-gray-900">{item.total}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {intentos_recientes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Intentos recientes</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-1 px-2">Fecha</th>
                        <th className="py-1 px-2">IP</th>
                        <th className="py-1 px-2">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {intentos_recientes.slice(0, 5).map((item, i) => (
                        <tr key={i}>
                          <td className="py-1 px-2 text-gray-600">{new Date(item.created_at).toLocaleString('es-MX')}</td>
                          <td className="py-1 px-2 font-mono text-gray-700">{item.ip}</td>
                          <td className="py-1 px-2 text-gray-700">{item.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderAnalyticsGeneral() {
    if (analyticsLoading) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-500">Cargando analytics...</p>
        </div>
      );
    }

    if (!analyticsData) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No hay datos de analytics disponibles.
        </div>
      );
    }

    const {
      total_eventos,
      visitantes_unicos,
      usuarios_unicos,
      secciones_mas_visitadas,
      paginas_mas_visitadas,
      usuarios_mas_activos,
      eventos_por_mes,
      eventos_por_tipo,
      actividad_reciente,
    } = analyticsData;

    const maxMes = Math.max(...eventos_por_mes.map((d) => d.total), 1);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {[
              { id: 'todos', label: 'Todo' },
              { id: 'publico', label: 'Sitio público' },
              { id: 'admin', label: 'Panel admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAnalyticsTipo(tab.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  analyticsTipo === tab.id
                    ? 'bg-p3-red text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total eventos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{total_eventos.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Visitantes únicos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{visitantes_unicos.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Usuarios logueados</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{usuarios_unicos.toLocaleString()}</p>
          </div>
        </div>

        {/* Embudo de conversión */}
        {(() => {
          const porTipo = eventos_por_tipo || [];
          const totalEvento = (tipo) => {
            const item = porTipo.find((t) => t.event_type === tipo);
            return item ? item.total : 0;
          };
          const visitas = totalEvento('page_view');
          const pasos = [
            { key: 'page_view', label: 'Visitas' },
            { key: 'login', label: 'Logins' },
            { key: 'cotizacion_guardar', label: 'Cotizaciones guardadas' },
            { key: 'cotizacion_pdf', label: 'PDFs generados' },
          ].map((p) => ({ ...p, total: totalEvento(p.key) }));
          if (visitas === 0 && pasos.every((p) => p.total === 0)) return null;
          const maxPaso = Math.max(...pasos.map((p) => p.total), 1);
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Embudo de conversión</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {pasos.map((p) => {
                  const pct = visitas > 0 ? ((p.total / visitas) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={p.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">{p.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{p.total.toLocaleString()}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-p3-red h-1.5 rounded-full"
                          style={{ width: `${Math.round((p.total / maxPaso) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {p.key === 'page_view' ? '100%' : `${pct}% de las visitas`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Gráfico eventos por mes */}
        {eventos_por_mes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Eventos por mes</h3>
            <div className="flex items-end gap-3 h-48">
              {eventos_por_mes.map((d) => {
                const height = `${Math.round((d.total / maxMes) * 100)}%`;
                return (
                  <div key={d.mes} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div className="w-full bg-gray-100 rounded-t-lg relative h-full">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-p3-red rounded-t-lg transition-all"
                        style={{ height }}
                        title={`${d.mes}: ${d.total}`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {d.mes.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Secciones más visitadas</h3>
            {secciones_mas_visitadas.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos</p>
            ) : (
              <ul className="space-y-2">
                {secciones_mas_visitadas.map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">{s.section}</span>
                    <span className="font-medium text-gray-900">{s.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Páginas más visitadas</h3>
            {paginas_mas_visitadas.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos</p>
            ) : (
              <ul className="space-y-2">
                {paginas_mas_visitadas.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[180px]">{p.path || '/'}</span>
                    <span className="font-medium text-gray-900">{p.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Usuarios más activos</h3>
            {usuarios_mas_activos.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos</p>
            ) : (
              <ul className="space-y-2">
                {usuarios_mas_activos.map((u, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[180px]">{u.user_email}</span>
                    <span className="font-medium text-gray-900">{u.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Actividad reciente</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 px-2 font-semibold">Fecha</th>
                  <th className="py-2 px-2 font-semibold">Usuario</th>
                  <th className="py-2 px-2 font-semibold">Evento</th>
                  <th className="py-2 px-2 font-semibold">Sección</th>
                  <th className="py-2 px-2 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {actividad_reciente.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60">
                    <td className="py-2 px-2 text-gray-600 text-xs">
                      {new Date(a.created_at).toLocaleString('es-MX')}
                    </td>
                    <td className="py-2 px-2 text-gray-700 text-xs">{a.user_email || 'Anónimo'}</td>
                    <td className="py-2 px-2 text-gray-700 text-xs capitalize">{a.event_type}</td>
                    <td className="py-2 px-2 text-gray-700 text-xs">{a.section || '-'}</td>
                    <td className="py-2 px-2 text-gray-500 text-xs font-mono">{a.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderAnalyticsPublico() {
    if (publicoLoading) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-500">Cargando analytics público...</p>
        </div>
      );
    }

    if (!publicoData) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No hay datos de analytics público disponibles.
        </div>
      );
    }

    const {
      porDia,
      porHora,
      dispositivos,
      navegadores,
      sistemas,
      paises,
      referrers,
      paginas,
    } = publicoData;

    const totalEventos = porDia.reduce((sum, d) => sum + d.total, 0);
    const totalVisitantes = new Set(
      // Aproximación: no tenemos session_id por endpoint, usamos total de eventos
      []
    ).size;

    function SimpleBarChart({
      data,
      labelKey = 'nombre',
      valueKey = 'total',
      color = 'bg-p3-red',
      horizontal = false,
      height = 'h-56',
      formatLabel,
      showValue = true,
    }) {
      if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500">Sin datos</p>;
      }
      const max = Math.max(...data.map((d) => d[valueKey]), 1);

      const format = (value) => (formatLabel ? formatLabel(value, data) : String(value));

      if (horizontal) {
        return (
          <div className="space-y-3">
            {data.map((d, i) => {
              const pct = Math.round((d[valueKey] / max) * 100);
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 truncate max-w-[60%]">{d[labelKey]}</span>
                    <span className="font-medium text-gray-900">{d[valueKey].toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 relative">
                    <div
                      className={`${color} h-3 rounded-full transition-all group-hover:opacity-80`}
                      style={{ width: `${pct}%` }}
                    ></div>
                    <div className="absolute left-0 -top-8 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                      {d[labelKey]}: {d[valueKey].toLocaleString()} ({pct}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <div className={`relative ${height}`}>
          {/* Líneas de cuadrícula horizontales */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100 w-full"></div>
            ))}
          </div>
          <div className="relative h-full flex items-end gap-2 pl-2 pr-2">
            {data.map((d, i) => {
              const pct = Math.round((d[valueKey] / max) * 100) || 3;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end group">
                  <div className="relative w-full flex justify-center" style={{ height: `${pct}%` }}>
                    <div
                      className={`w-full ${color} rounded-t-md transition-all group-hover:opacity-80 self-end`}
                    >
                      {showValue && (
                        <span className="block text-center text-[10px] font-semibold text-gray-700 whitespace-nowrap -mt-4">
                          {d[valueKey].toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                      {d[labelKey]}: {d[valueKey].toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 truncate w-full text-center leading-tight">
                    {format(d[labelKey])}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    function HeatmapDiaHora({ data }) {
      if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500">Sin datos</p>;
      }

      const max = Math.max(...data.map((d) => d.total), 1);
      const lookup = {};
      data.forEach((d) => {
        lookup[`${d.dia_semana}-${d.hora}`] = d.total;
      });

      const horas = [...Array(24).keys()];
      // %w: 0=Dom, 1=Lun ... 6=Sáb. Ordenamos de lunes a domingo.
      const filas = [1, 2, 3, 4, 5, 6, 0];
      const nombres = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };

      return (
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px]">
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: '2.5rem repeat(24, 1fr)' }}>
              <span></span>
              {horas.map((h) => (
                <span key={h} className="text-[9px] text-gray-400 text-center leading-tight">
                  {h % 3 === 0 ? `${String(h).padStart(2, '0')}` : ''}
                </span>
              ))}
              {filas.map((dia) => (
                <Fragment key={dia}>
                  <span className="text-[10px] text-gray-500 pr-1 self-center text-right">{nombres[dia]}</span>
                  {horas.map((h) => {
                    const total = lookup[`${dia}-${String(h).padStart(2, '0')}`] || 0;
                    const intensity = total > 0 ? 0.15 + 0.85 * (total / max) : 0;
                    return (
                      <div
                        key={h}
                        className="group relative h-6 rounded-[3px] transition-transform hover:scale-110 cursor-default"
                        style={{
                          backgroundColor:
                            total > 0 ? `rgba(196, 30, 58, ${intensity.toFixed(2)})` : '#F3F4F6',
                        }}
                      >
                        {total > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-20 shadow-lg pointer-events-none">
                            {nombres[dia]} {String(h).padStart(2, '0')}:00 — {total.toLocaleString()} eventos
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
              <span>Menos</span>
              {[0.15, 0.35, 0.55, 0.75, 1].map((a) => (
                <span key={a} className="w-4 h-3 rounded-[2px]" style={{ backgroundColor: `rgba(196, 30, 58, ${a})` }}></span>
              ))}
              <span>Más</span>
            </div>
          </div>
        </div>
      );
    }

    function RankedList({ data, labelKey = 'nombre', valueKey = 'total', maxItems = 10 }) {
      if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500">Sin datos</p>;
      }
      return (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {data.slice(0, maxItems).map((d, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate max-w-[75%]">{d[labelKey]}</span>
              <span className="font-medium text-gray-900">{d[valueKey].toLocaleString()}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Eventos públicos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalEventos.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Días con tráfico</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{porDia.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Dispositivos distintos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dispositivos.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase font-semibold">Navegadores distintos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{navegadores.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Visitas por día</h3>
            <SimpleBarChart
              data={porDia}
              labelKey="dia"
              valueKey="total"
              height="h-80"
              formatLabel={(dia) => {
                if (!dia) return dia;
                const [y, m, d] = String(dia).split('-');
                if (!d) return dia;
                return `${d}/${m}`;
              }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Visitas por hora (UTC)</h3>
            <SimpleBarChart
              data={porHora}
              labelKey="hora"
              valueKey="total"
              color="bg-blue-500"
              height="h-80"
              formatLabel={(hora) => `${String(hora).padStart(2, '0')}:00`}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Heatmap de actividad (día × hora UTC)</h3>
          <HeatmapDiaHora data={publicoData?.porDiaHora || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Dispositivos</h3>
            <SimpleBarChart data={dispositivos} color="bg-emerald-500" horizontal />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Navegadores</h3>
            <SimpleBarChart data={navegadores} color="bg-violet-500" horizontal />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Sistemas operativos</h3>
            <SimpleBarChart data={sistemas} color="bg-amber-500" horizontal />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Países</h3>
            <RankedList data={paises} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Ciudades</h3>
            <RankedList data={publicoData?.ciudades || []} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Origen del tráfico (referrers)</h3>
            <RankedList data={referrers} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Páginas públicas más visitadas</h3>
          <RankedList data={paginas} maxItems={20} />
        </div>
      </div>
    );
  }

  function renderPortalesSection() {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="mb-4 pb-3 border-b border-gray-100">
          <SectionHeader
            title="Portales de clientes y proveedores"
            onAdd={() => setModal({ type: 'portal', data: { global: true } })}
          />
          <p className="text-xs text-gray-500 mt-1">Usuarios y contraseñas de acceso a portales.</p>
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

  // ---------------------------------------------------------------------------
  // Modales
  // ---------------------------------------------------------------------------

  function Modal({ title, onClose, children }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    );
  }

  function FormInput({ label, value, onChange, type = 'text', required = false, placeholder = '', rows }) {
    const baseClass =
      'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red';
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-p3-red"> *</span>}
        </label>
        {rows ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={baseClass}
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={baseClass}
          />
        )}
      </div>
    );
  }

  function FormSelect({ label, value, onChange, options, required = false }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-p3-red"> *</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function FormCheckbox({ label, checked, onChange }) {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked ? 1 : 0)}
          className="w-4 h-4 text-p3-red border-gray-300 rounded focus:ring-p3-red"
        />
        {label}
      </label>
    );
  }

  function ModalFooter({ onClose, disabled, savingText = 'Guardando...', saveText = 'Guardar' }) {
    return (
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-white bg-p3-red hover:bg-p3-red-dark rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Save size={16} />
          {disabled ? savingText : saveText}
        </button>
      </div>
    );
  }

  function EntityModal() {
    const initial = modal.data || {
      tipo: activeCrmTab === 'proveedores' ? 'proveedor' : 'cliente',
      status: 'Activo',
    };
    const [form, setForm] = useState(initial);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <Modal title={form.id ? 'Editar entidad' : 'Nueva entidad'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEntity(form);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Tipo"
              value={form.tipo}
              onChange={(v) => update('tipo', v)}
              required
              options={[
                { value: 'cliente', label: 'Cliente' },
                { value: 'proveedor', label: 'Proveedor' },
                { value: 'ambos', label: 'Ambos' },
              ]}
            />
            <FormInput label="ID externo" value={form.id_externo} onChange={(v) => update('id_externo', v)} />
          </div>
          <FormInput label="Nombre" value={form.nombre} onChange={(v) => update('nombre', v)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Razón social" value={form.razon_social} onChange={(v) => update('razon_social', v)} />
            <FormInput label="RFC" value={form.rfc} onChange={(v) => update('rfc', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Tipo de persona"
              value={form.tipo_persona || ''}
              onChange={(v) => update('tipo_persona', v || null)}
              options={[
                { value: '', label: '—' },
                { value: 'Física', label: 'Física' },
                { value: 'Moral', label: 'Moral' },
              ]}
            />
            <FormInput label="Régimen fiscal" value={form.regimen_fiscal} onChange={(v) => update('regimen_fiscal', v)} />
            <FormInput label="Uso CFDI" value={form.uso_cfdi} onChange={(v) => update('uso_cfdi', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Correo CFDI" value={form.correo_cfdi} onChange={(v) => update('correo_cfdi', v)} />
            <FormInput label="Email general" value={form.email} onChange={(v) => update('email', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Teléfono" value={form.telefono} onChange={(v) => update('telefono', v)} />
            <FormInput label="Vendedor" value={form.vendedor} onChange={(v) => update('vendedor', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Condición de pago" value={form.condicion_pago} onChange={(v) => update('condicion_pago', v)} />
            <FormInput label="Días de crédito" value={form.dias_credito} onChange={(v) => update('dias_credito', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Industria" value={form.industria} onChange={(v) => update('industria', v)} />
            <FormInput label="Interés principal" value={form.interes_principal} onChange={(v) => update('interes_principal', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              type="number"
              label="Puntuación (0-100)"
              value={form.puntuacion}
              onChange={(v) => update('puntuacion', v === '' ? null : parseInt(v, 10))}
            />
            <FormSelect
              label="Status"
              value={form.status || 'Activo'}
              onChange={(v) => update('status', v)}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
            />
            <FormInput label="Link documentos" value={form.link_documentos} onChange={(v) => update('link_documentos', v)} />
          </div>
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving || !form.nombre?.trim()} />
        </form>
      </Modal>
    );
  }

  function ContactoModal() {
    const initial = modal.data || { principal: 0 };
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <Modal title={form.id ? 'Editar contacto' : 'Nuevo contacto'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarContactoCrm(form.id, form)
                  : crearContactoCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <FormInput label="Nombre" value={form.nombre} onChange={(v) => update('nombre', v)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Puesto" value={form.puesto} onChange={(v) => update('puesto', v)} />
            <FormInput label="Departamento" value={form.departamento} onChange={(v) => update('departamento', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Teléfono" value={form.telefono} onChange={(v) => update('telefono', v)} />
            <FormInput label="WhatsApp" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Email" value={form.email} onChange={(v) => update('email', v)} />
            <FormInput label="Correos facturas" value={form.correos_facturas} onChange={(v) => update('correos_facturas', v)} />
          </div>
          <FormInput label="Dirección de entrega" value={form.direccion_entrega} onChange={(v) => update('direccion_entrega', v)} />
          <FormCheckbox label="Contacto principal" checked={form.principal} onChange={(v) => update('principal', v)} />
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving || !form.nombre?.trim()} />
        </form>
      </Modal>
    );
  }

  function GranjaModal() {
    const initial = modal.data || {};
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <Modal title={form.id ? 'Editar granja' : 'Nueva granja'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarGranjaCrm(form.id, form)
                  : crearGranjaCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="ID externo" value={form.granja_id_externo} onChange={(v) => update('granja_id_externo', v)} />
            <FormInput label="Nombre" value={form.nombre} onChange={(v) => update('nombre', v)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Tipo" value={form.tipo} onChange={(v) => update('tipo', v)} />
            <FormInput label="Paso" value={form.paso} onChange={(v) => update('paso', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Contacto" value={form.contacto_nombre} onChange={(v) => update('contacto_nombre', v)} />
            <FormInput label="Puesto" value={form.contacto_puesto} onChange={(v) => update('contacto_puesto', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Teléfono" value={form.contacto_telefono} onChange={(v) => update('contacto_telefono', v)} />
            <FormInput label="Correo" value={form.contacto_correo} onChange={(v) => update('contacto_correo', v)} />
          </div>
          <FormInput label="Comentarios" value={form.comentarios} onChange={(v) => update('comentarios', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving || !form.nombre?.trim()} />
        </form>
      </Modal>
    );
  }

  function UbicacionModal() {
    const initial = modal.data || { tipo: 'oficina' };
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const granjas = detail?.granjas || [];

    return (
      <Modal title={form.id ? 'Editar domicilio' : 'Nuevo domicilio'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarUbicacionCrm(form.id, form)
                  : crearUbicacionCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Nombre / alias" value={form.nombre} onChange={(v) => update('nombre', v)} />
            <FormSelect
              label="Tipo"
              value={form.tipo || ''}
              onChange={(v) => update('tipo', v || null)}
              options={[
                { value: '', label: '—' },
                { value: 'oficina', label: 'Oficina' },
                { value: 'granja', label: 'Granja' },
                { value: 'bodega', label: 'Bodega' },
                { value: 'fiscal', label: 'Fiscal' },
                { value: 'envio', label: 'Envío' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Granja asociada</label>
            <select
              value={form.granja_id || ''}
              onChange={(e) => update('granja_id', e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
            >
              <option value="">Ninguna</option>
              {granjas.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Calle" value={form.calle} onChange={(v) => update('calle', v)} />
            <FormInput label="Número" value={form.numero} onChange={(v) => update('numero', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="Colonia" value={form.colonia} onChange={(v) => update('colonia', v)} />
            <FormInput label="CP" value={form.cp} onChange={(v) => update('cp', v)} />
            <FormInput label="Ciudad" value={form.ciudad} onChange={(v) => update('ciudad', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Estado" value={form.estado} onChange={(v) => update('estado', v)} />
            <FormInput label="País" value={form.pais} onChange={(v) => update('pais', v)} />
          </div>
          <FormInput label="Dirección completa" value={form.direccion} onChange={(v) => update('direccion', v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Coordenadas" value={form.coordenadas} onChange={(v) => update('coordenadas', v)} />
            <FormInput label="Link mapa" value={form.link_mapa} onChange={(v) => update('link_mapa', v)} />
          </div>
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving} />
        </form>
      </Modal>
    );
  }

  function PaqueteriaModal() {
    const initial = modal.data || { status: 'Activo' };
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const ubicaciones = detail?.ubicaciones || [];

    return (
      <Modal title={form.id ? 'Editar paquetería' : 'Nueva paquetería'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarPaqueteriaCrm(form.id, form)
                  : crearPaqueteriaCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="ID externo" value={form.paqueteria_id_externo} onChange={(v) => update('paqueteria_id_externo', v)} />
            <FormInput label="Paquetería" value={form.paqueteria} onChange={(v) => update('paqueteria', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación asociada</label>
            <select
              value={form.ubicacion_id || ''}
              onChange={(e) => update('ubicacion_id', e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
            >
              <option value="">Ninguna</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre || u.direccion || `Ubicación ${u.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Tipo de envío" value={form.tipo_envio} onChange={(v) => update('tipo_envio', v)} />
            <FormInput label="Ocurre / Domicilio" value={form.ocurre_domicilio} onChange={(v) => update('ocurre_domicilio', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Atención a" value={form.atencion_a} onChange={(v) => update('atencion_a', v)} />
            <FormInput label="Teléfono" value={form.telefono} onChange={(v) => update('telefono', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Correo guía" value={form.correo_guia} onChange={(v) => update('correo_guia', v)} />
            <FormInput label="Tipo de pago" value={form.tipo_pago} onChange={(v) => update('tipo_pago', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Facturado a" value={form.facturado_a} onChange={(v) => update('facturado_a', v)} />
            <FormSelect
              label="Status"
              value={form.status || 'Activo'}
              onChange={(v) => update('status', v)}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
            />
          </div>
          <FormInput label="Comentarios" value={form.comentarios} onChange={(v) => update('comentarios', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving} />
        </form>
      </Modal>
    );
  }

  function PortalModal() {
    const initial = modal.data || {};
    const isGlobal = initial.global === true;
    const [form, setForm] = useState(initial);
    const [entidadesSelect, setEntidadesSelect] = useState([]);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    useEffect(() => {
      if (!isGlobal) return;
      let cancelled = false;
      fetchCrmEntidades('limit=100')
        .then((res) => {
          if (!cancelled) setEntidadesSelect(res.data || []);
        })
        .catch(() => {
          if (!cancelled) setEntidadesSelect([]);
        });
      return () => {
        cancelled = true;
      };
    }, [isGlobal]);

    const entidadId = isGlobal ? form.entidad_id : selectedEntityId;
    const puedeGuardar = entidadId && (form.id || form.password);

    return (
      <Modal title={form.id ? 'Editar portal' : 'Nuevo portal'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              nombre: form.nombre,
              url: form.url,
              usuario: form.usuario,
              password: form.password,
              persona_apoyo: form.persona_apoyo,
              notas: form.notas,
            };
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarPortalCrm(form.id, payload)
                  : crearPortalCrm(entidadId, payload),
              isGlobal ? cargarPortales : cargarDetalle
            );
          }}
          className="space-y-4"
        >
          {isGlobal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
              <select
                value={form.entidad_id || ''}
                onChange={(e) => update('entidad_id', Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red"
              >
                <option value="">Selecciona una empresa</option>
                {entidadesSelect.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <FormInput label="Nombre" value={form.nombre} onChange={(v) => update('nombre', v)} />
          <FormInput label="URL" value={form.url} onChange={(v) => update('url', v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Usuario" value={form.usuario} onChange={(v) => update('usuario', v)} />
            <FormInput
              label={form.id ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
              value={form.password || ''}
              onChange={(v) => update('password', v)}
              required={!form.id}
            />
          </div>
          <FormInput label="Persona de apoyo" value={form.persona_apoyo} onChange={(v) => update('persona_apoyo', v)} />
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving || !puedeGuardar} />
        </form>
      </Modal>
    );
  }

  function DescuentoModal() {
    const initial = modal.data || {};
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <Modal title={form.id ? 'Editar descuento' : 'Nuevo descuento'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarDescuentoCrm(form.id, form)
                  : crearDescuentoCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <FormInput label="Marca" value={form.marca} onChange={(v) => update('marca', v)} />
          <FormInput label="Descuento" value={form.descuento} onChange={(v) => update('descuento', v)} />
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving} />
        </form>
      </Modal>
    );
  }

  function DocumentoModal() {
    const initial = modal.data || {};
    const [form, setForm] = useState(initial);
    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <Modal title={form.id ? 'Editar documento' : 'Nuevo documento'} onClose={() => setModal({ type: null, data: null })}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRelacion(
              () =>
                form.id
                  ? actualizarDocumentoCrm(form.id, form)
                  : crearDocumentoCrm(selectedEntityId, form),
              cargarDetalle
            );
          }}
          className="space-y-4"
        >
          <FormInput label="Tipo" value={form.tipo} onChange={(v) => update('tipo', v)} />
          <FormInput label="Nombre archivo" value={form.nombre_archivo} onChange={(v) => update('nombre_archivo', v)} />
          <FormInput label="Ruta archivo" value={form.ruta_archivo} onChange={(v) => update('ruta_archivo', v)} />
          <FormInput label="Notas" value={form.notas} onChange={(v) => update('notas', v)} rows={3} />
          <ModalFooter onClose={() => setModal({ type: null, data: null })} disabled={saving} />
        </form>
      </Modal>
    );
  }

  function renderModal() {
    if (!modal.type) return null;
    switch (modal.type) {
      case 'entidad':
        return <EntityModal />;
      case 'contacto':
        return <ContactoModal />;
      case 'granja':
        return <GranjaModal />;
      case 'ubicacion':
        return <UbicacionModal />;
      case 'paqueteria':
        return <PaqueteriaModal />;
      case 'portal':
        return <PortalModal />;
      case 'descuento':
        return <DescuentoModal />;
      case 'documento':
        return <DocumentoModal />;
      default:
        return null;
    }
  }

  function ConfirmDeleteModal() {
    if (!confirmDelete.type) return null;
    const actionMap = {
      entidad: { fn: handleDeleteEntity, label: 'entidad' },
      contacto: {
        fn: () => handleDeleteRelacion(() => eliminarContactoCrm(confirmDelete.id), cargarDetalle),
        label: 'contacto',
      },
      granja: {
        fn: () => handleDeleteRelacion(() => eliminarGranjaCrm(confirmDelete.id), cargarDetalle),
        label: 'granja',
      },
      ubicacion: {
        fn: () => handleDeleteRelacion(() => eliminarUbicacionCrm(confirmDelete.id), cargarDetalle),
        label: 'domicilio',
      },
      paqueteria: {
        fn: () => handleDeleteRelacion(() => eliminarPaqueteriaCrm(confirmDelete.id), cargarDetalle),
        label: 'paquetería',
      },
      portal: {
        fn: () =>
          handleDeleteRelacion(
            () => eliminarPortalCrm(confirmDelete.id),
            activeSection === 'portales' ? cargarPortales : cargarDetalle
          ),
        label: 'portal',
      },
      descuento: {
        fn: () => handleDeleteRelacion(() => eliminarDescuentoCrm(confirmDelete.id), cargarDetalle),
        label: 'descuento',
      },
      documento: {
        fn: () => handleDeleteRelacion(() => eliminarDocumentoCrm(confirmDelete.id), cargarDetalle),
        label: 'documento',
      },
    };
    const action = actionMap[confirmDelete.type];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-full">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirmar eliminación</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el {action.label} <strong>{confirmDelete.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete({ type: null, id: null, name: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={action.fn}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

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
              {view === 'detail' && selectedEntityId && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-gray-700 font-medium">Ficha</span>
                </>
              )}
            </div>

            {error && !modal.type && !confirmDelete.type && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <X size={18} />
                {error}
              </div>
            )}

            {activeSection === 'crms' && renderCrmSection()}
            {activeSection === 'portales' && renderPortalesSection()}
            {activeSection === 'analytics' && renderAnalyticsSection()}
          </div>
        </main>
      </div>
      {renderModal()}
      <ConfirmDeleteModal />
    </div>
  );
}
