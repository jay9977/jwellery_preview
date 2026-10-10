import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform } from
'framer-motion';
import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react';
import type { HeroSection, HeroSlide } from '../../../types/content';
import { EASE_OUT, useHeroMedia } from './engine';
import { Magnetic } from './Magnetic';

/*
 * Product-first heroes — each template opens on the jewellery in its own way.
 * Every one shows the pieces before (or instead of) anyone wearing them.
 */

function Buttons({ slide, light = false }: {slide: HeroSlide;light?: boolean;}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {slide.primaryLabel &&
      <Magnetic>
          <a href={slide.primaryHref || '#featured'} className="btn btn-primary group">
            {slide.primaryLabel}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Magnetic>
      }
      {slide.secondaryLabel &&
      <Magnetic>
          <a
          href={slide.secondaryHref || '#contact'}
          className={light ? 'btn tpl-glass-panel text-white' : 'btn btn-outline'}>

            {slide.secondaryLabel}
          </a>
        </Magnetic>
      }
    </div>);

}

const rise = (delay: number) => ({
  initial: { opacity: 0, transform: 'translateY(26px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 1, ease: EASE_OUT, delay }
});

/* ======================================================= marquee (Classic) */

export function MarqueeHero({ data }: {data: HeroSection;}) {
  const { slide, products } = useHeroMedia(data);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rowA = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const rowB = useTransform(scrollYProgress, [0, 1], ['-12%', '0%']);
  if (!slide) return null;
  const strip = [...products, ...products, ...products];

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative w-full overflow-hidden bg-cream pb-20 pt-16 sm:pt-24">
      <div className="shell text-center">
        {slide.eyebrow && <motion.p {...rise(0)} className="eyebrow text-gold">{slide.eyebrow}</motion.p>}
        <motion.h1 {...rise(0.1)} className="display mx-auto mt-6 max-w-[60rem] text-[clamp(2.8rem,8vw,7rem)] leading-[0.98] tracking-[-0.02em] text-ink">
          {slide.title}
        </motion.h1>
        <motion.p {...rise(0.2)} className="body-base mx-auto mt-6 max-w-[34rem] text-ink/60 sm:text-base">
          {slide.subtitle}
        </motion.p>
        <motion.div {...rise(0.3)} className="mt-9 flex justify-center">
          <Buttons slide={slide} />
        </motion.div>
      </div>

      <div className="mt-16 -rotate-[4deg] space-y-4 sm:mt-20" aria-hidden>
        {[rowA, rowB].map((x, r) =>
        <motion.div key={r} style={{ x }}>
            <div className={`tpl-strip flex w-max gap-4 ${r ? 'tpl-strip-reverse' : ''}`} style={{ animationDuration: '70s' }}>
              {strip.map((src, i) =>
            <div key={`${r}-${i}`} className="tpl-media tpl-zoom h-40 w-60 shrink-0 bg-sand sm:h-56 sm:w-80">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
            )}
            </div>
          </motion.div>
        )}
      </div>
    </section>);

}

/* ====================================================== spotlight (Midnight) */

export function SpotlightHero({ data }: {data: HeroSection;}) {
  const { slide, products, brand } = useHeroMedia(data);
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [14, -14]), { stiffness: 80, damping: 16 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 80, damping: 16 });
  const pieces = products.slice(0, 5);

  useEffect(() => {
    if (pieces.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % pieces.length), 5000);
    return () => window.clearInterval(timer);
  }, [pieces.length]);

  if (!slide) return null;

  return (
    <section
      id="hero"
      aria-label="Featured collection"
      className="relative min-h-[calc(100svh-64px)] w-full overflow-hidden bg-cream"
      onPointerMove={(e) => {
        if (reduce) return;
        const box = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width;
        const y = (e.clientY - box.top) / box.height;
        mx.set(x - 0.5);
        my.set(y - 0.5);
        stage.current?.style.setProperty('--sx', `${x * 100}%`);
        stage.current?.style.setProperty('--sy', `${y * 100}%`);
      }}>

      {/* the light: a soft cone that follows the pointer */}
      <div
        ref={stage}
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(520px circle at var(--sx, 60%) var(--sy, 40%), rgb(var(--c-gold) / 0.22), transparent 65%)' }} />

      <div className="shell relative grid min-h-[calc(100svh-64px)] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-2 lg:order-1">
          <motion.p {...rise(0)} className="eyebrow text-gold">{slide.eyebrow || brand.name}</motion.p>
          <motion.h1 {...rise(0.1)} className="display mt-6 text-[clamp(2.6rem,5.6vw,5rem)] leading-[1.02] text-ink">
            {slide.title}
          </motion.h1>
          <motion.p {...rise(0.2)} className="body-base mt-6 max-w-[28rem] text-ink/60">{slide.subtitle}</motion.p>
          <motion.div {...rise(0.3)} className="mt-10">
            <Buttons slide={slide} />
          </motion.div>
          <div className="mt-12 flex gap-3">
            {pieces.map((src, i) =>
            <button
              key={src}
              type="button"
              aria-label={`Show piece ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-14 w-14 overflow-hidden rounded-full ring-1 transition-[transform,box-shadow] duration-300 ${
              i === index ? 'scale-110 ring-2 ring-gold' : 'opacity-60 ring-ink/20 hover:opacity-100'}`
              }>

                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            )}
          </div>
        </div>

        <div className="relative order-1 flex justify-center [perspective:1200px] lg:order-2">
          <motion.div style={{ rotateX, rotateY }} className="relative aspect-square w-[78vw] max-w-[34rem] [transform-style:preserve-3d]">
            <span aria-hidden className="absolute inset-[-8%] rounded-full border border-gold/25" />
            <span aria-hidden className="absolute inset-[-16%] rounded-full border border-gold/10" />
            <AnimatePresence mode="sync">
              <motion.div
                key={pieces[index]}
                initial={{ opacity: 0, transform: 'scale(0.9)' }}
                animate={{ opacity: 1, transform: 'scale(1)' }}
                exit={{ opacity: 0, transform: 'scale(1.06)' }}
                transition={{ duration: 1, ease: EASE_OUT }}
                className="absolute inset-0 overflow-hidden rounded-full shadow-[0_40px_120px_-30px_rgb(var(--c-gold)/0.55)]">

                <img src={pieces[index]} alt="" className="h-full w-full object-cover" />
                <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.25),transparent_45%)]" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>);

}

/* ========================================================= bento (Emerald) */

export function BentoHero({ data }: {data: HeroSection;}) {
  const { slide, products, model } = useHeroMedia(data);
  if (!slide) return null;
  const p = (i: number) => products[i % products.length];
  const tile = (i: number) => ({
    initial: { opacity: 0, transform: 'translateY(30px) scale(0.96)' },
    animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.15 + i * 0.09 }
  });

  return (
    <section id="hero" aria-label="Featured collection" className="w-full bg-cream py-8 sm:py-10">
      <div className="shell grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] lg:grid-cols-4 lg:gap-4">
        <motion.div {...tile(0)} className="tpl-card col-span-2 row-span-2 flex flex-col justify-between bg-sand p-7 sm:p-10">
          {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
          <div>
            <h1 className="display text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.02] text-ink">{slide.title}</h1>
            <p className="body-sm mt-4 max-w-[26rem] text-ink/60">{slide.subtitle}</p>
            <div className="mt-7">
              <Buttons slide={slide} />
            </div>
          </div>
        </motion.div>
        <motion.a {...tile(1)} href="#featured" className="tpl-card tpl-zoom group relative row-span-2 overflow-hidden bg-sand">
          <img src={p(0)} alt="" className="h-full w-full object-cover" />
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 text-ink backdrop-blur transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        </motion.a>
        <motion.a {...tile(2)} href="#featured" className="tpl-card tpl-zoom overflow-hidden bg-sand">
          <img src={p(1)} alt="" className="h-full w-full object-cover" />
        </motion.a>
        <motion.a {...tile(3)} href="#featured" className="tpl-card tpl-zoom overflow-hidden bg-sand">
          <img src={p(2)} alt="" className="h-full w-full object-cover" />
        </motion.a>
        <motion.a {...tile(4)} href="#categories" className="tpl-card tpl-zoom overflow-hidden bg-sand">
          <img src={p(3)} alt="" className="h-full w-full object-cover" />
        </motion.a>
        <motion.div {...tile(5)} className="tpl-card tpl-zoom relative col-span-2 overflow-hidden bg-sand lg:col-span-2">
          <img src={model} alt={slide.title} className="h-full w-full object-cover object-top" />
          <span className="meta absolute bottom-4 left-4 bg-cream/85 px-3 py-1.5 text-[10px] text-ink backdrop-blur">As worn</span>
        </motion.div>
        <motion.a {...tile(6)} href="#categories" className="tpl-card tpl-zoom overflow-hidden bg-sand">
          <img src={p(4)} alt="" className="h-full w-full object-cover" />
        </motion.a>
      </div>
    </section>);

}

/* ========================================================== zoom (Velvet) */

export function ZoomHero({ data }: {data: HeroSection;}) {
  const { slide, products, brand } = useHeroMedia(data);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const clip = useTransform(p, [0, 0.6], ['inset(28% 36% 28% 36%)', 'inset(0% 0% 0% 0%)']);
  const imgScale = useTransform(p, [0, 0.6], [1.35, 1]);
  const leftX = useTransform(p, [0, 0.45], ['0vw', '-30vw']);
  const rightX = useTransform(p, [0, 0.45], ['0vw', '30vw']);
  const wordsOpacity = useTransform(p, [0.25, 0.45], [1, 0]);
  const panelOpacity = useTransform(p, [0.6, 0.8], [0, 1]);
  const panelY = useTransform(p, [0.6, 0.8], ['30px', '0px']);
  if (!slide) return null;
  const words = (slide.title || brand.name).split(' ');
  const half = Math.ceil(words.length / 2);

  if (reduce) {
    return (
      <section id="hero" aria-label="Featured collection" className="relative flex min-h-[90svh] items-center justify-center overflow-hidden">
        <img src={products[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="tpl-glass-panel relative mx-4 max-w-[40rem] px-8 py-12 text-center">
          <h1 className="display text-[clamp(2.2rem,5vw,4rem)] leading-tight text-white">{slide.title}</h1>
          <p className="body-base mt-4 text-white/80">{slide.subtitle}</p>
          <div className="mt-8 flex justify-center"><Buttons slide={slide} light /></div>
        </div>
      </section>);

  }

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative h-[220svh] w-full bg-cream">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <motion.img style={{ scale: imgScale }} src={products[0]} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </motion.div>

        <motion.div style={{ opacity: wordsOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-between px-[4vw]">
          <motion.span style={{ x: leftX }} className="display max-w-[30vw] text-[clamp(2rem,5vw,4.5rem)] leading-none text-ink">
            {words.slice(0, half).join(' ')}
          </motion.span>
          <motion.span style={{ x: rightX }} className="display max-w-[30vw] text-right text-[clamp(2rem,5vw,4.5rem)] leading-none text-ink">
            {words.slice(half).join(' ')}
          </motion.span>
        </motion.div>

        <motion.div style={{ opacity: panelOpacity, y: panelY }} className="absolute inset-0 flex items-center justify-center px-4">
          <div className="tpl-glass-panel max-w-[42rem] px-8 py-12 text-center sm:px-14">
            {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
            <h1 className="display mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-tight text-white">{slide.title}</h1>
            <p className="body-base mx-auto mt-4 max-w-[30rem] text-white/80">{slide.subtitle}</p>
            <div className="mt-8 flex justify-center">
              <Buttons slide={slide} light />
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}

/* ======================================================== columns (Pearl) */

export function ColumnsHero({ data }: {data: HeroSection;}) {
  const { slide, products } = useHeroMedia(data);
  if (!slide) return null;
  const col = (offset: number) => {
    const list = products.map((_, i) => products[(i + offset) % products.length]);
    return [...list, ...list];
  };

  return (
    <section id="hero" aria-label="Featured collection" className="relative w-full overflow-hidden bg-cream">
      <div className="shell grid min-h-[calc(100svh-72px)] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        <div className="py-16">
          {slide.eyebrow && <motion.p {...rise(0)} className="eyebrow text-gold">{slide.eyebrow}</motion.p>}
          <motion.h1 {...rise(0.1)} className="display mt-6 text-[clamp(2.6rem,5.4vw,4.8rem)] leading-[1.04] text-ink">
            {slide.title}
          </motion.h1>
          <motion.p {...rise(0.2)} className="body-base mt-6 max-w-[30rem] text-ink/60 sm:text-base">{slide.subtitle}</motion.p>
          <motion.div {...rise(0.3)} className="mt-10">
            <Buttons slide={slide} />
          </motion.div>
        </div>

        <div
          aria-hidden
          className="tpl-strip-wrap relative grid h-[70svh] grid-cols-3 gap-3 overflow-hidden lg:h-[calc(100svh-72px)] [mask-image:linear-gradient(transparent,black_14%,black_86%,transparent)]">

          {[0, 2, 1].map((offset, c) =>
          <div key={c} className={`tpl-column flex flex-col gap-3 ${c === 1 ? 'tpl-column-reverse' : ''}`} style={{ animationDuration: `${38 + c * 8}s` }}>
              {col(offset).map((src, i) =>
            <div key={i} className="tpl-media tpl-zoom aspect-[3/4] w-full shrink-0 bg-sand">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
            )}
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ======================================================= coverflow (Polki) */

export function CoverflowHero({ data }: {data: HeroSection;}) {
  const { slide, products } = useHeroMedia(data);
  if (!slide) return null;
  const ring = products.slice(0, 8);
  while (ring.length < 6) ring.push(...products.slice(0, 6 - ring.length));
  const step = 360 / ring.length;

  return (
    <section id="hero" aria-label="Featured collection" className="relative w-full overflow-hidden bg-cream pb-16 pt-14 sm:pt-20">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[55%] h-[34rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
      <div className="shell relative text-center">
        {slide.eyebrow && <motion.p {...rise(0)} className="eyebrow text-gold">{slide.eyebrow}</motion.p>}
        <motion.h1 {...rise(0.1)} className="display mx-auto mt-5 max-w-[48rem] text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[1.04] text-ink">
          {slide.title}
        </motion.h1>
      </div>

      <div className="relative mx-auto mt-10 h-[300px] w-full [perspective:1400px] sm:h-[380px]" aria-hidden>
        <div className="tpl-carousel absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
          {ring.map((src, i) =>
          <div
            key={i}
            className="absolute -left-[80px] -top-[110px] h-[220px] w-[160px] sm:-left-[100px] sm:-top-[140px] sm:h-[280px] sm:w-[200px]"
            style={{ transform: `rotateY(${i * step}deg) translateZ(clamp(260px, 32vw, 420px))` }}>

              <div className="tpl-media h-full w-full bg-sand shadow-2xl shadow-black/40 ring-1 ring-gold/40">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shell relative text-center">
        <motion.p {...rise(0.3)} className="body-base mx-auto max-w-[32rem] text-ink/65">{slide.subtitle}</motion.p>
        <motion.div {...rise(0.4)} className="mt-8 flex justify-center">
          <Buttons slide={slide} />
        </motion.div>
      </div>
    </section>);

}

