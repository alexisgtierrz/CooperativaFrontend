import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, FileText, ShieldCheck } from 'lucide-react';
import { MEDIOS_PAGO, TONOS } from '../../data/contenido';
import { useAuth } from '../../context/auth-context';

export default function PaymentsSection() {
  const { isAuthenticated, openLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <section id="pagos" aria-labelledby="pagos-t" className="border-y border-coop-line bg-white py-16 sm:py-20">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="eyebrow">Medios de pago</span>
          <h2 id="pagos-t" className="title-section mb-3 mt-2">
            Pagá como te quede más cómodo
          </h2>
          <p className="mb-6 max-w-[480px] text-coop-muted">Tu pago se acredita automáticamente en tu cuenta de asociado.</p>
          <ul className="flex flex-col gap-3">
            {MEDIOS_PAGO.map((m) => {
              const Icon = m.icono;
              return (
                <li key={m.titulo} className="flex items-center gap-4 rounded-[14px] border border-coop-line-soft p-4">
                  <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${TONOS[m.tono]}`} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span className="flex-1">
                    <strong className="block">{m.titulo}</strong>
                    <span className="text-[15px] text-coop-muted">{m.texto}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-[18px] rounded-[22px] bg-coop-navy p-6 text-white sm:p-10">
          <span className="self-start rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold uppercase tracking-[1.5px] text-coop-mint">
            Autogestión 24/7
          </span>
          <h2 className="font-display text-[40px] font-bold uppercase leading-none sm:text-5xl">Oficina Virtual</h2>
          <p className="max-w-[440px] text-[#D3E0EC]">
            Consultá tu estado de cuenta, revisá tus vencimientos y seguí tus reclamos desde tu casa.
          </p>

          <div className="rounded-[14px] border border-white/15 bg-white/5 px-4 py-1.5 sm:px-[18px]" aria-label="Ejemplo de estado de cuenta">
            <Row label="Factura septiembre" badge="Pagada" tone="bg-coop-mint/20 text-coop-mint" />
            <Row label="Factura octubre · vence 10/10" badge="Pendiente" tone="bg-[#FFB878]/20 text-[#FFC68F]" />
            <Row label="Reclamo #1042 · Sin conexión" badge="Técnico asignado" tone="bg-white/15 text-white" last />
          </div>

          <div className="flex flex-wrap gap-x-[22px] gap-y-2 text-[15px] text-[#D3E0EC]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} aria-hidden="true" /> Acceso seguro
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} aria-hidden="true" /> Disponible 24/7
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={16} aria-hidden="true" /> Factura digital
            </span>
          </div>

          <button
            type="button"
            onClick={() => (isAuthenticated ? navigate('/perfil') : openLogin())}
            className="btn-mint self-start px-6 py-3.5"
          >
            {isAuthenticated ? 'Ir a mi cuenta' : 'Ingresar'} <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, badge, tone, last = false }: { label: string; badge: string; tone: string; last?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 ${last ? '' : 'border-b border-white/10'}`}>
      <span>{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${tone}`}>{badge}</span>
    </div>
  );
}
