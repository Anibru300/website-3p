import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronRight, Package, Info, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';

const CatalogByBrand = () => {
  const { t, language } = useLanguage();
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Marcas con sus productos - usando useMemo para recalcular cuando cambia el idioma
  const brandsData = useMemo(() => [
    {
      id: 'fancom',
      name: 'FANCOM',
      origin: 'Holanda',
      color: 'from-orange-500 to-red-600',
      logo: 'images/brands/fancom.png',
      description: language === 'es' 
        ? 'Líder mundial en sistemas de control climático'
        : 'World leader in climate control systems',
      products: [
        {
          id: 1,
          name: 'Lumina 21',
          category: 'Controlador',
          description: language === 'es' ? 'Controlador climático avanzado' : 'Advanced climate controller',
          specs: ['6 zonas', '16 sensores', 'WiFi/Ethernet'],
        },
        {
          id: 2,
          name: 'Valve Control',
          category: 'Válvulas',
          description: language === 'es' ? 'Sistema de control de válvulas' : 'Valve control system',
          specs: ['Precisión ±0.5°C', 'Control PID', 'Alarmas'],
        },
      ],
    },
    {
      id: 'landmeco',
      name: 'LANDMECO',
      origin: 'Dinamarca',
      color: 'from-blue-500 to-blue-700',
      logo: 'images/brands/landmeco.png',
      description: language === 'es'
        ? 'Especialistas en sistemas de alimentación'
        : 'Feeding systems specialists',
      products: [
        {
          id: 3,
          name: 'Chain Feeder',
          category: 'Alimentación',
          description: language === 'es' ? 'Comedero de cadena automático' : 'Automatic chain feeder',
          specs: ['3m/4m/6m', '150kg capacidad', 'Acero inoxidable'],
        },
        {
          id: 4,
          name: 'Pan Feeder',
          category: 'Alimentación',
          description: language === 'es' ? 'Comedero circular' : 'Circular feeder',
          specs: ['14 compartimentos', 'Fácil limpieza', 'Ajustable'],
        },
      ],
    },
    {
      id: 'roxell',
      name: 'ROXELL',
      origin: 'Bélgica',
      color: 'from-green-500 to-teal-600',
      logo: 'images/brands/roxell.svg',
      description: language === 'es'
        ? 'Sistemas de alimentación y bebida'
        : 'Feeding and drinking systems',
      products: [
        {
          id: 5,
          name: 'Feeder Pan',
          category: 'Alimentación',
          description: language === 'es' ? 'Comedero circular de alta capacidad' : 'High capacity circular feeder',
          specs: ['14 compartimentos', 'Anti-desperdicio', 'Fácil limpieza'],
        },
        {
          id: 6,
          name: 'Nipple Drinker',
          category: 'Bebida',
          description: language === 'es' ? 'Bebedero nipple de precisión' : 'Precision nipple drinker',
          specs: ['360° activación', 'Anti-goteo', 'Alta durabilidad'],
        },
      ],
    },
    {
      id: 'lubing',
      name: 'LUBING',
      origin: 'Alemania',
      color: 'from-red-500 to-red-700',
      logo: 'images/brands/lubing.png',
      description: language === 'es'
        ? 'Bebederos y sistemas de humidificación'
        : 'Drinking and humidification systems',
      products: [
        {
          id: 7,
          name: 'Nipple Drinker',
          category: 'Bebederos',
          description: language === 'es' ? 'Bebedero nipple de precisión' : 'Precision nipple drinker',
          specs: ['60-80 ml/min', '360° activación', 'Anti-goteo'],
        },
        {
          id: 8,
          name: 'Cooling Pad',
          category: 'Climatización',
          description: language === 'es' ? 'Pared húmeda evaporativa' : 'Evaporative cooling pad',
          specs: ['1500x600mm', 'Eficiencia 80%', 'Celulosa'],
        },
      ],
    },
  ], [language]);

  // Filtrar productos
  const filteredBrands = useMemo(() => {
    return brandsData.filter(brand => {
      if (selectedBrand === 'all') return true;
      return brand.id === selectedBrand;
    }).map(brand => ({
      ...brand,
      products: brand.products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(brand => brand.products.length > 0);
  }, [brandsData, selectedBrand, searchQuery]);

  return (
    <section id="catalogo-marcas" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden transition-colors duration-300">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-p3-red/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-p3-blue/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-p3-red/10 dark:bg-p3-red/20 text-p3-red text-sm font-semibold rounded-full mb-4">
            <Package size={16} />
            {t('catalog.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {language === 'es' ? 'Catálogo por Marca' : 'Catalog by Brand'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            {language === 'es' 
              ? 'Explora nuestros productos organizados por marca. Encuentra el equipo perfecto para tu granja.'
              : 'Explore our products organized by brand. Find the perfect equipment for your farm.'}
          </p>
        </FadeInSection>

        {/* Filtros */}
        <FadeInSection delay={100} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar productos...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Filter size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBrand === 'all'
                    ? 'bg-p3-red text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {t('catalog.all')}
              </button>
              {brandsData.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedBrand === brand.id
                      ? 'bg-p3-red text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* Secciones por marca */}
        <div className="space-y-16">
          {filteredBrands.map((brand, brandIndex) => (
            <FadeInSection key={brand.id} delay={brandIndex * 100}>
              <div className={`bg-gradient-to-r ${brand.color} rounded-2xl p-8 mb-8`}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-white rounded-xl p-4 w-32 h-24 flex items-center justify-center shadow-lg">
                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="text-center md:text-left text-white">
                    <h3 className="text-3xl font-bold mb-2">{brand.name}</h3>
                    <p className="text-white/80">{brand.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">{brand.origin}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brand.products.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <Package size={64} className="text-gray-400" />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-medium text-p3-blue bg-blue-50 px-2 py-1 rounded">{product.category}</span>
                      <h4 className="text-lg font-bold text-p3-dark dark:text-white mt-2 mb-2">{product.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{product.description}</p>
                      <button
                        onClick={() => setSelectedProduct({ ...product, brand: brand.name })}
                        className="w-full py-2 border-2 border-p3-red text-p3-red rounded-xl font-medium hover:bg-p3-red hover:text-white transition-all"
                      >
                        {t('catalog.requestQuote')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-500">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-4">{selectedProduct.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedProduct.description}</p>
            <a href="#contacto" onClick={() => setSelectedProduct(null)} className="block w-full py-3 bg-p3-red text-white text-center rounded-xl">
              {t('catalog.requestQuote')}
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default CatalogByBrand;
