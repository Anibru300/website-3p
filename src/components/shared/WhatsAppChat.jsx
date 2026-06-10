import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

// Logo SVG de WhatsApp
const WhatsAppLogo = ({ size = 28, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phoneNumber = '524771284661';
  const defaultMessage = 'Hola, me interesa información sobre sus productos.';

  useEffect(() => {
    // Mostrar burbuja después de 5 segundos
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Ventana de chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in-up">
          {/* Header */}
          <div className="bg-[#25D366] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <WhatsAppLogo className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-white font-semibold">3P S.A. DE C.V.</h4>
                <p className="text-white/80 text-xs">En línea</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mensaje */}
          <div className="p-4 bg-[#E5DDD5] min-h-[120px]">
            <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
              <p className="text-gray-700 text-sm">
                ¡Hola! 👋 ¿En qué podemos ayudarte? Escríbenos y un asesor te atenderá personalmente.
              </p>
              <span className="text-gray-400 text-xs mt-1 block">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#25D366]"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Abrir chat de WhatsApp"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <>
            <WhatsAppLogo size={28} />
            {/* Badge de notificación */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default WhatsAppChat;
