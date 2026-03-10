import { Phone, Mail, MapPin, Clock, Send, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfonos',
      lines: ['(477) 774-83-23', '(477) 774-83-26'],
      href: 'tel:+524777748323',
    },
    {
      icon: Mail,
      title: 'Correo Electrónico',
      lines: ['trespsadecv@hotmail.com'],
      href: 'mailto:trespsadecv@hotmail.com',
    },
    {
      icon: MapPin,
      title: 'Dirección',
      lines: [
        'Industrial del Norte 201',
        'Fracc. Industrial Del Norte',
        'CP. 37200, León, Guanajuato',
      ],
      href: '#',
    },
    {
      icon: Clock,
      title: 'Horario de Atención',
      lines: ['Lunes a Viernes: 9:00 - 18:00', 'Sábado: 9:00 - 13:00'],
      href: '#',
    },
  ];

  const services = [
    'Venta de Equipos',
    'Importación',
    'Exportación',
    'Instalación',
    'Servicio Técnico',
    'Refacciones',
    'Otro',
  ];

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-red/10 text-p3-red text-sm font-semibold rounded-full mb-4">
            Contacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-p3-dark mb-4">
            ¿Listo para mejorar tu granja?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Contáctanos hoy mismo y uno de nuestros asesores te atenderá con gusto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div>
            <h3 className="text-2xl font-bold text-p3-dark mb-8">Información de Contacto</h3>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="group p-6 bg-p3-gray rounded-xl hover:bg-p3-blue hover:text-white transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <info.icon className="text-p3-red group-hover:text-white" size={24} />
                  </div>
                  <h4 className="font-semibold mb-2">{info.title}</h4>
                  {info.lines.map((line, idx) => (
                    <p key={idx} className="text-sm text-gray-600 group-hover:text-white/90">{line}</p>
                  ))}
                </a>
              ))}
            </div>

            {/* Mapa (placeholder) */}
            <div className="bg-p3-gray rounded-2xl overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.0!2d-101.65!3d21.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA3JzEyLjAiTiAxMDHCsDM5JzAwLjAiVw!5e0!3m2!1ses!2smx!4v1600000000000!5m2!1ses!2smx"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(20%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación 3P"
              ></iframe>
            </div>
          </div>

          {/* Formulario */}
          <div>
            <h3 className="text-2xl font-bold text-p3-dark mb-8">Solicita una Cotización</h3>
            
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-green-600" size={32} />
                </div>
                <h4 className="text-xl font-bold text-green-800 mb-2">¡Mensaje Enviado!</h4>
                <p className="text-green-700 mb-6">
                  Gracias por contactarnos. Un asesor se comunicará contigo en breve.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all"
                      placeholder="(477) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicio de interés
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all bg-white"
                  >
                    <option value="">Selecciona un servicio</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare size={16} className="inline mr-1" />
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red outline-none transition-all resize-none"
                    placeholder="Cuéntanos sobre tu proyecto o necesidad..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-p3-red text-white font-semibold rounded-xl hover:bg-p3-red-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
