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
  latitud?: number | null;
  longitud?: number | null;
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

//Respuesta de GET /api/clientes/perfil-actual
export interface PerfilActual {
  tipoUsuario: string;
  usuario: { email: string };
  perfil: Cliente;
}

//Datos editables de un cliente (los mismos campos van y vienen en las solicitudes de actualización)
export interface DatosCliente {
  nombre: string;
  apellido: string;
  telefono?: string | null;
  calle?: string | null;
  numero?: number | null;
  piso?: string | null;
  departamento?: string | null;
  observaciones?: string | null;
  barrioId?: number | null;
  barrioNombre?: string | null;
  localidadId?: number | null;
  localidadNombre?: string | null;
}

//Cuerpo que se envía al crear o corregir una solicitud
export type DatosClienteEnvio = Pick<
  DatosCliente,
  'nombre' | 'apellido' | 'telefono' | 'calle' | 'numero' | 'piso' | 'departamento' | 'observaciones' | 'barrioId'
>;

export type EstadoSolicitud = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

//Respuesta de /api/solicitudes-actualizacion
export interface SolicitudActualizacion {
  id: number;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  fechaResolucion?: string | null;
  resueltaPor?: string | null;
  clienteId: number;
  clienteDni?: string | null;
  actual: DatosCliente;
  propuesto: DatosCliente;
}

//Tipo de incidente (GET /api/tipos-incidente). `especialidad` es el área técnica que lo resuelve
export interface TipoIncidente {
  id: number;
  nombre: string;
  gravedad?: string | null;
  especialidad?: string | null;
}

export type CodigoEstadoReclamo = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

export interface ClienteResumen {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  domicilio?: string | null;
}

export interface SeguimientoReclamo {
  estado?: string | null;
  desde?: string | null;
  hasta?: string | null;
  tecnico?: string | null;
}

//Reclamo (ticket) tal como lo devuelve /api/reclamos/**
export interface Reclamo {
  id: number;
  fechaCreacion?: string | null;
  descripcion: string;
  tipoIncidenteId?: number | null;
  tipoIncidenteNombre?: string | null;
  gravedad?: string | null;
  especialidad?: string | null;
  estado: CodigoEstadoReclamo;
  estadoNombre?: string | null;
  tecnicoNombre?: string | null;
  observacionesResolucion?: string | null;
  historial: SeguimientoReclamo[];
  cliente?: ClienteResumen | null;
}

export interface EmpleadoPerfil {
  id: number;
  nombre: string;
  apellido: string;
  legajo?: string | null;
  especialidad?: string | null;
}

//Factura del asociado
export interface Factura {
  id: number;
  periodo: string; // '2026-10'
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  estado: 'PENDIENTE' | 'PAGADA';
  vencida: boolean;
  servicios: string[];
  fechaPago?: string | null;
  idOperacion?: string | null;
}

export interface CobranzaCliente {
  clienteId: number;
  nombre: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  activo: boolean;
  servicios: { nombre: string; vigenteHasta?: string | null }[];
  facturasPendientes: number;
  facturasVencidas: number;
  deudaTotal: number;
  deudaVencida: number;
  diasMaxAtraso: number;
  proximoVencimiento?: string | null;
  facturas: Factura[];
}

export interface PreferenciaPago {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export interface ResultadoPago {
  acreditado: boolean;
  estadoPago: string;
  facturaId?: number | null;
  mensaje: string;
}
