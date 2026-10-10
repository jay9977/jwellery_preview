import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { socialIcon, usableSocialLinks } from '../../data/social';

/** `wordmark` adds the huge brand name the newer templates close on; the original design has none. */
export function Footer({ wordmark = false }: {wordmark?: boolean;}) {
  const { content } = useContent();
  const { brand, footer } = content;
  const social = usableSocialLinks(footer.social);

  return (
    <footer className={`section-y-sm w-full bg-ink text-cream ${wordmark ? 'overflow-hidden' : ''}`}>
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-xs">
            {brand.footerLogo ?
            // The footer band is dark, so the logo gets a light plaque to sit on —
            // without it a logo with its own white background reads as a stray box.
            <span className="inline-flex rounded-sm bg-cream p-3">
                <img
                src={brand.footerLogo}
                alt={brand.name}
                style={{ height: brand.footerLogoHeight }}
                className="w-auto max-w-[220px] object-contain" />

              </span> :

            <p className="display text-[1.625rem] leading-none">{brand.name}</p>
            }
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

        {wordmark &&
        <motion.p
          aria-hidden
          initial={{ opacity: 0, transform: 'translateY(40%)' }}
          whileInView={{ opacity: 1, transform: 'translateY(0%)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="display mt-16 select-none whitespace-nowrap bg-gradient-to-b from-cream/25 to-cream/0 bg-clip-text text-center text-[clamp(3rem,13vw,12rem)] leading-[0.85] text-transparent">

            {brand.name}
          </motion.p>
        }

        <div className={`${wordmark ? 'mt-6' : 'mt-12'} flex flex-col-reverse items-center justify-between gap-4 border-t border-cream/10 pt-6 sm:flex-row`}>
          <p className="text-xs text-cream/45">{footer.copyright}</p>
          {social.length > 0 &&
          <ul className="flex flex-wrap items-center justify-center gap-2">
              {social.map((link) => {
              const Icon = socialIcon(link.platform);
              return (
                <li key={link.id}>
                    <a
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer"
                    title={link.label}
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center border border-cream/20 text-cream/70 transition-colors hover:border-gold hover:text-gold">

                      <Icon className="h-4 w-4" />
                    </a>
                  </li>);

            })}
            </ul>
          }
        </div>
      </div>
    </footer>);

}