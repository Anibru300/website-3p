import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Database, RefreshCw, XCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

/**
 * Panel "Fuentes de datos" (Fase 2): estado del sync Excel -> SQLite.
 * Muestra el último sync por fuente y permite forzarlo. El feature flag
 * global (USE_SYNC_TABLES) se refleja en un badge; se cambia en api/.env.
 */

const FUENTE_LABEL = {
  vales: 'Vales (BD_ALMACEN_3P)',
  pedidos: 'Pedidos por facturar',
};

function formatearFecha(iso) {
  if (!iso) return '-';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EstadoBadge({ estado }) {
  if (estado === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
        <CheckCircle2 size={12} /> OK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
      <XCircle size={12} /> Error
    </span>
  );
}

export default function DataSourcesPanel() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState('');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await apiFetch('/api/admin/fuente-sync');
      setEstado(data);
    } catch (e) {
      setError(e.message || 'No se pudo cargar el estado del sync');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const forzarSync = async (fuente) => {
    setSincronizando(fuente);
    setError('');
    try {
      await apiFetch(`/api/admin/fuente-sync/${fuente}`, { method: 'POST' });
      await cargar();
    } catch (e) {
      setError(e.message || 'Error al sincronizar');
    } finally {
      setSincronizando('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database size={18} className="text-p3-blue" />
            Fuentes de datos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sincronización de los Excel maestros (solo lectura) a la base local.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium rounded-full px-3 py-1 border ${
              estado?.use_sync_tables
                ? 'text-p3-blue bg-blue-50 border-blue-200'
                : 'text-gray-600 bg-gray-50 border-gray-200'
            }`}
          >
            Modo sync: {estado?.use_sync_tables ? 'ACTIVO' : 'apagado'}
          </span>
          <button
            onClick={cargar}
            disabled={cargando}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {cargando && !estado ? (
        <p className="text-sm text-gray-500">Cargando estado…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(estado?.fuentes_habilitadas || []).map((fuente) => {
            const info = estado?.fuentes?.[fuente];
            const ultimo = info?.ultimo_sync;
            return (
              <div
                key={fuente}
                className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {FUENTE_LABEL[fuente] || fuente}
                    </p>
                    <p className="text-xs text-gray-400">{fuente}</p>
                  </div>
                  {ultimo ? (
                    <EstadoBadge estado={ultimo.estado} />
                  ) : (
                    <span className="text-xs text-gray-400">Sin sync aún</span>
                  )}
                </div>

                <dl className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Último sync</dt>
                    <dd className="font-medium text-gray-900">
                      {formatearFecha(ultimo?.fin)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Filas sincronizadas</dt>
                    <dd className="font-medium text-gray-900">
                      {ultimo?.filas ?? '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Excel modificado</dt>
                    <dd className="font-medium text-gray-900">
                      {formatearFecha(ultimo?.mtime)}
                    </dd>
                  </div>
                  {ultimo?.error && (
                    <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-words">
                      {ultimo.error}
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {(info?.hojas || []).map((h) => `${h.hoja} (${h.filas})`).join(' · ')}
                  </p>
                  <button
                    onClick={() => forzarSync(fuente)}
                    disabled={sincronizando === fuente}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white bg-p3-blue hover:opacity-90 rounded-lg px-3 py-1.5 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={sincronizando === fuente ? 'animate-spin' : ''}
                    />
                    {sincronizando === fuente ? 'Sync…' : 'Forzar sync'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
