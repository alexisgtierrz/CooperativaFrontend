import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Ticket as TicketIcon,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { Badge, EmptyState, LoadingState, PageHeader, type BadgeTone } from '../components/ui';
import PerfilError from '../components/PerfilError';
import { ApiError } from '../lib/api';
import { formatearFechaSimple } from '../lib/format';
import {
  asignarReclamo,
  cambiarEstadoReclamo,
  crearReclamo,
  listarTiposIncidente,
  misReclamos,
  perfilEmpleadoActual,
  reclamosAsignados,
  reclamosSinAsignar,
} from '../lib/reclamos';
import { mensajeDeError } from '../lib/solicitudes';
import { useAuth } from '../context/auth-context';
import type { CodigoEstadoReclamo, EmpleadoPerfil, Reclamo, TipoIncidente } from '../types';

const MAX_DESCRIPCION = 255;
const ACTUALIZACION_MS = 30_000;

//Cómo se muestra cada estado: texto, color e ícono
const ESTADOS: Record<CodigoEstadoReclamo, { label: string; tone: BadgeTone; icon: ReactNode }> = {
  PENDIENTE: { label: 'Pendiente · sin asignar', tone: 'orange', icon: <Clock size={14} aria-hidden="true" /> },
  EN_PROCESO: { label: 'En proceso · asignado', tone: 'blue', icon: <Wrench size={14} aria-hidden="true" /> },
  RESUELTO: { label: 'Resuelto', tone: 'green', icon: <CheckCircle2 size={14} aria-hidden="true" /> },
};

function EstadoBadge({ estado }: { estado: CodigoEstadoReclamo }) {
  const info = ESTADOS[estado] ?? ESTADOS.PENDIENTE;
  return (
    <Badge tone={info.tone} icon={info.icon}>
      {info.label}
    </Badge>
  );
}

function tonoGravedad(gravedad?: string | null): BadgeTone {
  const g = (gravedad ?? '').toLowerCase();
  if (g.startsWith('alt') || g.startsWith('crit')) return 'red';
  if (g.startsWith('med')) return 'orange';
  return 'gray';
}

function errorDeCarga(err: unknown): { mensaje: string; status: number | null } {
  const status = err instanceof ApiError ? err.status : null;
  const mensaje =
    status === 404
      ? 'No se encontró información de asociado para este usuario.'
      : status === 401 || status === 403
        ? 'Tu sesión expiró. Volvé a iniciar sesión.'
        : 'No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.';
  return { mensaje, status };
}

type Rol =
  | { tipo: 'cargando' }
  | { tipo: 'cliente' }
  | { tipo: 'empleado'; perfil: EmpleadoPerfil }
  | { tipo: 'error'; mensaje: string; status: number | null };

//reclamos sirve a los dos roles: el empleado ve su bandeja, el cliente ve y carga sus reclamos
export default function ReclamosPage() {
  const [rol, setRol] = useState<Rol>({ tipo: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    perfilEmpleadoActual()
      .then((perfil) => {
        if (!cancelado) setRol(perfil ? { tipo: 'empleado', perfil } : { tipo: 'cliente' });
      })
      .catch((err: unknown) => {
        console.error('Error al identificar el rol:', err);
        if (!cancelado) setRol({ tipo: 'error', ...errorDeCarga(err) });
      });
    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = () => {
    setRol({ tipo: 'cargando' });
    setIntento((n) => n + 1);
  };

  if (rol.tipo === 'empleado') return <ReclamosEmpleado perfil={rol.perfil} />;
  if (rol.tipo === 'cliente') return <ReclamosCliente />;

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Reclamos"
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Reclamos' }]}
        icon={<MessageSquare size={28} />}
      />
      <div className="container-site py-8 sm:py-12">
        {rol.tipo === 'cargando' ? (
          <LoadingState label="Cargando…" />
        ) : (
          <PerfilError message={rol.mensaje} status={rol.status} onRetry={reintentar} />
        )}
      </div>
    </>
  );
}

/*CLIENTE: crear reclamos y seguirlos*/

type Filtro = 'todos' | 'abiertos' | 'resueltos';

interface EstadoLista {
  data: Reclamo[] | null;
  loading: boolean;
  error: string;
  status: number | null;
}

function ReclamosCliente() {
  const [params, setParams] = useSearchParams();
  const formOpen = params.get('nuevo') === '1';
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [creado, setCreado] = useState<Reclamo | null>(null);
  const [lista, setLista] = useState<EstadoLista>({ data: null, loading: true, error: '', status: null });
  const formRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async (silencioso = false) => {
    try {
      const data = await misReclamos();
      setLista({ data, loading: false, error: '', status: null });
    } catch (err) {
      console.error('Error al obtener los reclamos:', err);
      if (silencioso) return;
      const { mensaje, status } = errorDeCarga(err);
      setLista({ data: null, loading: false, error: mensaje, status });
    }
  }, []);

  //Carga inicial + seguimiento: se refresca solo cada 30s
  useEffect(() => {
    cargar();
    const timer = window.setInterval(() => cargar(true), ACTUALIZACION_MS);
    return () => window.clearInterval(timer);
  }, [cargar]);

  const reintentar = () => {
    setLista((s) => ({ ...s, loading: true, error: '' }));
    cargar();
  };

  const abrirFormulario = () => {
    setCreado(null);
    setParams({ nuevo: '1' }, { replace: true });
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const cerrarFormulario = () => setParams({}, { replace: true });

  const reclamos = lista.data ?? [];
  const filtrados = reclamos.filter((r) => {
    if (filtro === 'todos') return true;
    return filtro === 'resueltos' ? r.estado === 'RESUELTO' : r.estado !== 'RESUELTO';
  });

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Mis reclamos"
        description="Cargá un reclamo técnico y seguí su estado hasta que se resuelva."
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
                Quedó pendiente hasta que un técnico de {creado.especialidad ? `“${creado.especialidad}”` : 'la cooperativa'} lo tome. Vas a ver el
                avance acá abajo.
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
              onCreated={(r) => {
                setCreado(r);
                cerrarFormulario();
                cargar(true);
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

          {lista.loading ? (
            <div className="p-6">
              <LoadingState label="Cargando tus reclamos…" />
            </div>
          ) : !lista.data ? (
            <div className="p-6">
              <PerfilError message={lista.error} status={lista.status} onRetry={reintentar} />
            </div>
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={<TicketIcon size={28} />}
              title={reclamos.length === 0 ? 'Todavía no cargaste reclamos' : 'No hay reclamos con este filtro'}
              text={reclamos.length === 0 ? 'Si tenés un problema con tu servicio, contanos y lo resolvemos.' : undefined}
              action={
                reclamos.length === 0 && !formOpen ? (
                  <button type="button" onClick={abrirFormulario} className="btn-primary">
                    Iniciar un reclamo
                  </button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-coop-line-soft">
              {filtrados.map((r) => (
                <ReclamoClienteItem key={r.id} reclamo={r} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function ReclamoClienteItem({ reclamo }: { reclamo: Reclamo }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li className="p-5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-coop-muted">
            <span className="font-mono font-semibold text-coop-navy">#{reclamo.id}</span>
            {reclamo.fechaCreacion && <span>{formatearFechaSimple(reclamo.fechaCreacion)}</span>}
            {reclamo.tipoIncidenteNombre && (
              <span className="rounded-md bg-coop-ground px-2 py-0.5 font-semibold">{reclamo.tipoIncidenteNombre}</span>
            )}
          </div>
          <p className="mt-1 font-semibold">{reclamo.descripcion}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-coop-muted">
            <User size={15} aria-hidden="true" />
            {reclamo.tecnicoNombre ? (
              <span>
                Técnico asignado: <strong className="text-coop-ink">{reclamo.tecnicoNombre}</strong>
              </span>
            ) : (
              <span>Todavía sin técnico asignado</span>
            )}
          </p>
        </div>
        <EstadoBadge estado={reclamo.estado} />
      </div>

      {reclamo.observacionesResolucion && (
        <div
          className={`mt-3 rounded-xl border p-4 ${
            reclamo.estado === 'RESUELTO' ? 'border-coop-green/30 bg-coop-green-soft' : 'border-coop-line-soft bg-coop-ground'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-coop-muted">
            {reclamo.estado === 'RESUELTO' ? 'Observaciones de la resolución' : 'Nota del técnico'}
          </p>
          <p className="mt-1 whitespace-pre-line">{reclamo.observacionesResolucion}</p>
        </div>
      )}

      {reclamo.historial.length > 0 && (
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
              {reclamo.historial.map((c, i) => (
                <li key={i} className="relative pb-3 last:pb-0">
                  <span
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                      c.hasta ? 'bg-coop-line-strong' : 'bg-coop-green'
                    }`}
                    aria-hidden="true"
                  />
                  <p className="font-semibold">
                    {c.estado ?? 'Estado'}
                    {c.tecnico ? <span className="font-normal text-coop-muted"> · {c.tecnico}</span> : null}
                  </p>
                  <p className="text-sm text-coop-muted">
                    Desde {formatearFechaSimple(c.desde) || '—'}
                    {c.hasta ? ` hasta ${formatearFechaSimple(c.hasta)}` : ' · actual'}
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

function NuevoReclamoForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (r: Reclamo) => void }) {
  const { notify } = useAuth();
  const [tipos, setTipos] = useState<TipoIncidente[] | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  //Los tipos salen de la base de datos
  useEffect(() => {
    let cancelado = false;
    listarTiposIncidente()
      .then((data) => {
        if (!cancelado) setTipos(data);
      })
      .catch((err: unknown) => {
        console.error('Error al cargar los tipos de incidente:', err);
        if (!cancelado) {
          setTipos([]);
          setError(mensajeDeError(err, 'No pudimos cargar los tipos de incidente. Probá de nuevo.'));
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (tipoId == null) return;
    setError('');
    setEnviando(true);
    try {
      const reclamo = await crearReclamo({ tipoIncidenteId: tipoId, descripcion: descripcion.trim() });
      notify(`Reclamo N° ${reclamo.id} registrado`);
      onCreated(reclamo);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No pudimos registrar el reclamo. Probá de nuevo.'));
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
          <legend className="field-label">Tipo de incidente</legend>
          {tipos === null ? (
            <p role="status" className="flex items-center gap-2 text-coop-muted">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Cargando tipos de incidente…
            </p>
          ) : tipos.length === 0 ? (
            <p className="text-coop-muted">No hay tipos de incidente disponibles en este momento.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tipos.map((t) => (
                <label
                  key={t.id}
                  className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 font-semibold transition-colors ${
                    tipoId === t.id ? 'border-coop-green bg-coop-green-soft text-coop-green-dark' : 'border-coop-line-strong hover:border-coop-navy'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoIncidente"
                    value={t.id}
                    checked={tipoId === t.id}
                    onChange={() => setTipoId(t.id)}
                    required
                    className="h-4 w-4 accent-coop-green"
                  />
                  {t.nombre}
                </label>
              ))}
            </div>
          )}
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
          <button type="submit" disabled={enviando || tipoId == null || !descripcion.trim()} className="btn-primary">
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

/*EMPLEADO: bandeja "Sin asignar (mi área)" y "Mis reclamos asignados"*/

type Pestania = 'sin-asignar' | 'asignados';

function ReclamosEmpleado({ perfil }: { perfil: EmpleadoPerfil }) {
  const { notify } = useAuth();
  const [pestania, setPestania] = useState<Pestania>('sin-asignar');
  const [sinAsignar, setSinAsignar] = useState<Reclamo[] | null>(null);
  const [asignados, setAsignados] = useState<Reclamo[] | null>(null);
  const [error, setError] = useState<{ mensaje: string; status: number | null } | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    try {
      const [libres, mios] = await Promise.all([reclamosSinAsignar(), reclamosAsignados()]);
      setSinAsignar(libres);
      setAsignados(mios);
      setError(null);
    } catch (err) {
      console.error('Error al cargar la bandeja de reclamos:', err);
      if (!silencioso) setError(errorDeCarga(err));
    }
  }, []);

  useEffect(() => {
    cargar();
    const timer = window.setInterval(() => cargar(true), ACTUALIZACION_MS);
    return () => window.clearInterval(timer);
  }, [cargar]);

  const asignarme = async (reclamo: Reclamo) => {
    setProcesando(reclamo.id);
    try {
      await asignarReclamo(reclamo.id);
      notify(`Reclamo #${reclamo.id} asignado: pasó a "En proceso" y figura en tus reclamos.`);
      setPestania('asignados');
    } catch (err) {
      //Si otro compañero lo tomó antes, el backend responde 409 con el motivo
      notify(mensajeDeError(err), 'error');
    } finally {
      await cargar(true);
      setProcesando(null);
    }
  };

  const actualizar = async (reclamo: Reclamo, estado: 'EN_PROCESO' | 'RESUELTO', observaciones: string) => {
    setProcesando(reclamo.id);
    try {
      await cambiarEstadoReclamo(reclamo.id, { estado, observaciones });
      notify(estado === 'RESUELTO' ? `Reclamo #${reclamo.id} marcado como resuelto.` : `Nota del reclamo #${reclamo.id} guardada.`);
    } catch (err) {
      notify(mensajeDeError(err), 'error');
    } finally {
      await cargar(true);
      setProcesando(null);
    }
  };

  const asignadosOrdenados = useMemo(
    () =>
      [...(asignados ?? [])].sort((a, b) => {
        const orden = (r: Reclamo) => (r.estado === 'RESUELTO' ? 1 : 0);
        return orden(a) - orden(b) || b.id - a.id;
      }),
    [asignados],
  );

  const tabs: { id: Pestania; label: string; count: number | null }[] = [
    { id: 'sin-asignar', label: 'Sin asignar (mi área)', count: sinAsignar?.length ?? null },
    { id: 'asignados', label: 'Mis reclamos asignados', count: asignados?.length ?? null },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Gestión técnica"
        title="Reclamos"
        description={`${perfil.nombre} ${perfil.apellido} · ${
          perfil.especialidad ? `Área: ${perfil.especialidad}` : 'Sin especialidad asignada'
        }. Tomá los reclamos de tu área y cargá la solución para que el cliente la vea.`}
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Reclamos' }]}
        icon={<Wrench size={28} />}
      />

      <div className="container-site flex flex-col gap-6 py-8 sm:py-12">
        {!perfil.especialidad && (
          <div role="alert" className="rounded-2xl border border-coop-orange/30 bg-coop-orange-soft p-5 text-[15px]">
            Tu ficha de empleado todavía no tiene una <strong>especialidad</strong>, por eso no ves reclamos sin asignar. Pedile al administrador que
            la cargue.
          </div>
        )}

        <section className="card overflow-hidden" aria-label="Bandeja de reclamos">
          <div className="border-b border-coop-line-soft p-5 sm:p-6">
            <div role="tablist" aria-label="Bandeja de reclamos" className="flex flex-col gap-1 rounded-xl bg-coop-ground p-1 sm:flex-row">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={pestania === t.id}
                  onClick={() => setPestania(t.id)}
                  className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors ${
                    pestania === t.id ? 'bg-white text-coop-navy shadow-sm' : 'text-coop-muted hover:text-coop-ink'
                  }`}
                >
                  {t.label}
                  {t.count != null && (
                    <span
                      className={`rounded-full px-2 text-xs ${
                        t.id === 'sin-asignar' && t.count > 0 ? 'bg-coop-orange text-white' : 'bg-coop-line-soft text-coop-muted'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="p-6">
              <PerfilError message={error.mensaje} status={error.status} onRetry={() => cargar()} />
            </div>
          ) : sinAsignar === null || asignados === null ? (
            <div className="p-6">
              <LoadingState label="Cargando reclamos…" />
            </div>
          ) : pestania === 'sin-asignar' ? (
            sinAsignar.length === 0 ? (
              <EmptyState
                icon={<TicketIcon size={28} />}
                title="No hay reclamos sin asignar en tu área"
                text="Cuando un cliente cargue un reclamo de tu especialidad, aparece acá."
              />
            ) : (
              <ul className="divide-y divide-coop-line-soft">
                {sinAsignar.map((r) => (
                  <li key={r.id} className="p-5 sm:px-6">
                    <ReclamoEmpleadoCabecera reclamo={r} />
                    <div className="mt-4 flex justify-end">
                      <button type="button" onClick={() => asignarme(r)} disabled={procesando === r.id} className="btn-primary">
                        {procesando === r.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Asignando…
                          </>
                        ) : (
                          'Asignarme'
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : asignadosOrdenados.length === 0 ? (
            <EmptyState
              icon={<Wrench size={28} />}
              title="Todavía no tomaste ningún reclamo"
              text="Asignate uno desde la pestaña “Sin asignar (mi área)”."
            />
          ) : (
            <ul className="divide-y divide-coop-line-soft">
              {asignadosOrdenados.map((r) => (
                <ReclamoAsignadoItem key={`${r.id}-${r.estado}`} reclamo={r} procesando={procesando === r.id} onActualizar={actualizar} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

//Datos del reclamo + del cliente, para el técnico
function ReclamoEmpleadoCabecera({ reclamo }: { reclamo: Reclamo }) {
  const c = reclamo.cliente;
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-coop-muted">
            <span className="font-mono font-semibold text-coop-navy">#{reclamo.id}</span>
            {reclamo.fechaCreacion && <span>{formatearFechaSimple(reclamo.fechaCreacion)}</span>}
            {reclamo.tipoIncidenteNombre && (
              <span className="rounded-md bg-coop-ground px-2 py-0.5 font-semibold">{reclamo.tipoIncidenteNombre}</span>
            )}
            {reclamo.gravedad && <Badge tone={tonoGravedad(reclamo.gravedad)}>Gravedad {reclamo.gravedad.toLowerCase()}</Badge>}
          </div>
          <p className="mt-1 font-semibold">{reclamo.descripcion}</p>
        </div>
        <EstadoBadge estado={reclamo.estado} />
      </div>

      {c && (
        <dl className="mt-3 grid gap-2 rounded-xl bg-coop-ground p-4 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <User size={16} className="mt-0.5 shrink-0 text-coop-muted" aria-hidden="true" />
            <div>
              <dt className="sr-only">Cliente</dt>
              <dd className="font-semibold">
                {c.nombre} {c.apellido}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={16} className="mt-0.5 shrink-0 text-coop-muted" aria-hidden="true" />
            <div>
              <dt className="sr-only">Teléfono</dt>
              <dd>{c.telefono || 'Sin teléfono'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-coop-muted" aria-hidden="true" />
            <div>
              <dt className="sr-only">Domicilio</dt>
              <dd>{c.domicilio || 'Sin domicilio cargado'}</dd>
            </div>
          </div>
        </dl>
      )}
    </div>
  );
}

function ReclamoAsignadoItem({
  reclamo,
  procesando,
  onActualizar,
}: {
  reclamo: Reclamo;
  procesando: boolean;
  onActualizar: (reclamo: Reclamo, estado: 'EN_PROCESO' | 'RESUELTO', observaciones: string) => void;
}) {
  const [nota, setNota] = useState(reclamo.observacionesResolucion ?? '');
  const resuelto = reclamo.estado === 'RESUELTO';
  const idNota = `nota-${reclamo.id}`;

  return (
    <li className="p-5 sm:px-6">
      <ReclamoEmpleadoCabecera reclamo={reclamo} />

      {resuelto ? (
        <div className="mt-4 rounded-xl border border-coop-green/30 bg-coop-green-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-coop-muted">Observaciones de la resolución</p>
          <p className="mt-1 whitespace-pre-line">{reclamo.observacionesResolucion}</p>
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor={idNota} className="field-label">
            Observación técnica <span className="text-xs font-normal text-coop-muted">(la ve el cliente)</span>
          </label>
          <textarea
            id={idNota}
            rows={3}
            maxLength={1000}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: se reemplazó el conector de fibra y se verificó la señal en el módem."
            className="field resize-y"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onActualizar(reclamo, 'EN_PROCESO', nota)}
              disabled={procesando || !nota.trim()}
              className="btn-outline"
            >
              Guardar nota
            </button>
            <button
              type="button"
              onClick={() => onActualizar(reclamo, 'RESUELTO', nota)}
              disabled={procesando || !nota.trim()}
              className="btn-primary"
            >
              {procesando ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Guardando…
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} aria-hidden="true" /> Marcar como resuelto
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
