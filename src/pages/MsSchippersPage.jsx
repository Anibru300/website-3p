import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Download,
  Sparkles,
  ClipboardList,
  Search,
  Boxes,
  Beaker,
  Settings,
  Wrench,
  X,
  FileText,
  Check,
} from 'lucide-react';
import {
  msSchippersBrand,
  msSchippersLines,
  msSchippersProducts,
  msSchippersProductCategories,
  msSchippersCategoryMeta,
  whatsappProductUrl,
} from '../data/msSchippersData';
import { SEO } from '../components/shared';

const productIcon = {
  higiene: Beaker,
  equipo: Settings,
  refaccion: Wrench,
  otro: Boxes,
};

const lineMetaById = msSchippersLines.reduce((acc, line) => {
  acc[line.id] = line;
  return acc;
}, {});

const MsSchippersPage = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productosFiltrados = useMemo(() => {
    return msSchippersProducts.filter((prod) => {
      const matchCategory =
        categoriaActiva === 'todos' || prod.categoria === categoriaActiva;
      const term = searchTerm.toLowerCase();
      const termSearch =
        term === '' ||
        prod.nombre.toLowerCase().includes(term) ||
        prod.codigo.toLowerCase().includes(term) ||
        (prod.specs && prod.specs.toLowerCase().includes(term)) ||
        (prod.lineId && lineMetaById[prod.lineId]?.name.toLowerCase().includes(term));
      return matchCategory && termSearch;
    });
  }, [categoriaActiva, searchTerm]);

  const inStockCount = msSchippersProducts.filter((p) => p.stock > 0).length;
  const totalStock = msSchippersProducts.reduce((sum, p) => sum + p.stock, 0);

  const stats = [
    { label: 'Productos en catálogo', value: msSchippersProducts.length },
    { label: 'Productos con stock', value: inStockCount },
    { label: 'Piezas disponibles', value: totalStock.toLocaleString('es-MX') },
  ];

  const selectedLine = selectedProduct?.lineId
    ? lineMetaById[selectedProduct.lineId]
    : null;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${msSchippersBrand.name} | Higiene y Bioseguridad - 3P S.A. DE C.V.`}
        description={msSchippersBrand.description}
        keywords={msSchippersBrand.keywords}
      />

      {/* Hero */}
      <section
        className="relative text-white py-16 md:py-24"
        style={{ backgroundColor: msSchippersBrand.color }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-64 h-64 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded-full mb-4">
                Distribuidor Autorizado en México
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {msSchippersBrand.name}
              </h1>
              <p className="text-xl text-white/90 mb-4">{msSchippersBrand.slogan}</p>
              <p className="text-white/80 mb-6 leading-relaxed">
                {msSchippersBrand.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Package size={16} /> {msSchippersProducts.length} productos
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={16} /> {msSchippersBrand.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={16} /> {msSchippersBrand.email}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img
                src={msSchippersBrand.logo}
                alt={msSchippersBrand.name}
                className="h-24 md:h-32 w-auto bg-white rounded-2xl px-8 py-4 shadow-2xl"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-[#0F766E]">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-[136px] z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {msSchippersProductCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoriaActiva === cat.id
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            <div className="relative md:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {productosFiltrados.map((prod) => {
              const Icon = productIcon[prod.categoria] || Package;
              const meta = msSchippersCategoryMeta[prod.categoria] || msSchippersCategoryMeta.otro;
              const line = prod.lineId ? lineMetaById[prod.lineId] : null;
              return (
                <div
                  key={prod.codigo}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(prod)}
                >
                  <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.nombre}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-20 h-20 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center ${
                        prod.image ? 'hidden' : ''
                      }`}
                    >
                      <Icon size={40} className="text-[#0F766E]" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#0F766E]">
                        SKU: {prod.codigo}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                      {prod.nombre}
                    </h3>
                    {line && (
                      <p className="text-xs text-teal-600 font-medium mb-2">
                        Línea: {line.name}
                      </p>
                    )}
                    {prod.specs && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{prod.specs}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          prod.stock > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        Stock: {prod.stock} pzas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No se encontraron productos con ese criterio.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal de producto */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
              aria-label="Cerrar"
            >
              <X size={20} className="text-gray-700" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {selectedProduct.image ? (
                  <div className="w-full md:w-48 h-48 rounded-2xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-4">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.nombre}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-48 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const Icon = productIcon[selectedProduct.categoria] || Package;
                      return <Icon size={64} className="text-[#0F766E]" />;
                    })()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#0F766E] mb-1">
                    SKU: {selectedProduct.codigo}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {selectedProduct.nombre}
                  </h2>
                  {selectedLine && (
                    <p className="text-sm font-medium text-teal-700 mb-3">
                      Línea {selectedLine.name} — {selectedLine.tagline}
                    </p>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      msSchippersCategoryMeta[selectedProduct.categoria]?.color ||
                      msSchippersCategoryMeta.otro.color
                    }`}
                  >
                    {msSchippersCategoryMeta[selectedProduct.categoria]?.label ||
                      msSchippersCategoryMeta.otro.label}
                  </span>
                </div>
              </div>

              {/* Descripción de línea */}
              {selectedLine && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText size={20} className="text-[#0F766E]" />
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{selectedLine.description}</p>
                </div>
              )}

              {/* Specs del producto */}
              {selectedProduct.specs && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <ClipboardList size={20} className="text-[#0F766E]" />
                    Especificaciones / Información técnica
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{selectedProduct.specs}</p>
                </div>
              )}

              {/* Beneficios */}
              {selectedLine && selectedLine.benefits && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-[#0F766E]" />
                    Beneficios clave
                  </h3>
                  <ul className="space-y-2">
                    {selectedLine.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-gray-600 flex items-start gap-2">
                        <Check size={18} className="text-[#0F766E] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aplicaciones */}
              {selectedLine && selectedLine.applications && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ClipboardList size={20} className="text-[#0F766E]" />
                    Aplicaciones
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLine.applications.map((app) => (
                      <span
                        key={app}
                        className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PDFs */}
              {selectedLine && selectedLine.pdfs && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Download size={20} className="text-[#0F766E]" />
                    Fichas técnicas y folletos
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={selectedLine.pdfs.a.url}
                      download
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download size={16} />
                      Folleto {selectedLine.pdfs.a.label.includes('frente') ? 'A' : 'PDF A'}
                    </a>
                    <a
                      href={selectedLine.pdfs.b.url}
                      download
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download size={16} />
                      Folleto {selectedLine.pdfs.b.label.includes('reverso') ? 'B' : 'PDF B'}
                    </a>
                  </div>
                </div>
              )}

              {/* Info de stock y disponibilidad */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
                  <MapPin size={18} className="text-gray-400" />
                  <span>Disponible desde León, Guanajuato</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Package size={18} className="text-gray-400" />
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selectedProduct.stock > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    Stock disponible: {selectedProduct.stock} pzas
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappProductUrl(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors flex-1"
                >
                  <Phone size={18} />
                  Cotizar por WhatsApp
                </a>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            ¿Necesitas una cotización o disponibilidad de stock?
          </h2>
          <p className="text-gray-600 mb-8">
            Contamos con inventario de productos MS Schippers en León, Guanajuato. Escríbenos
            por WhatsApp con el código del producto que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${msSchippersBrand.whatsapp}?text=${encodeURIComponent(
                'Hola, me interesa cotizar productos MS Schippers.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a
              href={`tel:${msSchippersBrand.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0F766E] text-white font-semibold rounded-lg hover:bg-[#0d5c56] transition-colors"
            >
              <Phone size={18} />
              Llamar ahora
            </a>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={16} /> León, Guanajuato
            </span>
            <span className="flex items-center gap-1">
              <Mail size={16} /> {msSchippersBrand.email}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MsSchippersPage;
