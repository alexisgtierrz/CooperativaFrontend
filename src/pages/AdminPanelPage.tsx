import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Shield, PlusCircle, Edit, Trash2, Plus, Search } from 'lucide-react';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clientes'); 

  const [showClientForm, setShowClientForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState<any>(null);

  const [clientes, setClientes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<any[]>([]);
  const [filtroBusquedaCliente, setFiltroBusquedaCliente] = useState('');
  const [filtroBusquedaUsuario, setFiltroBusquedaUsuario] = useState('');
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState<any[]>([]);
  const [barriosDisponibles, setBarriosDisponibles] = useState<any[]>([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState<string>('');

  const [suscripcionesForm, setSuscripcionesForm] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchServicios();
    fetchUsuarios();
    fetchPerfiles();
    fetchLocalidades();
    fetchBarrios();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) { console.error("Error al buscar clientes:", error); }
  };

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/servicios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServiciosDisponibles(data);
        if (data.length > 0) setServicioSeleccionado(String(data[0].id));
      }
    } catch (error) { console.error("Error al buscar servicios:", error); }
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setUsuarios(await response.json());
    } catch (error) { console.error("Error al buscar usuarios:", error); }
  };

  const fetchPerfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/perfiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setPerfilesDisponibles(await response.json());
    } catch (error) { console.error("Error al buscar perfiles:", error); }
  };

  const fetchLocalidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/localidades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setLocalidadesDisponibles(await response.json());
    } catch (error) { console.error("Error al buscar localidades:", error); }
  };

  const fetchBarrios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/barrios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setBarriosDisponibles(await response.json());
    } catch (error) { console.error("Error al buscar barrios:", error); }
  };

  const handleNuevoCliente = () => {
    setClienteEnEdicion(null);
    setSuscripcionesForm([]); 
    setLocalidadSeleccionada('');
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
    setShowClientForm(true);
  };

  const handleAgregarSuscripcion = () => {
    const servicio = serviciosDisponibles.find(s => s.id === Number(servicioSeleccionado));
    if (servicio) {
      const nuevaSub = {
        temporalId: Date.now(),
        fechaAlta: new Date().toISOString().split('T')[0],
        servicio: servicio
      };
      setSuscripcionesForm([...suscripcionesForm, nuevaSub]);
    }
  };

  const handleEliminarSuscripcion = (identificador: number) => {
    setSuscripcionesForm(suscripcionesForm.filter(sub => (sub.id || sub.temporalId) !== identificador));
  };

  const handleGuardarCliente = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const formData = new FormData(e.currentTarget);
    
    const barrioIdValue = formData.get('barrioId');

    const domicilioData = {
      id: clienteEnEdicion?.domicilio?.id || null,
      calle: formData.get('calle'),
      numero: Number(formData.get('numero')),
      piso: formData.get('piso'),
      departamento: formData.get('departamento'),
      observaciones: formData.get('observaciones'),
      barrio: barrioIdValue ? { id: Number(barrioIdValue) } : null
    };

    const suscripcionesParaBackend = suscripcionesForm.map(sub => {
      return {
        id: sub.id, 
        fechaAlta: sub.fechaAlta,
        servicio: sub.servicio,
        domicilio: sub.domicilio || domicilioData 
      };
    });

    const clienteData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      dni: formData.get('dni'),
      telefono: String(formData.get('telefono')),
      email: formData.get('email'),
      activo: true,
      usuario: clienteEnEdicion?.usuario || null,
      domicilio: domicilioData,
      suscripciones: suscripcionesParaBackend
    };

    try {
      const url = clienteEnEdicion 
        ? `http://localhost:8080/api/clientes/${clienteEnEdicion.id}`
        : 'http://localhost:8080/api/clientes';
      const method = clienteEnEdicion ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }

      await fetchClientes();
      await fetchUsuarios();
      alert('¡Cliente guardado exitosamente en la base de datos!');
      setShowClientForm(false); 
    } catch (error) {
      alert("Hubo un error al comunicarse con el servidor. Revisá la consola.");
      console.error(error);
    }
  };

  const handleGuardarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const usuarioData = {
      email: formData.get('email'),
      password: formData.get('password'),
      activo: true,
      perfil: { id: Number(formData.get('perfilId')) }
    };
    const clienteIdAsociar = formData.get('clienteIdAsociar');

    try {
      const token = localStorage.getItem('token');
      const responseUser = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioData)
      });

      if (!responseUser.ok) throw new Error('Error al registrar el usuario');
      const nuevoUsuario = await responseUser.json();

      if (clienteIdAsociar) {
        const clienteAFec = clientes.find(c => c.id === Number(clienteIdAsociar));
        if (clienteAFec) {
          const clienteActualizado = { ...clienteAFec, usuario: { id: nuevoUsuario.id } };
          await fetch(`http://localhost:8080/api/clientes/${clienteAFec.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clienteActualizado)
          });
        }
      }

      await fetchUsuarios();
      await fetchClientes();
      alert('¡Usuario creado exitosamente!');
      setShowUserForm(false);
    } catch (error) {
      alert("Error al procesar la creación del usuario. Revisá la consola.");
      console.error(error);
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const texto = filtroBusquedaCliente.toLowerCase();
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
    const dni = String(cliente.dni || '').toLowerCase();
    return nombreCompleto.includes(texto) || dni.includes(texto);
  });

  const usuariosFiltrados = usuarios.filter(u => {
    const texto = filtroBusquedaUsuario.toLowerCase();
    return String(u.email || '').toLowerCase().includes(texto);
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0b2918] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="text-green-400" /> Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setActiveTab('clientes'); setShowClientForm(false); setShowUserForm(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clientes' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
            <Users size={18} /> Gestión de Clientes
          </button>
          <button onClick={() => { setActiveTab('usuarios'); setShowClientForm(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
            <UserPlus size={18} /> Gestión de Usuarios
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* PESTAÑA CLIENTES */}
        {activeTab === 'clientes' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl font-extrabold text-gray-900">Clientes</h1>
              {!showClientForm && (
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Search size={18} />
                    </span>
                    <input 
                      type="text"
                      placeholder="Buscar por nombre o DNI..."
                      value={filtroBusquedaCliente}
                      onChange={(e) => setFiltroBusquedaCliente(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-sm outline-none focus:border-green-500 shadow-sm"
                    />
                  </div>
                  <button onClick={handleNuevoCliente} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap">
                    <PlusCircle size={18} /> Nuevo Cliente
                  </button>
                </div>
              )}
            </div>

            {showClientForm ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">
                  {clienteEnEdicion ? `Modificar Cliente #${clienteEnEdicion.id}` : 'Registrar Nuevo Cliente'}
                </h3>
                
                <form onSubmit={handleGuardarCliente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Nombre</label><input type="text" name="nombre" defaultValue={clienteEnEdicion?.nombre} required className="w-full border rounded p-2 outline-none focus:border-green-500" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Apellido</label><input type="text" name="apellido" defaultValue={clienteEnEdicion?.apellido} required className="w-full border rounded p-2 outline-none focus:border-green-500" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">DNI</label><input type="text" name="dni" defaultValue={clienteEnEdicion?.dni} required className="w-full border rounded p-2 outline-none focus:border-green-500" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Teléfono</label><input type="text" name="telefono" defaultValue={clienteEnEdicion?.telefono} required className="w-full border rounded p-2 outline-none focus:border-green-500" /></div>
                  
                  <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Email <span className="text-xs text-gray-400 font-normal">(Se utilizará para crear la cuenta de usuario)</span></label><input type="email" name="email" defaultValue={clienteEnEdicion?.email} required className="w-full border rounded p-2 outline-none focus:border-green-500" /></div>
                  
                  <div className="md:col-span-2 mt-4"><h4 className="font-bold text-gray-700">Domicilio</h4></div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Localidad</label>
                    <select 
                      value={localidadSeleccionada}
                      onChange={(e) => setLocalidadSeleccionada(e.target.value)}
                      className="w-full border rounded p-2 outline-none focus:border-green-500 bg-white text-sm"
                    >
                      <option value="">Seleccione una localidad...</option>
                      {localidadesDisponibles.map((loc: any) => (
                        <option key={loc.id} value={loc.id}>{loc.nombre} ({loc.codigoPostal})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Barrio</label>
                    <select 
                      name="barrioId"
                      defaultValue={clienteEnEdicion?.domicilio?.barrio?.id || ''}
                      required
                      className="w-full border rounded p-2 outline-none focus:border-green-500 bg-white text-sm"
                    >
                      <option value="">Seleccione un barrio...</option>
                      {barriosDisponibles
                        .filter((barrio: any) => !localidadSeleccionada || barrio.localidad?.id === Number(localidadSeleccionada))
                        .map((barrio: any) => (
                          <option key={barrio.id} value={barrio.id}>{barrio.nombre}</option>
                        ))}
                    </select>
                  </div>
                  <div><label className="block text-sm text-gray-600 mb-1">Calle</label><input type="text" name="calle" defaultValue={clienteEnEdicion?.domicilio?.calle || ''} required className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="Ej: San Martín" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Número</label><input type="number" name="numero" defaultValue={clienteEnEdicion?.domicilio?.numero || ''} required className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="Ej: 150" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Piso</label><input type="text" name="piso" defaultValue={clienteEnEdicion?.domicilio?.piso || ''} className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="Opcional" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Departamento</label><input type="text" name="departamento" defaultValue={clienteEnEdicion?.domicilio?.departamento || ''} className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="Opcional" /></div>
                  <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Observaciones</label><input type="text" name="observaciones" defaultValue={clienteEnEdicion?.domicilio?.observaciones || ''} className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="Casa con rejas negras" /></div>

                  <div className="md:col-span-2 mt-4 border-t pt-4">
                    <h4 className="font-bold text-gray-700 mb-3">Suscripciones del Cliente</h4>
                    <div className="space-y-2 mb-4">
                      {suscripcionesForm.filter((s: any) => !s.fechaBaja).length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No posee servicios activos.</p>
                      ) : (
                        suscripcionesForm.filter((s: any) => !s.fechaBaja).map((sub) => (
                          <div key={sub.id || sub.temporalId} className="flex justify-between items-center bg-gray-50 border p-3 rounded-lg">
                            <div>
                              <span className="font-bold text-sm text-gray-800">{sub.servicio.nombre}</span>
                              <span className="text-xs text-gray-500 ml-2">Alta: {sub.fechaAlta}</span>
                            </div>
                            <button type="button" onClick={() => handleEliminarSuscripcion(sub.id || sub.temporalId)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><Trash2 size={18} /></button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="flex-1 border rounded p-2 outline-none focus:border-green-500 bg-white text-sm">
                        {serviciosDisponibles.map(s => (<option key={s.id} value={s.id}>{s.nombre} - (${s.tarifa?.monto || 0})</option>))}
                      </select>
                      <button type="button" onClick={handleAgregarSuscripcion} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded flex items-center gap-1 text-sm font-medium"><Plus size={16} /> Agregar</button>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-6 flex justify-end gap-3 border-t pt-4">
                    <button type="button" onClick={() => setShowClientForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg">{clienteEnEdicion ? 'Guardar Cambios' : 'Crear Cliente'}</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 border-b">ID</th>
                      <th className="p-4 border-b">Cliente</th>
                      <th className="p-4 border-b">DNI</th>
                      <th className="p-4 border-b">Cuenta Asociada</th>
                      <th className="p-4 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-400 italic">No se encontraron clientes.</td></tr>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50">
                          <td className="p-4 border-b text-sm">{cliente.id}</td>
                          <td className="p-4 border-b text-sm font-medium">{cliente.nombre} {cliente.apellido}</td>
                          <td className="p-4 border-b text-sm text-gray-500">{cliente.dni}</td>
                          <td className="p-4 border-b text-sm text-blue-600">
                            {cliente.usuario?.email || <span className="text-gray-400 italic">Sin cuenta</span>}
                          </td>
                          <td className="p-4 border-b">
                            <button onClick={() => handleEditarCliente(cliente)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"><Edit size={14} /> Editar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA USUARIOS */}
        {activeTab === 'usuarios' && (
           <div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Usuarios</h1>
               {!showUserForm && (
                 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                   <div className="relative flex-1 sm:w-72">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><Search size={18} /></span>
                     <input 
                       type="text"
                       placeholder="Filtrar por email..."
                       value={filtroBusquedaUsuario}
                       onChange={(e) => setFiltroBusquedaUsuario(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-sm outline-none focus:border-green-500 shadow-sm"
                     />
                   </div>
                   <button onClick={() => setShowUserForm(true)} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap">
                     <PlusCircle size={18} /> Crear Usuario
                   </button>
                 </div>
               )}
             </div>

             {showUserForm ? (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold mb-4 border-b pb-2">Registrar Nuevo Usuario (Manual)</h3>
                 <form onSubmit={handleGuardarUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm text-gray-600 mb-1">Correo Electrónico (Email)</label>
                     <input type="email" name="email" required className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="usuario@coop.com" />
                   </div>
                   <div>
                     <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
                     <input type="password" name="password" required className="w-full border rounded p-2 outline-none focus:border-green-500" placeholder="••••••••" />
                   </div>
                   <div>
                     <label className="block text-sm text-gray-600 mb-1">Perfil / Rol</label>
                     <select name="perfilId" required className="w-full border rounded p-2 outline-none focus:border-green-500 bg-white text-sm">
                       <option value="">Seleccione un perfil...</option>
                       {perfilesDisponibles.map((p: any) => (
                         <option key={p.id} value={p.id}>{p.nombre}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm text-gray-600 mb-1">Asignar a un Cliente (Opcional)</label>
                     <select name="clienteIdAsociar" className="w-full border rounded p-2 outline-none focus:border-green-500 bg-white text-sm">
                       <option value="">No asociar a ningún cliente</option>
                       {clientes.filter(c => !c.usuario).map(c => (
                         <option key={c.id} value={c.id}>{c.nombre} {c.apellido} (DNI: {c.dni})</option>
                       ))}
                     </select>
                   </div>
                   <div className="md:col-span-2 mt-6 flex justify-end gap-3 border-t pt-4">
                     <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                     <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg">Guardar Usuario</button>
                   </div>
                 </form>
               </div>
             ) : (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                       <th className="p-4 border-b">ID</th>
                       <th className="p-4 border-b">Email</th>
                       <th className="p-4 border-b">Perfil / Rol</th>
                       <th className="p-4 border-b">Estado</th>
                     </tr>
                   </thead>
                   <tbody>
                     {usuariosFiltrados.length === 0 ? (
                       <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic">No se encontraron usuarios.</td></tr>
                     ) : (
                       usuariosFiltrados.map((u: any) => (
                         <tr key={u.id} className="hover:bg-gray-50">
                           <td className="p-4 border-b text-sm">{u.id}</td>
                           <td className="p-4 border-b text-sm font-medium">{u.email}</td>
                           <td className="p-4 border-b text-sm text-gray-600">{u.perfil?.nombre || 'Usuario'}</td>
                           <td className="p-4 border-b text-sm">
                             {u.activo ? (
                               <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Activo</span>
                             ) : (
                               <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Inactivo</span>
                             )}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}