import { Link } from 'react-router-dom';
import { Clock, Phone } from 'lucide-react';
import { SITE } from '../../config/site';

export default function TopBar() {
  return (
    <div className="bg-coop-navy-dark text-sm text-[#DCE7F2]">
      <div className="container-site flex items-center justify-between gap-x-6 gap-y-1 py-2">
        <div className="flex min-w-0 items-center gap-x-5">
          <a href={SITE.telefonoHref} className="flex items-center gap-1.5 whitespace-nowrap hover:text-white">
            <Phone size={16} aria-hidden="true" />
            <span className="hidden lg:inline">Atención al asociado</span> {SITE.telefono}
          </a>
          <span className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
            <Clock size={16} aria-hidden="true" />
            {SITE.horario}
          </span>
        </div>
        <div className="flex items-center gap-x-5">
          <a href={SITE.telefonoHref} className="whitespace-nowrap font-semibold text-white hover:underline">
            Guardia técnica 24 h
          </a>
          <Link to="/#pagos" className="hidden whitespace-nowrap hover:text-white md:inline">
            Pagá tu factura
          </Link>
          <Link to="/contacto" className="hidden whitespace-nowrap hover:text-white lg:inline">
            Portal Empresas
          </Link>
        </div>
      </div>
    </div>
  );
}
