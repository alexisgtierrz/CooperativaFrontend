import { useState, type FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Dialog from './Dialog';
import { useAuth } from '../context/auth-context';
import { SITE } from '../config/site';

export default function LoginModal() {
  const { login, closeLogin, pendingRoute } = useAuth();
  return (
    <Dialog title="Iniciar sesión" subtitle="Ingresá a tu Oficina Virtual" onClose={closeLogin}>
      <LoginForm onSubmit={login} pendingRoute={pendingRoute} />
    </Dialog>
  );
}

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  pendingRoute?: string;
}

/** Formulario de ingreso reutilizado por el modal y por la página /login */
export function LoginForm({ onSubmit, pendingRoute }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg === 'Credenciales inválidas'
          ? 'El email o la contraseña no son correctos.'
          : 'No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
      {pendingRoute && (
        <p className="flex items-start gap-2 rounded-xl border border-coop-orange/25 bg-coop-orange-soft px-4 py-3 text-sm font-semibold text-coop-orange">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          Tenés que iniciar sesión para acceder a ese trámite.
        </p>
      )}

      <div>
        <label htmlFor="login-email" className="field-label">
          Email
        </label>
        <div className="relative">
          <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coop-muted" aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field pl-10"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="login-password" className="field-label">
          Contraseña
        </label>
        <div className="relative">
          <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coop-muted" aria-hidden="true" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field pl-10 pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-coop-muted hover:text-coop-ink"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Ingresando…
          </>
        ) : (
          'Ingresar'
        )}
      </button>

      <p className="text-center text-sm text-coop-muted">
        ¿No tenés usuario? Pedilo en la oficina de la cooperativa o llamá al{' '}
        <a href={SITE.telefonoHref} className="font-semibold text-coop-navy hover:text-coop-green">
          {SITE.telefono}
        </a>
        .
      </p>
    </form>
  );
}
