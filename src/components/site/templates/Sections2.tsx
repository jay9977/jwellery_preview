import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform } from
'framer-motion';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  AwardIcon,
  CheckIcon,
  EyeIcon,
  GemIcon,
  HeadphonesIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon } from
'lucide-react';
import type {
  CategoriesSection,
  EditorialSection,
  FaqSection,
  FeaturedSection,
  GallerySection,
  IconKey,
  JournalSection,
  NewsletterSection,
  Product,
  PromoSection,
  TestimonialsSection,
  TrustSection } from
'../../../types/content';
import { useContent } from '../../../hooks/useContent';
import { trackLead } from '../../../utils/leads';
import { QuickView } from '../QuickView';
import { EASE_OUT, useEnter, useMedia, useProducts } from './engine';

/* More layouts for the template engine — so no two templates share a section. */

function Heading({ eyebrow, title, subtitle, align = 'left' }: {eyebrow?: string;title: string;subtitle?: string;align?: 'left' | 'center';}) {
  const a = useEnter();
  return (
    <motion.div {...a} className={align === 'center' ? 'mx-auto max-w-[42rem] text-center' : 'max-w-[40rem]'}>
      {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
      <h2 className={`display display-2 text-ink ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      {subtitle && <p className="body-base mt-4 text-ink/60">{subtitle}</p>}
    </motion.div>);

}

/**
 * A photo that trails the pointer while a row is hovered — for the list layouts.
 * Pointer-only; on touch the rows show their own thumbnail instead.
 */
function useTrailingImage() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const [active, setActive] = useState<string | null>(null);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - box.left);
    y.set(e.clientY - box.top);
  };
  const image =
  <AnimatePresence>
      {active &&
    <motion.div
      key="trail"
      aria-hidden
      style={{ x: sx, y: sy }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block">

          <div className="tpl-media -translate-x-1/2 -translate-y-1/2 h-64 w-48 overflow-hidden bg-sand shadow-2xl">
            <AnimatePresence mode="popLayout">
              <motion.img
            key={active}
            src={active}
            alt=""
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="h-full w-full object-cover" />

            </AnimatePresence>
          </div>
        </motion.div>
    }
    </AnimatePresence>;

  return { setActive, onMove, image };
}

/* =================================================== categories: accordion */

export function AccordionCategories({ data }: {data: CategoriesSection;}) {
  const [open, setOpen] = useState(0);
  return (
    <section id="categories" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-12 flex h-[640px] flex-col gap-3 md:h-[560px] md:flex-row">
          {data.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <a
                key={item.id}
                href="#featured"
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                className="tpl-media group relative min-h-0 min-w-0 overflow-hidden bg-sand transition-[flex-grow] duration-700 [transition-timing-function:var(--ease-out)]"
                style={{ flexGrow: isOpen ? 4 : 1, flexBasis: 0 }}>

                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className={`h-full w-full object-cover transition-transform duration-1000 [transition-timing-function:var(--ease-out)] ${isOpen ? 'scale-100' : 'scale-110'}`}
                  style={{ borderRadius: 0 }} />

                <span className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-70'}`} />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <span className="meta block text-white/70">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`display mt-2 block leading-tight transition-[font-size] duration-500 ${isOpen ? 'text-[2rem]' : 'text-[1.2rem]'}`}>{item.title}</span>
                  <span className={`body-sm mt-2 block text-white/75 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.caption}</span>
                </span>
              </a>);

          })}
        </div>
      </div>
    </section>);

}

/* ======================================================== categories: list */

export function ListCategories({ data }: {data: CategoriesSection;}) {
  const trail = useTrailingImage();
  return (
    <section id="categories" className="section-y w-full bg-cream">
      <div className="shell relative" onPointerMove={trail.onMove} onPointerLeave={() => trail.setActive(null)}>
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <ul className="mt-12 border-t border-ink/15">
          {data.items.map((item, i) =>
          <ListRow key={item.id} index={i} onHover={() => trail.setActive(item.image)}>
              <a href="#featured" className="group flex items-center gap-5 py-6 sm:gap-10 sm:py-8">
                <span className="meta w-8 text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                <img src={item.image} alt="" className="h-16 w-14 shrink-0 object-cover md:hidden" />
                <span className="display flex-1 text-[clamp(1.8rem,5vw,4.25rem)] leading-none text-ink transition-[transform,color] duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-4 group-hover:text-gold">
                  {item.title}
                </span>
                <span className="meta hidden text-ink/45 sm:block">{item.caption}</span>
                <ArrowUpRightIcon className="h-6 w-6 shrink-0 text-ink/30 transition-[transform,color] duration-500 group-hover:rotate-45 group-hover:text-gold" />
              </a>
            </ListRow>
          )}
        </ul>
        {trail.image}
      </div>
    </section>);

}

function ListRow({ index, onHover, children }: {index: number;onHover: () => void;children: React.ReactNode;}) {
  const enter = useEnter(index * 0.06);
  return (
    <motion.li {...enter} onPointerEnter={onHover} className="border-b border-ink/15">
      {children}
    </motion.li>);

}

/* ========================================================= featured: carousel */

export function CarouselFeatured({ data }: {data: FeaturedSection;}) {
  const p = useProducts(data);
  const track = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(0);
  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (el) setLimit(Math.max(0, el.scrollWidth - (el.parentElement?.clientWidth ?? 0)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [data.items.length]);

  return (
    <section id="featured" className="section-y w-full overflow-hidden bg-sand">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
          <p className="meta text-ink/45">Drag to explore →</p>
        </div>
        <div className="mt-12 cursor-grab active:cursor-grabbing">
          <motion.div ref={track} drag="x" dragConstraints={{ left: -limit, right: 0 }} dragElastic={0.08} className="flex w-max gap-6">
            {data.items.map((product, i) =>
            <CarouselCard key={product.id} product={product} index={i} label={data.enquiryLabel} p={p} />
            )}
          </motion.div>
        </div>
      </div>
      <QuickView product={p.quickView} trustBadges={data.trustBadges} onClose={p.close} />
    </section>);

}

function CarouselCard({ product, index, label, p }: {product: Product;index: number;label: string;p: ReturnType<typeof useProducts>;}) {
  const enter = useEnter(index * 0.08);
  return (
    <motion.article {...enter} className="tpl-card group w-[78vw] shrink-0 overflow-hidden bg-cream sm:w-[22rem]">
      <div className="tpl-zoom relative aspect-[4/5] overflow-hidden">
        <img src={product.image} alt={product.name} draggable={false} className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
        {product.badge && <span className="meta absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[10px] text-ink backdrop-blur">{product.badge}</span>}
        <button
          type="button"
          onClick={() => p.open(product)}
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-ink shadow-lg transition-transform duration-300 hover:scale-110">

          <EyeIcon className="h-4 w-4" />
          <span className="sr-only">Quick view</span>
        </button>
      </div>
      <div className="p-6">
        <h3 className="display display-4 text-ink">{product.name}</h3>
        <p className="meta mt-1.5 text-ink/45">{product.metal}</p>
        <button type="button" onClick={() => p.enquire(product)} className="link-underline group mt-5">
          {label || 'Enquire now'}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.article>);

}

/* ===================================================== testimonials: marquee */

function Stars({ rating }: {rating: number;}) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, s) =>
      <StarIcon key={s} className={`h-3.5 w-3.5 ${s < rating ? 'fill-gold text-gold' : 'text-ink/20'}`} />
      )}
    </div>);

}

export function MarqueeTestimonials({ data }: {data: TestimonialsSection;}) {
  const items = data.items.length ? data.items : [];
  const row = [...items, ...items, ...items, ...items];
  return (
    <section id="testimonials" className="section-y w-full overflow-hidden bg-sand">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} align="center" />
      </div>
      <div className="tpl-strip-wrap mt-12 space-y-5">
        {[0, 1].map((r) =>
        <div key={r} className={`tpl-strip flex w-max gap-5 ${r ? 'tpl-strip-reverse' : ''}`} style={{ animationDuration: '80s' }}>
            {row.map((item, i) =>
          <figure key={`${r}-${i}`} className="tpl-card w-[22rem] shrink-0 border border-ink/10 bg-cream p-7">
                <Stars rating={item.rating} />
                <blockquote className="display mt-4 text-[1.15rem] leading-relaxed text-ink/85">“{item.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-ink">
                    {item.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="meta block text-ink">{item.name}</span>
                    <span className="text-xs text-ink/50">{item.location}</span>
                  </span>
                </figcaption>
              </figure>
          )}
          </div>
        )}
      </div>
    </section>);

}

/* ======================================================= testimonials: stack */

export function StackTestimonials({ data }: {data: TestimonialsSection;}) {
  const [top, setTop] = useState(0);
  const items = data.items;
  const reduce = useReducedMotion();
  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setTop((t) => (t + 1) % items.length), 5500);
    return () => window.clearInterval(timer);
  }, [items.length]);
  if (!items.length) return null;
  const order = items.map((_, i) => items[(top + i) % items.length]).slice(0, 3);

  return (
    <section id="testimonials" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <Heading eyebrow={data.eyebrow} title={data.title} />
          <button
            type="button"
            onClick={() => setTop((t) => (t + 1) % items.length)}
            className="link-underline group mt-8">

            Next story
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="relative mx-auto h-[22rem] w-full max-w-[30rem]">
          <AnimatePresence initial={false}>
            {order.map((item, depth) =>
            <motion.figure
              key={item.id}
              className="tpl-card absolute inset-0 flex flex-col justify-between border border-ink/10 bg-sand p-8 shadow-xl shadow-black/10"
              style={{ zIndex: 3 - depth }}
              initial={{ opacity: 0, transform: 'translateY(40px) scale(0.9)' }}
              animate={{
                opacity: 1 - depth * 0.25,
                transform: reduce ? 'none' : `translateY(${depth * 18}px) scale(${1 - depth * 0.05}) rotate(${depth * (depth % 2 ? 2 : -2)}deg)`
              }}
              exit={{ opacity: 0, transform: reduce ? 'none' : 'translateX(-120%) rotate(-12deg)' }}
              transition={{ duration: 0.7, ease: EASE_OUT }}>

                <Stars rating={item.rating} />
                <blockquote className="display text-[1.45rem] leading-[1.45] text-ink/90">“{item.quote}”</blockquote>
                <figcaption>
                  <p className="meta text-gold">{item.name}</p>
                  <p className="mt-1 text-xs text-ink/50">{item.location}</p>
                </figcaption>
              </motion.figure>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>);

}

/* =========================================================== journal: list */

export function ListJournal({ data }: {data: JournalSection;}) {
  const trail = useTrailingImage();
  return (
    <section id="journal" className="section-y w-full bg-sand">
      <div className="shell relative" onPointerMove={trail.onMove} onPointerLeave={() => trail.setActive(null)}>
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <ul className="mt-12 border-t border-ink/15">
          {data.items.map((post, i) =>
          <ListRow key={post.id} index={i} onHover={() => trail.setActive(post.image)}>
              <a href="#journal" className="group grid grid-cols-[1fr_auto] items-center gap-6 py-7 md:grid-cols-[10rem_1fr_auto]">
                <span className="meta hidden text-gold md:block">{post.category}</span>
                <span>
                  <span className="display block text-[clamp(1.4rem,2.6vw,2.2rem)] leading-tight text-ink transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-3">
                    {post.title}
                  </span>
                  <span className="body-sm mt-2 block max-w-[40rem] text-ink/55">{post.excerpt}</span>
                </span>
                <span className="meta text-right text-ink/40">
                  {post.date}
                  <br />
                  {post.readTime}
                </span>
              </a>
            </ListRow>
          )}
        </ul>
        {trail.image}
      </div>
    </section>);

}

/* ======================================================== journal: feature */

export function FeatureJournal({ data }: {data: JournalSection;}) {
  const [lead, ...rest] = data.items;
  const media = useMedia();
  const side = useEnter(0.15);
  if (!lead) return null;
  return (
    <section id="journal" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.a {...media} href="#journal" className="tpl-media tpl-zoom group relative block aspect-[4/3] overflow-hidden bg-sand lg:aspect-auto lg:min-h-[30rem]">
            <img src={lead.image} alt={lead.title} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <span className="meta text-gold">{lead.category}</span>
              <span className="display mt-3 block text-[clamp(1.6rem,3vw,2.6rem)] leading-tight">{lead.title}</span>
              <span className="body-sm mt-3 block max-w-[34rem] text-white/75">{lead.excerpt}</span>
            </span>
          </motion.a>
          <motion.div {...side} className="flex flex-col gap-6">
            {rest.map((post) =>
            <a key={post.id} href="#journal" className="tpl-card tpl-lift group flex flex-1 gap-5 overflow-hidden bg-sand p-4">
                <span className="tpl-zoom block w-32 shrink-0 overflow-hidden sm:w-40">
                  <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
                <span className="flex flex-col justify-center py-2">
                  <span className="meta text-gold">{post.category}</span>
                  <span className="display mt-2 text-[1.3rem] leading-snug text-ink">{post.title}</span>
                  <span className="meta mt-3 text-ink/40">{post.readTime}</span>
                </span>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>);

}

/* ============================================================== faq: cards */

export function CardsFaq({ data }: {data: FaqSection;}) {
  const [open, setOpen] = useState<string | null>(data.items[0]?.id ?? null);
  return (
    <section id="faq" className="section-y w-full bg-sand">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {data.items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <FaqCard key={item.id} index={i}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-start justify-between gap-4 text-left">

                  <span className="display text-[1.25rem] leading-snug text-ink">{item.question}</span>
                  <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-[transform,background-color] duration-500 ${isOpen ? 'rotate-45 bg-gold/20' : ''}`}>
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-out)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="body-sm overflow-hidden text-ink/65">
                    <span className="block pt-4">{item.answer}</span>
                  </p>
                </div>
              </FaqCard>);

          })}
        </div>
      </div>
    </section>);

}

function FaqCard({ index, children }: {index: number;children: React.ReactNode;}) {
  const enter = useEnter(index * 0.06);
  return (
    <motion.div {...enter} className="tpl-card self-start border border-ink/10 bg-cream p-6 shadow-sm">
      {children}
    </motion.div>);

}

/* ============================================================= faq: sticky */

export function StickyFaq({ data }: {data: FaqSection;}) {
  const [open, setOpen] = useState<string | null>(data.items[0]?.id ?? null);
  return (
    <section id="faq" className="section-y w-full bg-cream">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading eyebrow={data.eyebrow} title={data.title} />
          <p className="display mt-8 text-[6rem] leading-none text-gold/30">{String(data.items.length).padStart(2, '0')}</p>
        </div>
        <ol>
          {data.items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <li key={item.id} className="border-b border-ink/15">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="group flex w-full items-baseline gap-6 py-7 text-left">

                  <span className={`display text-[2rem] leading-none transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-ink/25 group-hover:text-ink/50'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="display flex-1 text-[1.4rem] leading-snug text-ink">{item.question}</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-out)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="body-base overflow-hidden pl-[4.5rem] text-ink/65">
                    <span className="block pb-7">{item.answer}</span>
                  </p>
                </div>
              </li>);

          })}
        </ol>
      </div>
    </section>);

}

/* =========================================================== newsletter */

function useSubscribe() {
  const { subscribeEmail } = useContent();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await subscribeEmail(email);
      trackLead('newsletter', 'Newsletter signup', { email: email.trim() });
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }
  return { email, setEmail, status, error, submit };
}

export function BannerNewsletter({ data }: {data: NewsletterSection;}) {
  const s = useSubscribe();
  const enter = useEnter();
  return (
    <section id="newsletter" className="w-full bg-emerald py-20 text-cream lg:py-28">
      <motion.div {...enter} className="shell grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="display text-[clamp(2.4rem,6vw,5rem)] leading-[1] text-cream">{data.title}</h2>
          <p className="body-base mt-5 max-w-[32rem] text-cream/70">{data.body}</p>
        </div>
        {s.status === 'done' ?
        <p className="flex items-center gap-2 text-lg text-cream"><CheckIcon className="h-5 w-5 text-gold" /> You’re on the list</p> :

        <form onSubmit={s.submit} className="w-full">
            <label htmlFor="nl-banner" className="sr-only">Email address</label>
            <div className="flex items-center gap-3 border-b-2 border-cream/40 pb-3 transition-colors focus-within:border-gold">
              <input
              id="nl-banner"
              type="email"
              value={s.email}
              onChange={(e) => s.setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-w-0 flex-1 bg-transparent text-xl text-cream outline-none placeholder:text-cream/40" />

              <button type="submit" disabled={s.status === 'loading'} className="meta flex items-center gap-2 text-gold transition-transform duration-300 hover:translate-x-1 disabled:opacity-60">
                {s.status === 'loading' ? 'Adding…' : data.ctaLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
            {s.status === 'error' && <p role="alert" className="mt-3 text-xs text-red-300">{s.error}</p>}
            {data.note && <p className="mt-3 text-xs text-cream/50">{data.note}</p>}
          </form>
        }
      </motion.div>
    </section>);

}

export function GlassNewsletter({ data }: {data: NewsletterSection;}) {
  const s = useSubscribe();
  const { content } = useContent();
  const bg = content.sections.gallery?.items[0]?.image ?? content.sections.promo?.image ?? '';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const enter = useEnter();
  return (
    <section ref={ref} id="newsletter" className="relative w-full overflow-hidden py-24 lg:py-32">
      {bg && <motion.img style={{ y }} src={bg} alt="" aria-hidden className="absolute inset-0 h-[120%] w-full -translate-y-[10%] object-cover" />}
      <div className="absolute inset-0 bg-black/45" />
      <motion.div {...enter} className="shell relative flex justify-center">
        <div className="tpl-glass-panel w-full max-w-[38rem] px-7 py-12 text-center sm:px-12">
          <h2 className="display text-[clamp(2rem,4vw,3rem)] leading-tight text-white">{data.title}</h2>
          <p className="body-base mt-4 text-white/75">{data.body}</p>
          {s.status === 'done' ?
          <p className="mt-8 flex items-center justify-center gap-2 text-white"><CheckIcon className="h-5 w-5 text-gold" /> You’re on the list</p> :

          <form onSubmit={s.submit} className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row">
              <label htmlFor="nl-glass" className="sr-only">Email address</label>
              <input
              id="nl-glass"
              type="email"
              value={s.email}
              onChange={(e) => s.setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-sm text-white outline-none backdrop-blur placeholder:text-white/50 focus:border-gold" />

              <button type="submit" disabled={s.status === 'loading'} className="royal-btn royal-btn-gold h-12 rounded-full py-0 disabled:opacity-60">
                {s.status === 'loading' ? 'Adding…' : data.ctaLabel}
              </button>
            </form>
          }
          {s.status === 'error' && <p role="alert" className="mt-3 text-xs text-red-200">{s.error}</p>}
          {data.note && s.status !== 'done' && <p className="mt-4 text-xs text-white/55">{data.note}</p>}
        </div>
      </motion.div>
    </section>);

}

/* ========================================================== promo: text mask */

export function TextMaskPromo({ data }: {data: PromoSection;}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const pos = useTransform(scrollYProgress, [0, 1], ['50% 0%', '50% 100%']);
  const enter = useEnter(0.1);
  return (
    <section ref={ref} id="promo" className="section-y w-full overflow-hidden bg-cream">
      <div className="shell text-center">
        {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
        {/* The photograph shows through the letters and drifts as the page scrolls. */}
        <motion.h2
          style={{ backgroundImage: `url(${data.image})`, backgroundPosition: pos }}
          className="display mx-auto mt-6 max-w-[70rem] bg-cover bg-clip-text text-[clamp(3rem,10vw,9rem)] font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-transparent [-webkit-background-clip:text]">

          {data.title}
        </motion.h2>
        <motion.div {...enter}>
          <p className="body-base mx-auto mt-8 max-w-[34rem] text-ink/65">{data.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {data.ctaLabel && <a href={data.ctaHref || '#contact'} className="btn btn-primary">{data.ctaLabel}</a>}
            {data.couponCode && <span className="btn border border-dashed border-ink/30 text-ink">{data.couponCode}</span>}
          </div>
        </motion.div>
      </div>
    </section>);

}

/* ======================================================= editorial: sticky */

export function StickyEditorial({ data }: {data: EditorialSection;}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  const a = useEnter();
  const b = useEnter(0.1);
  return (
    <section ref={ref} id="editorial" className="w-full bg-sand">
      <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-0">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center">
          <div className="tpl-media aspect-[4/5] w-full overflow-hidden bg-cream">
            <motion.img style={{ scale }} src={data.image} alt={data.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-16 lg:min-h-[160svh] lg:py-32">
          <motion.div {...a}>
            {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
            <h2 className="display mt-5 text-[clamp(2.2rem,4.4vw,3.75rem)] leading-[1.05] text-ink">{data.title}</h2>
            <p className="body-base mt-6 max-w-[32rem] text-ink/65">{data.body}</p>
          </motion.div>
          <motion.dl {...b} className="grid grid-cols-2 gap-8">
            {[
            [data.stat1Value, data.stat1Label],
            [data.stat2Value, data.stat2Label]].
            map(([value, label]) =>
            <div key={label} className="border-t border-ink/20 pt-5">
                <dt className="sr-only">{label}</dt>
                <dd className="display text-[clamp(2.4rem,5vw,4rem)] leading-none text-gold">{value}</dd>
                <p className="meta mt-3 text-ink/50">{label}</p>
              </div>
            )}
          </motion.dl>
          {data.ctaLabel &&
          <a href={data.ctaHref || '#contact'} className="link-underline group self-start text-ink">
              {data.ctaLabel}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          }
        </div>
      </div>
    </section>);

}

/* ========================================================= gallery: masonry */

export function MasonryGallery({ data }: {data: GallerySection;}) {
  const ratios = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]', 'aspect-[4/3]', 'aspect-[3/4]'];
  return (
    <section id="gallery" className="section-y w-full bg-cream">
      <div className="shell">
        <Heading eyebrow={data.eyebrow} title={data.title} subtitle={data.handle} align="center" />
        <div className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4">
          {data.items.map((item, i) =>
          <MasonryTile key={item.id} index={i} image={item.image} caption={item.caption} ratio={ratios[i % ratios.length]} />
          )}
        </div>
      </div>
    </section>);

}

function MasonryTile({ index, image, caption, ratio }: {index: number;image: string;caption: string;ratio: string;}) {
  const media = useMedia(index % 4 * 0.08);
  return (
    <motion.figure {...media} className={`tpl-media tpl-zoom group relative mb-4 break-inside-avoid overflow-hidden bg-sand ${ratio}`}>
      <img src={image} alt={caption} loading="lazy" className="h-full w-full object-cover" style={{ borderRadius: 0 }} />
      {caption &&
      <figcaption className="meta absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-cream/85 px-3 py-2 text-center text-[10px] text-ink opacity-0 backdrop-blur transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {caption}
        </figcaption>
      }
    </motion.figure>);

}

/* ========================================================== trust: marquee */

const ICONS: Record<IconKey, React.ComponentType<{className?: string;}>> = {
  gem: GemIcon,
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  refresh: RefreshCwIcon,
  award: AwardIcon,
  headset: HeadphonesIcon
};

export function MarqueeTrust({ data }: {data: TrustSection;}) {
  const row = [...data.items, ...data.items, ...data.items, ...data.items];
  return (
    <section id="trust" aria-label={data.title || 'Our promise'} className="tpl-strip-wrap w-full overflow-hidden border-y border-gold/30 bg-ink py-6 text-cream">
      <div className="tpl-strip flex w-max items-center gap-12" style={{ animationDuration: '45s' }}>
        {row.map((item, i) => {
          const Icon = ICONS[item.icon] ?? GemIcon;
          return (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <Icon className="h-5 w-5 text-gold" />
              <span className="display text-[1.4rem]">{item.title}</span>
              <span className="text-gold/60">✦</span>
            </span>);

        })}
      </div>
    </section>);

}
