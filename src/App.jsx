import { useState, useEffect } from 'react';
import { Header } from './components/layout';
import HomePage from './pages/HomePage';
import ChoreTimePage from './pages/ChoreTimePage';
import FancomPage from './pages/FancomPage';
import GenericBrandPage from './pages/GenericBrandPage';
import { ToastProvider } from './components/ui/Toast';

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse route: separate path from query string
  const cleanRoute = route || '/';
  const [pathPart] = cleanRoute.split('?'); // Get only the path part, ignore query string
  const segments = pathPart.split('/').filter(Boolean);

  // Scroll a sección cuando la ruta apunta a un ancla de HomePage
  useEffect(() => {
    const homeSections = ['inicio', 'marcas', 'catalogos', 'contacto'];
    const sectionId = segments[0];

    if (homeSections.includes(sectionId)) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Si la sección aún no está renderizada, esperamos un poco
        const t = setTimeout(() => {
          const retry = document.getElementById(sectionId);
          if (retry) retry.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(t);
      }
    } else if (segments[0] === 'marcas' && segments[1]) {
      // En subpáginas de marca, scrollear al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [segments]);

  let content = <HomePage />;
  if (segments[0] === 'marcas') {
    const brandId = segments[1];
    if (brandId === 'chore-time') {
      // Chore-Time oculto temporalmente - redirigir a home
      content = <HomePage />;
    } else if (brandId === 'fancom') {
      content = <FancomPage />;
    } else if (brandId) {
      content = <GenericBrandPage brandId={brandId} />;
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-[136px]">{content}</main>
      </div>
    </ToastProvider>
  );
}

export default App;
