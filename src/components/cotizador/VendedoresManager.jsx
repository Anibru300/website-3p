import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, PenLine, Trash2, Upload, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../utils/api';
import { apiFetch } from '../../utils/api';

/**
 * Administrador de vendedores/firmas del cotizador.
 * Reemplaza la hoja FIRMAS del Excel COTIZADOR 2.0: cualquier usuario
 * autenticado puede dar de alta un vendedor con su firma; solo admin elimina.
 */

function obtenerToken() {
  return localStorage.getItem('cjos_token');
}

export default function VendedoresManager() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin' || user?.role === 'admin';
  const [abierto, setAbierto] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const inputArchivoRef = useRef(null);

  const cargar = useCallback(async () => {
    try {
      const data = await apiFetch('/api/cotizaciones/vendedores');
      setVendedores(data.vendedores || []);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los vendedores');
    }
  }, []);

  useEffect(() => {
    if (abierto) cargar();
  }, [abierto, cargar]);

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCargando(true);
    setError('');
    setMensaje('');
    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      if (archivo) formData.append('firma', archivo);

      const response = await fetch(`${API_BASE}/api/cotizaciones/vendedores`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${obtenerToken()}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Error ${response.status}`);
      }
      setMensaje(`Vendedor "${data.nombre}" guardado${data.tiene_firma ? ' con firma' : ''}.`);
      setNombre('');
      setArchivo(null);
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
      await cargar();
    } catch (e2) {
      setError(e2.message || 'Error al guardar');
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (v) => {
    if (!window.confirm(`¿Desactivar al vendedor "${v.nombre}"?`)) return;
    setError('');
    try {
      await apiFetch(`/api/cotizaciones/vendedores/${v.id}`, { method: 'DELETE' });
      await cargar();
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
      >
        <span className="flex items-center gap-2">
          <PenLine size={15} className="text-p3-blue" />
          Administrar vendedores / firmas
        </span>
        {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <ul className="space-y-2">
            {vendedores.map((v) => (
              <li
                key={v.id ?? v.nombre}
                className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2"
              >
                <span className="font-medium text-gray-800">{v.nombre}</span>
                <span className="flex items-center gap-3">
                  {v.tiene_firma && v.id ? (
                    <img
                      src={`${API_BASE}/api/cotizaciones/vendedores/${v.id}/firma`}
                      alt={`Firma de ${v.nombre}`}
                      className="h-8 max-w-[120px] object-contain border border-gray-200 rounded bg-white"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">sin firma</span>
                  )}
                  {esAdmin && v.id && (
                    <button
                      type="button"
                      onClick={() => eliminar(v)}
                      className="text-gray-400 hover:text-red-600"
                      title="Desactivar vendedor"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </span>
              </li>
            ))}
            {vendedores.length === 0 && (
              <li className="text-sm text-gray-400">No hay vendedores registrados.</li>
            )}
          </ul>

          <form onSubmit={guardar} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del vendedor"
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red"
              />
              <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-p3-red text-gray-600">
                <Upload size={14} />
                <span className="truncate">
                  {archivo ? archivo.name : 'Imagen de firma (opcional)'}
                </span>
                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={cargando || !nombre.trim()}
                className="inline-flex items-center gap-1 text-sm font-medium text-white bg-p3-red hover:opacity-90 rounded-lg px-4 py-2 disabled:opacity-50"
              >
                <UserPlus size={14} />
                {cargando ? 'Guardando…' : 'Guardar vendedor'}
              </button>
              {mensaje && <span className="text-xs text-green-700">{mensaje}</span>}
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
