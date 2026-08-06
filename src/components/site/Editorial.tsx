import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import type { EditorialSection } from '../../types/content';

export function Editorial({ data }: {data: EditorialSection;}) {
  return (
    <section id="editorial" className="section-y w-full bg-cream">
      <div className="shell grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="aspect-[4/3] overflow-hidden bg-sand">
          
          <img src={data.image} alt={data.title} className="h-full w-full object-cover" />
        </motion.div>

        <div className="max-w-[34rem]">
          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          <h2 className={`display display-2 text-ink ${data.eyebrow ? 'mt-4' : ''}`}>{data.title}</h2>
          <p className="body-base mt-5 text-ink/65">{data.body}</p>

          <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-ink/10 pt-7 sm:max-w-md">
            <div>
              <dt className="sr-only">{data.stat1Label}</dt>
              <dd className="display text-[2.25rem] leading-none text-emerald">{data.stat1Value}</dd>
              <p className="meta mt-2.5 text-ink/50">{data.stat1Label}</p>
            </div>
            <div>
              <dt className="sr-only">{data.stat2Label}</dt>
              <dd className="display text-[2.25rem] leading-none text-emerald">{data.stat2Value}</dd>
              <p className="meta mt-2.5 text-ink/50">{data.stat2Label}</p>
            </div>
          </dl>

          {data.ctaLabel &&
          <a href={data.ctaHref || '#journal'} className="link-underline group mt-9 inline-flex items-center gap-2 text-ink">
              {data.ctaLabel}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          }
        </div>
      </div>
    </section>);

}