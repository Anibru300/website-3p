import { Truck, Wrench, GraduationCap, Headphones, Package, Globe } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Package,
      title: 'Venta de Equipos',
      description: 'Distribución de equipos de alta calidad para la industria avícola, porcícola e invernaderos. Contamos con inventario en stock para entrega inmediata.',
      features: ['Ventiladores', 'Comederos automáticos', 'Bebederos', 'Sistemas de calefacción'],
    },
    {
      icon: Truck,
      title: 'Importaciones',
      description: 'Especialistas en importación de equipos desde Europa y Norteamérica. Manejamos divisas en Dólares y Euros con proveedores confiables.',
      features: ['Europa (Holanda, Alemania, Francia, Dinamarca)', 'Estados Unidos', 'Logística integral', 'Aduana y trámites'],
    },
    {
      icon: Globe,
      title: 'Exportaciones',
      description: 'Atendemos clientes en Centroamérica y Sudamérica con equipos de la más alta calidad para proyectos avícolas internacionales.',
      features: ['Centroamérica', 'Sudamérica', 'Asesoría técnica', 'Soporte remoto'],
    },
    {
      icon: Wrench,
      title: 'Instalación y Montaje',
      description: 'Servicio profesional de instalación y puesta en marcha de todos nuestros equipos por técnicos altamente calificados.',
      features: ['Instalación profesional', 'Puesta en marcha', 'Pruebas de funcionamiento', 'Certificación'],
    },
    {
      icon: GraduationCap,
      title: 'Capacitación',
      description: 'Capacitamos al personal del cliente en el funcionamiento y manejo adecuado de los sistemas instalados.',
      features: ['Operación de equipos', 'Mantenimiento preventivo', 'Troubleshooting', 'Mejores prácticas'],
    },
    {
      icon: Headphones,
      title: 'Servicio Postventa',
      description: 'Acompañamiento continuo con servicio técnico especializado y atención personalizada para garantizar el óptimo funcionamiento.',
      features: ['Soporte técnico', 'Refacciones originales', 'Mantenimiento', 'Garantía extendida'],
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-p3-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-blue/10 text-p3-blue text-sm font-semibold rounded-full mb-4">
            Nuestros Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-p3-dark mb-4">
            Soluciones integrales para su granja
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Ofrecemos un servicio completo que incluye desde la asesoría inicial hasta el soporte postventa, 
            garantizando la satisfacción total de nuestros clientes.
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-p3-red to-p3-red-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <service.icon className="text-white" size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-p3-dark mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-p3-red rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Banner de tiempos de entrega */}
        <div className="mt-16 bg-gradient-to-r from-p3-blue to-p3-blue-light rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Tiempos de Entrega</h3>
              <p className="text-gray-100 mb-4">
                Los plazos pactados con el cliente dependen de la disponibilidad en stock. 
                Si el material está disponible, la entrega se realiza a la brevedad posible.
              </p>
              <p className="text-gray-100">
                Si no se cuenta con el material solicitado, se pacta un plazo estimado 
                que oscila entre <strong>4 a 8 semanas</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <span className="block text-4xl font-bold mb-2">Inmediata</span>
                <span className="text-sm opacity-90">Si hay stock</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <span className="block text-4xl font-bold mb-2">4-8</span>
                <span className="text-sm opacity-90">Semanas si no hay stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
