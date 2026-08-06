import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import type { HeroSection } from '../../types/content';

export function Hero({ data }: {data: HeroSection;}) {
  const [index, setIndex] = useState(0);
  const slides = data.slides;
  const active = slides[Math.min(index, slides.length - 1)];

  useEffect(() => {
    if (!data.autoplay || slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [data.autoplay, slides.length]);

  if (!active) return null;

  return (
    <section id="hero" aria-label="Featured collection" className="relative w-full bg-sand">
      <div className="relative h-[540px] w-full overflow-hidden sm:h-[600px] lg:h-[660px]">
        <AnimatePresence mode="sync">
          <motion.img
            key={active.id + active.image}
            src={active.image}
            alt={active.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover" />
          
        </AnimatePresence>
        <div className="absolute inset-0 bg-ink/25" />

        <div className="shell relative flex h-full items-end pb-14 sm:items-center sm:pb-0">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[34rem] bg-cream/95 p-8 sm:p-10 lg:p-12">
            
            {active.eyebrow && <p className="eyebrow text-gold">{active.eyebrow}</p>}
            <h1 className={`display display-1 text-ink ${active.eyebrow ? 'mt-5' : ''}`}>{active.title}</h1>
            <p className="body-base mt-5 max-w-[28rem] text-ink/70">{active.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Links, not bare buttons: these used to be decorative and did nothing
                  when clicked. The destination is editable per slide in the admin. */}
              {active.primaryLabel &&
              <a href={active.primaryHref || '#featured'} className="btn btn-primary group">
                  {active.primaryLabel}
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              }
              {active.secondaryLabel &&
              <a href={active.secondaryHref || '#contact'} className="btn btn-outline">
                  {active.secondaryLabel}
                </a>
              }
            </div>
          </motion.div>
        </div>

        {slides.length > 1 &&
        <div className="shell pointer-events-none absolute inset-x-0 bottom-6 flex justify-end">
            <div className="pointer-events-auto flex items-center gap-2">
              {slides.map((slide, i) =>
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-[3px] transition-all ${
              i === index ? 'w-10 bg-cream' : 'w-5 bg-cream/50 hover:bg-cream/80'}`
              } />

            )}
            </div>
          </div>
        }
      </div>
    </section>);

}