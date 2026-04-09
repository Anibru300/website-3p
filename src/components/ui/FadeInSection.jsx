import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const FadeInSection = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 600
}) => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 });

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      case 'scale': return 'scale(0.95)';
      default: return 'translateY(30px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hasIntersected ? 1 : 0,
        transform: hasIntersected ? 'translate(0, 0) scale(1)' : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
