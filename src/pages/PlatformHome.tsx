import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue } from
'framer-motion';
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  PaletteIcon,
  PencilRulerIcon,
  SmartphoneIcon,
  SparklesIcon,
  StoreIcon,
  XIcon,
  type LucideIcon } from
'lucide-react';
import { PALETTES } from '../data/palettes';
import { TEMPLATES } from '../data/templates';
import { Magnetic } from '../components/site/templates/Magnetic';

/**
 * The platform's own homepage (Kothari IT). Shown on any address that has no client
 * website — localhost without ?site=, and the platform's own domain in production.
 */

const CONTACT_EMAIL = 'info@kothariit.com';
const display = "font-['Cormorant_Garamond',Georgia,serif]";
const EASE = [0.23, 1, 0.32, 1] as const;

/* Photography from Unsplash (credited in the footer), served at the size each slot needs. */
const PHOTO = {
  necklaceSet: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed', 'Vaibhav Nagare'],
  necklaceBust: ['https://images.unsplash.com/photo-1600862754152-80a263dd564f', 'Hiya Jewellery'],
  kundanBracelet: ['https://images.unsplash.com/photo-1638617501607-5dfb8b079ebf', 'Hemant Latawa'],
  pendant: ['https://images.unsplash.com/photo-1724937721228-f7bf3df2a4d8', 'One Carat Store'],
  diamondRings: ['https://images.unsplash.com/photo-1583937443566-6fe1a1c6e400', 'engin akyurt'],
  goldRings: ['https://images.unsplash.com/photo-1543294001-f7cd5d7fb516', 'Cornelia Ng'],
  ringBox: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e', 'Sabrianna'],
  earrings: ['https://images.unsplash.com/photo-1665159882377-385d68d2bdff', 'Mahbod Akhzami'],
  bride: ['https://images.unsplash.com/photo-1625139108082-48bb424c2333', 'rajat sarki'],
  bride2: ['https://images.unsplash.com/photo-1610173826014-d131b02d69ca', 'Alok Verma']
} as const;
const img = (key: keyof typeof PHOTO, w: number) => `${PHOTO[key][0]}?auto=format&fit=crop&q=80&w=${w}`;

const shot = (id: string) => `/kit/templates/${id}.jpg`;

/** Marks the element visible the first time it scrolls into view — never re-animates. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-visible', '');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -80px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({
  as: Tag = 'div',
  delay = 0,
  unveil = false,
  className = '',
  children




}: {as?: 'div' | 'li' | 'article';delay?: number;unveil?: boolean;className?: string;children: React.ReactNode;}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`${unveil ? 'kit-unveil' : 'kit-reveal'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>

      {children}
    </Tag>);

}

/** Counts up from zero the first time it is seen. */
function Count({ to, suffix = '' }: {to: number;suffix?: string;}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!seen || !el) return;
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      }
    });
    return () => controls.stop();
  }, [seen, to, suffix, reduce]);
  return <span ref={ref}>0{suffix}</span>;
}

const NAV = [
['Templates', '#templates'],
['Features', '#features'],
['Showcase', '#showcase'],
['Plans', '#plans'],
['FAQ', '#faq']];


const FEATURES: [LucideIcon, string, string][] = [
[SparklesIcon, 'AI-written content', 'Headlines, punch lines, collections and FAQs written for your shop, your city and your style.'],
[PaletteIcon, 'Luxury colour palettes', 'Curated palettes and font pairs made for fine jewellery — switch the whole look in one click.'],
[GlobeIcon, 'Your own domain', 'Live on yourname.com with free HTTPS. A free subdomain from day one while the domain connects.'],
[BarChart3Icon, 'Leads & enquiries', 'Every visitor, enquiry and newsletter signup lands in your leads desk with what they looked at.'],
[SmartphoneIcon, 'Made for mobile', 'Most jewellery buyers browse on their phone. Every page is designed for it first.'],
[PencilRulerIcon, 'Edit everything yourself', 'Change photos, prices, sections and colours from a simple editor — or let our team do it for you.']];


const STEPS: [string, string, string][] = [
['01', 'Tell us about your store', 'Your shop name, city, speciality and the look you love. That is all we need to begin.'],
['02', 'We design it for you', 'Pick the design you love. Your site is built with your brand, colours and copy, then polished by our team.'],
['03', 'Go live & grow', 'Connect your domain, share the link on WhatsApp and Instagram, and watch enquiries arrive.']];


const PLANS: {name: string;period: string;note: string;featured?: boolean;}[] = [
{ name: 'Starter', period: '1 month', note: 'Try the platform with a full website.' },
{ name: 'Growth', period: '6 months', note: 'For stores building a steady online presence.' },
{ name: 'Signature', period: '1 year', note: 'Best value for a serious jewellery brand.', featured: true }];


const PLAN_INCLUDES = [
'Complete jewellery website',
'Choice of designer templates',
'Custom domain + free HTTPS',
'Leads & enquiry desk',
'Editor access + support'];


const FAQS: [string, string][] = [
['Do I need any technical knowledge?', 'No. We set up the website for you. Afterwards you can edit text and photos from a simple editor, or simply message us and we will do it.'],
['Can I use my existing domain?', 'Yes. Point your domain to us with two DNS records — we share the exact steps — and HTTPS is switched on automatically.'],
['What happens when my plan ends?', 'Your website pauses and shows a polite “back soon” page. Nothing is deleted — renew and everything is restored instantly.'],
['Can I change the design later?', 'Anytime. Switch to another template, or change colours, fonts, sections, photos and wording whenever you like.']];


const MARQUEE = ['Bridal sets', 'Polki', 'Kundan', 'Solitaires', 'Temple jewellery', 'Gold bangles', 'Diamond rings', 'Silver', 'Mangalsutra', 'Jhumkas'];

function quote(plan?: string) {
  const subject = plan ? `Website enquiry — ${plan} plan` : 'Jewellery website enquiry';
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

const goldBtn =
'kit-cta inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0c2ae] via-[#e0a891] to-[#b5705a] px-6 py-3 text-sm font-semibold text-[#0f1629]';
const ghostBtn =
'kit-cta inline-flex items-center justify-center gap-2 rounded-full border border-[#f6ece8]/25 px-6 py-3 text-sm font-semibold text-[#f6ece8] hover:bg-white/5';

/* ================================================================== hero */

function useDepth(sx: MotionValue<number>, sy: MotionValue<number>, d: number) {
  return { x: useTransform(sx, (v) => v * -d), y: useTransform(sy, (v) => v * -d) };
}

function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const rotX = useTransform(sy, [-0.5, 0.5], [-7, 7]);
  // Each layer drifts by its own depth — the near jewels move most.
  const near = useDepth(sx, sy, 46);
  const mid = useDepth(sx, sy, 26);
  const far = useDepth(sx, sy, 12);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [mx, my, reduce]);

  const enter = (delay: number) => ({
    initial: { opacity: 0, transform: 'translateY(40px) scale(0.96)' },
    animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    transition: { duration: 1.2, ease: EASE, delay }
  });

  return (
    <motion.div ref={ref} style={{ y: sceneY }} className="relative mx-auto aspect-[5/4] w-full max-w-[40rem] [perspective:1600px]">
      <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="relative h-full w-full [transform-style:preserve-3d]">
        {/* the site, in a browser */}
        <motion.div style={far} className="absolute inset-x-[4%] top-[6%]">
          <motion.div {...enter(0.2)} className="overflow-hidden rounded-2xl bg-[#1a2340] shadow-[0_50px_120px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-black/30 px-3 py-1 text-[11px] text-[#f6ece8]/50">
                <LockIcon className="h-3 w-3" />
                yourjewellers.com
              </span>
            </div>
            <img src={shot('royal')} alt="A jewellery website built with the Royal Heritage template" className="aspect-[16/10] w-full object-cover object-top" />
          </motion.div>
        </motion.div>

        {/* the same platform, on a phone */}
        <motion.div style={mid} className="absolute -bottom-[4%] right-[-2%] w-[30%]">
          <motion.div {...enter(0.45)} className="rotate-[6deg] overflow-hidden rounded-[1.6rem] border-[6px] border-[#0f1629] bg-black shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8)]">
            <img src={shot('m-celeste')} alt="The Celeste template on a phone" className="aspect-[500/1080] w-full object-cover object-top" />
          </motion.div>
        </motion.div>

        {/* jewels floating in front */}
        <motion.div style={near} className="absolute -left-[6%] bottom-[2%] w-[26%]">
          <motion.div {...enter(0.6)}>
            <div className="kit-float overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-[#f0c2ae]/40 [animation-delay:-1s]">
              <img src={img('ringBox', 420)} alt="" className="aspect-square w-full object-cover" />
            </div>
          </motion.div>
        </motion.div>
        <motion.div style={near} className="absolute -top-[6%] right-[8%] w-[20%]">
          <motion.div {...enter(0.75)}>
            <div className="kit-float overflow-hidden rounded-full shadow-2xl shadow-black/60 ring-1 ring-[#f0c2ae]/40 [animation-delay:-3s]">
              <img src={img('pendant', 360)} alt="" className="aspect-square w-full object-cover" />
            </div>
          </motion.div>
        </motion.div>

        {/* little glass notes */}
        <motion.div style={mid} className="absolute left-[2%] top-[-2%] hidden sm:block">
          <motion.div {...enter(0.9)} className="kit-glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e0a891]/25 text-[#f0c2ae]"><SparklesIcon className="h-4 w-4" /></span>
            Designer templates
          </motion.div>
        </motion.div>
        <motion.div style={mid} className="absolute bottom-[18%] left-[24%] hidden sm:block">
          <motion.div {...enter(1.05)} className="kit-glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-400/20 text-green-300"><BarChart3Icon className="h-4 w-4" /></span>
            New enquiry received
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>);

}

/* ============================================================ templates */

function TemplateShowcase() {
  const list = TEMPLATES.filter((t) => t.id !== 'original');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number>();
  // Only the autoplay scrolls the list; scrolling under a resting pointer would select
  // whatever name slid beneath it.
  const fromAutoplay = useRef(false);
  const current = list[active];

  // Walk through the designs on its own; any pointer over the section holds it still.
  useEffect(() => {
    if (paused || reduce) return;
    const timer = window.setTimeout(() => {
      fromAutoplay.current = true;
      setActive((i) => (i + 1) % list.length);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduce, list.length]);

  // Keep the chosen name in view inside its own scrolling list (never the page).
  useEffect(() => {
    if (!fromAutoplay.current) return;
    fromAutoplay.current = false;
    const box = listRef.current;
    const item = box?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (!box || !item) return;
    const horizontal = box.scrollWidth > box.clientWidth + 4;
    if (horizontal) box.scrollTo({ left: item.offsetLeft - box.clientWidth / 2 + item.clientWidth / 2, behavior: 'smooth' });
    else box.scrollTo({ top: item.offsetTop - box.clientHeight / 2 + item.clientHeight / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <section
      id="templates"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative scroll-mt-20 overflow-hidden bg-[#0f1629] py-24 text-[#f6ece8] sm:py-32">

      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#e0a891]/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0c2ae]">Designer templates</p>
          <h2 className={`${display} mt-3 text-4xl font-medium sm:text-6xl`}>
            A design that is <span className="italic text-[#f0c2ae]">only yours</span>
          </h2>
          <p className="mt-5 text-[#f6ece8]/60">
            Every store gets its own design. Once it is yours, no other jeweller on the platform can use it.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-14">
          {/* the names */}
          <div
            ref={listRef}
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:block lg:max-h-[34rem] lg:overflow-y-auto lg:px-0 lg:pb-0 lg:[mask-image:linear-gradient(transparent,black_8%,black_92%,transparent)] [&::-webkit-scrollbar]:hidden">

            {list.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.id}
                  data-i={i}
                  type="button"
                  onClick={() => setActive(i)}
                  // Hover chooses a design only once the pointer rests on it.
                  onPointerEnter={() => {
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => setActive(i), 150);
                  }}
                  onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                  aria-pressed={on}
                  className={`group shrink-0 rounded-full border px-4 py-2 text-left transition-colors duration-300 lg:block lg:w-full lg:rounded-none lg:border-0 lg:border-b lg:border-white/10 lg:px-0 lg:py-4 ${
                  on ? 'border-[#f0c2ae] bg-[#f0c2ae]/10 lg:bg-transparent' : 'border-white/15'}`
                  }>

                  <span className="flex items-baseline gap-4">
                    <span
                      className={`${display} whitespace-nowrap text-lg transition-[color,transform] duration-500 [transition-timing-function:var(--ease-out)] lg:text-[1.9rem] lg:leading-tight ${
                      on ? 'text-[#f0c2ae] lg:translate-x-2' : 'text-white/55 group-hover:text-white'}`
                      }>

                      {t.name}
                    </span>
                  </span>
                  {on &&
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-2 hidden pl-2 text-sm leading-relaxed text-white/55 lg:block">

                      {t.description}
                    </motion.span>
                  }
                </button>);

            })}
          </div>

          {/* the preview */}
          <div>
            <div className="group relative overflow-hidden rounded-2xl bg-[#1a2340] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex flex-1 items-center gap-1.5 truncate rounded-md bg-black/30 px-3 py-1 text-[11px] text-white/45">
                  <LockIcon className="h-3 w-3 shrink-0" />
                  yourjewellers.com
                </span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* Every design is loaded once and only its opacity changes, so a quick sweep
                    across the names never stacks half-faded images. */}
                {list.map((t, i) =>
                <img
                  key={t.id}
                  src={shot(t.id)}
                  alt={i === active ? `${t.name} design` : ''}
                  aria-hidden={i !== active}
                  data-active={i === active || undefined}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 [transition-timing-function:var(--ease-out)] ${
                  i === active ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'}`
                  } />

                )}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <p className={`${display} text-2xl lg:hidden`}>{current.name}</p>
              <span className="h-px flex-1 overflow-hidden bg-white/10">
                {!paused && !reduce &&
                <motion.span
                  key={active}
                  className="block h-full origin-left bg-gradient-to-r from-[#f0c2ae] to-[#c98b74]"
                  initial={{ transform: 'scaleX(0)' }}
                  animate={{ transform: 'scaleX(1)' }}
                  transition={{ duration: 4.2, ease: 'linear' }} />

                }
              </span>
            </div>
            <p className="mt-3 text-sm text-white/55 lg:hidden">{current.description}</p>
          </div>
        </div>
      </div>
    </section>);

}

/* ====================================================== feature card glow */

function SpotCard({ children }: {children: React.ReactNode;}) {
  return (
    <div
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--x', `${e.clientX - box.left}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY - box.top}px`);
      }}
      className="kit-spot kit-lift group h-full rounded-2xl border border-[#141c33]/10 bg-white p-7">

      {children}
    </div>);

}

/* ====================================================== how it works */

function Steps() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return (
    <ol ref={ref} className="relative mt-16 grid gap-6 md:grid-cols-3">
      <span aria-hidden className="absolute left-0 right-0 top-10 hidden h-px bg-[#141c33]/10 md:block" />
      <motion.span
        aria-hidden
        style={{ scaleX: line }}
        className="absolute left-0 right-0 top-10 hidden h-px origin-left bg-gradient-to-r from-[#f0c2ae] via-[#e0a891] to-[#b5705a] md:block" />

      {STEPS.map(([n, title, text], i) =>
      <Reveal key={n} as="li" delay={i * 140} className="relative">
          <div className="kit-lift h-full rounded-2xl border border-[#141c33]/10 bg-white p-7 text-center">
            <span className={`${display} mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0f1629] text-2xl text-[#f0c2ae] ring-8 ring-[#fbf6f3]`}>
              {n}
            </span>
            <h3 className={`${display} mt-5 text-2xl font-semibold`}>{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#141c33]/60">{text}</p>
          </div>
        </Reveal>
      )}
    </ol>);

}

/* ============================================================== CTA */

function ContactBand() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', reduce ? '-12%' : '12%']);
  return (
    <section ref={ref} id="contact" className="scroll-mt-20 px-5 pb-24 sm:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0f1629] px-8 py-20 text-center text-[#f6ece8] sm:px-16 sm:py-28">
          <motion.img style={{ y }} src={img('bride2', 1800)} alt="" aria-hidden className="absolute inset-0 h-[125%] w-full object-cover object-[50%_30%] opacity-45" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#0f1629] via-[#0f1629]/75 to-[#2b2346]/40" />
          <div className="relative">
            <StoreIcon className="mx-auto h-10 w-10 text-[#f0c2ae]" />
            <h2 className={`${display} mx-auto mt-5 max-w-2xl text-4xl font-medium sm:text-6xl`}>Let’s put your showroom online</h2>
            <p className="mx-auto mt-4 max-w-lg text-[#f6ece8]/70">Tell us your store name and city — we will send you a preview of your website.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <a href={quote()} className={goldBtn}>
                  <MailIcon className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </Reveal>
    </section>);

}

/* ============================================================== page */

export function PlatformHome() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const prev = document.title;
    document.title = 'KIT · Jewellery websites by Kothari IT';
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.title = prev;
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fbf6f3] font-['Inter',system-ui,sans-serif] text-[#141c33] [scroll-behavior:smooth]">
      <motion.div aria-hidden style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#f0c2ae] to-[#b5705a]" />

      {/* ---------- nav ---------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || menu ? 'bg-[#0f1629]/75 shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent'}`
        }>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 text-[#f6ece8]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0c2ae] to-[#b07560] text-sm font-bold tracking-tight text-[#0f1629]">
              KIT
            </span>
            <span className="leading-none">
              <span className={`${display} block text-xl font-semibold`}>Kothari IT</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#f6ece8]/50">Jewellery websites</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(([name, href]) =>
            <a key={href} href={href} className="tpl-nav-link text-sm text-[#f6ece8]/70 hover:text-[#f0c2ae]">
                {name}
              </a>
            )}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a href="/admin-login" className="text-sm font-medium text-[#f6ece8]/80 hover:text-white">Login</a>
            <Magnetic>
              <a href="#contact" className={`${goldBtn} px-5 py-2.5`}>Get your website</a>
            </Magnetic>
          </div>
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            className="rounded-md p-2 text-[#f6ece8] md:hidden">

            {menu ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        {menu &&
        <nav className="flex flex-col gap-1 border-t border-white/10 px-5 pb-5 pt-2 md:hidden">
            {[...NAV, ['Login', '/admin-login']].map(([name, href]) =>
          <a key={href} href={href} onClick={() => setMenu(false)} className="rounded-md px-2 py-2.5 text-[#f6ece8]/80 hover:bg-white/5">
                {name}
              </a>
          )}
            <a href="#contact" onClick={() => setMenu(false)} className={`${goldBtn} mt-2`}>Get your website</a>
          </nav>
        }
      </header>

      {/* ---------- hero ---------- */}
      <section id="top" className="relative overflow-hidden bg-[#0f1629] pb-28 pt-32 text-[#f6ece8] sm:pt-40">
        <div aria-hidden className="kit-aurora pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#f0c2ae_1px,transparent_1px)] [background-size:28px_28px]" />


        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f0c2ae]/30 bg-[#f0c2ae]/10 px-3.5 py-1.5 text-xs font-medium text-[#f0c2ae]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f0c2ae]" />
                The website platform built for jewellers
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className={`${display} mt-6 text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-[5.25rem]`}>
                Your jewellery store,{' '}
                <span className="kit-shine bg-gradient-to-r from-[#f7d3c4] via-[#fff1ea] to-[#b5705a] bg-clip-text italic text-transparent">
                  beautifully online
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#f6ece8]/65 sm:text-lg">
                A luxury website for your showroom — designed, written and launched for you. Designer templates, your
                colours, your collections, your domain. Ready to share in a day.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap gap-3">
              <Magnetic>
                <a href="#contact" className={goldBtn}>
                  Get your website
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#templates" className={ghostBtn}>See the templates</a>
              </Magnetic>
            </Reveal>
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#f6ece8]/60">
              {['Live in 24 hours', 'Free HTTPS', 'Mobile-first design'].map((t) =>
              <span key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[#e0a891]" />
                  {t}
                </span>
              )}
            </Reveal>
          </div>

          <HeroScene />
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="kit-marquee-wrap overflow-hidden border-y border-[#f0c2ae]/20 bg-[#141c33] py-4" aria-hidden>
        <div className="kit-marquee flex w-max gap-10">
          {[...MARQUEE, ...MARQUEE].map((word, i) =>
          <span key={i} className={`${display} flex items-center gap-10 whitespace-nowrap text-2xl italic text-[#f0c2ae]/80`}>
              {word}
              <span className="text-sm not-italic text-[#f0c2ae]/40">✦</span>
            </span>
          )}
        </div>
      </div>

      {/* ---------- numbers ---------- */}
      <section className="border-b border-[#141c33]/10 bg-[#fbf6f3] py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 sm:grid-cols-3 sm:px-8">
          {[
          [40, '+', 'Colour palettes'],
          [24, 'h', 'From brief to live'],
          [100, '%', 'Mobile-first']].
          map(([n, s, label], i) =>
          <Reveal key={String(label)} delay={i * 90} className="text-center">
              <p className={`${display} text-6xl font-medium text-[#141c33] sm:text-7xl`}>
                <Count to={Number(n)} suffix={String(s)} />
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b5705a]">{label}</p>
            </Reveal>
          )}
        </div>
      </section>

      <TemplateShowcase />

      {/* ---------- features ---------- */}
      <section id="features" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b5705a]">Everything included</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Built for how jewellery sells</h2>
            <p className="mt-4 text-[#141c33]/60">
              Not a generic template. Every part is made for showrooms, bridal collections and customers who want to visit in
              person.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, title, text], i) =>
            <Reveal key={title} as="article" delay={i % 3 * 80}>
                <SpotCard>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f1629] text-[#f0c2ae] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`${display} relative mt-5 text-2xl font-semibold`}>{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[#141c33]/60">{text}</p>
                </SpotCard>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- showcase ---------- */}
      <section id="showcase" className="scroll-mt-20 bg-[#f4e8e3] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b5705a]">Showcase</p>
              <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Your pieces, shown the way they deserve</h2>
            </Reveal>
          </div>

          <div className="mt-14 grid grid-flow-dense auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[230px]">
            {[
            { k: 'necklaceSet' as const, label: 'Bridal sets', cls: 'col-span-2 row-span-2' },
            { k: 'ringBox' as const, label: 'Engagement rings', cls: '' },
            { k: 'kundanBracelet' as const, label: 'Kundan & polki', cls: '' },
            { k: 'bride' as const, label: 'As worn', cls: 'row-span-2' },
            { k: 'earrings' as const, label: 'Earrings', cls: '' },
            { k: 'necklaceBust' as const, label: 'Temple gold', cls: 'col-span-2' },
            { k: 'goldRings' as const, label: 'Gold & diamonds', cls: 'col-span-2 md:col-span-1' }].
            map((tile, i) =>
            <Reveal key={tile.k} unveil delay={i * 110} className={`${tile.cls} relative`}>
                <figure className="kit-zoom group relative h-full overflow-hidden rounded-2xl">
                  <img src={img(tile.k, 900)} alt={tile.label} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  <figcaption className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <span className={`${display} text-2xl text-white transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-1`}>{tile.label}</span>
                    <ArrowRightIcon className="h-5 w-5 -translate-x-2 text-[#f0c2ae] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>

          <Reveal className="mt-16">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className={`${display} text-3xl font-medium`}>{PALETTES.length}+ palettes, made for gold &amp; gems</h3>
              <p className="text-sm text-[#141c33]/55">Switch your entire look in one click.</p>
            </div>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {PALETTES.slice(0, 12).map((p, i) =>
            <Reveal key={p.id} delay={i % 6 * 50}>
                <div className="kit-lift group rounded-xl border border-[#141c33]/10 bg-white p-2.5">
                  <div className="flex h-16 overflow-hidden rounded-lg">
                    {[p.colors.accent, p.colors.accentDeep, p.colors.gold, p.colors.sand, p.colors.cream].map((c, j) =>
                  <span key={j} className="flex-1 transition-[flex-grow] duration-500 group-hover:[&:nth-child(3)]:flex-[2.2]" style={{ background: c }} />
                  )}
                  </div>
                  <p className="mt-2 truncate px-0.5 text-xs font-medium">{p.name}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b5705a]">How it works</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>From showroom to online in three steps</h2>
          </Reveal>
          <Steps />
        </div>
      </section>

      {/* ---------- plans ---------- */}
      <section id="plans" className="relative scroll-mt-20 overflow-hidden bg-[#0f1629] py-24 text-[#f6ece8] sm:py-32">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[#e0a891]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0c2ae]">Plans</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Simple plans. Everything included.</h2>
            <p className="mt-4 text-[#f6ece8]/60">Pick how long you want to start with — renew anytime, nothing is ever lost.</p>
          </Reveal>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {PLANS.map((plan, i) =>
            <Reveal key={plan.name} delay={i * 100}>
                <div
                className={`kit-lift relative flex h-full flex-col rounded-2xl p-8 ${
                plan.featured ? 'kit-border-glow border border-[#f0c2ae]/60 bg-gradient-to-b from-[#222d52] to-[#141c33]' : 'border border-white/10 bg-white/[0.03]'}`
                }>

                  {plan.featured &&
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-[#f0c2ae] to-[#b5705a] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0f1629]">
                      Best value
                    </span>
                }
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f0c2ae]">{plan.name}</p>
                  <p className={`${display} mt-3 text-5xl font-medium text-white`}>{plan.period}</p>
                  <p className="mt-3 text-sm text-[#f6ece8]/55">{plan.note}</p>
                  <ul className="mt-8 space-y-3 text-sm">
                    {PLAN_INCLUDES.map((item) =>
                  <li key={item} className="flex items-start gap-2.5 text-[#f6ece8]/80">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e0a891]" />
                        {item}
                      </li>
                  )}
                  </ul>
                  <div className="flex-1" />
                  <a href={quote(plan.name)} className={`${plan.featured ? goldBtn : ghostBtn} mt-10 w-full`}>Get pricing</a>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- faq ---------- */}
      <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b5705a]">FAQ</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Questions jewellers ask us</h2>
            <p className="mt-4 text-[#141c33]/60">
              Anything else? Write to{' '}
              <a href={quote()} className="font-medium text-[#a25f4b] underline-offset-4 hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) =>
            <Reveal key={q} delay={i * 70}>
                <details className="group rounded-2xl border border-[#141c33]/10 bg-white px-6 py-5 transition-colors duration-200 open:border-[#e0a891]/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDownIcon className="h-5 w-5 shrink-0 text-[#b5705a] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#141c33]/60">{a}</p>
                </details>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <ContactBand />

      {/* ---------- footer ---------- */}
      <footer className="border-t border-[#141c33]/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-[#141c33]/55 sm:px-8">
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f1629] text-[10px] font-bold text-[#f0c2ae]">KIT</span>
            © {new Date().getFullYear()} Kothari IT. Websites for jewellers.
          </p>
          <div className="flex gap-6">
            <a href={quote()} className="hover:text-[#141c33]">Contact</a>
            <a href="/admin-login" className="hover:text-[#141c33]">Client login</a>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-7xl px-5 text-[11px] text-[#141c33]/40 sm:px-8">
          Photography on Unsplash by {Object.values(PHOTO).map(([, name]) => name).join(', ')}.
        </p>
      </footer>
    </div>);

}
