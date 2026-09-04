import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import DebouncedInput from '../components/ui/DebouncedInput.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import {
  fetchLogisticaResumen,
  fetchLogisticaDemanda,
  regenerarLogisticaDemanda,
  crearLogisticaDemanda,
  editarLogisticaDemanda,
  cerrarLogisticaDemanda,
  fetchLogisticaAbastecimientos,
  crearLogisticaAbastecimiento,
  editarLogisticaAbastecimiento,
  eliminarLogisticaAbastecimiento,
  fetchLogisticaAsignaciones,
  crearLogisticaAsignacion,
  eliminarLogisticaAsignacion,
  fetchLogisticaRecepciones,
  crearLogisticaRecepcion,
  fetchLogisticaProveedores,
  buscarCatalogoSae,
  fetchSubalmacenes,
} from '../utils/api';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  ShoppingCart,
  Split,
  PackageCheck,
  RefreshCw,
  LogOut,
  Boxes,
  AlarmClock,
  CalendarClock,
  HelpCircle,
  ListChecks,
  X,
  Pencil,
  Plus,
  Search,
  AlertCircle,
  Check,
  Info,
} from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'necesidades', label: 'Necesidades', icon: ClipboardList },
  { id: 'transito', label: 'En Tránsito', icon: Truck },
  { id: 'oc', label: 'OC / Abastecimientos', icon: ShoppingCart },
  { id: 'asignaciones', label: 'Asignaciones', icon: Split },
  { id: 'recepciones', label: 'Recepciones', icon: PackageCheck },
];

const TRANSITO_FILTROS = [
  { id: 'todo', label: 'Todo' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'stock', label: 'Stock' },
  { id: 'atrasados', label: 'Atrasados' },
  { id: 'proximos', label: 'Próximos' },
  { id: 'sin_asignar', label: 'Sin asignar' },
];

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];

const INPUT_CLS =
  'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red text-sm transition-shadow';

const formatNumber = (value) => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(num);
};

// apiFetch lanza un Error cuyo mensaje ya contiene el `detail` del servidor
// (422/409/403); se conserva el fallback a err.data.detail por si cambia.
const errMsg = (err) => err?.data?.detail || err?.message || 'Ocurrió un error inesperado';

function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const TIPO_BADGE = {
  PEDIDO: 'bg-blue-100 text-blue-700',
  STOCK: 'bg-emerald-100 text-emerald-700',
  OTRA: 'bg-violet-100 text-violet-700',
};

const ESTATUS_DEMANDA_BADGE = {
  pendiente: 'bg-red-100 text-red-700',
  parcial: 'bg-amber-100 text-amber-700',
  cubierta: 'bg-emerald-100 text-emerald-700',
};

const PRIORIDAD_BADGE = {
  baja: 'bg-gray-100 text-gray-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
};

const ESTATUS_ABS_BADGE = {
  solicitado: 'bg-gray-100 text-gray-700',
  transito: 'bg-blue-100 text-blue-700',
  parcial: 'bg-amber-100 text-amber-700',
  recibido: 'bg-emerald-100 text-emerald-700',
};

function tipoBadge(tipo) {
  return <Badge className={TIPO_BADGE[tipo] || 'bg-gray-100 text-gray-700'}>{tipo || '—'}</Badge>;
}

function estatusDemandaBadge(estatus) {
  return (
    <Badge className={ESTATUS_DEMANDA_BADGE[estatus] || 'bg-gray-100 text-gray-700'}>
      {estatus || '—'}
    </Badge>
  );
}

function prioridadBadge(prioridad) {
  return (
    <Badge className={PRIORIDAD_BADGE[prioridad] || 'bg-gray-100 text-gray-600'}>
      {prioridad || 'media'}
    </Badge>
  );
}

function estatusAbsBadge(estatus, atrasado) {
  return (
    <span className="inline-flex items-center gap-1">
      <Badge className={ESTATUS_ABS_BADGE[estatus] || 'bg-gray-100 text-gray-700'}>
        {estatus || '—'}
      </Badge>
      {atrasado && <Badge className="bg-red-600 text-white">ATRASADO</Badge>}
    </span>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal: alta manual de necesidad (tipo OTRA)
// ---------------------------------------------------------------------------
function NecesidadModal({ onClose, onGuardar, guardando }) {
  const [material, setMaterial] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [fechaRequerida, setFechaRequerida] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const valido =
    material.trim() !== '' && Number(cantidad) > 0 && justificacion.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valido) return;
    onGuardar({
      material: material.trim(),
      cantidad: Number(cantidad),
      justificacion: justificacion.trim(),
      prioridad: prioridad || undefined,
      fecha_requerida: fechaRequerida || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  return (
    <Modal title="Nueva necesidad manual" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Material *</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className={INPUT_CLS}
            placeholder="Código del material"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className={INPUT_CLS}
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Justificación *</label>
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={3}
            className={INPUT_CLS}
            placeholder="¿Por qué se necesita este material?"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha requerida</label>
          <input
            type="date"
            value={fechaRequerida}
            onChange={(e) => setFechaRequerida(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valido || guardando}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal: alta / edición de OC-abastecimiento (con búsqueda de catálogo y proveedores)
// ---------------------------------------------------------------------------
function AbastecimientoModal({ editando, onClose, onGuardar, guardando }) {
  const [material, setMaterial] = useState(editando?.material || '');
  const [descripcion, setDescripcion] = useState(editando?.descripcion || '');
  const [cantidad, setCantidad] = useState(editando ? String(editando.cantidad ?? '') : '');
  const [proveedor, setProveedor] = useState(editando?.proveedor || '');
  const [oc, setOc] = useState(editando?.oc || '');
  const [fechaEstimada, setFechaEstimada] = useState(editando?.fecha_estimada || '');
  const [estatus, setEstatus] = useState(editando?.estatus || 'solicitado');
  const [observaciones, setObservaciones] = useState(editando?.observaciones || '');

  const [catResultados, setCatResultados] = useState([]);
  const [catAbierto, setCatAbierto] = useState(false);
  const [provResultados, setProvResultados] = useState([]);
  const [provAbierto, setProvAbierto] = useState(false);
  const materialWrapperRef = useRef(null);
  const provWrapperRef = useRef(null);
  const materialTimeout = useRef(null);
  const provTimeout = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (materialWrapperRef.current && !materialWrapperRef.current.contains(e.target)) {
        setCatAbierto(false);
      }
      if (provWrapperRef.current && !provWrapperRef.current.contains(e.target)) {
        setProvAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(
    () => () => {
      if (materialTimeout.current) clearTimeout(materialTimeout.current);
      if (provTimeout.current) clearTimeout(provTimeout.current);
    },
    []
  );

  const handleMaterialChange = (val) => {
    setMaterial(val);
    if (materialTimeout.current) clearTimeout(materialTimeout.current);
    if (val.trim().length < 3) {
      setCatResultados([]);
      setCatAbierto(false);
      return;
    }
    materialTimeout.current = setTimeout(async () => {
      try {
        const res = await buscarCatalogoSae(val.trim());
        setCatResultados(res.productos || []);
        setCatAbierto(true);
      } catch {
        setCatResultados([]);
      }
    }, 400);
  };

  const handleProveedorChange = (val) => {
    setProveedor(val);
    if (provTimeout.current) clearTimeout(provTimeout.current);
    if (val.trim().length < 2) {
      setProvResultados([]);
      setProvAbierto(false);
      return;
    }
    provTimeout.current = setTimeout(async () => {
      try {
        const res = await fetchLogisticaProveedores(val.trim());
        setProvResultados(res.data || []);
        setProvAbierto(true);
      } catch {
        setProvResultados([]);
      }
    }, 300);
  };

  const valido = material.trim() !== '' && Number(cantidad) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valido) return;
    const payload = {
      material: material.trim(),
      cantidad: Number(cantidad),
      proveedor: proveedor.trim() || undefined,
      oc: oc.trim() || undefined,
      fecha_estimada: fechaEstimada || undefined,
      observaciones: observaciones.trim() || undefined,
    };
    if (editando) {
      payload.estatus = estatus;
      onGuardar(payload, editando.id);
    } else {
      onGuardar(payload, null);
    }
  };

  return (
    <Modal title={editando ? `Editar ${editando.folio || 'abastecimiento'}` : 'Nueva OC / abastecimiento'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative" ref={materialWrapperRef}>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Material * (escribe 3+ caracteres para buscar en catálogo)
          </label>
          <input
            type="text"
            value={material}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className={INPUT_CLS}
            placeholder="Código del material"
            autoFocus
          />
          {descripcion && <p className="text-xs text-gray-500 mt-1">{descripcion}</p>}
          {catAbierto && catResultados.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {catResultados.map((p) => (
                <button
                  key={p.codigo}
                  type="button"
                  onClick={() => {
                    setMaterial(p.codigo);
                    setDescripcion(p.descripcion || '');
                    setCatAbierto(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-gray-700"
                >
                  <span className="font-medium">{p.codigo}</span>
                  <span className="text-gray-500"> — {p.descripcion || 'sin descripción'}</span>
                  {p.existencia != null && (
                    <span className="text-xs text-gray-400"> (exist. {formatNumber(p.existencia)})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad comprada *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha estimada</label>
            <input
              type="date"
              value={fechaEstimada}
              onChange={(e) => setFechaEstimada(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div className="relative" ref={provWrapperRef}>
          <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
          <input
            type="text"
            value={proveedor}
            onChange={(e) => handleProveedorChange(e.target.value)}
            className={INPUT_CLS}
            placeholder="Buscar proveedor o capturar texto libre"
          />
          {provAbierto && provResultados.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {provResultados.map((p) => (
                <button
                  key={p.clave}
                  type="button"
                  onClick={() => {
                    setProveedor(`${p.clave} — ${p.nombre}`);
                    setProvAbierto(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-gray-700"
                >
                  <span className="font-medium">{p.clave}</span>
                  <span className="text-gray-500"> — {p.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">OC</label>
            <input
              type="text"
              value={oc}
              onChange={(e) => setOc(e.target.value)}
              className={INPUT_CLS}
              placeholder="Folio de orden de compra"
            />
          </div>
          {editando && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estatus</label>
              <select value={estatus} onChange={(e) => setEstatus(e.target.value)} className={INPUT_CLS}>
                {Object.keys(ESTATUS_ABS_BADGE).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valido || guardando}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal: registrar recepción
// ---------------------------------------------------------------------------
function RecepcionModal({ abastecimientos, subalmacenes, onClose, onGuardar, guardando }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const elegibles = abastecimientos.filter((a) => Number(a.pendiente_recibir) > 0);
  const [abastecimientoId, setAbastecimientoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [documento, setDocumento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const elegido = elegibles.find((a) => String(a.id) === String(abastecimientoId));
  const pendiente = elegido ? Number(elegido.pendiente_recibir) || 0 : 0;
  const cantNum = Number(cantidad);
  const cantidadInvalida = cantidad !== '' && (Number.isNaN(cantNum) || cantNum <= 0 || cantNum > pendiente);
  const valido = Boolean(elegido) && cantNum > 0 && cantNum <= pendiente && fecha !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valido) return;
    onGuardar({
      abastecimiento_id: elegido.id,
      cantidad: cantNum,
      fecha_recepcion: fecha,
      documento: documento.trim() || undefined,
      ubicacion: ubicacion || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  return (
    <Modal title="Registrar recepción" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">OC / abastecimiento *</label>
          <select
            value={abastecimientoId}
            onChange={(e) => {
              setAbastecimientoId(e.target.value);
              setCantidad('');
            }}
            className={INPUT_CLS}
            autoFocus
          >
            <option value="">Selecciona una OC con pendiente por recibir</option>
            {elegibles.map((a) => (
              <option key={a.id} value={a.id}>
                {`OC ${a.oc || a.folio} · ${a.material} · pendiente ${formatNumber(a.pendiente_recibir)}`}
              </option>
            ))}
          </select>
          {elegido && (
            <p className="text-xs text-gray-500 mt-1">
              Pendiente por recibir: <span className="font-semibold text-gray-700">{formatNumber(pendiente)}</span>
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad recibida *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className={`${INPUT_CLS} ${cantidadInvalida ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
            />
            {cantidadInvalida && (
              <p className="text-xs text-red-600 mt-1">
                La cantidad no puede exceder lo pendiente ({formatNumber(pendiente)}).
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de recepción *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className={INPUT_CLS}
              placeholder="Factura / remisión"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
            <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={INPUT_CLS}>
              <option value="">Selecciona un almacén</option>
              {subalmacenes.map((s) => (
                <option key={s.cve_alm} value={s.cve_alm}>
                  {s.nombre || `Almacén ${s.cve_alm}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valido || guardando}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export default function LogisticaPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const esAdmin = user?.rol === 'admin';

  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadedRef = useRef({});

  // Resumen
  const [resumen, setResumen] = useState(null);
  const [resumenAtrasados, setResumenAtrasados] = useState([]);
  const [resumenProximos, setResumenProximos] = useState([]);

  // Necesidades
  const [demandas, setDemandas] = useState([]);
  const [demBusqueda, setDemBusqueda] = useState('');
  const [demTipo, setDemTipo] = useState('');
  const [demEstatus, setDemEstatus] = useState('');
  const [demPrioridad, setDemPrioridad] = useState('');
  const [demModalOpen, setDemModalOpen] = useState(false);
  const [guardandoDemanda, setGuardandoDemanda] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [prioridadEditId, setPrioridadEditId] = useState(null);
  const [prioridadEditValor, setPrioridadEditValor] = useState('media');

  // En tránsito
  const [transitoFiltro, setTransitoFiltro] = useState('todo');
  const [transitoBusqueda, setTransitoBusqueda] = useState('');
  const [transitoRows, setTransitoRows] = useState([]);

  // OC / Abastecimientos
  const [ocRows, setOcRows] = useState([]);
  const [ocModalOpen, setOcModalOpen] = useState(false);
  const [ocEditando, setOcEditando] = useState(null);
  const [guardandoOc, setGuardandoOc] = useState(false);

  // Asignaciones
  const [asigRows, setAsigRows] = useState([]);
  const [asigDemandas, setAsigDemandas] = useState([]);
  const [asigSeleccionado, setAsigSeleccionado] = useState(null);
  const [asigDetalle, setAsigDetalle] = useState([]);
  const [asigDetalleLoading, setAsigDetalleLoading] = useState(false);
  const [asigDemandaId, setAsigDemandaId] = useState('');
  const [asigCantidad, setAsigCantidad] = useState('');
  const [asigGuardando, setAsigGuardando] = useState(false);

  // Recepciones
  const [recepciones, setRecepciones] = useState([]);
  const [recBusqueda, setRecBusqueda] = useState('');
  const [recFiltroAbastecimiento, setRecFiltroAbastecimiento] = useState('');
  const [recAbastecimientos, setRecAbastecimientos] = useState([]);
  const [subalmacenes, setSubalmacenes] = useState([]);
  const [recModalOpen, setRecModalOpen] = useState(false);
  const [guardandoRecepcion, setGuardandoRecepcion] = useState(false);

  // -------------------------------------------------------------------------
  // Cargas por pestaña
  // -------------------------------------------------------------------------
  const buildDemandaQuery = () => {
    const p = new URLSearchParams();
    if (demTipo) p.set('tipo', demTipo);
    if (demEstatus) p.set('estatus', demEstatus);
    if (demPrioridad) p.set('prioridad', demPrioridad);
    if (demBusqueda.trim()) p.set('busqueda', demBusqueda.trim());
    return p.toString();
  };

  const loadDemandas = async (silent = false) => {
    try {
      const res = await fetchLogisticaDemanda(buildDemandaQuery());
      setDemandas(res.data || []);
      if (!silent) setError('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const loadTransito = async (silent = false) => {
    try {
      const p = new URLSearchParams({ filtro: transitoFiltro });
      if (transitoBusqueda.trim()) p.set('busqueda', transitoBusqueda.trim());
      const res = await fetchLogisticaAbastecimientos(p.toString());
      setTransitoRows(res.data || []);
      if (!silent) setError('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const loadOc = async (silent = false) => {
    try {
      const res = await fetchLogisticaAbastecimientos('filtro=todo');
      setOcRows(res.data || []);
      if (!silent) setError('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const loadAsignaciones = async (silent = false) => {
    try {
      const res = await fetchLogisticaAsignaciones('');
      setAsigRows(res.data || []);
      if (!silent) setError('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const loadDemandasAsignables = async () => {
    try {
      const [pend, parc] = await Promise.all([
        fetchLogisticaDemanda('estatus=pendiente'),
        fetchLogisticaDemanda('estatus=parcial'),
      ]);
      setAsigDemandas([...(pend.data || []), ...(parc.data || [])]);
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  const loadRecepciones = async (silent = false) => {
    try {
      const q = recFiltroAbastecimiento ? `abastecimiento_id=${encodeURIComponent(recFiltroAbastecimiento)}` : '';
      const res = await fetchLogisticaRecepciones(q);
      setRecepciones(res.data || []);
      if (!silent) setError('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const loadRecepcionesCatalogos = async () => {
    try {
      const [abs, subs] = await Promise.all([fetchLogisticaAbastecimientos(''), fetchSubalmacenes()]);
      setRecAbastecimientos(abs.data || []);
      setSubalmacenes(Array.isArray(subs) ? subs : subs?.data || []);
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  const loadTabData = async (tab, force = false) => {
    if (!force && loadedRef.current[tab]) return;
    setLoading(true);
    setError('');
    try {
      switch (tab) {
        case 'resumen': {
          const [res, atr, prox] = await Promise.all([
            fetchLogisticaResumen(),
            fetchLogisticaAbastecimientos('filtro=atrasados'),
            fetchLogisticaAbastecimientos('filtro=proximos'),
          ]);
          setResumen(res);
          setResumenAtrasados(atr.data || []);
          setResumenProximos(prox.data || []);
          break;
        }
        case 'necesidades':
          await loadDemandas(true);
          break;
        case 'transito':
          await loadTransito(true);
          break;
        case 'oc':
          await loadOc(true);
          break;
        case 'asignaciones':
          await Promise.all([loadAsignaciones(true), loadDemandasAsignables()]);
          break;
        case 'recepciones':
          await Promise.all([loadRecepciones(true), loadRecepcionesCatalogos()]);
          break;
        default:
          break;
      }
      loadedRef.current[tab] = true;
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Recargas silenciosas cuando cambian los filtros y la pestaña ya fue cargada.
  useEffect(() => {
    if (activeTab === 'necesidades' && loadedRef.current.necesidades) loadDemandas(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demTipo, demEstatus, demPrioridad, demBusqueda]);

  useEffect(() => {
    if (activeTab === 'transito' && loadedRef.current.transito) loadTransito(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitoFiltro, transitoBusqueda]);

  useEffect(() => {
    if (activeTab === 'recepciones' && loadedRef.current.recepciones) loadRecepciones(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recFiltroAbastecimiento]);

  // -------------------------------------------------------------------------
  // Acciones: necesidades
  // -------------------------------------------------------------------------
  const handleRegenerar = async () => {
    setRegenerando(true);
    try {
      const res = await regenerarLogisticaDemanda();
      addToast(
        `Demanda regenerada: ${res.generadas} necesidades (${res.por_pedido} por pedido, ${res.por_stock} por stock)`
      );
      await loadDemandas(true);
    } catch (err) {
      addToast(errMsg(err), 'error');
    } finally {
      setRegenerando(false);
    }
  };

  const handleCrearDemanda = async (datos) => {
    setGuardandoDemanda(true);
    try {
      await crearLogisticaDemanda(datos);
      addToast('Necesidad registrada');
      setDemModalOpen(false);
      await loadDemandas(true);
    } catch (err) {
      addToast(errMsg(err), 'error');
    } finally {
      setGuardandoDemanda(false);
    }
  };

  const guardarPrioridad = async (id) => {
    try {
      await editarLogisticaDemanda(id, { prioridad: prioridadEditValor });
      addToast('Prioridad actualizada');
      setPrioridadEditId(null);
      await loadDemandas(true);
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  const renderPrioridadCell = (row) => {
    if (!esAdmin) return prioridadBadge(row.prioridad);
    if (prioridadEditId === row.id) {
      return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={prioridadEditValor}
            onChange={(e) => setPrioridadEditValor(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => guardarPrioridad(row.id)}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Guardar"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => setPrioridadEditId(null)}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            title="Cancelar"
          >
            <X size={14} />
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => {
          setPrioridadEditId(row.id);
          setPrioridadEditValor(row.prioridad || 'media');
        }}
        className="cursor-pointer"
        title="Clic para cambiar la prioridad"
      >
        {prioridadBadge(row.prioridad)}
      </button>
    );
  };

  const handleCerrarDemanda = async (row) => {
    if (!window.confirm(`¿Cerrar la necesidad del material ${row.material}?`)) return;
    try {
      await cerrarLogisticaDemanda(row.id);
      addToast('Necesidad cerrada');
      await loadDemandas(true);
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Acciones: OC / abastecimientos
  // -------------------------------------------------------------------------
  const handleGuardarOc = async (datos, id) => {
    setGuardandoOc(true);
    try {
      if (id) {
        await editarLogisticaAbastecimiento(id, datos);
        addToast('Abastecimiento actualizado');
      } else {
        await crearLogisticaAbastecimiento(datos);
        addToast('Abastecimiento creado');
      }
      setOcModalOpen(false);
      setOcEditando(null);
      if (activeTab === 'oc') await loadOc(true);
      else loadedRef.current.oc = false;
      loadedRef.current.transito = false;
      loadedRef.current.resumen = false;
    } catch (err) {
      addToast(errMsg(err), 'error');
    } finally {
      setGuardandoOc(false);
    }
  };

  const handleEliminarOc = async (row) => {
    if (!window.confirm(`¿Eliminar la OC/abastecimiento ${row.folio || row.oc || row.material}?`)) return;
    try {
      await eliminarLogisticaAbastecimiento(row.id);
      addToast('Abastecimiento eliminado');
      await loadOc(true);
    } catch (err) {
      // El 409 (con recepciones/asignaciones ligadas) llega en el mensaje.
      addToast(errMsg(err), 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Acciones: asignaciones
  // -------------------------------------------------------------------------
  const seleccionarAbastecimiento = async (row) => {
    setAsigSeleccionado(row);
    setAsigDemandaId('');
    setAsigCantidad('');
    setAsigDetalleLoading(true);
    try {
      const p = new URLSearchParams();
      if (row.oc) p.set('oc', row.oc);
      if (row.material) p.set('material', row.material);
      const res = await fetchLogisticaAsignaciones(p.toString());
      setAsigDetalle(res.detalle || []);
    } catch (err) {
      addToast(errMsg(err), 'error');
      setAsigDetalle([]);
    } finally {
      setAsigDetalleLoading(false);
    }
  };

  const refreshAsignaciones = async () => {
    try {
      const res = await fetchLogisticaAsignaciones('');
      setAsigRows(res.data || []);
      if (asigSeleccionado) {
        const p = new URLSearchParams();
        if (asigSeleccionado.oc) p.set('oc', asigSeleccionado.oc);
        if (asigSeleccionado.material) p.set('material', asigSeleccionado.material);
        const det = await fetchLogisticaAsignaciones(p.toString());
        setAsigDetalle(det.detalle || []);
      }
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  const demandasCompatibles = useMemo(() => {
    if (!asigSeleccionado) return [];
    const mat = String(asigSeleccionado.material || '').trim().toLowerCase();
    if (!mat) return [];
    return asigDemandas.filter(
      (d) => String(d.material || '').trim().toLowerCase() === mat
    );
  }, [asigDemandas, asigSeleccionado]);

  const handleDemandaSelect = (id) => {
    setAsigDemandaId(id);
    const d = demandasCompatibles.find((x) => String(x.id) === String(id));
    setAsigCantidad(d ? String(Number(d.pendiente) || '') : '');
  };

  const handleCrearAsignacion = async (e) => {
    e.preventDefault();
    if (!asigSeleccionado || !asigDemandaId) return;
    const cant = Number(asigCantidad);
    const disponible = Number(asigSeleccionado.sin_asignar) || 0;
    if (!cant || cant <= 0) {
      addToast('Captura una cantidad válida', 'error');
      return;
    }
    if (cant > disponible) {
      addToast(`La cantidad excede lo disponible sin asignar (${formatNumber(disponible)})`, 'error');
      return;
    }
    setAsigGuardando(true);
    try {
      await crearLogisticaAsignacion({
        abastecimiento_id: asigSeleccionado.id,
        demanda_id: Number(asigDemandaId),
        cantidad: cant,
      });
      addToast('Asignación creada');
      setAsigDemandaId('');
      setAsigCantidad('');
      await refreshAsignaciones();
    } catch (err) {
      addToast(errMsg(err), 'error');
    } finally {
      setAsigGuardando(false);
    }
  };

  const handleEliminarAsignacion = async (det) => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    try {
      await eliminarLogisticaAsignacion(det.id);
      addToast('Asignación eliminada');
      await refreshAsignaciones();
    } catch (err) {
      addToast(errMsg(err), 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Acciones: recepciones
  // -------------------------------------------------------------------------
  const handleGuardarRecepcion = async (datos) => {
    setGuardandoRecepcion(true);
    try {
      await crearLogisticaRecepcion(datos);
      addToast('Recepción registrada');
      setRecModalOpen(false);
      await Promise.all([loadRecepciones(true), loadRecepcionesCatalogos()]);
    } catch (err) {
      addToast(errMsg(err), 'error');
    } finally {
      setGuardandoRecepcion(false);
    }
  };

  // -------------------------------------------------------------------------
  // Columnas reutilizables
  // -------------------------------------------------------------------------
  const absFechaEstimadaColumn = {
    key: 'fecha_estimada',
    label: 'Fecha estimada',
    sortable: true,
    format: (v, row) =>
      row.atrasado ? (
        <span className="text-red-600 font-semibold">
          {v || '—'} · ATRASADO
        </span>
      ) : (
        v || '—'
      ),
  };

  const demandaColumns = [
    { key: 'material', label: 'Material', sortable: true },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      wrap: true,
      format: (v, row) => (
        <span title={row.observaciones || row.justificacion || ''}>{v || '—'}</span>
      ),
    },
    { key: 'tipo', label: 'Tipo', sortable: true, format: (v) => tipoBadge(v) },
    { key: 'referencia', label: 'Pedido', sortable: true, format: (v) => v || '—' },
    { key: 'cliente', label: 'Cliente', sortable: true, wrap: true, format: (v) => v || '—' },
    {
      key: 'cantidad',
      label: 'Cantidad',
      sortable: true,
      total: true,
      accessor: (row) => Number(row.cantidad) || 0,
      format: formatNumber,
    },
    {
      key: 'cubierto',
      label: 'Cubierto',
      sortable: true,
      total: true,
      accessor: (row) => Number(row.cubierto) || 0,
      format: formatNumber,
    },
    {
      key: 'pendiente',
      label: 'Pendiente',
      sortable: true,
      total: true,
      accessor: (row) => Number(row.pendiente) || 0,
      format: formatNumber,
    },
    { key: 'fecha_requerida', label: 'Fecha req.', sortable: true, format: (v) => v || '—' },
    { key: 'prioridad', label: 'Prioridad', sortable: true, format: (v, row) => renderPrioridadCell(row) },
    { key: 'estatus', label: 'Estatus', sortable: true, format: (v) => estatusDemandaBadge(v) },
  ];

  if (esAdmin) {
    demandaColumns.push({
      key: 'acciones',
      label: 'Acciones',
      format: (v, row) =>
        row.estatus !== 'cubierta' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCerrarDemanda(row);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar necesidad"
          >
            <X size={14} />
          </button>
        ) : null,
    });
  }

  // -------------------------------------------------------------------------
  // Render por pestaña
  // -------------------------------------------------------------------------
  const renderResumen = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Piezas por llegar"
          value={formatNumber(resumen?.por_llegar)}
          icon={Truck}
          color="bg-p3-blue"
          subtext={`${formatNumber(resumen?.oc_pendientes)} OC pendientes`}
        />
        <KpiCard
          label="Para pedidos"
          value={formatNumber(resumen?.para_pedidos)}
          icon={ShoppingCart}
          color="bg-p3-red"
        />
        <KpiCard
          label="Para stock"
          value={formatNumber(resumen?.para_stock)}
          icon={Boxes}
          color="bg-emerald-600"
        />
        <KpiCard
          label="Atrasado"
          value={formatNumber(resumen?.atrasado_piezas)}
          icon={AlarmClock}
          color="bg-red-600"
          subtext={`${formatNumber(resumen?.atrasado_oc)} OC`}
        />
        <KpiCard
          label="Próximos 7 días"
          value={formatNumber(resumen?.proximos_7_dias)}
          icon={CalendarClock}
          color="bg-amber-500"
          subtext={`${formatNumber(resumen?.proximos_7_dias_oc)} OC`}
        />
        <KpiCard
          label="Sin asignar"
          value={formatNumber(resumen?.sin_asignar)}
          icon={HelpCircle}
          color="bg-violet-600"
          subtext={`${formatNumber(resumen?.sin_asignar_oc)} OC`}
        />
        <KpiCard
          label="Demandas pendientes"
          value={formatNumber(resumen?.demandas_pendientes)}
          icon={ClipboardList}
          color="bg-p3-blue-light"
          subtext={`${formatNumber(resumen?.demandas_cubiertas)} cubiertas`}
        />
        <KpiCard
          label="Necesidades totales"
          value={formatNumber((Number(resumen?.demandas_pendientes) || 0) + (Number(resumen?.demandas_cubiertas) || 0))}
          icon={ListChecks}
          color="bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SectionHeader title="OC atrasadas" count={resumenAtrasados.length} icon={AlarmClock} />
          <DataTable
            rows={resumenAtrasados}
            columns={[
              { key: 'material', label: 'Material', sortable: true },
              { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
              {
                key: 'pendiente_recibir',
                label: 'Pendiente',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.pendiente_recibir) || 0,
                format: formatNumber,
              },
              {
                key: 'fecha_estimada',
                label: 'Fecha estimada',
                sortable: true,
                format: (v) => <span className="text-red-600 font-semibold">{v || '—'}</span>,
              },
            ]}
            emptyMessage="No hay OC atrasadas"
            emptyIcon={AlarmClock}
          />
        </div>
        <div className="space-y-4">
          <SectionHeader title="Próximos a llegar" count={resumenProximos.length} icon={CalendarClock} />
          <DataTable
            rows={resumenProximos}
            columns={[
              { key: 'material', label: 'Material', sortable: true },
              { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
              {
                key: 'pendiente_recibir',
                label: 'Pendiente',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.pendiente_recibir) || 0,
                format: formatNumber,
              },
              { key: 'fecha_estimada', label: 'Fecha estimada', sortable: true, format: (v) => v || '—' },
            ]}
            emptyMessage="No hay llegadas próximas"
            emptyIcon={CalendarClock}
          />
        </div>
      </div>
    </div>
  );

  const renderNecesidades = () => (
    <div className="space-y-6">
      <SectionHeader title="Necesidades de material" count={demandas.length} icon={ClipboardList} />

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[14rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <DebouncedInput
              type="text"
              placeholder="Buscar material, referencia o cliente..."
              value={demBusqueda}
              onChange={setDemBusqueda}
              delay={600}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Tipo</label>
            <select value={demTipo} onChange={(e) => setDemTipo(e.target.value)} className="min-w-[10rem] px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red">
              <option value="">Todos</option>
              <option value="PEDIDO">PEDIDO</option>
              <option value="STOCK">STOCK</option>
              <option value="OTRA">OTRA</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Estatus</label>
            <select value={demEstatus} onChange={(e) => setDemEstatus(e.target.value)} className="min-w-[10rem] px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red">
              <option value="">Todos</option>
              <option value="pendiente">pendiente</option>
              <option value="parcial">parcial</option>
              <option value="cubierta">cubierta</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Prioridad</label>
            <select value={demPrioridad} onChange={(e) => setDemPrioridad(e.target.value)} className="min-w-[10rem] px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red">
              <option value="">Todos</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {esAdmin && (
            <>
              <button
                type="button"
                onClick={handleRegenerar}
                disabled={regenerando}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={regenerando ? 'animate-spin' : ''} />
                Regenerar
              </button>
              <button
                type="button"
                onClick={() => setDemModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors"
              >
                <Plus size={16} />
                Necesidad manual
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          La demanda por <strong>stock</strong> se genera con los mínimos configurados en{' '}
          <strong>Admin → Stock</strong> (o desde SAE cuando el ETL traiga stock_min/stock_max;
          hoy SAE los envía en 0). Hasta entonces solo aparecen necesidades de pedido y manuales.
        </p>
      </div>

      <DataTable
        rows={demandas}
        columns={demandaColumns}
        emptyMessage="No hay necesidades con esos criterios"
        emptyIcon={ClipboardList}
      />

      <p className="text-xs text-gray-500">
        Pasa el cursor sobre la descripción para ver observaciones o justificación.{' '}
        {esAdmin && 'Haz clic en una prioridad para cambiarla.'}
      </p>
    </div>
  );

  const renderTransito = () => (
    <div className="space-y-6">
      <SectionHeader title="Material en tránsito" count={transitoRows.length} icon={Truck} />

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[14rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <DebouncedInput
              type="text"
              placeholder="Buscar material, OC o proveedor..."
              value={transitoBusqueda}
              onChange={setTransitoBusqueda}
              delay={600}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TRANSITO_FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTransitoFiltro(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  transitoFiltro === f.id
                    ? 'bg-p3-red text-white border-p3-red shadow-md'
                    : 'bg-white text-gray-600 hover:text-p3-red hover:bg-red-50 border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        rows={transitoRows}
        columns={[
          { key: 'material', label: 'Material', sortable: true },
          { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
          {
            key: 'cantidad',
            label: 'Comprada',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.cantidad) || 0,
            format: formatNumber,
          },
          {
            key: 'recibido',
            label: 'Recibido',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.recibido) || 0,
            format: formatNumber,
          },
          {
            key: 'pendiente_recibir',
            label: 'Por recibir',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.pendiente_recibir) || 0,
            format: formatNumber,
          },
          { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
          { key: 'proveedor', label: 'Proveedor', sortable: true, wrap: true, format: (v) => v || '—' },
          absFechaEstimadaColumn,
          { key: 'destino', label: 'Destino', sortable: true, wrap: true, format: (v) => v || '—' },
          {
            key: 'pedidos',
            label: 'Pedidos',
            sortable: true,
            wrap: true,
            format: (v) => (Array.isArray(v) ? v.join(', ') : v || '—'),
          },
          {
            key: 'estatus',
            label: 'Estatus',
            sortable: true,
            format: (v, row) => estatusAbsBadge(v, row.atrasado),
          },
        ]}
        emptyMessage="No hay material en tránsito con esos criterios"
        emptyIcon={Truck}
      />
    </div>
  );

  const renderOc = () => {
    const ocColumns = [
      { key: 'folio', label: 'Folio', sortable: true, format: (v) => v || '—' },
      { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
      { key: 'proveedor', label: 'Proveedor', sortable: true, wrap: true, format: (v) => v || '—' },
      { key: 'material', label: 'Material', sortable: true },
      { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
      {
        key: 'cantidad',
        label: 'Cantidad',
        sortable: true,
        total: true,
        accessor: (row) => Number(row.cantidad) || 0,
        format: formatNumber,
      },
      {
        key: 'asignado',
        label: 'Asignado',
        sortable: true,
        total: true,
        accessor: (row) => Number(row.asignado) || 0,
        format: (v, row) => (
          <span title={row.destino ? `Destino: ${row.destino}` : ''}>{formatNumber(v)}</span>
        ),
      },
      { key: 'destino', label: 'Destino', sortable: true, wrap: true, format: (v) => v || '—' },
      {
        key: 'sin_asignar',
        label: 'Sin asignar',
        sortable: true,
        total: true,
        accessor: (row) => Number(row.sin_asignar) || 0,
        format: (v) =>
          Number(v) > 0 ? (
            <span className="text-red-600 font-semibold">{formatNumber(v)}</span>
          ) : (
            formatNumber(v)
          ),
      },
      {
        key: 'recibido',
        label: 'Recibido',
        sortable: true,
        total: true,
        accessor: (row) => Number(row.recibido) || 0,
        format: formatNumber,
      },
      {
        key: 'pendiente_recibir',
        label: 'Por recibir',
        sortable: true,
        total: true,
        accessor: (row) => Number(row.pendiente_recibir) || 0,
        format: formatNumber,
      },
      absFechaEstimadaColumn,
      {
        key: 'estatus',
        label: 'Estatus',
        sortable: true,
        format: (v, row) => estatusAbsBadge(v, row.atrasado),
      },
    ];

    if (esAdmin) {
      ocColumns.push({
        key: 'acciones',
        label: 'Acciones',
        format: (v, row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOcEditando(row);
                setOcModalOpen(true);
              }}
              className="p-1.5 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarOc(row);
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <X size={14} />
            </button>
          </div>
        ),
      });
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SectionHeader title="OC / Abastecimientos" count={ocRows.length} icon={ShoppingCart} />
          {esAdmin && (
            <button
              type="button"
              onClick={() => {
                setOcEditando(null);
                setOcModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors"
            >
              <Plus size={16} />
              Nueva OC / abastecimiento
            </button>
          )}
        </div>

        <DataTable
          rows={ocRows}
          columns={ocColumns}
          emptyMessage="No hay abastecimientos registrados"
          emptyIcon={ShoppingCart}
        />
      </div>
    );
  };

  const renderAsignaciones = () => (
    <div className="space-y-6">
      <SectionHeader title="Matriz de asignaciones" count={asigRows.length} icon={Split} />

      <DataTable
        rows={asigRows}
        selectedRow={asigSeleccionado ? { codigo: asigSeleccionado.id } : null}
        onRowClick={seleccionarAbastecimiento}
        columns={[
          { key: 'folio', label: 'Folio', sortable: true, format: (v) => v || '—' },
          { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
          { key: 'material', label: 'Material', sortable: true },
          { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
          {
            key: 'cantidad',
            label: 'Comprada',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.cantidad) || 0,
            format: formatNumber,
          },
          {
            key: 'asignado_pedido',
            label: 'Para pedido',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.asignado_pedido) || 0,
            format: formatNumber,
          },
          {
            key: 'asignado_stock',
            label: 'Para stock',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.asignado_stock) || 0,
            format: formatNumber,
          },
          {
            key: 'sin_asignar',
            label: 'Sin asignar',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.sin_asignar) || 0,
            format: (v) =>
              Number(v) > 0 ? (
                <span className="text-red-600 font-semibold">{formatNumber(v)}</span>
              ) : (
                formatNumber(v)
              ),
          },
          {
            key: 'recibido',
            label: 'Recibido',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.recibido) || 0,
            format: formatNumber,
          },
          {
            key: 'pendiente_recibir',
            label: 'Por recibir',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.pendiente_recibir) || 0,
            format: formatNumber,
          },
        ]}
        emptyMessage="No hay abastecimientos para asignar"
        emptyIcon={Split}
      />

      {asigSeleccionado ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionHeader
              title={`Detalle de asignaciones de OC ${asigSeleccionado.oc || asigSeleccionado.folio}`}
              count={asigDetalle.length}
              icon={ClipboardList}
            />
          </div>

          {asigDetalleLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
              Cargando asignaciones...
            </div>
          ) : asigDetalle.length > 0 ? (
            <ul className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-md">
              {asigDetalle.map((det) => (
                <li key={det.id} className="flex items-center gap-3 px-4 py-3">
                  {tipoBadge(det.tipo)}
                  <span className="text-sm text-gray-700 flex-1">
                    {det.referencia || det.material}
                    {det.cliente ? ` — ${det.cliente}` : ''}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{formatNumber(det.cantidad)}</span>
                  {esAdmin && (
                    <button
                      type="button"
                      onClick={() => handleEliminarAsignacion(det)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar asignación"
                    >
                      <X size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3">
              Esta OC no tiene asignaciones registradas.
            </p>
          )}

          {esAdmin && (
            <form
              onSubmit={handleCrearAsignacion}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md"
            >
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Nueva asignación</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[16rem]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Demanda (mismo material)
                  </label>
                  <select
                    value={asigDemandaId}
                    onChange={(e) => handleDemandaSelect(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red text-sm"
                  >
                    <option value="">Selecciona una demanda pendiente o parcial</option>
                    {demandasCompatibles.map((d) => (
                      <option key={d.id} value={d.id}>
                        {`${d.tipo} ${d.referencia || ''} — ${d.material} — pendiente ${formatNumber(d.pendiente)}`}
                      </option>
                    ))}
                  </select>
                  {asigSeleccionado && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disponible sin asignar:{' '}
                      <span className="font-semibold text-gray-700">
                        {formatNumber(asigSeleccionado.sin_asignar)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="w-36">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={asigCantidad}
                    onChange={(e) => setAsigCantidad(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red text-sm ${
                      Number(asigCantidad) > Number(asigSeleccionado?.sin_asignar || 0)
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={asigGuardando || !asigDemandaId || !asigCantidad}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {asigGuardando && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Asignar
                </button>
              </div>
              {Number(asigCantidad) > Number(asigSeleccionado?.sin_asignar || 0) && (
                <p className="text-xs text-red-600 mt-2">
                  La cantidad excede lo disponible sin asignar.
                </p>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <Split className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Selecciona un abastecimiento</p>
          <p className="text-sm text-gray-400 mt-1">
            Haz clic en una fila de la tabla superior para ver y administrar sus asignaciones.
          </p>
        </div>
      )}
    </div>
  );

  const renderRecepciones = () => {
    const recepcionesFiltradas = (() => {
      const q = recBusqueda.trim().toLowerCase();
      if (!q) return recepciones;
      return recepciones.filter((r) =>
        [r.folio, r.oc, r.material, r.descripcion, r.proveedor, r.documento, r.usuario].some((v) =>
          String(v || '').toLowerCase().includes(q)
        )
      );
    })();

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SectionHeader title="Recepciones" count={recepcionesFiltradas.length} icon={PackageCheck} />
          {esAdmin && (
            <button
              type="button"
              onClick={() => setRecModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-p3-red hover:bg-p3-red-dark text-white rounded-xl transition-colors"
            >
              <Plus size={16} />
              Registrar recepción
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[14rem]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <DebouncedInput
                type="text"
                placeholder="Filtrar por folio, OC, material, documento..."
                value={recBusqueda}
                onChange={setRecBusqueda}
                delay={400}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">OC / abastecimiento</label>
              <select
                value={recFiltroAbastecimiento}
                onChange={(e) => setRecFiltroAbastecimiento(e.target.value)}
                className="min-w-[16rem] px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red"
              >
                <option value="">Todas</option>
                {recAbastecimientos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {`OC ${a.oc || a.folio} · ${a.material} · pendiente ${formatNumber(a.pendiente_recibir)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DataTable
          rows={recepcionesFiltradas}
          columns={[
            { key: 'fecha_recepcion', label: 'Fecha', sortable: true, format: (v) => v || '—' },
            { key: 'folio', label: 'Folio', sortable: true, format: (v) => v || '—' },
            { key: 'oc', label: 'OC', sortable: true, format: (v) => v || '—' },
            { key: 'material', label: 'Material', sortable: true },
            { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true, format: (v) => v || '—' },
            {
              key: 'cantidad',
              label: 'Cantidad',
              sortable: true,
              total: true,
              accessor: (row) => Number(row.cantidad) || 0,
              format: formatNumber,
            },
            { key: 'documento', label: 'Documento', sortable: true, format: (v) => v || '—' },
            { key: 'ubicacion', label: 'Ubicación', sortable: true, format: (v) => v || '—' },
            { key: 'usuario', label: 'Usuario', sortable: true, format: (v) => v || '—' },
          ]}
          emptyMessage="No hay recepciones con esos criterios"
          emptyIcon={PackageCheck}
        />
      </div>
    );
  };

  const tabContent = {
    resumen: renderResumen(),
    necesidades: renderNecesidades(),
    transito: renderTransito(),
    oc: renderOc(),
    asignaciones: renderAsignaciones(),
    recepciones: renderRecepciones(),
  };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="mx-auto max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="bg-p3-red text-white p-2 rounded-lg shadow-sm">
                <Truck size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Logística 3P</h1>
                <p className="text-xs text-gray-500">
                  {user?.nombre} · {user?.rol}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                title="Volver al dashboard"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => loadTabData(activeTab, true)}
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

      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px]">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
              {tabContent[activeTab]}
            </div>
          )}
        </div>
      </div>

      {demModalOpen && (
        <NecesidadModal
          onClose={() => setDemModalOpen(false)}
          onGuardar={handleCrearDemanda}
          guardando={guardandoDemanda}
        />
      )}
      {ocModalOpen && (
        <AbastecimientoModal
          editando={ocEditando}
          onClose={() => {
            setOcModalOpen(false);
            setOcEditando(null);
          }}
          onGuardar={handleGuardarOc}
          guardando={guardandoOc}
        />
      )}
      {recModalOpen && (
        <RecepcionModal
          abastecimientos={recAbastecimientos}
          subalmacenes={subalmacenes}
          onClose={() => setRecModalOpen(false)}
          onGuardar={handleGuardarRecepcion}
          guardando={guardandoRecepcion}
        />
      )}
    </div>
  );
}
