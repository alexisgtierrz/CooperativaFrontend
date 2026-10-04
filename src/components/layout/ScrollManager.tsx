import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Al cambiar de página vuelve arriba; si la URL trae #ancla, baja hasta esa sección. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // Espera un frame para que la página nueva termine de renderizar
      const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}
