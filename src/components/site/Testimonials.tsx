import { motion } from 'framer-motion';
import { StarIcon } from 'lucide-react';
import type { TestimonialsSection } from '../../types/content';
import { SectionHeading } from './SectionHeading';

export function Testimonials({ data }: {data: TestimonialsSection;}) {
  return (
    <section id="testimonials" className="section-y w-full bg-emerald-deep">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} tone="light" />

        <div className="mt-12 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {data.items.map((item, i) =>
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col border border-cream/15 p-7 lg:p-8">
            
              <div className="flex gap-1.5" aria-label={`${item.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) =>
              <StarIcon
                key={s}
                className={`h-3.5 w-3.5 ${s < item.rating ? 'fill-gold text-gold' : 'text-cream/25'}`} />

              )}
              </div>
              <blockquote className="display mt-6 flex-1 text-[1.375rem] leading-[1.5] text-cream/90">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-cream/15 pt-5">
                <p className="meta text-cream">{item.name}</p>
                <p className="mt-1.5 text-xs text-cream/50">{item.location}</p>
              </figcaption>
            </motion.figure>
          )}
        </div>
      </div>
    </section>);

}