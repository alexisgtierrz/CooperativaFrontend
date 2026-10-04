// Contenido estático del sitio (textos, planes, novedades).
// Las fotos van en /public/img/... — mientras no estén se muestra un recuadro de referencia.
import {
  CalendarDays,
  CreditCard,
  IdCard,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  QrCode,
  SearchCheck,
  Smartphone,
  Tv,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

export interface Slide {
  eyebrow: string;
  titulo: string;
  texto: string;
  imagen: string;
  fotoSugerida: string;
  fondo: [string, string];
  ctas: { label: string; to: string; auth?: boolean; variante: 'primary' | 'ghost' }[];
}

export const SLIDES: Slide[] = [
  {
    eyebrow: 'Internet · Televisión · Telefonía',
    titulo: 'Conectados con nuestra comunidad',
    texto: 'Gestioná tus servicios, pagá tus facturas y seguí tus reclamos desde un solo lugar, cuando quieras.',
    imagen: '/img/carrusel/slide-1.jpg',
    fotoSugerida: 'vista de la ciudad o de la sede de la cooperativa',
    fondo: ['#1F3D57', '#234561'],
    ctas: [
      { label: 'Ingresar a la Oficina Virtual', to: '/perfil', auth: true, variante: 'primary' },
      { label: 'Ver planes', to: '/servicios', variante: 'ghost' },
    ],
  },
  {
    eyebrow: 'Obras en marcha',
    titulo: 'La fibra óptica llega a más barrios',
    texto: 'Consultá si tu domicilio ya tiene cobertura y pedí la instalación desde la web.',
    imagen: '/img/carrusel/slide-2.jpg',
    fotoSugerida: 'cuadrilla tendiendo fibra óptica en un barrio',
    fondo: ['#1D3F35', '#21483C'],
    ctas: [{ label: 'Consultar cobertura', to: '/#cobertura', variante: 'primary' }],
  },
  {
    eyebrow: 'Pagos',
    titulo: 'Tu factura, sin filas ni papeles',
    texto: 'Adherite al débito automático o pagá online con tarjeta, transferencia o QR.',
    imagen: '/img/carrusel/slide-3.jpg',
    fotoSugerida: 'asociado pagando la factura desde el celular',
    fondo: ['#34324F', '#3A385A'],
    ctas: [{ label: 'Ver medios de pago', to: '/#pagos', variante: 'primary' }],
  },
  {
    eyebrow: 'Soporte técnico',
    titulo: 'Técnicos de acá, cerca tuyo',
    texto: 'Cargá tu reclamo y seguí en línea cada paso, desde que lo recibimos hasta que el técnico lo resuelve.',
    imagen: '/img/carrusel/slide-4.jpg',
    fotoSugerida: 'técnico de la cooperativa en un domicilio',
    fondo: ['#46382A', '#4E3F2F'],
    ctas: [
      { label: 'Iniciar un reclamo', to: '/reclamos?nuevo=1', auth: true, variante: 'primary' },
      { label: 'Seguir mi reclamo', to: '/reclamos', auth: true, variante: 'ghost' },
    ],
  },
];

export type Tono = 'green' | 'blue' | 'orange';

export interface AccesoRapido {
  titulo: string;
  icono: LucideIcon;
  tono: Tono;
  /** Ruta interna. Si `auth` es true, pide iniciar sesión antes (mismo comportamiento que ya tenía el front) */
  ruta?: string;
  auth?: boolean;
  externo?: string;
  claves: string;
}

export const ACCESOS_RAPIDOS: AccesoRapido[] = [
  { titulo: 'Pagá tu factura', icono: CreditCard, tono: 'green', ruta: '/#pagos', claves: 'pagar factura pago debito tarjeta qr transferencia' },
  { titulo: 'Próximos vencimientos', icono: CalendarDays, tono: 'blue', ruta: '/vencimientos', auth: true, claves: 'vencimiento vence fecha suscripcion' },
  { titulo: 'Iniciar un reclamo', icono: MessageSquare, tono: 'orange', ruta: '/reclamos?nuevo=1', auth: true, claves: 'reclamo problema falla sin servicio tecnico ticket' },
  { titulo: 'Seguí tu reclamo', icono: SearchCheck, tono: 'orange', ruta: '/reclamos', auth: true, claves: 'seguir reclamo estado ticket' },
  { titulo: 'Mi número de asociado', icono: IdCard, tono: 'blue', ruta: '/perfil', auth: true, claves: 'numero asociado socio cuenta' },
  { titulo: 'Actualizá tus datos', icono: Pencil, tono: 'green', ruta: '/perfil', auth: true, claves: 'datos perfil telefono email domicilio actualizar' },
  { titulo: 'Test de velocidad', icono: Wifi, tono: 'blue', externo: 'https://fast.com', claves: 'test velocidad internet speed' },
  { titulo: 'Grilla de canales', icono: Tv, tono: 'green', ruta: '/servicios#grilla', claves: 'grilla canales tv television' },
];

export const TONOS: Record<Tono, string> = {
  green: 'bg-coop-green-soft text-coop-green',
  blue: 'bg-coop-blue-soft text-coop-navy',
  orange: 'bg-coop-orange-soft text-coop-orange',
};

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  icono: LucideIcon;
  beneficios: string[];
  precio: string;
  destacado?: boolean;
  planes: { nombre: string; detalle: string; precio: string }[];
}

export const SERVICIOS: Plan[] = [
  {
    id: 'internet',
    nombre: 'Internet por fibra',
    descripcion: 'Planes simétricos con instalación incluida y soporte técnico local.',
    icono: Wifi,
    beneficios: ['Hasta 1000 Mbps', 'Wi-Fi de alto alcance', 'Sin límite de datos'],
    precio: '19.999',
    planes: [
      { nombre: 'Fibra 100', detalle: '100 Mbps simétricos', precio: '19.999' },
      { nombre: 'Fibra 300', detalle: '300 Mbps simétricos + Wi-Fi 6', precio: '26.999' },
      { nombre: 'Fibra 1000', detalle: '1000 Mbps simétricos + Wi-Fi 6 mesh', precio: '38.999' },
    ],
  },
  {
    id: 'tv',
    nombre: 'Televisión digital',
    descripcion: 'Más de 100 canales en HD, canal local y app para ver desde cualquier dispositivo.',
    icono: Tv,
    beneficios: ['+100 canales HD', 'Canal comunitario', 'Pack fútbol opcional'],
    precio: '24.999',
    destacado: true,
    planes: [
      { nombre: 'TV Inicial', detalle: '70 canales, 20 en HD', precio: '24.999' },
      { nombre: 'TV Full', detalle: '+100 canales HD y app', precio: '31.999' },
      { nombre: 'Pack fútbol', detalle: 'Adicional sobre cualquier plan', precio: '9.999' },
    ],
  },
  {
    id: 'telefonia',
    nombre: 'Telefonía fija',
    descripcion: 'Línea fija con llamadas locales ilimitadas entre asociados de la cooperativa.',
    icono: Phone,
    beneficios: ['Llamadas locales libres', 'Identificador de llamadas', 'Guía telefónica online'],
    precio: '9.999',
    planes: [
      { nombre: 'Línea básica', detalle: 'Llamadas locales libres', precio: '9.999' },
      { nombre: 'Línea plus', detalle: 'Locales + 300 min a celulares', precio: '13.999' },
    ],
  },
];

export const GRILLA_CANALES = [
  { categoria: 'Canal local y comunitario', canales: 2 },
  { categoria: 'Aire y noticias', canales: 18 },
  { categoria: 'Deportes', canales: 12 },
  { categoria: 'Películas y series', canales: 24 },
  { categoria: 'Infantiles', canales: 10 },
  { categoria: 'Documentales y cultura', canales: 14 },
  { categoria: 'Música', canales: 6 },
  { categoria: 'Internacionales', canales: 16 },
];

export const MEDIOS_PAGO = [
  { titulo: 'Débito automático', texto: 'Adherí tu tarjeta o CBU y olvidate de los vencimientos.', icono: CreditCard, tono: 'green' as Tono },
  { titulo: 'Botón de pago online', texto: 'Pagá con tarjeta de débito o crédito desde la web.', icono: Smartphone, tono: 'blue' as Tono },
  { titulo: 'Transferencia o QR', texto: 'Escaneá el QR de tu factura con cualquier billetera virtual.', icono: QrCode, tono: 'orange' as Tono },
  { titulo: 'Lugares de pago', texto: 'Oficinas de la cooperativa y redes de cobranza habilitadas.', icono: MapPin, tono: 'blue' as Tono },
];

export interface Novedad {
  slug: string;
  categoria: 'Obras' | 'Asamblea' | 'Beneficios' | 'Institucional';
  fecha: string; // ISO
  titulo: string;
  resumen: string;
  cuerpo: string[];
  imagen: string;
}

export const NOVEDADES: Novedad[] = [
  {
    slug: 'ampliamos-la-red-de-fibra',
    categoria: 'Obras',
    fecha: '2026-09-15',
    titulo: 'Ampliamos la red de fibra óptica a nuevos barrios',
    resumen: 'Conocé las zonas donde ya podés contratar internet de alta velocidad.',
    cuerpo: [
      'Durante septiembre terminamos el tendido de fibra óptica en nuevos sectores de la ciudad. Los asociados de esas zonas ya pueden pedir la instalación desde la Oficina Virtual o en nuestras oficinas.',
      'La obra se hizo con cuadrillas propias de la cooperativa. Si tu domicilio todavía no tiene cobertura, consultá el mapa de obras en la página de inicio: lo actualizamos cada semana.',
    ],
    imagen: '/img/novedades/fibra.jpg',
  },
  {
    slug: 'asamblea-general-ordinaria',
    categoria: 'Asamblea',
    fecha: '2026-09-08',
    titulo: 'Convocatoria a asamblea general ordinaria de asociados',
    resumen: 'Fecha, lugar y orden del día de la próxima asamblea anual.',
    cuerpo: [
      'El Consejo de Administración convoca a los asociados a la asamblea general ordinaria. Se tratarán la memoria y el balance del ejercicio, y la renovación parcial de consejeros.',
      'La documentación está disponible para consulta en la sede y en la sección Institucional de este sitio.',
    ],
    imagen: '/img/novedades/asamblea.jpg',
  },
  {
    slug: 'pack-futbol-asociados',
    categoria: 'Beneficios',
    fecha: '2026-09-01',
    titulo: 'Nuevo pack fútbol con descuento para asociados',
    resumen: 'Activalo desde la Oficina Virtual y disfrutá todos los partidos.',
    cuerpo: [
      'Los asociados con televisión digital pueden sumar el pack fútbol con un precio especial durante los primeros tres meses.',
      'El alta se hace desde la Oficina Virtual o llamando a atención al asociado.',
    ],
    imagen: '/img/novedades/futbol.jpg',
  },
  {
    slug: 'nuevo-horario-de-atencion',
    categoria: 'Institucional',
    fecha: '2026-08-20',
    titulo: 'Nuevo horario de atención en la sede central',
    resumen: 'Extendimos el horario de atención presencial de lunes a viernes.',
    cuerpo: ['Desde este mes atendemos de lunes a viernes de 8 a 16 h de corrido. La guardia técnica sigue disponible las 24 h.'],
    imagen: '/img/novedades/sede.jpg',
  },
  {
    slug: 'factura-digital',
    categoria: 'Beneficios',
    fecha: '2026-08-05',
    titulo: 'Sumate a la factura digital',
    resumen: 'Recibí tu factura por email y ayudanos a cuidar el ambiente.',
    cuerpo: ['Al adherirte a la factura digital la recibís apenas se emite y podés descargarla desde la Oficina Virtual.'],
    imagen: '/img/novedades/factura.jpg',
  },
  {
    slug: 'mantenimiento-programado',
    categoria: 'Obras',
    fecha: '2026-07-28',
    titulo: 'Mantenimiento programado de la red troncal',
    resumen: 'Trabajos nocturnos para mejorar la estabilidad del servicio.',
    cuerpo: ['Los trabajos se hacen de madrugada para afectar lo menos posible el servicio. Te avisamos con anticipación por WhatsApp y en esta sección.'],
    imagen: '/img/novedades/mantenimiento.jpg',
  },
];

export const CATEGORIA_COLOR: Record<Novedad['categoria'], string> = {
  Obras: 'bg-coop-green',
  Asamblea: 'bg-coop-navy',
  Beneficios: 'bg-coop-orange',
  Institucional: 'bg-coop-navy-dark',
};

export const NUMEROS = [
  { valor: '[AÑOS]', texto: 'años junto a la comunidad' },
  { valor: '[N]', texto: 'asociados conectados' },
  { valor: '[KM]', texto: 'kilómetros de fibra óptica' },
  { valor: '24/7', texto: 'Oficina Virtual disponible' },
];

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** '2026-09-15' → '15 sep 2026' */
export function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MESES[m - 1]} ${y}`;
}
