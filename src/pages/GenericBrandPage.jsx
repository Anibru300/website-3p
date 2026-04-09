import { ArrowLeft, Construction, Phone, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const brandData = {
  roxell: {
    name: 'ROXELL',
    description: 'Equipos de alimentación y bebida de alta calidad para avicultura. Líder mundial en sistemas de comedero y bebedero para granjas avícolas.',
    keywords: 'Roxell, comedero automático, bebedero avícola, equipos avícolas Bélgica',
    color: '#E63946'
  },
  lubing: {
    name: 'LUBING',
    description: 'Sistemas de bebida y enfriamiento evaporativo para avicultura. Tecnología alemana para el bienestar animal.',
    keywords: 'Lubing, bebederos avícolas, enfriamiento evaporativo, sistemas de bebida',
    color: '#00A8E8'
  },
  landmeco: {
    name: 'LANDMECO',
    description: 'Sistemas de ventilación, calefacción y alimentación para avicultura. Soluciones danesas de alta eficiencia.',
    keywords: 'Landmeco, ventilación granjas, calefacción avícola, equipos Dinamarca',
    color: '#2D6A4F'
  },
  'georgia-poultry': {
    name: 'GEORGIA POULTRY',
    description: 'Equipos especializados para la industria avícola. Soluciones confiables para granjas de pollos.',
    keywords: 'Georgia Poultry, equipos avícolas USA, sistemas granjas pollos',
    color: '#F4A261'
  },
  fancom: {
    name: 'FANCOM',
    description: 'Sistemas de control ambiental y automatización para granjas avícolas y porcícolas. Tecnología holandesa de precisión.',
    keywords: 'Fancom, control ambiental, automatización granjas, sistemas Holland',
    color: '#E76F51'
  },
  schippers: {
    name: 'MS Schippers',
    description: 'Higiene y bioseguridad para granjas. Productos especializados en limpieza y desinfección.',
    keywords: 'MS Schippers, higiene granjas, bioseguridad, limpieza avícola',
    color: '#52796F'
  },
  amt: {
    name: 'AMT',
    description: 'Tecnología avanzada para la industria avícola. Equipos innovadores para producción de pollos.',
    keywords: 'AMT, tecnología avícola, equipos innovadores, sistemas avicultura',
    color: '#9B5DE5'
  },
  alke: {
    name: 'ALKE',
    description: 'Soluciones para almacenamiento y manejo de granos. Silos y equipos de almacenamiento.',
    keywords: 'ALKE, silos granos, almacenamiento granos, manejo materiales',
    color: '#F77F00'
  },
  tigsa: {
    name: 'TIGSA',
    description: 'Equipos para la industria avícola y porcícola. Soluciones integrales para granjas.',
    keywords: 'TIGSA, equipos avícolas, equipos porcícolas, sistemas granjas',
    color: '#4361EE'
  },
};

const GenericBrandPage = ({ brandId }) => {
  const brand = brandData[brandId] || { 
    name: brandId?.toUpperCase(), 
    description: 'Estamos trabajando en el catálogo dedicado de esta marca.',
    keywords: 'equipos avícolas, granjas, León Guanajuato',
    color: '#1e3a8a'
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${brand.name} | Distribuidor Autorizado - 3P S.A. DE C.V.`}
        description={brand.description}
        keywords={brand.keywords}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <a href="#/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </a>
        
        <div className="text-center max-w-2xl mx-auto">
          {/* Brand Logo */}
          <div className="mb-8">
            <div 
              className="w-32 h-32 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6"
              style={{ backgroundColor: brand.color }}
            >
              <img 
                src={`images/brands/${brandId}.svg`}
                alt={brand.name}
                className="w-24 h-24 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-white text-2xl font-bold">${brand.name.charAt(0)}</span>`;
                }}
              />
            </div>
          </div>
          
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction size={40} className="text-gray-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{brand.name}</h1>
          <p className="text-lg text-gray-600 mb-8">{brand.description}</p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-amber-800">
              <strong>Catálogo en desarrollo</strong><br/>
              Estamos trabajando en el catálogo dedicado de {brand.name}.<br/>
              Por ahora, contáctanos directamente para cotizar cualquier producto de esta marca.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a 
              href="https://wa.me/524771284661" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              <Phone size={18} />
              Cotizar por WhatsApp
            </a>
            <a 
              href="mailto:trespsadecv@hotmail.com" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Mail size={18} />
              Enviar email
            </a>
          </div>
          
          <a 
            href="#/" 
            className="inline-flex items-center justify-center gap-2 text-p3-red hover:text-p3-red-dark font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al catálogo principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default GenericBrandPage;
