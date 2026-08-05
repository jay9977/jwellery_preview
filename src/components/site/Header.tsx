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
          </div>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {nav.slice(0, 3).map((item) =>
            <a key={item.id} href={item.href} className="eyebrow text-ink/65 transition-colors hover:text-emerald">
                {item.label}
              </a>
            )}
          </nav>

          <a href="#top" className="flex flex-1 flex-col items-center gap-1 lg:flex-none">
            {brand.logo ?
            <img
              src={brand.logo}
              alt={brand.name}
              style={{ height: brand.logoHeight }}
              className="w-auto max-w-[220px] object-contain sm:max-w-[280px]" /> :

            <span className="display text-[26px] leading-none text-ink sm:text-[30px]">{brand.name}</span>
            }
            <span className="meta hidden text-[9px] text-ink/45 sm:block">{brand.tagline}</span>
          </a>

          <div className="flex items-center justify-end gap-0.5 lg:gap-1">
            <nav aria-label="Secondary" className="mr-4 hidden items-center gap-7 xl:flex">
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