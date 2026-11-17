import { MessageCircle } from 'lucide-react';
import { SITE } from '../../config/site';

export default function WhatsAppButton() {
  return (
    <a
      href={SITE.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-coop-green text-white shadow-[0_10px_24px_rgba(8,42,73,.3)] transition-transform hover:scale-105 hover:bg-coop-green-dark sm:bottom-6 sm:right-6 sm:h-[60px] sm:w-[60px]"
    >
      <MessageCircle size={28} aria-hidden="true" />
    </a>
  );
}
