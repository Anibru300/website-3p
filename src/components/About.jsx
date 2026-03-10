import { Target, Eye, Heart, Award, CheckCircle } from 'lucide-react';

const About = () => {
  const values = [
    { icon: Heart, title: 'Responsabilidad', desc: 'Compromiso total con nuestros clientes' },
    { icon: CheckCircle, title: 'Servicio al Cliente', desc: 'Atención personalizada en todo momento' },
    { icon: Users, title: 'Trabajo en Equipo', desc: 'Colaboración para mejores resultados' },
    { icon: Globe, title: 'Respeto', desc: 'A los compañeros y al medio ambiente' },
  ];

  const recognitions = [
    'ANECA (Asociación Nacional de Especialistas en Ciencias Avícolas)',
    'SENAPROA (Sección Nacional de Progenitores de Aves de la UNA)',
    'ALEASEN (Asociación de Especialistas en Ciencias Avícolas del Centro de México)',
    'ALA (Asociación Latinoamericana de Avicultura de El Salvador)',
    'AMVEAV (Asociación de Médicos Veterinarios Especialistas en Aves)',
    'AVEM (Congreso Internacional de Aviespecialistas)',
    'IPPE (International Production & Processing Expo)',
  ];

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-p3-red/10 text-p3-red text-sm font-semibold rounded-full mb-4">
            Sobre Nosotros
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-p3-dark mb-4">
            Más de 27 años de experiencia
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Somos una empresa mexicana dedicada a la distribución de equipos para la industria avícola, 
            porcícola e invernaderos, ofreciendo las mejores marcas mundiales.
          </p>
        </div>

        {/* Historia */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-p3-blue to-p3-red rounded-2xl p-1">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <img 
                    src="/images/logo-3p-login.png" 
                    alt="3P Logo" 
                    className="w-3/4 h-3/4 object-contain"
                    onError={(e) => {
                      e.target.src = '/logo.png';
                    }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-p3-red text-white p-6 rounded-2xl shadow-xl">
                <span className="text-4xl font-bold">1997</span>
                <p className="text-sm opacity-90">Año de fundación</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-p3-dark mb-4">Nuestra Historia</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              <strong>3P S.A. DE C.V.</strong> fue fundada en el año de 1997 por el señor <strong>Valentino Pierangeli</strong> 
              con la visión de establecer una empresa que realizara alianzas comerciales con los productores de pollo.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              El significado de 3P es <em>"Parner de los Productores de Pollos"</em>. En la época que se fundó, 
              no existía ninguna otra empresa con esta visión en México.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Desde sus inicios, la intención fue representar marcas internacionales de equipos para producir aves 
              con apoyo de alta tecnología y en ambientes controlados provenientes de Europa.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-p3-gray rounded-xl">
                <span className="block text-2xl font-bold text-p3-red">2010</span>
                <span className="text-sm text-gray-600">Nos establecimos en nuestra ubicación actual en León, Gto.</span>
              </div>
              <div className="p-4 bg-p3-gray rounded-xl">
                <span className="block text-2xl font-bold text-p3-blue">10+</span>
                <span className="text-sm text-gray-600">Empleados en operaciones generales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-p3-blue to-p3-blue-light p-8 rounded-2xl text-white">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Misión</h3>
            <p className="text-gray-100 leading-relaxed">
              Somos la empresa con la más alta tecnología dedicada a brindar apoyo para la crianza, 
              reproducción de pollos de engorda y cerdos. Proveemos a las empresas avícolas con la 
              más alta tecnología y eficiencia, generando las mejores expectativas de equipamiento 
              para nuestros clientes.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-p3-red to-p3-red-dark p-8 rounded-2xl text-white">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Eye size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Visión</h3>
            <p className="text-gray-100 leading-relaxed">
              Ser una empresa líder en la automatización de casetas avícolas, ofreciendo servicio, 
              soporte, acompañamiento de calidad e innovación en las marcas que distribuimos. 
              Ejerciendo día a día nuestro lema: <em>"Servicio, soporte, acompañamiento en todo momento y todo lugar"</em>.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-p3-dark text-center mb-10">Nuestros Valores</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="p-6 bg-p3-gray rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-p3-red/10 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="text-p3-red" size={24} />
                </div>
                <h4 className="font-semibold text-p3-dark mb-2">{value.title}</h4>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reconocimientos */}
        <div className="bg-p3-gray rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-p3-dark text-center mb-8 flex items-center justify-center gap-3">
            <Award className="text-p3-red" size={28} />
            Reconocimientos y Membresías
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recognitions.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Importar iconos adicionales
import { Users, Globe } from 'lucide-react';

export default About;
