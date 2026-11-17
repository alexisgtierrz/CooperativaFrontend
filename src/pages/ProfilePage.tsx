import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, Briefcase, Ticket, Rss, Activity } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchPerfilReal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/clientes/perfil-actual', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("No se pudo cargar la información del perfil");
        }
      } catch (error) {
        console.error("Error de red al obtener el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilReal();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando perfil...</div>;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-600">No se encontró información de perfil para este usuario.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
          Volver al Inicio
        </button>
      </div>
    );
  }

  const { tipoUsuario, usuario, perfil } = userData;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* HEADER SIMPLIFICADO */}
      <header className="bg-white px-8 py-4 flex items-center shadow-sm relative z-20">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
          <ArrowLeft size={20} /> Volver al Inicio
        </button>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: DATOS DE USUARIO Y CUENTA */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{perfil.nombre} {perfil.apellido}</h2>
              <span className={`mt-2 px-3 py-1 text-xs font-bold rounded-full ${tipoUsuario === 'CLIENTE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {tipoUsuario}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Credenciales</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{usuario.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Contraseña</p>
                    <p className="text-sm font-medium text-gray-900">********</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: INFORMACIÓN DEL ROL */}
          <div className="md:col-span-2 space-y-6">
            
            {/* INFORMACIÓN PERSONAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información Personal</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Phone className="text-green-600 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm font-medium text-gray-900">{perfil.telefono}</p>
                  </div>
                </div>
                
                {tipoUsuario === 'CLIENTE' && (
                  <>
                    <div className="flex items-start gap-3">
                      <Activity className="text-green-600 mt-1" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Estado de Cuenta</p>
                        <p className="text-sm font-medium text-gray-900">
                          {perfil.activo ? <span className="text-green-600">Activo al día</span> : <span className="text-red-500">Suspendido</span>}
                        </p>
                      </div>
                    </div>
                    {perfil.domicilio && (
                      <div className="flex items-start gap-3 col-span-2">
                        <MapPin className="text-green-600 mt-1" size={18} />
                        <div>
                          <p className="text-xs text-gray-500">Domicilio de Servicio</p>
                          <p className="text-sm font-medium text-gray-900">
                            {perfil.domicilio.calle} {perfil.domicilio.numero}, B° {perfil.domicilio.barrio?.nombre || 'Centro'}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SECCIÓN SUSCRIPCIONES Y TICKETS */}
            {tipoUsuario === 'CLIENTE' && (
              <>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Rss size={16} /> Mis Suscripciones
                  </h3>
                  <div className="space-y-3">
                    {(!perfil.suscripciones || perfil.suscripciones.filter((s: any) => !s.fechaBaja).length === 0) ? (
                      <p className="text-sm text-gray-500 italic">No posees servicios activos actualmente.</p>
                    ) : (
                      perfil.suscripciones.filter((s: any) => !s.fechaBaja).map((sub: any) => (
                        <div key={sub.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{sub.servicio?.nombre}</span>
                            <span className="text-xs text-gray-400 block">Alta: {sub.fechaAlta}</span>
                          </div>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Activa</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Ticket size={16} /> Mis Tickets de Soporte
                  </h3>
                  <div className="space-y-3">
                    {(!perfil.tickets || perfil.tickets.length === 0) ? (
                      <p className="text-sm text-gray-500 italic">No tienes tickets de soporte registrados.</p>
                    ) : (
                      perfil.tickets.map((ticket: any) => (
                        <div key={ticket.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-100 gap-2">
                          <div>
                            <span className="text-xs text-gray-500 font-mono">#{ticket.id}</span>
                            <p className="text-sm font-medium text-gray-900">{ticket.descripcion}</p>
                          </div>
                          <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded self-start sm:self-auto whitespace-nowrap">
                            {ticket.estado}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}