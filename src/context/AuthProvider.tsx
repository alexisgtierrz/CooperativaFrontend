import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextValue, type ToastTone } from './auth-context';
import { loginRequest } from '../lib/api';
import { ADMIN_EMAIL } from '../config/site';
import LoginModal from '../components/LoginModal';
import Toasts, { type ToastItem } from '../components/Toasts';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Sesión: se lee de localStorage igual que antes (token + userEmail)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') ?? '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const openLogin = useCallback((ruta?: string) => {
    setPendingRoute(ruta ?? '');
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setPendingRoute('');
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await loginRequest(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      setIsAuthenticated(true);
      setUserEmail(email);
      setLoginOpen(false);

      if (pendingRoute) {
        navigate(pendingRoute);
        setPendingRoute('');
      } else {
        notify('¡Ingresaste a tu Oficina Virtual!');
      }
    },
    [navigate, notify, pendingRoute],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail('');
    notify('Sesión cerrada correctamente', 'info');
    navigate('/');
  }, [navigate, notify]);

  const requireAuth = useCallback(
    (ruta: string) => {
      if (isAuthenticated) navigate(ruta);
      else openLogin(ruta);
    },
    [isAuthenticated, navigate, openLogin],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      userEmail,
      isAdmin: isAuthenticated && userEmail === ADMIN_EMAIL,
      pendingRoute,
      loginOpen,
      login,
      logout,
      openLogin,
      closeLogin,
      requireAuth,
      notify,
    }),
    [isAuthenticated, userEmail, pendingRoute, loginOpen, login, logout, openLogin, closeLogin, requireAuth, notify],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginOpen && <LoginModal />}
      <Toasts items={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </AuthContext.Provider>
  );
}
