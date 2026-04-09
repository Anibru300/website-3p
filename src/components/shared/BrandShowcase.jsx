import { ArrowUpRight } from 'lucide-react';

const brands = [
  { name: 'ROXELL', origin: 'Bélgica', logo: 'images/brands/roxell.svg', href: '#/marcas/roxell', color: 'from-red-600 to-red-800' },
  { name: 'LUBING', origin: 'Alemania', logo: 'images/brands/lubing.png', href: '#/marcas/lubing', color: 'from-blue-600 to-blue-800' },
  { name: 'LANDMECO', origin: 'Dinamarca', logo: 'images/brands/landmeco.png', href: '#/marcas/landmeco', color: 'from-green-600 to-teal-700' },
  { name: 'GEORGIA POULTRY', origin: 'USA', logo: 'images/brands/georgia-poultry.png', href: '#/marcas/georgia-poultry', color: 'from-orange-500 to-red-600' },
  { name: 'CHORE-TIME', origin: 'USA', logo: 'images/brands/chore-time.svg', href: '#/marcas/chore-time', color: 'from-indigo-600 to-purple-700', active: true },
  { name: 'FANCOM', origin: 'Países Bajos', logo: 'images/brands/fancom.png', href: '#/marcas/fancom', color: 'from-emerald-500 to-green-700' },
  { name: 'MS Schippers', origin: 'Países Bajos', logo: 'images/brands/sbm.svg', href: '#/marcas/schippers', color: 'from-yellow-500 to-orange-600' },
  { name: 'AMT', origin: 'USA', logo: 'images/brands/amt.png', href: '#/marcas/amt', color: 'from-cyan-600 to-blue-700' },
  { name: 'ALKE', origin: 'Holanda', logo: 'images/brands/alke.png', href: '#/marcas/alke', color: 'from-amber-500 to-red-600' },
  { name: 'TIGSA', origin: 'España', logo: 'images/brands/tigsa.svg', href: '#/marcas/tigsa', color: 'from-emerald-600 to-green-700' },
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
            Clic en una marca para ver su catálogo de productos disponibles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href={brand.href}
              className="group block relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Parte superior con gradiente y logo */}
              <div className={`h-32 bg-gradient-to-r ${brand.color} flex items-center justify-center p-4 relative`}>
                {brand.active && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full z-10">
                    CATÁLOGO ACTIVO
                  </span>
                )}
                <div className="bg-white rounded-xl px-4 py-2 w-32 h-16 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-gray-800">${brand.name}</span>`; 
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
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Catálogo disponible con productos en stock</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
            <span>Catálogo en desarrollo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
