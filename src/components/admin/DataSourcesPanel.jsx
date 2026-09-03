import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileSpreadsheet,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

/**
 * Panel "Fuentes de datos": lista TODAS las bases Excel que usa el sistema
 * con nombre de archivo, ubicación, estado de salud y —para las que tienen
 * sync (vales/pedidos)— última sincronización y botón de forzar.
 */

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

function EstadoSalud({ estado }) {
  if (estado === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
        <CheckCircle2 size={12} /> OK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
      <XCircle size={12} /> {estado === 'inaccesible' ? 'Inaccesible' : 'Revisar'}
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
      setError(e.message || 'No se pudo cargar el estado de las fuentes');
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
            Bases Excel que alimentan el sistema. Las de modo &quot;sync&quot; se copian a la
            base local; las demás se leen en vivo (solo lectura).
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
          {(estado?.fuentes || []).map((fuente) => {
            const ultimo = fuente.ultimo_sync;
            const conSync = fuente.modo === 'sync';
            return (
              <div
                key={fuente.id}
                className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <FileSpreadsheet size={15} className="text-green-600 shrink-0" />
                      <span className="truncate" title={fuente.archivo}>
                        {fuente.archivo}
                      </span>
                    </p>
                    <p
                      className="text-xs text-gray-400 truncate mt-0.5"
                      title={fuente.ruta}
                    >
                      {fuente.ruta}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <EstadoSalud estado={fuente.estado} />
                    <span
                      className={`text-[10px] font-medium rounded-full px-2 py-0.5 border ${
                        conSync
                          ? 'text-p3-blue bg-blue-50 border-blue-200'
                          : 'text-gray-500 bg-gray-50 border-gray-200'
                      }`}
                    >
                      {conSync ? 'sync local' : 'lectura en vivo'}
                    </span>
                  </div>
                </div>

                {fuente.estado !== 'ok' && fuente.detalle && (
                  <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-words">
                    {fuente.detalle}
                  </div>
                )}

                <dl className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between gap-4">
                    <dt>Excel modificado</dt>
                    <dd className="font-medium text-gray-900 text-right">
                      {formatearFecha(fuente.mtime)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Filas en Excel</dt>
                    <dd className="font-medium text-gray-900">{fuente.filas_excel ?? '-'}</dd>
                  </div>
                  {conSync && (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt>Último sync</dt>
                        <dd className="font-medium text-gray-900 text-right">
                          {ultimo ? formatearFecha(ultimo.fin) : 'Sin sync aún'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Filas sincronizadas</dt>
                        <dd className="font-medium text-gray-900">
                          {ultimo?.filas ?? '-'}
                        </dd>
                      </div>
                      {ultimo?.estado === 'error' && ultimo?.error && (
                        <div className="mt-1 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-words">
                          {ultimo.error}
                        </div>
                      )}
                    </>
                  )}
                </dl>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 truncate" title={(fuente.hojas || []).map((h) => `${h.hoja} (${h.filas})`).join(' · ')}>
                    {(fuente.hojas || []).map((h) => `${h.hoja} (${h.filas})`).join(' · ')}
                  </p>
                  {conSync && (
                    <button
                      onClick={() => forzarSync(fuente.id)}
                      disabled={sincronizando === fuente.id}
                      className="inline-flex items-center gap-1 text-xs font-medium text-white bg-p3-blue hover:opacity-90 rounded-lg px-3 py-1.5 disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw
                        size={12}
                        className={sincronizando === fuente.id ? 'animate-spin' : ''}
                      />
                      {sincronizando === fuente.id ? 'Sync…' : 'Forzar sync'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Nota: los datos del CRM se importan desde Y:/CRM´S con un script manual
        (scripts/importar_crm_excel.py); no es lectura en vivo.
      </p>
    </div>
  );
}
