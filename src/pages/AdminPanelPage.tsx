import React, { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardList, Edit, LogOut, Plus, PlusCircle, Search, Shield, Trash2, UserPlus, Users, Briefcase, X } from 'lucide-react';
import Logo from '../components/layout/Logo';
import { Badge, EmptyState } from '../components/ui';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/auth-context';
import SelectorUbicacion, { type Coordenadas, type DireccionFormulario } from '../components/SelectorUbicacion';
import Dialog from '../components/Dialog';
import SolicitudActualizacionForm from '../components/SolicitudActualizacionForm';
import { formatearFechaSimple } from '../lib/format';
import { confirmarSolicitud, listarSolicitudes, mensajeDeError, rechazarSolicitud } from '../lib/solicitudes';
import type { DatosCliente, DatosClienteEnvio, SolicitudActualizacion } from '../types';


type Tab = 'clientes' | 'usuarios' | 'empleados' | 'solicitudes';

export default function AdminPanelPage() {
  const { userEmail, logout, notify } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('clientes');

  const [showClientForm, setShowClientForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEmpleadoForm, setShowEmpleadoForm] = useState(false);
  
  const [clienteEnEdicion, setClienteEnEdicion] = useState<any>(null);
  const [empleadoEnEdicion, setEmpleadoEnEdicion] = useState<any>(null);

  const [clientes, setClientes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<any[]>([]);
  const [filtroBusquedaCliente, setFiltroBusquedaCliente] = useState('');
  const [filtroBusquedaUsuario, setFiltroBusquedaUsuario] = useState('');
  const [filtroBusquedaEmpleado, setFiltroBusquedaEmpleado] = useState('');
  
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState<any[]>([]);
  const [barriosDisponibles, setBarriosDisponibles] = useState<any[]>([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState<string>('');

  const [suscripcionesForm, setSuscripcionesForm] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const formClienteRef = useRef<HTMLFormElement>(null);

  const [solicitudes, setSolicitudes] = useState<SolicitudActualizacion[]>([]);
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<'PENDIENTE' | 'TODAS'>('PENDIENTE');
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<string[]>([]);
  const [solicitudEnEdicion, setSolicitudEnEdicion] = useState<SolicitudActualizacion | null>(null);
  const [procesandoSolicitud, setProcesandoSolicitud] = useState<number | null>(null);
  const [errorEdicion, setErrorEdicion] = useState('');

  const fetchClientes = async () => {
    try {
      const response = await apiFetch('/clientes');
      if (response.ok) setClientes(await response.json());
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await apiFetch('/servicios');
      if (response.ok) {
        const data = await response.json();
        setServiciosDisponibles(data);
        if (data.length > 0) setServicioSeleccionado(String(data[0].id));
      }
    } catch (error) {
      console.error('Error al buscar servicios:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await apiFetch('/usuarios');
      if (response.ok) setUsuarios(await response.json());
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    }
  };
  
  const fetchEmpleados = async () => {
    try {
      const response = await apiFetch('/empleados');
      if (response.ok) setEmpleados(await response.json());
    } catch (error) {
      console.error('Error al buscar empleados:', error);
    }
  };

  const fetchPerfiles = async () => {
    try {
      const response = await apiFetch('/perfiles');
      if (response.ok) setPerfilesDisponibles(await response.json());
    } catch (error) {
      console.error('Error al buscar perfiles:', error);
    }
  };

  const fetchLocalidades = async () => {
    try {
      const response = await apiFetch('/localidades');
      if (response.ok) setLocalidadesDisponibles(await response.json());
    } catch (error) {
      console.error('Error al buscar localidades:', error);
    }
  };

  const fetchBarrios = async () => {
    try {
      const response = await apiFetch('/barrios');
      if (response.ok) setBarriosDisponibles(await response.json());
    } catch (error) {
      console.error('Error al buscar barrios:', error);
    }
  };

  //Catalogo oficial de puestos/especialidades
  const fetchEspecialidades = async () => {
    try {
      const response = await apiFetch('/especialidades');
      if (!response.ok) return;
      const lista: { nombre: string }[] = await response.json();
      setEspecialidadesDisponibles(lista.map((e) => e.nombre));
    } catch (error) {
      console.error('Error al buscar especialidades:', error);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      setSolicitudes(await listarSolicitudes());
    } catch (error) {
      console.error('Error al buscar solicitudes:', error);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchServicios();
    fetchUsuarios();
    fetchEmpleados();
    fetchPerfiles();
    fetchLocalidades();
    fetchBarrios();
    fetchSolicitudes();
    fetchEspecialidades();
  }, []);

  //Clientes
  const handleNuevoCliente = () => {
    setClienteEnEdicion(null);
    setSuscripcionesForm([]);
    setLocalidadSeleccionada('');
    setUbicacion(null);
    setShowClientForm(true);
  };

  const handleEditarCliente = (clienteSeleccionado: any) => {
    setClienteEnEdicion(clienteSeleccionado);
    setSuscripcionesForm(clienteSeleccionado.suscripciones || []);
    if (clienteSeleccionado.domicilio?.barrio?.localidad?.id) {
      setLocalidadSeleccionada(String(clienteSeleccionado.domicilio.barrio.localidad.id));
    } else {
      setLocalidadSeleccionada('');
    }
    const dom = clienteSeleccionado.domicilio;
    setUbicacion(dom?.latitud != null && dom?.longitud != null ? { lat: dom.latitud, lng: dom.longitud } : null);
    setShowClientForm(true);
  };

  const handleAgregarSuscripcion = () => {
    const servicio = serviciosDisponibles.find((s) => s.id === Number(servicioSeleccionado));
    if (servicio) {
      const nuevaSub = {
        temporalId: Date.now(),
        fechaAlta: new Date().toISOString().split('T')[0],
        servicio: servicio,
      };
      setSuscripcionesForm([...suscripcionesForm, nuevaSub]);
    }
  };

  const handleEliminarSuscripcion = (identificador: number) => {
    setSuscripcionesForm(suscripcionesForm.filter((sub) => (sub.id || sub.temporalId) !== identificador));
  };

  //Arma la dirección escrita en el formulario para buscarla en el mapa
  const obtenerDireccionFormulario = (): DireccionFormulario => {
    const form = formClienteRef.current;
    if (!form) return { calle: '', numero: '', localidad: '' };
    const datos = new FormData(form);
    const barrio = barriosDisponibles.find((b: any) => b.id === Number(datos.get('barrioId')));
    const localidad =
      localidadesDisponibles.find((l: any) => l.id === Number(localidadSeleccionada))?.nombre ?? barrio?.localidad?.nombre ?? '';
    return {
      calle: String(datos.get('calle') || '').trim(),
      numero: String(datos.get('numero') || '').trim(),
      localidad,
    };
  };

  const handleGuardarCliente = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ubicacion) {
      notify('Marcá en el mapa dónde queda la casa del cliente.', 'error');
      return;
    }
    const formData = new FormData(e.currentTarget);

    const barrioIdValue = formData.get('barrioId');

    const domicilioData = {
      id: clienteEnEdicion?.domicilio?.id || null,
      calle: formData.get('calle'),
      numero: Number(formData.get('numero')),
      piso: formData.get('piso'),
      departamento: formData.get('departamento'),
      observaciones: formData.get('observaciones'),
      barrio: barrioIdValue ? { id: Number(barrioIdValue) } : null,
      latitud: ubicacion.lat,
      longitud: ubicacion.lng,
    };

    const suscripcionesParaBackend = suscripcionesForm.map((sub) => ({
      id: sub.id,
      fechaAlta: sub.fechaAlta,
      servicio: sub.servicio,
      domicilio: sub.domicilio || domicilioData,
    }));

    const clienteData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      dni: formData.get('dni'),
      telefono: String(formData.get('telefono')),
      email: formData.get('email'),
      activo: true,
      usuario: clienteEnEdicion?.usuario || null,
      domicilio: domicilioData,
      suscripciones: suscripcionesParaBackend,
    };

    setGuardando(true);
    try {
      const url = clienteEnEdicion ? `/clientes/${clienteEnEdicion.id}` : '/clientes';
      const method = clienteEnEdicion ? 'PUT' : 'POST';

      const response = await apiFetch(url, { method, body: JSON.stringify(clienteData) });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }

      await fetchClientes();
      await fetchUsuarios();
      notify('¡Cliente guardado exitosamente en la base de datos!');
      setShowClientForm(false);
    } catch (error) {
      notify('Hubo un error al comunicarse con el servidor. Revisá la consola.', 'error');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  //Empleados
  const handleNuevoEmpleado = () => {
    setEmpleadoEnEdicion(null);
    setShowEmpleadoForm(true);
  };

  const handleEditarEmpleado = (empleadoSeleccionado: any) => {
    setEmpleadoEnEdicion(empleadoSeleccionado);
    setShowEmpleadoForm(true);
  };

  const handleGuardarEmpleado = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const empleadoData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      dni: formData.get('dni'),
      telefono: String(formData.get('telefono')),
      especialidad: formData.get('especialidad'),
    };

    setGuardando(true);
    try {
      const url = empleadoEnEdicion ? `/empleados/${empleadoEnEdicion.id}` : '/empleados'; // Quitar el /api
      const method = empleadoEnEdicion ? 'PUT' : 'POST';

      const response = await apiFetch(url, { method, body: JSON.stringify(empleadoData) });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }

      await fetchEmpleados();
      notify('¡Empleado guardado exitosamente!');
      setShowEmpleadoForm(false);
    } catch (error) {
      notify('Error al procesar el empleado. Revisá la consola.', 'error');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  //Usuarios
  const handleGuardarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const usuarioData = {
      email: formData.get('email'),
      password: formData.get('password'),
      activo: true,
      perfil: { id: Number(formData.get('perfilId')) },
    };
    const clienteIdAsociar = formData.get('clienteIdAsociar');

    setGuardando(true);
    try {
      const responseUser = await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(usuarioData) });

      if (!responseUser.ok) throw new Error('Error al registrar el usuario');
      const nuevoUsuario = await responseUser.json();

      if (clienteIdAsociar) {
        const clienteAFec = clientes.find((c) => c.id === Number(clienteIdAsociar));
        if (clienteAFec) {
          const clienteActualizado = { ...clienteAFec, usuario: { id: nuevoUsuario.id } };
          await apiFetch(`/clientes/${clienteAFec.id}`, { method: 'PUT', body: JSON.stringify(clienteActualizado) });
        }
      }

      await fetchUsuarios();
      await fetchClientes();
      notify('¡Usuario creado exitosamente!');
      setShowUserForm(false);
    } catch (error) {
      notify('Error al procesar la creación del usuario. Revisá la consola.', 'error');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  //Solicitudes de actualización de datos
  const pendientesCount = solicitudes.filter((s) => s.estado === 'PENDIENTE').length;
  const solicitudesVisibles = solicitudes.filter((s) => filtroSolicitudes === 'TODAS' || s.estado === 'PENDIENTE');

  const cerrarEdicionSolicitud = useCallback(() => {
    setSolicitudEnEdicion(null);
    setErrorEdicion('');
  }, []);

  //Confirma (tal cual o con datos corregidos) y refresca solicitudes y clientes: el cambio se ve de inmediato
  const handleConfirmarSolicitud = async (solicitud: SolicitudActualizacion, datosEditados?: DatosClienteEnvio) => {
    setProcesandoSolicitud(solicitud.id);
    setErrorEdicion('');
    try {
      await confirmarSolicitud(solicitud.id, datosEditados);
      await Promise.all([fetchSolicitudes(), fetchClientes()]);
      cerrarEdicionSolicitud();
      notify('Solicitud confirmada: los datos del cliente fueron actualizados.');
    } catch (error) {
      const mensaje = mensajeDeError(error);
      if (datosEditados) setErrorEdicion(mensaje);
      else notify(mensaje, 'error');
      console.error(error);
      await fetchSolicitudes();
    } finally {
      setProcesandoSolicitud(null);
    }
  };

  const handleRechazarSolicitud = async (solicitud: SolicitudActualizacion) => {
    if (!window.confirm(`¿Rechazar la solicitud de ${solicitud.actual.nombre} ${solicitud.actual.apellido}? Sus datos no se modificarán.`)) return;
    setProcesandoSolicitud(solicitud.id);
    try {
      await rechazarSolicitud(solicitud.id);
      await fetchSolicitudes();
      notify('Solicitud rechazada.', 'info');
    } catch (error) {
      notify(mensajeDeError(error), 'error');
      console.error(error);
      await fetchSolicitudes();
    } finally {
      setProcesandoSolicitud(null);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = filtroBusquedaCliente.toLowerCase();
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
    const dni = String(cliente.dni || '').toLowerCase();
    return nombreCompleto.includes(texto) || dni.includes(texto);
  });

  const empleadosFiltrados = empleados.filter((empleado) => {
    const texto = filtroBusquedaEmpleado.toLowerCase();
    const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`.toLowerCase();
    const dni = String(empleado.dni || '').toLowerCase();
    return nombreCompleto.includes(texto) || dni.includes(texto);
  });

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtroBusquedaUsuario.toLowerCase();
    return String(u.email || '').toLowerCase().includes(texto);
  });

  const cambiarTab = (tab: Tab) => {
    setActiveTab(tab);
    setShowClientForm(false);
    setShowUserForm(false);
    setShowEmpleadoForm(false);
  };

  const tabs: { id: Tab; label: string; corto: string; icon: any; count: number; alerta?: boolean }[] = [
    { id: 'clientes', label: 'Gestión de clientes', corto: 'Clientes', icon: Users, count: clientes.length },
    { id: 'empleados', label: 'Gestión de empleados', corto: 'Empleados', icon: Briefcase, count: empleados.length },
    { id: 'usuarios', label: 'Gestión de usuarios', corto: 'Usuarios', icon: UserPlus, count: usuarios.length },
    { id: 'solicitudes', label: 'Solicitudes de actualización', corto: 'Solicitudes', icon: ClipboardList, count: pendientesCount, alerta: true },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-coop-ground">
      <header className="sticky top-0 z-30 bg-coop-navy-dark text-white">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Logo variant="light" />
            <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-coop-mint md:flex">
              <Shield size={16} aria-hidden="true" /> Panel de administración
            </span>
          </div>
          <div className="flex flex-none items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-sm text-[#A9BBCD] lg:block">{userEmail}</span>
            <Link
              to="/"
              className="hidden min-h-[44px] items-center gap-2 rounded-[10px] px-3 font-semibold text-[#DCE7F2] hover:bg-white/10 hover:text-white sm:flex"
            >
              <ArrowLeft size={18} aria-hidden="true" /> Ver sitio
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex h-11 items-center gap-2 rounded-[10px] px-3 font-semibold text-[#DCE7F2] hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <nav aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
          {tabs.map(({ id, corto, icon: Icon, count, alerta }) => (
            <button
              key={id}
              type="button"
              onClick={() => cambiarTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-sm font-bold transition-colors ${
                activeTab === id ? 'bg-coop-green text-white' : 'text-[#DCE7F2] hover:bg-white/10'
              }`}
            >
              <Icon size={18} aria-hidden="true" /> {corto}
              <span
                className={`rounded-full px-2 text-xs ${alerta && count > 0 && activeTab !== id ? 'bg-coop-orange text-white' : 'bg-white/15'}`}
                aria-label={alerta ? `${count} pendientes` : undefined}
              >
                {count}
              </span>
            </button>
          ))}
        </nav>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-72 flex-none border-r border-coop-line bg-white lg:block">
          <nav aria-label="Secciones del panel" className="sticky top-[69px] flex flex-col gap-1 p-4">
            <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-coop-muted">Administración</p>
            {tabs.map(({ id, label, icon: Icon, count, alerta }) => (
              <button
                key={id}
                type="button"
                onClick={() => cambiarTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex min-h-[46px] items-center gap-3 rounded-[10px] px-3 text-left font-semibold transition-colors ${
                  activeTab === id ? 'bg-coop-green text-white' : 'text-coop-ink hover:bg-coop-ground'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <span
                  className={`rounded-full px-2 text-xs ${
                    activeTab === id ? 'bg-white/20' : alerta && count > 0 ? 'bg-coop-orange font-bold text-white' : 'bg-coop-ground text-coop-muted'
                  }`}
                  aria-label={alerta ? `${count} pendientes` : undefined}
                >
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {/*CLIENTES*/}
          {activeTab === 'clientes' && (
            <div>
              <TituloSeccion
                titulo={showClientForm ? (clienteEnEdicion ? `Modificar cliente #${clienteEnEdicion.id}` : 'Registrar nuevo cliente') : 'Clientes'}
                subtitulo={showClientForm ? 'Datos personales, domicilio y servicios contratados.' : `${clientes.length} clientes registrados`}
              >
                {!showClientForm && (
                  <>
                    <Buscador
                      id="buscar-cliente"
                      label="Buscar cliente"
                      placeholder="Buscar por nombre o DNI…"
                      value={filtroBusquedaCliente}
                      onChange={setFiltroBusquedaCliente}
                    />
                    <button type="button" onClick={handleNuevoCliente} className="btn-primary whitespace-nowrap">
                      <PlusCircle size={18} aria-hidden="true" /> Nuevo cliente
                    </button>
                  </>
                )}
              </TituloSeccion>

              {showClientForm ? (
                <div className="card p-5 sm:p-7">
                  <form ref={formClienteRef} onSubmit={handleGuardarCliente} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Subtitulo>Datos personales</Subtitulo>
                    <Campo label="Nombre" name="nombre" defaultValue={clienteEnEdicion?.nombre} required />
                    <Campo label="Apellido" name="apellido" defaultValue={clienteEnEdicion?.apellido} required />
                    <Campo label="DNI" name="dni" defaultValue={clienteEnEdicion?.dni} required inputMode="numeric" />
                    <Campo label="Teléfono" name="telefono" defaultValue={clienteEnEdicion?.telefono} required type="tel" />
                    <div className="md:col-span-2">
                      <Campo
                        label="Email"
                        hint="(Se utilizará para crear la cuenta de usuario)"
                        name="email"
                        type="email"
                        defaultValue={clienteEnEdicion?.email}
                        required
                      />
                    </div>

                    <Subtitulo>Domicilio</Subtitulo>
                    <div>
                      <label htmlFor="localidad" className="field-label">
                        Localidad
                      </label>
                      <select
                        id="localidad"
                        value={localidadSeleccionada}
                        onChange={(e) => setLocalidadSeleccionada(e.target.value)}
                        className="field"
                      >
                        <option value="">Seleccione una localidad...</option>
                        {localidadesDisponibles.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.nombre} ({loc.codigoPostal})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="barrioId" className="field-label">
                        Barrio
                      </label>
                      <select
                        id="barrioId"
                        name="barrioId"
                        defaultValue={clienteEnEdicion?.domicilio?.barrio?.id || ''}
                        required
                        className="field"
                      >
                        <option value="">Seleccione un barrio...</option>
                        {barriosDisponibles
                          .filter((barrio: any) => !localidadSeleccionada || barrio.localidad?.id === Number(localidadSeleccionada))
                          .map((barrio: any) => (
                            <option key={barrio.id} value={barrio.id}>
                              {barrio.nombre}
                            </option>
                          ))}
                      </select>
                    </div>
                    <Campo label="Calle" name="calle" defaultValue={clienteEnEdicion?.domicilio?.calle || ''} required placeholder="Ej: San Martín" />
                    <Campo label="Número" name="numero" type="number" defaultValue={clienteEnEdicion?.domicilio?.numero || ''} required placeholder="Ej: 150" />
                    <Campo label="Piso" name="piso" defaultValue={clienteEnEdicion?.domicilio?.piso || ''} placeholder="Opcional" />
                    <Campo label="Departamento" name="departamento" defaultValue={clienteEnEdicion?.domicilio?.departamento || ''} placeholder="Opcional" />
                    <div className="md:col-span-2">
                      <Campo
                        label="Observaciones"
                        name="observaciones"
                        defaultValue={clienteEnEdicion?.domicilio?.observaciones || ''}
                        placeholder="Casa con rejas negras"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="field-label">Ubicación en el mapa</span>
                      <SelectorUbicacion
                        key={clienteEnEdicion?.id ?? 'nuevo'}
                        value={ubicacion}
                        onChange={setUbicacion}
                        obtenerDireccion={obtenerDireccionFormulario}
                      />
                    </div>
                    <Subtitulo>Suscripciones del cliente</Subtitulo>
                    <div className="md:col-span-2">
                      <div className="mb-4 space-y-2">
                        {suscripcionesForm.filter((s: any) => !s.fechaBaja).length === 0 ? (
                          <p className="text-sm italic text-coop-muted">No posee servicios activos.</p>
                        ) : (
                          suscripcionesForm
                            .filter((s: any) => !s.fechaBaja)
                            .map((sub) => (
                              <div
                                key={sub.id || sub.temporalId}
                                className="flex items-center justify-between gap-3 rounded-xl border border-coop-line-soft bg-coop-ground px-4 py-2.5"
                              >
                                <div className="min-w-0">
                                  <span className="font-bold">{sub.servicio.nombre}</span>
                                  <span className="ml-2 text-xs text-coop-muted">Alta: {sub.fechaAlta}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleEliminarSuscripcion(sub.id || sub.temporalId)}
                                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                                  aria-label={`Quitar ${sub.servicio.nombre}`}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <label htmlFor="servicio-agregar" className="sr-only">
                          Servicio a agregar
                        </label>
                        <select
                          id="servicio-agregar"
                          value={servicioSeleccionado}
                          onChange={(e) => setServicioSeleccionado(e.target.value)}
                          className="field flex-1"
                        >
                          {serviciosDisponibles.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre} (${s.tarifa?.monto || 0})
                            </option>
                          ))}
                        </select>
                        <button type="button" onClick={handleAgregarSuscripcion} className="btn-navy">
                          <Plus size={16} aria-hidden="true" /> Agregar
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col-reverse gap-3 border-t border-coop-line-soft pt-5 sm:flex-row sm:justify-end md:col-span-2">
                      <button type="button" onClick={() => setShowClientForm(false)} className="btn-outline">
                        Cancelar
                      </button>
                      <button type="submit" disabled={guardando} className="btn-primary">
                        {clienteEnEdicion ? 'Guardar cambios' : 'Crear cliente'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  {clientesFiltrados.length === 0 ? (
                    <EmptyState icon={<Users size={28} />} title="No se encontraron clientes." />
                  ) : (
                    <>
                      <table className="hidden w-full border-collapse text-left md:table">
                        <thead>
                          <tr className="bg-coop-ground text-xs uppercase tracking-wider text-coop-muted">
                            <th className="px-5 py-3">ID</th>
                            <th className="px-5 py-3">Cliente</th>
                            <th className="px-5 py-3">DNI</th>
                            <th className="px-5 py-3">Cuenta asociada</th>
                            <th className="px-5 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-coop-line-soft">
                          {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id} className="hover:bg-coop-ground/60">
                              <td className="px-5 py-3.5 font-mono text-sm text-coop-muted">{cliente.id}</td>
                              <td className="px-5 py-3.5 font-semibold">
                                {cliente.nombre} {cliente.apellido}
                              </td>
                              <td className="px-5 py-3.5 text-coop-muted">{cliente.dni}</td>
                              <td className="px-5 py-3.5 text-sm">
                                {cliente.usuario?.email ? (
                                  <span className="text-coop-navy">{cliente.usuario.email}</span>
                                ) : (
                                  <span className="italic text-coop-muted">Sin cuenta</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleEditarCliente(cliente)}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 font-semibold text-coop-navy hover:bg-coop-blue-soft"
                                >
                                  <Edit size={15} aria-hidden="true" /> Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <ul className="divide-y divide-coop-line-soft md:hidden">
                        {clientesFiltrados.map((cliente) => (
                          <li key={cliente.id} className="flex items-center gap-3 p-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {cliente.nombre} {cliente.apellido}
                              </p>
                              <p className="text-sm text-coop-muted">
                                #{cliente.id} · DNI {cliente.dni}
                              </p>
                              <p className="truncate text-sm">
                                {cliente.usuario?.email ? (
                                  <span className="text-coop-navy">{cliente.usuario.email}</span>
                                ) : (
                                  <span className="italic text-coop-muted">Sin cuenta</span>
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleEditarCliente(cliente)}
                              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-coop-line-strong text-coop-navy"
                              aria-label={`Editar a ${cliente.nombre} ${cliente.apellido}`}
                            >
                              <Edit size={18} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/*EMPLEADOS*/}
          {activeTab === 'empleados' && (
            <div>
              <TituloSeccion
                titulo={showEmpleadoForm ? (empleadoEnEdicion ? `Modificar empleado #${empleadoEnEdicion.id}` : 'Registrar nuevo empleado') : 'Empleados'}
                subtitulo={showEmpleadoForm ? 'Datos personales y de contacto del empleado.' : `${empleados.length} empleados registrados`}
              >
                {!showEmpleadoForm && (
                  <>
                    <Buscador
                      id="buscar-empleado"
                      label="Buscar empleado"
                      placeholder="Buscar por nombre o DNI…"
                      value={filtroBusquedaEmpleado}
                      onChange={setFiltroBusquedaEmpleado}
                    />
                    <button type="button" onClick={handleNuevoEmpleado} className="btn-primary whitespace-nowrap">
                      <PlusCircle size={18} aria-hidden="true" /> Nuevo empleado
                    </button>
                  </>
                )}
              </TituloSeccion>

              {showEmpleadoForm ? (
                <div className="card p-5 sm:p-7">
                  <form onSubmit={handleGuardarEmpleado} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Subtitulo>Datos del empleado</Subtitulo>
                    <Campo 
                      label="Legajo" 
                      name="legajo" 
                      defaultValue={empleadoEnEdicion?.legajo || ''} 
                      readOnly={true} 
                      hint={empleadoEnEdicion ? "(No editable)" : "(Se asignará al guardar)"}
                      className="field bg-gray-100 opacity-70 cursor-not-allowed"
                    />
                    <div>
                      <label htmlFor="campo-especialidad" className="field-label">
                        Especialidad <span className="text-xs font-normal text-coop-muted">(define qué reclamos ve)</span>
                      </label>
                      <select
                        key={`${empleadoEnEdicion?.id ?? 'nuevo'}-${especialidadesDisponibles.length}`}
                        id="campo-especialidad"
                        name="especialidad"
                        required
                        className="field"
                        defaultValue={
                          empleadoEnEdicion && especialidadesDisponibles.includes(empleadoEnEdicion.especialidad)
                            ? empleadoEnEdicion.especialidad
                            : ''
                        }
                      >
                        <option value="" disabled>
                          Seleccionar puesto / especialidad...
                        </option>
                        {especialidadesDisponibles.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      {empleadoEnEdicion?.especialidad && especialidadesDisponibles.length > 0 && !especialidadesDisponibles.includes(empleadoEnEdicion.especialidad) && (
                        <p className="mt-1 text-xs text-coop-muted">
                          La especialidad actual ("{empleadoEnEdicion.especialidad}") no está en el catálogo: elegí un puesto.
                        </p>
                      )}
                    </div>
                    <Campo label="Nombre" name="nombre" defaultValue={empleadoEnEdicion?.nombre} required />
                    <Campo label="Apellido" name="apellido" defaultValue={empleadoEnEdicion?.apellido} required />
                    <Campo label="DNI" name="dni" defaultValue={empleadoEnEdicion?.dni} required inputMode="numeric" />
                    <Campo label="Teléfono" name="telefono" defaultValue={empleadoEnEdicion?.telefono || ''} type="tel" />
                    
                    <div className="mt-2 flex flex-col-reverse gap-3 border-t border-coop-line-soft pt-5 sm:flex-row sm:justify-end md:col-span-2">
                      <button type="button" onClick={() => setShowEmpleadoForm(false)} className="btn-outline">
                        Cancelar
                      </button>
                      <button type="submit" disabled={guardando} className="btn-primary">
                        {empleadoEnEdicion ? 'Guardar cambios' : 'Crear empleado'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  {empleadosFiltrados.length === 0 ? (
                    <EmptyState icon={<Briefcase size={28} />} title="No se encontraron empleados." />
                  ) : (
                    <>
                      <table className="hidden w-full border-collapse text-left md:table">
                        <thead>
                          <tr className="bg-coop-ground text-xs uppercase tracking-wider text-coop-muted">
                            <th className="px-5 py-3">Legajo</th>
                            <th className="px-5 py-3">Empleado</th>
                            <th className="px-5 py-3">Especialidad</th>
                            <th className="px-5 py-3">DNI / Tel</th>
                            <th className="px-5 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-coop-line-soft">
                          {empleadosFiltrados.map((empleado) => (
                            <tr key={empleado.id} className="hover:bg-coop-ground/60">
                              <td className="px-5 py-3.5 font-mono text-sm font-bold text-coop-navy">{empleado.legajo}</td>
                              <td className="px-5 py-3.5 font-semibold">
                                {empleado.nombre} {empleado.apellido}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-coop-muted">{empleado.especialidad || '-'}</td>
                              <td className="px-5 py-3.5 text-sm text-coop-muted">
                                {empleado.dni} <br/> {empleado.telefono}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleEditarEmpleado(empleado)}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 font-semibold text-coop-navy hover:bg-coop-blue-soft"
                                >
                                  <Edit size={15} aria-hidden="true" /> Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <ul className="divide-y divide-coop-line-soft md:hidden">
                        {empleadosFiltrados.map((empleado) => (
                          <li key={empleado.id} className="flex items-center gap-3 p-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {empleado.nombre} {empleado.apellido}
                              </p>
                              <p className="text-sm text-coop-muted">
                                #{empleado.id} · DNI {empleado.dni}
                              </p>
                              <p className="truncate text-sm text-coop-muted">
                                Tel: {empleado.telefono}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleEditarEmpleado(empleado)}
                              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-coop-line-strong text-coop-navy"
                              aria-label={`Editar a ${empleado.nombre} ${empleado.apellido}`}
                            >
                              <Edit size={18} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/*USUARIOS*/}
          {activeTab === 'usuarios' && (
            <div>
              <TituloSeccion
                titulo={showUserForm ? 'Registrar nuevo usuario (manual)' : 'Gestión de usuarios'}
                subtitulo={showUserForm ? 'Credenciales de acceso y perfil del usuario.' : `${usuarios.length} usuarios registrados`}
              >
                {!showUserForm && (
                  <>
                    <Buscador
                      id="buscar-usuario"
                      label="Filtrar usuarios"
                      placeholder="Filtrar por email…"
                      value={filtroBusquedaUsuario}
                      onChange={setFiltroBusquedaUsuario}
                    />
                    <button type="button" onClick={() => setShowUserForm(true)} className="btn-primary whitespace-nowrap">
                      <PlusCircle size={18} aria-hidden="true" /> Crear usuario
                    </button>
                  </>
                )}
              </TituloSeccion>

              {showUserForm ? (
                <div className="card p-5 sm:p-7">
                  <form onSubmit={handleGuardarUsuario} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Campo label="Correo electrónico (email)" name="email" type="email" required placeholder="usuario@coop.com" />
                    <Campo label="Contraseña" name="password" type="password" required placeholder="••••••••" autoComplete="new-password" />
                    <div>
                      <label htmlFor="perfilId" className="field-label">
                        Perfil / Rol
                      </label>
                      <select id="perfilId" name="perfilId" required className="field">
                        <option value="">Seleccione un perfil...</option>
                        {perfilesDisponibles.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="clienteIdAsociar" className="field-label">
                        Asignar a un cliente <span className="font-normal text-coop-muted">(opcional)</span>
                      </label>
                      <select id="clienteIdAsociar" name="clienteIdAsociar" className="field">
                        <option value="">No asociar a ningún cliente</option>
                        {clientes
                          .filter((c) => !c.usuario)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} {c.apellido} (DNI: {c.dni})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mt-2 flex flex-col-reverse gap-3 border-t border-coop-line-soft pt-5 sm:flex-row sm:justify-end md:col-span-2">
                      <button type="button" onClick={() => setShowUserForm(false)} className="btn-outline">
                        Cancelar
                      </button>
                      <button type="submit" disabled={guardando} className="btn-primary">
                        Guardar usuario
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  {usuariosFiltrados.length === 0 ? (
                    <EmptyState icon={<UserPlus size={28} />} title="No se encontraron usuarios." />
                  ) : (
                    <>
                      <table className="hidden w-full border-collapse text-left md:table">
                        <thead>
                          <tr className="bg-coop-ground text-xs uppercase tracking-wider text-coop-muted">
                            <th className="px-5 py-3">ID</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Perfil / Rol</th>
                            <th className="px-5 py-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-coop-line-soft">
                          {usuariosFiltrados.map((u: any) => (
                            <tr key={u.id} className="hover:bg-coop-ground/60">
                              <td className="px-5 py-3.5 font-mono text-sm text-coop-muted">{u.id}</td>
                              <td className="px-5 py-3.5 font-semibold">{u.email}</td>
                              <td className="px-5 py-3.5 text-coop-muted">{u.perfil?.nombre || 'Usuario'}</td>
                              <td className="px-5 py-3.5">
                                {u.activo ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Inactivo</Badge>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <ul className="divide-y divide-coop-line-soft md:hidden">
                        {usuariosFiltrados.map((u: any) => (
                          <li key={u.id} className="flex items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{u.email}</p>
                              <p className="text-sm text-coop-muted">
                                #{u.id} · {u.perfil?.nombre || 'Usuario'}
                              </p>
                            </div>
                            {u.activo ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Inactivo</Badge>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/*SOLICITUDES*/}
          {activeTab === 'solicitudes' && (
            <div>
              <TituloSeccion
                titulo="Solicitudes"
                subtitulo={`${pendientesCount} ${pendientesCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} de actualización de datos de clientes`}
              >
                <div className="sm:w-56">
                  <label htmlFor="filtro-solicitudes" className="sr-only">
                    Filtrar solicitudes
                  </label>
                  <select
                    id="filtro-solicitudes"
                    value={filtroSolicitudes}
                    onChange={(e) => setFiltroSolicitudes(e.target.value as 'PENDIENTE' | 'TODAS')}
                    className="field"
                  >
                    <option value="PENDIENTE">Solo pendientes</option>
                    <option value="TODAS">Todas (con historial)</option>
                  </select>
                </div>
              </TituloSeccion>

              {solicitudesVisibles.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={<ClipboardList size={28} />}
                    title={filtroSolicitudes === 'PENDIENTE' ? 'No hay solicitudes pendientes.' : 'Todavía no hay solicitudes.'}
                    text="Cuando un cliente pida actualizar sus datos desde Mi perfil, aparece acá para que la revises."
                  />
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {solicitudesVisibles.map((solicitud) => (
                    <SolicitudCard
                      key={solicitud.id}
                      solicitud={solicitud}
                      procesando={procesandoSolicitud === solicitud.id}
                      onConfirmar={() => handleConfirmarSolicitud(solicitud)}
                      onEditar={() => {
                        setErrorEdicion('');
                        setSolicitudEnEdicion(solicitud);
                      }}
                      onRechazar={() => handleRechazarSolicitud(solicitud)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>

      {solicitudEnEdicion && (
        <Dialog
          title="Editar y confirmar"
          subtitle={`Solicitud #${solicitudEnEdicion.id} de ${solicitudEnEdicion.actual.nombre} ${solicitudEnEdicion.actual.apellido}. Ajustá lo que haga falta: al guardar se confirma y se actualiza el cliente.`}
          size="md"
          onClose={cerrarEdicionSolicitud}
        >
          {errorEdicion && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorEdicion}
            </p>
          )}
          <SolicitudActualizacionForm
            key={solicitudEnEdicion.id}
            inicial={solicitudEnEdicion.propuesto}
            localidades={localidadesDisponibles}
            barrios={barriosDisponibles}
            submitLabel="Guardar y confirmar"
            enviando={procesandoSolicitud === solicitudEnEdicion.id}
            idPrefix="admin-sol"
            onSubmit={(datos) => handleConfirmarSolicitud(solicitudEnEdicion, datos)}
            onCancel={cerrarEdicionSolicitud}
          />
        </Dialog>
      )}
    </div>
  );
}

//Filas de la comparación "datos actuales vs. propuestos" de una solicitud
function filasComparacion(actual: DatosCliente, propuesto: DatosCliente) {
  const calleNumero = (d: DatosCliente) => [d.calle, d.numero].filter((v) => v != null && v !== '').join(' ');
  const filas: { label: string; actual: string; propuesto: string }[] = [
    { label: 'Nombre', actual: actual.nombre ?? '', propuesto: propuesto.nombre ?? '' },
    { label: 'Apellido', actual: actual.apellido ?? '', propuesto: propuesto.apellido ?? '' },
    { label: 'Teléfono', actual: actual.telefono ?? '', propuesto: propuesto.telefono ?? '' },
    { label: 'Calle y número', actual: calleNumero(actual), propuesto: calleNumero(propuesto) },
    { label: 'Piso', actual: actual.piso ?? '', propuesto: propuesto.piso ?? '' },
    { label: 'Departamento', actual: actual.departamento ?? '', propuesto: propuesto.departamento ?? '' },
    { label: 'Localidad', actual: actual.localidadNombre ?? '', propuesto: propuesto.localidadNombre ?? '' },
    { label: 'Barrio', actual: actual.barrioNombre ?? '', propuesto: propuesto.barrioNombre ?? '' },
    { label: 'Observaciones', actual: actual.observaciones ?? '', propuesto: propuesto.observaciones ?? '' },
  ];
  return filas
    .filter((f) => f.actual !== '' || f.propuesto !== '')
    .map((f) => ({ ...f, cambio: f.actual !== f.propuesto }));
}

function SolicitudCard({
  solicitud,
  procesando,
  onConfirmar,
  onEditar,
  onRechazar,
}: {
  solicitud: SolicitudActualizacion;
  procesando: boolean;
  onConfirmar: () => void;
  onEditar: () => void;
  onRechazar: () => void;
}) {
  const filas = filasComparacion(solicitud.actual, solicitud.propuesto);
  const cambios = filas.filter((f) => f.cambio).length;
  const pendiente = solicitud.estado === 'PENDIENTE';

  return (
    <li className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-coop-line-soft p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-bold">
            {solicitud.actual.nombre} {solicitud.actual.apellido}
          </p>
          <p className="text-sm text-coop-muted">
            Cliente #{solicitud.clienteId}
            {solicitud.clienteDni ? ` · DNI ${solicitud.clienteDni}` : ''} · Solicitud #{solicitud.id} del{' '}
            {formatearFechaSimple(solicitud.fechaSolicitud)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pendiente && (
            <span className="text-sm font-semibold text-coop-muted">
              {cambios === 0 ? 'Sin cambios' : `${cambios} ${cambios === 1 ? 'campo cambia' : 'campos cambian'}`}
            </span>
          )}
          <Badge tone={pendiente ? 'orange' : solicitud.estado === 'CONFIRMADA' ? 'green' : 'red'}>
            {pendiente ? 'Pendiente' : solicitud.estado === 'CONFIRMADA' ? 'Confirmada' : 'Rechazada'}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-coop-ground text-xs uppercase tracking-wider text-coop-muted">
              <th className="px-5 py-2.5">Campo</th>
              <th className="px-5 py-2.5">Datos actuales</th>
              <th className="px-5 py-2.5">Datos solicitados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coop-line-soft">
            {filas.map((fila) => (
              <tr key={fila.label} className={fila.cambio ? 'bg-coop-orange-soft/60' : ''}>
                <th scope="row" className="px-5 py-2.5 font-semibold text-coop-muted">
                  {fila.label}
                </th>
                <td className={`px-5 py-2.5 ${fila.cambio ? 'text-coop-muted line-through' : ''}`}>{fila.actual || '—'}</td>
                <td className={`px-5 py-2.5 ${fila.cambio ? 'font-bold text-coop-navy' : ''}`}>{fila.propuesto || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-coop-line-soft p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {pendiente ? (
          <>
            <button
              type="button"
              onClick={onRechazar}
              disabled={procesando}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-red-200 px-4 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={18} aria-hidden="true" /> Rechazar
            </button>
            <button type="button" onClick={onEditar} disabled={procesando} className="btn-outline">
              <Edit size={18} aria-hidden="true" /> Editar y confirmar
            </button>
            <button type="button" onClick={onConfirmar} disabled={procesando} className="btn-primary">
              <Check size={18} aria-hidden="true" /> {procesando ? 'Procesando…' : 'Confirmar'}
            </button>
          </>
        ) : (
          <p className="text-sm text-coop-muted">
            {solicitud.estado === 'CONFIRMADA' ? 'Confirmada' : 'Rechazada'}
            {solicitud.resueltaPor ? ` por ${solicitud.resueltaPor}` : ''}
            {solicitud.fechaResolucion ? ` el ${formatearFechaSimple(solicitud.fechaResolucion)}` : ''}.
          </p>
        )}
      </div>
    </li>
  );
}

function TituloSeccion({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="font-display text-[34px] font-bold uppercase leading-none text-coop-navy sm:text-[40px]">{titulo}</h1>
        <p className="mt-1 text-coop-muted">{subtitulo}</p>
      </div>
      {children && <div className="flex flex-col gap-3 sm:flex-row">{children}</div>}
    </div>
  );
}

function Buscador({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative sm:w-72">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coop-muted" aria-hidden="true" />
      <input id={id} type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="field pl-10" />
    </div>
  );
}

function Subtitulo({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-2 border-b border-coop-line-soft pb-2 text-sm font-bold uppercase tracking-wider text-coop-green first:mt-0 md:col-span-2">
      {children}
    </h2>
  );
}

function Campo({
  label,
  hint,
  name,
  ...props
}: { label: string; hint?: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `campo-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {hint && <span className="text-xs font-normal text-coop-muted">{hint}</span>}
      </label>
      <input id={id} name={name} type={props.type ?? 'text'} {...props} className="field" />
    </div>
  );
}
