import { Quote, Building2, MapPin, Users, Globe, Award, TrendingUp, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';
import AnimatedCounter from './AnimatedCounter';

const Clients = () => {
  const { t, language } = useLanguage();

  const nationalClients = [
    { name: 'Avícola San Andrés', contact: 'Lic. Luis Fernando Sandoval', location: 'México' },
    { name: "Pilgrim's Pride", contact: 'Enrique Cano Jimenez', location: 'México' },
    { name: 'Grupo Pecuario San Antonio', contact: 'Ing. Adrian Castro', location: 'México' },
    { name: 'Gallina Pesada S.A.P.I.', contact: 'MVZ Mario Gabilondo', location: 'México' },
    { name: 'Avícola y Porcícola de los Altos', contact: 'LAF. Delia Palos de Alba', location: 'México' },
    { name: 'Aparcerías Avícolas', contact: 'Varios', location: 'México' },
  ];

  const internationalClients = [
    { name: 'A&M Inversiones S.A.', location: 'El Salvador' },
    { name: 'Hongos del Pilar', location: 'Argentina' },
    { name: 'Pat Fitz Mushrooms', location: 'California, USA' },
    { name: 'Cooperativa Integral de Producción', location: 'Guatemala' },
    { name: 'MCH Equavic EIRL', location: 'Sudamérica' },
    { name: 'Agronegocios de Guatemala S.A.', location: 'Guatemala' },
  ];

  const testimonials = [
    {
      text: language === 'es' 
        ? '3P ha sido nuestro proveedor de confianza por más de 10 años. Su servicio técnico y la calidad de los equipos FANCOM y LANDMECO han sido fundamentales para nuestro crecimiento.'
        : '3P has been our trusted supplier for over 10 years. Their technical service and the quality of FANCOM and LANDMECO equipment have been fundamental to our growth.',
      author: 'Ing. Adrian Castro',
      company: 'Grupo Pecuario San Antonio',
      rating: 5,
    },
    {
      text: language === 'es'
        ? 'La atención personalizada y el soporte postventa que nos brinda 3P es excepcional. Siempre están disponibles cuando los necesitamos.'
        : 'The personalized attention and after-sales support provided by 3P is exceptional. They are always available when we need them.',
      author: 'Lic. Luis Fernando Sandoval',
      company: 'Avícola San Andrés',
      rating: 5,
    },
    {
      text: language === 'es'
        ? 'Excelente servicio de importación. Los tiempos de entrega son cumplidos y el asesoramiento técnico es de primer nivel.'
        : 'Excellent import service. Delivery times are met and technical advice is top-notch.',
      author: 'MVZ Mario Gabilondo',
      company: 'Gallina Pesada',
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, value: 50, suffix: '+', label: t('clients.stats.national'), color: 'text-p3-red' },
    { icon: Globe, value: 6, suffix: '+', label: t('clients.stats.countries'), color: 'text-p3-blue' },
    { icon: TrendingUp, value: 100, suffix: '+', label: t('clients.stats.projects'), color: 'text-p3-red' },
    { icon: Award, value: 27, suffix: '', label: t('clients.stats.years'), color: 'text-p3-blue' },
  ];

  return (
    <section id="clientes" className="py-20 relative overflow-hidden">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

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
                  <h4 className="font-bold text-p3-dark dark:text-white mb-1">{client.name}</h4>
                  <p className="text-sm text-p3-blue mb-2">{client.contact}</p>
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
          <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-p3-blue/10 rounded-lg flex items-center justify-center">
              <Globe className="text-p3-blue" size={20} />
            </div>
            {t('clients.internationalClients')}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {internationalClients.map((client, index) => (
              <FadeInSection key={index} delay={index * 100}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-transparent hover:border-p3-blue/20 dark:border-gray-700">
                  <h4 className="font-bold text-p3-dark dark:text-white mb-1">{client.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={14} />
                    <span>{client.location}</span>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>

        {/* Testimonios */}
        <div>
          <h3 className="text-2xl font-bold text-p3-dark dark:text-white text-center mb-10">
            {t('clients.testimonials')}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeInSection key={index} delay={index * 150}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 relative group">
                  <Quote className="absolute top-6 right-6 text-p3-red/20 group-hover:text-p3-red/30 transition-colors" size={40} />
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="font-semibold text-p3-dark dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-p3-blue">{testimonial.company}</p>
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
