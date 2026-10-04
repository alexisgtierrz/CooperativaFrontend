import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';

/** Encabezado de las páginas internas: banda azul con migas de pan, título y bajada */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  icon,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { to?: string; label: string }[];
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-coop-navy text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 22px, transparent 22px 44px)' }}
      />
      <div className="container-site relative pb-10 pt-6 sm:pb-14 sm:pt-8">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-[#BFD0E1]">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/" className="hover:text-white hover:underline">
                Inicio
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1">
                <ChevronRight size={14} aria-hidden="true" />
                {c.to ? (
                  <Link to={c.to} className="hover:text-white hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-white">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <span className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/10 text-coop-mint sm:flex">
                {icon}
              </span>
            )}
            <div>
              {eyebrow && <span className="text-sm font-bold uppercase tracking-[2px] text-coop-mint">{eyebrow}</span>}
              <h1 className="mt-1 font-display text-[40px] font-bold uppercase leading-[.95] sm:text-[52px]">{title}</h1>
              {description && <p className="mt-3 max-w-2xl text-[17px] text-[#D3E0EC]">{description}</p>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, id, action }: { eyebrow: string; title: string; id?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={id} className="title-section mt-2">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-coop-muted">
      <Loader2 size={32} className="animate-spin text-coop-green" aria-hidden="true" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle size={32} className="text-red-600" aria-hidden="true" />
      <p className="max-w-md font-semibold text-red-700">{message}</p>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coop-ground text-coop-muted">{icon}</span>
      <p className="text-lg font-bold">{title}</p>
      {text && <p className="max-w-md text-coop-muted">{text}</p>}
      {action}
    </div>
  );
}

const badgeTones = {
  green: 'bg-coop-green-soft text-coop-green-dark border-coop-green/20',
  orange: 'bg-coop-orange-soft text-coop-orange border-coop-orange/20',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-coop-blue-soft text-coop-navy border-coop-navy/15',
  gray: 'bg-coop-ground text-coop-muted border-coop-line',
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = 'gray', children, icon }: { tone?: BadgeTone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-bold ${badgeTones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
