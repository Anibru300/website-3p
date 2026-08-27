import { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchMe,
  loginUser as apiLogin,
  removeToken,
  setToken,
  verifyTotp as apiVerifyTotp,
} from '../utils/api';

const AuthContext = createContext(null);

function getInitialToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cjos_token');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getInitialToken());
  const [error, setError] = useState(null);
  const [totpStep, setTotpStep] = useState(null);

  useEffect(() => {
    const token = getInitialToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password, remember = false) => {
    setError(null);
    setTotpStep(null);
    try {
      const data = await apiLogin(username, password, remember);
      if (data.requires_totp) {
        setTotpStep({ email: data.user.email, tempToken: data.temp_token });
        return { success: false, requiresTotp: true };
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      return { success: false, error: err.message };
    }
  };

  const verifyTotp = async (code) => {
    setError(null);
    if (!totpStep) {
      return { success: false, error: 'No hay sesión de verificación activa' };
    }
    try {
      const data = await apiVerifyTotp(totpStep.email, totpStep.tempToken, code);
      setUser(data.user);
      setTotpStep(null);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Código incorrecto');
      return { success: false, error: err.message };
    }
  };

  const cancelTotp = () => {
    setTotpStep(null);
    setError(null);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTotpStep(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        verifyTotp,
        cancelTotp,
        logout,
        totpStep,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
