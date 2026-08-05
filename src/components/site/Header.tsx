import { useState } from 'react';
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { SearchOverlay } from './SearchOverlay';

export function Header() {
  const { content } = useContent();
  const { brand, nav, announcement } = content;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {announcement.visible &&
      <div className="bg-emerald text-cream">
          <div className="shell flex flex-col items-center justify-center gap-1.5 py-2.5 text-center sm:flex-row sm:gap-4">
            <p className="eyebrow text-cream/85">{announcement.message}</p>
            {announcement.linkLabel &&
          <a href="#newsletter" className="eyebrow text-gold underline underline-offset-4">
                {announcement.linkLabel}
              </a>
          }
          </div>
        </div>
      }

      <div className="border-b border-ink/10 bg-cream/95 backdrop-blur">
        {/* The side columns are 1fr with min-w-0, which pins them to the same width and
            keeps the auto centre column on the true middle of the bar. Without min-w-0 a
            side wider than its share stretches its column and drags the centre off. */}
        {/* A picture logo needs air around it or it reads as a sticker stuck on the bar,
            so the row grows when one is set. Text sits fine in the tighter 72px bar. */}
        <div
          className={`shell flex items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          brand.headerLogo ? 'h-[76px] sm:h-[92px]' : 'h-[72px]'}`
          }>
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-ml-2 p-2 text-ink">

              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>

          <nav aria-label="Main" className="hidden min-w-0 items-center gap-7 lg:flex">
            {nav.slice(0, 3).map((item) =>
            <a key={item.id} href={item.href} className="eyebrow text-ink/65 transition-colors hover:text-emerald">
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
              style={{ height: brand.headerLogoHeight }}
              // Only the phone caps the height — on every other screen the admin slider
              // is what decides, so changing it there actually changes the header.
              className="max-h-9 w-auto max-w-[180px] object-contain sm:max-h-none sm:max-w-[280px]" /> :

            <>
                <span className="display text-center text-[22px] leading-tight text-ink sm:whitespace-nowrap sm:text-[28px] xl:text-[30px]">
                  {brand.name}
                </span>
                <span className="meta hidden whitespace-nowrap text-[9px] text-ink/45 sm:block">
                  {brand.tagline}
                </span>
              </>
            }
          </a>

          <div className="flex min-w-0 items-center justify-end gap-0.5 lg:gap-1">
            <nav aria-label="Secondary" className="mr-3 hidden items-center gap-6 xl:flex xl:gap-7">
              {nav.slice(3).map((item) =>
              <a key={item.id} href={item.href} className="eyebrow text-ink/65 transition-colors hover:text-emerald">
                  {item.label}
                </a>
              )}
            </nav>

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink/65 transition-colors hover:text-emerald">

              <SearchIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {open &&
        <nav aria-label="Mobile" className="border-t border-ink/10 bg-cream lg:hidden">
            <div className="shell py-2">
              {nav.map((item) =>
            <a
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="meta block border-b border-ink/5 py-3.5 text-ink/75 last:border-0">

                  {item.label}
                </a>
            )}
            </div>
          </nav>
        }
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>);

}
