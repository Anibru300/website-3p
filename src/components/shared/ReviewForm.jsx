import { useState } from 'react';
import { Star, Send, MessageSquare, User, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../ui';
import { FadeInSection } from '../ui';

const ReviewForm = () => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const texts = {
    es: {
      badge: 'Tu opinión nos importa',
      title: '¿Quieres dejar una reseña?',
      subtitle: 'Déjanos tus comentarios o sugerencias sobre la página web. Próximamente las recibiremos en nuestro correo.',
      nameLabel: 'Nombre completo',
      emailLabel: 'Correo electrónico',
      commentLabel: 'Comentario o reseña',
      ratingLabel: 'Calificación',
      placeholderName: 'Tu nombre',
      placeholderEmail: 'tu@email.com',
      placeholderComment: 'Escribe aquí tu comentario o sugerencia...',
      submit: 'Enviar comentario',
      submitting: 'Enviando...',
      thanks: '¡Gracias por tu comentario!',
      thanksText: 'Próximamente estará activo el envío por correo.',
    },
    en: {
      badge: 'Your opinion matters',
      title: 'Want to leave a review?',
      subtitle: 'Leave us your comments or suggestions about the website. Soon we will receive them in our email.',
      nameLabel: 'Full name',
      emailLabel: 'Email address',
      commentLabel: 'Comment or review',
      ratingLabel: 'Rating',
      placeholderName: 'Your name',
      placeholderEmail: 'your@email.com',
      placeholderComment: 'Write your comment or suggestion here...',
      submit: 'Send comment',
      submitting: 'Sending...',
      thanks: 'Thank you for your comment!',
      thanksText: 'Email delivery will be active soon.',
    },
  };

  const t = texts[language] || texts.es;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      addToast(language === 'es' ? 'Por favor completa todos los campos' : 'Please complete all fields', 'error');
      return;
    }

    if (!formData.email.includes('@')) {
      addToast(language === 'es' ? 'Por favor ingresa un correo válido' : 'Please enter a valid email', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulación de envío: próximamente se conectará con el servicio de correo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setFormData({ name: '', email: '', comment: '', rating: 0 });
    addToast(t.thanks, 'success');
  };

  return (
    <section id="resenas" className="py-20 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-p3-red/10 text-p3-red rounded-full text-sm font-semibold mb-4">
            <MessageSquare size={18} />
            {t.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t.subtitle}
          </p>
        </FadeInSection>

        <FadeInSection delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.placeholderName}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.placeholderEmail}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Calificación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.ratingLabel}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`${star} estrellas`}
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.commentLabel}
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder={t.placeholderComment}
                  rows={5}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-p3-red hover:bg-p3-red-dark text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    {t.submit}
                  </>
                )}
              </button>
            </form>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ReviewForm;
