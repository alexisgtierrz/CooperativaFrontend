import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import VencimientosPage from './pages/VencimientosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/vencimientos" element={<VencimientosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;