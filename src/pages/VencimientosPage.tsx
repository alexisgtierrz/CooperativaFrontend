import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function VencimientosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVencimientos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Debes iniciar sesión para ver tus vencimientos.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8080/api/clientes/perfil-actual', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la información del perfil.');
        }

        const data = await response.json();
        
        // Verificamos que sea un cliente y tenga suscripciones
        if (data.tipoUsuario === 'CLIENTE' && data.perfil?.suscripciones) {
          // Filtramos solo las suscripciones que no tienen fecha de baja (están activas)
          const activas = data.perfil.suscripciones.filter((s: any) => !s.fechaBaja);
          setSuscripciones(activas);
        } else {
          setSuscripciones([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error de red.');
      } finally {
        setLoading(false);
      }
    };

    fetchVencimientos();
  }, []);

  const formatearFechaSimple = (fechaString: string) => {
    if (!fechaString) return '';
    const fechaLimpia = fechaString.split('T')[0];
    const [year, month, day] = fechaLimpia.split('-');
    return `${day}/${month}/${year}`;
  };

  // Función para calcular los días restantes y asignar colores visuales
  const getEstadoVencimiento = (fechaHasta: string) => {
    if (!fechaHasta) return { texto: 'Sin vencimiento', color: 'text-gray-600 bg-gray-100 border-gray-200', icon: <Clock size={16} /> };
    
    const hoy = new Date();
    // Forzamos la lectura en hora local agregando la hora 00:00:00
    const fechaLimpia = fechaHasta.split('T')[0];
    const vencimiento = new Date(`${fechaLimpia}T00:00:00`);
    
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);
    
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { texto: `Vencido hace ${Math.abs(diffDays)} días`, color: 'text-red-700 bg-red-100 border-red-200', icon: <ShieldAlert size={16} /> };
    if (diffDays === 0) return { texto: 'Vence HOY', color: 'text-red-700 bg-red-100 border-red-200', icon: <AlertCircle size={16} /> };
    if (diffDays <= 7) return { texto: `Vence en ${diffDays} días`, color: 'text-orange-700 bg-orange-100 border-orange-200', icon: <Clock size={16} /> };
    
    return { texto: `Vence en ${diffDays} días`, color: 'text-green-700 bg-green-100 border-green-200', icon: <CheckCircle2 size={16} /> };
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando tus vencimientos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* HEADER SIMPLE */}
      <header className="bg-white px-8 py-4 flex items-center shadow-sm relative z-20">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors">
          <ArrowLeft size={20} /> Volver al Inicio
        </button>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <CalendarClock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Próximos Vencimientos</h1>
            <p className="text-gray-500 mt-1">Consulta el estado y vencimiento de tus servicios contratados.</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Ir a Iniciar Sesión</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
            {suscripciones.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <CheckCircle2 className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-lg">No tienes servicios activos próximos a vencer.</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {suscripciones.map((sub: any) => {
                  const estado = getEstadoVencimiento(sub.fechaHasta);
                  
                  return (
                    <div key={sub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{sub.servicio?.nombre || 'Servicio Contratado'}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Fecha de alta: {formatearFechaSimple(sub.fechaAlta)}
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          Vencimiento exacto: <span className="font-bold">{formatearFechaSimple(sub.fechaHasta)}</span>
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-sm ${estado.color}`}>
                        {estado.icon}
                        {estado.texto}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> Las suscripciones tienen una validez de 1 mes calendario. Si no se registra el pago antes de la fecha de vencimiento, el servicio procederá a darse de baja automáticamente.
          </p>
        </div>
      </main>
    </div>
  );
}