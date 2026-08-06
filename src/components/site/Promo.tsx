import { motion } from 'framer-motion';
import { TagIcon } from 'lucide-react';
import type { PromoSection } from '../../types/content';

export function Promo({ data }: {data: PromoSection;}) {
  return (
    <section id="promo" className="section-y w-full bg-cream">
      <div className="shell">
        <div className="grid grid-cols-1 items-stretch overflow-hidden bg-emerald lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="order-2 flex flex-col justify-center p-8 sm:p-12 lg:order-1 lg:p-14">
            
            {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
            <h2 className={`display display-2 text-cream ${data.eyebrow ? 'mt-4' : ''}`}>{data.title}</h2>
            <p className="body-base mt-4 max-w-[30rem] text-cream/70">{data.body}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {data.ctaLabel &&
              <a href={data.ctaHref || '#contact'} className="btn btn-light">
                  {data.ctaLabel}
                </a>
              }
              {data.couponCode &&
              <span className="btn border border-dashed border-cream/40 text-cream/80">
                  <TagIcon className="h-3.5 w-3.5 text-gold" />
                  Code {data.couponCode}
                </span>
              }
            </div>
          </motion.div>

          <div className="order-1 min-h-[280px] lg:order-2 lg:min-h-[440px]">
            <img src={data.image} alt={data.title} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>);

}