import { Link } from 'react-router-dom';
import { Camera, HeartHandshake, Scale, Target, Users } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { NUMEROS } from '../data/contenido';

const VALORES = [
  { icon: HeartHandshake, titulo: 'Ayuda mutua', texto: 'Los servicios se sostienen entre todos los asociados y los excedentes vuelven a la comunidad.' },
  { icon: Scale, titulo: 'Gestión democrática', texto: 'Cada asociado tiene un voto en la asamblea, sin importar cuántos servicios tenga contratados.' },
  { icon: Target, titulo: 'Compromiso local', texto: 'Invertimos en obras para la ciudad y trabajamos con personal y proveedores de la zona.' },
  { icon: Users, titulo: 'Puertas abiertas', texto: 'Cualquier vecino puede asociarse y participar de las decisiones de la cooperativa.' },
];

const HITOS = [
  { anio: '[AÑO]', texto: 'Un grupo de vecinos funda la cooperativa para llevar telefonía a la ciudad.' },
  { anio: '[AÑO]', texto: 'Llega la televisión por cable y el canal comunitario.' },
  { anio: '[AÑO]', texto: 'Primeras conexiones a internet para asociados.' },
  { anio: '[AÑO]', texto: 'Comienza el tendido de la red de fibra óptica hasta el hogar.' },
  { anio: '2026', texto: 'Nueva Oficina Virtual: trámites, vencimientos y reclamos en línea.' },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="La cooperativa"
        title="Nosotros"
        description="Somos una cooperativa de servicios: nuestros dueños son los propios asociados."
        crumbs={[{ label: 'Nosotros' }]}
        icon={<Users size={28} />}
      />

      <section className="container-site grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Nuestra historia</span>
          <h2 className="title-section mb-4 mt-2">De vecinos, para vecinos</h2>
          <div className="flex flex-col gap-4 text-[17px] text-coop-muted">
            <p>
              La cooperativa nació de la necesidad de un grupo de vecinos de contar con servicios de comunicación de calidad en la
              ciudad. Desde entonces crecimos junto a la comunidad, sumando televisión, internet y, hoy, fibra óptica hasta el hogar.
            </p>
            <p>
              Cada peso que pagan los asociados se reinvierte en mejorar la red, sumar barrios y sostener la atención con personal
              local. [Completar con la historia real de la cooperativa].
            </p>
          </div>
        </div>
        <div className="photo-placeholder relative flex h-[280px] items-end justify-end rounded-[22px] p-4 sm:h-[360px]">
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[13px] text-coop-muted">
            <Camera size={16} aria-hidden="true" /> FOTO: fachada de la sede o primera comisión
          </span>
        </div>
      </section>

      <section aria-labelledby="valores" className="border-y border-coop-line bg-white py-12 sm:py-16">
        <div className="container-site">
          <span className="eyebrow">Lo que nos guía</span>
          <h2 id="valores" className="title-section mb-8 mt-2">
            Nuestros valores
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="rounded-[18px] border border-coop-line p-6">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-coop-green-soft text-coop-green" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <h3 className="text-xl font-bold">{titulo}</h3>
                <p className="mt-2 text-coop-muted">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="historia" className="container-site py-12 sm:py-16">
        <span className="eyebrow">Línea de tiempo</span>
        <h2 id="historia" className="title-section mb-8 mt-2">
          Nuestro recorrido
        </h2>
        <ol className="relative grid gap-6 border-l-2 border-coop-line pl-6 md:grid-cols-5 md:border-l-0 md:border-t-2 md:pl-0 md:pt-6">
          {HITOS.map((h, i) => (
            <li key={i} className="relative">
              <span
                className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-[3px] border-coop-ground bg-coop-green md:-top-[33px] md:left-0"
                aria-hidden="true"
              />
              <p className="font-display text-3xl font-bold text-coop-navy">{h.anio}</p>
              <p className="mt-1 text-coop-muted">{h.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-coop-green py-12 text-white">
        <dl className="container-site grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {NUMEROS.map((n) => (
            <div key={n.texto} className="flex flex-col-reverse">
              <dt className="text-[#E2F4E9]">{n.texto}</dt>
              <dd className="font-display text-[44px] font-bold leading-none sm:text-[56px]">{n.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-site flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase text-coop-navy">¿Querés asociarte?</h2>
          <p className="text-coop-muted">Acercate a la sede o dejanos tu consulta y te explicamos cómo.</p>
        </div>
        <Link to="/contacto?asunto=Quiero%20asociarme" className="btn-primary">
          Quiero asociarme
        </Link>
      </section>
    </>
  );
}
