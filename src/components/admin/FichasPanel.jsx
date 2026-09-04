import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FileUp,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DebouncedInput from '../ui/DebouncedInput';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import {
  actualizarDocumento,
  apiFetch,
  desactivarDocumento,
  descargarPdfFicha,
  fetchFichasAdmin,
  fetchProductosMarca,
  fetchTiposDocumento,
  subirDocumentoProducto,
  verPdfFicha,
} from '../../utils/api';

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

const VISIBILIDAD = [
  { id: '', label: 'Todos' },
  { id: '1', label: 'Públicos' },
  { id: '0', label: 'Privados' },
];

const ESTADO = [
  { id: '', label: 'Todos' },
  { id: '1', label: 'Activos' },
  { id: '0', label: 'Desactivados' },
];

const WIZARD_STEPS = ['Marca', 'Producto', 'Tipo', 'Detalles', 'PDF'];

function formatearFecha(valor) {
  if (!valor) return '—';
  const fecha = String(valor).slice(0, 10);
  return fecha || '—';
}

function formatearTamano(bytes) {
  const n = Number(bytes);
  if (Number.isNaN(n) || n <= 0) return '—';
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function Badge({ clases, children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${clases}`}>
      {children}
    </span>
  );
}

function SelectFiltro({ value, onChange, opciones, ariaLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-p3-blue"
    >
      {opciones.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const inputClases =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p3-blue';

export default function FichasPanel() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin';
  const { addToast } = useToast();

  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroQ, setFiltroQ] = useState('');
  const [filtroPublico, setFiltroPublico] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalSubir, setModalSubir] = useState(false);
  const [editando, setEditando] = useState(null); // documento en edición

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await fetchFichasAdmin({
        marca: filtroMarca,
        codigo: '',
        q: filtroQ,
        tipo: filtroTipo,
        publico: filtroPublico,
        vigente: '',
        activo: filtroActivo,
      });
      setDocumentos(data.data || []);
    } catch (e) {
      addToast(e.message || 'No se pudieron cargar los documentos', 'error');
    } finally {
      setCargando(false);
    }
  }, [filtroMarca, filtroTipo, filtroQ, filtroPublico, filtroActivo, addToast]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    apiFetch('/api/fichas/marcas')
      .then((d) => setMarcas(d.data || []))
      .catch(() => setMarcas([]));
    fetchTiposDocumento()
      .then((d) => setTipos(d.data || []))
      .catch(() => setTipos([]));
  }, []);

  const verDocumento = async (doc) => {
    try {
      await verPdfFicha(doc.id);
    } catch (e) {
      addToast(e.message || 'No se pudo abrir el PDF', 'error');
    }
  };

  const descargarDocumento = async (doc) => {
    try {
      await descargarPdfFicha(doc.id, doc.nombre_archivo || `ficha-${doc.codigo}.pdf`);
    } catch (e) {
      addToast(e.message || 'No se pudo descargar el PDF', 'error');
    }
  };

  const cambiarActivo = async (doc, activar) => {
    if (!window.confirm(activar ? `¿Reactivar "${doc.nombre_documento || doc.nombre_archivo}"?` : `¿Desactivar "${doc.nombre_documento || doc.nombre_archivo}"?`)) {
      return;
    }
    try {
      if (activar) {
        await actualizarDocumento(doc.id, { activo: 1 });
        addToast('Documento reactivado', 'success');
      } else {
        await desactivarDocumento(doc.id);
        addToast('Documento desactivado', 'success');
      }
      await cargar();
    } catch (e) {
      addToast(e.message || 'No se pudo actualizar el documento', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-p3-red" />
          <h2 className="text-lg font-bold text-gray-800">Fichas Técnicas</h2>
        </div>
        <p className="text-sm text-gray-500">
          Documentación técnica de productos por marca (fichas, manuales, certificados).
          Los documentos públicos y vigentes se muestran en la página del producto.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <DebouncedInput
              value={filtroQ}
              onChange={setFiltroQ}
              placeholder="Buscar por código o descripción..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p3-blue"
            />
          </div>
          <SelectFiltro
            ariaLabel="Marca"
            value={filtroMarca}
            onChange={setFiltroMarca}
            opciones={[{ id: '', label: 'Todas las marcas' }, ...marcas.map((m) => ({ id: m.slug, label: m.nombre }))]}
          />
          <SelectFiltro
            ariaLabel="Tipo de documento"
            value={filtroTipo}
            onChange={setFiltroTipo}
            opciones={[{ id: '', label: 'Todos los tipos' }, ...tipos.map((t) => ({ id: String(t.codigo), label: t.nombre }))]}
          />
          <SelectFiltro
            ariaLabel="Visibilidad"
            value={filtroPublico}
            onChange={setFiltroPublico}
            opciones={VISIBILIDAD}
          />
          <SelectFiltro
            ariaLabel="Estado"
            value={filtroActivo}
            onChange={setFiltroActivo}
            opciones={ESTADO}
          />
          {esAdmin && (
            <button
              onClick={() => setModalSubir(true)}
              className="inline-flex items-center gap-1 px-4 py-2 bg-p3-blue text-white text-sm font-medium rounded-lg hover:bg-p3-blue-light transition-colors whitespace-nowrap"
            >
              <Plus size={16} /> Subir documento
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="py-2 px-4">Producto</th>
                <th className="py-2 px-4">Código</th>
                <th className="py-2 px-4">Tipo</th>
                <th className="py-2 px-4">Documento</th>
                <th className="py-2 px-4">Versión</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Visibilidad</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400">
                    Cargando documentos...
                  </td>
                </tr>
              ) : documentos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4">
                    <EmptyState message="Sin documentos para los filtros seleccionados." />
                  </td>
                </tr>
              ) : (
                documentos.map((doc) => (
                  <tr key={doc.id} className={doc.activo ? '' : 'bg-gray-50/60 opacity-70'}>
                    <td className="py-2 px-4 text-gray-800 max-w-[260px] truncate" title={doc.descripcion}>
                      {doc.descripcion || '—'}
                    </td>
                    <td className="py-2 px-4 font-mono text-xs text-gray-600">{doc.codigo}</td>
                    <td className="py-2 px-4 text-gray-600 whitespace-nowrap">{doc.tipo_nombre || doc.tipo || '—'}</td>
                    <td className="py-2 px-4 text-gray-800 max-w-[220px] truncate" title={doc.nombre_documento || doc.nombre_archivo}>
                      {doc.nombre_documento || doc.nombre_archivo || '—'}
                    </td>
                    <td className="py-2 px-4 text-gray-600">{doc.version || '—'}</td>
                    <td className="py-2 px-4 text-gray-600 whitespace-nowrap">
                      {formatearFecha(doc.fecha_documento || doc.fecha_carga)}
                    </td>
                    <td className="py-2 px-4">
                      {doc.publico ? (
                        <Badge clases="text-green-700 bg-green-50 border-green-200">Público</Badge>
                      ) : (
                        <Badge clases="text-gray-500 bg-gray-50 border-gray-200">Privado</Badge>
                      )}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      {doc.activo ? (
                        <Badge clases="text-green-700 bg-green-50 border-green-200">Activo</Badge>
                      ) : (
                        <Badge clases="text-red-700 bg-red-50 border-red-200">Desactivado</Badge>
                      )}{' '}
                      <span className="text-xs text-gray-400">
                        {doc.vigente ? 'Vigente' : 'Histórico'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => verDocumento(doc)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                        title="Ver PDF"
                      >
                        <Eye size={12} />
                      </button>{' '}
                      <button
                        onClick={() => descargarDocumento(doc)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                        title="Descargar"
                      >
                        <Download size={12} />
                      </button>{' '}
                      {esAdmin && (
                        <>
                          <button
                            onClick={() => setEditando(doc)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-p3-blue border border-blue-200 rounded-md hover:bg-blue-50"
                            title="Editar"
                          >
                            <Pencil size={12} />
                          </button>{' '}
                          {doc.activo ? (
                            <button
                              onClick={() => cambiarActivo(doc, false)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                              title="Desactivar"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => cambiarActivo(doc, true)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                              title="Reactivar"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalSubir && (
        <SubirDocumentoModal
          marcas={marcas}
          tipos={tipos}
          onClose={() => setModalSubir(false)}
          onSubido={() => {
            setModalSubir(false);
            addToast('Documento subido', 'success');
            cargar();
          }}
          onError={(msg) => addToast(msg, 'error')}
        />
      )}

      {editando && (
        <EditarDocumentoModal
          doc={editando}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            addToast('Documento actualizado', 'success');
            cargar();
          }}
          onReactivado={() => {
            setEditando(null);
            addToast('Documento reactivado', 'success');
            cargar();
          }}
          onError={(msg) => addToast(msg, 'error')}
        />
      )}
    </div>
  );
}

function SubirDocumentoModal({ marcas, tipos, onClose, onSubido, onError }) {
  const [paso, setPaso] = useState(0);
  const [marca, setMarca] = useState('');
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [productoSel, setProductoSel] = useState(null);
  const [busquedaProd, setBusquedaProd] = useState('');
  const [tipo, setTipo] = useState('');
  const [nombreDocumento, setNombreDocumento] = useState('');
  const [descripcionDocumento, setDescripcionDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [version, setVersion] = useState('');
  const [fechaDocumento, setFechaDocumento] = useState('');
  const [publico, setPublico] = useState(true);
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const inputPdfRef = useRef(null);

  useEffect(() => {
    if (!marca) return;
    let cancelado = false;
    const cargarProductos = async () => {
      setCargandoProductos(true);
      setProductoSel(null);
      try {
        const d = await fetchProductosMarca(marca);
        if (!cancelado) setProductos(d.data || []);
      } catch (e) {
        if (!cancelado) onError(e.message || 'No se pudieron cargar los productos');
      } finally {
        if (!cancelado) setCargandoProductos(false);
      }
    };
    cargarProductos();
    return () => {
      cancelado = true;
    };
  }, [marca, onError]);

  const productosFiltrados = useMemo(() => {
    const term = busquedaProd.toLowerCase().trim();
    if (!term) return productos;
    return productos.filter(
      (p) =>
        p.codigo.toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }, [productos, busquedaProd]);

  const aceptarArchivo = (file) => {
    if (!file) return;
    const nombre = file.name.toLowerCase();
    if (!nombre.endsWith('.pdf')) {
      onError('Solo se permiten archivos PDF.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      onError('El PDF supera el límite de 25 MB.');
      return;
    }
    setArchivo(file);
  };

  const subir = async () => {
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('marca', marca);
      formData.append('codigo', productoSel.codigo);
      formData.append('tipo', tipo);
      formData.append('pdf', archivo);
      if (nombreDocumento.trim()) formData.append('nombre_documento', nombreDocumento.trim());
      if (descripcionDocumento.trim()) formData.append('descripcion_documento', descripcionDocumento.trim());
      if (numeroDocumento.trim()) formData.append('numero_documento', numeroDocumento.trim());
      if (version.trim()) formData.append('version', version.trim());
      if (fechaDocumento) formData.append('fecha_documento', fechaDocumento);
      formData.append('publico', publico ? '1' : '0');
      await subirDocumentoProducto(formData);
      onSubido();
    } catch (e) {
      onError(e.message || 'Error al subir el documento');
      setSubiendo(false);
    }
  };

  const puedeAvanzar =
    (paso === 0 && marca) ||
    (paso === 1 && productoSel) ||
    (paso === 2 && tipo) ||
    paso === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          aria-label="Cerrar"
        >
          <X size={18} className="text-gray-700" />
        </button>

        <div className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Subir documento</h3>
          <p className="text-sm text-gray-500 mb-5">
            Sigue los pasos para asociar un PDF a un producto de la marca.
          </p>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-1 mb-6">
            {WIZARD_STEPS.map((label, idx) => (
              <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    idx < paso
                      ? 'bg-green-500 text-white'
                      : idx === paso
                        ? 'bg-p3-blue text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx < paso ? <Check size={12} /> : idx + 1}
                </div>
                <span
                  className={`text-xs truncate ${idx === paso ? 'text-gray-800 font-medium' : 'text-gray-400'}`}
                >
                  {label}
                </span>
                {idx < WIZARD_STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>

          {paso === 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Marca</label>
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className={inputClases}
              >
                <option value="">Selecciona una marca...</option>
                {marcas.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Producto</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busquedaProd}
                  onChange={(e) => setBusquedaProd(e.target.value)}
                  placeholder="Buscar por código o descripción..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p3-blue"
                />
              </div>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-50">
                {cargandoProductos ? (
                  <p className="py-8 text-center text-sm text-gray-400">Cargando productos...</p>
                ) : productosFiltrados.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    {productos.length === 0
                      ? 'Esta marca no tiene productos disponibles.'
                      : 'Sin coincidencias con la búsqueda.'}
                  </p>
                ) : (
                  productosFiltrados.map((p) => (
                    <button
                      key={p.codigo}
                      type="button"
                      onClick={() => setProductoSel(p)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        productoSel?.codigo === p.codigo
                          ? 'bg-blue-50 text-p3-blue font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-mono text-xs text-gray-500 mr-2">{p.codigo}</span>
                      {p.descripcion}
                    </button>
                  ))
                )}
              </div>
              {productoSel && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Check size={12} /> {productoSel.codigo} — {productoSel.descripcion}
                </p>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Tipo de documento</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClases}>
                <option value="">Selecciona un tipo...</option>
                {tipos.map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del documento <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={nombreDocumento}
                  onChange={(e) => setNombreDocumento(e.target.value)}
                  placeholder="Ej. Ficha técnica"
                  className={inputClases}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={descripcionDocumento}
                  onChange={(e) => setDescripcionDocumento(e.target.value)}
                  className={inputClases}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° documento <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    className={inputClases}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Versión <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={inputClases}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha del documento <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={fechaDocumento}
                    onChange={(e) => setFechaDocumento(e.target.value)}
                    className={inputClases}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publico}
                  onChange={(e) => setPublico(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-p3-blue"
                />
                Documento público (visible en la página del producto)
              </label>
            </div>
          )}

          {paso === 4 && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setArrastrando(false);
                  aceptarArchivo(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputPdfRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  arrastrando ? 'border-p3-blue bg-blue-50' : 'border-gray-300 hover:border-p3-blue hover:bg-gray-50'
                }`}
              >
                <FileUp size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Arrastra el PDF aquí o haz clic para seleccionarlo
                </p>
                <p className="text-xs text-gray-400 mt-1">Solo PDF · máximo 25 MB</p>
                <input
                  ref={inputPdfRef}
                  type="file"
                  accept=".pdf,pdf"
                  className="hidden"
                  onChange={(e) => {
                    aceptarArchivo(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>

              {archivo && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-3 text-sm flex items-center gap-2">
                  <FileText size={16} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-800 truncate">
                    {archivo.name} · {formatearTamano(archivo.size)}
                  </span>
                </div>
              )}

              {/* Resumen */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-800 mb-2">Resumen</p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Marca:</span>{' '}
                  {marcas.find((m) => m.slug === marca)?.nombre || marca}
                </p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Producto:</span>{' '}
                  <span className="font-mono text-xs">{productoSel?.codigo}</span> {productoSel?.descripcion}
                </p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Tipo:</span>{' '}
                  {tipos.find((t) => String(t.codigo) === String(tipo))?.nombre || tipo}
                </p>
                {nombreDocumento.trim() && (
                  <p className="text-gray-600">
                    <span className="text-gray-400">Nombre:</span> {nombreDocumento.trim()}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="text-gray-400">Archivo:</span>{' '}
                  {archivo ? `${archivo.name} (${formatearTamano(archivo.size)})` : 'sin seleccionar'}
                </p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Visibilidad:</span>{' '}
                  {publico ? 'Público' : 'Privado'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPaso((p) => Math.max(0, p - 1))}
              disabled={paso === 0 || subiendo}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Atrás
            </button>
            {paso < 4 ? (
              <button
                onClick={() => setPaso((p) => p + 1)}
                disabled={!puedeAvanzar}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-p3-blue rounded-lg hover:bg-p3-blue-light disabled:opacity-40"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={subir}
                disabled={!archivo || subiendo}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-p3-blue rounded-lg hover:bg-p3-blue-light disabled:opacity-40"
              >
                <Upload size={16} />
                {subiendo ? 'Subiendo...' : 'Subir documento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditarDocumentoModal({ doc, onClose, onGuardado, onReactivado, onError }) {
  const [nombreDocumento, setNombreDocumento] = useState(doc.nombre_documento || '');
  const [descripcionDocumento, setDescripcionDocumento] = useState(doc.descripcion_documento || '');
  const [numeroDocumento, setNumeroDocumento] = useState(doc.numero_documento || '');
  const [version, setVersion] = useState(doc.version || '');
  const [fechaDocumento, setFechaDocumento] = useState(
    doc.fecha_documento ? String(doc.fecha_documento).slice(0, 10) : ''
  );
  const [publico, setPublico] = useState(Boolean(doc.publico));
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      await actualizarDocumento(doc.id, {
        nombre_documento: nombreDocumento.trim(),
        descripcion_documento: descripcionDocumento.trim(),
        numero_documento: numeroDocumento.trim(),
        version: version.trim(),
        fecha_documento: fechaDocumento || null,
        publico: publico ? 1 : 0,
      });
      onGuardado();
    } catch (e) {
      onError(e.message || 'No se pudo actualizar el documento');
      setGuardando(false);
    }
  };

  const reactivar = async () => {
    setGuardando(true);
    try {
      await actualizarDocumento(doc.id, { activo: 1 });
      onReactivado();
    } catch (e) {
      onError(e.message || 'No se pudo reactivar el documento');
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          aria-label="Cerrar"
        >
          <X size={18} className="text-gray-700" />
        </button>

        <div className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Editar documento</h3>
          <p className="text-sm text-gray-500 mb-5 font-mono">
            {doc.codigo} — {doc.nombre_archivo}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del documento</label>
              <input
                type="text"
                value={nombreDocumento}
                onChange={(e) => setNombreDocumento(e.target.value)}
                className={inputClases}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={descripcionDocumento}
                onChange={(e) => setDescripcionDocumento(e.target.value)}
                className={inputClases}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° documento</label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className={inputClases}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className={inputClases}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fechaDocumento}
                  onChange={(e) => setFechaDocumento(e.target.value)}
                  className={inputClases}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={publico}
                onChange={(e) => setPublico(e.target.checked)}
                className="rounded border-gray-300 focus:ring-p3-blue"
              />
              Documento público
            </label>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div>
              {!doc.activo && (
                <button
                  onClick={reactivar}
                  disabled={guardando}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-40"
                >
                  <RotateCcw size={14} /> Reactivar
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-p3-blue rounded-lg hover:bg-p3-blue-light disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
