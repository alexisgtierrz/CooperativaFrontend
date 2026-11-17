import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { SITE } from '../../config/site';

const COLUMNAS = [
  {
    titulo: 'La cooperativa',
    links: [
      { to: '/nosotros', label: 'Nosotros' },
      { to: '/institucional#consejo', label: 'Consejo de administración' },
      { to: '/institucional#documentos', label: 'Estatuto y balances' },
      { to: '/novedades', label: 'Novedades' },
    ],
  },
  {
    titulo: 'Asociados',
    links: [
      { to: '/perfil', label: 'Oficina Virtual' },
      { to: '/#pagos', label: 'Pagá tu factura' },
      { to: '/reclamos', label: 'Reclamos' },
      { to: '/perfil', label: 'Actualizá tus datos' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-coop-navy-dark pb-24 pt-14 text-[15px] text-[#DCE7F2] sm:pb-7 sm:pt-16">
      <div className="container-site">
        <div className="grid gap-9 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3.5">
            <span className="font-display text-2xl font-bold uppercase text-white">{SITE.nombre}</span>
            <p>Internet, televisión y telefonía para nuestra comunidad. Una cooperativa de y para sus asociados.</p>
          </div>

          {COLUMNAS.map((col) => (
            <div key={col.titulo}>
              <h3 className="mb-3.5 text-[15px] font-bold uppercase tracking-[1.5px] text-white">{col.titulo}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-3.5 text-[15px] font-bold uppercase tracking-[1.5px] text-white">Contacto</h3>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 shrink-0" aria-hidden="true" /> {SITE.direccion}
              </li>
              <li>
                <a href={SITE.telefonoHref} className="flex items-start gap-2 hover:text-white">
                  <Phone size={16} className="mt-1 shrink-0" aria-hidden="true" /> {SITE.telefono}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-start gap-2 break-all hover:text-white">
                  <Mail size={16} className="mt-1 shrink-0" aria-hidden="true" /> {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={16} className="mt-1 shrink-0" aria-hidden="true" /> Lun a Vie · 8 a 16 h
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-[#A9BBCD] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Cooperativa de Servicios [Nombre] Ltda.</span>
          <span className="flex gap-5">
            <a href={SITE.redes.facebook} className="text-[#DCE7F2] hover:text-white">Facebook</a>
            <a href={SITE.redes.instagram} className="text-[#DCE7F2] hover:text-white">Instagram</a>
            <a href={SITE.redes.youtube} className="text-[#DCE7F2] hover:text-white">YouTube</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
