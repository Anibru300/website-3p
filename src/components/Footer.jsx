import { Phone, Mail, MapPin, Facebook, Linkedin, Instagram, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Marcas', href: '#marcas' },
    { name: 'Clientes', href: '#clientes' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const brands = [
    'FANCOM',
    'LANDMECO',
    'DACS',
    'LUBING',
    'SBM',
    'HOG SLAT',
  ];

  return (
    <footer className="bg-p3-dark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/images/logo-3p-header.png" 
                alt="3P Logo" 
                className="h-12 w-auto bg-white rounded-lg p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h3 className="font-bold text-lg">3P S.A. DE C.V.</h3>
                <p className="text-xs text-gray-400">Parner de los Productores</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Más de 27 años de experiencia brindando tecnología de punta para la industria avícola, 
              porcícola e invernaderos en México y Centroamérica.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-p3-red transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-p3-red transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-p3-red transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-p3-red transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Marcas</h4>
            <ul className="space-y-3">
              {brands.map((brand, index) => (
                <li key={index}>
                  <a 
                    href="#marcas"
                    className="text-gray-400 hover:text-p3-red transition-colors"
                  >
                    {brand}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+524777748323" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                  <Phone size={18} className="text-p3-red flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    (477) 774-83-23<br />
                    (477) 774-83-26
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:trespsadecv@hotmail.com" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                  <Mail size={18} className="text-p3-red flex-shrink-0 mt-0.5" />
                  <span className="text-sm">trespsadecv@hotmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin size={18} className="text-p3-red flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Industrial del Norte 201<br />
                    Fracc. Industrial Del Norte<br />
                    CP. 37200, León, Gto.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} 3P S.A. DE C.V. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
