import { Link } from 'react-router-dom';
import { InstagramIcon, PhoneIcon } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

export function Footer() {
  const { content } = useContent();
  const { brand, footer } = content;

  return (
    <footer className="section-y-sm w-full bg-ink text-cream">
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-xs">
            <p className="display text-[1.625rem] leading-none">{brand.name}</p>
            <p className="body-sm mt-4 text-cream/55">{footer.about}</p>
            <a
              href={`tel:${brand.phone.replace(/\s/g, '')}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-gold">
              
              <PhoneIcon className="h-4 w-4" />
              {brand.phone}
            </a>
          </div>

          {footer.columns.map((column) =>
          <nav key={column.id} aria-label={column.title}>
              <h3 className="eyebrow text-cream/45">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) =>
              <li key={link.id}>
                    {link.href.startsWith('/') ?
                <Link to={link.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                        {link.label}
                      </Link> :

                <a href={link.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                        {link.label}
                      </a>
                }
                  </li>
              )}
              </ul>
            </nav>
          )}
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-cream/10 pt-6 sm:flex-row">
          <p className="text-xs text-cream/45">{footer.copyright}</p>
          <a
            href="#top"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center border border-cream/20 text-cream/70 transition-colors hover:border-gold hover:text-gold">
            
            <InstagramIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>);

}