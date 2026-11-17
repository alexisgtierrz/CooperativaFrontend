import HeroCarousel from '../components/home/HeroCarousel';
import QuickAccess from '../components/home/QuickAccess';
import ServicesSection from '../components/home/ServicesSection';
import PaymentsSection from '../components/home/PaymentsSection';
import CoverageSection from '../components/home/CoverageSection';
import NewsSection from '../components/home/NewsSection';
import StatsBand from '../components/home/StatsBand';

/**
 * Inicio. El login, la sesión y la "ruta pendiente" (pedir login antes de entrar a un trámite)
 * ahora viven en AuthProvider para que funcionen igual en todas las páginas.
 */
export default function LandingPage() {
  return (
    <>
      <HeroCarousel />
      <QuickAccess />
      <ServicesSection />
      <PaymentsSection />
      <CoverageSection />
      <NewsSection />
      <StatsBand />
    </>
  );
}
