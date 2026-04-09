import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FloatingWhatsApp = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneNumber = '5214771284661';
    const defaultMessage = language === 'es' 
      ? 'Hola, me interesa obtener más información sobre sus productos.'
      : 'Hello, I am interested in obtaining more information about your products.';
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      {/* Chat Window */}
      <div className={`mb-4 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-80 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold">3P S.A. DE C.V.</h4>
                <p className="text-green-100 text-xs">{t('whatsapp.online')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Chat Area */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[120px]">
            <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {t('whatsapp.greeting')}
              </p>
              <span className="text-gray-400 dark:text-gray-500 text-xs mt-1 block">
                {language === 'es' ? 'Ahora' : 'Now'}
              </span>
            </div>
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('whatsapp.placeholder')}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
        
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <>
            <MessageCircle className="text-white" size={28} />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
          </>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t('whatsapp.tooltip')}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
