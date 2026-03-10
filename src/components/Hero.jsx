import { ArrowRight, Globe, Award, Users } from 'lucide-react';

const Hero = () => {
  const stats = [
    { icon: Award, value: '27+', label: 'Años de Experiencia' },
    { icon: Globe, value: '10+', label: 'Países Atendidos' },
    { icon: Users, value: '50+', label: 'Clientes Satisfechos' },
  ];

  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-p3-blue via-p3-blue to-p3-red opacity-95"></div>
      
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Círculos decorativos */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-p3-red/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido */}
          <div className="text-white animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Líderes en tecnología avícola desde 1997
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Tecnología de punta para la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                industria avícola
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-xl">
              Distribuidores autorizados de las mejores marcas europeas y americanas. 
              Ventilación, bebederos, comederos y sistemas de climatización para aves y cerdos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-p3-red text-white font-semibold rounded-xl hover:bg-p3-red-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Solicitar Cotización
                <ArrowRight size={20} />
              </a>
              <a
                href="#marcas"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Ver Marcas
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <stat.icon className="text-yellow-300" size={20} />
                    <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen/Ilustración */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Círculo principal */}
              <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <img 
                  src="/images/logo-3p-login.png" 
                  alt="3P Logo" 
                  className="w-64 h-64 object-contain animate-fade-in"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
              
              {/* Elementos flotantes */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-p3-red rounded-2xl flex items-center justify-center shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <span className="text-2xl font-bold text-white">27</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-p3-blue">ISO</span>
                  <span className="text-xs text-gray-500">Calidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onda inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
