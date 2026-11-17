import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { SERVICIOS, type Plan } from '../../data/contenido';
import { SectionTitle } from '../ui';

export default function ServicesSection() {
  return (
    <section aria-labelledby="servicios" className="py-16 sm:pb-[72px] sm:pt-[88px]">
      <div className="container-site">
        <SectionTitle
          eyebrow="Nuestros servicios"
          title="Todo lo que tu hogar necesita"
          id="servicios"
          action={
            <Link to="/servicios" className="link no-underline">
              Ver todos los planes →
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => (
            <ServiceCard key={s.id} plan={s} className={i === SERVICIOS.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({ plan, className = '' }: { plan: Plan; className?: string }) {
  const Icon = plan.icono;
  const dark = Boolean(plan.destacado);
  return (
    <article
      className={`relative flex flex-col gap-3.5 rounded-[18px] p-6 sm:p-[30px] ${
        dark ? 'bg-coop-navy text-white' : 'border border-coop-line bg-white'
      } ${className}`}
    >
      {dark && (
        <span className="absolute right-6 top-6 rounded-full bg-coop-mint px-2.5 py-1 text-[13px] font-bold uppercase tracking-[1px] text-coop-navy-deep">
          Más elegido
        </span>
      )}
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-[14px] ${dark ? 'bg-white/10 text-coop-mint' : 'bg-coop-blue-soft text-coop-navy'}`}
        aria-hidden="true"
      >
        <Icon size={28} />
      </span>
      <h3 className={`font-display text-[30px] font-bold leading-tight ${dark ? '' : 'text-coop-navy'}`}>{plan.nombre}</h3>
      <p className={dark ? 'text-[#D3E0EC]' : 'text-coop-muted'}>{plan.descripcion}</p>
      <ul className="mb-2 mt-1 flex flex-col gap-2 font-medium">
        {plan.beneficios.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <Check size={18} strokeWidth={2.6} className={dark ? 'text-coop-mint' : 'text-coop-green'} aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>
      <div
        className={`mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-[18px] ${dark ? 'border-white/20' : 'border-coop-line-soft'}`}
      >
        <div>
          <span className={`text-sm ${dark ? 'text-[#D3E0EC]' : 'text-coop-muted'}`}>desde</span>
          <div className="text-[26px] font-bold leading-tight">
            $ {plan.precio} <span className="text-[15px] font-medium">/mes</span>
          </div>
        </div>
        <Link to={`/servicios#${plan.id}`} className={dark ? 'btn-mint px-[18px]' : 'btn-navy px-[18px]'}>
          Ver planes
          <span className="sr-only"> de {plan.nombre}</span>
        </Link>
      </div>
    </article>
  );
}
