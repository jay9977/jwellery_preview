import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export function CartDrawer() {
  const { isOpen, closeCart, lines, setQty, removeItem, totalLabel, clear } = useCart();

  return (
    <AnimatePresence>
      {isOpen &&
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <motion.button
          type="button"
          aria-label="Close bag"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="absolute inset-0 bg-ink/50" />
        
          <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-full w-full max-w-md flex-col bg-cream">
          
            <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-ink/10 px-6">
              <h2 className="display text-[1.625rem] leading-none text-ink">Your bag</h2>
              <button
              type="button"
              onClick={closeCart}
              aria-label="Close bag"
              className="-mr-2 p-2 text-ink/55 transition-colors hover:text-ink">
              
                <XIcon className="h-5 w-5" />
              </button>
            </header>

            {lines.length === 0 ?
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <ShoppingBagIcon className="h-8 w-8 text-ink/20" />
                <p className="body-sm text-ink/55">Your bag is empty. Add a piece you love.</p>
                <button type="button" onClick={closeCart} className="btn btn-outline btn-sm">
                  Continue browsing
                </button>
              </div> :

          <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {lines.map((line) =>
              <li key={line.id} className="flex gap-4 py-5">
                      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden bg-sand">
                        {line.image && <img src={line.image} alt={line.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="display display-4 truncate text-ink">{line.name}</p>
                            <p className="meta mt-1 text-ink/45">{line.metal}</p>
                          </div>
                          <button
                      type="button"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => removeItem(line.id)}
                      className="-mr-1 -mt-1 p-1 text-ink/30 transition-colors hover:text-red-600">
                      
                            <Trash2Icon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-ink/15">
                            <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        onClick={() => setQty(line.id, line.qty - 1)}
                        className="px-2.5 py-2 text-ink/55 transition-colors hover:text-ink">
                        
                              <MinusIcon className="h-3 w-3" />
                            </button>
                            <span className="min-w-7 text-center text-sm leading-none text-ink">{line.qty}</span>
                            <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => setQty(line.id, line.qty + 1)}
                        className="px-2.5 py-2 text-ink/55 transition-colors hover:text-ink">
                        
                              <PlusIcon className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm text-ink">{line.price}</span>
                        </div>
                      </div>
                    </li>
              )}
                </ul>

                <footer className="shrink-0 border-t border-ink/10 px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="meta text-ink/55">Subtotal</span>
                    <span className="display text-[1.625rem] leading-none text-ink">{totalLabel}</span>
                  </div>
                  <p className="mt-2 text-xs text-ink/45">Insured shipping and taxes calculated at checkout.</p>
                  <button type="button" className="btn btn-primary mt-5 w-full">
                    Proceed to checkout
                  </button>
                  <button
                type="button"
                onClick={clear}
                className="meta mt-3 w-full py-2 text-ink/45 transition-colors hover:text-ink">
                
                    Empty bag
                  </button>
                </footer>
              </>
          }
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}