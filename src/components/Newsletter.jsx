import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useToast } from './Toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      addToast('Por favor ingresa un correo válido', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simular envío (aquí conectarías con tu servicio de email)
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
    addToast('¡Gracias por suscribirte! Recibirás nuestras novedades.', 'success');

    // Reset después de 3 segundos
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-p3-blue to-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
          <Mail className="text-white" size={32} />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Suscríbete a nuestro boletín
        </h2>
        
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          Recibe las últimas novedades, catálogos actualizados, promociones especiales y 
          consejos técnicos directamente en tu correo.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-white bg-white/10 rounded-2xl p-6 max-w-md mx-auto">
            <CheckCircle size={32} className="text-green-400" />
            <div className="text-left">
              <p className="font-semibold">¡Suscripción exitosa!</p>
              <p className="text-sm text-white/70">Gracias por unirte a nuestra comunidad.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-white/30 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-p3-red hover:bg-p3-red-dark text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Suscribirme
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-white/60 text-sm mt-6">
          No enviamos spam. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
