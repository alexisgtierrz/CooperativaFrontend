import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Loader2, MessageSquare, Plus, Ticket as TicketIcon, X } from 'lucide-react';
import { Badge, EmptyState, LoadingState, PageHeader } from '../components/ui';
import PerfilError from '../components/PerfilError';
import { usePerfilActual } from '../hooks/usePerfilActual';
import { apiJson } from '../lib/api';
import { estadoTicket, formatearFechaSimple, tonoEstadoTicket } from '../lib/format';
import { useAuth } from '../context/auth-context';
import type { Ticket } from '../types';

const CATEGORIAS = [
  'Sin conexión a internet',
  'Internet lento o intermitente',
  'Sin señal de televisión',
  'Problema con la línea telefónica',
  'Facturación y pagos',
  'Otro',
];

const MAX_DESCRIPCION = 255; // largo de la columna `descripcion` en la tabla tickets

type Filtro = 'todos' | 'abiertos' | 'resueltos';

export default function ReclamosPage() {
  const { data, loading, error, status, reload } = usePerfilActual();
  const [params, setParams] = useSearchParams();
  const formOpen = params.get('nuevo') === '1';
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [creado, setCreado] = useState<Ticket | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const abrirFormulario = () => {
    setCreado(null);
    setParams({ nuevo: '1' }, { replace: true });
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const cerrarFormulario = () => setParams({}, { replace: true });

  const tickets = useMemo(() => [...(data?.perfil?.tickets ?? [])].sort((a, b) => b.id - a.id), [data]);
  const filtrados = tickets.filter((t) => {
    if (filtro === 'todos') return true;
    const resuelto = tonoEstadoTicket(estadoTicket(t)) === 'green';
    return filtro === 'resueltos' ? resuelto : !resuelto;
  });

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Mis reclamos"
        description="Cargá un reclamo técnico o administrativo y seguí su estado hasta que se resuelva."
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Reclamos' }]}
        icon={<MessageSquare size={28} />}
      >
        {!formOpen && (
          <button type="button" onClick={abrirFormulario} className="btn-primary self-start sm:self-auto">
            <Plus size={20} aria-hidden="true" /> Nuevo reclamo
          </button>
        )}
      </PageHeader>

      <div className="container-site flex flex-col gap-6 py-8 sm:py-12">
        {creado && (
          <div role="status" className="flex flex-col gap-3 rounded-2xl border border-coop-green/30 bg-coop-green-soft p-5 sm:flex-row sm:items-center">
            <CheckCircle2 size={32} className="shrink-0 text-coop-green" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-lg font-bold text-coop-green-dark">Recibimos tu reclamo N° {creado.id}</p>
              <p className="text-[15px] text-coop-muted">
                Guardá este número para consultarlo. Te vamos a contactar al teléfono registrado en tu ficha.
              </p>
            </div>
            <button type="button" onClick={() => setCreado(null)} className="btn-outline px-4 py-2" aria-label="Cerrar aviso">
              Entendido
            </button>
          </div>
        )}

        {formOpen && (
          <div ref={formRef} id="nuevo-reclamo">
            <NuevoReclamoForm
              onCancel={cerrarFormulario}
              onCreated={(t) => {
                setCreado(t);
                cerrarFormulario();
                reload();
              }}
            />
          </div>
        )}

        <section aria-labelledby="historial" className="card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-coop-line-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <h2 id="historial" className="font-display text-2xl font-bold uppercase text-coop-navy">
              Historial de reclamos
            </h2>
            <div role="tablist" aria-label="Filtrar reclamos" className="flex rounded-xl bg-coop-ground p-1">
              {(['todos', 'abiertos', 'resueltos'] as Filtro[]).map((f) => (
                <button
                  key={f}
                  role="tab"
                  type="button"
                  aria-selected={filtro === f}
                  onClick={() => setFiltro(f)}
                  className={`min-h-[40px] flex-1 rounded-lg px-4 text-sm font-bold capitalize transition-colors sm:flex-none ${
                    filtro === f ? 'bg-white text-coop-navy shadow-sm' : 'text-coop-muted hover:text-coop-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingState label="Cargando tus reclamos…" />
            </div>
          ) : !data ? (
            <div className="p-6">
              <PerfilError message={error} status={status} onRetry={reload} />
            </div>
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={<TicketIcon size={28} />}
              title={tickets.length === 0 ? 'Todavía no cargaste reclamos' : 'No hay reclamos con este filtro'}
              text={tickets.length === 0 ? 'Si tenés un problema con tu servicio, contanos y lo resolvemos.' : undefined}
              action={
                tickets.length === 0 && !formOpen ? (
                  <button type="button" onClick={abrirFormulario} className="btn-primary">
                    Iniciar un reclamo
                  </button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-coop-line-soft">
              {filtrados.map((t) => (
                <TicketItem key={t.id} ticket={t} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function TicketItem({ ticket }: { ticket: Ticket }) {
  const [abierto, setAbierto] = useState(false);
  const estado = estadoTicket(ticket);
  const historial = ticket.historialEstados ?? [];

  return (
    <li className="p-5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-coop-muted">
            <span className="font-mono font-semibold text-coop-navy">#{ticket.id}</span>
            {ticket.fechaCreacion && <span>{formatearFechaSimple(ticket.fechaCreacion)}</span>}
            {ticket.categoria && <span className="rounded-md bg-coop-ground px-2 py-0.5 font-semibold">{ticket.categoria}</span>}
          </div>
          <p className="mt-1 font-semibold">{ticket.descripcion}</p>
        </div>
        <Badge tone={tonoEstadoTicket(estado)}>{estado}</Badge>
      </div>

      {historial.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="mt-3 flex items-center gap-1 text-sm font-bold text-coop-navy hover:text-coop-green"
          >
            {abierto ? 'Ocultar seguimiento' : 'Ver seguimiento'}
            <ChevronDown size={16} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {abierto && (
            <ol className="mt-3 border-l-2 border-coop-line pl-5">
              {historial.map((c, i) => (
                <li key={c.id ?? i} className="relative pb-3 last:pb-0">
                  <span
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                      c.fechaHoraFin ? 'bg-coop-line-strong' : 'bg-coop-green'
                    }`}
                    aria-hidden="true"
                  />
                  <p className="font-semibold">{c.estado?.nombre ?? 'Estado'}</p>
                  <p className="text-sm text-coop-muted">
                    Desde {formatearFechaSimple(c.fechaHoraInicio) || '—'}
                    {c.fechaHoraFin ? ` hasta ${formatearFechaSimple(c.fechaHoraFin)}` : ' · actual'}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </li>
  );
}

function NuevoReclamoForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (t: Ticket) => void }) {
  const { notify } = useAuth();
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const ticket = await apiJson<Ticket>('/tickets', {
        method: 'POST',
        body: JSON.stringify({ categoria, descripcion: descripcion.trim() }),
      });
      notify(`Reclamo N° ${ticket.id} registrado`);
      onCreated(ticket);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No pudimos registrar el reclamo. Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section aria-labelledby="nuevo-t" className="card p-5 shadow-soft sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow">Nuevo reclamo</span>
          <h2 id="nuevo-t" className="mt-1 font-display text-3xl font-bold uppercase leading-none text-coop-navy">
            Contanos qué pasó
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 w-11 items-center justify-center rounded-full text-coop-muted hover:bg-coop-ground"
          aria-label="Cerrar formulario"
        >
          <X size={22} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5">
        <fieldset>
          <legend className="field-label">Motivo del reclamo</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS.map((c) => (
              <label
                key={c}
                className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 font-semibold transition-colors ${
                  categoria === c ? 'border-coop-green bg-coop-green-soft text-coop-green-dark' : 'border-coop-line-strong hover:border-coop-navy'
                }`}
              >
                <input
                  type="radio"
                  name="categoria"
                  value={c}
                  checked={categoria === c}
                  onChange={() => setCategoria(c)}
                  required
                  className="h-4 w-4 accent-coop-green"
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="descripcion" className="field-label">
            Descripción
          </label>
          <textarea
            id="descripcion"
            required
            rows={4}
            maxLength={MAX_DESCRIPCION}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: desde ayer a la noche no tengo internet, la luz del módem está en rojo."
            className="field resize-y"
            aria-describedby="descripcion-ayuda"
          />
          <p id="descripcion-ayuda" className="mt-1 text-right text-sm text-coop-muted">
            {descripcion.length}/{MAX_DESCRIPCION}
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-coop-line-soft pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={enviando || !categoria || !descripcion.trim()} className="btn-primary">
            {enviando ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Enviando…
              </>
            ) : (
              'Enviar reclamo'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
