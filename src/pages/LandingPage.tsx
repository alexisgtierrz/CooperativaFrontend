import React, { useState } from 'react';
import { 
  UserCircle, Search, MessageCircle, User, FileText, Calendar, 
  MessageSquare, Search as SearchIcon, Edit3, Wifi, Clock, Tv, 
  FileBox, Check, PhoneCall, CreditCard, MonitorSmartphone, QrCode, MapPin
} from 'lucide-react';

export default function LandingPage() {
  // Estados para el Login Integrado
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      alert('¡Login exitoso!');
      setIsLoginOpen(false); // Cierra el modal
      // window.location.href = '/dashboard'; 
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Datos para renderizar las grillas rápidamente
  const accesosRapidos = [
    { icon: <User className="text-pink-500" />, title: 'Mi número de asociado', bg: 'bg-pink-50' },
    { icon: <FileText className="text-green-500" />, title: 'Pagá tu factura', bg: 'bg-green-50' },
    { icon: <Calendar className="text-purple-500" />, title: 'Próximos vencimientos', bg: 'bg-purple-50' },
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
        <button onClick={() => setIsLoginOpen(true)} className="text-gray-800 hover:text-green-600 transition-colors">
          <UserCircle size={32} strokeWidth={2} />
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 bg-gradient-to-br from-[#0c3b24] via-[#167041] to-[#22c55e] flex flex-col items-center text-center overflow-hidden">
        {/* Círculos abstractos de fondo */}
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

        {/* Buscador */}
        <div className="w-full max-w-2xl bg-white rounded-full p-1.5 flex items-center shadow-xl z-10 mb-8">
          <div className="pl-4 pr-2 text-gray-400"><Search size={20} /></div>
          <input type="text" placeholder="¿Qué estás buscando? Ej: pagar factura, test de velocidad..." className="flex-1 bg-transparent outline-none text-gray-700 text-sm" />
          <button className="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded-full text-sm">Buscar</button>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex gap-4 z-10">
          <button onClick={() => setIsLoginOpen(true)} className="bg-[#4ade80] hover:bg-green-400 text-[#064e3b] font-bold py-2.5 px-6 rounded text-sm flex items-center gap-2 shadow-lg">
            OFICINA VIRTUAL <span>→</span>
          </button>
          <button className="bg-[#0ea5e9] hover:bg-blue-400 text-white font-bold py-2.5 px-6 rounded text-sm flex items-center gap-2 shadow-lg">
            PORTAL EMPRESAS <span>→</span>
          </button>
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
              <button key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow gap-3 bg-white">
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

      {/* 5. MEDIOS DE PAGO Y OFICINA VIRTUAL */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-green-600 font-bold text-sm mb-2 tracking-widest uppercase">MEDIOS DE PAGO</h4>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Pagá tu factura sin<br/>complicaciones</h2>
            <p className="text-gray-500 text-sm mb-8">Elegí el medio que más te convenga. Tu pago se acredita automáticamente en tu cuenta.</p>
            
            <div className="space-y-3">
              {[
                { icon: <CreditCard className="text-green-600" />, title: 'Débito automático', desc: 'Adherí tu tarjeta o CBU y olvidate de los vencimientos.' },
                { icon: <MonitorSmartphone className="text-green-600" />, title: 'Botón de pago online', desc: 'Pagá con tarjeta de débito o crédito desde nuestra web.' },
                { icon: <QrCode className="text-purple-600" />, title: 'Transferencia o QR', desc: 'Escaneá el QR de tu factura con cualquier billetera virtual.' },
                { icon: <MapPin className="text-orange-500" />, title: 'Lugares de pago', desc: 'Oficinas de la cooperativa y redes de cobranza habilitadas.' }
              ].map((mp, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm cursor-pointer">
                  <div className="bg-gray-50 p-3 rounded-lg">{mp.icon}</div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-900">{mp.title}</h5>
                    <p className="text-xs text-gray-500">{mp.desc}</p>
                  </div>
                  <div className="text-gray-300">&gt;</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#103a24] p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
            <span className="bg-white/10 text-xs font-bold px-3 py-1 rounded-full tracking-wider mb-6 inline-block">AUTOGESTIÓN 24/7</span>
            <h2 className="text-4xl font-extrabold mb-4">Oficina Virtual</h2>
            <p className="text-green-100/80 text-sm mb-8 max-w-sm">Hacé trámites, consultá tu estado de cuenta, descargá tus facturas y seguí el estado de tus reclamos desde tu casa.</p>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3"><span>Factura septiembre</span><span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Pagada</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span>Factura octubre - vence 10/10</span><span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs">Pendiente</span></div>
              <div className="flex justify-between"><span>Reclamo #1042 · Sin conexión</span><span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs">Técnico asignado</span></div>
            </div>

            <button onClick={() => setIsLoginOpen(true)} className="bg-[#4ade80] hover:bg-green-400 text-[#064e3b] font-bold py-3 px-8 rounded shadow-lg flex items-center gap-2 w-max">
              INGRESAR <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER BÁSICO */}
      <footer className="bg-[#0b2918] text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
               <div className="w-6 h-6 rounded-full border border-dashed border-white"></div>
               COOPERATIVA
            </h4>
            <p className="text-gray-400 text-sm">Internet, televisión y telefonía para nuestra comunidad.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">SERVICIOS</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Internet</li><li>Televisión</li><li>Telefonía</li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold mb-4">CONTACTO</h4>
             <p className="text-gray-400 text-sm space-y-2">0800-000-0000<br/>contacto@coop.com.ar</p>
          </div>
        </div>
      </footer>

      {/* Botón flotante de WhatsApp */}
      <button className="fixed bottom-6 right-6 bg-[#25d366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-2xl z-40 transition-transform hover:scale-105">
        <MessageCircle size={28} />
      </button>

      {/* MODAL DE LOGIN INTEGRADO */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm mb-6">Ingresá a tu Oficina Virtual</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" placeholder="tuemail@ejemplo.com" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" placeholder="••••••••" />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-70">
                {loading ? 'Validando...' : 'Ingresar a mi cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}