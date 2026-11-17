import { ApiError, apiFetch } from './api';
import type { DatosClienteEnvio, EstadoSolicitud, SolicitudActualizacion } from '../types';

/** Lee la respuesta; si falla, lanza ApiError con el motivo que mande el backend ({ mensaje }) */
export async function leer<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let mensaje =
      response.status === 401 || response.status === 403
        ? 'Tu sesión expiró o no tenés permisos para esta acción.'
        : `Error del servidor (${response.status})`;
    try {
      const body = await response.json();
      if (body?.mensaje) mensaje = String(body.mensaje);
    } catch {
      /* sin cuerpo JSON: se usa el mensaje genérico */
    }
    throw new ApiError(response.status, mensaje);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const BASE = '/solicitudes-actualizacion';

/** Cliente: crea una solicitud pendiente (no modifica el cliente) */
export async function crearSolicitud(datos: DatosClienteEnvio): Promise<SolicitudActualizacion> {
  return leer(await apiFetch(BASE, { method: 'POST', body: JSON.stringify(datos) }));
}

/** Cliente: su última solicitud (o null si nunca envió una) */
export async function obtenerMiSolicitud(): Promise<SolicitudActualizacion | null> {
  return leer(await apiFetch(`${BASE}/mia`));
}

/** Admin: lista de solicitudes, opcionalmente filtradas por estado */
export async function listarSolicitudes(estado?: EstadoSolicitud): Promise<SolicitudActualizacion[]> {
  return leer(await apiFetch(estado ? `${BASE}?estado=${estado}` : BASE));
}

/** Admin: confirma tal cual (sin datos) o con los datos corregidos */
export async function confirmarSolicitud(id: number, datosEditados?: DatosClienteEnvio): Promise<SolicitudActualizacion> {
  return leer(
    await apiFetch(`${BASE}/${id}/confirmar`, {
      method: 'POST',
      body: datosEditados ? JSON.stringify(datosEditados) : undefined,
    }),
  );
}

/** Admin: rechaza la solicitud */
export async function rechazarSolicitud(id: number): Promise<SolicitudActualizacion> {
  return leer(await apiFetch(`${BASE}/${id}/rechazar`, { method: 'POST' }));
}

/** Mensaje legible para mostrar al usuario a partir de cualquier error */
export function mensajeDeError(error: unknown, porDefecto = 'No pudimos completar la operación. Probá de nuevo.'): string {
  return error instanceof ApiError || error instanceof Error ? error.message : porDefecto;
}
