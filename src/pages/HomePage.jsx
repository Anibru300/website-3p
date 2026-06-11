import { Hero, About, Services, StatsSection, BrandShowcase, Clients, Contact, Newsletter, WhatsAppChat, VentilationCalculator } from '../components/shared';
import { CatalogGallery } from '../components/product';
import { Footer } from '../components/layout';
import { BackToTop } from '../components/layout';
import { SEO } from '../components/shared';

const HomePage = () => {
  return (
    <>
      <SEO 
        title="3P S.A. DE C.V. | Equipos para la Industria Avícola y Porcícola"
        description="Más de 27 años de experiencia distribuyendo equipos de alta tecnología para la industria avícola, porcícola e invernaderos. Representantes oficiales de FANCOM, SBM, LB White, ROXELL, LUBING y más."
        keywords="equipos avícolas, ventilación granjas, comederos automáticos, bebederos, industria avícola, León Guanajuato, FANCOM, SBM, LB White, ROXELL, LUBING"
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
