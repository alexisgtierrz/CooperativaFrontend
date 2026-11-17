import { useState, type FormEvent } from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { SITE } from '../../config/site';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export default function CoverageSection() {
  const [direccion, setDireccion] = useState('');
  const [consultada, setConsultada] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (direccion.trim()) setConsultada(direccion.trim());
  };

  const whatsapp = `${SITE.whatsappHref}?text=${encodeURIComponent(
    `Hola, quiero saber si hay cobertura de fibra óptica en ${consultada}.`,
  )}`;

  return (
    <section id="cobertura" aria-labelledby="cobertura-t" className="py-16 sm:py-20">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2">
        <div className="lg:order-2">
          <span className="eyebrow">Cobertura y obras</span>
          <h2 id="cobertura-t" className="title-section mb-3 mt-2">
            ¿Llega la fibra a tu casa?
          </h2>
          <p className="mb-6 max-w-[460px] text-coop-muted">
            Ingresá tu dirección y te decimos si tu domicilio tiene cobertura o si está dentro de una obra en curso.
          </p>
          <form onSubmit={onSubmit} className="flex max-w-[460px] flex-col gap-2">
            <label htmlFor="direccion" className="font-semibold">
              Calle y número
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id="direccion"
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: San Martín 1250"
                autoComplete="street-address"
                className="field flex-1"
              />
              <button type="submit" className="btn-primary px-[22px]">
                Consultar
              </button>
            </div>
          </form>

          {consultada && (
            <div role="status" className="mt-5 max-w-[460px] rounded-2xl border border-coop-green/25 bg-coop-green-soft p-4">
              <p className="font-semibold text-coop-green-dark">
                Recibimos tu consulta para <span className="text-coop-ink">{consultada}</span>.
              </p>
              <p className="mt-1 text-[15px] text-coop-muted">
                Un asesor te confirma la cobertura y los planes disponibles en tu zona.
              </p>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 px-4 py-2.5 text-[15px]">
                <MessageCircle size={18} aria-hidden="true" /> Consultar por WhatsApp
              </a>
            </div>
          )}
        </div>

        <div className="relative h-[300px] overflow-hidden rounded-[20px] border border-coop-line-strong bg-[#E4ECF3] sm:h-[360px] lg:order-1">
          {MAPS_KEY && consultada ? (
            <iframe
              title={`Mapa de ${consultada}`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(consultada)}`}
            />
          ) : (
            <MapaIlustrativo />
          )}
        </div>
      </div>
    </section>
  );
}

/** Mapa de referencia mientras no se consulta una dirección (o si no hay API key de Google Maps) */
function MapaIlustrativo() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 46px, #D3DEE8 46px, #D3DEE8 48px), repeating-linear-gradient(90deg, transparent 0px, transparent 62px, #D3DEE8 62px, #D3DEE8 64px)',
        }}
      />
      <div className="absolute left-[22%] top-[30%] h-[38%] w-[34%] rounded-[40%_55%_45%_50%] border-2 border-coop-green bg-coop-green/20" />
      <div className="absolute left-[58%] top-[52%] h-[26%] w-[22%] rounded-[50%_40%_55%_45%] border-2 border-dashed border-coop-orange bg-coop-orange/20" />
      <span className="absolute left-[36%] top-[42%] text-coop-navy">
        <MapPin size={34} fill="#FFFFFF" />
      </span>
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm shadow-soft">
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded border-2 border-coop-green bg-coop-green/30" />
          Con cobertura
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded border-2 border-dashed border-coop-orange bg-coop-orange/20" />
          Obra en curso
        </span>
      </div>
      <span className="absolute right-3.5 top-3.5 rounded-full bg-coop-navy-dark/80 px-2.5 py-1 text-[13px] text-white">
        Mapa de cobertura
      </span>
    </div>
  );
}
