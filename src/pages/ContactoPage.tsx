import { useState, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { SITE } from '../config/site';

export default function ContactoPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: params.get('asunto') ?? '',
    mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);

  const set = (campo: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // No hay endpoint de contacto en el backend: se arma el correo con los datos del formulario
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cuerpo = `${form.mensaje}\n\n—\n${form.nombre}\n${form.email}${form.telefono ? `\nTel: ${form.telefono}` : ''}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(form.asunto || 'Consulta desde la web')}&body=${encodeURIComponent(cuerpo)}`;
    setEnviado(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Atención al asociado"
        title="Contacto"
        description="Escribinos, llamanos o acercate a la sede. Te respondemos en el día hábil."
        crumbs={[{ label: 'Contacto' }]}
        icon={<Mail size={28} />}
      />

      <div className="container-site grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Canal icon={<Phone size={22} />} titulo="Teléfono" tono="bg-coop-blue-soft text-coop-navy">
            <a href={SITE.telefonoHref} className="link">
              {SITE.telefono}
            </a>
            <span className="block text-[15px] text-coop-muted">Guardia técnica las 24 h</span>
          </Canal>
          <Canal icon={<MessageCircle size={22} />} titulo="WhatsApp" tono="bg-coop-green-soft text-coop-green">
            <a href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="link">
              Escribinos por WhatsApp
            </a>
            <span className="block text-[15px] text-coop-muted">Consultas, reclamos y pagos</span>
          </Canal>
          <Canal icon={<Mail size={22} />} titulo="Email" tono="bg-coop-orange-soft text-coop-orange">
            <a href={`mailto:${SITE.email}`} className="link break-all">
              {SITE.email}
            </a>
          </Canal>
          <Canal icon={<MapPin size={22} />} titulo="Sede central" tono="bg-coop-blue-soft text-coop-navy">
            <span className="font-semibold">{SITE.direccion}</span>
            <span className="flex items-center gap-1.5 text-[15px] text-coop-muted">
              <Clock size={15} aria-hidden="true" /> {SITE.horario}
            </span>
          </Canal>
        </div>

        <section aria-labelledby="form-t" className="card p-5 shadow-soft sm:p-8">
          <span className="eyebrow">Formulario</span>
          <h2 id="form-t" className="mb-6 mt-1 font-display text-3xl font-bold uppercase leading-none text-coop-navy">
            Dejanos tu consulta
          </h2>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-nombre" className="field-label">
                Nombre y apellido
              </label>
              <input id="c-nombre" required autoComplete="name" value={form.nombre} onChange={set('nombre')} className="field" />
            </div>
            <div>
              <label htmlFor="c-tel" className="field-label">
                Teléfono <span className="font-normal text-coop-muted">(opcional)</span>
              </label>
              <input id="c-tel" type="tel" autoComplete="tel" value={form.telefono} onChange={set('telefono')} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-email" className="field-label">
                Email
              </label>
              <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-asunto" className="field-label">
                Asunto
              </label>
              <input id="c-asunto" required value={form.asunto} onChange={set('asunto')} className="field" placeholder="Ej: Quiero contratar Fibra 300" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-msj" className="field-label">
                Mensaje
              </label>
              <textarea id="c-msj" required rows={5} value={form.mensaje} onChange={set('mensaje')} className="field resize-y" />
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-coop-muted">Al enviar se abre tu aplicación de correo con el mensaje listo.</p>
              <button type="submit" className="btn-primary">
                <Send size={18} aria-hidden="true" /> Enviar consulta
              </button>
            </div>
            {enviado && (
              <p role="status" className="rounded-xl bg-coop-green-soft px-4 py-3 font-semibold text-coop-green-dark sm:col-span-2">
                Listo: revisá tu aplicación de correo para terminar el envío.
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}

function Canal({ icon, titulo, tono, children }: { icon: ReactNode; titulo: string; tono: string; children: ReactNode }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${tono}`} aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-bold uppercase tracking-wider text-coop-muted">{titulo}</h3>
        <div className="mt-0.5 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
