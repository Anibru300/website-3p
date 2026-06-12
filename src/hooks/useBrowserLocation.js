import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [pathname, setPathname] = useState(window.location.pathname || '/');
  const [hash, setHash] = useState(window.location.hash ? window.location.hash.slice(1) : '');

  useEffect(() => {
    const onChange = () => {
      setPathname(window.location.pathname || '/');
      setHash(window.location.hash ? window.location.hash.slice(1) : '');
    };
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
    };
  }, []);

  return {
    pathname,
    hash,
  };
};
