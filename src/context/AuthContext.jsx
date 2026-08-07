import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, loginUser as apiLogin, removeToken, setToken } from '../utils/api';

const AuthContext = createContext(null);

function getInitialToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cjos_token');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getInitialToken());
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getInitialToken();
    if (!token) return;

    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      setToken(data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
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
