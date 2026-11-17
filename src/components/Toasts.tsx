import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastTone } from '../context/auth-context';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const toneStyles: Record<ToastTone, string> = {
  success: 'border-coop-green/30 bg-coop-green-soft text-coop-green-dark',
  info: 'border-coop-navy/20 bg-coop-blue-soft text-coop-navy',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export default function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[84px] z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
    >
      {items.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? XCircle : Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 font-semibold shadow-soft ${toneStyles[t.tone]}`}
          >
            <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="-mr-1 rounded p-1 opacity-70 hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
