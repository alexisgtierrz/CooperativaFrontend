import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import TopBar from './layout/TopBar';
import Header from './layout/Header';
import Footer from './layout/Footer';

/**
 * Protege las páginas de la Oficina Virtual.
 * Sin sesión muestra un aviso con el botón para ingresar (y vuelve a esta página después del login).
 */
export default function RequireAuth({
  children,
  adminOnly = false,
  withChrome = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  /** true cuando la página protegida no usa el layout del sitio (panel de administración) */
  withChrome?: boolean;
}) {
  const { isAuthenticated, isAdmin, openLogin } = useAuth();
  const location = useLocation();

  const frame = (gate: ReactNode) =>
    withChrome ? (
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <Header />
        <main className="flex-1">{gate}</main>
        <Footer />
      </div>
    ) : (
      gate
    );

  if (!isAuthenticated) {
    return frame(
      <Gate
        icon={<Lock size={30} aria-hidden="true" />}
        title="Ingresá a tu Oficina Virtual"
        text="Para ver esta sección tenés que iniciar sesión con tu usuario de asociado."
        action={
          <button type="button" className="btn-primary" onClick={() => openLogin(location.pathname + location.search)}>
            Iniciar sesión
          </button>
        }
      />,
    );
  }

  if (adminOnly && !isAdmin) {
    return frame(
      <Gate
        icon={<ShieldAlert size={30} aria-hidden="true" />}
        title="Acceso restringido"
        text="Esta sección es solo para el personal administrativo de la cooperativa."
        action={
          <Link to="/" className="btn-navy">
            Volver al inicio
          </Link>
        }
      />,
    );
  }

  return <>{children}</>;
}

function Gate({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-coop-ground px-4 py-16">
      <div className="card flex w-full max-w-md flex-col items-center gap-4 p-8 text-center shadow-soft sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coop-blue-soft text-coop-navy">{icon}</span>
        <h1 className="font-display text-3xl font-bold uppercase leading-none text-coop-navy">{title}</h1>
        <p className="text-coop-muted">{text}</p>
        {action}
      </div>
    </div>
  );
}
