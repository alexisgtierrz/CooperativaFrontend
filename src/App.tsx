import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

import LandingPage from './pages/LandingPage'; // Ajustá la ruta si lo guardaste en otra carpeta como /components

function App() {
  return (
    <>
      <LandingPage />
    </>
  );
}

export default App;