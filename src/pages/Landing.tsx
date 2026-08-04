import { useContent } from '../contexts/ContentContext';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';
import { Hero } from '../components/site/Hero';
import { Categories } from '../components/site/Categories';
import { Featured } from '../components/site/Featured';
import { Promo } from '../components/site/Promo';
import { Trust } from '../components/site/Trust';
import { Testimonials } from '../components/site/Testimonials';
import { Editorial } from '../components/site/Editorial';
import { Gallery } from '../components/site/Gallery';
import { Journal } from '../components/site/Journal';
import { Faq } from '../components/site/Faq';
import { Newsletter } from '../components/site/Newsletter';
import { CartDrawer } from '../components/site/CartDrawer';
import { FloatingContact } from '../components/site/FloatingContact';
import { SeoHead } from '../components/site/SeoHead';
import type { SectionId } from '../types/content';

export function Landing() {
  const { content } = useContent();
  const { sections, order } = content;

  function renderSection(id: SectionId) {
    if (!sections[id]?.visible) return null;
    switch (id) {
      case 'hero':
        return <Hero key={id} data={sections.hero} />;
      case 'categories':
        return <Categories key={id} data={sections.categories} />;
      case 'featured':
        return <Featured key={id} data={sections.featured} />;
      case 'promo':
        return <Promo key={id} data={sections.promo} />;
      case 'trust':
        return <Trust key={id} data={sections.trust} />;
      case 'testimonials':
        return <Testimonials key={id} data={sections.testimonials} />;
      case 'editorial':
        return <Editorial key={id} data={sections.editorial} />;
      case 'gallery':
        return <Gallery key={id} data={sections.gallery} />;
      case 'journal':
        return <Journal key={id} data={sections.journal} />;
      case 'faq':
        return <Faq key={id} data={sections.faq} />;
      case 'newsletter':
        return <Newsletter key={id} data={sections.newsletter} />;
      default:
        return null;
    }
  }

  const visibleCount = order.filter((id) => sections[id]?.visible).length;

  return (
    <div id="top" className="min-h-screen w-full bg-cream">
      <SeoHead seo={content.seo} />
      <Header />
      <main>
        {visibleCount === 0 ?
        <div className="shell max-w-xl py-32 text-center">
            <h1 className="display display-2 text-ink">Every section is hidden</h1>
            <p className="body-sm mt-4 text-ink/55">
              Turn sections back on from the admin panel to bring the page to life.
            </p>
          </div> :

        order.map(renderSection)
        }
      </main>
      <Footer />
      <CartDrawer />
      <FloatingContact />
    </div>);

}