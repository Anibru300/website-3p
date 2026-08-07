import { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, User, Mail, Building2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../context/LanguageContext';
import { useToast, FadeInSection } from '../ui';

// Configuración de EmailJS (misma cuenta que el formulario de cotización)
const EMAILJS_SERVICE_ID = 'service_3prclaq';
const EMAILJS_TEMPLATE_ID = 'template_y153mic';
const EMAILJS_PUBLIC_KEY = 'bZ5Pz4T6UhA3cDcU1';

const ReviewForm = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    comment: '',
    rating: 0,
    website: '', // honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      addToast(t('reviews.errorName'), 'error');
      return false;
    }
    if (formData.rating === 0) {
      addToast(t('reviews.errorRating'), 'error');
      return false;
    }
    if (!formData.comment.trim()) {
      addToast(t('reviews.errorComment'), 'error');
      return false;
    }
    if (formData.email.trim() && !formData.email.includes('@')) {
      addToast(t('reviews.errorEmail'), 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot: si este campo oculto tiene valor, es un bot
    if (formData.website) return;

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: formData.name.trim(),
        from_email: formData.email.trim() || 'No proporcionado',
        reply_to: formData.email.trim() || '',
        company: formData.company.trim() || 'No proporcionada',
        rating: formData.rating,
        message: formData.comment.trim(),
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      setFormData({ name: '', email: '', company: '', comment: '', rating: 0, website: '' });
      addToast(t('reviews.thanks'), 'success');
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      addToast(t('reviews.errorSend'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="resenas" className="py-20 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-p3-red/10 text-p3-red rounded-full text-sm font-semibold mb-4">
            <MessageSquare size={18} />
            {t('reviews.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('reviews.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t('reviews.subtitle')}
          </p>
        </FadeInSection>

        <FadeInSection delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot: campo oculto para detectar bots */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 top-0 left-0 h-0 w-0"
              />
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.nameLabel')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('reviews.placeholderName')}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('reviews.placeholderEmail')}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.companyLabel')}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('reviews.placeholderCompany')}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-p3-red focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Calificación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.ratingLabel')}
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
                  {t('reviews.commentLabel')}
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder={t('reviews.placeholderComment')}
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
                    {t('reviews.submit')}
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
