import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, CreditCard, Loader2, ShieldAlert } from 'lucide-react';
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader } from '../components/ui';
import { crearPreferencia, formatearImporte, listarMisFacturas, mensajeDeError, nombrePeriodo } from '../lib/facturas';
import { formatearFechaSimple } from '../lib/format';
import { useAuth } from '../context/auth-context';
import type { Factura } from '../types';

export default function PagarFacturaPage() {
  const { notify } = useAuth();
  const [facturas, setFacturas] = useState<Factura[] | null>(null);
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState<number | null>(null);
  //Factura cuyo pago se hizo en la pestaña de Mercado Pago y se espera confirmar desde acá
  const [esperando, setEsperando] = useState<Factura | null>(null);
  const [acreditada, setAcreditada] = useState<Factura | null>(null);
  const [verificando, setVerificando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    setFacturas(null);
    try {
      setFacturas(await listarMisFacturas('PENDIENTE'));
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar tus facturas.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  //Consulta si la factura que se esta pagando ya quedo acreditada (el backend concilia con Mercado Pago)
  const verificarPago = useCallback(async (esperada: Factura) => {
    try {
      const pendientes = await listarMisFacturas('PENDIENTE');
      setFacturas(pendientes);
      if (!pendientes.some((f) => f.id === esperada.id)) {
        setEsperando(null);
        setAcreditada(esperada);
        return true;
      }
    } catch {
      //se reintenta en el proximo ciclo
    }
    return false;
  }, []);

  //Mientras se espera el pago se consulta cada pocos segundos (hasta 15 minutos)
  useEffect(() => {
    if (!esperando) return;
    const inicio = Date.now();
    const timer = window.setInterval(async () => {
      if (Date.now() - inicio > 15 * 60 * 1000) {
        setEsperando(null);
        return;
      }
      await verificarPago(esperando);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [esperando, verificarPago]);

  const verificarAhora = async () => {
    if (!esperando) return;
    setVerificando(true);
    const ok = await verificarPago(esperando);
    setVerificando(false);
    if (!ok) notify('Todavía no vemos el pago acreditado. Si ya pagaste, esperá unos segundos y probá de nuevo.', 'info');
  };

  //Al volver a esta pestaña (p. ej. tras pagar en Mercado Pago) se refresca la lista en silencio
  useEffect(() => {
    const refrescar = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        setFacturas(await listarMisFacturas('PENDIENTE'));
      } catch {
      }
    };
    document.addEventListener('visibilitychange', refrescar);
    window.addEventListener('pageshow', refrescar);
    return () => {
      document.removeEventListener('visibilitychange', refrescar);
      window.removeEventListener('pageshow', refrescar);
    };
  }, []);

  const pagar = async (factura: Factura) => {
    setPagando(factura.id);
    try {
      const pref = await crearPreferencia(factura.id);
      const destino = pref.sandboxInitPoint || pref.initPoint;
      if (!destino) throw new Error('Mercado Pago no devolvió el enlace de pago.');
      //El checkout se abre en otra pestaña: esta queda esperando y se actualiza sola al acreditarse el pago
      const ventana = window.open(destino, '_blank');
      if (!ventana) {
        window.location.href = destino;
        return;
      }
      setAcreditada(null);
      setEsperando(factura);
      setPagando(null);
    } catch (e) {
      notify(mensajeDeError(e), 'error');
      setPagando(null);
    }
  };

  const total = (facturas ?? []).reduce((suma, f) => suma + f.montoTotal, 0);

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Pagá tu factura"
        description="Consultá tus facturas pendientes y pagalas online con Mercado Pago."
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Pagá tu factura' }]}
        icon={<CreditCard size={28} />}
      >
        {facturas && facturas.length > 0 && (
          <div className="min-w-[160px] rounded-2xl bg-coop-orange px-4 py-3">
            <div className="font-display text-4xl font-bold leading-none">{formatearImporte(total)}</div>
            <div className="text-sm text-white/85">
              {facturas.length === 1 ? '1 factura pendiente' : `${facturas.length} facturas pendientes`}
            </div>
          </div>
        )}
      </PageHeader>

      <div className="container-site py-8 sm:py-12">
        {esperando && (
          <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-coop-orange p-5" role="status">
            <div className="flex items-start gap-3">
              <Loader2 size={22} className="mt-0.5 shrink-0 animate-spin text-coop-orange" aria-hidden="true" />
              <div>
                <p className="font-bold">Esperando la confirmación de tu pago…</p>
                <p className="text-sm text-coop-muted">
                  Completá el pago de la factura N.º {esperando.id} en la pestaña de Mercado Pago. Cuando se acredite, esta
                  página se actualiza sola.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={verificarAhora} disabled={verificando} className="btn-primary">
                {verificando ? 'Verificando…' : 'Ya pagué, verificar'}
              </button>
              <button type="button" onClick={() => setEsperando(null)} className="btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        )}
        {acreditada && (
          <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-green-500 p-5" role="status">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
              <div>
                <p className="font-bold">¡Pago acreditado!</p>
                <p className="text-sm text-coop-muted">
                  La factura N.º {acreditada.id} ({formatearImporte(acreditada.montoTotal)}) quedó pagada. Ya podés cerrar la pestaña de
                  Mercado Pago.
                </p>
              </div>
            </div>
            <Link to="/vencimientos" className="btn-outline">
              Ver mis vencimientos
            </Link>
          </div>
        )}
        {error ? (
          <ErrorState
            message={error}
            action={
              <button type="button" onClick={cargar} className="btn-navy">
                Reintentar
              </button>
            }
          />
        ) : facturas === null ? (
          <LoadingState label="Buscando tus facturas…" />
        ) : facturas.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<CheckCircle2 size={30} />}
              title="¡Estás al día!"
              text="No registrás facturas pendientes de pago. Cuando se emita una nueva, la vas a ver acá."
            />
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {facturas.map((f) => (
              <li key={f.id} className="card relative flex flex-col gap-4 overflow-hidden p-5 pl-6 sm:p-6 sm:pl-7">
                <span className={`absolute inset-y-0 left-0 w-1.5 ${f.vencida ? 'bg-red-500' : 'bg-coop-orange'}`} aria-hidden="true" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Factura {nombrePeriodo(f.periodo)}</h2>
                    <p className="text-sm text-coop-muted">N.º {f.id}</p>
                  </div>
                  {f.vencida ? (
                    <Badge tone="red" icon={<ShieldAlert size={15} aria-hidden="true" />}>
                      Vencida
                    </Badge>
                  ) : (
                    <Badge tone="orange" icon={<CalendarClock size={15} aria-hidden="true" />}>
                      Pendiente
                    </Badge>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3 rounded-xl bg-coop-ground p-4">
                  <div className="col-span-2">
                    <dt className="text-xs text-coop-muted">Servicios</dt>
                    <dd className="font-semibold">{f.servicios.length > 0 ? f.servicios.join(', ') : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-coop-muted">Vencimiento</dt>
                    <dd className="font-semibold">{formatearFechaSimple(f.fechaVencimiento) || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-coop-muted">Importe</dt>
                    <dd className="font-bold">{formatearImporte(f.montoTotal)}</dd>
                  </div>
                </dl>

                <button type="button" onClick={() => pagar(f)} disabled={pagando !== null} className="btn-primary self-start">
                  {pagando === f.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Redirigiendo…
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} aria-hidden="true" /> Pagar con Mercado Pago
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
