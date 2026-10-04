import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { LoginForm } from '../components/LoginModal';
import { useAuth } from '../context/auth-context';

/** Página de ingreso (/login). Después del login vuelve a ?redirect=... o al perfil. */
export default function Login() {
  const { login, isAuthenticated, userEmail } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/perfil';

  return (
    <div className="bg-coop-ground">
      <div className="container-site grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2">
        <div className="order-2 rounded-[22px] bg-coop-navy p-6 text-white sm:p-10 lg:order-1">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold uppercase tracking-[1.5px] text-coop-mint">
            Autogestión 24/7
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-none sm:text-5xl">Oficina Virtual</h2>
          <ul className="mt-6 flex flex-col gap-4 text-[17px] text-[#D3E0EC]">
            <li className="flex gap-3">
              <CalendarClock className="shrink-0 text-coop-mint" aria-hidden="true" /> Consultá tus próximos vencimientos
            </li>
            <li className="flex gap-3">
              <MessageSquare className="shrink-0 text-coop-mint" aria-hidden="true" /> Iniciá y seguí tus reclamos
            </li>
            <li className="flex gap-3">
              <User className="shrink-0 text-coop-mint" aria-hidden="true" /> Revisá tus datos y servicios activos
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="shrink-0 text-coop-mint" aria-hidden="true" /> Acceso seguro con tu usuario de asociado
            </li>
          </ul>
        </div>

        <div className="order-1 card w-full p-6 shadow-card sm:p-10 lg:order-2">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 size={44} className="text-coop-green" aria-hidden="true" />
              <h1 className="font-display text-3xl font-bold uppercase text-coop-navy">Ya iniciaste sesión</h1>
              <p className="text-coop-muted">Estás conectado como {userEmail}.</p>
              <Link to={redirect} className="btn-primary">
                Continuar
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none text-coop-navy">Iniciar sesión</h1>
              <p className="mb-6 mt-2 text-coop-muted">Ingresá a tu Oficina Virtual</p>
              <LoginForm
                onSubmit={async (email, password) => {
                  await login(email, password);
                  navigate(redirect);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
