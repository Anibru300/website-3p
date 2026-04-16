import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [pathname, setPathname] = useState(window.location.pathname || '/');
  const [hash, setHash] = useState(window.location.hash ? window.location.hash.slice(1) : '');

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
      setHash(window.location.hash ? window.location.hash.slice(1) : '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return {
    pathname,
    hash,
  };
};
