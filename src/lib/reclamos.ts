import { apiFetch } from './api';
import { leer } from './solicitudes';
import type { CodigoEstadoReclamo, EmpleadoPerfil, Reclamo, TipoIncidente } from '../types';

const BASE = '/reclamos';

/** Tipos de incidente cargados en la base de datos (alimentan el selector del formulario) */
export async function listarTiposIncidente(): Promise<TipoIncidente[]> {
  return (await leer<TipoIncidente[]>(await apiFetch('/tipos-incidente'))) ?? [];
}

/** Cliente: crea un reclamo (queda PENDIENTE y sin técnico) */
export async function crearReclamo(datos: { tipoIncidenteId: number; descripcion: string }): Promise<Reclamo> {
  return leer(await apiFetch(BASE, { method: 'POST', body: JSON.stringify(datos) }));
}

/** Cliente: sus reclamos con estado, técnico y observaciones */
export async function misReclamos(): Promise<Reclamo[]> {
  return (await leer<Reclamo[]>(await apiFetch(`${BASE}/mis-reclamos`))) ?? [];
}

/** Empleado: reclamos sin asignar de su especialidad */
export async function reclamosSinAsignar(): Promise<Reclamo[]> {
  return (await leer<Reclamo[]>(await apiFetch(`${BASE}/sin-asignar`))) ?? [];
}

/** Empleado: reclamos que ya tomó */
export async function reclamosAsignados(): Promise<Reclamo[]> {
  return (await leer<Reclamo[]>(await apiFetch(`${BASE}/asignados`))) ?? [];
}

/** Empleado: se asigna el reclamo (pasa a EN_PROCESO). Falla con 409 si otro compañero lo tomó antes. */
export async function asignarReclamo(id: number): Promise<Reclamo> {
  return leer(await apiFetch(`${BASE}/${id}/asignar`, { method: 'PUT' }));
}

/** Empleado: cambia el estado y/o carga la observación técnica (obligatoria para RESUELTO) */
export async function cambiarEstadoReclamo(
  id: number,
  datos: { estado: Exclude<CodigoEstadoReclamo, 'PENDIENTE'>; observaciones: string },
): Promise<Reclamo> {
  return leer(await apiFetch(`${BASE}/${id}/estado`, { method: 'PUT', body: JSON.stringify(datos) }));
}

/** Datos del empleado autenticado, o null si el usuario no es un empleado (404) */
export async function perfilEmpleadoActual(): Promise<EmpleadoPerfil | null> {
  const response = await apiFetch('/empleados/perfil-actual');
  if (response.status === 404) return null;
  return leer(response);
}
