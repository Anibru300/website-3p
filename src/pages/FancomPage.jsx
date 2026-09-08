import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Search,
  X,
  Thermometer,
  Fan,
  Radar,
  Weight,
  Droplets,
  Network,
  Zap,
  Wrench,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';
import { brandCatalogs } from '../data/catalogoMarcas';
import { fancomCurated } from '../data/fancomData';
import { SEO } from '../components/shared';
import ProductDocumentation from '../components/ProductDocumentation';
import { useLanguage } from '../context/LanguageContext';

// Paleta oficial Fancom (fancom.com): verde oscuro #002c24 / #004136, acento #43be64
// Combinada con acentos 3P (rojo #C41E3A, azul #1E3A8A).
const FANCOM = {
  dark: '#002c24',
  green: '#004136',
  accent: '#43be64',
};

const WHATSAPP_PHONE = '524771284661';

const categoryIcon = {
  clima: Thermometer,
  ventilacion: Fan,
  sensores: Radar,
  actuadores: Weight,
  enfriamiento: Droplets,
  conectividad: Network,
  electricos: Zap,
  montaje: Wrench,
};

const description = {
  es: 'Sistemas de control ambiental y automatización para granjas avícolas y porcícolas. Tecnología holandesa de precisión.',
  en: 'Environmental control and automation systems for poultry and swine farms. Precision Dutch technology.',
};

const whatsappProductUrl = (producto) => {
  const text = encodeURIComponent(
    `Hola, me interesa cotizar el producto FANCOM: ${producto.codigo} - ${producto.descripcion}`
  );
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
};

const FancomPage = () => {
  const { language } = useLanguage();
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fusiona el catálogo generado (Excel) con los datos curados (categoría, info).
  const productos = useMemo(() => {
    const catalog = brandCatalogs['fancom'];
    if (!catalog) return [];
    return catalog.productos.map((p) => {
      const c = fancomCurated.productos[p.codigo];
      if (!c) return { ...p, categoria: null, info: null };
      return {
        ...p,
        categoria: c.categoria || null,
        descripcion: c.descripcion || p.descripcion,
        info: c.info || null,
      };
    });
  }, []);

  const conteoPorCategoria = useMemo(() => {
    const conteo = {};
    productos.forEach((p) => {
      if (p.categoria) conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return conteo;
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return productos.filter((p) => {
      const matchCategory =
        categoriaActiva === 'todos' || p.categoria === categoriaActiva;
      const matchSearch =
        !term ||
        p.codigo.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        (p.info && (p.info.es || '').toLowerCase().includes(term));
      return matchCategory && matchSearch;
    });
  }, [productos, categoriaActiva, searchTerm]);

  const categoriaDe = (id) =>
    fancomCurated.categorias.find((c) => c.id === id) || null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f2ee' }}>
      <SEO
        title="FANCOM | Control de clima y automatización - 3P S.A. DE C.V."
        description={description.es}
        keywords="Fancom, control ambiental, automatización granjas, control climático avícola, sensores Fancom, Lumina"
      />

      {/* Hero — identidad Fancom (verde oscuro) con acentos 3P */}
      <section
        className="relative text-white overflow-hidden"
        style={{ backgroundColor: FANCOM.dark }}
      >
        {/* Glows decorativos */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: FANCOM.accent, opacity: 0.12, filter: 'blur(80px)' }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ backgroundColor: FANCOM.accent, opacity: 0.08, filter: 'blur(70px)' }}
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
            {/* Logo FANCOM grande */}
            <div className="flex-shrink-0">
              <img
                src="/images/brands/fancom-white.svg"
                alt="FANCOM"
                className="h-24 md:h-36 lg:h-44 w-auto"
                loading="lazy"
              />
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-p3-red text-white text-xs md:text-sm font-bold rounded-full mb-5 shadow-lg">
                <ShieldCheck size={15} />
                Distribuidor Autorizado en México
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Control de clima y automatización
              </h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-6">
                {description[language] || description.es}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Package size={16} style={{ color: FANCOM.accent }} />
                  {productos.length} productos
                </span>
                <span className="flex items-center gap-2">
                  <LayoutGrid size={16} style={{ color: FANCOM.accent }} />
                  {fancomCurated.categorias.length} categorías
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: FANCOM.accent }} />
                  León, Guanajuato
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Franja de acento degradado Fancom -> 3P */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${FANCOM.accent} 0%, ${FANCOM.accent} 60%, #C41E3A 100%)`,
          }}
        />
      </section>

      {/* Submenú de categorías + buscador (sticky) */}
      <section
        className="sticky z-30 shadow-md"
        style={{ top: 'var(--header-h, 136px)' }}
        style={{ backgroundColor: FANCOM.green }}
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
                categoriaActiva === 'todos' ? { backgroundColor: FANCOM.accent, color: FANCOM.dark } : {}
              }
            >
              <LayoutGrid size={15} />
              Todos
              <span className="text-xs opacity-70">({productos.length})</span>
            </button>
            {fancomCurated.categorias.map((cat) => {
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
                  style={activa ? { backgroundColor: FANCOM.accent, color: FANCOM.dark } : {}}
                >
                  <Icon size={15} />
                  {cat[language] || cat.es}
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
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 text-sm text-gray-900"
                style={{ '--tw-ring-color': FANCOM.accent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-6">
            {productosFiltrados.length} de {productos.length} productos
            {categoriaActiva !== 'todos' && (
              <>
                {' '}
                en{' '}
                <span className="font-semibold" style={{ color: FANCOM.green }}>
                  {categoriaDe(categoriaActiva)?.[language] || categoriaDe(categoriaActiva)?.es}
                </span>
              </>
            )}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.codigo}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                onClick={() => setSelectedProduct(prod)}
              >
                <div className="h-48 bg-white flex items-center justify-center p-4 relative overflow-hidden">
                  <img
                    src={prod.imagen}
                    alt={prod.descripcion}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center hidden"
                    style={{ backgroundColor: `${FANCOM.accent}1a` }}
                  >
                    <Package size={40} style={{ color: FANCOM.green }} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                  <span
                    className="text-xs font-semibold mb-2"
                    style={{ color: FANCOM.green }}
                  >
                    SKU: {prod.codigo}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                    {prod.descripcion}
                  </h3>
                </div>
              </div>
            ))}
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
                  style={{ backgroundColor: '#f2f2ee' }}
                >
                  <img
                    src={selectedProduct.imagen}
                    alt={selectedProduct.descripcion}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: FANCOM.green }}
                  >
                    SKU: {selectedProduct.codigo}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.descripcion}
                  </h2>
                  {selectedProduct.info && (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {selectedProduct.info[language] || selectedProduct.info.es}
                    </p>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Disponible
                  </span>
                </div>
              </div>

              <ProductDocumentation marca="fancom" codigo={selectedProduct.codigo} />

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
      <section className="text-white py-16" style={{ backgroundColor: FANCOM.dark }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img
            src="/images/brands/fancom-white.svg"
            alt="FANCOM"
            className="h-12 w-auto mx-auto mb-6 opacity-90"
            loading="lazy"
          />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Necesitas una cotización de productos FANCOM?
          </h2>
          <p className="text-white/75 mb-8">
            Contamos con inventario y refacciones FANCOM en León, Guanajuato. Escríbenos
            con el código del producto que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                'Hola, me interesa cotizar productos FANCOM.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a
              href="mailto:trespsadecv@hotmail.com"
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
              <Mail size={16} /> trespsadecv@hotmail.com
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FancomPage;
