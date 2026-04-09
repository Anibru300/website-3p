import { Phone, Mail, MapPin, Facebook, Linkedin, Instagram, ArrowUp, Heart, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('nav.inicio') || 'Inicio', href: '#/' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Marcas', href: '#marcas' },
    { name: t('nav.contacto') || 'Contacto', href: '#contacto' },
  ];

  const services = [
    t('services.equipment'),
    t('services.import'),
    t('services.export'),
    t('services.training'),
    t('services.support'),
  ];

  const brands = [
    { name: 'Chore-Time', href: '#/marcas/chore-time', active: true },
    { name: 'ROXELL', href: '#/marcas/roxell' },
    { name: 'LUBING', href: '#/marcas/lubing' },
    { name: 'LANDMECO', href: '#/marcas/landmeco' },
    { name: 'FANCOM', href: '#/marcas/fancom' },
    { name: 'MS Schippers', href: '#/marcas/schippers' },
    { name: 'AMT', href: '#/marcas/amt' },
    { name: 'ALKE', href: '#/marcas/alke' },
    { name: 'TIGSA', href: '#/marcas/tigsa' },
    { name: 'Georgia Poultry', href: '#/marcas/georgia-poultry' },
  ];

  const scrollToSection = (href) => {
    // Si es una ruta de marca (comienza con #/marcas), dejar que el router la maneje
    if (href.startsWith('#/')) {
      window.location.hash = href.replace('#/', '');
      return;
    }
    
    // Si es el inicio
    if (href === '#/') {
      window.location.hash = '/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Para secciones del homepage
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-p3-dark text-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-p3-blue/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-p3-red/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* CTA Banner */}
      <div className="relative z-10 bg-gradient-to-r from-p3-red to-p3-red-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                {t('footer.cta')}
              </h3>
              <p className="text-white/80">
                {t('footer.ctaText')}
              </p>
            </div>
            <a
              href="#contacto"
              onClick={(e) => { e.preventDefault(); scrollToSection('#contacto'); }}
              className="group px-8 py-4 bg-white text-p3-red font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              {t('footer.quote')}
              <ArrowUp size={18} className="rotate-45 group-hover:rotate-90 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="images/logo-3p-header.png" 
                  alt="3P Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.src = 'logo.png';
                  }}
                />
                <div>
                  <h4 className="font-bold text-lg">3P S.A. DE C.V.</h4>
                  <p className="text-xs text-gray-400">{t('footer.slogan')}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-p3-red transition-all duration-300 hover:scale-110"
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold text-lg mb-6">{t('footer.quickLinks')}</h5>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-p3-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h5 className="font-bold text-lg mb-6">{t('footer.services')}</h5>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <span className="text-gray-400 hover:text-white transition-colors cursor-default flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-p3-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h5 className="font-bold text-lg mb-6">{t('footer.contact')}</h5>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+524771284661" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-p3-red transition-colors">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('contact.phones')}</p>
                      <p>+52 1 477 128 4661</p>
                      <p>+52 1 479 229 8907</p>
                      <p>+52 1 479 229 8904</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="mailto:trespsadecv@hotmail.com" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-p3-red transition-colors">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('contact.email')}</p>
                      <p className="text-sm">trespsadecv@hotmail.com</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-gray-400">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('contact.address')}</p>
                      <p className="text-sm">Industrial del Norte 201, Fracc. Industrial Del Norte, CP. 37200, León, Gto.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Brands Marquee */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm mb-4">{t('footer.brands')}</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {brands.map((brand, index) => (
                <a 
                  key={index} 
                  href={brand.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(brand.href); }}
                  className={`text-sm font-semibold hover:text-white transition-colors flex items-center gap-1 ${brand.active ? 'text-green-400' : 'text-gray-500'}`}
                >
                  {brand.name}
                  {brand.active && <span className="text-xs">●</span>}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p className="flex items-center gap-1">
              © {currentYear} 3P S.A. DE C.V. {t('footer.rights')}
            </p>
            <p className="flex items-center gap-1">
              {t('footer.madeWith')} <Heart size={14} className="text-p3-red fill-p3-red" /> {t('footer.in')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
