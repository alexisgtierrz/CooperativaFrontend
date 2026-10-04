import { Link } from 'react-router-dom';
import { AlertCircle, CalendarClock, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { Badge, EmptyState, LoadingState, PageHeader } from '../components/ui';
import PerfilError from '../components/PerfilError';
import { usePerfilActual } from '../hooks/usePerfilActual';
import { formatearFechaSimple, getEstadoVencimiento, type EstadoVencimiento } from '../lib/format';

const ICONOS: Record<EstadoVencimiento['nivel'], typeof Clock> = {
  vencido: ShieldAlert,
  hoy: AlertCircle,
  proximo: Clock,
  ok: CheckCircle2,
  'sin-fecha': Clock,
};

const BARRA: Record<EstadoVencimiento['nivel'], string> = {
  vencido: 'bg-red-500',
  hoy: 'bg-red-500',
  proximo: 'bg-coop-orange',
  ok: 'bg-coop-green',
  'sin-fecha': 'bg-coop-line-strong',
};

export default function VencimientosPage() {
  const { data, loading, error, status, reload } = usePerfilActual();

  // Solo las suscripciones activas (sin fecha de baja), igual que antes; ordenadas por la más próxima a vencer
  const suscripciones =
    data?.tipoUsuario === 'CLIENTE'
      ? (data.perfil?.suscripciones ?? [])
          .filter((s) => !s.fechaBaja)
          .sort((a, b) => (a.fechaHasta ?? '9999').localeCompare(b.fechaHasta ?? '9999'))
      : [];

  const urgentes = suscripciones.filter((s) => {
    const n = getEstadoVencimiento(s.fechaHasta).nivel;
    return n === 'vencido' || n === 'hoy' || n === 'proximo';
  }).length;

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Próximos vencimientos"
        description="Consultá el estado y el vencimiento de tus servicios contratados."
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Vencimientos' }]}
        icon={<CalendarClock size={28} />}
      >
        {!loading && data && suscripciones.length > 0 && (
          <div className="flex gap-3">
            <Resumen valor={suscripciones.length} texto={suscripciones.length === 1 ? 'servicio activo' : 'servicios activos'} />
            <Resumen valor={urgentes} texto="vencen en 7 días o menos" alerta={urgentes > 0} />
          </div>
        )}
      </PageHeader>

      <div className="container-site py-8 sm:py-12">
        {loading ? (
          <LoadingState label="Cargando tus vencimientos…" />
        ) : !data ? (
          <PerfilError message={error} status={status} onRetry={reload} />
        ) : suscripciones.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<CheckCircle2 size={30} />}
              title="No tenés servicios activos próximos a vencer"
              text="Cuando contrates un servicio vas a ver acá su fecha de vencimiento."
              action={
                <Link to="/servicios" className="btn-navy">
                  Ver planes
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {suscripciones.map((sub) => {
              const estado = getEstadoVencimiento(sub.fechaHasta);
              const Icon = ICONOS[estado.nivel];
              return (
                <li key={sub.id} className="card relative flex flex-col gap-4 overflow-hidden p-5 pl-6 sm:p-6 sm:pl-7">
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${BARRA[estado.nivel]}`} aria-hidden="true" />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-xl font-bold">{sub.servicio?.nombre || 'Servicio contratado'}</h2>
                    <Badge tone={estado.tono} icon={<Icon size={15} aria-hidden="true" />}>
                      {estado.texto}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 rounded-xl bg-coop-ground p-4">
                    <div>
                      <dt className="text-xs text-coop-muted">Fecha de alta</dt>
                      <dd className="font-semibold">{formatearFechaSimple(sub.fechaAlta) || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-coop-muted">Vencimiento exacto</dt>
                      <dd className="font-bold">{formatearFechaSimple(sub.fechaHasta) || '—'}</dd>
                    </div>
                  </dl>
                  {(estado.nivel === 'vencido' || estado.nivel === 'hoy' || estado.nivel === 'proximo') && (
                    <Link to="/#pagos" className="link self-start text-[15px]">
                      Ver medios de pago →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coop-navy/15 bg-coop-blue-soft p-4 sm:p-5">
          <AlertCircle className="mt-0.5 shrink-0 text-coop-navy" size={20} aria-hidden="true" />
          <p className="text-[15px] text-coop-navy">
            <strong>Importante:</strong> las suscripciones tienen una validez de 1 mes calendario. Si no se registra el pago antes de la
            fecha de vencimiento, el servicio se da de baja automáticamente.
          </p>
        </div>
      </div>
    </>
  );
}

function Resumen({ valor, texto, alerta = false }: { valor: number; texto: string; alerta?: boolean }) {
  return (
    <div className={`min-w-[120px] rounded-2xl px-4 py-3 ${alerta ? 'bg-coop-orange' : 'bg-white/10'}`}>
      <div className="font-display text-4xl font-bold leading-none">{valor}</div>
      <div className="text-sm text-white/85">{texto}</div>
    </div>
  );
}
