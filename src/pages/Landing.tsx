import React, { Suspense, lazy, useEffect } from 'react';
import { useContent } from '../hooks/useContent';
import { trackLead } from '../utils/leads';
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
import { Contact } from '../components/site/Contact';
import { Newsletter } from '../components/site/Newsletter';
import { CustomBlock } from '../components/site/CustomBlock';
import { ErrorBoundary } from '../components/site/ErrorBoundary';
import { isCustomSection, sectionLabel } from '../data/sections';
import { CartDrawer } from '../components/site/CartDrawer';
import { FloatingContact } from '../components/site/FloatingContact';
import { SeoHead } from '../components/site/SeoHead';
import {
  RoyalCategories,
  RoyalEditorial,
  RoyalFeatured,
  RoyalGallery,
  RoyalHero,
  RoyalPromo,
  RoyalTestimonials,
  RoyalTrust } from
'../components/site/royal/RoyalSections';
import {
  BandPromo,
  CardsTrust,
  CircleCategories,
  CollageHero,
  MinimalFeatured,
  OverlapEditorial,
  ScrollCategories,
  SplitHero,
  SpotlightFeatured,
  StripGallery } from
'../components/site/templates/Variants';
import { TemplateContext } from '../components/site/templates/engine';
import { StoryFan, StoryOrbit, StoryRail } from '../components/site/templates/StoryHero';
import {
  BentoHero,
  ColumnsHero,
  CoverflowHero,
  MarqueeHero,
  SpotlightHero,
  ZoomHero } from
'../components/site/templates/Heroes';
import { GlassHeader } from '../components/site/GlassHeader';
import { CurtainHero, HorizontalHero, StackHero, TextMaskHero } from '../components/site/templates/Heroes2';
import { VitrineHero } from '../components/site/templates/VitrineHero';
import {
  AccordionCategories,
  BannerNewsletter,
  CardsFaq,
  CarouselFeatured,
  FeatureJournal,
  GlassNewsletter,
  ListCategories,
  ListJournal,
  MarqueeTestimonials,
  MarqueeTrust,
  MasonryGallery,
  StackTestimonials,
  StickyEditorial,
  StickyFaq,
  TextMaskPromo } from
'../components/site/templates/Sections2';
import { templateById, type TemplateDef } from '../data/templates';
import { hexToRgbTriple, mixHex } from '../utils/color';
import { motion, useScroll, useSpring } from 'framer-motion';
import type { Sections, SectionId, ThemeColors } from '../types/content';

type Vars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * A dark template is the light theme turned inside out: page background takes the ink
 * colour and text takes the cream, so every shared section turns dark without being
 * rewritten. The footer flips back so it stays a dark band at the bottom.
 */
function darkVars(c: ThemeColors): Vars {
  return {
    '--c-cream': hexToRgbTriple(c.ink),
    '--c-ink': hexToRgbTriple(c.cream),
    '--c-sand': hexToRgbTriple(mixHex(c.ink, c.gold, 0.08))
  };
}
function lightVars(c: ThemeColors): Vars {
  return {
    '--c-cream': hexToRgbTriple(c.cream),
    '--c-ink': hexToRgbTriple(c.ink),
    '--c-sand': hexToRgbTriple(c.sand)
  };
}

/* Which component draws each section in each layout the templates can ask for. */
type Layouts = TemplateDef['layout'];
type LayoutSection = keyof Layouts & keyof Sections;
const LAYOUTS: {[K in LayoutSection]: Record<Layouts[K], React.ComponentType<{data: Sections[K];}>>} = {
  hero: {
    card: Hero,
    center: RoyalHero,
    split: SplitHero,
    collage: CollageHero,
    'story-orbit': StoryOrbit,
    'story-fan': StoryFan,
    'story-rail': StoryRail,
    marquee: MarqueeHero,
    spotlight: SpotlightHero,
    bento: BentoHero,
    zoom: ZoomHero,
    columns: ColumnsHero,
    coverflow: CoverflowHero,
    textmask: TextMaskHero,
    horizontal: HorizontalHero,
    curtain: CurtainHero,
    stack: StackHero,
    vitrine: VitrineHero
  },
  categories: {
    grid: Categories,
    arch: RoyalCategories,
    circle: CircleCategories,
    scroll: ScrollCategories,
    accordion: AccordionCategories,
    list: ListCategories
  },
  featured: { cards: Featured, framed: RoyalFeatured, minimal: MinimalFeatured, spotlight: SpotlightFeatured, carousel: CarouselFeatured },
  promo: { split: Promo, parallax: RoyalPromo, band: BandPromo, textmask: TextMaskPromo },
  trust: { row: Trust, diamond: RoyalTrust, cards: CardsTrust, marquee: MarqueeTrust },
  testimonials: { grid: Testimonials, carousel: RoyalTestimonials, marquee: MarqueeTestimonials, stack: StackTestimonials },
  editorial: { side: Editorial, arch: RoyalEditorial, overlap: OverlapEditorial, sticky: StickyEditorial },
  gallery: { grid: Gallery, mosaic: RoyalGallery, strip: StripGallery, masonry: MasonryGallery },
  journal: { grid: Journal, list: ListJournal, feature: FeatureJournal },
  faq: { accordion: Faq, cards: CardsFaq, sticky: StickyFaq },
  newsletter: { centered: Newsletter, banner: BannerNewsletter, glass: GlassNewsletter }
};

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gold" />;
}

/** Soft light under the pointer. The position is written straight onto the overlay element. */
function CursorGlow() {
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      ref.current?.style.setProperty('--mx', `${e.clientX}px`);
      ref.current?.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div ref={ref} aria-hidden className="tpl-cursor-glow" />;
}

const PlatformHome = lazy(() => import('./PlatformHome').then((m) => ({ default: m.PlatformHome })));

export function Landing() {
  const { content, loaded, suspended, noSite } = useContent();
  const { sections, order } = content;
  const tpl = templateById(content.theme.templateId);
  const dark = tpl.mode === 'dark';
  // The original design renders exactly as it was built: no engine attributes, no extras.
  const premium = tpl.id !== 'original';

  // Everyone who reaches the site becomes a lead the moment they land, so the
  // leads desk sees them even if they never fill anything in.
  useEffect(() => {
    trackLead('arrived');
  }, []);

  if (noSite) {
    return (
      <Suspense fallback={<div className="min-h-screen w-full bg-[#16120e]" />}>
        <PlatformHome />
      </Suspense>);

  }
  if (suspended) return <SiteUnavailable />;
  // Blank page until the site content arrives — never the template under a client domain.
  if (!loaded) return <div className="min-h-screen w-full bg-white" />;

  /** Each section is isolated, so one malformed field cannot blank the page. */
  function renderSection(id: SectionId) {
    const element = renderSectionBody(id);
    if (!element) return null;
    return (
      <ErrorBoundary key={id} label={sectionLabel(id, sections[id])}>
        {element}
      </ErrorBoundary>);

  }

  function layout<K extends LayoutSection>(id: K) {
    const variants = LAYOUTS[id] as Record<string, React.ComponentType<{data: Sections[K];}>>;
    const Component = variants[tpl.layout[id]];
    return <Component key={id} data={sections[id]} />;
  }

  function renderSectionBody(id: SectionId) {
    if (!sections[id]?.visible) return null;
    if (id in LAYOUTS) return layout(id as LayoutSection);
    switch (id) {
      case 'contact':
        return <Contact key={id} data={sections.contact} />;
      default: {
        // Sections added from the admin panel render through the generic block.
        const section = sections[id];
        return isCustomSection(section) ? <CustomBlock key={id} data={section} /> : null;
      }
    }
  }

  const visibleCount = order.filter((id) => sections[id]?.visible).length;

  return (
    <TemplateContext.Provider value={{ motion: tpl.motion, shape: tpl.shape, premium }}>
      <div
        id="top"
        {...premium ?
        {
          'data-template': tpl.id,
          'data-premium': '',
          'data-mode': tpl.mode,
          'data-shape': tpl.shape,
          'data-hover': tpl.hover,
          'data-scroll': tpl.scroll
        } :
        {}}
        style={dark ? darkVars(content.theme.colors) : undefined}
        className={premium ? 'min-h-screen w-full bg-cream text-ink' : 'min-h-screen w-full bg-cream'}>

        {premium && tpl.scroll === 'progress' && <ScrollProgress />}
        {premium && tpl.cursorGlow && <CursorGlow />}
        {premium && <div aria-hidden className="tpl-grain" />}
        <SeoHead seo={content.seo} siteName={content.brand.name} />
        <ErrorBoundary label="Header" fallback={null}>
          {tpl.header === 'original' ? <Header /> : <GlassHeader variant={tpl.header} />}
        </ErrorBoundary>
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
        <ErrorBoundary label="Footer" fallback={null}>
          {dark ?
          <div style={lightVars(content.theme.colors)}>
              <Footer wordmark />
            </div> :

          <Footer wordmark={premium} />
          }
        </ErrorBoundary>
        {/* Overlays are non-essential chrome — if they break, the page still reads. */}
        <ErrorBoundary label="Cart drawer" fallback={null}>
          <CartDrawer />
        </ErrorBoundary>
        <ErrorBoundary label="Floating contact" fallback={null}>
          <FloatingContact />
        </ErrorBoundary>
      </div>
    </TemplateContext.Provider>);

}
/** Shown when the site's plan has expired or the platform has switched it off. */
function SiteUnavailable() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#16120e] px-6 font-['Inter',system-ui,sans-serif]">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#c9a45c]/15 blur-3xl" />
      <div className="relative max-w-md text-center">
        <span className="mx-auto block h-px w-16 bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent" />
        <h1 className="mt-8 font-['Cormorant_Garamond',Georgia,serif] text-4xl font-medium text-[#f3e6c8] sm:text-5xl">
          We’ll be back soon
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#f3e6c8]/60">
          This website is temporarily offline. If you own this business, please contact support to renew your plan —
          everything will be restored exactly as it was.
        </p>
        <span className="mx-auto mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent" />
      </div>
    </div>);

}
