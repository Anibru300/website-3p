import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const pathname = hash.replace('#', '') || '/';
  // Simular location simple
  return {
    pathname,
    hash: hash.includes('#') ? hash.slice(hash.indexOf('#') + 1) : '',
  };
};
