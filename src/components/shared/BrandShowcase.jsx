import { ExternalLink } from 'lucide-react';

const brands = [
  { name: 'LUBING', origin: 'Alemania', logo: '/images/brands/lubing.png', officialUrl: 'https://www.lubing.de', color: 'from-blue-600 to-blue-800' },
  { name: 'GEORGIA POULTRY', origin: 'USA', logo: '/images/brands/georgia-poultry.png', officialUrl: 'https://www.gapoultry.com', color: 'from-orange-500 to-red-600' },
  { name: 'FANCOM', origin: 'Países Bajos', logo: '/images/brands/fancom.png', officialUrl: 'https://www.fancom.com', color: 'from-emerald-500 to-green-700' },
  { name: 'MS Schippers', origin: 'Países Bajos', logo: '/images/brands/ms-schippers.svg', officialUrl: 'https://www.msschippers.com', color: 'from-green-600 to-teal-700' },
  { name: 'SBM', origin: 'Francia', logo: '/images/brands/sbm.png', officialUrl: 'https://www.sbm.fr', color: 'from-yellow-500 to-orange-600' },
  { name: 'LB White', origin: 'USA', logo: '/images/brands/lbwhite.png', officialUrl: 'https://www.lbwhite.com', color: 'from-blue-700 to-blue-900' },
  { name: 'AMT', origin: 'USA', logo: '/images/brands/amt.png', officialUrl: 'https://www.amt-usa.com', color: 'from-cyan-600 to-blue-700' },
  { name: 'ALKE', origin: 'Países Bajos', logo: '/images/brands/alke.png', officialUrl: 'https://www.alke.nl', color: 'from-amber-500 to-red-600' },
  { name: 'TIGSA', origin: 'España', logo: '/images/brands/tigsa.svg', officialUrl: 'https://tigsa.com', color: 'from-p3-red to-red-700' },
];

const BrandShowcase = () => {
  return (
    <section id="marcas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-red-50 text-p3-red text-sm font-semibold rounded-full mb-4">
            Distribuidor Autorizado
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Marcas que Distribuimos</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Representamos a los líderes mundiales en equipos para avicultura y porcicultura.
            Clic en una marca para visitar su sitio web oficial.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href={brand.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Parte superior con gradiente y logo */}
              <div className={`h-32 bg-gradient-to-r ${brand.color} flex items-center justify-center p-4 relative`}>
                <div className="bg-white rounded-xl px-4 py-2 w-32 h-16 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.textContent = brand.name;
                        parent.className = 'text-sm font-bold text-gray-800';
                      }
                    }}
                  />
                </div>
              </div>
              {/* Parte inferior con info */}
              <div className="p-4 flex items-center justify-between bg-white">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-p3-red transition-colors text-sm">{brand.name}</h3>
                  <p className="text-xs text-gray-500">{brand.origin}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-p3-red group-hover:text-white transition-colors">
                  <ExternalLink size={14} />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ExternalLink size={16} className="text-p3-blue" />
            <span>Los enlaces abren el sitio oficial de cada marca en una nueva pestaña</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
