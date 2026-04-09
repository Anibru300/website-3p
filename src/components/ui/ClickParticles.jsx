import { useEffect, useState, useCallback } from 'react';

const ClickParticles = () => {
  const [particles, setParticles] = useState([]);

  const createParticles = useCallback((x, y) => {
    const emojis = ['🐔', '🐷', '🐥', '🥚', '🌾', '⭐', '✨', '💫'];
    const colors = ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#F87171', '#A78BFA'];
    
    const newParticles = [...Array(8)].map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.5,
      velocity: 50 + Math.random() * 100,
      size: 15 + Math.random() * 15,
      rotation: Math.random() * 360,
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Limpiar partículas después de la animación
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      // No crear partículas si se hace clic en inputs, botones o enlaces
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.tagName === 'BUTTON' ||
          e.target.tagName === 'A' ||
          e.target.closest('button') ||
          e.target.closest('a')) {
        return;
      }
      
      createParticles(e.clientX, e.clientY);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [createParticles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-particle-burst"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: `${particle.size}px`,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
            '--tx': `${Math.cos(particle.angle) * particle.velocity}px`,
            '--ty': `${Math.sin(particle.angle) * particle.velocity}px`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      <style>{`
        @keyframes particle-burst {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.5);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(360deg) scale(0);
            opacity: 0;
          }
        }
        .animate-particle-burst {
          animation: particle-burst 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ClickParticles;
