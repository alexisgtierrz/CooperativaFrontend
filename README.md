# Sistema de Gestión para Cooperativas de Servicios - Frontend

Este repositorio contiene la aplicación cliente del Sistema de Gestión Integral para Cooperativas de Servicios. Está diseñada para proveer interfaces a los perfiles de Administrador, Técnico y Cliente, integrando un mapa interactivo para los recorridos y un dashboard de gestión.

## 🛠️ Tecnologías y Prerrequisitos

Para ejecutar este proyecto localmente, necesitas:

1. **Node.js (v18 o superior)**
   - Descarga e instala desde [nodejs.org](https://nodejs.org/).
   - Verifica la instalación ejecutando: `node -v` y `npm -v`.

2. **Stack Tecnológico**
   - **React + TypeScript:** Para el desarrollo de componentes tipados de forma estricta.
   - **Vite:** Herramienta de empaquetado y servidor de desarrollo ultrarrápido.

3. **IDE (Entorno de Desarrollo Integrado)**
   - Se recomienda **VS Code** con las extensiones de *ESLint* y *Prettier*.

## 🚀 Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/alexisgtierrz/CooperativaFrontend.git
cd coop-servicios-frontend

## 🎨 Front (diseño responsive)

El sitio se adapta a celular, tablet y escritorio (Tailwind, breakpoints `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280).

### Páginas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio: carrusel, accesos rápidos, servicios, medios de pago, cobertura, novedades | Público |
| `/servicios` | Planes de internet, TV y telefonía + grilla de canales | Público |
| `/nosotros`, `/institucional` | Historia, valores, consejo de administración, documentación | Público |
| `/novedades`, `/novedades/:slug` | Listado con filtro por categoría y detalle | Público |
| `/contacto` | Canales de atención y formulario (arma un email) | Público |
| `/login` | Ingreso a la Oficina Virtual | Público |
| `/perfil` | Mi perfil, N° de asociado, suscripciones y tickets | Requiere sesión |
| `/vencimientos` | Próximos vencimientos con aviso por colores | Requiere sesión |
| `/reclamos` | Historial de reclamos y alta de un reclamo nuevo (`?nuevo=1`) | Requiere sesión |
| `/admin` | Panel de administración (clientes y usuarios) | Solo `admin@coop.com` |

### Estructura

```
src/
  config/site.ts        → datos de la cooperativa (teléfono, WhatsApp, email, dirección) y menú
  data/contenido.ts     → textos del sitio: carrusel, accesos rápidos, planes, novedades
  lib/api.ts            → fetch con VITE_API_BASE_URL y el token JWT
  context/              → sesión (login, logout, ruta pendiente) y avisos
  components/layout/    → barra superior, encabezado con menú móvil, pie, botón de WhatsApp
  components/home/      → secciones del inicio
  pages/                → una página por ruta
```

### Fotos

Mientras no estén las fotos se muestra un fondo de referencia con la foto sugerida.
Para cargarlas, copiar los archivos con estos nombres:

- Carrusel: `public/img/carrusel/slide-1.jpg` … `slide-4.jpg` (1920×1080 aprox.)
- Novedades: `public/img/novedades/fibra.jpg`, `asamblea.jpg`, `futbol.jpg`, `sede.jpg`, `factura.jpg`, `mantenimiento.jpg`

### Variables de entorno (`.env`)

- `VITE_API_BASE_URL` → URL del backend con `/api` al final (por defecto `http://localhost:8080/api`)
- `VITE_GOOGLE_MAPS_API_KEY` → opcional; si está, la sección de cobertura muestra la dirección consultada en Google Maps
