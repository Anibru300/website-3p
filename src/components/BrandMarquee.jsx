import { useRef, useEffect, useState } from 'react';

const BrandMarquee = () => {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef(null);

  const brands = [
    { name: 'FANCOM', logo: 'images/brands/fancom.png' },
    { name: 'LANDMECO', logo: 'images/brands/landmeco.png' },
    { name: 'DACS', logo: 'images/brands/dacs.png' },
    { name: 'LUBING', logo: 'images/brands/lubing.png' },
    { name: 'MS Schippers', logo: 'images/brands/sbm.svg' },
    { name: 'HOG SLAT', logo: 'images/brands/hogslat.svg' },
  ];

  // Duplicar marcas para efecto infinito
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-gradient-to-r from-p3-dark via-p3-blue to-p3-dark py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <p className="text-center text-white/60 text-sm uppercase tracking-wider">
          Representantes de las mejores marcas internacionales
        </p>
      </div>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-p3-dark to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-p3-dark to-transparent z-10 pointer-events-none"></div>
        
        {/* Marquee container */}
        <div 
          ref={marqueeRef}
          className={`flex items-center gap-16 ${isPaused ? '' : 'animate-marquee'}`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <div 
              key={index}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 w-40 h-20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="hidden text-white font-bold text-sm">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
