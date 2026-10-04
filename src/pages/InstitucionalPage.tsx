import { Link } from 'react-router-dom';
import { CalendarDays, Download, FileText, Landmark, User } from 'lucide-react';
import { Badge, PageHeader } from '../components/ui';

const CONSEJO = [
  { cargo: 'Presidente/a', nombre: '[Nombre y apellido]' },
  { cargo: 'Vicepresidente/a', nombre: '[Nombre y apellido]' },
  { cargo: 'Secretario/a', nombre: '[Nombre y apellido]' },
  { cargo: 'Tesorero/a', nombre: '[Nombre y apellido]' },
  { cargo: 'Vocal titular', nombre: '[Nombre y apellido]' },
  { cargo: 'Síndico/a', nombre: '[Nombre y apellido]' },
];

// Cuando estén los PDF, copiarlos a /public/docs y completar `archivo` (ej: '/docs/estatuto.pdf')
const DOCUMENTOS: { titulo: string; detalle: string; archivo?: string }[] = [
  { titulo: 'Estatuto social', detalle: 'Texto vigente aprobado por la asamblea' },
  { titulo: 'Memoria y balance', detalle: 'Último ejercicio cerrado' },
  { titulo: 'Reglamento de servicios', detalle: 'Derechos y obligaciones de los asociados' },
  { titulo: 'Acta de la última asamblea', detalle: 'Resoluciones y renovación de autoridades' },
];

export default function InstitucionalPage() {
  return (
    <>
      <PageHeader
        eyebrow="La cooperativa"
        title="Institucional"
        description="Autoridades, documentación y asambleas. La información de la cooperativa es de todos sus asociados."
        crumbs={[{ label: 'Institucional' }]}
        icon={<Landmark size={28} />}
      />

      <div className="container-site flex flex-col gap-14 py-12 sm:py-16">
        <section id="consejo" aria-labelledby="consejo-t">
          <span className="eyebrow">Autoridades</span>
          <h2 id="consejo-t" className="title-section mb-8 mt-2">
            Consejo de administración
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONSEJO.map((c) => (
              <li key={c.cargo} className="card flex items-center gap-4 p-5">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-coop-blue-soft text-coop-navy" aria-hidden="true">
                  <User size={26} />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-coop-green">{c.cargo}</p>
                  <p className="text-lg font-semibold">{c.nombre}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="documentos" aria-labelledby="documentos-t">
          <span className="eyebrow">Transparencia</span>
          <h2 id="documentos-t" className="title-section mb-8 mt-2">
            Estatuto y balances
          </h2>
          <ul className="card divide-y divide-coop-line-soft">
            {DOCUMENTOS.map((d) => (
              <li key={d.titulo} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-coop-orange-soft text-coop-orange" aria-hidden="true">
                    <FileText size={22} />
                  </span>
                  <div>
                    <p className="font-bold">{d.titulo}</p>
                    <p className="text-[15px] text-coop-muted">{d.detalle}</p>
                  </div>
                </div>
                {d.archivo ? (
                  <a href={d.archivo} download className="btn-outline self-start px-4 py-2 sm:self-auto">
                    <Download size={18} aria-hidden="true" /> Descargar PDF
                  </a>
                ) : (
                  <Badge tone="gray">Disponible en la sede</Badge>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="asamblea-t" className="grid gap-6 rounded-[22px] bg-coop-navy p-6 text-white sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-coop-mint" aria-hidden="true">
            <CalendarDays size={32} />
          </span>
          <div>
            <h2 id="asamblea-t" className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">
              Asamblea general ordinaria
            </h2>
            <p className="mt-2 text-[#D3E0EC]">Consultá la convocatoria, la fecha, el lugar y el orden del día.</p>
          </div>
          <Link to="/novedades/asamblea-general-ordinaria" className="btn-mint self-start lg:self-auto">
            Ver convocatoria
          </Link>
        </section>
      </div>
    </>
  );
}
