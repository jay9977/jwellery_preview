import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from 'lucide-react';
import type { CategoriesSection } from '../../types/content';
import { SectionHeading } from './SectionHeading';

export function Categories({ data }: {data: CategoriesSection;}) {
  return (
    <section id="categories" className="section-y w-full bg-cream">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 lg:mt-14 lg:grid-cols-4">
          {data.items.map((item, i) =>
          <motion.a
            key={item.id}
            href="#featured"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="group block">
            
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <h3 className="display display-4 text-ink transition-colors group-hover:text-emerald">
                  {item.title}
                </h3>
                <ArrowUpRightIcon className="h-4 w-4 shrink-0 translate-y-0.5 text-ink/25 transition-colors group-hover:text-emerald" />
              </div>
              <p className="meta mt-1.5 text-ink/45">{item.caption}</p>
            </motion.a>
          )}
        </div>
      </div>
    </section>);

}