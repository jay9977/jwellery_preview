import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheckIcon, MessageCircleIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { startEnquiry } from '../../utils/events';
import { trackLead } from '../../utils/leads';
import type { Product } from '../../types/content';

interface QuickViewProps {
  product: Product | null;
  /** Comma separated badges from the Featured section, e.g. "BIS Hallmarked, Certified". */
  trustBadges?: string;
  onClose: () => void;
}

/** `Label: Value` per line → rows. A line with no colon becomes a full-width note. */
function parseSpecs(specs: string): {label: string;value: string;}[] {
  return specs.
  split('\n').
  map((line) => line.trim()).
  filter(Boolean).
  map((line) => {
    const at = line.indexOf(':');
    if (at === -1) return { label: '', value: line };
    return { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() };
  });
}

export function QuickView({ product, trustBadges = '', onClose }: QuickViewProps) {
  const { content } = useContent();

  // Escape closes the dialog, as it does for the search panel.
  useEffect(() => {
    if (!product) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  const specs = product ? parseSpecs(product.specs ?? '') : [];
  const badges = trustBadges.split(',').map((badge) => badge.trim()).filter(Boolean);
  const whatsapp = (content.sections.contact?.whatsapp ?? '').replace(/[^\d]/g, '');

  return (
    <AnimatePresence>
      {product &&
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}>

          <motion.button
          type="button"
          aria-label="Close quick view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/55" />

          <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // Sized to fit a 768px-tall laptop screen without the panel scrolling: the
          // image is a column beside the text on desktop, not a full-width square above it.
          className="relative grid max-h-[88vh] w-full max-w-[46rem] grid-cols-1 overflow-hidden bg-cream sm:max-h-[560px] sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">

            <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-2.5 top-2.5 z-10 bg-cream/90 p-1.5 text-ink/50 transition-colors hover:text-ink">

              <XIcon className="h-[18px] w-[18px]" />
            </button>

            <div className="h-44 bg-sand sm:h-full">
              {product.image &&
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            }
            </div>

            <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-7">
              {product.badge && <p className="eyebrow text-gold">{product.badge}</p>}
              <h2 className={`display display-4 text-ink ${product.badge ? 'mt-2' : ''}`}>{product.name}</h2>
              <p className="meta mt-1.5 text-[10px] text-ink/45">{product.metal}</p>

              {specs.length > 0 &&
            <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4">
                  {specs.map((spec) =>
              <div key={`${spec.label}-${spec.value}`} className="flex gap-3 text-[13px] leading-snug">
                      {spec.label &&
                <dt className="w-24 shrink-0 text-ink/45">{spec.label}</dt>
                }
                      <dd className={`text-ink/80 ${spec.label ? '' : 'w-full'}`}>{spec.value}</dd>
                    </div>
              )}
                </dl>
            }

              {badges.length > 0 &&
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-ink/10 pt-4">
                  {badges.map((badge) =>
              <li key={badge} className="flex items-center gap-1.5 text-[11px] text-emerald">
                      <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0" />
                      {badge}
                    </li>
              )}
                </ul>
            }

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <button
                type="button"
                onClick={() => {
                  onClose();
                  startEnquiry(product.name);
                }}
                className="meta bg-emerald px-4 py-3 text-[10px] text-cream transition-colors hover:bg-emerald-deep">

                  Enquire about this piece
                </button>

                {whatsapp &&
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Hi ${content.brand.name}! I would like to know more about the ${product.name}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackLead('enquiry', `WhatsApp · ${product.name}`, { interest: product.name })}
                className="flex items-center justify-center gap-2 py-1 text-[12px] text-ink/55 transition-colors hover:text-emerald">

                    <MessageCircleIcon className="h-4 w-4" />
                    Ask on WhatsApp
                  </a>
              }
              </div>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
