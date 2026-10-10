import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  AwardIcon,
  EyeIcon,
  GemIcon,
  HeadphonesIcon,
  InstagramIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
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
  TrustSection } from
'../../../types/content';
import { QuickView } from '../QuickView';
import { EASE_OUT, useEnter, useMedia, useProducts } from './engine';

/* Layouts added by the template engine. Each one takes the same data as the classic
   section it replaces, and enters in whatever motion style the template sets. */

function Heading({
  eyebrow,
  title,
  subtitle,
  align = 'center'




}: {eyebrow?: string;title: string;subtitle?: string;align?: 'center' | 'left';}) {
  const a = useEnter();
  const b = useEnter(0.08);
  return (
    <div className={align === 'center' ? 'mx-auto max-w-[40rem] text-center' : 'max-w-[36rem]'}>
      <motion.div {...a}>
        {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
        <h2 className={`display display-2 text-ink ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      </motion.div>
      {subtitle && <motion.p {...b} className="body-base mt-4 text-ink/60">{subtitle}</motion.p>}
    </div>);

}

/** Each word rises out of its own mask — the signature move of the split hero. */
function WordReveal({ text, className, delay = 0 }: {text: string;className?: string;delay?: number;}) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) =>
      <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
          className="inline-block"
          initial={{ transform: reduce ? 'none' : 'translateY(105%)', opacity: reduce ? 0 : 1 }}
          animate={{ transform: 'translateY(0%)', opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: delay + i * 0.06 }}>

            {word}
          </motion.span>
          {' '}
        </span>
      )}
    </span>);

}

function useSlides(data: HeroSection, ms = 6500) {
  const [index, setIndex] = useState(0);
  const count = data.slides.length;
  useEffect(() => {
    if (!data.autoplay || count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ms);
    return () => window.clearInterval(timer);
  }, [data.autoplay, count, ms]);
  return { index, setIndex, active: data.slides[Math.min(index, count - 1)], count };
}

/* ================================================================ hero: split */

export function SplitHero({ data }: {data: HeroSection;}) {
  const { index, setIndex, active, count } = useSlides(data, 7000);
  if (!active) return null;
  return (
    <section id="hero" aria-label="Featured collection" className="relative w-full overflow-hidden bg-cream">
      <div className="shell grid min-h-[calc(100svh-72px)] grid-cols-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div key={active.id} className="order-2 lg:order-1">
          {active.eyebrow &&
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="eyebrow flex items-center gap-3 text-gold">

              <span className="h-px w-10 bg-gold" />
              {active.eyebrow}
            </motion.p>
          }
          <h1 className="display mt-6 text-[clamp(2.6rem,6vw,5.25rem)] leading-[1.02] text-ink">
            <WordReveal text={active.title} delay={0.1} />
          </h1>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(12px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.45 }}
            className="body-base mt-6 max-w-[30rem] text-ink/65 sm:text-base">

            {active.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-3">

            {active.primaryLabel &&
            <a href={active.primaryHref || '#featured'} className="btn btn-primary group">
                {active.primaryLabel}
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            }
            {active.secondaryLabel &&
            <a href={active.secondaryHref || '#contact'} className="btn btn-outline">
                {active.secondaryLabel}
              </a>
            }
          </motion.div>
          {count > 1 &&
          <div className="mt-14 flex items-center gap-5">
              <span className="meta tabular-nums text-ink">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex gap-2">
                {data.slides.map((slide, i) =>
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="relative h-[2px] w-12 overflow-hidden bg-ink/15">

                    {i === index &&
                <motion.span
                  key={`bar-${index}`}
                  className="absolute inset-y-0 left-0 w-full origin-left bg-gold"
                  initial={{ transform: 'scaleX(0)' }}
                  animate={{ transform: 'scaleX(1)' }}
                  transition={{ duration: data.autoplay ? 7 : 0.4, ease: 'linear' }} />

                }
                  </button>
              )}
              </div>
              <span className="meta tabular-nums text-ink/40">{String(count).padStart(2, '0')}</span>
            </div>
          }
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="tpl-media relative aspect-[4/5] w-full bg-sand sm:aspect-[5/5] lg:aspect-[4/5]">
            <AnimatePresence mode="sync">
              <motion.img
                key={active.id + active.image}
                src={active.image}
                alt={active.title}
                initial={{ opacity: 0, transform: 'scale(1.08)' }}
                animate={{ opacity: 1, transform: 'scale(1)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE_OUT }}
                className="absolute inset-0 h-full w-full object-cover" />

            </AnimatePresence>
          </div>
          <span aria-hidden className="absolute -bottom-5 -left-5 hidden h-28 w-28 border border-gold/60 lg:block" />
          <span aria-hidden className="absolute -right-4 -top-4 hidden h-20 w-20 bg-gold/15 lg:block" />
        </div>
      </div>
    </section>);

}

/* ============================================================== hero: collage */

export function CollageHero({ data }: {data: HeroSection;}) {
  const { active } = useSlides(data, 6000);
  const reduce = useReducedMotion();
  if (!active) return null;
  const images = [...new Set(data.slides.map((s) => s.image))];
  const pics = [images[0], images[1] ?? images[0], images[2] ?? images[0]];
  const tiles = [
  { src: pics[0], cls: 'left-[2%] top-[8%] w-[30%] aspect-[3/4]', tilt: '-6deg', delay: 0.1 },
  { src: pics[1], cls: 'right-[3%] top-[4%] w-[26%] aspect-[4/5]', tilt: '5deg', delay: 0.25 },
  { src: pics[2], cls: 'right-[12%] bottom-[2%] w-[20%] aspect-square', tilt: '-3deg', delay: 0.4 }];


  return (
    <section id="hero" aria-label="Featured collection" className="relative w-full overflow-hidden bg-cream">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
      <div className="shell relative min-h-[calc(100svh-72px)] py-16">
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {tiles.map((tile, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, transform: reduce ? 'none' : 'translateY(40px) scale(0.92)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: tile.delay }}
            className={`absolute ${tile.cls}`}>

              <div
              className="tpl-drift tpl-media h-full w-full shadow-2xl shadow-black/20 ring-8 ring-cream"
              style={{ '--tilt': tile.tilt, animationDelay: `${-i * 2}s` } as React.CSSProperties}>

                <img src={tile.src} alt="" className="h-full w-full object-cover" />
              </div>
            </motion.div>
          )}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px-8rem)] max-w-[38rem] flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.7, ease: EASE_OUT }}>

              {active.eyebrow && <p className="eyebrow text-gold">{active.eyebrow}</p>}
              <h1 className="display mt-5 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.04] text-ink">{active.title}</h1>
              <p className="body-base mx-auto mt-6 max-w-[28rem] text-ink/65">{active.subtitle}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                {active.primaryLabel &&
                <a href={active.primaryHref || '#featured'} className="btn btn-primary">
                    {active.primaryLabel}
                  </a>
                }
                {active.secondaryLabel &&
                <a href={active.secondaryHref || '#contact'} className="btn btn-outline">
                    {active.secondaryLabel}
                  </a>
                }
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="tpl-media mt-10 aspect-[4/3] w-full md:hidden">
            <img src={pics[0]} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>);

}

/* ======================================================== categories: circle */

export function CircleCategories({ data }: {data: CategoriesSection;}) {
  return (
    <section id="categories" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {data.items.map((item, i) =>
          <CircleItem key={item.id} item={item} index={i} />
          )}
        </div>
      </div>
    </section>);

}

function CircleItem({ item, index }: {item: CategoriesSection['items'][number];index: number;}) {
  const enter = useEnter(index * 0.1);
  return (
    <motion.a {...enter} href="#featured" className="group flex flex-col items-center text-center">
      <span className="tpl-ring tpl-zoom block aspect-square w-full max-w-[13rem] overflow-hidden rounded-full bg-sand">
        <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
      </span>
      <h3 className="display display-4 mt-6 text-ink transition-colors duration-300 group-hover:text-gold">{item.title}</h3>
      <p className="meta mt-1.5 text-ink/45">{item.caption}</p>
    </motion.a>);

}

/* ======================================================== categories: scroll */

export function ScrollCategories({ data }: {data: CategoriesSection;}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section id="categories" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} align="left" />
          <div className="flex gap-2">
            {[-1, 1].map((dir) =>
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? 'Previous' : 'Next'}
              onClick={() => scroll(dir)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-200 hover:border-gold hover:bg-gold hover:text-cream">

                {dir < 0 ? <ArrowLeftIcon className="h-4 w-4" /> : <ArrowRightIcon className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 pl-5 pr-5 [scrollbar-width:none] sm:pl-8 lg:pl-[max(2rem,calc((100vw-1240px)/2+2rem))] [&::-webkit-scrollbar]:hidden">

        {data.items.map((item, i) =>
        <ScrollCard key={item.id} item={item} index={i} />
        )}
      </div>
    </section>);

}

function ScrollCard({ item, index }: {item: CategoriesSection['items'][number];index: number;}) {
  const media = useMedia(index * 0.1);
  return (
    <motion.a
      {...media}
      href="#featured"
      className="tpl-media tpl-zoom group relative aspect-[3/4] w-[72vw] shrink-0 snap-start bg-sand sm:w-[42vw] lg:w-[24rem]">

      <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-white">
        <span>
          <span className="meta block text-white/70">{item.caption}</span>
          <span className="display mt-2 block text-[1.75rem] leading-tight">{item.title}</span>
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-[background-color,transform] duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
          <ArrowUpRightIcon className="h-4 w-4" />
        </span>
      </span>
    </motion.a>);

}

/* ========================================================== featured: minimal */

export function MinimalFeatured({ data }: {data: FeaturedSection;}) {
  const p = useProducts(data);
  return (
    <section id="featured" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} align="left" />
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((product, i) =>
          <MinimalCard key={product.id} product={product} index={i} label={data.enquiryLabel} p={p} />
          )}
        </div>
      </div>
      <QuickView product={p.quickView} trustBadges={data.trustBadges} onClose={p.close} />
    </section>);

}

/* ======================================================== featured: spotlight */

export function SpotlightFeatured({ data }: {data: FeaturedSection;}) {
  const p = useProducts(data);
  const [hero, ...rest] = data.items;
  const heroEnter = useMedia();
  const textEnter = useEnter(0.15);
  return (
    <section id="featured" className="section-y w-full bg-sand">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        {hero &&
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.article {...heroEnter} className="tpl-card group relative overflow-hidden bg-cream lg:row-span-2">
              <button type="button" onClick={() => p.open(hero)} className="tpl-zoom block aspect-[4/5] w-full overflow-hidden text-left lg:aspect-auto lg:h-full">
                <img src={hero.image} alt={hero.name} className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
              </button>
              <motion.div {...textEnter} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-24 text-white">
                {hero.badge && <p className="eyebrow text-gold">{hero.badge}</p>}
                <h3 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight">{hero.name}</h3>
                <p className="meta mt-2 text-white/70">{hero.metal}</p>
                <button type="button" onClick={() => p.enquire(hero)} className="btn btn-primary mt-6">
                  {data.enquiryLabel || 'Enquire now'}
                </button>
              </motion.div>
            </motion.article>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
              {rest.map((product, i) =>
              <SpotlightRow key={product.id} product={product} index={i} label={data.enquiryLabel} p={p} />
              )}
            </div>
          </div>
        }
      </div>
      <QuickView product={p.quickView} trustBadges={data.trustBadges} onClose={p.close} />
    </section>);

}

/* ================================================================ promo: band */

export function BandPromo({ data }: {data: PromoSection;}) {
  const text = useEnter();
  const media = useMedia(0.15);
  return (
    <section id="promo" className="w-full overflow-hidden bg-emerald">
      <div className="shell grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
        <motion.div {...text}>
          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.04] text-cream">{data.title}</h2>
          <p className="body-base mt-6 max-w-[32rem] text-cream/70">{data.body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {data.ctaLabel &&
            <a href={data.ctaHref || '#contact'} className="btn btn-light">
                {data.ctaLabel}
              </a>
            }
            {data.couponCode &&
            <span className="btn border border-dashed border-cream/50 text-cream">
                <TagIcon className="h-3.5 w-3.5 text-gold" />
                {data.couponCode}
              </span>
            }
          </div>
        </motion.div>
        <motion.div {...media} className="relative mx-auto w-full max-w-[26rem]">
          <span aria-hidden className="absolute -inset-5 rounded-full border border-gold/40" />
          <span aria-hidden className="absolute -inset-10 rounded-full border border-gold/15" />
          <div className="tpl-zoom aspect-square overflow-hidden rounded-full">
            <img src={data.image} alt={data.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </motion.div>
      </div>
    </section>);

}

/* =============================================================== trust: cards */

const ICONS: Record<IconKey, React.ComponentType<{className?: string;}>> = {
  gem: GemIcon,
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  refresh: RefreshCwIcon,
  award: AwardIcon,
  headset: HeadphonesIcon
};

export function CardsTrust({ data }: {data: TrustSection;}) {
  return (
    <section id="trust" className="section-y-sm w-full bg-cream">
      <div className="shell">
        {data.title && <Heading title={data.title} />}
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${data.title ? 'mt-12' : ''}`}>
          {data.items.map((item, i) =>
          <TrustCard key={item.id} item={item} index={i} />
          )}
        </div>
      </div>
    </section>);

}

/* ========================================================= editorial: overlap */

export function OverlapEditorial({ data }: {data: EditorialSection;}) {
  const media = useMedia();
  const card = useEnter(0.2);
  return (
    <section id="editorial" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell relative grid grid-cols-1 lg:grid-cols-12">
        <motion.div {...media} className="tpl-media tpl-zoom aspect-[4/3] bg-sand lg:col-span-8 lg:aspect-[16/11]">
          <img src={data.image} alt={data.title} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
        </motion.div>
        <motion.div
          {...card}
          className="tpl-card relative z-10 -mt-16 mx-4 bg-cream p-8 shadow-2xl shadow-black/15 sm:mx-10 sm:p-12 lg:col-span-6 lg:col-start-7 lg:mx-0 lg:-ml-0 lg:mt-0 lg:self-center">

          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          <h2 className={`display display-2 text-ink ${data.eyebrow ? 'mt-4' : ''}`}>{data.title}</h2>
          <p className="body-base mt-5 text-ink/65">{data.body}</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-ink/10 pt-6">
            {[
            [data.stat1Value, data.stat1Label],
            [data.stat2Value, data.stat2Label]].
            map(([value, label]) =>
            <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="display text-[2.25rem] leading-none text-gold">{value}</dd>
                <p className="meta mt-2 text-ink/50">{label}</p>
              </div>
            )}
          </dl>
          {data.ctaLabel &&
          <a href={data.ctaHref || '#contact'} className="link-underline group mt-8 text-ink">
              {data.ctaLabel}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          }
        </motion.div>
      </div>
    </section>);

}

/* ============================================================= gallery: strip */

export function StripGallery({ data }: {data: GallerySection;}) {
  const half = Math.ceil(data.items.length / 2);
  const rows = [data.items.slice(0, half), data.items.slice(half).length ? data.items.slice(half) : data.items.slice(0, half)];
  return (
    <section id="gallery" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} />
        {data.handle &&
        <p className="mt-4 flex justify-center">
            <a href="#gallery" className="meta inline-flex items-center gap-2 text-ink/55 transition-colors hover:text-gold">
              <InstagramIcon className="h-3.5 w-3.5" />
              {data.handle}
            </a>
          </p>
        }
      </div>
      <div className="tpl-strip-wrap mt-12 space-y-4">
        {rows.map((row, r) =>
        <div key={r} className={`tpl-strip flex w-max gap-4 ${r ? 'tpl-strip-reverse' : ''}`}>
            {[...row, ...row, ...row, ...row].map((item, i) =>
          <figure key={`${item.id}-${i}`} className="tpl-media tpl-zoom group relative h-56 w-44 shrink-0 bg-sand sm:h-72 sm:w-56">
                <img src={item.image} alt={item.caption} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
                {item.caption &&
            <figcaption className="meta absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-[10px] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.caption}
                  </figcaption>
            }
              </figure>
          )}
          </div>
        )}
      </div>
    </section>);

}

type Products = ReturnType<typeof useProducts>;

function MinimalCard({ product, index, label, p }: {product: Product;index: number;label: string;p: Products;}) {
  const enter = useEnter(index % 4 * 0.08);
  return (
    <motion.article {...enter} className="group">
      <button type="button" onClick={() => p.open(product)} className="tpl-media tpl-zoom relative block aspect-[3/4] w-full bg-sand text-left">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
        {product.badge && <span className="meta absolute left-4 top-4 bg-cream px-2.5 py-1 text-[10px] text-ink">{product.badge}</span>}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <EyeIcon className="h-4 w-4" />
        </span>
      </button>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="display display-4 text-ink">{product.name}</h3>
          <p className="meta mt-1.5 text-ink/45">{product.metal}</p>
        </div>
        <span className="mt-3 h-px w-6 bg-ink/30 transition-[width,background-color] duration-500 group-hover:w-12 group-hover:bg-gold" />
      </div>
      <button type="button" onClick={() => p.enquire(product)} className="link-underline mt-5">
        {label || 'Enquire now'}
      </button>
    </motion.article>);

}

function SpotlightRow({ product, index, label, p }: {product: Product;index: number;label: string;p: Products;}) {
  const enter = useEnter(0.1 + index * 0.1);
  return (
    <motion.article {...enter} className="tpl-card tpl-lift group flex flex-col overflow-hidden bg-cream lg:flex-row">
      <button type="button" onClick={() => p.open(product)} className="tpl-zoom block aspect-square w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-44">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
      </button>
      <div className="flex flex-1 flex-col justify-center p-5">
        {product.badge && <p className="meta text-[10px] text-gold">{product.badge}</p>}
        <h3 className="display display-4 mt-1 text-ink">{product.name}</h3>
        <p className="meta mt-1 text-ink/45">{product.metal}</p>
        <button type="button" onClick={() => p.enquire(product)} className="link-underline mt-4 self-start">
          {label || 'Enquire now'}
        </button>
      </div>
    </motion.article>);

}

function TrustCard({ item, index }: {item: TrustSection['items'][number];index: number;}) {
  const Icon = ICONS[item.icon] ?? GemIcon;
  const enter = useEnter(index * 0.08);
  return (
    <motion.div {...enter} className="tpl-card tpl-lift group bg-sand p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-gold transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="display display-4 mt-6 text-ink">{item.title}</h3>
      <p className="body-sm mt-2 text-ink/60">{item.text}</p>
    </motion.div>);

}
