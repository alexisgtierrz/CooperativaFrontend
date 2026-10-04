import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Search, MessageCircle, User, FileText, Calendar, 
  MessageSquare, Search as SearchIcon, Edit3, Wifi, Clock, Tv, 
  FileBox, Check, PhoneCall, CreditCard, MonitorSmartphone, QrCode, MapPin,
  LogOut, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  // Estados para el Login y Autenticación
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Estados del Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [pendingRoute, setPendingRoute] = useState('');

  // Verificar si hay una sesión activa al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (token) {
      setIsAuthenticated(true);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  // Función de Login conectada al Backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();
      localStorage.setItem('token', data.token); 
      localStorage.setItem('userEmail', email);
      
      setIsAuthenticated(true);
      setUserEmail(email);
      setIsLoginModalOpen(false);
     
      setEmail('');
      setPassword('');
      
      if (pendingRoute) {
        navigate(pendingRoute);
        setPendingRoute('');
      } else {
        alert('¡Login exitoso!');
      }

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail('');
    setIsProfileModalOpen(false);
    alert('Sesión cerrada correctamente');
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsProfileModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Función para manejar los clics en los botones de accesos rápidos
  const handleAccesoRapidoClick = (ruta?: string) => {
    if (ruta) {
      if (isAuthenticated) {
        navigate(ruta);
      } else {
        setPendingRoute(ruta);
        setIsLoginModalOpen(true);
      }
    } else {
      alert("Sección en desarrollo");
    }
  };

  // Datos para renderizar las grillas rápidamente (Añadido el 'ruta: /vencimientos')
  const accesosRapidos = [
    { icon: <User className="text-pink-500" />, title: 'Mi número de asociado', bg: 'bg-pink-50' },
    { icon: <FileText className="text-green-500" />, title: 'Pagá tu factura', bg: 'bg-green-50' },
    { icon: <Calendar className="text-purple-500" />, title: 'Próximos vencimientos', bg: 'bg-purple-50', ruta: '/vencimientos' },
    { icon: <MessageSquare className="text-orange-500" />, title: 'Iniciar un reclamo', bg: 'bg-orange-50' },
    { icon: <SearchIcon className="text-blue-500" />, title: 'Seguí tu reclamo', bg: 'bg-blue-50' },
    { icon: <Edit3 className="text-teal-500" />, title: 'Actualizá tus datos', bg: 'bg-teal-50' },
    { icon: <Wifi className="text-yellow-600" />, title: 'Test de velocidad', bg: 'bg-yellow-50' },
    { icon: <Clock className="text-red-400" />, title: 'Horarios de atención', bg: 'bg-red-50' },
    { icon: <Tv className="text-indigo-500" />, title: 'Grilla de canales', bg: 'bg-indigo-50' },
    { icon: <FileBox className="text-gray-500" />, title: 'Otros trámites online', bg: 'bg-gray-100' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      
      {/* 1. NAVBAR */}
      <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-green-500"></div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">COOPERATIVA DE SERVICIOS</h1>
            <p className="text-gray-500 text-xs">Nombre y localidad - Ltda.</p>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="text-green-600 font-bold">Inicio</a>
          <a href="#" className="hover:text-green-600">Nosotros</a>
          <a href="#" className="hover:text-green-600">Servicios</a>
          <a href="#" className="hover:text-green-600">Institucional</a>
          <a href="#" className="hover:text-green-600">Novedades</a>
          <a href="#" className="hover:text-green-600">Contacto</a>
        </nav>
        
        <button 
          onClick={handleUserIconClick} 
          className={`transition-colors flex items-center gap-2 ${isAuthenticated ? 'text-green-600' : 'text-gray-800 hover:text-green-600'}`}
        >
          {isAuthenticated && <span className="hidden md:block text-sm font-medium">{userEmail}</span>}
          <UserCircle size={32} strokeWidth={2} />
        </button>
      </header>

      {/* 2. HERO SECTION */}
       <section className="relative pt-16 pb-24 px-4 bg-gradient-to-br from-[#0c3b24] via-[#167041] to-[#22c55e] flex flex-col items-center text-center overflow-hidden">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] border-[80px] border-white/5 rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        
        <div className="bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span className="text-white text-xs font-medium">Internet · Televisión · Telefonía</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase max-w-3xl leading-tight mb-4 z-10">
          CONECTADOS CON NUESTRA COMUNIDAD
        </h2>
        <p className="text-white/90 text-lg max-w-2xl mb-10 z-10 font-light">
          Gestioná tus servicios, pagá tus facturas y seguí tus reclamos desde un solo lugar, cuando quieras.
        </p>

        <div className="w-full max-w-2xl bg-white rounded-full p-1.5 flex items-center shadow-xl z-10 mb-8">
          <div className="pl-4 pr-2 text-gray-400"><Search size={20} /></div>
          <input type="text" placeholder="¿Qué estás buscando? Ej: pagar factura, test de velocidad..." className="flex-1 bg-transparent outline-none text-gray-700 text-sm" />
          <button className="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded-full text-sm">Buscar</button>
        </div>
      </section>

      {/* 3. ACCESOS RÁPIDOS */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">ACCESOS RÁPIDOS</h3>
            <a href="#" className="text-green-600 text-sm font-medium hover:underline">Ver todos los trámites →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {accesosRapidos.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => handleAccesoRapidoClick(item.ruta)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-green-300 transition-all gap-3 bg-white"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-xs text-center font-medium text-gray-700">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICIOS */}
      <section className="max-w-6xl mx-auto px-4 py-8 mb-16 text-center">
        <h4 className="text-green-600 font-bold text-sm mb-2 tracking-widest uppercase">Nuestros Servicios</h4>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Todo lo que tu hogar necesita para estar conectado</h2>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {/* Plan 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-6"><Wifi className="text-green-600"/></div>
            <h3 className="text-xl font-bold mb-2">Internet por fibra</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">Planes simétricos con instalación incluida y soporte técnico local.</p>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex gap-2"><Check size={18} className="text-green-500"/> Hasta 1000 Mbps</li>
              <li className="flex gap-2"><Check size={18} className="text-green-500"/> Wi-Fi de alto alcance</li>
              <li className="flex gap-2"><Check size={18} className="text-green-500"/> Sin límite de datos</li>
            </ul>
            <div className="flex justify-between items-end">
              <div><p className="text-xs text-gray-500">desde</p><p className="text-xl font-bold">$ 00.000 <span className="text-sm font-normal">/mes</span></p></div>
              <button className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">Ver planes</button>
            </div>
          </div>

          {/* Plan 2 Destacado */}
          <div className="bg-[#0f2e1b] text-white p-8 rounded-2xl shadow-xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-6 right-6 bg-green-500 text-[#0f2e1b] text-xs font-bold px-3 py-1 rounded-full">MÁS ELEGIDO</div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6"><Tv className="text-green-400"/></div>
            <h3 className="text-xl font-bold mb-2">Televisión digital</h3>
            <p className="text-gray-300 text-sm mb-6 flex-1">Más de 100 canales en HD, canal local y app para ver desde cualquier dispositivo.</p>
            <ul className="space-y-3 mb-8 text-sm text-gray-200">
              <li className="flex gap-2"><Check size={18} className="text-green-400"/> +100 canales HD</li>
              <li className="flex gap-2"><Check size={18} className="text-green-400"/> Canal comunitario</li>
              <li className="flex gap-2"><Check size={18} className="text-green-400"/> Pack fútbol opcional</li>
            </ul>
            <div className="flex justify-between items-end">
              <div><p className="text-xs text-gray-400">desde</p><p className="text-xl font-bold">$ 00.000 <span className="text-sm font-normal">/mes</span></p></div>
              <button className="bg-green-500 text-[#0f2e1b] px-4 py-2 rounded text-sm font-bold">Ver planes</button>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6"><PhoneCall className="text-blue-500"/></div>
            <h3 className="text-xl font-bold mb-2">Telefonía fija</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">Línea fija con llamadas locales ilimitadas entre asociados de la cooperativa.</p>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex gap-2"><Check size={18} className="text-blue-500"/> Llamadas locales libres</li>
              <li className="flex gap-2"><Check size={18} className="text-blue-500"/> Identificador de llamadas</li>
              <li className="flex gap-2"><Check size={18} className="text-blue-500"/> Guía telefónica online</li>
            </ul>
            <div className="flex justify-between items-end">
              <div><p className="text-xs text-gray-500">desde</p><p className="text-xl font-bold">$ 00.000 <span className="text-sm font-normal">/mes</span></p></div>
              <button className="bg-[#0ea5e9] text-white px-4 py-2 rounded text-sm font-medium">Ver planes</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b2918] text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
               <div className="w-6 h-6 rounded-full border border-dashed border-white"></div>
               COOPERATIVA
            </h4>
            <p className="text-gray-400 text-sm">Internet, televisión y telefonía para nuestra comunidad.</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE LOGIN */}
      {isLoginModalOpen && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            {pendingRoute && <p className="text-orange-600 text-sm mb-2 font-medium">Debes iniciar sesión para acceder a ese trámite.</p>}
            <p className="text-gray-500 text-sm mb-6">Ingresá a tu Oficina Virtual</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                {loading ? 'Validando...' : 'Ingresar a mi cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL */}
      {isProfileModalOpen && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm relative flex flex-col items-center text-center">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-xl">&times;</button>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Bienvenido</h2>
            <p className="text-gray-600 text-sm mb-6">{userEmail}</p>

            <div className="w-full space-y-3">
              <button onClick={() => { setIsProfileModalOpen(false); navigate('/perfil'); }} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg">
                <User size={18} /> Ir a mi Perfil
              </button>
              {userEmail === 'admin@coop.com' && (
                <button onClick={() => { setIsProfileModalOpen(false); navigate('/admin'); }} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-medium py-3 rounded-lg">
                  <Shield size={18} /> Panel de Administrador
                </button>
              )}
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-medium py-3 rounded-lg">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}