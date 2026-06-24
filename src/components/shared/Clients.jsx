import { Building2, Globe, Users, Award, TrendingUp, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FadeInSection } from '../ui';
import { AnimatedCounter } from '../ui';

const Clients = () => {
  const { t } = useLanguage();

  const nationalClients = [
    { name: 'Avícola San Andrés', location: 'México' },
    { name: "Pilgrim's Pride", location: 'México' },
    { name: 'Grupo Pecuario San Antonio', location: 'México' },
    { name: 'Gallina Pesada S.A.P.I.', location: 'México' },
    { name: 'Avícola y Porcícola de los Altos', location: 'México' },
    { name: 'Aparcerías Avícolas', location: 'México' },
  ];

  const internationalClients = [
    { country: 'Argentina', code: 'ar' },
    { country: 'Colombia', code: 'co' },
    { country: 'Perú', code: 'pe' },
    { country: 'El Salvador', code: 'sv' },
    { country: 'Guatemala', code: 'gt' },
    { country: 'Estados Unidos', code: 'us' },
  ];

  const stats = [
    { icon: Users, value: 50, suffix: '+', label: t('clients.stats.national'), color: 'text-p3-red' },
    { icon: Globe, value: 6, suffix: '+', label: t('clients.stats.countries'), color: 'text-p3-blue' },
    { icon: TrendingUp, value: 100, suffix: '+', label: t('clients.stats.projects'), color: 'text-p3-red' },
    { icon: Award, value: 27, suffix: '', label: t('clients.stats.years'), color: 'text-p3-blue' },
  ];

  return (
    <section id="clientes" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-blue/10 text-p3-blue text-sm font-semibold rounded-full mb-4">
            {t('clients.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('clients.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t('clients.subtitle')}
          </p>
        </FadeInSection>

        {/* Stats */}
        <FadeInSection delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className={stat.color} size={24} />
                </div>
                <span className={`block text-4xl font-bold ${stat.color} mb-2`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} />
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* Clientes Nacionales */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-p3-red/10 rounded-lg flex items-center justify-center">
              <Building2 className="text-p3-red" size={20} />
            </div>
            {t('clients.nationalClients')}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nationalClients.map((client, index) => (
              <FadeInSection key={index} delay={index * 100}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-transparent hover:border-p3-red/20 dark:border-gray-700">
                  <h4 className="font-bold text-p3-dark dark:text-white mb-2">{client.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={14} />
                    <span>{client.location}</span>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>

        {/* Clientes Internacionales */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-p3-dark dark:text-white mb-3 flex items-center justify-center gap-3">
              <span className="w-10 h-10 bg-p3-blue/10 rounded-lg flex items-center justify-center">
                <Globe className="text-p3-blue" size={20} />
              </span>
              {t('clients.internationalClients')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Atendemos clientes en múltiples países de América
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {internationalClients.map((client, index) => (
              <FadeInSection key={index} delay={index * 100}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-p3-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-20 h-14 mx-auto mb-4 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={`https://flagcdn.com/w160/${client.code}.png`}
                        alt={`Bandera de ${client.country}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="font-bold text-p3-dark dark:text-white text-sm">{client.country}</h4>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
