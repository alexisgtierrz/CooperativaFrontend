import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'info' | 'error';

export interface AuthContextValue {
  isAuthenticated: boolean;
  userEmail: string;
  isAdmin: boolean;
  /** true si el usuario tiene el rol de empleado (técnico); sale del token, sin consultar al servidor */
  isEmpleado: boolean;
  /** Ruta a la que se navega después de iniciar sesión (si el usuario intentó entrar a un trámite) */
  pendingRoute: string;
  loginOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  openLogin: (pendingRoute?: string) => void;
  closeLogin: () => void;
  /** Navega a la ruta si hay sesión; si no, abre el login y guarda la ruta pendiente */
  requireAuth: (ruta: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
