import { Truck, GraduationCap, Headphones, Package, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Package,
      title: t('services.equipment'),
      description: t('services.equipmentDesc'),
      features: [t('services.features.fans'), t('services.features.feeders'), t('services.features.drinkers'), t('services.features.heating')],
      color: 'from-p3-red to-p3-red-dark',
    },
    {
      icon: Truck,
      title: t('services.import'),
      description: t('services.importDesc'),
      features: [t('services.features.europe'), t('services.features.usa'), t('services.features.logistics'), t('services.features.customs')],
      color: 'from-blue-600 to-blue-800',
    },
    {
      icon: Globe,
      title: t('services.export'),
      description: t('services.exportDesc'),
      features: [t('services.features.centralAmerica'), t('services.features.southAmerica'), t('services.features.technicalAdvice'), t('services.features.remoteSupport')],
      color: 'from-green-600 to-teal-700',
    },
    {
      icon: GraduationCap,
      title: t('services.training'),
      description: t('services.trainingDesc'),
      features: [t('services.features.operation'), t('services.features.maintenance'), t('services.features.troubleshooting'), t('services.features.bestPractices')],
      color: 'from-purple-600 to-purple-800',
    },
    {
      icon: Headphones,
      title: t('services.support'),
      description: t('services.supportDesc'),
      features: [t('services.features.techSupport'), t('services.features.originalParts'), t('services.features.maintenanceService'), t('services.features.warranty')],
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section id="servicios" className="py-20 relative overflow-hidden">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-blue/10 text-p3-blue text-sm font-semibold rounded-full mb-4">
            {t('services.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('services.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t('services.subtitle')}
          </p>
        </FadeInSection>

        {/* Grid de servicios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeInSection key={index} delay={index * 100}>
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 h-full relative overflow-hidden">
                {/* Fondo hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="text-white" size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-p3-dark dark:text-white mb-3 group-hover:text-p3-red transition-colors">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-p3-red rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-p3-red font-medium opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-sm">{t('services.seeMore')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Banner */}
        <FadeInSection delay={300} className="mt-16">
          <div className="bg-gradient-to-r from-p3-blue to-p3-blue-light rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <h3 className="text-2xl font-bold mb-4">{t('services.deliveryTitle')}</h3>
                <p className="text-gray-100 mb-4">{t('services.deliveryText1')}</p>
                <p className="text-gray-100">{t('services.deliveryText2')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <span className="block text-4xl font-bold mb-2">{t('services.immediate')}</span>
                  <span className="text-sm opacity-90">{t('services.inStock')}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <span className="block text-4xl font-bold mb-2">4-8</span>
                  <span className="text-sm opacity-90">{t('services.weeks')}</span>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default Services;
