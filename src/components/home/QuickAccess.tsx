import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ACCESOS_RAPIDOS, TONOS, type AccesoRapido } from '../../data/contenido';
import { useAuth } from '../../context/auth-context';

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function QuickAccess() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return ACCESOS_RAPIDOS;
    return ACCESOS_RAPIDOS.filter((a) => normalizar(`${a.titulo} ${a.claves}`).includes(q));
  }, [busqueda]);

  const abrir = (a: AccesoRapido) => {
    if (a.externo) window.open(a.externo, '_blank', 'noopener');
    else if (a.auth && a.ruta) requireAuth(a.ruta);
    else if (a.ruta) navigate(a.ruta);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (resultados.length > 0 && busqueda.trim()) abrir(resultados[0]);
  };

  return (
    <section aria-labelledby="accesos" className="relative z-[3] -mt-14 sm:-mt-[72px]">
      <div className="container-site">
        <div className="rounded-[18px] bg-white p-5 shadow-card sm:p-7">
          <div className="mb-5 flex flex-col gap-4 lg:mb-[22px] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <h2 id="accesos" className="font-display text-[28px] font-bold uppercase leading-none text-coop-navy sm:text-[32px]">
              ¿Qué necesitás hacer hoy?
            </h2>
            <form
              role="search"
              onSubmit={onSubmit}
              className="flex w-full overflow-hidden rounded-xl border border-coop-line-strong bg-[#F7FAFC] focus-within:border-coop-green focus-within:ring-2 focus-within:ring-coop-green/25 lg:max-w-[520px]"
            >
              <label htmlFor="buscar" className="sr-only">
                Buscar un trámite
              </label>
              <span className="flex items-center px-3 text-coop-muted" aria-hidden="true">
                <Search size={20} />
              </span>
              <input
                id="buscar"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: factura, reclamo…"
                className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
              />
              <button type="submit" className="min-h-[46px] bg-coop-navy px-4 font-bold text-white hover:bg-coop-navy-dark sm:px-5">
                Buscar
              </button>
            </form>
          </div>

          {resultados.length === 0 ? (
            <p className="rounded-xl bg-coop-ground px-4 py-6 text-center text-coop-muted" role="status">
              No encontramos ese trámite. Probá con otra palabra o{' '}
              <Link to="/contacto" className="link">
                escribinos
              </Link>
              .
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 xl:grid-cols-8">
              {resultados.map((a) => (
                <li key={a.titulo}>
                  <Tile acceso={a} onOpen={abrir} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({ acceso, onOpen }: { acceso: AccesoRapido; onOpen: (a: AccesoRapido) => void }) {
  const Icon = acceso.icono;
  const className =
    'flex h-full w-full flex-col items-center gap-2.5 rounded-[14px] border border-coop-line-soft bg-white px-2 py-4 text-center text-[15px] font-semibold leading-tight text-coop-ink transition hover:-translate-y-0.5 hover:border-coop-green hover:shadow-soft sm:py-[18px]';
  const inner = (
    <>
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TONOS[acceso.tono]}`} aria-hidden="true">
        <Icon size={24} />
      </span>
      {acceso.titulo}
    </>
  );

  if (acceso.externo) {
    return (
      <a href={acceso.externo} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>
    );
  }
  if (!acceso.auth && acceso.ruta) {
    return (
      <Link to={acceso.ruta} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onOpen(acceso)} className={className}>
      {inner}
    </button>
  );
}
