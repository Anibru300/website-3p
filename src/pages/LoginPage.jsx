import { useState } from 'react';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!username.trim() || !password.trim()) {
      setLocalError('Ingresa usuario y contraseña');
      return;
    }
    setIsSubmitting(true);
    const result = await login(username.trim(), password);
    setIsSubmitting(false);
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setLocalError(result.error || 'Credenciales incorrectas');
    }
  };

  const displayError = localError || error;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-p3-blue">
      {/* Fondo con gradiente animado y formas decorativas */}
      <div className="absolute inset-0 bg-gradient-to-br from-p3-blue via-[#162B6F] to-p3-red-dark" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(196,30,58,0.35),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.25),transparent_50%)]" />
      
      {/* Círculos decorativos flotantes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-p3-red/10 blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-400/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      {/* Patrón de puntos sutil */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Card principal */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/25 border border-white/20 overflow-hidden">
          {/* Header con logo */}
          <div className="relative bg-gradient-to-br from-p3-blue to-[#162B6F] px-8 pt-10 pb-12 text-center overflow-hidden">
            {/* Brillo decorativo en el header */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-p3-red/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3 mb-5 ring-4 ring-white/10">
                <img
                  src="/logo.png"
                  alt="3P Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-p3-red font-bold text-2xl">3P</span>';
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Portal Operativo 3P
              </h1>
              <p className="text-blue-100/90 text-sm mt-2 font-medium">
                Acceso para usuarios autorizados
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {displayError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm animate-fade-in-up">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <span className="leading-relaxed">{displayError}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-p3-red transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red focus:bg-white transition-all duration-200"
                    placeholder="admin, almacen, ventas..."
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-p3-red transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-p3-red/20 focus:border-p3-red focus:bg-white transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-p3-red to-p3-red-dark hover:from-[#B91C36] hover:to-[#8A1929] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-p3-red/25 hover:shadow-xl hover:shadow-p3-red/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>{isSubmitting ? 'Ingresando...' : 'Ingresar al portal'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              Si olvidaste tus credenciales, contacta al administrador del sistema.
            </p>
          </form>
        </div>

        {/* Link para volver */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white font-medium transition-colors hover:underline underline-offset-4"
          >
            <ArrowLeft size={16} />
            Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
}
