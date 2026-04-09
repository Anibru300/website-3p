import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, ZoomIn, ChevronLeft, ChevronRight, Download, 
  FileText, Eye, CheckCircle, Package, ArrowRight,
  ExternalLink
} from 'lucide-react';
import FadeInSection from './FadeInSection';

const CatalogGallery = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Catálogo principal - Chore-Time con PDF
  const mainCatalog = {
    id: 'chore-time',
    name: 'CHORE-TIME',
    origin: 'USA',
    description: language === 'es' 
      ? 'Catálogo completo de refacciones originales para sistemas avícolas. 25 productos en stock con entrega inmediata.' 
      : 'Complete catalog of original spare parts for poultry systems. 25 products in stock with immediate delivery.',
    image: 'images/brands/chore-time.svg',
    pdfUrl: 'catalogs/catalogo-chore-time.pdf',
    pdfSize: '1.7 MB',
    pdfPages: '12 páginas',
    products: [
      'Tarjetas Electrónicas',
      'Displays y Teclados', 
      'Motores y Mecánico',
      'Sensores',
      'Eléctrico y Alimentación',
      'Accesorios y Estructura'
    ],
    stats: {
      products: 25,
      inStock: true,
      updated: 'Abril 2026'
    }
  };

  // Otros catálogos disponibles (sin PDF aún)
  const otherCatalogs = [
    {
      id: 'fancom',
      name: 'FANCOM',
      origin: 'Países Bajos',
      description: language === 'es' ? 'Control climático y automatización' : 'Climate control and automation',
      image: 'images/brands/fancom.png',
      status: 'coming-soon'
    },
    {
      id: 'roxell',
      name: 'ROXELL',
      origin: 'Bélgica',
      description: language === 'es' ? 'Sistemas de alimentación y bebida' : 'Feeding and drinking systems',
      image: 'images/brands/roxell.svg',
      status: 'coming-soon',
      isSvg: true
    },
    {
      id: 'lubing',
      name: 'LUBING',
      origin: 'Alemania',
      description: language === 'es' ? 'Sistemas de bebida y transporte' : 'Drinking and transport systems',
      image: 'images/brands/lubing.png',
      status: 'coming-soon'
    },
    {
      id: 'landmeco',
      name: 'LANDMECO',
      origin: 'Dinamarca',
      description: language === 'es' ? 'Equipos para avicultura' : 'Poultry equipment',
      image: 'images/brands/landmeco.png',
      status: 'coming-soon'
    },
    {
      id: 'georgia-poultry',
      name: 'GEORGIA POULTRY',
      origin: 'USA',
      description: language === 'es' ? 'Equipos para avicultura' : 'Poultry equipment',
      image: 'images/brands/georgia-poultry.png',
      status: 'coming-soon'
    },
    {
      id: 'schippers',
      name: 'MS Schippers',
      origin: 'Países Bajos',
      description: language === 'es' ? 'Productos de higiene y bioseguridad' : 'Hygiene and biosecurity products',
      image: 'images/brands/sbm.svg',
      status: 'coming-soon',
      isSvg: true
    },
    {
      id: 'amt',
      name: 'AMT',
      origin: 'USA',
      description: language === 'es' ? 'Accesorios y equipos para avicultura' : 'Poultry accessories and equipment',
      image: 'images/brands/amt.png',
      status: 'coming-soon'
    },
    {
      id: 'alke',
      name: 'ALKE',
      origin: 'Holanda',
      description: language === 'es' ? 'Sistemas de calefacción infrarroja' : 'Infrared heating systems',
      image: 'images/brands/alke.png',
      status: 'coming-soon'
    },
    {
      id: 'tigsa',
      name: 'TIGSA',
      origin: 'España',
      description: language === 'es' ? 'Equipamientos para granjas' : 'Farm equipment',
      image: 'images/brands/tigsa.svg',
      status: 'coming-soon',
      isSvg: true
    }
  ];

  const openModal = (catalog, index) => {
    setSelectedImage(catalog);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const goToPrev = () => {
    const newIndex = (currentIndex - 1 + otherCatalogs.length) % otherCatalogs.length;
    setCurrentIndex(newIndex);
    setSelectedImage(otherCatalogs[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % otherCatalogs.length;
    setCurrentIndex(newIndex);
    setSelectedImage(otherCatalogs[newIndex]);
  };

  // Navegar a la página de productos Chore-Time
  const goToChoreTimeProducts = () => {
    window.location.hash = '/marcas/chore-time';
  };

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <section id="catalogo-galeria" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-p3-red/10 text-p3-red rounded-full text-sm font-semibold mb-4">
            <FileText size={18} />
            {language === 'es' ? 'Catálogos Disponibles' : 'Available Catalogs'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Nuestros ' : 'Our '}
            <span className="text-p3-red">Catálogos</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            {language === 'es' 
              ? 'Descarga nuestros catálogos con productos disponibles en stock. Catálogo actualizado mensualmente.' 
              : 'Download our catalogs with products available in stock. Monthly updated catalog.'}
          </p>
        </FadeInSection>

        {/* CATÁLOGO DESTACADO - CHORE-TIME */}
        <FadeInSection className="mb-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid lg:grid-cols-2">
              {/* Lado Izquierdo - Visual */}
              <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] p-8 lg:p-12 flex flex-col items-center justify-center text-white relative overflow-hidden">
                {/* Patrón de fondo */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="bg-white rounded-2xl p-6 mb-6 inline-block shadow-2xl">
                    <img 
                      src={mainCatalog.image} 
                      alt={mainCatalog.name}
                      className="h-20 w-auto"
                    />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{mainCatalog.name}</h3>
                  <p className="text-white/80 text-lg mb-6">{mainCatalog.origin}</p>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <Package size={16} />
                      <span>{mainCatalog.stats.products} productos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-300">En stock</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lado Derecho - Información y Descarga */}
              <div className="p-8 lg:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {language === 'es' ? 'Disponible para descarga' : 'Available for download'}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'es' 
                    ? 'Catálogo de Refacciones Originales' 
                    : 'Original Spare Parts Catalog'}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {mainCatalog.description}
                </p>

                {/* Categorías */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Categorías incluidas:' : 'Categories included:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mainCatalog.products.map((product, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info del PDF */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    <span>PDF</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span>{mainCatalog.pdfSize}</span>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span>{mainCatalog.pdfPages}</span>
                  <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                  <span className="hidden sm:inline">Actualizado: {mainCatalog.stats.updated}</span>
                </div>

                {/* Botones de acción - CORREGIDOS */}
                <div className="flex flex-col sm:flex-row gap-4 relative">
                  <a
                    href={mainCatalog.pdfUrl}
                    download
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-p3-red text-white font-semibold rounded-xl hover:bg-p3-red-dark transition-all shadow-lg hover:shadow-xl"
                    style={{ position: 'relative', zIndex: 20 }}
                  >
                    <Download size={20} />
                    {language === 'es' ? 'Descargar Catálogo PDF' : 'Download PDF Catalog'}
                  </a>
                  <button
                    onClick={goToChoreTimeProducts}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-p3-red hover:text-p3-red transition-all"
                    style={{ position: 'relative', zIndex: 20 }}
                    type="button"
                  >
                    <Eye size={20} />
                    {language === 'es' ? 'Ver Productos Online' : 'View Products Online'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* OTROS CATÁLOGOS */}
        <FadeInSection>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'es' ? 'Otras Marcas' : 'Other Brands'}
            </h3>
            <p className="text-gray-500 text-sm">
              {language === 'es' 
                ? 'Catálogos en preparación. Contacta con nosotros para más información.' 
                : 'Catalogs in preparation. Contact us for more information.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherCatalogs.map((catalog, index) => (
              <FadeInSection key={catalog.id} delay={index * 50}>
                <div 
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200 cursor-pointer"
                  onClick={() => openModal(catalog, index)}
                >
                  {/* Imagen del logo - CORREGIDA PARA SVGs */}
                  <div className="h-40 bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
                    <div 
                      className="relative flex items-center justify-center w-full h-full"
                      style={{ 
                        backgroundColor: catalog.isSvg ? 'white' : 'transparent',
                        borderRadius: catalog.isSvg ? '8px' : '0',
                        padding: catalog.isSvg ? '16px' : '0'
                      }}
                    >
                      <img 
                        src={catalog.image} 
                        alt={catalog.name}
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          maxWidth: catalog.isSvg ? '100%' : '80%',
                          maxHeight: catalog.isSvg ? '100%' : '80%',
                          width: catalog.isSvg ? 'auto' : undefined,
                          height: catalog.isSvg ? 'auto' : undefined
                        }}
                        onError={(e) => {
                          console.error(`Error cargando imagen: ${catalog.image}`);
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-lg font-bold text-gray-400">${catalog.name}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                      <ZoomIn className="text-gray-400 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={24} />
                    </div>
                  </div>
                  
                  {/* Información */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900">{catalog.name}</h4>
                      <span className="text-xs text-gray-400">{catalog.origin}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{catalog.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </FadeInSection>

        {/* CTA Final */}
        <FadeInSection className="mt-16 text-center">
          <div className="bg-p3-blue rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {language === 'es' 
                ? '¿Necesitas un catálogo específico?' 
                : 'Need a specific catalog?'}
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {language === 'es'
                ? 'Contáctanos y te enviaremos la información detallada de cualquier producto de nuestras marcas distribuidas.'
                : 'Contact us and we will send you detailed information about any product from our distributed brands.'}
            </p>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-p3-blue font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              <ExternalLink size={20} />
              {language === 'es' ? 'Solicitar Información' : 'Request Information'}
            </a>
          </div>
        </FadeInSection>

        {/* Modal para ver logo ampliado - CORREGIDO */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            onClick={closeModal}
          >
            {/* Botón X - MEJORADO Y MÁS VISIBLE */}
            <button 
              className="fixed top-6 right-6 z-[200] w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-2xl transition-all border-4 border-white"
              onClick={closeModal}
              aria-label="Cerrar"
              style={{ position: 'fixed' }}
            >
              <X size={32} strokeWidth={3} />
            </button>
            
            {/* Texto de ayuda */}
            <div className="fixed top-6 left-6 z-[150] text-white/70 text-sm bg-black/50 px-4 py-2 rounded-full">
              Presiona ESC o clic fuera para cerrar
            </div>
            
            <button 
              className="fixed left-6 top-1/2 -translate-y-1/2 z-[150] text-white/70 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              aria-label="Anterior"
              style={{ position: 'fixed' }}
            >
              <ChevronLeft size={48} />
            </button>
            
            <button 
              className="fixed right-6 top-1/2 -translate-y-1/2 z-[150] text-white/70 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              aria-label="Siguiente"
              style={{ position: 'fixed' }}
            >
              <ChevronRight size={48} />
            </button>
            
            <div 
              className="max-w-4xl max-h-[85vh] flex flex-col items-center mt-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl p-8 md:p-12 mb-6 shadow-2xl">
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.name}
                  className="max-w-full max-h-[50vh] md:max-h-[55vh] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-800">${selectedImage.name}</span>`;
                  }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{selectedImage.name}</h3>
                <p className="text-gray-300 text-lg mb-2">{selectedImage.description}</p>
                <p className="text-amber-400 text-sm">
                  {language === 'es' ? 'Catálogo en preparación' : 'Catalog in preparation'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CatalogGallery;
