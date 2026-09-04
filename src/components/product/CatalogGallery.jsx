import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, ZoomIn, ChevronLeft, ChevronRight, ArrowRight,
  FileText, ExternalLink, Phone
} from 'lucide-react';
import { FadeInSection } from '../ui';

const CatalogGallery = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allCatalogs = [
    {
      id: 'fancom',
      name: 'FANCOM',
      origin: 'Países Bajos',
      description: language === 'es' ? 'Control climático y automatización' : 'Climate control and automation',
      image: '/images/brands/fancom.png',
      status: 'available',
      href: '/marcas/fancom'
    },
    {
      id: 'lubing',
      name: 'LUBING',
      origin: 'Alemania',
      description: language === 'es' ? 'Sistemas de bebida y transporte' : 'Drinking and transport systems',
      image: '/images/brands/lubing.png',
      status: 'available',
      href: '/marcas/lubing'
    },
    {
      id: 'georgia-poultry',
      name: 'GEORGIA POULTRY',
      origin: 'USA',
      description: language === 'es' ? 'Equipos para avicultura' : 'Poultry equipment',
      image: '/images/brands/georgia-poultry.png',
      status: 'available',
      href: '/marcas/georgia-poultry'
    },
    {
      id: 'ms-schippers',
      name: 'MS Schippers',
      origin: 'Países Bajos',
      description: language === 'es' ? 'Detergentes, espumas, polvos secantes y equipos de dosificación' : 'Detergents, foams, drying powders and dosing equipment',
      image: '/images/brands/ms-schippers.svg',
      status: 'available',
      isSvg: true,
      href: '/marcas/ms-schippers'
    },
    {
      id: 'sbm',
      name: 'SBM',
      origin: 'Francia',
      description: language === 'es' ? 'Calefacción y climatización' : 'Heating and climate systems',
      image: '/images/brands/sbm.png',
      status: 'available',
      href: '/marcas/sbm'
    },
    {
      id: 'lbwhite',
      name: 'LB White',
      origin: 'USA',
      description: language === 'es' ? 'Sistemas de calefacción y climatización' : 'Heating and climate systems',
      image: '/images/brands/lbwhite.png',
      status: 'available',
      href: '/marcas/lbwhite'
    },
    {
      id: 'amt',
      name: 'AMT',
      origin: 'USA',
      description: language === 'es' ? 'Accesorios y equipos para avicultura' : 'Poultry accessories and equipment',
      image: '/images/brands/amt.png',
      status: 'available',
      href: '/marcas/amt'
    },
    {
      id: 'alke',
      name: 'ALKE',
      origin: language === 'es' ? 'Países Bajos' : 'Netherlands',
      description: language === 'es' ? 'Sistemas de calefacción infrarroja' : 'Infrared heating systems',
      image: '/images/brands/alke.png',
      status: 'available',
      href: '/marcas/alke'
    },
    {
      id: 'tigsa',
      name: 'TIGSA',
      origin: 'España',
      description: language === 'es' ? 'Equipamientos para granjas' : 'Farm equipment',
      image: '/images/brands/tigsa.svg',
      status: 'coming-soon',
      isSvg: true,
      href: '/marcas/tigsa'
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
    const newIndex = (currentIndex - 1 + allCatalogs.length) % allCatalogs.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allCatalogs[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % allCatalogs.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allCatalogs[newIndex]);
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

        {/* CATÁLOGOS DE TODAS LAS MARCAS */}
        <FadeInSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {allCatalogs.map((catalog, index) => {
              const CardWrapper = catalog.href ? 'a' : 'div';
              const cardProps = catalog.href
                ? { href: catalog.href }
                : { onClick: () => openModal(catalog, index), role: 'button', tabIndex: 0 };
              return (
                <FadeInSection key={catalog.id} delay={index * 50}>
                  <CardWrapper
                    {...cardProps}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200 cursor-pointer h-full flex flex-col"
                  >
                    {/* Imagen del logo */}
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
                          loading="lazy"
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
                              parent.textContent = catalog.name;
                              parent.className = 'text-lg font-bold text-gray-400';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                        {catalog.href ? (
                          <ArrowRight className="text-p3-red opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={24} />
                        ) : (
                          <ZoomIn className="text-gray-400 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={24} />
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900">{catalog.name}</h4>
                        <span className="text-xs text-gray-400">{catalog.origin}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{catalog.description}</p>
                      {catalog.status === 'available' ? (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          {language === 'es' ? 'Catálogo activo' : 'Catalog active'}
                        </div>
                      ) : catalog.href ? (
                        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {language === 'es' ? 'Ver catálogo' : 'View catalog'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                        </div>
                      )}
                    </div>
                  </CardWrapper>
                </FadeInSection>
              );
            })}
          </div>
        </FadeInSection>

        {/* CTA Final */}
        <FadeInSection className="mt-16 text-center">
          <div className="bg-p3-blue rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {language === 'es'
                ? '¿Necesitas algún producto en específico?'
                : 'Need a specific product?'}
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {language === 'es'
                ? 'Escríbenos por WhatsApp y con gusto te ayudamos a cotizar el producto que necesitas de cualquiera de nuestras marcas.'
                : 'Write to us on WhatsApp and we will gladly help you quote the product you need from any of our brands.'}
            </p>
            <a
              href="https://wa.me/524771284661?text=Hola,%20me%20interesa%20cotizar%20un%20producto%20específico."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-all shadow-lg"
            >
              <Phone size={20} />
              {language === 'es' ? 'Cotizar por WhatsApp' : 'Quote via WhatsApp'}
            </a>
          </div>
        </FadeInSection>

        {/* Modal para ver logo ampliado - CORREGIDO V3 */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            onClick={closeModal}
          >
            {/* Contenedor central */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Botón X - MÁS VISIBLE */}
              <button 
                className="absolute top-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all border-2 border-white z-[200]"
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
                aria-label="Cerrar"
              >
                <X size={28} strokeWidth={3} />
              </button>
              
              {/* Texto de ayuda */}
              <div className="absolute top-4 left-4 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
                ESC o clic fuera para cerrar
              </div>
              
              {/* Botón Anterior */}
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full z-[150]"
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                aria-label="Anterior"
              >
                <ChevronLeft size={48} />
              </button>
              
              {/* Botón Siguiente - CORREGIDO */}
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full z-[150]"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                aria-label="Siguiente"
              >
                <ChevronRight size={48} />
              </button>
              
              {/* Contenido del modal */}
              <div 
                className="max-w-3xl w-full flex flex-col items-center px-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-2xl p-6 md:p-12 mb-4 shadow-2xl w-full">
                  <img 
                    src={selectedImage.image} 
                    alt={selectedImage.name}
                    className="max-w-full max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] object-contain mx-auto"
                    loading="lazy"
                    style={{ minWidth: '200px', minHeight: '100px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.textContent = selectedImage.name;
                        parent.className = 'text-3xl font-bold text-gray-800';
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedImage.name}</h3>
                  <p className="text-gray-300">{selectedImage.description}</p>
                  <p className="text-amber-400 text-sm mt-2">
                    {language === 'es' ? 'Catálogo en preparación' : 'Catalog in preparation'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CatalogGallery;
