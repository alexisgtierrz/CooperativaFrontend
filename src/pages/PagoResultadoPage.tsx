import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { confirmarPago, mensajeDeError } from '../lib/facturas';
import type { ResultadoPago } from '../types';

type Vista =
  | { tipo: 'verificando' }
  | { tipo: 'acreditado'; mensaje: string }
  | { tipo: 'pendiente'; mensaje: string }
  | { tipo: 'fallido'; mensaje: string };

//Vuelta desde Mercado Pago
export default function PagoResultadoPage() {
  const { estado } = useParams();
  const [params] = useSearchParams();
  const [vista, setVista] = useState<Vista>(
    estado === 'success' ? { tipo: 'verificando' } : { tipo: 'fallido', mensaje: 'El pago no se completó. No se te cobró nada.' },
  );
  const yaVerificado = useRef(false);

  const paymentId = params.get('payment_id') || params.get('collection_id');
  const statusUrl = params.get('status') || params.get('collection_status');

  useEffect(() => {
    if (yaVerificado.current) return;
    yaVerificado.current = true;

    if (estado === 'failure' || statusUrl === 'rejected' || statusUrl === 'cancelled') {
      setVista({ tipo: 'fallido', mensaje: 'El pago no se completó. No se te cobró nada: podés intentarlo de nuevo cuando quieras.' });
      return;
    }
    if (!paymentId) {
      setVista(
        estado === 'pending'
          ? { tipo: 'pendiente', mensaje: 'Tu pago quedó pendiente de acreditación. Cuando se confirme, la factura figurará como pagada.' }
          : { tipo: 'fallido', mensaje: 'No recibimos los datos del pago. Revisá tus facturas: si el pago se acreditó, ya no figura como pendiente.' },
      );
      return;
    }

    //El estado real lo confirma el backend contra Mercado Pago
    confirmarPago(paymentId)
      .then((r: ResultadoPago) => setVista(r.acreditado ? { tipo: 'acreditado', mensaje: r.mensaje } : { tipo: 'pendiente', mensaje: r.mensaje }))
      .catch((e) => setVista({ tipo: 'fallido', mensaje: mensajeDeError(e, 'No pudimos verificar tu pago.') }));
  }, [estado, paymentId, statusUrl]);

  const config = {
    verificando: { icono: <Loader2 size={34} className="animate-spin" />, titulo: 'Verificando tu pago…', tono: 'bg-coop-blue-soft text-coop-navy' },
    acreditado: { icono: <CheckCircle2 size={34} />, titulo: '¡Pago acreditado!', tono: 'bg-coop-green-soft text-coop-green' },
    pendiente: { icono: <Clock size={34} />, titulo: 'Pago pendiente', tono: 'bg-coop-orange-soft text-coop-orange' },
    fallido: { icono: <AlertTriangle size={34} />, titulo: 'No pudimos completar el pago', tono: 'bg-red-50 text-red-700' },
  }[vista.tipo];

  return (
    <>
      <PageHeader
        eyebrow="Oficina Virtual"
        title="Resultado del pago"
        crumbs={[{ label: 'Oficina Virtual', to: '/perfil' }, { label: 'Pagá tu factura', to: '/pagar-factura' }, { label: 'Resultado' }]}
        icon={<CreditCard size={28} />}
      />
      <div className="container-site py-8 sm:py-12">
        <div className="card mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-12 text-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config.tono}`}>{config.icono}</span>
          <h2 className="text-2xl font-bold">{config.titulo}</h2>
          {'mensaje' in vista && <p className="max-w-md text-coop-muted">{vista.mensaje}</p>}
          {vista.tipo !== 'verificando' && (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link to="/pagar-factura" className="btn-primary">
                Ver mis facturas
              </Link>
              <Link to="/vencimientos" className="btn-outline">
                Próximos vencimientos
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
