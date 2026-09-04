import { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Clock, MapPin, Phone, Mail, ExternalLink, Package, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/shared';
import ProductDocumentation from '../components/ProductDocumentation';
import { brandCatalogs } from '../data/catalogoMarcas';

const WHATSAPP_PHONE = '524771284661';

const catalogWhatsappUrl = (brandName, producto) => {
  const text = encodeURIComponent(
    `Hola, me interesa cotizar el producto ${brandName}: ${producto.codigo} - ${producto.descripcion}`
  );
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
};

const brandData = {
  lubing: {
    name: 'LUBING',
    description: {
      es: 'Sistemas de bebida y enfriamiento evaporativo para avicultura. Tecnología alemana para el bienestar animal.',
      en: 'Drinking and evaporative cooling systems for poultry. German technology for animal welfare.'
    },
    keywords: 'Lubing, bebederos avícolas, enfriamiento evaporativo, sistemas de bebida',
    color: '#00A8E8'
  },
  'georgia-poultry': {
    name: 'GEORGIA POULTRY',
    description: {
      es: 'Equipos especializados para la industria avícola. Soluciones confiables para granjas de pollos.',
      en: 'Specialized equipment for the poultry industry. Reliable solutions for chicken farms.'
    },
    keywords: 'Georgia Poultry, equipos avícolas USA, sistemas granjas pollos',
    color: '#F4A261'
  },
  fancom: {
    name: 'FANCOM',
    description: {
      es: 'Sistemas de control ambiental y automatización para granjas avícolas y porcícolas. Tecnología holandesa de precisión.',
      en: 'Environmental control and automation systems for poultry and swine farms. Precision Dutch technology.'
    },
    keywords: 'Fancom, control ambiental, automatización granjas, sistemas Holland',
    color: '#E76F51'
  },
  'ms-schippers': {
    name: 'MS Schippers',
    description: {
      es: 'Higiene y bioseguridad para granjas. Productos especializados en limpieza y desinfección.',
      en: 'Hygiene and biosecurity for farms. Specialized cleaning and disinfection products.'
    },
    keywords: 'MS Schippers, higiene granjas, bioseguridad, limpieza avícola',
    color: '#0F766E',
    image: '/images/brands/ms-schippers.svg'
  },
  sbm: {
    name: 'SBM',
    description: {
      es: 'Sistemas de calefacción y climatización para avicultura y porcicultura.',
      en: 'Heating and climate systems for poultry and swine farming.'
    },
    keywords: 'SBM, calefacción avícola, brooders, climatización granjas',
    color: '#F97316',
    image: '/images/brands/sbm.png'
  },
  lbwhite: {
    name: 'LB White',
    description: {
      es: 'Sistemas de calefacción y climatización para avicultura, porcicultura e invernaderos.',
      en: 'Heating and climate systems for poultry, swine and greenhouses.'
    },
    keywords: 'LB White, calefactores avícolas, brooders, climatización granjas',
    color: '#1e3a8a'
  },
  amt: {
    name: 'AMT',
    description: {
      es: 'Tecnología avanzada para la industria avícola. Equipos innovadores para producción de pollos.',
      en: 'Advanced technology for the poultry industry. Innovative equipment for chicken production.'
    },
    keywords: 'AMT, tecnología avícola, equipos innovadores, sistemas avicultura',
    color: '#9B5DE5'
  },
  alke: {
    name: 'ALKE',
    description: {
      es: 'Calefacción infrarroja y calefactores para avicultura. Tecnología holandesa para el confort de los animales.',
      en: 'Infrared heating and heaters for poultry. Dutch technology for animal comfort.'
    },
    keywords: 'ALKE, calefacción infrarroja, calefactores pollos, calefacción avícola',
    color: '#F77F00'
  },
  tigsa: {
    name: 'TIGSA',
    description: {
      es: 'Equipos para la industria avícola y porcícola. Soluciones integrales para granjas.',
      en: 'Equipment for the poultry and swine industry. Comprehensive solutions for farms.'
    },
    keywords: 'TIGSA, equipos avícolas, equipos porcícolas, sistemas granjas',
    color: '#4361EE'
  },
};

const GenericBrandPage = ({ brandId }) => {
  const { language, t } = useLanguage();
  const brand = brandData[brandId] || {
    name: brandId?.toUpperCase(),
    description: {
      es: 'Estamos trabajando en el catálogo dedicado de esta marca.',
      en: 'We are working on the dedicated catalog for this brand.'
    },
    keywords: 'equipos avícolas, granjas, León Guanajuato',
    color: '#1e3a8a'
  };

  const description = brand.description[language] || brand.description.es;
  const contactText = t('brandPage.contactText').replace('{brand}', brand.name);

  const catalog = brandCatalogs[brandId];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productosFiltrados = useMemo(() => {
    if (!catalog) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return catalog.productos;
    return catalog.productos.filter(
      (p) =>
        p.codigo.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }, [catalog, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${brand.name} | Distribuidor Autorizado - 3P S.A. DE C.V.`}
        description={description}
        keywords={brand.keywords}
      />

      {/* Hero con color de marca */}
      <section
        className="relative text-white py-16 md:py-24"
        style={{ backgroundColor: brand.color }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-64 h-64 border-4 border-white rounded-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>{t('brandPage.backToHome')}</span>
          </a>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded-full mb-4">
                Distribuidor Autorizado en México
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {brand.name}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                {description}
              </p>
              {catalog && (
                <div className="flex flex-wrap gap-4 text-sm text-white/80 mt-4">
                  <span className="flex items-center gap-1">
                    <Package size={16} /> {catalog.productos.length}{' '}
                    {t('brandPage.productsCountShort')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div
                className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-2xl flex items-center justify-center p-4 shadow-2xl"
              >
                <img
                  src={brand.image || `/images/brands/${brandId}.svg`}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.textContent = brand.name.charAt(0);
                      parent.className = 'text-4xl font-bold text-gray-800';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      {catalog ? (
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Buscador */}
            <div className="relative max-w-md mx-auto mb-10">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t('brandPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-p3-blue focus:border-transparent shadow-sm"
              />
            </div>

            <p className="text-center text-gray-500 text-sm mb-8">
              {t('brandPage.productsCount').replace('{count}', catalog.productos.length)}
            </p>

            {/* Grilla de productos */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.codigo}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(prod)}
                >
                  <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
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
                    <div className="w-20 h-20 rounded-2xl bg-p3-blue/10 flex items-center justify-center hidden">
                      <Package size={40} className="text-p3-blue" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-p3-blue mb-2">
                      {t('brandPage.skuLabel')} {prod.codigo}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                      {prod.descripcion}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Sin resultados */}
            {productosFiltrados.length === 0 && (
              <div className="text-center py-20">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('brandPage.noResults')}</p>
              </div>
            )}
          </div>
        </section>
      ) : (
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden -mt-20 relative z-20">
            <div className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-p3-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={36} className="text-p3-blue" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Catálogo en preparación
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                {contactText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <a
                  href="https://wa.me/524771284661"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
                >
                  <Phone size={18} />
                  {t('brandPage.whatsappLabel')}
                </a>
                <a
                  href="mailto:trespsadecv@hotmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Mail size={18} />
                  {t('brandPage.emailLabel')}
                </a>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  ¿Por qué elegir {brand.name}?
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 text-left">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Clock size={20} className="text-p3-red mb-2" />
                    <p className="font-semibold text-gray-900 text-sm">Respuesta rápida</p>
                    <p className="text-gray-500 text-sm">Te contactamos en menos de 24 horas.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <MapPin size={20} className="text-p3-red mb-2" />
                    <p className="font-semibold text-gray-900 text-sm">Inventario local</p>
                    <p className="text-gray-500 text-sm">Stock y distribución desde León, Gto.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Phone size={20} className="text-p3-red mb-2" />
                    <p className="font-semibold text-gray-900 text-sm">Asesoría técnica</p>
                    <p className="text-gray-500 text-sm">Especialistas en equipos avícolas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

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
                <div className="w-full md:w-80 h-72 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-4">
                  <img
                    src={selectedProduct.imagen}
                    alt={selectedProduct.descripcion}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-p3-blue mb-1">
                    {t('brandPage.skuLabel')} {selectedProduct.codigo}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.descripcion}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {t('brandPage.availableLabel')}
                  </span>
                </div>
              </div>

              <ProductDocumentation marca={brandId} codigo={selectedProduct.codigo} />

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={18} className="text-gray-400" />
                  <span>{t('brandPage.availableFrom')}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={catalogWhatsappUrl(brand.name, selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors flex-1"
                >
                  <Phone size={18} />
                  {t('brandPage.whatsappLabel')}
                </a>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('brandPage.closeLabel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA inferior */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {catalog ? t('brandPage.ctaWithCatalogTitle') : 'Explora nuestros catálogos activos'}
          </h2>
          <p className="text-gray-600 mb-8">
            {catalog
              ? t('brandPage.ctaWithCatalogText').replace('{brand}', brand.name)
              : `Mientras preparamos el catálogo de ${brand.name}, puedes revisar las líneas que ya tenemos disponibles.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#catalogos"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-p3-red text-white font-semibold rounded-xl hover:bg-p3-red-dark transition-colors"
            >
              <ExternalLink size={18} />
              Ver catálogos disponibles
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
              {t('brandPage.backToHome')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GenericBrandPage;
