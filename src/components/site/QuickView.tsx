import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, MinusIcon, PlusIcon, ShieldCheckIcon, TruckIcon, XIcon } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import type { Product } from '../../types/content';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickView({ product, onClose }: QuickViewProps) {
  const { addItem, wishlist, toggleWishlist } = useCart();
  const [qty, setQty] = useState(1);

  const isWished = product ? wishlist.includes(product.id) : false;

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
          className="relative grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-y-auto bg-cream sm:grid-cols-2">
          
            <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-3 top-3 z-10 bg-cream/90 p-2 text-ink/55 transition-colors hover:text-ink">
            
              <XIcon className="h-5 w-5" />
            </button>

            <div className="aspect-square bg-sand">
              {product.image &&
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            }
            </div>

            <div className="flex flex-col p-7 sm:p-9">
              {product.badge && <p className="eyebrow text-gold">{product.badge}</p>}
              <h2 className={`display display-3 text-ink ${product.badge ? 'mt-3' : ''}`}>{product.name}</h2>
              <p className="meta mt-2 text-ink/45">{product.metal}</p>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-xl leading-none text-ink">{product.price}</span>
                {product.compareAt &&
              <span className="text-sm leading-none text-ink/40 line-through">{product.compareAt}</span>
              }
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="flex items-center border border-ink/15">
                  <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-ink/55 transition-colors hover:text-ink">
                  
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-sm leading-none text-ink">{qty}</span>
                  <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2.5 text-ink/55 transition-colors hover:text-ink">
                  
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={isWished}
                className="meta flex items-center gap-2 text-ink/60 transition-colors hover:text-emerald">
                
                  <HeartIcon className={`h-4 w-4 ${isWished ? 'fill-gold text-gold' : ''}`} />
                  {isWished ? 'Saved' : 'Save'}
                </button>
              </div>

              <button
              type="button"
              onClick={() => {
                addItem(product, qty);
                onClose();
              }}
              className="btn btn-primary mt-7 w-full">
              
                Add to bag
              </button>

              <ul className="mt-7 space-y-2.5 border-t border-ink/10 pt-6 text-xs text-ink/60">
                <li className="flex items-center gap-2.5">
                  <ShieldCheckIcon className="h-4 w-4 shrink-0 text-gold" />
                  Certified stone with lifetime servicing
                </li>
                <li className="flex items-center gap-2.5">
                  <TruckIcon className="h-4 w-4 shrink-0 text-gold" />
                  Free insured delivery in 3–5 days
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}