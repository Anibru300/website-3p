import { useState } from 'react';
import { Search, Filter, Download, ChevronRight, Package, Wind, Droplets, Thermometer, Info, X, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';

const Catalog = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Categorías disponibles
  const categories = [
    { id: 'all', label: t('catalog.all'), icon: Package },
    { id: 'ventilation', label: t('catalog.ventilation'), icon: Wind },
    { id: 'feeding', label: t('catalog.feeding'), icon: Package },
    { id: 'drinking', label: t('catalog.drinking'), icon: Droplets },
    { id: 'climate', label: t('catalog.climate'), icon: Thermometer },
  ];

  // Productos de ejemplo (placeholder - aquí agregarás tus productos reales)
  const products = [
    {
      id: 1,
      name: 'Ventilador DACS AGS',
      brand: 'DACS',
      category: 'ventilation',
      image: null, // Agregar ruta de imagen cuando tengas las fotos
      description: 'Ventilador de alta eficiencia con velocidad variable y motor EC.',
      features: ['Velocidad variable', 'Motor EC', '48" de diámetro', 'Bajo consumo'],
      specs: { power: '1.5 kW', voltage: '220V', weight: '45 kg' },
    },
    {
      id: 2,
      name: 'Comedero LANDMECO Chain',
      brand: 'LANDMECO',
      category: 'feeding',
      image: null,
      description: 'Sistema de alimentación por cadena para pollos de engorda.',
      features: ['Cadena de acero inoxidable', 'Control de nivel', 'Fácil limpieza'],
      specs: { length: '3m / 4m / 6m', capacity: '150 kg', material: 'Acero inoxidable' },
    },
    {
      id: 3,
      name: 'Bebedero LUBING Nipple',
      brand: 'LUBING',
      category: 'drinking',
      image: null,
      description: 'Bebedero nipple de alta precisión para aves.',
      features: ['Alta precisión', 'Fácil activación', 'Anti-goteo'],
      specs: { flow: '60-80 ml/min', pressure: '20-40 cm', material: 'Plástico/PVC' },
    },
    {
      id: 4,
      name: 'Controlador FANCOM Lumina',
      brand: 'FANCOM',
      category: 'climate',
      image: null,
      description: 'Controlador climático inteligente para granjas avícolas.',
      features: ['Control de temperatura', 'Control de humedad', 'Monitoreo 24/7', 'App móvil'],
      specs: { zones: 'Hasta 6 zonas', sensors: '16 entradas', connectivity: 'WiFi/Ethernet' },
    },
    {
      id: 5,
      name: 'Silo HOG SLAT',
      brand: 'HOG SLAT',
      category: 'feeding',
      image: null,
      description: 'Silo de almacenamiento para alimento de granja.',
      features: ['Alta capacidad', 'Resistente a la intemperie', 'Sistema de descarga'],
      specs: { capacity: '3-20 toneladas', material: 'Acero galvanizado', diameter: '1.8m - 3.6m' },
    },
    {
      id: 6,
      name: 'Pared Húmeda LUBING',
      brand: 'LUBING',
      category: 'climate',
      image: null,
      description: 'Sistema de enfriamiento evaporativo para control térmico.',
      features: ['Alta eficiencia', 'Celdas de papel', 'Bajo consumo de agua'],
      specs: { dimensions: '1500x600x150 mm', efficiency: '80%', material: 'Celulosa' },
    },
  ];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalogo" className="py-20 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-p3-red/10 dark:bg-p3-red/20 text-p3-red text-sm font-semibold rounded-full mb-4">
            {t('catalog.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('catalog.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            {t('catalog.subtitle')}
          </p>
        </FadeInSection>

        {/* Filtros y Búsqueda */}
        <FadeInSection delay={100} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            {/* Barra de búsqueda */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>

            {/* Filtros de categoría */}
            <div className="flex flex-wrap gap-3">
              <Filter size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-p3-red text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <cat.icon size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* Grid de Productos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <FadeInSection key={product.id} delay={index * 100}>
              <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Imagen del producto */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Package size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('catalog.comingSoon')}</p>
                    </div>
                  )}
                  
                  {/* Badge de marca */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-p3-red">
                    {product.brand}
                  </div>
                  
                  {/* Overlay con botón */}
                  <div className="absolute inset-0 bg-p3-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="px-6 py-3 bg-white text-p3-dark rounded-xl font-semibold hover:bg-p3-red hover:text-white transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                      <Info size={18} />
                      {t('catalog.viewDetails')}
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-p3-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                      {categories.find(c => c.id === product.category)?.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-p3-dark dark:text-white mb-2 group-hover:text-p3-red dark:group-hover:text-p3-red transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Características */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        +{product.features.length - 2}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2 border-2 border-p3-red text-p3-red rounded-xl font-medium hover:bg-p3-red hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {t('catalog.requestQuote')}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && (
          <FadeInSection className="text-center py-16">
            <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </FadeInSection>
        )}

        {/* Sección de próximos productos */}
        <FadeInSection delay={300} className="mt-16">
          <div className="bg-gradient-to-r from-p3-blue to-p3-blue-light rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">{t('catalog.comingSoon')}</h3>
            <p className="text-gray-100 max-w-2xl mx-auto">
              {t('catalog.comingSoonText')}
            </p>
          </div>
        </FadeInSection>
      </div>

      {/* Modal de Detalles del Producto */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-p3-red hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={80} className="text-gray-400 dark:text-gray-500" />
              )}
              
              <div className="absolute bottom-4 left-4 bg-p3-red text-white px-4 py-2 rounded-lg font-semibold">
                {selectedProduct.brand}
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-8">
              <span className="text-sm font-medium text-p3-blue dark:text-blue-400">
                {categories.find(c => c.id === selectedProduct.category)?.label}
              </span>
              <h2 className="text-2xl font-bold text-p3-dark dark:text-white mt-2 mb-4">
                {selectedProduct.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {selectedProduct.description}
              </p>

              {/* Características */}
              <div className="mb-6">
                <h4 className="font-semibold text-p3-dark dark:text-white mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-p3-red" />
                  {t('catalog.features')}
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {selectedProduct.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-p3-red rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Especificaciones */}
              <div className="mb-6">
                <h4 className="font-semibold text-p3-dark dark:text-white mb-3">
                  {t('catalog.technicalSpecs')}
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedProduct.specs).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key}:</span>
                        <p className="font-medium text-p3-dark dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4">
                <a
                  href="#contacto"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 bg-p3-red text-white rounded-xl font-semibold hover:bg-p3-red-dark transition-colors text-center"
                >
                  {t('catalog.requestQuote')}
                </a>
                <button className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-p3-red hover:text-p3-red transition-colors flex items-center gap-2">
                  <Download size={18} />
                  {t('catalog.download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Catalog;
