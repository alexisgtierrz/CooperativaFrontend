import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-coop-blue-soft text-coop-navy">
        <Compass size={40} aria-hidden="true" />
      </span>
      <p className="font-display text-7xl font-bold leading-none text-coop-navy">404</p>
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p className="max-w-md text-coop-muted">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Ir al inicio
        </Link>
        <Link to="/contacto" className="btn-outline">
          Contacto
        </Link>
      </div>
    </div>
  );
}
