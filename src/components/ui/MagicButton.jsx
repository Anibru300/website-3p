import { useState, useRef } from 'react';

const MagicButton = ({ children, onClick, variant = 'primary', className = '', icon: Icon }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const baseStyles = 'relative overflow-hidden px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-xl';
  
  const variants = {
    primary: 'bg-p3-red text-white hover:bg-p3-red-dark hover:shadow-p3-red/30',
    secondary: 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20',
    outline: 'bg-transparent border-2 border-p3-red text-p3-red hover:bg-p3-red hover:text-white',
    glass: 'bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 hover:border-white/50',
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} group ${className}`}
    >
      {/* Efecto de brillo permanente */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Contenido */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {Icon && <Icon size={20} className="group-hover:translate-x-1 transition-transform" />}
      </span>
    </button>
  );
};

export default MagicButton;
