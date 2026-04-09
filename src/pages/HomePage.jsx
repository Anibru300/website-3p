import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import StatsSection from '../components/StatsSection';
import BrandShowcase from '../components/BrandShowcase';
import CatalogGallery from '../components/CatalogGallery';
import VentilationCalculator from '../components/VentilationCalculator';
import Clients from '../components/Clients';
import Contact from '../components/Contact';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import BackToTop from '../components/BackToTop';
import SEO from '../components/SEO';

const HomePage = () => {
  return (
    <>
      <SEO 
        title="3P S.A. DE C.V. | Equipos para la Industria Avícola y Porcícola"
        description="Más de 27 años de experiencia distribuyendo equipos de alta tecnología para la industria avícola, porcícola e invernaderos. Representantes oficiales de FANCOM, LANDMECO, LUBING, CHORE-TIME y más."
        keywords="equipos avícolas, ventilación granjas, comederos automáticos, bebederos, industria avícola, León Guanajuato, FANCOM, LANDMECO, CHORE-TIME, ROXELL, LUBING"
      />
      <main className="relative z-10">
        <Hero />
        <About />
        <Services />
        <StatsSection />
        <BrandShowcase />
        <section id="catalogos">
          <CatalogGallery />
        </section>
        <VentilationCalculator />
        <Clients />
        <Contact />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppChat />
      <BackToTop />
    </>
  );
};

export default HomePage;
