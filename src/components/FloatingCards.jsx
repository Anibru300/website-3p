import { useEffect, useState } from 'react';
import { Package, Truck, Award, Headphones } from 'lucide-react';

const FloatingCards = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cards = [
    { icon: Package, label: 'Equipos', color: 'from-p3-red to-p3-red-dark', delay: 0 },
    { icon: Truck, label: 'Logística', color: 'from-blue-600 to-blue-800', delay: 0.2 },
    { icon: Award, label: 'Calidad', color: 'from-green-600 to-teal-700', delay: 0.4 },
    { icon: Headphones, label: 'Soporte', color: 'from-purple-600 to-purple-800', delay: 0.6 },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`group relative`}
          style={{
            transform: `translateY(${Math.sin((scrollY * 0.002) + card.delay) * 10}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform`}>
            <card.icon size={24} />
          </div>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingCards;
