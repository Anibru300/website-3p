const WaveSeparator = ({ color = 'white', flip = false, className = '' }) => {
  const fillColor = color === 'white' ? '#FFFFFF' : color === 'dark' ? '#111827' : color === 'gray' ? '#F9FAFB' : color;
  
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg 
        viewBox="0 0 1440 120" 
        className="relative block w-full h-[60px] md:h-[80px] lg:h-[100px]"
        preserveAspectRatio="none"
      >
        <path 
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28C226.36,98.87,292.36,70.93,362.86,65.5c70.5-5.43,144.2,15.81,214.86,34.19c69.27,18,138.3,24.88,209.4,13.08c36.15-6,69.85-17.84,104.45-29.34C989.49,79.93,1113,40.64,1200,107.4V120H0Z" 
          fill={fillColor}
          className="animate-wave"
        />
      </svg>
    </div>
  );
};

export default WaveSeparator;
