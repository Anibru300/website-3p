import { useEffect, useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchDocumentosPublicos, verPdfFicha, descargarPdfFicha } from '../utils/api';

/**
 * Sección "Documentación" del modal de producto (sitio público).
 * Muestra los documentos técnicos públicos/vigentes del producto. Si la API
 * falla o no hay documentos, se muestra un mensaje discreto sin romper el modal.
 */
export default function ProductDocumentation({ marca, codigo }) {
  const { t } = useLanguage();
  const [estado, setEstado] = useState({ key: '', documentos: null }); // null = cargando
  const clave = `${marca}|${codigo}`;

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const d = await fetchDocumentosPublicos(marca, codigo);
        if (!cancelado) setEstado({ key: clave, documentos: d.data || [] });
      } catch {
        if (!cancelado) setEstado({ key: clave, documentos: [] });
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [marca, codigo, clave]);

  // Mientras carga no mostramos nada para evitar parpadeo
  const documentos = estado.key === clave ? estado.documentos : null;

  // Mientras carga no mostramos nada para evitar parpadeo
  if (documentos === null) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <FileText size={16} className="text-p3-red" />
        {t('brandPage.documentationTitle')}
      </h3>
      {documentos.length === 0 ? (
        <p className="text-xs text-gray-400">{t('brandPage.noDocumentation')}</p>
      ) : (
        <ul className="space-y-2">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {doc.nombre_documento || doc.tipo_nombre || 'Documento'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {doc.tipo_nombre}
                    {doc.version
                      ? ` · ${t('brandPage.versionLabel').replace('{version}', doc.version)}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => verPdfFicha(doc.id).catch(() => {})}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-p3-blue border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  <Eye size={12} />
                  {t('brandPage.viewPdf')}
                </button>
                <button
                  onClick={() =>
                    descargarPdfFicha(
                      doc.id,
                      doc.nombre_documento ? `${doc.nombre_documento}.pdf` : undefined
                    ).catch(() => {})
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <Download size={12} />
                  {t('brandPage.downloadPdf')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
