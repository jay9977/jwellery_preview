import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue } from
'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';
import { useContent } from '../../../hooks/useContent';
import type { HeroSection } from '../../../types/content';
import type { Intro } from '../../../data/templates';
import { EASE_OUT } from './engine';
import { Magnetic } from './Magnetic';

/*
 * Product-first hero. A jewellery site has to read as jewellery before it shows anyone
 * wearing it, so the hero is a short scroll story:
 *   0.00 – 0.50  the pieces themselves, floating in layers over turning gold rings
 *   0.45 – 0.85  they part, and a circle opens in the middle onto the model wearing them
 *   0.80 – 1.00  the campaign headline and buttons arrive
 * Three choreographies for the pieces — orbit, fan, rail — so templates move differently.
 * Reduced motion skips the story and shows both halves stacked, still.
 */

const SPARKLES = [
[12, 22, 0], [86, 18, 1.2], [20, 78, 2.1], [78, 72, 0.6], [50, 10, 1.7], [8, 50, 2.6], [92, 48, 0.9], [62, 88, 1.4]];


function usePointer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX / window.innerWidth - 0.5);
      y.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [x, y]);
  return { sx, sy };
}

/** One floating piece. `depth` sets how far it drifts with the pointer and the scroll. */
function Piece({
  src,
  index,
  total,
  intro,
  progress,
  sx,
  sy,
  main








}: {src: string;index: number;total: number;intro: Intro;progress: MotionValue<number>;sx: MotionValue<number>;sy: MotionValue<number>;main?: boolean;}) {
  const depth = main ? 18 : 34 + index * 10;
  const px = useTransform(sx, (v) => v * -depth);
  const py = useTransform(sy, (v) => v * -depth);

  // Where each piece rests, and where the scroll sends it.
  const angle = index / total * Math.PI * 2 - Math.PI / 2;
  const plan = {
    orbit: {
      start: main ? [0, 0, 0] : [Math.cos(angle) * 34, Math.sin(angle) * 30, 0],
      end: main ? [0, -6, 0] : [Math.cos(angle + 0.9) * 70, Math.sin(angle + 0.9) * 60, 40]
    },
    fan: {
      start: main ? [0, 0, 0] : [(index - (total - 1) / 2) * 3, 6, (index - (total - 1) / 2) * 4],
      end: main ? [0, -10, 0] : [(index - (total - 1) / 2) * 30, 18, (index - (total - 1) / 2) * 16]
    },
    rail: {
      start: main ? [0, 0, 0] : [(index + 1) * 26 * (index % 2 ? 1 : -1), index % 2 ? 14 : -12, 0],
      end: main ? [-12, 0, 0] : [(index + 1) * 26 * (index % 2 ? 1 : -1) - 60, index % 2 ? 14 : -12, 0]
    }
  }[intro];

  const x = useTransform(progress, [0, 0.55], [`${plan.start[0]}vw`, `${plan.end[0]}vw`]);
  const y = useTransform(progress, [0, 0.55], [`${plan.start[1]}vh`, `${plan.end[1]}vh`]);
  const rotate = useTransform(progress, [0, 0.55], [plan.start[2], plan.end[2]]);
  const scale = useTransform(progress, [0, 0.55], main ? [1, 1.25] : [1, 0.75]);
  const opacity = useTransform(progress, [0.4, 0.6], [1, 0]);

  return (
    <motion.div style={{ x, y, rotate, scale, opacity }} className="absolute left-1/2 top-1/2">
      <motion.div style={{ x: px, y: py }}>
        {/* Centering lives on a plain element: Motion owns the transform of the two above. */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.15 + (main ? 0 : index + 1) * 0.14 }}
          className={`-translate-x-1/2 -translate-y-1/2 tpl-media overflow-hidden bg-sand shadow-2xl shadow-black/25 ring-1 ring-gold/40 ${
          main ?
          'aspect-[4/5] w-[52vw] max-w-[22rem] sm:w-[30vw]' :
          intro === 'fan' ?
          'aspect-[4/5] w-[30vw] max-w-[13rem] sm:w-[16vw]' :
          'aspect-square w-[24vw] max-w-[10rem] sm:w-[12vw]'}`
          }>

          <img src={src} alt="" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
        </motion.div>
      </motion.div>
    </motion.div>);

}

export const StoryOrbit = ({ data }: {data: HeroSection;}) => <StoryHero data={data} intro="orbit" />;
export const StoryFan = ({ data }: {data: HeroSection;}) => <StoryHero data={data} intro="fan" />;
export const StoryRail = ({ data }: {data: HeroSection;}) => <StoryHero data={data} intro="rail" />;

function StoryHero({ data, intro }: {data: HeroSection;intro: Intro;}) {
  const { content } = useContent();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const { sx, sy } = usePointer();

  const slide = data.slides[0];
  const products = [
  ...content.sections.featured?.items.map((p) => p.image) ?? [],
  ...content.sections.categories?.items.map((c) => c.image) ?? []].
  filter(Boolean);
  const pieces = [...new Set(products)].slice(0, 5);

  // Phase 1 text and graphics
  const introOpacity = useTransform(progress, [0, 0.3], [1, 0]);
  const introY = useTransform(progress, [0, 0.3], ['0vh', '-8vh']);
  const ringRotate = useTransform(progress, [0, 1], [0, 140]);
  const ringScale = useTransform(progress, [0, 0.6], [1, 1.8]);
  const ringOpacity = useTransform(progress, [0.35, 0.6], [1, 0]);

  // Phase 2: a circle opens onto the model
  const reveal = useTransform(progress, [0.42, 0.85], ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)']);
  const modelScale = useTransform(progress, [0.42, 1], [1.35, 1]);
  const modelY = useTransform(progress, [0.42, 1], ['6%', '0%']);
  const finalOpacity = useTransform(progress, [0.78, 0.95], [0, 1]);
  const finalY = useTransform(progress, [0.78, 0.95], ['24px', '0px']);
  const cueOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  if (!slide) return null;

  const headline =
  <>
      {slide.eyebrow && <p className="eyebrow text-gold">{slide.eyebrow}</p>}
      <h1 className="display mt-5 text-[clamp(2.4rem,6vw,5rem)] leading-[1.03] text-white">{slide.title}</h1>
      <p className="body-base mx-auto mt-5 max-w-[32rem] text-white/80 sm:text-base">{slide.subtitle}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
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
            <a href={slide.secondaryHref || '#contact'} className="royal-btn tpl-glass-panel text-white">
              {slide.secondaryLabel}
            </a>
          </Magnetic>
      }
      </div>
    </>;


  // Still version: the pieces, then the campaign — no scroll choreography.
  if (reduce) {
    return (
      <section id="hero" aria-label="Featured collection" className="w-full bg-cream">
        <div className="shell flex flex-wrap justify-center gap-4 py-16">
          {pieces.map((src) =>
          <div key={src} className="tpl-media aspect-square w-36 overflow-hidden bg-sand">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        <div className="relative flex min-h-[80svh] items-center justify-center overflow-hidden">
          <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="shell relative text-center">{headline}</div>
        </div>
      </section>);

  }

  return (
    <section ref={ref} id="hero" aria-label="Featured collection" className="relative h-[260svh] w-full bg-cream">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* ---------- backdrop: light, rings, sparkles ---------- */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--c-sand))_0%,rgb(var(--c-cream))_65%)]" />
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 200 200"
          style={{ rotate: ringRotate, scale: ringScale, opacity: ringOpacity }}
          className="h-[120vmin] w-[120vmin] shrink-0 text-gold">

          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 3" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.6" />
          <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="6 4" />
          {Array.from({ length: 12 }).map((_, i) =>
          <rect
            key={i}
            x="99"
            y="2"
            width="2"
            height="2"
            fill="currentColor"
            transform={`rotate(${i * 30} 100 100) rotate(45 100 3)`} />

          )}
        </motion.svg>
        </div>
        <motion.div aria-hidden style={{ opacity: ringOpacity }} className="absolute inset-0">
          {SPARKLES.map(([left, top, delay], i) =>
          <span
            key={i}
            className="tpl-sparkle absolute h-2 w-2 rotate-45 bg-gold"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }} />

          )}
        </motion.div>

        {/* ---------- phase 1: the pieces ---------- */}
        {pieces.map((src, i) =>
        <Piece
          key={src}
          src={src}
          index={i === 0 ? 0 : i - 1}
          total={Math.max(pieces.length - 1, 1)}
          intro={intro}
          progress={progress}
          sx={sx}
          sy={sy}
          main={i === 0} />

        )}

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 bottom-[13vh] z-10 px-6 text-center">

          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.32em' }}
            transition={{ duration: 1.4, ease: EASE_OUT }}
            className="eyebrow text-gold">

            {content.brand.name}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(16px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
            className="display mx-auto mt-3 max-w-[44rem] text-[clamp(1.4rem,3vw,2.4rem)] leading-tight text-ink">

            {content.brand.tagline}
          </motion.p>
        </motion.div>

        <motion.div style={{ opacity: cueOpacity }} className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1 text-ink/50">
          <span className="meta text-[10px]">Scroll</span>
          <ChevronDownIcon className="h-4 w-4 animate-bounce" />
        </motion.div>

        {/* ---------- phase 2: the circle opens onto the model ---------- */}
        <motion.div style={{ clipPath: reveal }} className="absolute inset-0 z-20">
          <motion.img
            src={slide.image}
            alt={slide.title}
            style={{ scale: modelScale, y: modelY }}
            className="absolute inset-0 h-full w-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
          <motion.div style={{ opacity: finalOpacity, y: finalY }} className="shell relative flex h-full flex-col items-center justify-center">
            <div className="tpl-glass-panel max-w-[46rem] px-6 py-10 text-center sm:px-14 sm:py-14">{headline}</div>
          </motion.div>
        </motion.div>
      </div>
    </section>);

}
