import { motion } from 'framer-motion';
import { InstagramIcon } from 'lucide-react';
import type { GallerySection } from '../../types/content';

export function Gallery({ data }: {data: GallerySection;}) {
  return (
    <section id="gallery" className="section-y w-full bg-cream">
      <div className="shell">
        <div className="flex flex-col items-center gap-4 text-center">
          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          <h2 className="display display-2 text-ink">{data.title}</h2>
          {data.handle &&
          <a
            href="#gallery"
            className="meta inline-flex items-center gap-2 text-ink/55 transition-colors hover:text-emerald">
            
              <InstagramIcon className="h-3.5 w-3.5" />
              {data.handle}
            </a>
          }
        </div>

        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:mt-14 lg:grid-cols-6 lg:gap-3">
          {data.items.map((item, i) =>
          <motion.figure
            key={item.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="group relative aspect-square overflow-hidden bg-sand">
            
              <img
              src={item.image}
              alt={item.caption}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
              {item.caption &&
            <figcaption className="meta absolute inset-x-0 bottom-0 bg-ink/60 px-3 py-2.5 text-cream opacity-0 transition-opacity group-hover:opacity-100">
                  {item.caption}
                </figcaption>
            }
            </motion.figure>
          )}
        </div>
      </div>
    </section>);

}