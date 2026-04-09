import { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 0, speed = 80, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Parpadear cursor al finalizar
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [displayText, text, speed, started]);

  return (
    <span className={className}>
      {displayText}
      <span 
        className={`inline-block w-[3px] h-[1em] bg-current ml-1 transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
        style={{ verticalAlign: 'middle' }}
      />
    </span>
  );
};

export default TypewriterText;
