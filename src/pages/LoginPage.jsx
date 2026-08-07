import { useState } from 'react';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-p3-blue px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white">Portal 3P</h1>
            <p className="text-blue-100 text-sm mt-1">Acceso para usuarios autorizados</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {localError || error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-all"
                  placeholder="admin, almacen, ventas..."
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-p3-red hover:bg-p3-red-dark disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              <ArrowRight size={18} />
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Si olvidaste tus credenciales, contacta al administrador del sistema.
            </p>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-p3-blue hover:text-p3-red transition-colors">
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
}
