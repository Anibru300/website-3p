import { Target, Eye, Award, CheckCircle, Users, Globe, HandHeart, Shield, Leaf, TrendingUp, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';
import AnimatedCounter from './AnimatedCounter';

const About = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Shield, title: t('about.responsibility'), desc: t('about.responsibilityDesc') },
    { icon: HandHeart, title: t('about.service'), desc: t('about.serviceDesc') },
    { icon: Users, title: t('about.teamwork'), desc: t('about.teamworkDesc') },
    { icon: Leaf, title: t('about.respect'), desc: t('about.respectDesc') },
  ];

  const recognitions = [
    'ANECA (Asociación Nacional de Especialistas en Ciencias Avícolas)',
    'SENAPROA (Sección Nacional de Progenitores de Aves de la UNA)',
    'ALEASEN (Asociación de Especialistas en Ciencias Avícolas del Centro de México)',
    'ALA (Asociación Latinoamericana de Avicultura de El Salvador)',
    'AMVEAV (Asociación de Médicos Veterinarios Especialistas en Aves)',
    'AVEM (Congreso Internacional de Aviespecialistas)',
    'IPPE (International Production & Processing Expo)',
  ];

  const timeline = [
    { year: '1997', title: t('about.founded'), desc: 'Inicio de operaciones' },
    { year: '2010', title: 'Expansión', desc: 'Nueva ubicación León, Gto.' },
    { year: '2024', title: 'Liderazgo', desc: '27+ años de experiencia' },
  ];

  return (
    <section id="nosotros" className="py-20 relative overflow-hidden">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-red/10 text-p3-red text-sm font-semibold rounded-full mb-4">
            {t('about.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            <span className="text-p3-red"><AnimatedCounter end={27} suffix="+" /></span> {t('about.experience')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t('about.subtitle')}
          </p>
        </FadeInSection>

        {/* Historia */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <FadeInSection direction="left" className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-p3-red/20 to-p3-blue/20 rounded-3xl blur-xl animate-pulse"></div>
              <div className="relative aspect-square bg-gradient-to-br from-p3-blue to-p3-red rounded-2xl p-1">
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <img src="images/logo-3p-login.png" alt="3P Logo" className="w-3/4 h-3/4 object-contain" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-p3-red to-p3-red-dark text-white p-6 rounded-2xl shadow-xl">
                <Calendar className="mb-2" size={24} />
                <span className="text-4xl font-bold">1997</span>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="right" className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-4">{t('about.history')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('about.historyText1')}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('about.historyText2')}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('about.historyText3')}</p>
            
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-p3-gray/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-p3-red to-p3-red-dark rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{item.year}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-p3-dark dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <FadeInSection direction="left">
            <div className="bg-gradient-to-br from-p3-blue to-p3-blue-light p-8 rounded-2xl text-white h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.mission')}</h3>
              <p className="text-gray-100">{t('about.missionText')}</p>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="right">
            <div className="bg-gradient-to-br from-p3-red to-p3-red-dark p-8 rounded-2xl text-white h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.vision')}</h3>
              <p className="text-gray-100">{t('about.visionText')}</p>
            </div>
          </FadeInSection>
        </div>

        {/* Lema */}
        <FadeInSection className="mb-20">
          <div className="bg-gradient-to-r from-p3-dark via-p3-blue to-p3-dark rounded-2xl p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
            <p className="text-sm uppercase tracking-widest opacity-80 mb-4">{t('about.slogan')}</p>
            <blockquote className="text-2xl sm:text-3xl font-bold italic">
              {t('about.sloganText')}
            </blockquote>
          </div>
        </FadeInSection>

        {/* Valores */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-p3-dark dark:text-white text-center mb-10">{t('about.values')}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <FadeInSection key={index} delay={index * 100}>
                <div className="p-6 bg-p3-gray dark:bg-gray-800 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-p3-red/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-p3-red transition-colors">
                    <value.icon className="text-p3-red group-hover:text-white transition-colors" size={24} />
                  </div>
                  <h4 className="font-semibold text-p3-dark dark:text-white mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>

        {/* Reconocimientos */}
        <FadeInSection>
          <div className="bg-p3-gray dark:bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-p3-dark dark:text-white text-center mb-8 flex items-center justify-center gap-3">
              <Award className="text-p3-red" size={28} />
              {t('about.recognitions')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recognitions.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-700 rounded-xl">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default About;
