import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Users, Globe, Award, Clock, Package } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const StatsSection = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { 
      icon: Clock, 
      value: 27, 
      suffix: '+', 
      label: language === 'es' ? 'Años de Experiencia' : 'Years of Experience',
      color: 'from-p3-red to-p3-red-dark'
    },
    { 
      icon: Users, 
      value: 50, 
      suffix: '+', 
      label: language === 'es' ? 'Clientes Satisfechos' : 'Happy Clients',
      color: 'from-blue-600 to-blue-800'
    },
    { 
      icon: Globe, 
      value: 10, 
      suffix: '+', 
      label: language === 'es' ? 'Países Atendidos' : 'Countries Served',
      color: 'from-green-600 to-teal-700'
    },
    { 
      icon: Package, 
      value: 500, 
      suffix: '+', 
      label: language === 'es' ? 'Equipos Instalados' : 'Equipment Installed',
      color: 'from-purple-600 to-purple-800'
    },
    { 
      icon: TrendingUp, 
      value: 98, 
      suffix: '%', 
      label: language === 'es' ? 'Satisfacción' : 'Satisfaction',
      color: 'from-orange-500 to-red-600'
    },
    { 
      icon: Award, 
      value: 15, 
      suffix: '+', 
      label: language === 'es' ? 'Certificaciones' : 'Certifications',
      color: 'from-pink-600 to-rose-700'
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #C41E3A 100%)',
      }}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos flotantes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Líneas decorativas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-white/20 text-white text-sm font-semibold rounded-full mb-4 backdrop-blur-sm">
            {language === 'es' ? 'Nuestros Números' : 'Our Numbers'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {language === 'es' ? 'Resultados que ' : 'Results that '}
            <span className="text-yellow-300">{language === 'es' ? 'hablan' : 'speak'}</span>
          </h2>
        </div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}>
                <stat.icon className="text-white" size={28} />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {isVisible && <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} />}
              </div>
              <div className="text-white/80 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
