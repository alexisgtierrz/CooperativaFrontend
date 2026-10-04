// Datos institucionales. Reemplazar los valores entre corchetes por los reales.
export const SITE = {
  nombre: 'Cooperativa de Servicios',
  razonSocial: '[Nombre y localidad] · Ltda.',
  telefono: '0800-[NÚMERO]',
  telefonoHref: 'tel:0800000000',
  whatsappHref: 'https://wa.me/5490000000000',
  email: 'contacto@cooperativa.com.ar',
  direccion: '[Dirección de la sede]',
  horario: 'Lun a Vie de 8 a 16 h',
  redes: {
    facebook: '#',
    instagram: '#',
    youtube: '#',
  },
};

// El panel de administración se muestra solo a este usuario (misma regla que ya usaba el front)
export const ADMIN_EMAIL = 'admin@coop.com';

export const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/institucional', label: 'Institucional' },
  { to: '/novedades', label: 'Novedades' },
  { to: '/contacto', label: 'Contacto' },
];
