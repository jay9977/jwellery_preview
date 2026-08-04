import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import type { JournalSection } from '../../types/content';
import { SectionHeading } from './SectionHeading';

export function Journal({ data }: {data: JournalSection;}) {
  return (
    <section id="journal" className="section-y w-full bg-sand/55">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {data.items.map((post, i) =>
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="group flex flex-col">
            
              <a href="#journal" className="block aspect-[4/3] overflow-hidden bg-sand">
                <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              </a>
              <div className="meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink/45">
                {post.category && <span className="text-gold">{post.category}</span>}
                {post.date && <span aria-hidden>·</span>}
                {post.date && <span>{post.date}</span>}
                {post.readTime && <span aria-hidden>·</span>}
                {post.readTime && <span>{post.readTime}</span>}
              </div>
              <h3 className="display display-3 mt-3 text-ink">
                <a href="#journal" className="transition-colors group-hover:text-emerald">
                  {post.title}
                </a>
              </h3>
              <p className="body-sm mt-3 text-ink/60">{post.excerpt}</p>
            </motion.article>
          )}
        </div>

        {data.ctaLabel &&
        <div className="mt-12 flex justify-center lg:mt-14">
            <a href="#journal" className="link-underline group text-ink">
              {data.ctaLabel}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        }
      </div>
    </section>);

}