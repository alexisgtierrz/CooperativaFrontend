import type { BadgeTone } from '../components/ui';
import type { Ticket } from '../types';

/** '2026-10-04' o '2026-10-04T00:00:00' → '04/10/2026' (sin problemas de zona horaria) */
export function formatearFechaSimple(fechaString?: string | null): string {
  if (!fechaString) return '';
  const fechaLimpia = fechaString.split('T')[0];
  const [year, month, day] = fechaLimpia.split('-');
  return `${day}/${month}/${year}`;
}

export interface EstadoVencimiento {
  texto: string;
  tono: BadgeTone;
  dias: number | null;
  nivel: 'vencido' | 'hoy' | 'proximo' | 'ok' | 'sin-fecha';
}

/** Días que faltan para una fecha y el color que le corresponde (misma regla que ya usaba VencimientosPage) */
export function getEstadoVencimiento(fechaHasta?: string | null): EstadoVencimiento {
  if (!fechaHasta) return { texto: 'Sin vencimiento', tono: 'gray', dias: null, nivel: 'sin-fecha' };

  const hoy = new Date();
  const vencimiento = new Date(`${fechaHasta.split('T')[0]}T00:00:00`);
  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      texto: `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`,
      tono: 'red',
      dias: diffDays,
      nivel: 'vencido',
    };
  if (diffDays === 0) return { texto: 'Vence HOY', tono: 'red', dias: 0, nivel: 'hoy' };
  if (diffDays <= 7)
    return { texto: `Vence en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`, tono: 'orange', dias: diffDays, nivel: 'proximo' };
  return { texto: `Vence en ${diffDays} días`, tono: 'green', dias: diffDays, nivel: 'ok' };
}

/** Estado actual de un ticket: el último cambio de estado abierto, o el campo `estado` si viene como texto */
export function estadoTicket(ticket: Ticket): string {
  if (ticket.estado) return ticket.estado;
  const historial = ticket.historialEstados ?? [];
  const vigente = historial.find((c) => !c.fechaHoraFin) ?? historial[historial.length - 1];
  return vigente?.estado?.nombre ?? 'Recibido';
}

export function tonoEstadoTicket(estado: string): BadgeTone {
  const e = estado.toLowerCase();
  if (/(resuel|cerrad|finaliz|solucion)/.test(e)) return 'green';
  if (/(cancel|rechaz)/.test(e)) return 'gray';
  if (/(asign|curso|proceso|visita|derivad)/.test(e)) return 'blue';
  return 'orange';
}
