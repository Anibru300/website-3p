import { Phone, Mail, MapPin, Clock, Send, User, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FadeInSection from './FadeInSection';
import { useToast } from './Toast';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Toast de "Enviando..."
    addToast(language === 'es' ? 'Enviando mensaje...' : 'Sending message...', 'info', 2000);
    
    try {
      // CONFIGURACIÓN EMAILJS
      // Para que funcione, necesitas:
      // 1. Crear cuenta gratuita en https://www.emailjs.com/
      // 2. Crear un servicio de email (Gmail, Outlook, etc.)
      // 3. Crear una plantilla con las variables: {{name}}, {{company}}, {{email}}, {{phone}}, {{service}}, {{message}}
      // 4. Reemplazar los valores de abajo con tus datos reales
      
      const serviceId = 'TU_SERVICE_ID'; // Reemplazar con tu Service ID de EmailJS
      const templateId = 'TU_TEMPLATE_ID'; // Reemplazar con tu Template ID de EmailJS
      const publicKey = 'TU_PUBLIC_KEY'; // Reemplazar con tu Public Key de EmailJS
      
      const templateParams = {
        from_name: formData.name,
        company: formData.company || 'No especificada',
        email: formData.email,
        phone: formData.phone || 'No proporcionado',
        service: formData.service || 'No especificado',
        message: formData.message,
        to_email: 'trespsadecv@hotmail.com',
      };
      
      // Si no has configurado EmailJS, simulamos el envío exitoso
      if (serviceId === 'TU_SERVICE_ID') {
        // Simulación de envío (para demostración)
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Datos que se enviarían:', templateParams);
      } else {
        // Envío real con EmailJS
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Toast de éxito
      addToast(
        language === 'es' 
          ? '¡Cotización enviada con éxito! Te contactaremos en menos de 24 horas.' 
          : 'Quote sent successfully! We will contact you within 24 hours.',
        'success',
        5000
      );
      
      // Limpiar formulario
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      
      // Resetear estado después de 5 segundos
      setTimeout(() => setIsSubmitted(false), 5000);
      
    } catch (error) {
      console.error('Error al enviar:', error);
      setIsSubmitting(false);
      
      // Toast de error
      addToast(
        language === 'es' 
          ? 'Error al enviar. Por favor intenta de nuevo o contáctanos por teléfono.' 
          : 'Error sending. Please try again or contact us by phone.',
        'error',
        5000
      );
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.phones'),
      lines: ['+52 1 477 128 4661', '+52 1 479 229 8907', '+52 1 479 229 8904'],
      href: 'tel:+524777748323',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      icon: Mail,
      title: t('contact.email'),
      lines: ['trespsadecv@hotmail.com'],
      href: 'mailto:trespsadecv@hotmail.com',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: MapPin,
      title: t('contact.address'),
      lines: [
        'Industrial del Norte 201',
        'Fracc. Industrial Del Norte',
        'CP. 37200, León, Guanajuato',
      ],
      href: 'https://maps.google.com/?q=3P+S.A.+DE+C.V.+León+Guanajuato',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      icon: Clock,
      title: t('contact.hours'),
      lines: [t('contact.schedule1'), t('contact.schedule2')],
      href: '#',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  const services = [
    t('services.equipment'),
    t('services.import'),
    t('services.export'),
    'Instalación',
    'Servicio Técnico',
    'Refacciones',
    'Otro',
  ];

  return (
    <section id="contacto" className="py-20 relative overflow-hidden transition-colors duration-300">
      {/* Fondo transparente - los animalitos del fondo global se verán aquí */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-red/10 dark:bg-p3-red/20 text-p3-red text-sm font-semibold rounded-full mb-4">
            {t('contact.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-p3-dark dark:text-white mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t('contact.subtitle')}
          </p>
        </FadeInSection>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto y Mapa */}
          <FadeInSection direction="left">
            <div>
              <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-8">{t('contact.info')}</h3>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {contactInfo.map((info, index) => (
                  <a
                    key={index}
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group p-6 bg-p3-gray dark:bg-gray-800 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
                  >
                    <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <info.icon size={24} />
                    </div>
                    <h4 className="font-semibold text-p3-dark dark:text-white mb-2">{info.title}</h4>
                    {info.lines.map((line, idx) => (
                      <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">{line}</p>
                    ))}
                  </a>
                ))}
              </div>

              {/* Mapa con logo de 3P */}
              <div className="relative bg-p3-gray dark:bg-gray-800 rounded-2xl overflow-hidden h-80 shadow-inner">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.719511762588!2d-101.66519028952585!3d21.163557880438436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bbf2aeaddd35f%3A0x7a45b03e8cdfd947!2s3P%20S.A.%20DE%20C.V.!5e0!3m2!1sen!2smx!4v1773249826301!5m2!1sen!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(20%)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación 3P"
                ></iframe>
                
                {/* Logo de 3P superpuesto en el mapa */}
                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-xl p-2 shadow-lg flex items-center gap-2">
                  <img 
                    src="images/logo-3p-header.png" 
                    alt="3P Logo" 
                    className="h-10 w-auto"
                  />
                  <div className="pr-2">
                    <p className="text-xs font-bold text-p3-dark dark:text-white">3P S.A. DE C.V.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">León, Gto.</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Formulario */}
          <FadeInSection direction="right">
            <div>
              <h3 className="text-2xl font-bold text-p3-dark dark:text-white mb-8">{t('contact.form')}</h3>
              
              {isSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center animate-scale-in">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">{t('contact.success')}</h4>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    {t('contact.successText')}
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User size={16} className="inline mr-1" />
                        {t('contact.formFields.name')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-p3-red transition-all duration-300 ${focusedField === 'name' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.formFields.company')}
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('company')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={language === 'es' ? 'Nombre de tu empresa' : 'Your company name'}
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-p3-red transition-all duration-300 ${focusedField === 'company' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail size={16} className="inline mr-1" />
                        {t('contact.formFields.email')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="email@example.com"
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-p3-red transition-all duration-300 ${focusedField === 'email' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone size={16} className="inline mr-1" />
                        {t('contact.formFields.phone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="(477) 000-0000"
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-p3-red transition-all duration-300 ${focusedField === 'phone' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.formFields.service')}
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="">{t('contact.formFields.selectService')}</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare size={16} className="inline mr-1" />
                      {t('contact.formFields.message')} *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={language === 'es' ? 'Cuéntanos sobre tu proyecto o necesidad...' : 'Tell us about your project or needs...'}
                    ></textarea>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-p3-red transition-all duration-300 ${focusedField === 'message' ? 'w-full' : 'w-0'}`}></div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full py-4 bg-gradient-to-r from-p3-red to-p3-red-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-p3-red/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {t('contact.sending')}
                      </>
                    ) : (
                      <>
                        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                        {t('contact.send')}
                        <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;
