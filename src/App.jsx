import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/layout';
import WhatsAppFloat from './components/layout/WhatsAppFloat';
import HomePage from './pages/HomePage';
import { ToastProvider } from './components/ui/Toast';
import { trackEvent } from './utils/api';

// Code-splitting por ruta: cada página se descarga solo cuando se visita.
const ChoreTimePage = lazy(() => import('./pages/ChoreTimePage'));
const MsSchippersPage = lazy(() => import('./pages/MsSchippersPage'));
const FancomPage = lazy(() => import('./pages/FancomPage'));
const LubingPage = lazy(() => import('./pages/LubingPage'));
const GeorgiaPoultryPage = lazy(() => import('./pages/GeorgiaPoultryPage'));
const SbmPage = lazy(() => import('./pages/SbmPage'));
const LbWhitePage = lazy(() => import('./pages/LbWhitePage'));
const AmtPage = lazy(() => import('./pages/AmtPage'));
const AlkePage = lazy(() => import('./pages/AlkePage'));
const GenericBrandPage = lazy(() => import('./pages/GenericBrandPage'));

// La plataforma privada (login, dashboard, admin, logística, cotizador) vive en
// otro repositorio/sitio: cualquier ruta vieja redirige allá.
const PLATAFORMA_URL = 'https://plataforma.3psadecv.com';
const RUTAS_PLATAFORMA = ['login', 'dashboard', 'admin', 'logistica', 'cotizador'];

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');
  const [headerH, setHeaderH] = useState(136);

  // Altura real del header fijo: se mide en vivo y se expone como --header-h
  // para que los submenús sticky de las páginas de marca se peguen justo debajo
  // (sin rendija de contenido moviéndose entre el header y la barra de categorías).
  useEffect(() => {
    const measure = () => {
      const h = document.querySelector('header')?.offsetHeight;
      const height = h && h > 0 ? h : 136;
      setHeaderH(height);
      document.documentElement.style.setProperty('--header-h', `${height}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [route]);

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
  const esRutaPlataforma = RUTAS_PLATAFORMA.includes(segments[0]);

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

  // Rutas de la plataforma: redirigir al sitio privado conservando la ruta
  if (esRutaPlataforma) {
    window.location.replace(`${PLATAFORMA_URL}${pathPart}`);
    return null;
  }

  let content = <HomePage />;
  let showHeader = true;

  if (segments[0] === 'marcas') {
    const brandId = segments[1];
    showHeader = true;
    if (brandId === 'chore-time') {
      // Chore-Time no es distribuidor autorizado; no publicar
      content = <HomePage />;
    } else if (brandId === 'ms-schippers') {
      content = <MsSchippersPage />;
    } else if (brandId === 'fancom') {
      content = <FancomPage />;
    } else if (brandId === 'lubing') {
      content = <LubingPage />;
    } else if (brandId === 'georgia-poultry') {
      content = <GeorgiaPoultryPage />;
    } else if (brandId === 'sbm') {
      content = <SbmPage />;
    } else if (brandId === 'lbwhite') {
      content = <LbWhitePage />;
    } else if (brandId === 'amt') {
      content = <AmtPage />;
    } else if (brandId === 'alke') {
      content = <AlkePage />;
    } else if (brandId) {
      content = <GenericBrandPage brandId={brandId} />;
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        {showHeader && <Header />}
        <main style={{ paddingTop: showHeader ? headerH : 0 }}>
          <Suspense fallback={<PageLoader />}>{content}</Suspense>
        </main>
        {showHeader && <WhatsAppFloat />}
      </div>
    </ToastProvider>
  );
}

export default App;
