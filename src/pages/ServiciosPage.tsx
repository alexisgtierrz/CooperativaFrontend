import { Link } from 'react-router-dom';
import { Check, MapPin, Tv, Wifi } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { GRILLA_CANALES, SERVICIOS } from '../data/contenido';

export default function ServiciosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nuestros servicios"
        title="Planes para tu hogar"
        description="Internet por fibra óptica, televisión digital y telefonía fija, con atención y técnicos de la cooperativa."
        crumbs={[{ label: 'Servicios' }]}
        icon={<Wifi size={28} />}
      />

      {/* Índice rápido */}
      <nav aria-label="Servicios" className="sticky top-[69px] z-20 border-b border-coop-line bg-white sm:top-[73px] lg:top-[77px]">
        <div className="container-site flex gap-1 overflow-x-auto py-2">
          {[...SERVICIOS.map((s) => ({ id: s.id, label: s.nombre })), { id: 'grilla', label: 'Grilla de canales' }].map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-coop-ink hover:bg-coop-ground hover:text-coop-green"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-site flex flex-col gap-14 py-12 sm:gap-16 sm:py-16">
        {SERVICIOS.map((s) => {
          const Icon = s.icono;
          return (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="grid gap-8 lg:grid-cols-[1fr_2fr]">
              <div>
                <span
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] ${
                    s.destacado ? 'bg-coop-navy text-coop-mint' : 'bg-coop-blue-soft text-coop-navy'
                  }`}
                  aria-hidden="true"
                >
                  <Icon size={28} />
                </span>
                <h2 id={`${s.id}-t`} className="title-section">
                  {s.nombre}
                </h2>
                <p className="mt-3 text-coop-muted">{s.descripcion}</p>
                <ul className="mt-4 flex flex-col gap-2 font-medium">
                  {s.beneficios.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <Check size={18} strokeWidth={2.6} className="text-coop-green" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {s.planes.map((p, i) => {
                  const dark = s.destacado && i === 1;
                  return (
                    <li
                      key={p.nombre}
                      className={`flex flex-col gap-3 rounded-[18px] p-6 ${dark ? 'bg-coop-navy text-white' : 'border border-coop-line bg-white'}`}
                    >
                      <h3 className={`font-display text-[26px] font-bold uppercase leading-none ${dark ? '' : 'text-coop-navy'}`}>{p.nombre}</h3>
                      <p className={dark ? 'text-[#D3E0EC]' : 'text-coop-muted'}>{p.detalle}</p>
                      <div className="mt-auto pt-2 text-[26px] font-bold leading-tight">
                        $ {p.precio} <span className="text-[15px] font-medium">/mes</span>
                      </div>
                      <Link
                        to={`/contacto?asunto=${encodeURIComponent(`Quiero contratar ${p.nombre}`)}`}
                        className={dark ? 'btn-mint' : 'btn-navy'}
                      >
                        Lo quiero
                        <span className="sr-only"> – {p.nombre}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <section id="grilla" aria-labelledby="grilla-t" className="card p-6 sm:p-10">
          <div className="mb-6 flex items-start gap-4">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-[14px] bg-coop-green-soft text-coop-green" aria-hidden="true">
              <Tv size={28} />
            </span>
            <div>
              <span className="eyebrow">Televisión digital</span>
              <h2 id="grilla-t" className="title-section mt-1">
                Grilla de canales
              </h2>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GRILLA_CANALES.map((g) => (
              <li key={g.categoria} className="flex items-center justify-between gap-3 rounded-xl bg-coop-ground px-4 py-3">
                <span className="font-semibold">{g.categoria}</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-coop-navy">{g.canales}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-coop-muted">Cantidad de canales por categoría en el plan TV Full. La grilla puede cambiar sin previo aviso.</p>
        </section>

        <section className="flex flex-col items-start gap-5 rounded-[22px] bg-coop-green p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">¿Llega la fibra a tu casa?</h2>
            <p className="mt-2 text-[#E2F4E9]">Consultá la cobertura de tu domicilio antes de contratar.</p>
          </div>
          <Link to="/#cobertura" className="btn-mint whitespace-nowrap">
            <MapPin size={20} aria-hidden="true" /> Consultar cobertura
          </Link>
        </section>
      </div>
    </>
  );
}
