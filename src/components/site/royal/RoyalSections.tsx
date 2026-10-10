import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  AwardIcon,
  EyeIcon,
  GemIcon,
  HeadphonesIcon,
  InstagramIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  StarIcon,
  TagIcon,
  TruckIcon } from
'lucide-react';
import type {
  CategoriesSection,
  EditorialSection,
  FeaturedSection,
  GallerySection,
  HeroSection,
  IconKey,
  Product,
  PromoSection,
  TestimonialsSection,
  TrustSection } from
'../../../types/content';
import { QuickView } from '../QuickView';
import { onQuickView, startEnquiry } from '../../../utils/events';
import { trackLead } from '../../../utils/leads';
import { EASE_OUT, useEnter, useHeroMedia, useMedia } from '../templates/engine';

/*
 * Royal Heritage: dark and gold, arch frames, parallax and "curtain" reveals.
 * Motion language
 *   text     fades up 24px, 900ms strong ease-out, 90ms stagger
 *   images   open like a curtain from the centre (clip-path), 1.1s ease-in-out
 *   hero     slow push-in per slide + scroll parallax
 *   hover    gold frame tightens and glows, image drifts in, buttons get a light sweep
 * Every reveal fires once; reduced motion keeps the fades and drops the movement.
 */

// Entries follow the template's motion style, so these layouts serve several templates.
const useRise = useEnter;
const useCurtain = useMedia;

/** Gold rule — line, diamond, line. */
function Ornament({ className = '' }: {className?: string;}) {
  return (
    <span aria-hidden className={`flex items-center justify-center gap-3 text-gold ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70" />
    </span>);

}

function Heading({ eyebrow, title, subtitle }: {eyebrow?: string;title: string;subtitle?: string;}) {
  const a = useRise();
  const b = useRise(0.09);
  const c = useRise(0.18);
  return (
    <div className="mx-auto max-w-[40rem] text-center">
      {eyebrow && <motion.p {...a} className="eyebrow text-gold">{eyebrow}</motion.p>}
      <motion.h2 {...b} className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] text-ink">
        {title}
      </motion.h2>
      <Ornament className="mt-6" />
      {subtitle && <motion.p {...c} className="body-base mt-5 text-ink/60">{subtitle}</motion.p>}
    </div>);

}

/* ---------------------------------------------------------------- hero */

export function RoyalHero({ data }: {data: HeroSection;}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-30%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const slides = data.slides;
  const active = slides[Math.min(index, slides.length - 1)];
  // Close-ups of the jewellery fill the frame — the campaign text rides on top of them.
  const { products } = useHeroMedia(data);
  const piece = products[index % products.length];

  useEffect(() => {
    if (!data.autoplay || slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [data.autoplay, slides.length]);

  if (!active) return null;

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-cream">
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={active.id + piece}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-hidden">

            <img src={piece} alt="" className="royal-kenburns h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(0_0_0/0.55))]" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="shell relative flex h-full flex-col items-center justify-center text-center">
        <motion.div
          key={active.id}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="flex max-w-[48rem] flex-col items-center">

          {[
          active.eyebrow &&
          <p key="e" className="eyebrow royal-shimmer-text">
                {active.eyebrow}
              </p>,
          <Ornament key="o" className="mt-6" />,
          <h1 key="t" className="display mt-6 text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.02] text-white">
              {active.title}
            </h1>,
          <p key="s" className="body-base mt-6 max-w-[34rem] text-white/75 sm:text-base">
              {active.subtitle}
            </p>,
          <div key="b" className="mt-10 flex flex-wrap justify-center gap-4">
              {active.primaryLabel &&
            <a href={active.primaryHref || '#featured'} className="royal-btn royal-btn-gold">
                  {active.primaryLabel}
                </a>
            }
              {active.secondaryLabel &&
            <a href={active.secondaryHref || '#contact'} className="royal-btn royal-btn-line">
                  {active.secondaryLabel}
                </a>
            }
            </div>].
          filter(Boolean).map((child, i) =>
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, transform: reduce ? 'none' : 'translateY(28px)' },
              show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 1, ease: EASE_OUT } }
            }}>

              {child}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {slides.length > 1 &&
      <div className="absolute inset-x-0 bottom-10 flex justify-center gap-4">
          {slides.map((slide, i) =>
        <button
          key={slide.id}
          type="button"
          aria-label={`Show slide ${i + 1}`}
          aria-current={i === index}
          onClick={() => setIndex(i)}
          className={`h-2.5 w-2.5 rotate-45 border border-gold transition-[background-color,transform] duration-300 ${
          i === index ? 'scale-125 bg-gold' : 'bg-transparent hover:bg-gold/50'}`
          } />

        )}
        </div>
      }
    </section>);

}

/* ---------------------------------------------------------- categories */

export function RoyalCategories({ data }: {data: CategoriesSection;}) {
  return (
    <section id="categories" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {data.items.map((item, i) =>
          <CategoryArch key={item.id} item={item} index={i} />
          )}
        </div>
      </div>
    </section>);

}

function CategoryArch({ item, index }: {item: CategoriesSection['items'][number];index: number;}) {
  const curtain = useCurtain(index * 0.12);
  const rise = useRise(0.3 + index * 0.12);
  return (
    <a href="#featured" className="group block text-center">
      <motion.div {...curtain} className="royal-arch royal-zoom royal-frame relative aspect-[3/4] overflow-hidden bg-sand">
        <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
      <motion.div {...rise}>
        <h3 className="display mt-6 text-2xl text-ink transition-colors duration-300 group-hover:text-gold">{item.title}</h3>
        <p className="meta mt-2 text-ink/45">{item.caption}</p>
      </motion.div>
    </a>);

}

/* ------------------------------------------------------------ featured */

export function RoyalFeatured({ data }: {data: FeaturedSection;}) {
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(
    () =>
    onQuickView((productId) => {
      const match = data.items.find((item) => item.id === productId);
      if (match) setQuickView(match);
    }),
    [data.items]
  );

  return (
    <section id="featured" className="section-y w-full bg-sand">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        {data.items.length === 0 ?
        <p className="body-base mt-12 text-center text-ink/50">No products yet — add them from the admin panel.</p> :

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((product, i) =>
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            enquiryLabel={data.enquiryLabel}
            onQuickView={() => {
              setQuickView(product);
              trackLead('quick-view', product.name, { interest: product.name });
            }} />

          )}
          </div>
        }
      </div>
      <QuickView product={quickView} trustBadges={data.trustBadges} onClose={() => setQuickView(null)} />
    </section>);

}

function ProductCard({
  product,
  index,
  enquiryLabel,
  onQuickView




}: {product: Product;index: number;enquiryLabel: string;onQuickView: () => void;}) {
  const rise = useRise(index % 4 * 0.1);
  return (
    <motion.article {...rise} className="royal-frame group flex flex-col bg-cream">
      <div className="royal-zoom relative aspect-[4/5] overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {product.badge &&
        <span className="meta absolute left-1/2 top-5 -translate-x-1/2 border border-gold/60 bg-black/50 px-3 py-1.5 text-[10px] text-gold backdrop-blur">
            {product.badge}
          </span>
        }
        <button
          type="button"
          onClick={onQuickView}
          className="meta absolute inset-x-6 bottom-6 flex translate-y-3 items-center justify-center gap-2 border border-white/40 bg-black/45 py-3 text-[10px] text-white opacity-0 backdrop-blur transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100">

          <EyeIcon className="h-3.5 w-3.5" />
          Quick view
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center px-5 pb-7 pt-6 text-center">
        <h3 className="display text-[1.4rem] leading-snug text-ink">{product.name}</h3>
        <span className="mt-3 h-px w-8 bg-gold/60 transition-[width] duration-500 group-hover:w-16" />
        <p className="meta mt-3 text-gold/90">{product.metal}</p>
        <div className="mt-auto w-full pt-6">
          <button
            type="button"
            onClick={() => {
              trackLead('enquiry', product.name, { interest: product.name });
              startEnquiry(product.name);
            }}
            className="royal-btn royal-btn-line w-full py-3 text-[10px]">

            {enquiryLabel || 'Enquire now'}
          </button>
        </div>
      </div>
    </motion.article>);

}

/* --------------------------------------------------------------- promo */

export function RoyalPromo({ data }: {data: PromoSection;}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%']);
  const rise = useRise();

  return (
    <section ref={ref} id="promo" className="relative w-full overflow-hidden">
      <motion.img style={{ y }} src={data.image} alt="" aria-hidden className="absolute inset-0 h-[124%] w-full -translate-y-[12%] object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="shell relative flex min-h-[520px] items-center justify-center py-24">
        <motion.div {...rise} className="relative max-w-[40rem] border border-gold/50 px-8 py-14 text-center backdrop-blur-[2px] sm:px-14">
          <span aria-hidden className="pointer-events-none absolute inset-2 border border-gold/25" />
          {data.eyebrow && <p className="eyebrow royal-shimmer-text">{data.eyebrow}</p>}
          <h2 className="display mt-5 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.06] text-white">{data.title}</h2>
          <Ornament className="mt-6" />
          <p className="body-base mt-6 text-white/75">{data.body}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {data.ctaLabel &&
            <a href={data.ctaHref || '#contact'} className="royal-btn royal-btn-gold">
                {data.ctaLabel}
              </a>
            }
            {data.couponCode &&
            <span className="royal-btn border border-dashed border-gold/60 text-gold">
                <TagIcon className="h-3.5 w-3.5" />
                Code {data.couponCode}
              </span>
            }
          </div>
        </motion.div>
      </div>
    </section>);

}

/* --------------------------------------------------------------- trust */

const ICONS: Record<IconKey, React.ComponentType<{className?: string;}>> = {
  gem: GemIcon,
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  refresh: RefreshCwIcon,
  award: AwardIcon,
  headset: HeadphonesIcon
};

export function RoyalTrust({ data }: {data: TrustSection;}) {
  return (
    <section id="trust" className="section-y-sm w-full border-y border-gold/20 bg-cream">
      <div className="shell">
        {data.title && <Heading title={data.title} />}
        <div className={`grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 ${data.title ? 'mt-14' : ''}`}>
          {data.items.map((item, i) =>
          <TrustItem key={item.id} item={item} index={i} />
          )}
        </div>
      </div>
    </section>);

}

function TrustItem({ item, index }: {item: TrustSection['items'][number];index: number;}) {
  const Icon = ICONS[item.icon] ?? GemIcon;
  const rise = useRise(index * 0.1);
  return (
    <motion.div {...rise} className="group flex flex-col items-center text-center">
      <span className="flex h-16 w-16 rotate-45 items-center justify-center border border-gold/50 transition-[background-color,transform] duration-500 [transition-timing-function:var(--ease-out)] group-hover:rotate-[135deg] group-hover:bg-gold/10">
        <Icon className="h-6 w-6 -rotate-45 text-gold transition-transform duration-500 group-hover:-rotate-[135deg]" />
      </span>
      <h3 className="meta mt-7 text-ink">{item.title}</h3>
      <p className="body-sm mt-2.5 max-w-[16rem] text-ink/55">{item.text}</p>
    </motion.div>);

}

/* -------------------------------------------------------- testimonials */

export function RoyalTestimonials({ data }: {data: TestimonialsSection;}) {
  const [index, setIndex] = useState(0);
  const items = data.items;
  const active = items[Math.min(index, items.length - 1)];

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 6500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <section id="testimonials" className="section-y w-full bg-sand">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} />
        {active &&
        <div className="relative mx-auto mt-14 max-w-[46rem] text-center">
            <span aria-hidden className="display pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 text-[10rem] leading-none text-gold/15">
              “
            </span>
            <AnimatePresence mode="wait">
              <motion.figure
              key={active.id}
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="relative">

                <div className="flex justify-center gap-1.5" aria-label={`${active.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) =>
                <StarIcon key={s} className={`h-4 w-4 ${s < active.rating ? 'fill-gold text-gold' : 'text-ink/20'}`} />
                )}
                </div>
                <blockquote className="display mt-8 text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.45] text-ink/90">
                  {active.quote}
                </blockquote>
                <figcaption className="mt-8">
                  <p className="meta text-gold">{active.name}</p>
                  <p className="mt-2 text-xs text-ink/50">{active.location}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            {items.length > 1 &&
          <div className="mt-10 flex justify-center gap-4">
                {items.map((item, i) =>
            <button
              key={item.id}
              type="button"
              aria-label={`Show review ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rotate-45 border border-gold transition-[background-color,transform] duration-300 ${
              i === index ? 'scale-125 bg-gold' : 'hover:bg-gold/50'}`
              } />

            )}
              </div>
          }
          </div>
        }
      </div>
    </section>);

}

/* ----------------------------------------------------------- editorial */

export function RoyalEditorial({ data }: {data: EditorialSection;}) {
  const curtain = useCurtain();
  const a = useRise(0.1);
  const b = useRise(0.2);
  return (
    <section id="editorial" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto w-full max-w-[30rem]">
          <span aria-hidden className="royal-arch absolute -inset-4 border border-gold/30" />
          <motion.div {...curtain} className="royal-arch royal-zoom relative aspect-[4/5] overflow-hidden bg-sand">
            <img src={data.image} alt={data.title} loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
        </div>

        <div className="max-w-[34rem]">
          <motion.div {...a}>
            {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] text-ink">{data.title}</h2>
            <Ornament className="mt-6 justify-start" />
            <p className="body-base mt-6 text-ink/65">{data.body}</p>
          </motion.div>
          <motion.dl {...b} className="mt-10 grid grid-cols-2 gap-6 border-y border-gold/25 py-8">
            {[
            [data.stat1Value, data.stat1Label],
            [data.stat2Value, data.stat2Label]].
            map(([value, label]) =>
            <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="display royal-shimmer-text text-[3rem] leading-none">{value}</dd>
                <p className="meta mt-3 text-ink/50">{label}</p>
              </div>
            )}
          </motion.dl>
          {data.ctaLabel &&
          <a href={data.ctaHref || '#journal'} className="royal-btn royal-btn-line mt-10">
              {data.ctaLabel}
            </a>
          }
        </div>
      </div>
    </section>);

}

/* ------------------------------------------------------------- gallery */

export function RoyalGallery({ data }: {data: GallerySection;}) {
  return (
    <section id="gallery" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} />
        {data.handle &&
        <p className="mt-5 flex justify-center">
            <a href="#gallery" className="meta inline-flex items-center gap-2 text-ink/55 transition-colors hover:text-gold">
              <InstagramIcon className="h-3.5 w-3.5" />
              {data.handle}
            </a>
          </p>
        }
        <div className="mt-14 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:grid-cols-4">
          {data.items.map((item, i) =>
          <GalleryTile key={item.id} item={item} index={i} />
          )}
        </div>
      </div>
    </section>);

}

function GalleryTile({ item, index }: {item: GallerySection['items'][number];index: number;}) {
  const curtain = useCurtain(index % 4 * 0.1);
  // First tile spans a 2x2 block, so the grid reads as a composed spread, not a contact sheet.
  const span = index === 0 ? 'col-span-2 row-span-2' : index === 3 ? 'row-span-2' : '';
  return (
    <motion.figure {...curtain} className={`royal-zoom group relative overflow-hidden bg-sand ${span}`}>
      <img src={item.image} alt={item.caption} loading="lazy" className="h-full w-full object-cover" />
      <span aria-hidden className="pointer-events-none absolute inset-3 border border-gold/0 transition-colors duration-500 group-hover:border-gold/70" />
      {item.caption &&
      <figcaption className="meta absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-white opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {item.caption}
        </figcaption>
      }
    </motion.figure>);

}
