import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ChoreTimePage from './pages/ChoreTimePage';
import FancomPage from './pages/FancomPage';
import GenericBrandPage from './pages/GenericBrandPage';
import { ToastProvider } from './components/Toast';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll a sección cuando la ruta apunta a un ancla de HomePage
  useEffect(() => {
    const cleanRoute = route.replace('#', '') || '/';
    const segments = cleanRoute.split('/').filter(Boolean);
    const sectionId = segments[0];
    const homeSections = ['inicio', 'marcas', 'catalogos', 'contacto'];

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
  }, [route]);

  const cleanRoute = route.replace('#', '') || '/';
  const segments = cleanRoute.split('/').filter(Boolean);

  let content = <HomePage />;
  if (segments[0] === 'marcas') {
    const brandId = segments[1];
    if (brandId === 'chore-time') {
      content = <ChoreTimePage />;
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
