import { Link, useLocation } from 'react-router-dom';
import { ErrorState } from './ui';
import { useAuth } from '../context/auth-context';

/** Mensaje de error común para las páginas que leen /clientes/perfil-actual */
export default function PerfilError({ message, status, onRetry }: { message: string; status: number | null; onRetry: () => void }) {
  const { openLogin, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 404 && isAdmin) {
    return (
      <ErrorState
        message="Tu usuario es de administración y no tiene una ficha de asociado asociada."
        action={
          <Link to="/admin" className="btn-navy">
            Ir al panel de administrador
          </Link>
        }
      />
    );
  }

  return (
    <ErrorState
      message={message}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          {status === 401 || status === 403 ? (
            <button type="button" className="btn-primary" onClick={() => openLogin(location.pathname + location.search)}>
              Iniciar sesión de nuevo
            </button>
          ) : status === 404 ? (
            <Link to="/contacto" className="btn-primary">
              Contactar a la cooperativa
            </Link>
          ) : (
            <button type="button" className="btn-primary" onClick={onRetry}>
              Reintentar
            </button>
          )}
          <Link to="/" className="btn-outline">
            Volver al inicio
          </Link>
        </div>
      }
    />
  );
}
