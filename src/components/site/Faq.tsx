import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon } from 'lucide-react';
import type { FaqSection } from '../../types/content';

export function Faq({ data }: {data: FaqSection;}) {
  const [openId, setOpenId] = useState<string | null>(data.items[0]?.id ?? null);

  return (
    <section id="faq" className="section-y w-full bg-cream">
      <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-16">
        <div>
          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          <h2 className={`display display-2 text-ink ${data.eyebrow ? 'mt-4' : ''}`}>{data.title}</h2>
        </div>

        <dl className="border-t border-ink/10">
          {data.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="border-b border-ink/10">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left">
                    
                    <span className="display display-4 text-ink">{item.question}</span>
                    <span className="mt-1 shrink-0 text-emerald">
                      {isOpen ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                    </span>
                  </button>
                </dt>
                <AnimatePresence initial={false}>
                  {isOpen &&
                  <motion.dd
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden">
                    
                      <p className="body-sm max-w-[42rem] pb-6 text-ink/65">{item.answer}</p>
                    </motion.dd>
                  }
                </AnimatePresence>
              </div>);

          })}
        </dl>
      </div>
    </section>);

}