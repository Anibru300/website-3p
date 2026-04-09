import { ArrowRight, Globe, Award, Users, TrendingUp, Sparkles, Play, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedCounter from './AnimatedCounter';
import TypewriterText from './TypewriterText';
import MagicButton from './MagicButton';

const Hero = () => {
  const { t, language } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { icon: Award, value: 27, suffix: '+', label: t('hero.experience') },
    { icon: Globe, value: 10, suffix: '+', label: t('hero.countries') },
    { icon: Users, value: 50, suffix: '+', label: t('hero.clients') },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoError = () => {
    console.log('Video error, using fallback image');
    setVideoError(true);
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video de fondo - Granja avícola */}
      {!videoError && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={handleVideoError}
            className="absolute w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1548550023-2bdb3c5afed7?w=1920&q=80"
          >
            {/* Video de gallinas/pollos en granja - CDN confiable */}
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-p3-blue/90 via-p3-blue/85 to-p3-red/75"></div>
          
          {/* Patrón de puntos */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      )}

      {/* Fallback: Imagen si el video falla */}
      {videoError && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1548550023-2bdb3c5afed7?w=1920&q=80")`,
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-p3-blue/90 via-p3-blue/85 to-p3-red/75"></div>
        </div>
      )}

      {/* Elementos decorativos flotantes */}
      <div 
        className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse z-[1]"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      ></div>
      <div 
        className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-p3-red/15 rounded-full blur-3xl animate-pulse z-[1]"
        style={{ animationDelay: '1s', transform: `translateY(${scrollY * -0.2}px)` }}
      ></div>

      {/* Líneas decorativas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"
            style={{ left: `${20 + i * 15}%`, transform: `translateY(${scrollY * 0.05}px)` }}
          ></div>
        ))}
      </div>

      {/* Controles de video */}
      {!videoError && (
        <div className="absolute top-28 right-4 z-20">
          <button
            onClick={toggleMute}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido */}
          <div className={`text-white transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6 border border-white/20 animate-fade-in-up">
              <Sparkles size={16} className="text-yellow-300" />
              <span>{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block min-h-[1.2em]">
                <TypewriterText 
                  text={t('hero.title1')} 
                  delay={500} 
                  speed={60}
                />
              </span>
              <span className="block min-h-[1.2em]">
                {t('hero.title2')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-gradient">
                  {t('hero.titleHighlight')}
                </span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <MagicButton 
                onClick={() => scrollToSection('contacto')}
                variant="primary"
                icon={ArrowRight}
              >
                {t('hero.cta1')}
              </MagicButton>
              <MagicButton 
                onClick={() => scrollToSection('catalogo')}
                variant="secondary"
                icon={Play}
              >
                {language === 'es' ? 'Ver Catálogo' : 'View Catalog'}
              </MagicButton>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <stat.icon className="text-yellow-300" size={20} />
                    <span className="text-2xl sm:text-3xl font-bold">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} />
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo 3P animado */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="w-96 h-96 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center shadow-inner animate-float">
                  <img src="images/logo-3p-login.png" alt="3P Logo" className="w-64 h-64 object-contain" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-p3-red to-red-600 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                <TrendingUp size={24} className="text-white mb-1" />
                <span className="text-xl font-bold text-white">27</span>
                <span className="text-xs text-white/80">{t('hero.years')}</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-white rounded-2xl flex flex-col items-center justify-center shadow-lg">
                <Award size={28} className="text-p3-blue mb-1" />
                <span className="text-lg font-bold text-p3-blue">ISO</span>
                <span className="text-xs text-gray-500">{t('hero.iso')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <button onClick={() => scrollToSection('nosotros')} className="flex flex-col items-center text-white/60 hover:text-white">
          <span className="text-xs uppercase tracking-wider mb-2">{t('hero.scrollDown')}</span>
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Onda inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-[5]">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28C226.36,98.87,292.36,70.93,362.86,65.5c70.5-5.43,144.2,15.81,214.86,34.19c69.27,18,138.3,24.88,209.4,13.08c36.15-6,69.85-17.84,104.45-29.34C989.49,79.93,1113,40.64,1200,107.4V120H0Z" fill="white" className="dark:fill-gray-900"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
