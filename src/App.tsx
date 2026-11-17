import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import SiteLayout from './components/layout/SiteLayout';
import ScrollManager from './components/layout/ScrollManager';
import RequireAuth from './components/RequireAuth';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import VencimientosPage from './pages/VencimientosPage';
import ReclamosPage from './pages/ReclamosPage';
import ServiciosPage from './pages/ServiciosPage';
import NosotrosPage from './pages/NosotrosPage';
import InstitucionalPage from './pages/InstitucionalPage';
import NovedadesPage, { NovedadDetallePage } from './pages/NovedadesPage';
import ContactoPage from './pages/ContactoPage';
import Login from './pages/Login';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/institucional" element={<InstitucionalPage />} />
            <Route path="/novedades" element={<NovedadesPage />} />
            <Route path="/novedades/:slug" element={<NovedadDetallePage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/login" element={<Login />} />

            {/* Oficina Virtual (requiere sesión) */}
            <Route path="/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/vencimientos" element={<RequireAuth><VencimientosPage /></RequireAuth>} />
            <Route path="/reclamos" element={<RequireAuth><ReclamosPage /></RequireAuth>} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* El panel de administración tiene su propio layout */}
          <Route
            path="/admin"
            element={
              <RequireAuth adminOnly withChrome>
                <AdminPanelPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
