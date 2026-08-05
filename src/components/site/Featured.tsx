import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon } from 'lucide-react';
import type { FeaturedSection, Product } from '../../types/content';
import { SectionHeading } from './SectionHeading';
import { QuickView } from './QuickView';
import { onQuickView, startEnquiry } from '../../utils/events';

export function Featured({ data }: {data: FeaturedSection;}) {
  const [quickView, setQuickView] = useState<Product | null>(null);

  // Header search can ask for a piece by id — open its quick view here, where the
  // product data already lives.
  useEffect(
    () =>
    onQuickView((productId) => {
      const match = data.items.find((item) => item.id === productId);
      if (match) setQuickView(match);
    }),
    [data.items]
  );

  return (
    <section id="featured" className="section-y w-full bg-sand/55">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        {data.items.length === 0 ?
        <p className="body-base mt-12 text-center text-ink/50">
            No products yet — add them from the admin panel.
          </p> :

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
            {data.items.map((product, i) =>
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group flex flex-col bg-cream">

                <div className="relative aspect-square overflow-hidden">
                  <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

                  {product.badge &&
              <span className="meta absolute left-0 top-4 bg-emerald px-3 py-1.5 text-cream">
                      {product.badge}
                    </span>
              }
                  <button
                type="button"
                onClick={() => setQuickView(product)}
                className="meta absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-ink/70 py-3.5 text-cream opacity-0 transition-opacity group-hover:opacity-100">

                    <EyeIcon className="h-3.5 w-3.5" />
                    Quick view
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="display display-4 text-ink">{product.name}</h3>
                  <p className="meta mt-1.5 text-ink/45">{product.metal}</p>

                  {/* Enquiry, not checkout: the price is settled in conversation. A slim
                      outline that fills on hover carries the card without shouting. */}
                  <div className="mt-auto pt-5">
                    <button
                  type="button"
                  onClick={() => startEnquiry(product.name)}
                  className="meta w-full border border-ink/20 py-2.5 text-[10px] text-ink/75 transition-colors hover:border-emerald hover:bg-emerald hover:text-cream">

                      {data.enquiryLabel || 'Enquire now'}
                    </button>
                  </div>
                </div>
              </motion.article>
          )}
          </div>
        }

      </div>

      <QuickView product={quickView} trustBadges={data.trustBadges} onClose={() => setQuickView(null)} />
    </section>);

}
