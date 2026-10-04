import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Newspaper } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { NewsCard } from '../components/home/NewsSection';
import { CATEGORIA_COLOR, NOVEDADES, formatearFecha, type Novedad } from '../data/contenido';
import NotFoundPage from './NotFoundPage';

const CATEGORIAS: ('Todas' | Novedad['categoria'])[] = ['Todas', 'Obras', 'Asamblea', 'Beneficios', 'Institucional'];

export default function NovedadesPage() {
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>('Todas');
  const lista = categoria === 'Todas' ? NOVEDADES : NOVEDADES.filter((n) => n.categoria === categoria);

  return (
    <>
      <PageHeader
        eyebrow="Novedades"
        title="Lo último de la cooperativa"
        description="Obras, asambleas, beneficios y avisos para los asociados."
        crumbs={[{ label: 'Novedades' }]}
        icon={<Newspaper size={28} />}
      />
      <div className="container-site py-10 sm:py-14">
        <div role="tablist" aria-label="Filtrar por categoría" className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={categoria === c}
              onClick={() => setCategoria(c)}
              className={`min-h-[44px] whitespace-nowrap rounded-full border px-4 font-semibold transition-colors ${
                categoria === c ? 'border-coop-navy bg-coop-navy text-white' : 'border-coop-line-strong bg-white hover:border-coop-navy'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((n) => (
            <NewsCard key={n.slug} novedad={n} />
          ))}
        </div>
      </div>
    </>
  );
}

export function NovedadDetallePage() {
  const { slug } = useParams();
  const novedad = NOVEDADES.find((n) => n.slug === slug);
  if (!novedad) return <NotFoundPage />;
  return <NovedadDetalle key={novedad.slug} novedad={novedad} />;
}

function NovedadDetalle({ novedad }: { novedad: Novedad }) {
  const [sinFoto, setSinFoto] = useState(false);
  const otras = NOVEDADES.filter((n) => n.slug !== novedad.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={novedad.categoria}
        title={novedad.titulo}
        crumbs={[{ label: 'Novedades', to: '/novedades' }, { label: novedad.categoria }]}
      />
      <article className="container-site grid gap-10 py-10 sm:py-14 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="photo-placeholder relative mb-6 h-[220px] overflow-hidden rounded-[18px] sm:h-[340px]">
            {!sinFoto && (
              <img src={novedad.imagen} alt="" onError={() => setSinFoto(true)} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[13px] font-bold uppercase text-white ${CATEGORIA_COLOR[novedad.categoria]}`}>
              {novedad.categoria}
            </span>
            {sinFoto && (
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[13px] text-coop-muted">
                <Camera size={14} aria-hidden="true" /> FOTO de la noticia
              </span>
            )}
          </div>
          <time dateTime={novedad.fecha} className="text-coop-muted">
            {formatearFecha(novedad.fecha)}
          </time>
          <p className="mt-2 text-xl font-semibold">{novedad.resumen}</p>
          <div className="mt-4 flex flex-col gap-4 text-[17px] leading-relaxed text-coop-ink/90">
            {novedad.cuerpo.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link to="/novedades" className="link mt-8 inline-flex items-center gap-2">
            <ArrowLeft size={18} aria-hidden="true" /> Volver a novedades
          </Link>
        </div>
        <aside aria-label="Otras novedades">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-coop-muted">Otras novedades</h2>
          <ul className="flex flex-col gap-3">
            {otras.map((n) => (
              <li key={n.slug}>
                <Link to={`/novedades/${n.slug}`} className="card block p-4 transition-colors hover:border-coop-green">
                  <span className="text-sm text-coop-muted">{formatearFecha(n.fecha)}</span>
                  <p className="font-bold leading-snug">{n.titulo}</p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>
    </>
  );
}
