import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowLeft, Package, Phone, Mail, MapPin, X, ChevronLeft, ChevronRight, Image as ImageIcon, Film } from 'lucide-react';
import { choreTimeProducts, choreTimeCategories } from '../data/choreTimeProducts';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';

// Lazy load del visor de video
const ProductVideoViewer = lazy(() => import('../components/ProductVideoViewer'));

const ChoreTimePage = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState('2d'); // '2d', '3d', o 'video'

  // Calcular productos filtrados primero
  const productosFiltrados = categoriaActiva === 'todas'
    ? choreTimeProducts
    : choreTimeProducts.filter(p => {
        const cat = choreTimeCategories.find(c => c.id === categoriaActiva);
        return cat ? cat.productos.includes(p.codigo) : true;
      });

  // Handle URL parameters for direct product linking
  useEffect(() => {
    const hash = window.location.hash;
    const queryMatch = hash.match(/[?&]producto=([^&]+)/);
    if (queryMatch) {
      const productCode = queryMatch[1];
      const product = choreTimeProducts.find(p => p.codigo === productCode);
      if (product) {
        setSelectedProduct(product);
        const index = choreTimeProducts.findIndex(p => p.codigo === productCode);
        setSelectedIndex(index >= 0 ? index : 0);
      }
    }
  }, []);

  const whatsappUrl = (prod) => {
    const text = encodeURIComponent(
      `Hola, me interesa cotizar la refacción Chore-Time: ${prod.codigo} - ${prod.nombre}`
    );
    return `https://wa.me/524771284661?text=${text}`;
  };

  const openModal = (product, index) => {
    setSelectedProduct(product);
    setSelectedIndex(index);
    setViewMode('2d'); // Siempre empezar en 2D
  };

  const navigateModal = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedIndex + 1) % productosFiltrados.length;
    } else {
      newIndex = (selectedIndex - 1 + productosFiltrados.length) % productosFiltrados.length;
    }
    setSelectedIndex(newIndex);
    setSelectedProduct(productosFiltrados[newIndex]);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Chore-Time | Refacciones Originales - 3P S.A. DE C.V."
        description="Catálogo de refacciones originales Chore-Time. Inventario disponible de piezas para sistemas de avicultura. Entrega inmediata desde León, Guanajuato."
        keywords="Chore-Time, refacciones avícolas, piezas originales, comederos automáticos, bebederos, ventilación, CTB"
      />
      
      {/* Hero */}
      <section className="relative bg-[#1B3A5C] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="#/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-[#E8611A]/20 text-[#E8611A] text-sm font-semibold rounded-full mb-4">
                Distribuidor Autorizado
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Refacciones Originales Chore-Time</h1>
              <p className="text-lg text-white/80 mb-6">
                Inventario disponible de piezas originales para sistemas de avicultura. 
                Entrega inmediata desde León, Guanajuato.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1"><Package size={16} /> {choreTimeProducts.length} productos en stock</span>
                <span className="flex items-center gap-1"><Phone size={16} /> +52 477 128 4661</span>
                <span className="flex items-center gap-1"><Mail size={16} /> trespsadecv@hotmail.com</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src="images/brands/chore-time.svg" 
                alt="Chore-Time" 
                className="h-24 md:h-32 w-auto bg-white rounded-2xl px-8 py-4 shadow-2xl"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-20 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaActiva('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoriaActiva === 'todas' ? 'bg-[#1B3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todas
            </button>
            {choreTimeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoriaActiva === cat.id ? 'bg-[#1B3A5C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((prod, index) => (
              <div 
                key={prod.codigo}
                onClick={() => openModal(prod, index)}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                  <img 
                    src={prod.imagen} 
                    alt={prod.nombre}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      e.target.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Imagen no disponible</span>'; 
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {prod.video360 && (
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Film size={12} />
                        360°
                      </div>
                    )}
  
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#E8611A]">SKU: {prod.codigo}</span>
                    <ShareButton product={prod} variant="icon" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{prod.nombre}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{prod.specs}</p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${prod.stock >= 10 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      Stock: {prod.stock} pzas
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No hay productos en esta categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">¿Necesitas una pieza que no encuentras?</h2>
          <p className="text-gray-600 mb-8">Contamos con canal directo a Chore-Time / CTB para importación de refacciones especiales.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/524771284661?text=Hola%2C%20me%20interesa%20informaci%C3%B3n%20sobre%20refacciones%20Chore-Time" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a 
              href="tel:+524771284661" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#1B3A5C] text-white font-semibold rounded-lg hover:bg-[#142a44] transition-colors"
            >
              <Phone size={18} />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* Modal de detalle */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-hidden transition-all duration-300 ${
              viewMode === '3d' ? 'max-w-6xl lg:max-w-7xl' : 'max-w-4xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
              aria-label="Cerrar"
            >
              <X size={20} className="text-gray-700" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateModal('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              aria-label="Producto anterior"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateModal('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              aria-label="Producto siguiente"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Sección de imagen/video */}
              <div className="relative h-64 md:h-auto md:min-h-[450px] bg-gray-50 md:rounded-l-2xl overflow-hidden">
                {/* Toggle 2D/Video */}
                <div className="absolute top-4 left-4 z-20 flex bg-white rounded-lg shadow-md p-1">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === '2d' ? 'bg-p3-blue text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon size={16} />
                    2D
                  </button>
                  {selectedProduct.video360 && (
                    <button
                      onClick={() => setViewMode('video')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'video' ? 'bg-p3-blue text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Film size={16} />
                      360°
                    </button>
                  )}
                </div>

                {/* Contenido según modo */}
                {viewMode === 'video' ? (
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-white font-medium">Cargando video 360°...</p>
                      </div>
                    </div>
                  }>
                    <ProductVideoViewer
                      videoUrl={selectedProduct.video360}
                      posterUrl={selectedProduct.imagen}
                      alt={selectedProduct.nombre}
                      productName={selectedProduct.nombre}
                      productCode={selectedProduct.codigo}
                    />
                  </Suspense>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img 
                      src={selectedProduct.imagen} 
                      alt={selectedProduct.nombre}
                      className="max-h-full max-w-full object-contain drop-shadow-xl"
                      loading="lazy"
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Imagen no disponible</span>'; 
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Sección de información */}
              <div className="p-6 lg:p-8 flex flex-col overflow-y-auto">
                <div className="text-sm font-semibold text-[#E8611A] mb-2">SKU: {selectedProduct.codigo}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProduct.nombre}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedProduct.specs}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span>Entrega desde León, Guanajuato</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Package size={18} className="text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedProduct.stock >= 10 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      Stock disponible: {selectedProduct.stock} pzas
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <a 
                    href={whatsappUrl(selectedProduct)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors"
                  >
                    <Phone size={18} />
                    Cotizar por WhatsApp
                  </a>
                  <ShareButton product={selectedProduct} variant="button" className="flex-1" />
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
        </div>
      )}
    </div>
  );
};

export default ChoreTimePage;
