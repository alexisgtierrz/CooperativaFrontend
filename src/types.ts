// Tipos que reflejan las entidades que devuelve el backend (solo los campos que usa el front)

export interface Localidad {
  id: number;
  nombre: string;
  codigoPostal?: string;
}

export interface Barrio {
  id: number;
  nombre: string;
  localidad?: Localidad;
}

export interface Domicilio {
  id?: number | null;
  calle?: string;
  numero?: number;
  piso?: string;
  departamento?: string;
  observaciones?: string;
  barrio?: Barrio | null;
}

export interface Tarifa {
  id?: number;
  monto?: number;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  tarifa?: Tarifa;
}

export interface Suscripcion {
  id?: number;
  temporalId?: number;
  fechaAlta?: string;
  fechaHasta?: string;
  fechaBaja?: string | null;
  servicio: Servicio;
  domicilio?: Domicilio;
}

export interface Estado {
  id?: number;
  nombre?: string;
}

export interface CambioEstado {
  id?: number;
  fechaHoraInicio?: string;
  fechaHoraFin?: string | null;
  estado?: Estado;
}

export interface Ticket {
  id: number;
  fechaCreacion?: string;
  descripcion: string;
  categoria?: string;
  /** Algunas respuestas viejas traían el estado como texto plano */
  estado?: string;
  historialEstados?: CambioEstado[];
}

export interface Perfil {
  id: number;
  nombre: string;
  permisos?: { id: number; nombre: string }[];
}

export interface Usuario {
  id: number;
  email: string;
  activo?: boolean;
  perfil?: Perfil;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  usuario?: Usuario | null;
  domicilio?: Domicilio | null;
  suscripciones?: Suscripcion[];
  tickets?: Ticket[];
}

/** Respuesta de GET /api/clientes/perfil-actual */
export interface PerfilActual {
  tipoUsuario: string;
  usuario: { email: string };
  perfil: Cliente;
}
