import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CalendarClock, ChevronDown, LogOut, Menu, MessageSquare, Shield, User, X } from 'lucide-react';
import Logo from './Logo';
import { NAV_LINKS, SITE } from '../../config/site';
import { useAuth } from '../../context/auth-context';

const ACCOUNT_LINKS = [
  { to: '/perfil', label: 'Mi perfil', icon: User },
  { to: '/vencimientos', label: 'Próximos vencimientos', icon: CalendarClock },
  { to: '/reclamos', label: 'Mis reclamos', icon: MessageSquare },
];

export default function Header() {
  const { isAuthenticated, userEmail, isAdmin, openLogin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar menús al cambiar de página
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  // Cerrar el desplegable de cuenta con clic afuera o Escape
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  // Bloquear el scroll del fondo con el menú móvil abierto
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const accountLinks = isAdmin ? [...ACCOUNT_LINKS, { to: '/admin', label: 'Panel de administrador', icon: Shield }] : ACCOUNT_LINKS;
  const shortEmail = userEmail.split('@')[0] || 'Mi cuenta';

  return (
    <header className="sticky top-0 z-40 border-b border-coop-line bg-white">
      <div className="container-site flex items-center justify-between gap-4 py-3 lg:gap-8 lg:py-3.5">
        <Logo />

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-6 font-semibold lg:flex xl:gap-[26px]">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `border-b-[3px] py-1.5 transition-colors ${
                  isActive ? 'border-coop-green text-coop-green' : 'border-transparent text-coop-ink hover:text-coop-green'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          {/* Oficina Virtual / Mi cuenta */}
          {isAuthenticated ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="btn-navy max-w-[220px] px-4"
              >
                <User size={20} aria-hidden="true" />
                <span className="truncate">{shortEmail}</span>
                <ChevronDown size={18} aria-hidden="true" className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-coop-line bg-white shadow-card">
                  <div className="border-b border-coop-line-soft px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-coop-muted">Sesión iniciada</p>
                    <p className="truncate font-semibold">{userEmail}</p>
                  </div>
                  <ul className="py-1">
                    {accountLinks.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <Link role="menuitem" to={to} className="flex items-center gap-3 px-4 py-2.5 font-semibold hover:bg-coop-ground">
                          <Icon size={18} className="text-coop-green" aria-hidden="true" /> {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 border-t border-coop-line-soft px-4 py-3 font-semibold text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={18} aria-hidden="true" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => openLogin()} className="btn-navy hidden px-4 sm:inline-flex">
              <User size={20} aria-hidden="true" /> Oficina Virtual
            </button>
          )}

          {/* Acceso rápido a la Oficina Virtual en celulares */}
          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-coop-navy text-white sm:hidden"
              aria-label="Mi cuenta"
            >
              <User size={22} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openLogin()}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-coop-navy text-white sm:hidden"
              aria-label="Oficina Virtual: iniciar sesión"
            >
              <User size={22} />
            </button>
          )}

          {/* Botón de menú (tablet y celular) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-coop-line-strong text-coop-navy lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Menú móvil (panel lateral) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-coop-navy-deep/60 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-card transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-coop-line px-4 py-3">
            <span className="font-display text-xl font-bold uppercase text-coop-navy">Menú</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-coop-muted hover:bg-coop-ground"
              aria-label="Cerrar menú"
              tabIndex={menuOpen ? 0 : -1}
            >
              <X size={24} />
            </button>
          </div>
          <nav aria-label="Principal (móvil)" className="flex-1 overflow-y-auto px-2 py-3">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    tabIndex={menuOpen ? 0 : -1}
                    className={({ isActive }) =>
                      `flex min-h-[48px] items-center rounded-xl px-4 text-lg font-semibold ${
                        isActive ? 'bg-coop-green-soft text-coop-green' : 'text-coop-ink hover:bg-coop-ground'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mx-2 mt-4 rounded-2xl bg-coop-ground p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-coop-muted">Oficina Virtual</p>
              {isAuthenticated ? (
                <>
                  <p className="mb-2 truncate text-sm font-semibold">{userEmail}</p>
                  <ul>
                    {accountLinks.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          tabIndex={menuOpen ? 0 : -1}
                          className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 font-semibold hover:bg-white"
                        >
                          <Icon size={18} className="text-coop-green" aria-hidden="true" /> {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="mt-2 flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 font-semibold text-red-700 hover:bg-white"
                  >
                    <LogOut size={18} aria-hidden="true" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => {
                    setMenuOpen(false);
                    openLogin();
                  }}
                  className="btn-navy w-full"
                >
                  <User size={20} aria-hidden="true" /> Ingresar
                </button>
              )}
            </div>
          </nav>
          <div className="border-t border-coop-line px-6 py-4 text-sm text-coop-muted">
            <a href={SITE.telefonoHref} className="font-semibold text-coop-navy" tabIndex={menuOpen ? 0 : -1}>
              {SITE.telefono}
            </a>
            <p>{SITE.horario}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
