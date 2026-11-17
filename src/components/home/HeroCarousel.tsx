import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { SLIDES, type Slide } from '../../data/contenido';
import { useAuth } from '../../context/auth-context';

const INTERVALO_MS = 6000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Carrusel principal del inicio.
 * - Avanza solo cada 6 s (se detiene con el mouse encima, con foco adentro o con el botón de pausa)
 * - Flechas, puntos, teclado (← →) y deslizamiento con el dedo
 * - Si falta la foto muestra un fondo de referencia con la foto sugerida
 */
export default function HeroCarousel() {
  const n = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (!playing || hovered || focusWithin) return;
    const t = window.setTimeout(() => go(index + 1), INTERVALO_MS);
    return () => window.clearTimeout(t);
  }, [playing, hovered, focusWithin, index, go]);

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados de la cooperativa"
      className="relative h-[620px] overflow-hidden bg-coop-navy-deep sm:h-[580px] lg:h-[600px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        aria-live={playing ? 'off' : 'polite'}
      >
        {SLIDES.map((slide, i) => (
          <SlideView
            key={slide.titulo}
            slide={slide}
            i={i}
            total={n}
            active={i === index}
            photoFailed={Boolean(failed[i])}
            onPhotoError={() => setFailed((f) => ({ ...f, [i]: true }))}
          />
        ))}
      </div>

      {/* Flechas laterales en pantallas grandes; en las demás van junto a los puntos (y se puede deslizar con el dedo) */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Diapositiva anterior"
        className="absolute left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-coop-navy-dark/55 text-white transition-colors hover:bg-coop-navy-dark xl:flex"
      >
        <ChevronLeft size={24} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Diapositiva siguiente"
        className="absolute right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-coop-navy-dark/55 text-white transition-colors hover:bg-coop-navy-dark xl:flex"
      >
        <ChevronRight size={24} strokeWidth={2.4} />
      </button>

      {/* Pausa + puntos */}
      <div className="absolute inset-x-0 bottom-[64px] flex items-center justify-center gap-0.5 sm:bottom-[96px]">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pausar el carrusel' : 'Reproducir el carrusel'}
          className="flex h-11 w-11 items-center justify-center text-white"
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Diapositiva anterior"
          className="flex h-11 w-11 items-center justify-center text-white xl:hidden"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
        {SLIDES.map((s, i) => (
          <button
            key={s.titulo}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a la diapositiva ${i + 1}: ${s.titulo}`}
            aria-current={i === index ? 'true' : undefined}
            className="flex h-11 w-11 items-center justify-center p-0"
          >
            <span
              className={`block h-2.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-[30px] bg-white' : 'w-2.5 bg-white/55'
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Diapositiva siguiente"
          className="flex h-11 w-11 items-center justify-center text-white xl:hidden"
        >
          <ChevronRight size={22} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}

function SlideView({
  slide,
  i,
  total,
  active,
  photoFailed,
  onPhotoError,
}: {
  slide: Slide;
  i: number;
  total: number;
  active: boolean;
  photoFailed: boolean;
  onPhotoError: () => void;
}) {
  const { requireAuth } = useAuth();
  const Heading = i === 0 ? 'h1' : 'h2';

  return (
    <div
      role="group"
      aria-roledescription="diapositiva"
      aria-label={`${i + 1} de ${total}`}
      aria-hidden={!active}
      inert={!active}
      className="relative h-full flex-[0_0_100%]"
    >
      {/* Fondo: foto o placeholder rayado */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(135deg, ${slide.fondo[0]} 0px, ${slide.fondo[0]} 22px, ${slide.fondo[1]} 22px, ${slide.fondo[1]} 44px)`,
        }}
      />
      {!photoFailed && (
        <img
          src={slide.imagen}
          alt=""
          onError={onPhotoError}
          loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Velo para que el texto se lea sobre cualquier foto */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: 'linear-gradient(180deg, rgba(5,20,36,.55) 0%, rgba(5,20,36,.85) 55%, rgba(5,20,36,.92) 100%)' }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{ background: 'linear-gradient(90deg, rgba(5,20,36,.92) 0%, rgba(5,20,36,.62) 48%, rgba(5,20,36,.05) 82%)' }}
      />

      {photoFailed && (
        <div className="absolute bottom-[76px] right-6 hidden items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[13px] text-white lg:flex">
          <Camera size={16} aria-hidden="true" />
          FOTO: {slide.fotoSugerida}
        </div>
      )}

      <div className="container-site relative flex h-full flex-col justify-center pb-[118px] pt-8 sm:pb-[140px] md:pb-28">
        <span className="text-[13px] font-bold uppercase tracking-[2px] text-coop-mint sm:text-sm">{slide.eyebrow}</span>
        <Heading className="mb-4 mt-3 max-w-[640px] font-display text-[clamp(40px,6vw,76px)] font-bold uppercase leading-[.95] text-white sm:mb-[18px] sm:mt-3.5">
          {slide.titulo}
        </Heading>
        <p className="mb-6 max-w-[520px] text-[17px] text-[#E3ECF4] sm:mb-[30px] sm:text-[19px]">{slide.texto}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {slide.ctas.map((cta) => {
            const className = cta.variante === 'primary' ? 'btn-primary px-[22px] py-3.5' : 'btn-ghost-light px-[22px] py-3.5';
            const content = (
              <>
                {cta.label}
                {cta.variante === 'primary' && <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />}
              </>
            );
            return cta.auth ? (
              <button key={cta.label} type="button" onClick={() => requireAuth(cta.to)} className={className}>
                {content}
              </button>
            ) : (
              <Link key={cta.label} to={cta.to} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
