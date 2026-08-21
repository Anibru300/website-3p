import { useState } from 'react';
import { Menu, X, Phone, Mail, ChevronRight, Globe, LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../hooks/useBrowserLocation';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const baseNavLinks = [
    { name: t('nav.inicio') || 'Inicio', href: '/', section: null },
    { name: t('nav.nosotros') || 'Nosotros', href: '#nosotros', section: 'nosotros' },
    { name: t('nav.servicios') || 'Servicios', href: '#servicios', section: 'servicios' },
    { name: t('nav.marcas') || 'Marcas', href: '#marcas', section: 'marcas' },
    { name: t('nav.catalogo') || 'Catálogo', href: '#catalogos', section: 'catalogos' },
    { name: t('nav.contacto') || 'Cotización', href: '#contacto', section: 'contacto' },
  ];

  const navLinks = baseNavLinks.map(link => ({
    ...link,
    href: isHome || !link.section ? link.href : `/${link.href}`,
  }));

  const navigateToSection = (e, sectionId, href) => {
    if (!sectionId) return; // Enlace "Inicio", comportamiento por defecto
    e.preventDefault();

    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const newUrl = `/${href}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Líneas / catálogos de marcas (rutas internas)
  const brandLinks = [
    { name: 'Fancom', href: '/marcas/fancom' },
    { name: 'Lubing', href: '/marcas/lubing' },
    { name: 'MS Schippers', href: '/marcas/ms-schippers' },
    { name: 'SBM', href: '/marcas/sbm' },
    { name: 'LB White', href: '/marcas/lbwhite' },
    { name: 'AMT', href: '/marcas/amt' },
    { name: 'ALKE', href: '/marcas/alke' },
    { name: 'TIGSA', href: '/marcas/tigsa' },
    { name: 'Georgia Poultry', href: '/marcas/georgia-poultry' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Barra superior */}
      <div className="bg-p3-blue text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+524771284661" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
              <Phone size={14} />
              <span>+52 477 128 4661 / +52 477 774 8323 / +52 477 774 8326</span>
            </a>
            <a href="mailto:trespsadecv@hotmail.com" className="hidden sm:flex items-center gap-2 hover:text-yellow-300 transition-colors">
              <Mail size={14} />
              <span>trespsadecv@hotmail.com</span>
            </a>
          </div>
          <div className="text-xs opacity-80">León, Guanajuato, México</div>
        </div>
      </div>

      {/* Navegacion principal */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/images/logo-3p-header.png" 
                  alt="3P S.A. DE C.V." 
                  className="h-14 w-auto group-hover:scale-105 transition-transform"
                  loading="lazy"
                  onError={(e) => { e.target.src = 'logo.png'; }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-p3-blue dark:text-blue-400 leading-tight group-hover:text-p3-red transition-colors">3P S.A. DE C.V.</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('footer.slogan') || 'Partner de los Productores de Pollos'}</p>
              </div>
            </a>

            {/* Desktop nav */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isHome && (location.hash === link.section || (!link.section && location.hash === ''));
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => navigateToSection(e, link.section, baseNavLinks.find(b => b.name === link.name)?.href)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive ? 'text-p3-red bg-red-50 dark:bg-red-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-p3-red hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                  >
                    {link.name}
                  </a>
                );
              })}
              
              {/* Dropdown de marcas */}
              <div className="relative group px-3 py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1">
                  Líneas
                  <ChevronRight size={14} className="rotate-90" />
                </span>
                <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-80 overflow-y-auto">
                  <div className="py-2">
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase font-semibold">Catálogos disponibles</p>
                    <a href="/marcas/ms-schippers" className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      MS Schippers
                    </a>
                    <div className="border-t dark:border-gray-700 my-1"></div>
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase font-semibold">Próximamente</p>
                    {brandLinks.filter(b => b.href !== '/marcas/ms-schippers').map(b => (
                      <a
                        key={b.name}
                        href={b.href}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-p3-red dark:hover:bg-red-900/10"
                      >
                        {b.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={toggleLanguage} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-semibold text-sm">
                <Globe size={16} className="mr-1" />
                {language.toUpperCase()}
              </button>
              <a
                href="/login"
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-p3-red hover:text-white transition-all"
                title="Acceso 3P"
              >
                <LogIn size={18} />
              </a>
              <a
                href={isHome ? '#contacto' : '/#contacto'}
                onClick={(e) => navigateToSection(e, 'contacto', '#contacto')}
                className="group px-6 py-2.5 bg-p3-red text-white font-medium rounded-lg hover:bg-p3-red-dark transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-p3-red/30 hover:-translate-y-0.5 flex items-center gap-2"
              >
                {t('nav.cotizar') || 'Cotizar'}
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 dark:text-gray-300 hover:text-p3-red transition-colors">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  navigateToSection(e, link.section, baseNavLinks.find(b => b.name === link.name)?.href);
                }}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-p3-red hover:bg-red-50 dark:hover:bg-red-900/10 mb-1"
              >
                {link.name}
              </a>
            ))}
            <div className="border-t dark:border-gray-700 my-2 pt-2">
              <p className="px-4 py-1 text-xs text-green-600 uppercase font-semibold">Catálogo Activo</p>
              <a href="/marcas/ms-schippers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                MS Schippers
              </a>
              <div className="border-t dark:border-gray-700 my-2"></div>
              <p className="px-4 py-1 text-xs text-gray-500 uppercase">Líneas</p>
              {brandLinks.filter(b => b.href !== '/marcas/ms-schippers').map(b => (
                <a
                  key={b.name}
                  href={b.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-p3-red hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  {b.name}
                </a>
              ))}
            </div>
            <a
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-p3-red text-white font-medium"
            >
              <LogIn size={18} /> Acceso 3P
            </a>
            <div className="flex gap-3 mt-3 pt-4 border-t dark:border-gray-700">
              <button onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                <Globe size={18} /> {language === 'es' ? 'English' : 'Español'}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
