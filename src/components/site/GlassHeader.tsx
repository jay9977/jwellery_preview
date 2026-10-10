import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import type { HeaderStyle } from '../../data/templates';
import type { NavItem } from '../../types/content';
import { SearchOverlay } from './SearchOverlay';

/** Where to cut the nav so the two sides of a centred logo weigh the same. */
function balancedSplit(nav: NavItem[]): number {
  const SEARCH_ICON = 5;
  const weights = nav.map((item) => item.label.length + 3);
  const total = weights.reduce((sum, w) => sum + w, 0) + SEARCH_ICON;
  let best = Math.ceil(nav.length / 2);
  let bestDiff = Infinity;
  let left = 0;
  for (let i = 1; i < nav.length; i++) {
    left += weights[i - 1];
    const diff = Math.abs(left - (total - left));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

/**
 * Smart glass header for the templates, in four arrangements:
 *   center   logo in the middle, nav balanced either side
 *   left     logo left, nav and an enquiry pill on the right
 *   minimal  "Menu" · logo · search — every link lives in a full-screen sheet
 *   pill     a floating glass capsule that never touches the edges
 * All of them are clear at the top, frosted once the page moves under them, slide away
 * while scrolling down and come straight back on any scroll up.
 */
export function GlassHeader({ variant }: {variant: Exclude<HeaderStyle, 'original'>;}) {
  const { content } = useContent();
  const { brand, nav, announcement } = content;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const split = useMemo(() => balancedSplit(nav), [nav]);
  const pill = variant === 'pill';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 480);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const link = (item: NavItem) =>
  <a key={item.id} href={item.href} className="tpl-nav-link eyebrow text-ink/70 hover:text-ink">
      {item.label}
    </a>;


  const logo =
  <a href="#top" className="flex shrink-0 flex-col items-center gap-0.5">
      {brand.headerLogo ?
    <img
      src={brand.headerLogo}
      alt={brand.name}
      style={{ height: scrolled || pill ? Math.min(brand.headerLogoHeight, 40) : brand.headerLogoHeight }}
      className="max-h-9 w-auto max-w-[180px] object-contain transition-[height] duration-500 sm:max-h-none sm:max-w-[260px]" /> :

    <span
      className={`display whitespace-nowrap leading-tight text-ink transition-[font-size] duration-500 ${
      scrolled || pill ? 'text-[20px] sm:text-[23px]' : 'text-[22px] sm:text-[30px]'}`
      }>

          {brand.name}
        </span>
    }
    </a>;


  const searchButton =
  <button
    type="button"
    aria-label="Search"
    onClick={() => setSearchOpen(true)}
    className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-[background-color,color] duration-200 hover:bg-ink/5 hover:text-ink">

      <SearchIcon className="h-[18px] w-[18px]" />
    </button>;


  const menuButton = (always: boolean) =>
  <button
    type="button"
    aria-label="Open menu"
    aria-expanded={open}
    onClick={() => setOpen(true)}
    className={`-ml-2 flex items-center gap-2 p-2 text-ink ${always ? '' : 'lg:hidden'}`}>

      <MenuIcon className="h-5 w-5" />
      {always && <span className="eyebrow hidden sm:inline">Menu</span>}
    </button>;


  const enquire =
  <a
    href="#contact"
    className="hidden rounded-full bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-cream transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-gold lg:inline-flex">

      Enquire
    </a>;


  const height = scrolled ? 'h-[64px]' : 'h-[84px]';
  let bar;
  if (variant === 'center') {
    bar =
    <div className={`shell flex items-center gap-4 transition-[height] duration-500 lg:grid lg:grid-cols-[1fr_auto_1fr] ${height}`}>
        <div className="flex items-center lg:hidden">{menuButton(false)}</div>
        <nav aria-label="Main" className="hidden min-w-0 items-center gap-7 lg:flex">{nav.slice(0, split).map(link)}</nav>
        <div className="flex flex-1 justify-center lg:flex-none lg:px-3">{logo}</div>
        <div className="flex min-w-0 items-center justify-end gap-1">
          <nav aria-label="Secondary" className="mr-3 hidden items-center gap-7 lg:flex">{nav.slice(split).map(link)}</nav>
          {searchButton}
        </div>
      </div>;

  } else if (variant === 'left') {
    bar =
    <div className={`shell flex items-center justify-between gap-6 transition-[height] duration-500 ${height}`}>
        <div className="flex items-center gap-2">
          {menuButton(false)}
          {logo}
        </div>
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="mr-4 hidden items-center gap-7 lg:flex">{nav.map(link)}</nav>
          {searchButton}
          {enquire}
        </div>
      </div>;

  } else if (variant === 'minimal') {
    bar =
    <div className={`shell grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500 ${height}`}>
        <div>{menuButton(true)}</div>
        {logo}
        <div className="flex justify-end">{searchButton}</div>
      </div>;

  } else {
    bar =
    <div className="px-3 pt-3 sm:px-5">
        <div className="tpl-header-glass mx-auto flex h-[60px] max-w-5xl items-center justify-between gap-4 rounded-full border border-ink/10 pl-6 pr-2">
          <div className="flex items-center gap-1">
            {menuButton(false)}
            {logo}
          </div>
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">{nav.slice(0, 5).map(link)}</nav>
          <div className="flex items-center gap-1">
            {searchButton}
            {enquire}
          </div>
        </div>
      </div>;

  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-transform duration-500 [transition-timing-function:var(--ease-out)] ${
      hidden && !open ? '-translate-y-full' : ''}`
      }>

      {announcement.visible && !pill &&
      <div
        className={`grid bg-emerald text-cream transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-out)] ${
        scrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`
        }>

          <div className="overflow-hidden">
            <div className="shell flex flex-col items-center justify-center gap-1.5 py-2.5 text-center sm:flex-row sm:gap-4">
              <p className="eyebrow text-cream/85">{announcement.message}</p>
              {announcement.linkLabel &&
            <a href="#newsletter" className="eyebrow text-gold underline underline-offset-4">
                  {announcement.linkLabel}
                </a>
            }
            </div>
          </div>
        </div>
      }

      {pill ? bar : <div className={`tpl-header ${scrolled ? 'tpl-header-glass' : ''}`}>{bar}</div>}

      {/* Full-screen glass menu — phones for every style, desktop too for 'minimal'. */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`tpl-glass-sheet fixed inset-0 z-50 flex flex-col ${variant === 'minimal' ? '' : 'lg:hidden'}`}>

            <div className="shell flex h-[84px] items-center justify-between">
              <span className="display text-[22px] text-ink">{brand.name}</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="-mr-2 p-2 text-ink">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center gap-1 pb-24">
              {nav.map((item, i) =>
            <motion.a
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, transform: 'translateY(24px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.08 + i * 0.05 }}
              className="display group flex items-baseline gap-4 border-b border-ink/10 py-4 text-[clamp(2rem,5vw,3.5rem)] leading-none text-ink">

                  <span className="meta text-[10px] text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-2">{item.label}</span>
                </motion.a>
            )}
            </nav>
          </motion.div>
        }
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>);

}
