import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, HeartIcon } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import type { FeaturedSection, Product } from '../../types/content';
import { SectionHeading } from './SectionHeading';
import { QuickView } from './QuickView';

export function Featured({ data }: {data: FeaturedSection;}) {
  const { addItem, wishlist, toggleWishlist } = useCart();
  const [quickView, setQuickView] = useState<Product | null>(null);

  return (
    <section id="featured" className="section-y w-full bg-sand/55">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        {data.items.length === 0 ?
        <p className="body-base mt-12 text-center text-ink/50">
            No products yet — add them from the admin panel.
          </p> :

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
            {data.items.map((product, i) => {
            const isWished = wishlist.includes(product.id);
            return (
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
                    aria-label={`${isWished ? 'Remove' : 'Save'} ${product.name}`}
                    aria-pressed={isWished}
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-cream/90 transition-opacity hover:text-emerald ${
                    isWished ? 'text-gold opacity-100' : 'text-ink/60 opacity-0 group-hover:opacity-100'}`
                    }>
                    
                      <HeartIcon className={`h-4 w-4 ${isWished ? 'fill-gold' : ''}`} />
                    </button>
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
                    <div className="mt-4 flex items-baseline gap-2.5">
                      <span className="text-[15px] leading-none text-ink">{product.price}</span>
                      {product.compareAt &&
                    <span className="text-xs leading-none text-ink/40 line-through">{product.compareAt}</span>
                    }
                    </div>
                    <div className="mt-auto pt-6">
                      <button
                      type="button"
                      onClick={() => addItem(product)}
                      className="btn btn-outline btn-sm w-full hover:border-emerald hover:bg-emerald hover:text-cream">
                      
                        Add to bag
                      </button>
                    </div>
                  </div>
                </motion.article>);

          })}
          </div>
        }

        {data.ctaLabel &&
        <div className="mt-12 flex justify-center lg:mt-14">
            <button type="button" className="btn btn-outline">
              {data.ctaLabel}
            </button>
          </div>
        }
      </div>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </section>);

}