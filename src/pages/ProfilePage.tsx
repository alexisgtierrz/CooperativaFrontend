import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CalendarClock,
  ChevronRight,
  IdCard,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Rss,
  Ticket as TicketIcon,
  User,
} from 'lucide-react';
import { Badge, EmptyState, LoadingState, PageHeader } from '../components/ui';
import PerfilError from '../components/PerfilError';
import { usePerfilActual } from '../hooks/usePerfilActual';
import { estadoTicket, formatearFechaSimple, tonoEstadoTicket } from '../lib/format';

export default function ProfilePage() {
  const { data: userData, loading, error, status, reload } = usePerfilActual();

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Mi perfil"
        description="Tus datos de asociado, tus servicios activos y el estado de tus reclamos."
        crumbs={[{ label: 'Oficina Virtual' }, { label: 'Mi perfil' }]}
        icon={<User size={28} />}
      />

      <div className="container-site py-8 sm:py-12">
        {loading ? (
          <LoadingState label="Cargando perfil…" />
        ) : !userData ? (
          <PerfilError message={error || 'No se encontró información de perfil para este usuario.'} status={status} onRetry={reload} />
        ) : (
          <PerfilContenido data={userData} />
        )}
      </div>
    </>
  );
}

function PerfilContenido({ data }: { data: NonNullable<ReturnType<typeof usePerfilActual>['data']> }) {
  const { tipoUsuario, usuario, perfil } = data;
  const esCliente = tipoUsuario === 'CLIENTE';
  const activas = (perfil.suscripciones ?? []).filter((s) => !s.fechaBaja);
  const tickets = perfil.tickets ?? [];
  const dom = perfil.domicilio;
  const iniciales = `${perfil.nombre?.[0] ?? ''}${perfil.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Columna izquierda: identidad y credenciales */}
      <div className="flex flex-col gap-6">
        <div className="card flex flex-col items-center p-6 text-center sm:p-8">
          <span className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-coop-green-soft font-display text-4xl font-bold text-coop-green">
            {iniciales || <User size={44} aria-hidden="true" />}
          </span>
          <h2 className="text-2xl font-bold">
            {perfil.nombre} {perfil.apellido}
          </h2>
          <div className="mt-2">
            <Badge tone={esCliente ? 'blue' : 'gray'}>{tipoUsuario}</Badge>
          </div>
          {esCliente && (
            <div className="mt-5 w-full rounded-2xl bg-coop-ground p-4">
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-coop-muted">
                <IdCard size={16} aria-hidden="true" /> N° de asociado
              </p>
              <p className="font-display text-4xl font-bold text-coop-navy">{String(perfil.id).padStart(5, '0')}</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <CardTitle>Credenciales</CardTitle>
          <dl className="space-y-4">
            <Dato icon={<Mail size={18} />} label="Email" value={usuario.email} />
            <Dato icon={<Lock size={18} />} label="Contraseña" value="********" />
          </dl>
        </div>

        <nav aria-label="Accesos de la Oficina Virtual" className="card overflow-hidden">
          <AccesoFila to="/vencimientos" icon={<CalendarClock size={20} />} label="Próximos vencimientos" />
          <AccesoFila to="/reclamos" icon={<MessageSquare size={20} />} label="Mis reclamos" />
          <AccesoFila to="/reclamos?nuevo=1" icon={<TicketIcon size={20} />} label="Iniciar un reclamo" last />
        </nav>
      </div>

      {/* Columna derecha: datos del rol */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <section className="card p-6" aria-labelledby="info-personal">
          <CardTitle id="info-personal">Información personal</CardTitle>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato icon={<Phone size={18} />} label="Teléfono" value={perfil.telefono || '—'} accent />
            {esCliente && (
              <>
                <Dato
                  icon={<Activity size={18} />}
                  label="Estado de cuenta"
                  value={
                    perfil.activo ? (
                      <span className="text-coop-green">Activo al día</span>
                    ) : (
                      <span className="text-red-600">Suspendido</span>
                    )
                  }
                  accent
                />
                {perfil.dni && <Dato icon={<IdCard size={18} />} label="DNI" value={perfil.dni} accent />}
                {perfil.email && <Dato icon={<Mail size={18} />} label="Email de contacto" value={perfil.email} accent />}
                {dom && (
                  <Dato
                      className="sm:col-span-2"
                      icon={<MapPin size={18} />}
                      label="Domicilio de servicio"
                      value={
                        <>
                          {dom.calle} {dom.numero}
                          {dom.piso ? `, piso ${dom.piso}` : ''}
                          {dom.departamento ? ` ${dom.departamento}` : ''}, B° {dom.barrio?.nombre || 'Centro'}
                          {dom.barrio?.localidad?.nombre ? ` – ${dom.barrio.localidad.nombre}` : ''}
                        </>
                      }
                      accent
                    />
                )}
              </>
            )}
          </dl>
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-coop-line-soft bg-coop-ground p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-[15px] text-coop-muted">
              <Pencil size={18} className="mt-0.5 shrink-0 text-coop-navy" aria-hidden="true" />
              ¿Cambiaron tus datos? Pedí la actualización y la cargamos por vos.
            </p>
            <Link to="/contacto?asunto=Actualizar%20mis%20datos" className="btn-outline whitespace-nowrap px-4 py-2">
              Actualizar datos
            </Link>
          </div>
        </section>

        {esCliente && (
          <>
            <section className="card p-6" aria-labelledby="mis-suscripciones">
              <CardTitle id="mis-suscripciones" icon={<Rss size={16} />}>
                Mis suscripciones
              </CardTitle>
              {activas.length === 0 ? (
                <p className="italic text-coop-muted">No tenés servicios activos actualmente.</p>
              ) : (
                <ul className="space-y-3">
                  {activas.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-coop-line-soft bg-coop-ground px-4 py-3"
                    >
                      <div>
                        <span className="font-semibold">{sub.servicio?.nombre}</span>
                        <span className="block text-sm text-coop-muted">Alta: {formatearFechaSimple(sub.fechaAlta)}</span>
                      </div>
                      <Badge tone="green">Activa</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-6" aria-labelledby="mis-tickets">
              <div className="flex items-start justify-between gap-3">
                <CardTitle id="mis-tickets" icon={<TicketIcon size={16} />}>
                  Mis tickets de soporte
                </CardTitle>
                {tickets.length > 0 && (
                  <Link to="/reclamos" className="link text-sm">
                    Ver todos
                  </Link>
                )}
              </div>
              {tickets.length === 0 ? (
                <EmptyState
                  icon={<TicketIcon size={28} />}
                  title="No tenés reclamos registrados"
                  action={
                    <Link to="/reclamos?nuevo=1" className="btn-primary">
                      Iniciar un reclamo
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {tickets.slice(0, 4).map((ticket) => {
                    const estado = estadoTicket(ticket);
                    return (
                      <li
                        key={ticket.id}
                        className="flex flex-col gap-2 rounded-xl border border-coop-line-soft bg-coop-ground px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-xs text-coop-muted">#{ticket.id}</span>
                          <p className="font-medium">{ticket.descripcion}</p>
                        </div>
                        <Badge tone={tonoEstadoTicket(estado)}>{estado}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function CardTitle({ children, id, icon }: { children: ReactNode; id?: string; icon?: ReactNode }) {
  return (
    <h3 id={id} className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-coop-muted">
      {icon}
      {children}
    </h3>
  );
}

function Dato({
  icon,
  label,
  value,
  accent = false,
  className = '',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-start gap-3 ${className}`}>
      <span className={`mt-0.5 ${accent ? 'text-coop-green' : 'text-coop-muted'}`} aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-coop-muted">{label}</dt>
        <dd className="break-words font-semibold">{value}</dd>
      </div>
    </div>
  );
}

function AccesoFila({ to, icon, label, last = false }: { to: string; icon: ReactNode; label: string; last?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex min-h-[56px] items-center gap-3 px-5 font-semibold hover:bg-coop-ground ${last ? '' : 'border-b border-coop-line-soft'}`}
    >
      <span className="text-coop-green" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={18} className="text-[#8A97A5]" aria-hidden="true" />
    </Link>
  );
}
