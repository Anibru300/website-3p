import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  Building2, 
  Briefcase, 
  Award, 
  PackageSearch,
  Users, 
  Phone,
  ChevronUp,
} from 'lucide-react';

const FloatingNav = () => {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('inicio');
  const [isVisible, setIsVisible] = useState(false);

  const sections = [
    { id: 'inicio', icon: Home, labelEs: 'Inicio', labelEn: 'Home' },
    { id: 'nosotros', icon: Building2, labelEs: 'Nosotros', labelEn: 'About' },
    { id: 'servicios', icon: Briefcase, labelEs: 'Servicios', labelEn: 'Services' },
    { id: 'marcas', icon: Award, labelEs: 'Marcas', labelEn: 'Brands' },
    { id: 'catalogo', icon: PackageSearch, labelEs: 'Catálogo', labelEn: 'Catalog' },
    { id: 'clientes', icon: Users, labelEs: 'Clientes', labelEn: 'Clients' },
    { id: 'contacto', icon: Phone, labelEs: 'Cotización', labelEn: 'Quote' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar el nav después de hacer scroll un poco
      setIsVisible(window.scrollY > 200);

      // Detectar sección activa
      const sectionElements = sections.map(sec => ({
        id: sec.id,
        element: document.getElementById(sec.id),
      }));

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Método más simple y confiable
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Navegador lateral de secciones - SIEMPRE ABIERTO */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[9999] hidden lg:flex flex-col gap-2 pointer-events-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group relative flex items-center gap-3 transition-all duration-300 hover:scale-105 ${
                isActive ? 'scale-105' : ''
              }`}
            >
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {language === 'es' ? section.labelEs : section.labelEn}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white dark:bg-gray-800 rotate-45"></div>
              </div>
              
              {/* Icono */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer pointer-events-auto ${
                isActive 
                  ? 'bg-gradient-to-br from-p3-red to-p3-red-dark text-white ring-2 ring-p3-red/50 ring-offset-2' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-p3-red hover:text-white'
              }`}>
                <Icon size={20} />
              </div>
              
              {/* Indicador activo */}
              {isActive && (
                <div className="absolute -left-3 w-2 h-2 bg-p3-red rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Versión móvil - Barra inferior */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full px-3 py-2 shadow-xl flex items-center gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-p3-red text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={language === 'es' ? section.labelEs : section.labelEn}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón volver arriba flotante */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 w-12 h-12 bg-gradient-to-br from-p3-blue to-p3-blue-light rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        title={language === 'es' ? 'Volver arriba' : 'Back to top'}
      >
        <ChevronUp size={24} />
      </button>
    </>
  );
};

export default FloatingNav;
