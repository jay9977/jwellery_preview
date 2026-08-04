import { SectionHeading } from './SectionHeading';
import { MediaEmbed } from './MediaEmbed';
import { isVideo, parseMedia } from '../../utils/media';
import type { CustomItem, CustomSection } from '../../types/content';

const BACKGROUND_CLASS: Record<CustomSection['background'], string> = {
  cream: 'bg-cream',
  sand: 'bg-sand',
  ink: 'bg-ink'
};

/** Internal anchors stay in the page; anything else opens in a new tab. */
function Cta({ label, href, tone }: {label: string;href: string;tone: 'dark' | 'light';}) {
  if (!label.trim()) return null;
  const target = href.startsWith('#') || href.startsWith('/') ? undefined : '_blank';
  return (
    <a
      href={href || '#top'}
      target={target}
      rel={target ? 'noreferrer' : undefined}
      className={`btn btn-sm mt-7 ${tone === 'light' ? 'btn-light' : 'btn-primary'}`}>

      {label}
    </a>);

}

/**
 * A video on the item wins over its image, so a grid can mix the two.
 * Fields are read defensively: a section saved before videos existed has neither.
 */
function itemMedia(item: CustomItem): string {
  return (item.video ?? '').trim() || (item.image ?? '').trim();
}

function ItemCard({ item, tone }: {item: CustomItem;tone: 'dark' | 'light';}) {
  const media = itemMedia(item);
  const isPlayable = isVideo(parseMedia(media));
  const href = item.linkHref.trim();
  const target = href.startsWith('#') || href.startsWith('/') ? undefined : '_blank';

  const text = (
    <>
      <div className={media ? 'pt-5' : ''}>
        {item.title &&
        <h3 className={`display text-xl leading-snug ${tone === 'light' ? 'text-cream' : 'text-ink'}`}>
            {item.title}
          </h3>
        }
        {item.text &&
        <p className={`body-sm mt-2.5 ${tone === 'light' ? 'text-cream/65' : 'text-ink/65'}`}>
            {item.text}
          </p>
        }
        {item.linkLabel &&
        <span
          className={`meta mt-4 inline-block border-b pb-0.5 ${
          tone === 'light' ? 'border-cream/40 text-cream' : 'border-ink/30 text-ink'}`
          }>

            {item.linkLabel}
          </span>
        }
      </div>
    </>);


  const media_ = media &&
  <MediaEmbed url={media} title={item.title} aspect="aspect-[4/3]" className="bg-sand/60" />;

  // A playable video must stay outside the link, or the click would navigate away
  // instead of hitting play. Only the text below it becomes the link.
  if (href && isPlayable) {
    return (
      <div>
        {media_}
        <a href={href} target={target} rel={target ? 'noreferrer' : undefined} className="group block">
          {text}
        </a>
      </div>);

  }

  if (!href) {
    return (
      <div>
        {media_}
        {text}
      </div>);

  }

  return (
    <a href={href} target={target} rel={target ? 'noreferrer' : undefined} className="group block">
      {media_}
      {text}
    </a>);

}

export function CustomBlock({ data }: {data: CustomSection;}) {
  const tone = data.background === 'ink' ? 'light' : 'dark';
  const items = data.items ?? [];

  /* ---------- banner: image with the copy laid over it ---------- */
  if (data.layout === 'banner') {
    return (
      <section className={`w-full ${BACKGROUND_CLASS[data.background]}`}>
        <div className="shell section-y">
          <div className="relative overflow-hidden">
            {data.image &&
            <img src={data.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            }
            <div className={`relative px-6 py-20 text-center sm:px-12 ${data.image ? 'bg-ink/55' : 'bg-ink/90'}`}>
              {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
              {data.title &&
              <h2 className={`display display-2 text-cream ${data.eyebrow ? 'mt-4' : ''}`}>{data.title}</h2>
              }
              {data.subtitle &&
              <p className="body-base mx-auto mt-4 max-w-[34rem] text-cream/70">{data.subtitle}</p>
              }
              <Cta label={data.ctaLabel} href={data.ctaHref} tone="light" />
            </div>
          </div>
        </div>
      </section>);

  }

  /* ---------- gallery: image grid ---------- */
  if (data.layout === 'gallery') {
    return (
      <section className={`section-y w-full ${BACKGROUND_CLASS[data.background]}`}>
        <div className="shell">
          {(data.eyebrow || data.title || data.subtitle) &&
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            subtitle={data.subtitle}
            tone={tone} />

          }
          {items.length > 0 &&
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {items.map((item) =>
            <figure key={item.id} className="group overflow-hidden">
                  <MediaEmbed
                url={itemMedia(item)}
                title={item.title || item.text}
                aspect={isVideo(parseMedia(itemMedia(item))) ? 'aspect-video' : 'aspect-square'}
                className="bg-sand/60" />

                  {item.text &&
              <figcaption className={`meta mt-2.5 ${tone === 'light' ? 'text-cream/60' : 'text-ink/55'}`}>
                      {item.text}
                    </figcaption>
              }
                </figure>
            )}
            </div>
          }
          <div className="text-center">
            <Cta label={data.ctaLabel} href={data.ctaHref} tone={tone} />
          </div>
        </div>
      </section>);

  }

  /* ---------- video: one feature video, plus any extras below ---------- */
  if (data.layout === 'video') {
    const extras = items.filter((item) => itemMedia(item));
    return (
      <section className={`section-y w-full ${BACKGROUND_CLASS[data.background]}`}>
        <div className="shell">
          {(data.eyebrow || data.title || data.subtitle) &&
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            subtitle={data.subtitle}
            tone={tone} />

          }
          {(data.video ?? '').trim() &&
          <div className="mx-auto mt-12 max-w-4xl">
              <MediaEmbed url={data.video} title={data.title} poster={data.videoPoster ?? ''} />
            </div>
          }
          {extras.length > 0 &&
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {extras.map((item) =>
            <div key={item.id}>
                  <MediaEmbed url={itemMedia(item)} title={item.title} />
                  {item.title &&
              <h3 className={`display mt-3 text-lg ${tone === 'light' ? 'text-cream' : 'text-ink'}`}>
                      {item.title}
                    </h3>
              }
                  {item.text &&
              <p className={`body-sm mt-1.5 ${tone === 'light' ? 'text-cream/65' : 'text-ink/65'}`}>
                      {item.text}
                    </p>
              }
                </div>
            )}
            </div>
          }
          <div className="text-center">
            <Cta label={data.ctaLabel} href={data.ctaHref} tone={tone} />
          </div>
        </div>
      </section>);

  }

  /* ---------- cards: responsive grid ---------- */
  if (data.layout === 'cards') {
    return (
      <section className={`section-y w-full ${BACKGROUND_CLASS[data.background]}`}>
        <div className="shell">
          {(data.eyebrow || data.title || data.subtitle) &&
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            subtitle={data.subtitle}
            tone={tone} />

          }
          {items.length > 0 &&
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) =>
            <ItemCard key={item.id} item={item} tone={tone} />
            )}
            </div>
          }
          <div className="text-center">
            <Cta label={data.ctaLabel} href={data.ctaHref} tone={tone} />
          </div>
        </div>
      </section>);

  }

  /* ---------- text: heading plus paragraphs ---------- */
  const paragraphs = data.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <section className={`section-y w-full ${BACKGROUND_CLASS[data.background]}`}>
      <div className="shell">
        <div className="mx-auto max-w-[42rem] text-center">
          {data.eyebrow && <p className="eyebrow text-gold">{data.eyebrow}</p>}
          {data.title &&
          <h2
            className={`display display-2 ${data.eyebrow ? 'mt-4' : ''} ${
            tone === 'light' ? 'text-cream' : 'text-ink'}`
            }>

              {data.title}
            </h2>
          }
          {data.subtitle &&
          <p className={`body-base mt-4 ${tone === 'light' ? 'text-cream/65' : 'text-ink/60'}`}>
              {data.subtitle}
            </p>
          }
          {paragraphs.length > 0 &&
          <div className="mt-8 space-y-4 text-left">
              {paragraphs.map((paragraph, index) =>
            <p
              key={index}
              className={`body-base ${tone === 'light' ? 'text-cream/70' : 'text-ink/70'}`}>

                  {paragraph}
                </p>
            )}
            </div>
          }
          <Cta label={data.ctaLabel} href={data.ctaHref} tone={tone} />
        </div>
      </div>
    </section>);

}
