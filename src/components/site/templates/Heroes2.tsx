import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import type { HeroSection, HeroSlide } from '../../../types/content';
import { useContent } from '../../../hooks/useContent';
import { EASE_OUT, useHeroMedia } from './engine';
import { Magnetic } from './Magnetic';

/* Four more product-first heroes, each built around a single piece of motion design. */

function Cta({ slide, light = false }: {slide: HeroSlide;light?: boolean;}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {slide.primaryLabel &&
      <Magnetic>
          <a href={slide.primaryHref || '#featured'} className="royal-btn royal-btn-gold">
            {slide.primaryLabel}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </a>
        </Magnetic>
      }
      {slide.secondaryLabel &&
      <Magnetic>
          <a href={slide.secondaryHref || '#contact'} className={`royal-btn ${light ? 'tpl-glass-panel text-white' : 'royal-btn-line'}`}>
            {slide.secondaryLabel}
          </a>
        </Magnetic>
      }
    </div>);

}

function StillHero({ data }: {data: HeroSection;}) {
  const { slide, products } = useHeroMedia(data);
  if (!slide) return null;
  return (
    <section id="hero" aria-label="Featured collection" className="relative flex min-h-[90svh] items-center justify-center overflow-hidden">
      <img src={products[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="tpl-glass-panel relative mx-4 max-w-[40rem] px-8 py-12 text-center">
        <h1 className="display text-[clamp(2.2rem,5vw,4rem)] leading-tight text-white">{slide.title}</h1>
        <p className="body-base mt-4 text-white/80">{slide.subtitle}</p>
        <div className="mt-8"><Cta slide={slide} light /></div>
      </div>
    </section>);

}

function useStory(ref: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
}

/* ======================================================= text mask (Aurora) */

export function TextMaskHero({ data }: {data: HeroSection;}) {
  const { slide, products, brand } = useHeroMedia(data);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const p = useStory(ref);
  const textScale = useTransform(p, [0, 0.6], [1, 9]);
  const textOpacity = useTransform(p, [0.4, 0.62], [1, 0]);
  const imageOpacity = useTransform(p, [0.3, 0.6], [0, 1]);
  const imageScale = useTransform(p, [0.3, 1], [1.25, 1]);
  const panelOpacity = useTransform(p, [0.65, 0.85], [0, 1]);
  const panelY = useTransform(p, [0.65, 0.85], ['30px', '0px']);
  const cue = useTransform(p, [0, 0.08], [1, 0]);
  if (!slide) return null;
  if (reduce) return <StillHero data={data} />;
  const word = brand.name.split(' ')[0] || brand.name;

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative h-[260svh] w-full bg-cream">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.img style={{ opacity: imageOpacity, scale: imageScale }} src={products[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <motion.div style={{ opacity: imageOpacity }} className="absolute inset-0 bg-black/40" />

        {/* The jewellery shows through the brand name, which flies at the viewer. */}
        <motion.div style={{ scale: textScale, opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '-0.02em' }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
            style={{ backgroundImage: `url(${products[1] ?? products[0]})` }}
            className="display select-none bg-cover bg-center bg-clip-text px-4 text-center text-[clamp(4.5rem,19vw,17rem)] font-semibold uppercase leading-none text-transparent [-webkit-background-clip:text]">

            {word}
          </motion.h2>
        </motion.div>
        <motion.p style={{ opacity: cue }} className="meta absolute inset-x-0 bottom-8 text-center text-[10px] text-ink/50">
          Scroll to step inside
        </motion.p>

        <motion.div style={{ opacity: panelOpacity, y: panelY }} className="absolute inset-0 flex items-center justify-center px-4">
          <div className="tpl-glass-panel max-w-[44rem] px-8 py-12 text-center sm:px-14">
            {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
            <h1 className="display mt-4 text-[clamp(2.2rem,5vw,4.2rem)] leading-tight text-white">{slide.title}</h1>
            <p className="body-base mx-auto mt-4 max-w-[30rem] text-white/80">{slide.subtitle}</p>
            <div className="mt-8"><Cta slide={slide} light /></div>
          </div>
        </motion.div>
      </div>
    </section>);

}

/* ================================================== horizontal (Celeste) */

function Panel({ src, title, caption, progress, index }: {src: string;title: string;caption: string;progress: MotionValue<number>;index: number;}) {
  const x = useTransform(progress, [0, 1], ['-8%', '8%']);
  return (
    <figure className="tpl-media relative h-[62svh] w-[78vw] shrink-0 overflow-hidden bg-sand sm:w-[40vw]">
      <motion.img style={{ x, scale: 1.2 }} src={src} alt={title} className="h-full w-full object-cover" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16 text-white">
        <span className="meta text-white/70">{String(index + 1).padStart(2, '0')} — {caption}</span>
        <span className="display mt-2 block text-[1.9rem] leading-tight">{title}</span>
      </figcaption>
    </figure>);

}

export function HorizontalHero({ data }: {data: HeroSection;}) {
  const { slide, model } = useHeroMedia(data);
  const { content } = useContent();
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const p = useStory(ref);
  const x = useTransform(p, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    const measure = () => setDistance(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!slide) return null;
  if (reduce) return <StillHero data={data} />;
  const pieces = [
  ...(content.sections.featured?.items.map((i) => ({ src: i.image, title: i.name, caption: i.metal })) ?? []),
  ...(content.sections.categories?.items.map((i) => ({ src: i.image, title: i.title, caption: i.caption })) ?? [])].
  slice(0, 6);

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative w-full bg-cream" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex items-center gap-8 pl-[6vw] pr-[6vw]">
          <div className="w-[82vw] shrink-0 sm:w-[44vw]">
            {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
            <motion.h1
              initial={{ opacity: 0, transform: 'translateY(30px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: 1, ease: EASE_OUT }}
              className="display mt-5 text-[clamp(2.8rem,6vw,5.5rem)] leading-[1] text-ink">

              {slide.title}
            </motion.h1>
            <p className="body-base mt-6 max-w-[28rem] text-ink/60">{slide.subtitle}</p>
            <p className="meta mt-10 flex items-center gap-3 text-ink/45">
              Scroll
              <span className="h-px w-16 bg-ink/30" />
            </p>
          </div>
          {pieces.map((piece, i) =>
          <Panel key={`${piece.src}-${i}`} {...piece} progress={p} index={i} />
          )}
          <div className="tpl-media relative h-[72svh] w-[82vw] shrink-0 overflow-hidden sm:w-[48vw]">
            <img src={model} alt={slide.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 to-transparent p-10 text-center">
              <p className="display text-[2rem] leading-tight text-white">As worn</p>
              <div className="mt-6"><Cta slide={slide} light /></div>
            </div>
          </div>
        </motion.div>
        <ProgressBar progress={p} />
      </div>
    </section>);

}

function ProgressBar({ progress }: {progress: MotionValue<number>;}) {
  return (
    <div aria-hidden className="absolute bottom-8 left-[6vw] right-[6vw] h-px bg-ink/15">
      <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-gold" />
    </div>);

}

/* ===================================================== curtain (Rani Kundan) */

export function CurtainHero({ data }: {data: HeroSection;}) {
  const { slide, products, brand } = useHeroMedia(data);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%']);
  const [shown, setShown] = useState(0);
  const pieces = products.slice(0, 4);
  useEffect(() => {
    if (pieces.length < 2) return;
    const timer = window.setInterval(() => setShown((i) => (i + 1) % pieces.length), 4500);
    return () => window.clearInterval(timer);
  }, [pieces.length]);
  if (!slide) return null;
  const ringText = `${brand.name} · ${brand.tagline || 'Fine jewellery'} · `;

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative min-h-[calc(100svh-64px)] w-full overflow-hidden bg-cream">
      <div className="shell relative grid min-h-[calc(100svh-64px)] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2">
        <motion.div style={{ y: textY }} className="relative z-10 text-center lg:text-left">
          {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
          <h1 className="display mt-5 text-[clamp(2.6rem,5.6vw,5rem)] leading-[1.02] text-ink">{slide.title}</h1>
          <p className="body-base mx-auto mt-6 max-w-[30rem] text-ink/60 lg:mx-0">{slide.subtitle}</p>
          <div className="mt-10 flex justify-center lg:justify-start"><Cta slide={slide} /></div>
        </motion.div>

        <motion.div style={{ y: imgY }} className="relative mx-auto aspect-square w-[80vw] max-w-[32rem]">
          {/* a ring of the brand's own words, turning slowly around the piece */}
          <svg viewBox="0 0 300 300" className="tpl-spin absolute inset-0 h-full w-full text-gold" aria-hidden>
            <defs>
              <path id="ring" d="M150,150 m-132,0 a132,132 0 1,1 264,0 a132,132 0 1,1 -264,0" />
            </defs>
            <text fontSize="11" letterSpacing="4" fill="currentColor" className="uppercase">
              <textPath href="#ring">{ringText.repeat(3)}</textPath>
            </text>
          </svg>
          <div className="royal-arch absolute inset-[13%] overflow-hidden bg-sand shadow-2xl shadow-black/30 ring-1 ring-gold/50">
            {pieces.map((src, i) =>
            <motion.img
              key={src}
              src={src}
              alt=""
              initial={false}
              animate={{ opacity: i === shown ? 1 : 0, scale: i === shown ? 1 : 1.08 }}
              transition={{ duration: 1.2, ease: EASE_OUT }}
              className="absolute inset-0 h-full w-full object-cover" />

            )}
          </div>
        </motion.div>
      </div>

      {/* the curtains: two panels that part once, on arrival */}
      {!reduce &&
      <>
          <motion.div
          aria-hidden
          initial={{ transform: 'translateX(0%)' }}
          animate={{ transform: 'translateX(-101%)' }}
          transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1], delay: 0.35 }}
          className="tpl-curtain absolute inset-y-0 left-0 z-30 w-1/2 border-r border-gold/60" />

          <motion.div
          aria-hidden
          initial={{ transform: 'translateX(0%)' }}
          animate={{ transform: 'translateX(101%)' }}
          transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1], delay: 0.35 }}
          className="tpl-curtain absolute inset-y-0 right-0 z-30 w-1/2 border-l border-gold/60" />

        </>
      }
    </section>);

}

/* ===================================================== card stack (Solitaire) */

function StackCard({ src, index, total, progress }: {src: string;index: number;total: number;progress: MotionValue<number>;}) {
  // Card 0 sits on top and leaves first.
  const start = index / (total + 1);
  const end = (index + 1) / (total + 1);
  const y = useTransform(progress, [start, end], ['0vh', '-120vh']);
  const rotate = useTransform(progress, [start, end], [(index % 2 ? 1 : -1) * (index * 2), (index % 2 ? 1 : -1) * 18]);
  return (
    <motion.div style={{ y, rotate, zIndex: total - index }} className="absolute inset-0">
      <div
        className="tpl-media h-full w-full overflow-hidden bg-sand shadow-2xl shadow-black/25 ring-1 ring-ink/5"
        style={{ transform: `translate(${index * 10}px, ${index * 12}px) rotate(${(index % 2 ? 1 : -1) * index * 2}deg)` }}>

        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    </motion.div>);

}

export function StackHero({ data }: {data: HeroSection;}) {
  const { slide, products, model } = useHeroMedia(data);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const p = useStory(ref);
  const pieces = products.slice(0, 5);
  const count = useTransform(p, (v) => String(Math.min(pieces.length, Math.floor(v * (pieces.length + 1)) + 1)).padStart(2, '0'));
  const finalOpacity = useTransform(p, [pieces.length / (pieces.length + 1), 1], [0, 1]);
  if (!slide) return null;
  if (reduce) return <StillHero data={data} />;

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative h-[320svh] w-full bg-cream">
      <div className="sticky top-0 grid h-[100svh] grid-cols-1 items-center overflow-hidden lg:grid-cols-2">
        <div className="shell relative z-10 order-2 pb-10 lg:order-1 lg:pb-0">
          {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
          <h1 className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.03] text-ink">{slide.title}</h1>
          <p className="body-base mt-5 max-w-[28rem] text-ink/60">{slide.subtitle}</p>
          <p className="display mt-10 flex items-baseline gap-2 text-ink/40">
            <motion.span className="text-[3rem] leading-none text-gold">{count}</motion.span>
            <span className="text-lg">/ {String(pieces.length).padStart(2, '0')}</span>
          </p>
        </div>
        <div className="relative order-1 mx-auto mt-24 aspect-[4/5] w-[62vw] max-w-[24rem] lg:order-2 lg:mt-0">
          <motion.div style={{ opacity: finalOpacity }} className="tpl-media absolute inset-0 overflow-hidden">
            <img src={model} alt={slide.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
              <Cta slide={slide} light />
            </div>
          </motion.div>
          {pieces.map((src, i) =>
          <StackCard key={src} src={src} index={i} total={pieces.length} progress={p} />
          )}
        </div>
      </div>
    </section>);

}
