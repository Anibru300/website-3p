const AnimatedGradientText = ({ children, className = '' }) => {
  return (
    <span 
      className={`bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-p3-red via-p3-blue to-p3-red bg-[length:200%_auto] ${className}`}
      style={{
        backgroundSize: '200% auto',
        animation: 'gradient-shift 3s linear infinite',
      }}
    >
      {children}
    </span>
  );
};

export default AnimatedGradientText;
