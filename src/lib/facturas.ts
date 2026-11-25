import { ApiError, apiFetch } from './api';
import type { CobranzaCliente, Factura, PreferenciaPago, ResultadoPago } from '../types';

//Lee la respuesta; si falla, lanza ApiError con el motivo que mande el backend
async function leer<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let mensaje =
      response.status === 401 || response.status === 403
        ? 'Tu sesión expiró o no tenés permisos para esta acción.'
        : `Error del servidor (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) mensaje = String(body.message);
      else if (body?.mensaje) mensaje = String(body.mensaje);
    } catch {
    }
    throw new ApiError(response.status, mensaje);
  }
  return (await response.json()) as T;
}

//Facturas del usuario autenticado, opcionalmente filtradas por estado
export async function listarMisFacturas(estado?: 'PENDIENTE' | 'PAGADA'): Promise<Factura[]> {
  return leer(await apiFetch(estado ? `/facturas/mis-facturas?estado=${estado}` : '/facturas/mis-facturas'));
}

//Administrador: clientes con servicios, facturas, vencimientos y deuda
export async function listarCobranzas(): Promise<CobranzaCliente[]> {
  return leer(await apiFetch('/facturas/cobranzas'));
}

//Crea la preferencia de Mercado Pago (Checkout Pro) para una factura pendiente
export async function crearPreferencia(facturaId: number): Promise<PreferenciaPago> {
  return leer(await apiFetch('/pagos/crear-preferencia', { method: 'POST', body: JSON.stringify({ facturaId }) }));
}

//Al volver de Mercado Pago: el backend consulta el pago y, si está aprobado, deja la factura como PAGADA
export async function confirmarPago(paymentId: string): Promise<ResultadoPago> {
  return leer(await apiFetch('/pagos/confirmar', { method: 'POST', body: JSON.stringify({ paymentId }) }));
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

//'2026-10' → 'Octubre 2026'
export function nombrePeriodo(periodo: string): string {
  const [anio, mes] = periodo.split('-');
  const nombre = MESES[Number(mes) - 1];
  return nombre ? `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}` : periodo;
}

export function formatearImporte(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export function mensajeDeError(error: unknown, porDefecto = 'No pudimos completar la operación. Probá de nuevo.'): string {
  return error instanceof ApiError || error instanceof Error ? error.message : porDefecto;
}
