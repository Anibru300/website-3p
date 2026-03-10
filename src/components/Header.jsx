import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Marcas', href: '#marcas' },
    { name: 'Clientes', href: '#clientes' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header>
      {/* Barra superior de contacto */}
      <div className="bg-p3-blue text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+524777748323" className="flex items-center gap-2 hover:text-p3-red transition-colors">
              <Phone size={14} />
              <span>(477) 774-83-23</span>
            </a>
            <a href="mailto:trespsadecv@hotmail.com" className="hidden sm:flex items-center gap-2 hover:text-p3-red transition-colors">
              <Mail size={14} />
              <span>trespsadecv@hotmail.com</span>
            </a>
          </div>
          <div className="text-xs opacity-80">
            León, Guanajuato, México
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3">
              <img 
                src="/images/logo-3p-header.png" 
                alt="3P S.A. DE C.V." 
                className="h-14 w-auto"
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-p3-blue leading-tight">3P S.A. DE C.V.</h1>
                <p className="text-xs text-gray-500">Parner de los Productores</p>
              </div>
            </a>

            {/* Navegación desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Botón CTA */}
            <div className="hidden lg:block">
              <a
                href="#contacto"
                className="px-6 py-2.5 bg-p3-red text-white font-medium rounded-lg hover:bg-p3-red-dark transition-colors shadow-md hover:shadow-lg"
              >
                Cotizar Ahora
              </a>
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-p3-red transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-4 bg-white border-t">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mt-4 px-4 py-3 bg-p3-red text-white text-center font-medium rounded-lg hover:bg-p3-red-dark transition-colors"
            >
              Cotizar Ahora
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
