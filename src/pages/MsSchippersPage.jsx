import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Search,
  X,
  Sparkles,
  Wrench,
  Settings2,
  LayoutGrid,
  ShieldCheck,
  FileText,
  Check,
} from 'lucide-react';
import {
  msSchippersBrand,
  msSchippersLines,
  msSchippersProductCategories,
  msSchippersProducts,
  whatsappLineUrl,
  whatsappProductUrl,
} from '../data/msSchippersData';
import { SEO } from '../components/shared';
import ProductDocumentation from '../components/ProductDocumentation';

// Paleta MS Schippers (teal corporativo) combinada con acentos 3P.
const BRAND = {
  dark: '#0B3D3A',
  green: '#0F766E',
  accent: '#2DD4BF',
};

const categoryIcon = {
  higiene: Sparkles,
  equipo: Settings2,
  refaccion: Wrench,
  otro: Package,
};

const lineMetaById = msSchippersLines.reduce((acc, line) => {
  acc[line.id] = line;
  return acc;
}, {});

const categoriaNombre = (id) =>
  msSchippersProductCategories.find((c) => c.id === id)?.nombre || id;

const MsSchippersPage = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productosFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return msSchippersProducts.filter((prod) => {
      const matchCategory =
        categoriaActiva === 'todos' || prod.categoria === categoriaActiva;
      const matchSearch =
        !term ||
        prod.codigo.toLowerCase().includes(term) ||
        prod.nombre.toLowerCase().includes(term) ||
        (prod.specs && prod.specs.toLowerCase().includes(term)) ||
        (prod.lineId && lineMetaById[prod.lineId]?.name.toLowerCase().includes(term));
      return matchCategory && matchSearch;
    });
  }, [categoriaActiva, searchTerm]);

  const conteoPorCategoria = useMemo(() => {
    const conteo = {};
    msSchippersProducts.forEach((p) => {
      conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return conteo;
  }, []);

  const selectedLine = selectedProduct?.lineId
    ? lineMetaById[selectedProduct.lineId]
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f7f6' }}>
      <SEO
        title="MS Schippers | Higiene y Bioseguridad - 3P S.A. DE C.V."
        description={msSchippersBrand.description}
        keywords={msSchippersBrand.keywords}
      />

      {/* Hero — identidad MS Schippers (teal) con acentos 3P */}
      <section
        className="relative text-white overflow-hidden"
        style={{ backgroundColor: BRAND.dark }}
      >
        {/* Glows decorativos */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: BRAND.accent, opacity: 0.12, filter: 'blur(80px)' }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ backgroundColor: BRAND.accent, opacity: 0.08, filter: 'blur(70px)' }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-64 h-64 border-4 border-white rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-14 md:py-20">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </a>

          <div className="flex flex-col lg:flex-row lg:items-center gap-10">
            {/* Logo MS Schippers */}
            <div className="flex-shrink-0">
              <img
                src={msSchippersBrand.logo}
                alt={msSchippersBrand.name}
                className="h-24 md:h-32 lg:h-36 w-auto bg-white rounded-2xl px-8 py-4 shadow-2xl"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-p3-red text-white text-xs md:text-sm font-bold rounded-full mb-5 shadow-lg">
                <ShieldCheck size={15} />
                Distribuidor Autorizado en México
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {msSchippersBrand.slogan}
              </h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-6">
                {msSchippersBrand.description}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Package size={16} style={{ color: BRAND.accent }} />
                  {msSchippersProducts.length} productos
                </span>
                <span className="flex items-center gap-2">
                  <LayoutGrid size={16} style={{ color: BRAND.accent }} />
                  {msSchippersLines.length} líneas
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: BRAND.accent }} />
                  León, Guanajuato
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Franja de acento degradado MS Schippers -> 3P */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.accent} 0%, ${BRAND.accent} 60%, #C41E3A 100%)`,
          }}
        />
      </section>

      {/* Submenú de categorías + buscador (sticky) */}
      <section
        className="sticky z-30 shadow-md"
        style={{ top: 'var(--header-h, 136px)', backgroundColor: BRAND.green }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Categorías: fluyen en varias filas, todas visibles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaActiva('todos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                categoriaActiva === 'todos'
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={
                categoriaActiva === 'todos' ? { backgroundColor: BRAND.accent, color: BRAND.dark } : {}
              }
            >
              <LayoutGrid size={15} />
              Todos
              <span className="text-xs opacity-70">({msSchippersProducts.length})</span>
            </button>
            {msSchippersProductCategories.filter((c) => c.id !== 'todos').map((cat) => {
              const Icon = categoryIcon[cat.id] || Package;
              const activa = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activa
                      ? 'shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={activa ? { backgroundColor: BRAND.accent, color: BRAND.dark } : {}}
                >
                  <Icon size={15} />
                  {cat.nombre}
                  <span className="text-xs opacity-70">
                    ({conteoPorCategoria[cat.id] || 0})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Buscador: línea propia, alineado a la derecha */}
          <div className="flex justify-end mt-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por código, nombre o línea..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 text-sm text-gray-900"
                style={{ '--tw-ring-color': BRAND.accent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-6">
            {productosFiltrados.length} de {msSchippersProducts.length} productos
            {categoriaActiva !== 'todos' && (
              <>
                {' '}
                en{' '}
                <span className="font-semibold" style={{ color: BRAND.green }}>
                  {categoriaNombre(categoriaActiva)}
                </span>
              </>
            )}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {productosFiltrados.map((prod) => {
              const line = prod.lineId ? lineMetaById[prod.lineId] : null;
              const Icon = categoryIcon[prod.categoria] || Package;
              return (
                <div
                  key={prod.codigo}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(prod)}
                >
                  <div className="h-48 bg-white flex items-center justify-center p-4 relative overflow-hidden">
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
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                        prod.image ? 'hidden' : ''
                      }`}
                      style={{ backgroundColor: `${BRAND.accent}1a` }}
                    >
                      <Icon size={40} style={{ color: BRAND.green }} />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                    <span
                      className="text-xs font-semibold mb-2"
                      style={{ color: BRAND.green }}
                    >
                      SKU: {prod.codigo}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                      {prod.nombre}
                    </h3>
                    {line && (
                      <p className="text-xs font-medium mt-2" style={{ color: line.bgColor }}>
                        Línea: {line.name}
                      </p>
                    )}
                    {prod.specs && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{prod.specs}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No se encontraron productos con ese criterio.
              </p>
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
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div
                  className="w-full md:w-80 h-72 rounded-2xl border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-4"
                  style={{ backgroundColor: '#f2f7f6' }}
                >
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.nombre}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${BRAND.accent}1a` }}
                    >
                      {(categoryIcon[selectedProduct.categoria] || Package) &&
                        (() => {
                          const Icon = categoryIcon[selectedProduct.categoria] || Package;
                          return <Icon size={48} style={{ color: BRAND.green }} />;
                        })()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: BRAND.green }}
                  >
                    SKU: {selectedProduct.codigo}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.nombre}
                  </h2>
                  {selectedProduct.specs && (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {selectedProduct.specs}
                    </p>
                  )}
                  {selectedLine && (
                    <p className="text-sm font-semibold mb-4" style={{ color: selectedLine.bgColor }}>
                      Línea: {selectedLine.name} — {selectedLine.tagline}
                    </p>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Disponible
                  </span>
                </div>
              </div>

              {selectedLine && selectedLine.benefits && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Beneficios de {selectedLine.name}
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {selectedLine.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.green }} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLine && selectedLine.applications && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Aplicaciones</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLine.applications.map((app) => (
                      <span
                        key={app}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: BRAND.green }}
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLine && selectedLine.pdfs && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Documentación</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={selectedLine.pdfs.a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: BRAND.green }}
                    >
                      <FileText size={16} />
                      Folleto {selectedLine.pdfs.a.label.includes('frente') ? 'A' : 'PDF A'}
                      <span className="text-white/70">({selectedLine.pdfs.a.size})</span>
                    </a>
                    <a
                      href={selectedLine.pdfs.b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: BRAND.green }}
                    >
                      <FileText size={16} />
                      Folleto {selectedLine.pdfs.b.label.includes('reverso') ? 'B' : 'PDF B'}
                      <span className="text-white/70">({selectedLine.pdfs.b.size})</span>
                    </a>
                  </div>
                </div>
              )}

              <ProductDocumentation marca="ms-schippers" codigo={selectedProduct.codigo} />

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={18} className="text-gray-400" />
                  <span>Disponible desde León, Guanajuato</span>
                </div>
              </div>
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

      {/* CTA inferior */}
      <section className="text-white py-16" style={{ backgroundColor: BRAND.dark }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img
            src={msSchippersBrand.logo}
            alt={msSchippersBrand.name}
            className="h-12 w-auto mx-auto mb-6 opacity-90 bg-white rounded-xl px-4 py-2"
            loading="lazy"
          />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Necesitas una cotización de productos MS Schippers?
          </h2>
          <p className="text-white/75 mb-8">
            Contamos con inventario de higiene y bioseguridad MS Schippers en León,
            Guanajuato. Escríbenos con el código del producto que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappLineUrl(msSchippersLines[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a
              href={`mailto:${msSchippersBrand.email}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-p3-red text-white font-semibold rounded-xl hover:bg-p3-red-dark transition-colors"
            >
              <Mail size={18} />
              Escríbenos por correo
            </a>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/60">
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
