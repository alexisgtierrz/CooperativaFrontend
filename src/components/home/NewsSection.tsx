import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { CATEGORIA_COLOR, NOVEDADES, formatearFecha, type Novedad } from '../../data/contenido';
import { SectionTitle } from '../ui';

export default function NewsSection() {
  return (
    <section aria-labelledby="novedades" className="border-t border-coop-line bg-white py-16 sm:py-20">
      <div className="container-site">
        <SectionTitle
          eyebrow="Novedades"
          title="Lo último de la cooperativa"
          id="novedades"
          action={
            <Link to="/novedades" className="link no-underline">
              Ver todas las novedades →
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {NOVEDADES.slice(0, 3).map((n, i) => (
            <NewsCard key={n.slug} novedad={n} className={i === 2 ? 'md:col-span-2 lg:col-span-1' : ''} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsCard({ novedad, className = '' }: { novedad: Novedad; className?: string }) {
  const [sinFoto, setSinFoto] = useState(false);
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[18px] border border-coop-line bg-white focus-within:ring-2 focus-within:ring-coop-green ${className}`}>
      <div className="photo-placeholder relative h-[180px] overflow-hidden">
        {!sinFoto && (
          <img
            src={novedad.imagen}
            alt=""
            loading="lazy"
            onError={() => setSinFoto(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[13px] font-bold uppercase text-white ${CATEGORIA_COLOR[novedad.categoria]}`}
        >
          {novedad.categoria}
        </span>
        {sinFoto && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[13px] text-coop-muted">
            <Camera size={14} aria-hidden="true" /> FOTO de la noticia
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-[22px]">
        <time dateTime={novedad.fecha} className="text-sm text-coop-muted">
          {formatearFecha(novedad.fecha)}
        </time>
        <h3 className="text-[21px] font-bold leading-tight">
          <Link to={`/novedades/${novedad.slug}`} className="after:absolute after:inset-0 hover:text-coop-green focus:outline-none">
            {novedad.titulo}
          </Link>
        </h3>
        <p className="flex-1 text-coop-muted">{novedad.resumen}</p>
        <span className="mt-1.5 font-bold text-coop-navy group-hover:text-coop-green" aria-hidden="true">
          Leer más →
        </span>
      </div>
    </article>
  );
}
