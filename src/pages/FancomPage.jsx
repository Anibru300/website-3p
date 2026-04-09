import { useState } from 'react';
import { ArrowLeft, Package, Phone, Mail, MapPin, X, Search, Filter } from 'lucide-react';
import { fancomProducts, fancomCategories } from '../data/fancomProducts';

const FancomPage = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = fancomProducts.filter(p => {
    const matchCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                         p.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const whatsappUrl = (prod) => {
    const text = encodeURIComponent(
      `Hola, me interesa cotizar el producto Fancom: ${prod.codigo} - ${prod.nombre}`
    );
    return `https://wa.me/524771284661?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 to-green-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="#/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded-full mb-4">
                Distribuidor Autorizado
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Productos Fancom</h1>
              <p className="text-lg text-white/80 mb-6">
                Tecnología holandesa de vanguardia para control climático y automatización de granjas avícolas y porcícolas.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1"><Package size={16} /> {fancomProducts.length} productos</span>
                <span className="flex items-center gap-1"><Phone size={16} /> +52 477 128 4661</span>
                <span className="flex items-center gap-1"><Mail size={16} /> trespsadecv@hotmail.com</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src="images/brands/fancom.png" 
                alt="Fancom" 
                className="h-24 md:h-32 w-auto bg-white rounded-2xl px-8 py-4 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Buscador y Filtros */}
      <section className="sticky top-20 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Buscador */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          
          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2">
            {fancomCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoriaActiva === cat.id 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
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
            {productosFiltrados.map((prod) => (
              <div 
                key={prod.codigo}
                onClick={() => setSelectedProduct(prod)}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                  <img 
                    src={prod.imagen} 
                    alt={prod.nombre}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {prod.destacado && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      DESTACADO
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold text-emerald-600 mb-1">SKU: {prod.codigo}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{prod.nombre}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{prod.specs}</p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      prod.stock > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {prod.stock > 0 ? `Stock: ${prod.stock}` : 'Bajo pedido'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No se encontraron productos.</p>
              <p className="text-gray-400">Intenta con otra búsqueda o categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">¿Necesitas un producto específico de Fancom?</h2>
          <p className="text-gray-600 mb-8">Contamos con canal directo a Fancom para importación de equipos especiales.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/524771284661?text=Hola%2C%20me%20interesa%20informaci%C3%B3n%20sobre%20productos%20Fancom" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a 
              href="tel:+524771284661" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
              aria-label="Cerrar"
            >
              <X size={20} className="text-gray-700" />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-64 md:h-auto bg-gray-50 flex items-center justify-center p-6 md:rounded-l-2xl">
                <img 
                  src={selectedProduct.imagen} 
                  alt={selectedProduct.nombre}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col">
                <div className="text-sm font-semibold text-emerald-600 mb-2">SKU: {selectedProduct.codigo}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProduct.nombre}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedProduct.specs}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span>Entrega desde León, Guanajuato</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Package size={18} className="text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selectedProduct.stock > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedProduct.stock > 0 ? `Stock disponible: ${selectedProduct.stock}` : 'Bajo pedido - Consultar'}
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

export default FancomPage;
