
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  tone?: 'dark' | 'light';
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'dark'
}: SectionHeadingProps) {
  const isLight = tone === 'light';
  return (
    <div className={align === 'center' ? 'mx-auto max-w-[36rem] text-center' : 'max-w-[36rem]'}>
      {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
      <h2 className={`display display-2 ${eyebrow ? 'mt-4' : ''} ${isLight ? 'text-cream' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle &&
      <p className={`body-base mt-4 ${isLight ? 'text-cream/65' : 'text-ink/60'}`}>{subtitle}</p>
      }
    </div>);

}