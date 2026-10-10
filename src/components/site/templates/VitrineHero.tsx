import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import type { HeroSection } from '../../../types/content';
import { useContent } from '../../../hooks/useContent';
import { EASE_OUT, useHeroMedia } from './engine';
import { Magnetic } from './Magnetic';

/**
 * Vitrine: the piece sits in a glass display case with light sweeping across it,
 * a glass shelf of other pieces below, a floating glass label, and a headline whose
 * last word rolls through the store's collections. The case tilts toward the pointer.
 */

/** A word that rolls over to the next one, like a slot-machine reel. */
function Reel({ words }: {words: string[];}) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (words.length < 2 || reduce) return;
    const timer = window.setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => window.clearInterval(timer);
  }, [words.length, reduce]);
  const widest = words.reduce((a, b) => a.length >= b.length ? a : b, '');
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* the widest word reserves the space, so the line never jumps */}
      <span className="invisible col-start-1 row-start-1">{widest}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ transform: 'translateY(100%)', opacity: 0 }}
          animate={{ transform: 'translateY(0%)', opacity: 1 }}
          exit={{ transform: 'translateY(-100%)', opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="col-start-1 row-start-1 italic text-gold">

          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>);

}

export function VitrineHero({ data }: {data: HeroSection;}) {
  const { slide } = useHeroMedia(data);
  const { content } = useContent();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const items = (content.sections.featured?.items ?? []).slice(0, 5);
  const [active, setActive] = useState(0);
  const product = items[active];

  const mx = useSpring(0, { stiffness: 70, damping: 18 });
  const my = useSpring(0, { stiffness: 70, damping: 18 });
  const caseRotY = useTransform(mx, [-0.5, 0.5], [8, -8]);
  const caseRotX = useTransform(my, [-0.5, 0.5], [-6, 6]);
  const cardX = useTransform(mx, [-0.5, 0.5], [-18, 18]);
  const cardY = useTransform(my, [-0.5, 0.5], [-14, 14]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const caseY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-14%']);
  const caseScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);

  useEffect(() => {
    if (items.length < 2 || reduce) return;
    const timer = window.setInterval(() => setActive((n) => (n + 1) % items.length), 5200);
    return () => window.clearInterval(timer);
  }, [items.length, reduce]);

  if (!slide) return null;
  const words = (content.sections.categories?.items ?? []).map((c) => c.title).filter(Boolean).slice(0, 5);

  return (
    <section
      ref={ref}
      id="hero"
      aria-label="Featured collection"
      className="relative min-h-[calc(100svh-72px)] w-full overflow-hidden bg-cream"
      onPointerMove={(e) => {
        if (reduce) return;
        const box = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - box.left) / box.width - 0.5);
        my.set((e.clientY - box.top) / box.height - 0.5);
      }}>

      {/* drifting colour, like light through tinted glass */}
      <div aria-hidden className="tpl-mesh absolute inset-0" />

      <div className="shell relative grid min-h-[calc(100svh-72px)] grid-cols-1 items-center gap-16 py-16 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative z-10">
          {slide.eyebrow &&
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream/50 px-4 py-2 text-gold backdrop-blur">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              {slide.eyebrow}
            </motion.p>
          }
          <motion.h1
            initial={{ opacity: 0, transform: 'translateY(24px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.1 }}
            className="display mt-7 text-[clamp(2.6rem,5.4vw,5rem)] leading-[1.04] text-ink">

            {slide.title}
            {words.length > 1 &&
            <span className="mt-2 block text-[0.6em]">
                <span className="text-ink/55">in </span>
                <Reel words={words} />
              </span>
            }
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="body-base mt-6 max-w-[28rem] text-ink/60">

            {slide.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-3">

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
                <a href={slide.secondaryHref || '#contact'} className="btn border border-ink/15 bg-cream/40 text-ink backdrop-blur hover:bg-cream/70">
                  {slide.secondaryLabel}
                </a>
              </Magnetic>
            }
          </motion.div>
        </div>

        <motion.div style={{ y: caseY, scale: caseScale }} className="relative mx-auto w-full max-w-[32rem] [perspective:1400px]">
          <motion.div
            style={{ rotateX: caseRotX, rotateY: caseRotY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
            className="tpl-vitrine relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">

            {product &&
            <AnimatePresence mode="popLayout">
                <motion.img
                key={product.id}
                src={product.image}
                alt={product.name}
                initial={{ opacity: 0, transform: 'scale(1.12)' }}
                animate={{ opacity: 1, transform: 'scale(1)' }}
                exit={{ opacity: 0, transform: 'scale(0.96)' }}
                transition={{ duration: 1, ease: EASE_OUT }}
                className="absolute inset-[7%] h-[86%] w-[86%] rounded-[1.4rem] object-cover shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)]" />

              </AnimatePresence>
            }
            <span aria-hidden className="tpl-sheen pointer-events-none absolute inset-0" />
          </motion.div>

          {/* floating glass label for the piece on show */}
          {product &&
          <motion.div style={{ x: cardX, y: cardY }} className="absolute -left-4 bottom-20 z-10 sm:-left-14">
              <AnimatePresence mode="wait">
                <motion.div
                key={product.id}
                initial={{ opacity: 0, transform: 'translateY(12px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0, transform: 'translateY(-12px)' }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="tpl-vitrine-card max-w-[15rem] rounded-2xl px-5 py-4">

                  {product.badge && <p className="meta text-[10px] text-gold">{product.badge}</p>}
                  <p className="display mt-1 text-[1.25rem] leading-tight text-ink">{product.name}</p>
                  <p className="meta mt-1 text-[10px] text-ink/50">{product.metal}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          }

          {/* the glass shelf */}
          {items.length > 1 &&
          <div className="tpl-vitrine-card absolute -bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full p-2">
              {items.map((item, i) =>
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.name}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`h-12 w-12 overflow-hidden rounded-full transition-[transform,opacity] duration-300 ${
              i === active ? 'scale-110 opacity-100 ring-2 ring-gold ring-offset-2 ring-offset-cream' : 'opacity-60 hover:opacity-100'}`
              }>

                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </button>
            )}
            </div>
          }
        </motion.div>
      </div>
    </section>);

}
