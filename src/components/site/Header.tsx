import { useState } from 'react';
import { HeartIcon, MenuIcon, SearchIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { useCart } from '../../hooks/useCart';

export function Header() {
  const { content } = useContent();
  const { count, openCart, wishlist } = useCart();
  const { brand, nav, announcement } = content;
  const [open, setOpen] = useState(false);

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
            side wider than its share stretches its column and drags the wordmark off centre. */}
        <div className="shell flex h-[72px] items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-ml-2 p-2 text-ink">

              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
            {brand.headerLogo &&
            <a href="#top" aria-label={brand.name} className="ml-1 flex shrink-0 items-center">
                {/* max-h keeps a tall logo from crowding the small screen, whatever
                    height is set for the desktop bar. */}
                <img
                src={brand.headerLogo}
                alt=""
                style={{ height: brand.headerLogoHeight }}
                className="max-h-8 w-auto max-w-[76px] object-contain" />

              </a>
            }
          </div>

          <div className="hidden min-w-0 items-center gap-5 lg:flex xl:gap-7">
            {brand.headerLogo &&
            <a href="#top" aria-label={brand.name} className="flex shrink-0 items-center">
                <img
                src={brand.headerLogo}
                alt=""
                style={{ height: brand.headerLogoHeight }}
                className="w-auto max-w-[110px] object-contain xl:max-w-[150px]" />

              </a>
            }
            <nav aria-label="Main" className="flex items-center gap-5 xl:gap-7">
              {nav.slice(0, 3).map((item, index) =>
              <a
                key={item.id}
                href={item.href}
                className={`eyebrow whitespace-nowrap text-ink/65 transition-colors hover:text-emerald ${
                // Between lg and xl the logo leaves room for two links only; the third
                // would reach the wordmark. It stays available in the mobile menu.
                index === 2 && brand.headerLogo ? 'hidden xl:block' : ''}`
                }>

                  {item.label}
                </a>
              )}
            </nav>
          </div>

          {/* The centred wordmark stays the store name in the page's own typeface; the
              image logo sits at the start of the bar. The horizontal padding widens this
              centre column so the nav is pushed outward instead of creeping up to it. */}
          <a href="#top" className="flex flex-1 flex-col items-center gap-1 lg:flex-none lg:px-3">
            {/* Wrapping is fine on a phone, where the bar is short of room anyway; from
                sm up the wordmark stays on one line so the bar keeps its height. */}
            <span className="display text-center text-[22px] leading-tight text-ink sm:whitespace-nowrap sm:text-[28px] xl:text-[30px]">
              {brand.name}
            </span>
            <span className="meta hidden whitespace-nowrap text-[9px] text-ink/45 sm:block">{brand.tagline}</span>
          </a>

          <div className="flex min-w-0 items-center justify-end gap-0.5 lg:gap-1">
            <nav aria-label="Secondary" className="mr-1 hidden items-center gap-4 xl:flex xl:gap-5">
              {nav.slice(3).map((item) =>
              <a key={item.id} href={item.href} className="eyebrow text-ink/65 transition-colors hover:text-emerald">
                  {item.label}
                </a>
              )}
            </nav>

            <button type="button" aria-label="Search" className="p-2 text-ink/65 transition-colors hover:text-emerald">
              <SearchIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              aria-label={`Wishlist, ${wishlist.length} saved`}
              className="relative hidden p-2 text-ink/65 transition-colors hover:text-emerald sm:block">
              
              <HeartIcon className="h-[18px] w-[18px]" />
              {wishlist.length > 0 &&
              <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-medium leading-none text-ink">
                  {wishlist.length}
                </span>
              }
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}
              className="relative p-2 text-ink/65 transition-colors hover:text-emerald">
              
              <ShoppingBagIcon className="h-[18px] w-[18px]" />
              {count > 0 &&
              <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald px-1 text-[9px] font-medium leading-none text-cream">
                  {count}
                </span>
              }
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
    </header>);

}