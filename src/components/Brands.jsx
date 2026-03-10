import { MapPin, CheckCircle, ExternalLink } from 'lucide-react';

const Brands = () => {
  const brands = [
    {
      name: 'FANCOM',
      origin: 'Holanda',
      products: 'Sistemas de ventilación controlada',
      description: 'Líder mundial en sistemas de ventilación y control climático para granjas avícolas y porcícolas.',
      features: ['Ventilación de precisión', 'Control de temperatura', 'Gestión de amoniaco', 'Automatización'],
      color: 'from-orange-500 to-red-600',
    },
    {
      name: 'LANDMECO',
      origin: 'Dinamarca',
      products: 'Comederos automáticos',
      description: 'Especialistas en sistemas de alimentación automática de alta eficiencia para pollos de engorda y reproductoras.',
      features: ['Comederos de cadena', 'Sistemas de reproductoras', 'Alta eficiencia', 'Control de peso'],
      color: 'from-blue-500 to-blue-700',
    },
    {
      name: 'DACS',
      origin: 'Dinamarca',
      products: 'Ventiladores de alta tecnología',
      description: 'Ventiladores de velocidad variable con tecnología de celdas solares para máxima eficiencia energética.',
      features: ['Velocidad variable', 'Celdas solares', 'Bajo consumo', 'Alta durabilidad'],
      color: 'from-green-500 to-teal-600',
    },
    {
      name: 'LUBING',
      origin: 'Alemania',
      products: 'Bebederos y sistemas de humidificación',
      description: 'Tecnología alemana de precisión para sistemas de bebederos, pared húmeda, foggers y transportadores de huevo.',
      features: ['Bebederos nipple', 'Pared húmeda', 'Sistemas de nebulización', 'Transportador de huevo'],
      color: 'from-red-500 to-red-700',
    },
    {
      name: 'SBM',
      origin: 'Francia',
      products: 'Sistemas de calefacción',
      description: 'Calefacción cerámica a gas de alta eficiencia para mantener la temperatura óptima en las casetas.',
      features: ['Calefacción cerámica', 'A gas natural/propano', 'Eficiencia energética', 'Control termostático'],
      color: 'from-yellow-500 to-orange-600',
    },
    {
      name: 'HOG SLAT',
      origin: 'Estados Unidos',
      products: 'Comederos y silos',
      description: 'Equipos americanos de alta calidad para comedero automático de pollo de engorda y sistemas de almacenamiento.',
      features: ['Comederos automáticos', 'Silos de almacenamiento', 'Alta capacidad', 'Durable'],
      color: 'from-indigo-500 to-purple-600',
    },
  ];

  return (
    <section id="marcas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-red/10 text-p3-red text-sm font-semibold rounded-full mb-4">
            Marcas que Distribuimos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-p3-dark mb-4">
            Las mejores marcas del mundo
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Representamos marcas internacionales reconocidas por su calidad y tecnología. 
            Equipos de Europa y Norteamérica para la máxima productividad de su granja.
          </p>
        </div>

        {/* Grid de marcas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Header con gradiente */}
              <div className={`h-32 bg-gradient-to-r ${brand.color} p-6 flex items-center justify-between`}>
                <div>
                  <h3 className="text-2xl font-bold text-white">{brand.name}</h3>
                  <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
                    <MapPin size={14} />
                    <span>{brand.origin}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <p className="text-p3-blue font-semibold text-sm mb-2">{brand.products}</p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{brand.description}</p>
                
                <ul className="space-y-2">
                  {brand.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${brand.color}`}></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-p3-dark/90 via-p3-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-p3-dark font-semibold rounded-xl hover:bg-p3-red hover:text-white transition-colors">
                  Solicitar Información
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mapa de cobertura */}
        <div className="mt-20 bg-p3-gray rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-p3-dark mb-2">Cobertura Internacional</h3>
            <p className="text-gray-600">Nuestros equipos provienen de los mejores fabricantes del mundo</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🇪🇺</span>
              </div>
              <h4 className="font-bold text-p3-dark mb-2">Europa</h4>
              <p className="text-sm text-gray-600">Holanda, Alemania, Francia, Dinamarca</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <h4 className="font-bold text-p3-dark mb-2">Norteamérica</h4>
              <p className="text-sm text-gray-600">Estados Unidos</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🇲🇽</span>
              </div>
              <h4 className="font-bold text-p3-dark mb-2">México</h4>
              <p className="text-sm text-gray-600">Distribución nacional desde León, Gto.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌎</span>
              </div>
              <h4 className="font-bold text-p3-dark mb-2">Centro y Sudamérica</h4>
              <p className="text-sm text-gray-600">Exportaciones a toda la región</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;
