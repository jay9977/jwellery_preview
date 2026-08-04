import { parseMedia } from '../../utils/media';

interface MediaEmbedProps {
  /** Any image URL, video-file URL, or YouTube / Vimeo link. */
  url: string;
  title?: string;
  /** Poster frame for a video file. Ignored by YouTube and Vimeo, which bring their own. */
  poster?: string;
  /** Tailwind aspect class, e.g. "aspect-video" or "aspect-square". */
  aspect?: string;
  className?: string;
}

/**
 * Renders whatever a pasted URL turns out to be: a YouTube/Vimeo embed, an
 * inline video file, or an image. Keeps a single fixed frame so a grid of mixed
 * images and videos still lines up.
 */
export function MediaEmbed({
  url,
  title = '',
  poster = '',
  aspect = 'aspect-video',
  className = ''
}: MediaEmbedProps) {
  const media = parseMedia(url);
  if (media.kind === 'none') return null;

  const frame = `${aspect} w-full overflow-hidden bg-ink/5 ${className}`;

  if (media.kind === 'youtube' || media.kind === 'vimeo') {
    return (
      <div className={frame}>
        <iframe
          src={media.src}
          title={title || media.description}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0" />

      </div>);

  }

  if (media.kind === 'file') {
    return (
      <div className={frame}>
        <video
          src={media.src}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover">

          Your browser cannot play this video.
        </video>
      </div>);

  }

  return (
    <div className={frame}>
      <img src={media.src} alt={title} loading="lazy" className="h-full w-full object-cover" />
    </div>);

}
