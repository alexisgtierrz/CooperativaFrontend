import { NUMEROS } from '../../data/contenido';

export default function StatsBand() {
  return (
    <section aria-labelledby="numeros" className="bg-coop-green py-12 text-white sm:py-14">
      <div className="container-site">
        <h2 id="numeros" className="sr-only">
          La cooperativa en números
        </h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-8 text-center lg:grid-cols-4">
          {NUMEROS.map((n) => (
            <div key={n.texto} className="flex flex-col-reverse">
              <dt className="text-[15px] text-[#E2F4E9] sm:text-base">{n.texto}</dt>
              <dd className="font-display text-[44px] font-bold leading-none sm:text-[56px]">{n.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
