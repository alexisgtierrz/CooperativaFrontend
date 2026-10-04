import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DialogProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** 'center' en escritorio; en celulares siempre sube desde abajo */
  size?: 'sm' | 'md';
}

/** Ventana modal accesible: cierra con Escape o clic afuera, bloquea el scroll y mantiene el foco adentro. */
export default function Dialog({ title, subtitle, onClose, children, size = 'sm' }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const firstField = panel?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
    firstField?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // El resto de la página queda inactivo mientras el diálogo está abierto
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      root?.removeAttribute('inert');
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-coop-navy-deep/60 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-card sm:rounded-3xl sm:p-8 ${
          size === 'md' ? 'sm:max-w-lg' : 'sm:max-w-md'
        }`}
      >
        <button
          type="button"
          data-close
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-coop-muted hover:bg-coop-ground hover:text-coop-ink"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>
        <h2 id={titleId} className="pr-10 font-display text-3xl font-bold uppercase leading-none text-coop-navy">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-coop-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
