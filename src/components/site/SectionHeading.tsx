
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  tone?: 'dark' | 'light';
}

import { useTemplate } from './templates/engine';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'dark'
}: SectionHeadingProps) {
  const isLight = tone === 'light';
  const { premium } = useTemplate();
  return (
    <div className={align === 'center' ? 'mx-auto max-w-[36rem] text-center' : 'max-w-[36rem]'}>
      {eyebrow && !premium && <p className="eyebrow text-gold">{eyebrow}</p>}
      {eyebrow && premium &&
      <p className={`eyebrow flex items-center gap-3 text-gold ${align === 'center' ? 'justify-center' : ''}`}>
          <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-gold/70" />
          {eyebrow}
          {align === 'center' && <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-gold/70" />}
        </p>
      }
      <h2 className={`display display-2 ${eyebrow ? 'mt-4' : ''} ${isLight ? 'text-cream' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle &&
      <p className={`body-base mt-4 ${isLight ? 'text-cream/65' : 'text-ink/60'}`}>{subtitle}</p>
      }
    </div>);

}