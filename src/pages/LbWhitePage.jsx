import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Search,
  X,
  Flame,
  Cpu,
  Gauge,
  Plug,
  Fan,
  ShieldAlert,
  Wrench,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';
import { brandCatalogs } from '../data/catalogoMarcas';
import { lbwhiteCurated } from '../data/lbwhiteData';
import { SEO } from '../components/shared';
import ProductDocumentation from '../components/ProductDocumentation';
import { useLanguage } from '../context/LanguageContext';

// Paleta oficial L.B. WHITE (extraída del CSS de lbwhite.com): azul primario
// #003777 (logo), azul oscuro #001f44 (nav/header), blanco. La marca NO usa rojo.
// Acentos 3P solo en la franja degradada y el badge/CTA.
const LBW = {
  dark: '#001f44',
  blue: '#003777',
  light: '#8FB8E8',
};

const WHATSAPP_PHONE = '524771284661';

const categoryIcon = {
  heater: Flame,
  encendido: Cpu,
  gas: Gauge,
  electrico: Plug,
  ventilacion: Fan,
  seguridad: ShieldAlert,
  gabinete: Wrench,
};

const description = {
  es: 'Calefactores de aire forzado y refacciones Guardian® para avicultura. L.B. White Company, Onalaska, Wisconsin, EE. UU., con más de 75 años de experiencia.',
  en: 'Forced air heaters and Guardian® replacement parts for poultry. L.B. White Company, Onalaska, Wisconsin, USA, with over 75 years of experience.',
};

const whatsappProductUrl = (producto) => {
  const text = encodeURIComponent(
    `Hola, me interesa cotizar el producto L.B. WHITE: ${producto.codigo} - ${producto.descripcion}`
  );
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
};

const LbWhitePage = () => {
  const { language } = useLanguage();
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fusiona el catálogo generado (Excel) con los datos curados (categoría, info).
  const productos = useMemo(() => {
    const catalog = brandCatalogs['lbwhite'];
    if (!catalog) return [];
    return catalog.productos.map((p) => {
      const c = lbwhiteCurated.productos[p.codigo];
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
    lbwhiteCurated.categorias.find((c) => c.id === id) || null;

  const pillActiva = { backgroundColor: '#ffffff', color: LBW.blue };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f5fa' }}>
      <SEO
        title="L.B. White | Calefactores Guardian para avicultura - 3P S.A. DE C.V."
        description={description.es}
        keywords="L.B. White, Guardian 250, calefactor granja, heater avícola, refacciones LB White, calefacción aire forzado"
      />

      {/* Hero — identidad L.B. WHITE (azul marino) con acentos 3P */}
      <section
        className="relative text-white overflow-hidden"
        style={{ backgroundColor: LBW.dark }}
      >
        {/* Glows decorativos */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: LBW.light, opacity: 0.15, filter: 'blur(80px)' }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ backgroundColor: LBW.blue, opacity: 0.35, filter: 'blur(70px)' }}
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
            {/* Logo L.B. WHITE grande sobre tarjeta blanca */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-2xl px-8 py-6 md:px-10 md:py-8 shadow-2xl">
                <img
                  src="/images/brands/lbwhite-oficial.png"
                  alt="L.B. White"
                  className="h-14 md:h-20 lg:h-24 w-auto"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-p3-red text-white text-xs md:text-sm font-bold rounded-full mb-5 shadow-lg">
                <ShieldCheck size={15} />
                Distribuidor Autorizado en México
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Calefactores de aire forzado Guardian®
              </h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-6">
                {description[language] || description.es}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Package size={16} style={{ color: LBW.light }} />
                  {productos.length} productos
                </span>
                <span className="flex items-center gap-2">
                  <LayoutGrid size={16} style={{ color: LBW.light }} />
                  {lbwhiteCurated.categorias.length} categorías
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: LBW.light }} />
                  León, Guanajuato
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Franja de acento degradado L.B. WHITE -> 3P */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${LBW.blue} 0%, ${LBW.blue} 60%, #C41E3A 100%)`,
          }}
        />
      </section>

      {/* Submenú de categorías + buscador (sticky) */}
      <section
        className="sticky z-30 shadow-md"
        style={{ backgroundColor: LBW.blue, top: 'var(--header-h, 136px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Categorías: fluyen en varias filas, todas visibles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaActiva('todos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                categoriaActiva === 'todos'
                  ? 'shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={categoriaActiva === 'todos' ? pillActiva : {}}
            >
              <LayoutGrid size={15} />
              Todos
              <span className="text-xs opacity-70">({productos.length})</span>
            </button>
            {lbwhiteCurated.categorias.map((cat) => {
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
                  style={activa ? pillActiva : {}}
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
                style={{ '--tw-ring-color': LBW.light }}
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
                <span className="font-semibold" style={{ color: LBW.blue }}>
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
                    style={{ backgroundColor: `${LBW.blue}1a` }}
                  >
                    <Package size={40} style={{ color: LBW.blue }} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                  <span
                    className="text-xs font-semibold mb-2"
                    style={{ color: LBW.blue }}
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
                  style={{ backgroundColor: '#f2f5fa' }}
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
                    style={{ color: LBW.blue }}
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

              <ProductDocumentation marca="lbwhite" codigo={selectedProduct.codigo} />

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
      <section className="text-white py-16" style={{ backgroundColor: LBW.dark }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img
            src="/images/brands/lbwhite-oficial.png"
            alt="L.B. White"
            className="h-12 w-auto mx-auto mb-6 bg-white rounded-xl px-4 py-2"
            loading="lazy"
          />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Necesitas una cotización de productos L.B. White?
          </h2>
          <p className="text-white/75 mb-8">
            Contamos con inventario y refacciones L.B. White en León, Guanajuato.
            Escríbenos con el código del producto que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                'Hola, me interesa cotizar productos L.B. WHITE.'
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

export default LbWhitePage;
