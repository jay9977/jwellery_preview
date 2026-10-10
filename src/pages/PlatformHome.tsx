import React, { useEffect, useRef, useState } from 'react';
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
  RocketIcon,
  SmartphoneIcon,
  SparklesIcon,
  StoreIcon,
  XIcon,
  type LucideIcon } from
'lucide-react';
import { PALETTES } from '../data/palettes';

/**
 * The platform's own homepage (Kothari IT). Shown on any address that has no client
 * website — localhost without ?site=, and the platform's own domain in production.
 */

const CONTACT_EMAIL = 'info@kothariit.com';
const display = "font-['Cormorant_Garamond',Georgia,serif]";

const IMG = {
  hero: '/42249ea0-d991-43cd-ab3a-09084d8b829f.jpg',
  bridal: '/78ca5a4c-1b01-4e4f-9196-50934d1ac47c.jpg',
  a: '/5f2ce6fe-ae11-47f6-bdd7-492c795e26db.jpg',
  b: '/1b9349e0-3204-4747-9fdd-6f4f9d4ae1b2.jpg',
  c: '/9060c6ae-43da-47e8-8157-2aa34f885062.jpg',
  d: '/da864486-67e2-4b70-ab54-7d4cccabd89b.jpg',
  e: '/d1067c91-5550-49a5-9a10-babd26de23d2.jpg',
  f: '/b3114d75-2704-4097-998c-0ee579e1e09a.jpg'
};

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

const NAV = [
['Features', '#features'],
['Showcase', '#showcase'],
['How it works', '#how'],
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
['02', 'We design it for you', 'Your website is generated with your brand, colours and copy, then polished by our team.'],
['03', 'Go live & grow', 'Connect your domain, share the link on WhatsApp and Instagram, and watch enquiries arrive.']];


const PLANS: {name: string;period: string;note: string;featured?: boolean;}[] = [
{ name: 'Starter', period: '1 month', note: 'Try the platform with a full website.' },
{ name: 'Growth', period: '6 months', note: 'For stores building a steady online presence.' },
{ name: 'Signature', period: '1 year', note: 'Best value for a serious jewellery brand.', featured: true }];


const PLAN_INCLUDES = [
'Complete jewellery website',
'AI-written headlines & content',
'Custom domain + free HTTPS',
'Leads & enquiry desk',
'Editor access + support'];


const FAQS: [string, string][] = [
['Do I need any technical knowledge?', 'No. We set up the website for you. Afterwards you can edit text and photos from a simple editor, or simply message us and we will do it.'],
['Can I use my existing domain?', 'Yes. Point your domain to us with two DNS records — we share the exact steps — and HTTPS is switched on automatically.'],
['What happens when my plan ends?', 'Your website pauses and shows a polite “back soon” page. Nothing is deleted — renew and everything is restored instantly.'],
['Can I change the design later?', 'Anytime. Colours, fonts, sections, photos and wording can all be changed whenever you like.']];


const MARQUEE = ['Bridal sets', 'Polki', 'Kundan', 'Solitaires', 'Temple jewellery', 'Gold bangles', 'Diamond rings', 'Silver', 'Mangalsutra', 'Jhumkas'];

function quote(plan?: string) {
  const subject = plan ? `Website enquiry — ${plan} plan` : 'Jewellery website enquiry';
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

const goldBtn =
'kit-cta inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e2c27d] via-[#c9a45c] to-[#a8823a] px-6 py-3 text-sm font-semibold text-[#16120e]';
const ghostBtn =
'kit-cta inline-flex items-center justify-center gap-2 rounded-full border border-[#f3e6c8]/25 px-6 py-3 text-sm font-semibold text-[#f3e6c8] hover:bg-white/5';

export function PlatformHome() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f4ee] font-['Inter',system-ui,sans-serif] text-[#1c1712] [scroll-behavior:smooth]">
      {/* ---------- nav ---------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || menu ? 'bg-[#16120e]/90 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-transparent'}`
        }>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 text-[#f3e6c8]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#e2c27d] to-[#9c7633] text-sm font-bold tracking-tight text-[#16120e]">
              KIT
            </span>
            <span className="leading-none">
              <span className={`${display} block text-xl font-semibold`}>Kothari IT</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#f3e6c8]/50">Jewellery websites</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(([name, href]) =>
            <a key={href} href={href} className="text-sm text-[#f3e6c8]/70 transition-colors duration-200 hover:text-[#e2c27d]">
                {name}
              </a>
            )}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a href="/admin-login" className="text-sm font-medium text-[#f3e6c8]/80 hover:text-white">
              Login
            </a>
            <a href="#contact" className={`${goldBtn} px-5 py-2.5`}>
              Get your website
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            className="rounded-md p-2 text-[#f3e6c8] md:hidden">

            {menu ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        {menu &&
        <nav className="flex flex-col gap-1 border-t border-white/10 px-5 pb-5 pt-2 md:hidden">
            {[...NAV, ['Login', '/admin-login']].map(([name, href]) =>
          <a key={href} href={href} onClick={() => setMenu(false)} className="rounded-md px-2 py-2.5 text-[#f3e6c8]/80 hover:bg-white/5">
                {name}
              </a>
          )}
            <a href="#contact" onClick={() => setMenu(false)} className={`${goldBtn} mt-2`}>
              Get your website
            </a>
          </nav>
        }
      </header>

      {/* ---------- hero ---------- */}
      <section id="top" className="relative overflow-hidden bg-[#16120e] pb-24 pt-32 text-[#f3e6c8] sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[#c9a45c]/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#7a5a2a]/25 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#e2c27d_1px,transparent_1px)] [background-size:28px_28px]" />


        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e2c27d]/30 bg-[#e2c27d]/10 px-3.5 py-1.5 text-xs font-medium text-[#e2c27d]">
                <SparklesIcon className="h-3.5 w-3.5" />
                The website platform built for jewellers
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className={`${display} mt-6 text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl`}>
                Your jewellery store,{' '}
                <span className="bg-gradient-to-r from-[#f1d898] via-[#d4ae64] to-[#a8823a] bg-clip-text italic text-transparent">
                  beautifully online
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#f3e6c8]/65 sm:text-lg">
                A luxury website for your showroom — designed, written and launched for you. Your colours, your
                collections, your domain. Ready to share in a day.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap gap-3">
              <a href="#contact" className={goldBtn}>
                Get your website
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a href="/?site=giriraj" target="_blank" rel="noreferrer" className={ghostBtn}>
                See a live store
              </a>
            </Reveal>
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#f3e6c8]/60">
              {['Live in 24 hours', 'Free HTTPS', 'Mobile-first design'].map((t) =>
              <span key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[#c9a45c]" />
                  {t}
                </span>
              )}
            </Reveal>
          </div>

          {/* browser mockup */}
          <Reveal delay={200} className="relative">
            <div className="kit-float relative rounded-2xl bg-[#241d16] p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-black/30 px-3 py-1 text-[11px] text-[#f3e6c8]/50">
                  <LockIcon className="h-3 w-3" />
                  yourjewellers.com
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                <img src={IMG.hero} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#e2c27d]">The Bridal Edit</p>
                  <p className={`${display} mt-1 text-3xl text-white`}>Crafted for your forever</p>
                </div>
              </div>
            </div>
            <div className="kit-float absolute -bottom-6 -left-6 hidden rounded-xl bg-white p-3 text-[#1c1712] shadow-xl sm:block [animation-delay:-2s]">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c9a45c]/15 text-[#a8823a]">
                  <SparklesIcon className="h-4 w-4" />
                </span>
                Content written by AI
              </p>
            </div>
            <div className="kit-float absolute -right-4 -top-5 hidden rounded-xl bg-white p-3 text-[#1c1712] shadow-xl sm:block [animation-delay:-4s]">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <BarChart3Icon className="h-4 w-4" />
                </span>
                New enquiry received
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="kit-marquee-wrap overflow-hidden border-y border-[#e2c27d]/20 bg-[#1c1712] py-4" aria-hidden>
        <div className="kit-marquee flex w-max gap-10">
          {[...MARQUEE, ...MARQUEE].map((word, i) =>
          <span key={i} className={`${display} flex items-center gap-10 whitespace-nowrap text-2xl italic text-[#e2c27d]/80`}>
              {word}
              <span className="text-sm not-italic text-[#e2c27d]/40">✦</span>
            </span>
          )}
        </div>
      </div>

      {/* ---------- features ---------- */}
      <section id="features" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a8823a]">Everything included</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Built for how jewellery sells</h2>
            <p className="mt-4 text-[#1c1712]/60">
              Not a generic template. Every part is made for showrooms, bridal collections and customers who want to
              visit in person.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, title, text], i) =>
            <Reveal key={title} as="article" delay={i % 3 * 80}>
                <div className="kit-lift group h-full rounded-2xl border border-[#1c1712]/10 bg-white p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16120e] text-[#e2c27d] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:-rotate-6">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`${display} mt-5 text-2xl font-semibold`}>{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1c1712]/60">{text}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- showcase ---------- */}
      <section id="showcase" className="scroll-mt-20 bg-[#efe8dc] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a8823a]">Showcase</p>
              <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Websites that feel like your showroom</h2>
            </Reveal>
            <Reveal delay={100}>
              <a href="/?site=giriraj" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#8a6a2c]">
                Visit Giriraj Jewellers
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-6 md:grid-rows-2">
            {[
            { src: IMG.bridal, label: 'Bridal collections', cls: 'md:col-span-3 md:row-span-2 aspect-[4/5] md:aspect-auto' },
            { src: IMG.a, label: 'Product catalogue', cls: 'md:col-span-3 aspect-[16/9]' },
            { src: IMG.e, label: 'Featured pieces', cls: 'md:col-span-2 aspect-square' },
            { src: IMG.f, label: 'Gallery', cls: 'md:col-span-1 aspect-square' }].
            map((tile, i) =>
            <Reveal key={tile.label} unveil delay={i * 120} className={`${tile.cls} relative`}>
                <a href="/?site=giriraj" target="_blank" rel="noreferrer" className="kit-zoom group relative block h-full overflow-hidden rounded-2xl">
                  <img src={tile.src} alt={tile.label} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className={`${display} absolute bottom-4 left-5 text-xl text-white`}>{tile.label}</span>
                </a>
              </Reveal>
            )}
          </div>

          <Reveal className="mt-16">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className={`${display} text-3xl font-medium`}>{PALETTES.length}+ palettes, made for gold &amp; gems</h3>
              <p className="text-sm text-[#1c1712]/55">Switch your entire look in one click.</p>
            </div>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {PALETTES.slice(0, 12).map((p, i) =>
            <Reveal key={p.id} delay={i % 6 * 50}>
                <div className="kit-lift rounded-xl border border-[#1c1712]/10 bg-white p-2.5">
                  <div className="flex h-16 overflow-hidden rounded-lg">
                    {[p.colors.accent, p.colors.accentDeep, p.colors.gold, p.colors.sand, p.colors.cream].map((c, j) =>
                  <span key={j} className="flex-1" style={{ background: c }} />
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a8823a]">How it works</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>From showroom to online in three steps</h2>
          </Reveal>
          <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
            <span aria-hidden className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[#c9a45c]/50 to-transparent md:block" />
            {STEPS.map(([n, title, text], i) =>
            <Reveal key={n} as="li" delay={i * 120} className="relative">
                <div className="kit-lift h-full rounded-2xl border border-[#1c1712]/10 bg-white p-7 text-center">
                  <span className={`${display} mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#16120e] text-2xl text-[#e2c27d] ring-8 ring-[#f7f4ee]`}>
                    {n}
                  </span>
                  <h3 className={`${display} mt-5 text-2xl font-semibold`}>{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1c1712]/60">{text}</p>
                </div>
              </Reveal>
            )}
          </ol>
        </div>
      </section>

      {/* ---------- plans ---------- */}
      <section id="plans" className="relative scroll-mt-20 overflow-hidden bg-[#16120e] py-24 text-[#f3e6c8] sm:py-32">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[#c9a45c]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e2c27d]">Plans</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Simple plans. Everything included.</h2>
            <p className="mt-4 text-[#f3e6c8]/60">Pick how long you want to start with — renew anytime, nothing is ever lost.</p>
          </Reveal>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {PLANS.map((plan, i) =>
            <Reveal key={plan.name} delay={i * 100}>
                <div
                className={`kit-lift relative flex h-full flex-col rounded-2xl p-8 ${
                plan.featured ?
                'border border-[#e2c27d]/60 bg-gradient-to-b from-[#2c241b] to-[#1c1712]' :
                'border border-white/10 bg-white/[0.03]'}`
                }>

                  {plan.featured &&
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-[#e2c27d] to-[#a8823a] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#16120e]">
                      Best value
                    </span>
                }
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e2c27d]">{plan.name}</p>
                  <p className={`${display} mt-3 text-5xl font-medium text-white`}>{plan.period}</p>
                  <p className="mt-3 text-sm text-[#f3e6c8]/55">{plan.note}</p>
                  <ul className="mt-8 space-y-3 text-sm">
                    {PLAN_INCLUDES.map((item) =>
                  <li key={item} className="flex items-start gap-2.5 text-[#f3e6c8]/80">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a45c]" />
                        {item}
                      </li>
                  )}
                  </ul>
                  <div className="flex-1" />
                  <a href={quote(plan.name)} className={`${plan.featured ? goldBtn : ghostBtn} mt-10 w-full`}>
                    Get pricing
                  </a>
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a8823a]">FAQ</p>
            <h2 className={`${display} mt-3 text-4xl font-medium sm:text-5xl`}>Questions jewellers ask us</h2>
            <p className="mt-4 text-[#1c1712]/60">
              Anything else? Write to{' '}
              <a href={quote()} className="font-medium text-[#8a6a2c] underline-offset-4 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) =>
            <Reveal key={q} delay={i * 70}>
                <details className="group rounded-2xl border border-[#1c1712]/10 bg-white px-6 py-5 transition-colors duration-200 open:border-[#c9a45c]/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDownIcon className="h-5 w-5 shrink-0 text-[#a8823a] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#1c1712]/60">{a}</p>
                </details>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------- contact CTA ---------- */}
      <section id="contact" className="scroll-mt-20 px-5 pb-24 sm:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#16120e] px-8 py-16 text-center text-[#f3e6c8] sm:px-16 sm:py-20">
            <img src={IMG.d} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#16120e] via-[#16120e]/80 to-[#3a2c18]/70" />
            <div className="relative">
              <StoreIcon className="mx-auto h-10 w-10 text-[#e2c27d]" />
              <h2 className={`${display} mx-auto mt-5 max-w-2xl text-4xl font-medium sm:text-6xl`}>
                Let’s put your showroom online
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[#f3e6c8]/65">
                Tell us your store name and city — we will send you a preview of your website.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a href={quote()} className={goldBtn}>
                  <MailIcon className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </a>
                <a href="/?site=giriraj" target="_blank" rel="noreferrer" className={ghostBtn}>
                  <RocketIcon className="h-4 w-4" />
                  See a live example
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-[#1c1712]/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-[#1c1712]/55 sm:px-8">
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#16120e] text-[10px] font-bold text-[#e2c27d]">KIT</span>
            © {new Date().getFullYear()} Kothari IT. Websites for jewellers.
          </p>
          <div className="flex gap-6">
            <a href={quote()} className="hover:text-[#1c1712]">
              Contact
            </a>
            <a href="/admin-login" className="hover:text-[#1c1712]">
              Client login
            </a>
          </div>
        </div>
      </footer>
    </div>);

}
