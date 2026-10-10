import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import type { NavItem } from '../../types/content';
import { SearchOverlay } from './SearchOverlay';

/**
 * Where to cut the nav so the two sides of the centred logo weigh the same.
 * Label length stands in for rendered width — same font, same size, so it tracks
 * closely enough — and the search icon is counted on the right. A fixed 3/4 split
 * leaves one side reaching much closer to the logo, which reads as "not centred"
 * even when the logo is exactly in the middle.
 */
function balancedSplit(nav: NavItem[]): number {
  const SEARCH_ICON = 5;
  const weights = nav.map((item) => item.label.length + 3); // + the gap after it
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
 * Smart glass header.
 *   at the top      transparent, tall, announcement bar showing
 *   scrolled        frosted glass (blur + saturation), slimmer, announcement folded away
 *   scrolling down  slides out of the way; any scroll up brings it straight back
 */
export function Header() {
  const { content } = useContent();
  const { brand, nav, announcement } = content;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const split = useMemo(() => balancedSplit(nav), [nav]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // A small dead zone stops the bar flickering on trackpad jitter.
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

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-transform duration-500 [transition-timing-function:var(--ease-out)] ${
      hidden && !open ? '-translate-y-full' : ''}`
      }>

      {announcement.visible &&
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

      <div className={`tpl-header ${scrolled ? 'tpl-header-glass' : ''}`}>
        {/* The side columns are 1fr with min-w-0, which pins them to the same width and
            keeps the auto centre column on the true middle of the bar. */}
        <div
          className={`shell flex items-center gap-4 transition-[height] duration-500 [transition-timing-function:var(--ease-out)] lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          scrolled ? 'h-[64px]' : brand.headerLogo ? 'h-[84px] sm:h-[100px]' : 'h-[84px]'}`
          }>

          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="-ml-2 p-2 text-ink">

              <MenuIcon className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Main" className="hidden min-w-0 items-center gap-6 lg:flex xl:gap-8">
            {nav.slice(0, split).map((item) =>
            <a key={item.id} href={item.href} className="tpl-nav-link eyebrow text-ink/70 hover:text-ink">
                {item.label}
              </a>
            )}
          </nav>

          {/* The centre of the bar is the logo when one is set, and the store name in the
              page's own typeface when it is not — never both. */}
          <a href="#top" className="flex flex-1 flex-col items-center gap-1 lg:flex-none lg:px-3">
            {brand.headerLogo ?
            <img
              src={brand.headerLogo}
              alt={brand.name}
              style={{ height: scrolled ? Math.min(brand.headerLogoHeight, 44) : brand.headerLogoHeight }}
              className="max-h-9 w-auto max-w-[180px] object-contain transition-[height] duration-500 sm:max-h-none sm:max-w-[280px]" /> :

            <>
                <span
                className={`display text-center leading-tight text-ink transition-[font-size] duration-500 sm:whitespace-nowrap ${
                scrolled ? 'text-[20px] sm:text-[24px]' : 'text-[22px] sm:text-[30px] xl:text-[32px]'}`
                }>

                  {brand.name}
                </span>
                <span
                className={`meta hidden whitespace-nowrap text-[9px] text-ink/45 transition-opacity duration-300 sm:block ${
                scrolled ? 'h-0 opacity-0' : 'opacity-100'}`
                }>

                  {brand.tagline}
                </span>
              </>
            }
          </a>

          <div className="flex min-w-0 items-center justify-end gap-0.5 lg:gap-1">
            <nav aria-label="Secondary" className="mr-3 hidden items-center gap-6 lg:flex xl:gap-8">
              {nav.slice(split).map((item) =>
              <a key={item.id} href={item.href} className="tpl-nav-link eyebrow text-ink/70 hover:text-ink">
                  {item.label}
                </a>
              )}
            </nav>

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-[background-color,color] duration-200 hover:bg-ink/5 hover:text-ink">

              <SearchIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: a full-screen glass sheet, links arriving one after another. */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="tpl-glass-sheet fixed inset-0 z-50 flex flex-col lg:hidden">

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
              className="display flex items-baseline gap-4 border-b border-ink/10 py-4 text-[2rem] leading-none text-ink">

                  <span className="meta text-[10px] text-gold">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </motion.a>
            )}
            </nav>
          </motion.div>
        }
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>);

}
