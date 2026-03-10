import { Quote, Building2, MapPin } from 'lucide-react';

const Clients = () => {
  const nationalClients = [
    { name: 'Avícola San Andrés', contact: 'Lic. Luis Fernando Sandoval', location: 'México' },
    { name: "Pilgrim's Pride", contact: 'Enrique Cano Jimenez', location: 'México' },
    { name: 'Grupo Pecuario San Antonio', contact: 'Ing. Adrian Castro', location: 'México' },
    { name: 'Gallina Pesada S.A.P.I.', contact: 'MVZ Mario Gabilondo', location: 'México' },
    { name: 'Avícola y Porcícola de los Altos', contact: 'LAF. Delia Palos de Alba', location: 'México' },
    { name: 'Aparcerías Avícolas', contact: 'Varios', location: 'México' },
  ];

  const internationalClients = [
    { name: 'A&M Inversiones S.A.', location: 'El Salvador' },
    { name: 'Hongos del Pilar', location: 'Argentina' },
    { name: 'Pat Fitz Mushrooms', location: 'California, USA' },
    { name: 'Cooperativa Integral de Producción', location: 'Guatemala' },
    { name: 'MCH Equavic EIRL', location: 'Sudamérica' },
    { name: 'Agronegocios de Guatemala S.A.', location: 'Guatemala' },
  ];

  const testimonials = [
    {
      text: '3P ha sido nuestro proveedor de confianza por más de 10 años. Su servicio técnico y la calidad de los equipos FANCOM y LANDMECO han sido fundamentales para nuestro crecimiento.',
      author: 'Ing. Adrian Castro',
      company: 'Grupo Pecuario San Antonio',
    },
    {
      text: 'La atención personalizada y el soporte postventa que nos brinda 3P es excepcional. Siempre están disponibles cuando los necesitamos.',
      author: 'Lic. Luis Fernando Sandoval',
      company: 'Avícola San Andrés',
    },
    {
      text: 'Excelente servicio de importación. Los tiempos de entrega son cumplidos y el asesoramiento técnico es de primer nivel.',
      author: 'MVZ Mario Gabilondo',
      company: 'Gallina Pesada',
    },
  ];

  return (
    <section id="clientes" className="py-20 bg-p3-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-blue/10 text-p3-blue text-sm font-semibold rounded-full mb-4">
            Nuestros Clientes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-p3-dark mb-4">
            Empresas que confían en nosotros
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Atendemos a las principales empresas avícolas y porcícolas de México y Centroamérica.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <span className="block text-4xl font-bold text-p3-red mb-2">50+</span>
            <span className="text-gray-600">Clientes Nacionales</span>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <span className="block text-4xl font-bold text-p3-blue mb-2">6+</span>
            <span className="text-gray-600">Países</span>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <span className="block text-4xl font-bold text-p3-red mb-2">100+</span>
            <span className="text-gray-600">Proyectos</span>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <span className="block text-4xl font-bold text-p3-blue mb-2">27</span>
            <span className="text-gray-600">Años de relaciones</span>
          </div>
        </div>

        {/* Clientes Nacionales */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-p3-dark mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-p3-red/10 rounded-lg flex items-center justify-center">
              <Building2 className="text-p3-red" size={20} />
            </div>
            Clientes Nacionales
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nationalClients.map((client, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-p3-dark mb-1">{client.name}</h4>
                <p className="text-sm text-p3-blue mb-2">{client.contact}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  <span>{client.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes Internacionales */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-p3-dark mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-p3-blue/10 rounded-lg flex items-center justify-center">
              <MapPin className="text-p3-blue" size={20} />
            </div>
            Clientes Internacionales
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {internationalClients.map((client, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-p3-dark mb-1">{client.name}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  <span>{client.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonios */}
        <div>
          <h3 className="text-2xl font-bold text-p3-dark text-center mb-10">
            Lo que dicen nuestros clientes
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm relative">
                <Quote className="absolute top-6 right-6 text-p3-red/20" size={40} />
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-p3-dark">{testimonial.author}</p>
                  <p className="text-sm text-p3-blue">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
