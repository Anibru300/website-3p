import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialsCarousel = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = {
    es: [
      {
        name: 'Granja Avícola El Triunfo',
        role: 'Cliente desde 2015',
        content: '3P ha sido nuestro aliado estratégico por más de 8 años. Su equipo técnico siempre está disponible y los equipos FANCOM son de la mejor calidad.',
        rating: 5,
      },
      {
        name: 'Avícola del Centro',
        role: 'Cliente desde 2018',
        content: 'La capacitación que recibimos fue excelente. Nuestro personal ahora opera todo el equipo con total confianza y eficiencia.',
        rating: 5,
      },
      {
        name: 'Producción Avícola SUR',
        role: 'Cliente desde 2020',
        content: 'El servicio de importación nos permitió acceder a tecnología europea de punta. El soporte post-venta es excepcional.',
        rating: 5,
      },
      {
        name: 'Granjas Unidos',
        role: 'Cliente desde 2019',
        content: 'Recomiendo ampliamente a 3P. Su conocimiento técnico y atención personalizada hacen toda la diferencia.',
        rating: 5,
      },
    ],
    en: [
      {
        name: 'El Triunfo Poultry Farm',
        role: 'Client since 2015',
        content: '3P has been our strategic ally for over 8 years. Their technical team is always available and FANCOM equipment is top quality.',
        rating: 5,
      },
      {
        name: 'Central Poultry',
        role: 'Client since 2018',
        content: 'The training we received was excellent. Our staff now operates all equipment with complete confidence and efficiency.',
        rating: 5,
      },
      {
        name: 'SUR Poultry Production',
        role: 'Client since 2020',
        content: 'The import service allowed us to access cutting-edge European technology. Post-sales support is exceptional.',
        rating: 5,
      },
      {
        name: 'Granjas Unidos',
        role: 'Client since 2019',
        content: 'I highly recommend 3P. Their technical knowledge and personalized attention make all the difference.',
        rating: 5,
      },
    ],
  };

  const currentTestimonials = testimonials[language] || testimonials.es;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentTestimonials.length]);

  const goTo = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prev = () => {
    goTo((currentIndex - 1 + currentTestimonials.length) % currentTestimonials.length);
  };

  const next = () => {
    goTo((currentIndex + 1) % currentTestimonials.length);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-p3-red/10 text-p3-red text-sm font-semibold rounded-full mb-4">
            {language === 'es' ? 'Testimonios' : 'Testimonials'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white">
            {language === 'es' ? 'Lo que dicen nuestros ' : 'What our '}{' '}
            <span className="text-p3-red">{language === 'es' ? 'clientes' : 'clients say'}</span>
          </h2>
        </div>

        {/* Carrusel */}
        <div className="relative">
          {/* Tarjeta principal */}
          <div className="relative bg-gradient-to-br from-p3-gray to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            {/* Decoración */}
            <Quote className="absolute top-8 right-8 w-24 h-24 text-p3-red/10" />
            
            {/* Contenido */}
            <div className="relative z-10">
              {/* Estrellas */}
              <div className="flex gap-1 mb-6">
                {[...Array(currentTestimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Texto */}
              <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed min-h-[100px]">
                "{currentTestimonials[currentIndex].content}"
              </blockquote>

              {/* Autor */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-p3-red to-p3-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {currentTestimonials[currentIndex].name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-p3-dark dark:text-white">
                    {currentTestimonials[currentIndex].name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentTestimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-p3-dark dark:text-white hover:bg-p3-red hover:text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {currentTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-p3-red'
                      : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-p3-dark dark:text-white hover:bg-p3-red hover:text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
