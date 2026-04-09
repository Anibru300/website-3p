import { MapPin, CheckCircle, ExternalLink, Sparkles, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';
import TiltCard from './TiltCard';

const Brands = () => {
  const { t } = useLanguage();

  // Las 9 marcas principales que distribuye 3P
  const brands = [
    {
      name: 'ROXELL',
      origin: 'Bélgica',
      products: 'Sistemas de Alimentación y Bebida',
      description: 'Líder mundial en sistemas automatizados de alimentación, bebida, calefacción y ventilación para avicultura y porcicultura. Fundada en 1967, presente en más de 80 países.',
      features: [
        'Sistemas de alimentación automatizados',
        'Bebederos de alta precisión',
        'Control climático inteligente',
        'Manejo de huevos automatizado'
      ],
      color: 'from-red-600 to-red-800',
      logo: 'images/brands/roxell.svg',
    },
    {
      name: 'LUBING',
      origin: 'Alemania',
      products: 'Sistemas de Bebida y Transporte',
      description: 'Líder internacional en sistemas de bebida, transporte de huevos y climatización para avicultura. Más de 75 años de experiencia, presente en 87 países.',
      features: [
        'Bebederos nipple de precisión',
        'Sistemas de transporte de huevos',
        'Climatización evaporativa',
        'Sistema UltraFlush de limpieza ultrasónica'
      ],
      color: 'from-blue-600 to-blue-800',
      logo: 'images/brands/lubing.png',
    },
    {
      name: 'LANDMECO',
      origin: 'Dinamarca',
      products: 'Equipos para Avicultura',
      description: 'Mayor productor de equipos para avicultura de Escandinavia. Más de 90 años de experiencia en sistemas para pollos, ponedoras, reproductoras y recria.',
      features: [
        'Sistema de alimentación patentado Kick-off',
        'Aviarios y jaulas sin jaula',
        'Nidos centralizados',
        'Sistemas de crianza'
      ],
      color: 'from-green-600 to-teal-700',
      logo: 'images/brands/landmeco.png',
    },
    {
      name: 'GEORGIA POULTRY',
      origin: 'Estados Unidos',
      products: 'Equipos para Avicultura',
      description: 'Marca líder en equipos para avicultura de Estados Unidos. Sistemas de alimentación, ventilación, control climático y equipos para granjas avícolas.',
      features: [
        'Sistemas de alimentación GrowerSELECT',
        'Control de ventilación',
        'Equipos para pavos',
        'Sensores y controles'
      ],
      color: 'from-orange-500 to-red-600',
      logo: 'images/brands/georgia-poultry.png',
    },
    {
      name: 'CHORE TIME',
      origin: 'Estados Unidos',
      products: 'Sistemas Integrales Avícolas',
      description: 'Más de 70 años de experiencia en soluciones integrales para avicultura. División de CTB, Inc. Especialistas en sistemas de alimentación y bebida.',
      features: [
        'Sistemas de alimentación completos',
        'Sistemas de bebida',
        'Aviarios sin jaula',
        'Nidos para producción en piso'
      ],
      color: 'from-indigo-600 to-purple-700',
      logo: 'images/brands/chore-time.svg',
    },
    {
      name: 'FANCOM',
      origin: 'Países Bajos',
      products: 'Control Climático y Automatización',
      description: 'Líder mundial en sistemas de control climático y computadoras de manejo para avicultura y porcicultura. Más de 40 años de experiencia en automatización de granjas.',
      features: [
        'Computadoras de manejo y control',
        'Sensores de clima y pesaje',
        'Sistemas de ventilación inteligente',
        'Software de gestión de granjas'
      ],
      color: 'from-emerald-500 to-green-700',
      logo: 'images/brands/fancom.png',
    },
    {
      name: 'MS Schippers',
      origin: 'Países Bajos',
      products: 'Productos de Higiene y Bioseguridad',
      description: 'Empresa líder en productos de higiene, limpieza, desinfección y manejo para la industria avícola y porcina. Soluciones integrales de bioseguridad.',
      features: [
        'Productos de higiene y desinfección',
        'Equipos de bioseguridad',
        'Productos veterinarios',
        'Sistemas de limpieza'
      ],
      color: 'from-yellow-500 to-orange-600',
      logo: 'images/brands/sbm.svg',
    },
    {
      name: 'AMT',
      origin: 'Estados Unidos',
      products: 'Accesorios y Equipos para Avicultura',
      description: 'Agricultural Manufacturing & Textiles. Más de 50 años de experiencia. Mayor inventario de bandas para huevo y malacates de Norteamérica.',
      features: [
        'Bandas transportadoras de huevo',
        'Malacates y sistemas de elevación',
        'Cortinas y accesorios',
        'Sistemas de alimentación complementaria'
      ],
      color: 'from-cyan-600 to-blue-700',
      logo: 'images/brands/amt.png',
    },
    {
      name: 'ALKE',
      origin: 'Holanda',
      products: 'Sistemas de Calefacción',
      description: 'Especialistas en sistemas de calefacción por infrarrojos para avicultura y ganadería. Más de 40 años de experiencia y más de 1.6 millones de calentadores vendidos.',
      features: [
        'Calentadores de gas infrarrojos',
        'Sistemas de regulación térmica',
        'Criadoreos (brooders)',
        'Equipos de regulación'
      ],
      color: 'from-amber-500 to-red-600',
      logo: 'images/brands/alke.png',
    },
    {
      name: 'TIGSA',
      origin: 'España',
      products: 'Equipamientos para Granjas',
      description: 'Más de 40 años de experiencia fabricando equipamientos automatizados para granjas avícolas y porcinas. Diseño, construcción y equipamiento integral.',
      features: [
        'Sistemas de alimentación compactos',
        'Construcción de granjas',
        'Equipos para avicultura y porcicultura',
        'Renovación y acondicionamiento'
      ],
      color: 'from-emerald-600 to-green-700',
      logo: 'images/brands/tigsa.svg',
    },
  ];

  const regions = [
    { flag: '🇪🇺', title: t('brands.europe'), desc: t('brands.europeCountries'), color: 'bg-blue-100' },
    { flag: '🇺🇸', title: t('brands.northAmerica'), desc: t('brands.usa'), color: 'bg-red-100' },
    { flag: '🇲🇽', title: t('brands.mexico'), desc: t('brands.mexicoDist'), color: 'bg-green-100' },
    { flag: '🌎', title: t('brands.latam'), desc: t('brands.latamExports'), color: 'bg-yellow-100' },
  ];

  return (
    <section id="marcas" className="py-20 relative overflow-hidden">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-p3-red/10 to-p3-blue/10 rounded-full mb-4">
            <Award className="text-p3-red" size={20} />
            {t('brands.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('brands.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Distribuimos las marcas líderes mundiales en equipos para avicultura, seleccionadas por su calidad, innovación y respaldo técnico.
          </p>
        </FadeInSection>

        {/* Grid de marcas - Todas iguales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand, index) => (
            <FadeInSection key={index} delay={index * 100}>
              <TiltCard className="h-full" tiltAmount={8}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full border border-gray-100 dark:border-gray-700">
                  {/* Header con logo grande */}
                  <div className={`h-48 bg-gradient-to-r ${brand.color} p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.3)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <MapPin size={14} />
                      <span>{brand.origin}</span>
                    </div>
                    {/* Logo grande uniforme para todas */}
                    <div className="bg-white rounded-2xl p-6 w-48 h-28 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`} 
                        className="max-w-full max-h-full object-contain" 
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          e.target.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-800">${brand.name}</span>`; 
                        }} 
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-2 group-hover:text-p3-red transition-colors">{brand.name}</h3>
                    <p className="text-sm font-semibold text-p3-blue mb-3 uppercase tracking-wide">{brand.products}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{brand.description}</p>
                    <ul className="space-y-2">
                      {brand.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle size={16} className="text-p3-red flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-p3-dark/95 via-p3-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-8">
                    <button className="flex items-center gap-2 px-8 py-4 bg-white text-p3-dark font-semibold rounded-xl hover:bg-p3-red hover:text-white transition-colors shadow-xl">
                      {t('brands.requestInfo')}
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </TiltCard>
            </FadeInSection>
          ))}
        </div>

        {/* Cobertura */}
        <FadeInSection delay={200} className="mt-20">
          <div className="bg-p3-gray dark:bg-gray-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-p3-blue/10 rounded-full blur-3xl"></div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-2">{t('brands.coverage')}</h3>
              <p className="text-gray-600 dark:text-gray-400">Distribuimos estas marcas líderes en México y exportamos a toda Latinoamérica</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regions.map((region, idx) => (
                <FadeInSection key={idx} delay={300 + idx * 100}>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className={`w-16 h-16 mx-auto mb-4 ${region.color} rounded-full flex items-center justify-center`}>
                      <span className="text-2xl">{region.flag}</span>
                    </div>
                    <h4 className="font-bold text-p3-dark dark:text-white mb-2">{region.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{region.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default Brands;
