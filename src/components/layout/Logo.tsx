import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';

/** Logo provisorio (círculo punteado) + nombre. Reemplazar el círculo por el logo real cuando esté. */
export default function Logo({ variant = 'dark', onClick }: { variant?: 'dark' | 'light'; onClick?: () => void }) {
  const light = variant === 'light';
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 ${light ? 'text-white' : 'text-coop-navy'}`}
      aria-label={`${SITE.nombre} – Inicio`}
    >
      <span
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-dashed sm:h-12 sm:w-12 ${
          light ? 'border-coop-mint' : 'border-coop-green'
        }`}
        aria-hidden="true"
      >
        <span className="h-6 w-6 rounded-full border-2 border-coop-green bg-coop-green-soft sm:h-7 sm:w-7" />
      </span>
      <span className="flex min-w-0 flex-col leading-[1.1]">
        <span className="truncate font-display text-lg font-bold uppercase tracking-[.5px] sm:text-[22px]">{SITE.nombre}</span>
        <span className={`truncate text-xs sm:text-[13px] ${light ? 'text-[#A9BBCD]' : 'text-coop-muted'}`}>{SITE.razonSocial}</span>
      </span>
    </Link>
  );
}
