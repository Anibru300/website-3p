import { useState, useEffect } from 'react';

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const scrollProgress = (scrollTop / documentHeight) * 100;
      setProgress(Math.min(scrollProgress, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100]">
      <div 
        className="h-full bg-gradient-to-r from-p3-red via-p3-blue to-p3-red transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* Glow effect */}
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
      </div>
    </div>
  );
};

export default ScrollProgress;
