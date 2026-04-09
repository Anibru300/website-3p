import { useEffect, useState } from 'react';

const CursorSpotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // No mostrar en dispositivos táctiles
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Spotlight principal */}
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div 
          className="w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(196, 30, 58, 0.15) 0%, rgba(30, 58, 138, 0.08) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </div>
      
      {/* Punto central brillante */}
      <div
        className="fixed pointer-events-none z-[9999] w-4 h-4 transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(196, 30, 58, 0.4) 50%, transparent 70%)',
          borderRadius: '50%',
          boxShadow: '0 0 20px rgba(196, 30, 58, 0.5)',
        }}
      />
    </>
  );
};

export default CursorSpotlight;
