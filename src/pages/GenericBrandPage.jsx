import { ArrowLeft, Construction, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/shared';

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
      es: 'Soluciones para almacenamiento y manejo de granos. Silos y equipos de almacenamiento.',
      en: 'Solutions for grain storage and handling. Silos and storage equipment.'
    },
    keywords: 'ALKE, silos granos, almacenamiento granos, manejo materiales',
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

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${brand.name} | Distribuidor Autorizado - 3P S.A. DE C.V.`}
        description={description}
        keywords={brand.keywords}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span>{t('brandPage.backToHome')}</span>
        </a>

        <div className="text-center max-w-2xl mx-auto">
          {/* Brand Logo */}
          <div className="mb-8">
            <div
              className="w-32 h-32 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6"
              style={{ backgroundColor: brand.color }}
            >
              <img
                src={brand.image || `/images/brands/${brandId}.svg`}
                alt={brand.name}
                className="w-24 h-24 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.textContent = brand.name.charAt(0);
                    parent.className = 'text-white text-2xl font-bold';
                  }
                }}
              />
            </div>
          </div>

          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction size={40} className="text-gray-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{brand.name}</h1>
          <p className="text-lg text-gray-600 mb-8">{description}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-amber-800">
              <strong>{t('brandPage.catalogInDevelopment')}</strong><br />
              {contactText}
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
              {t('brandPage.whatsappLabel')}
            </a>
            <a
              href="mailto:trespsadecv@hotmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Mail size={18} />
              {t('brandPage.emailLabel')}
            </a>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 text-p3-red hover:text-p3-red-dark font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {t('brandPage.backToCatalog')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GenericBrandPage;
