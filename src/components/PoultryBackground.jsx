import { useEffect, useState, useRef } from 'react';

const PoultryBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Datos de los animalitos que corren
  const animals = [
    // Pollitos
    { id: 1, type: 'chick', startY: '15%', size: 30, speed: 15, delay: 0, direction: 'right' },
    { id: 2, type: 'chick', startY: '35%', size: 25, speed: 18, delay: 5, direction: 'left' },
    { id: 3, type: 'chick', startY: '55%', size: 28, speed: 12, delay: 10, direction: 'right' },
    { id: 4, type: 'chick', startY: '75%', size: 32, speed: 20, delay: 3, direction: 'left' },
    { id: 5, type: 'chick', startY: '25%', size: 26, speed: 16, delay: 8, direction: 'right' },
    // Gallinas
    { id: 6, type: 'hen', startY: '20%', size: 50, speed: 25, delay: 2, direction: 'right' },
    { id: 7, type: 'hen', startY: '45%', size: 55, speed: 30, delay: 7, direction: 'left' },
    { id: 8, type: 'hen', startY: '70%', size: 48, speed: 28, delay: 12, direction: 'right' },
    // Cerditos
    { id: 9, type: 'pig', startY: '30%', size: 45, speed: 22, delay: 4, direction: 'left' },
    { id: 10, type: 'pig', startY: '60%', size: 42, speed: 26, delay: 9, direction: 'right' },
    { id: 11, type: 'pig', startY: '85%', size: 40, speed: 24, delay: 14, direction: 'left' },
  ];

  // Renderizar SVG según el tipo de animal
  const renderAnimal = (type, size) => {
    const color = type === 'chick' ? '#FCD34D' : type === 'hen' ? '#F59E0B' : '#F472B6';
    
    switch (type) {
      case 'chick':
        return (
          <svg width={size} height={size} viewBox="0 0 50 50" className="animate-bounce-subtle">
            {/* Cuerpo */}
            <circle cx="25" cy="30" r="15" fill={color} />
            {/* Cabeza */}
            <circle cx="25" cy="18" r="10" fill={color} />
            {/* Pico */}
            <path d="M32 18 L38 20 L32 22" fill="#F97316" />
            {/* Ojo */}
            <circle cx="28" cy="16" r="2" fill="#1F2937" />
            {/* Patas */}
            <line x1="20" y1="42" x2="20" y2="48" stroke="#F97316" strokeWidth="2" />
            <line x1="30" y1="42" x2="30" y2="48" stroke="#F97316" strokeWidth="2" />
            {/* Ala */}
            <ellipse cx="15" cy="30" rx="5" ry="8" fill="#FBBF24" />
          </svg>
        );
      case 'hen':
        return (
          <svg width={size} height={size} viewBox="0 0 60 60" className="animate-bounce-subtle">
            {/* Cuerpo */}
            <ellipse cx="30" cy="38" rx="20" ry="15" fill={color} />
            {/* Cabeza */}
            <circle cx="45" cy="25" r="12" fill={color} />
            {/* Cresta */}
            <path d="M45 15 L47 8 L49 15 M50 16 L53 10 L55 17" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Pico */}
            <path d="M55 25 L62 28 L55 31" fill="#F97316" />
            {/* Ojo */}
            <circle cx="48" cy="23" r="2.5" fill="#1F2937" />
            {/* Patas */}
            <line x1="22" y1="50" x2="22" y2="58" stroke="#F97316" strokeWidth="3" />
            <line x1="38" y1="50" x2="38" y2="58" stroke="#F97316" strokeWidth="3" />
            {/* Ala */}
            <ellipse cx="20" cy="38" rx="8" ry="10" fill="#FBBF24" />
            {/* Cola */}
            <path d="M10 35 Q5 30 8 25 Q12 28 15 32" fill="#FBBF24" />
          </svg>
        );
      case 'pig':
        return (
          <svg width={size} height={size} viewBox="0 0 60 50" className="animate-bounce-subtle">
            {/* Cuerpo */}
            <ellipse cx="30" cy="30" rx="22" ry="15" fill={color} />
            {/* Cabeza */}
            <ellipse cx="48" cy="28" r="12" fill={color} />
            {/* Hocico */}
            <ellipse cx="54" cy="28" rx="6" ry="5" fill="#FCE7F3" />
            {/* Nariz */}
            <circle cx="52" cy="27" r="1.5" fill="#1F2937" />
            <circle cx="56" cy="27" r="1.5" fill="#1F2937" />
            {/* Ojo */}
            <circle cx="50" cy="24" r="2" fill="#1F2937" />
            {/* Orejas */}
            <path d="M40 20 L38 12 L44 18" fill={color} />
            <path d="M46 18 L48 10 L52 17" fill={color} />
            {/* Patas */}
            <line x1="18" y1="42" x2="18" y2="48" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <line x1="28" y1="42" x2="28" y2="48" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <line x1="32" y1="42" x2="32" y2="48" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <line x1="42" y1="42" x2="42" y2="48" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {/* Cola */}
            <path d="M8 28 Q2 25 5 20 Q8 22 10 26" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 25%, #F3E8FF 50%, #EDE9FE 75%, #E0E7FF 100%)',
      }}
    >
      {/* Círculos decorativos difusos */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
        style={{ 
          top: '5%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          transform: `translateY(${scrollY * 0.03}px)` 
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
        style={{ 
          top: '40%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          transform: `translateY(${scrollY * -0.02}px)` 
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
        style={{ 
          top: '70%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
          transform: `translateY(${scrollY * 0.04}px)` 
        }}
      />

      {/* Animalitos corriendo */}
      {animals.map((animal) => (
        <div
          key={animal.id}
          className="absolute"
          style={{
            top: animal.startY,
            animation: `run-${animal.direction} ${animal.speed}s linear infinite`,
            animationDelay: `${animal.delay}s`,
            opacity: 0.6,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          {renderAnimal(animal.type, animal.size)}
        </div>
      ))}

      {/* Granero decorativo */}
      <div 
        className="absolute opacity-[0.08]"
        style={{
          bottom: '5%',
          left: '5%',
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      >
        <svg width="120" height="100" viewBox="0 0 120 100">
          {/* Cuerpo del granero */}
          <rect x="20" y="40" width="80" height="55" fill="#DC2626" />
          {/* Techo */}
          <path d="M10 40 L60 10 L110 40" fill="#991B1B" />
          {/* Puerta */}
          <rect x="45" y="65" width="30" height="30" fill="#7F1D1D" />
          <path d="M60 65 L60 95" stroke="#DC2626" strokeWidth="2" />
          {/* Ventana */}
          <circle cx="35" cy="55" r="8" fill="#FEF3C7" />
          <line x1="35" y1="47" x2="35" y2="63" stroke="#7F1D1D" strokeWidth="2" />
          <line x1="27" y1="55" x2="43" y2="55" stroke="#7F1D1D" strokeWidth="2" />
        </svg>
      </div>

      {/* Valla decorativa */}
      <div 
        className="absolute opacity-[0.06]"
        style={{
          bottom: '8%',
          right: '10%',
          transform: `translateY(${scrollY * 0.03}px)`,
        }}
      >
        <svg width="150" height="60" viewBox="0 0 150 60">
          {[0, 30, 60, 90, 120].map((x, i) => (
            <g key={i}>
              <rect x={x} y="10" width="6" height="40" fill="#92400E" rx="2" />
              <circle cx={x + 3} cy="8" r="4" fill="#92400E" />
            </g>
          ))}
          <rect x="0" y="20" width="126" height="4" fill="#B45309" rx="1" />
          <rect x="0" y="35" width="126" height="4" fill="#B45309" rx="1" />
        </svg>
      </div>

      {/* Huevos decorativos estáticos */}
      <div 
        className="absolute opacity-[0.15]"
        style={{
          top: '25%',
          left: '8%',
          transform: `translateY(${scrollY * 0.02}px)`,
        }}
      >
        <svg width="40" height="50" viewBox="0 0 40 50">
          <ellipse cx="20" cy="25" rx="15" ry="20" fill="#FCD34D" />
        </svg>
      </div>
      <div 
        className="absolute opacity-[0.12]"
        style={{
          top: '65%',
          right: '8%',
          transform: `translateY(${scrollY * -0.01}px)`,
        }}
      >
        <svg width="35" height="45" viewBox="0 0 40 50">
          <ellipse cx="20" cy="25" rx="15" ry="20" fill="#F9A8D4" />
        </svg>
      </div>

      {/* Hierba decorativa */}
      <div 
        className="absolute opacity-[0.1]"
        style={{
          bottom: '0%',
          left: '0%',
          right: '0%',
          height: '100px',
        }}
      >
        <svg width="100%" height="100" viewBox="0 0 1440 100" preserveAspectRatio="none">
          {[...Array(30)].map((_, i) => (
            <path
              key={i}
              d={`M${i * 50} 100 Q${i * 50 + 10} ${60 + Math.random() * 20} ${i * 50 + 5} ${30 + Math.random() * 20}`}
              stroke="#16A34A"
              strokeWidth="3"
              fill="none"
              opacity="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Nubes suaves */}
      <div 
        className="absolute opacity-[0.08]"
        style={{
          top: '10%',
          left: '20%',
          animation: 'float-cloud 30s linear infinite',
        }}
      >
        <svg width="100" height="50" viewBox="0 0 100 50">
          <ellipse cx="25" cy="35" rx="20" ry="12" fill="white" />
          <ellipse cx="50" cy="30" rx="25" ry="15" fill="white" />
          <ellipse cx="75" cy="35" rx="20" ry="12" fill="white" />
        </svg>
      </div>
      <div 
        className="absolute opacity-[0.06]"
        style={{
          top: '20%',
          right: '25%',
          animation: 'float-cloud 40s linear infinite reverse',
        }}
      >
        <svg width="80" height="40" viewBox="0 0 100 50">
          <ellipse cx="25" cy="35" rx="20" ry="12" fill="white" />
          <ellipse cx="50" cy="30" rx="25" ry="15" fill="white" />
          <ellipse cx="75" cy="35" rx="20" ry="12" fill="white" />
        </svg>
      </div>

      <style>{`
        @keyframes run-right {
          0% {
            transform: translateX(-100px) scaleX(1);
          }
          100% {
            transform: translateX(calc(100vw + 100px)) scaleX(1);
          }
        }
        @keyframes run-left {
          0% {
            transform: translateX(calc(100vw + 100px)) scaleX(-1);
          }
          100% {
            transform: translateX(-100px) scaleX(-1);
          }
        }
        @keyframes float-cloud {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(calc(100vw + 100px));
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PoultryBackground;
