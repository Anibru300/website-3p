import { useState, useEffect } from 'react';
import { Header } from './components/layout';
import HomePage from './pages/HomePage';
import ChoreTimePage from './pages/ChoreTimePage';
import MsSchippersPage from './pages/MsSchippersPage';
import GenericBrandPage from './pages/GenericBrandPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CotizadorPage from './pages/CotizadorPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { trackEvent } from './utils/api';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-p3-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  if (!user || user.rol !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }
  return children;
}

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });
  }, [route]);

  // Parse route: separate path from query string
  const cleanRoute = route || '/';
  const [pathPart] = cleanRoute.split('?'); // Get only the path part, ignore query string
  const segments = pathPart.split('/').filter(Boolean);

  // Scroll a sección cuando la ruta apunta a un ancla de HomePage
  useEffect(() => {
    const homeSections = ['inicio', 'nosotros', 'servicios', 'marcas', 'catalogos', 'contacto'];
    const hash = window.location.hash ? window.location.hash.slice(1) : '';
    const sectionId = hash || segments[0];

    if (homeSections.includes(sectionId)) {
      const scrollToId = (id) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToId(sectionId)) {
        // Si la sección aún no está renderizada, esperamos un poco
        const t = setTimeout(() => scrollToId(sectionId), 150);
        return () => clearTimeout(t);
      }
    } else if (segments[0] === 'marcas' && segments[1]) {
      // En subpáginas de marca, scrollear al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [segments]);

  let content = <HomePage />;
  let showHeader = true;
  let mainClass = 'pt-[136px]';

  if (segments[0] === 'login') {
    content = <LoginPage />;
    showHeader = false;
    mainClass = '';
  } else if (segments[0] === 'dashboard') {
    content = (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    );
    showHeader = false;
    mainClass = '';
  } else if (segments[0] === 'cotizador') {
    content = (
      <ProtectedRoute>
        <CotizadorPage />
      </ProtectedRoute>
    );
    showHeader = false;
    mainClass = '';
  } else if (segments[0] === 'admin') {
    content = (
      <ProtectedRoute>
        <AdminGuard>
          <AdminPage />
        </AdminGuard>
      </ProtectedRoute>
    );
    showHeader = false;
    mainClass = '';
  } else if (segments[0] === 'marcas') {
    const brandId = segments[1];
    if (brandId === 'chore-time') {
      // Chore-Time no es distribuidor autorizado; no publicar
      content = <HomePage />;
    } else if (brandId === 'ms-schippers') {
      content = <MsSchippersPage />;
    } else if (brandId) {
      content = <GenericBrandPage brandId={brandId} />;
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        {showHeader && <Header />}
        <main className={mainClass}>{content}</main>
      </div>
    </ToastProvider>
  );
}

export default App;
