export type MediaKind = 'youtube' | 'vimeo' | 'file' | 'image' | 'none';

export interface Media {
  kind: MediaKind;
  /** What to feed an <iframe>, <video> or <img>. Empty when kind is 'none'. */
  src: string;
  /** Human-readable description of what was detected, for the admin panel. */
  description: string;
}

const VIDEO_FILE_RE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;

/**
 * Only http(s), protocol-relative and same-origin paths are ever emitted.
 * This is what stops a pasted `javascript:` URL from reaching an iframe src.
 */
function isSafeUrl(raw: string): boolean {
  const url = raw.trim();
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('//')) return true;
  if (url.startsWith('data:image/')) return true;
  return /^https?:\/\//i.test(url);
}

/** Seconds to start at, from `t=90`, `t=1m30s` or `start=90`. */
function startSeconds(params: URLSearchParams): number {
  const raw = params.get('t') ?? params.get('start') ?? '';
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);
  const match = raw.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function youtubeId(url: URL): string {
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0];
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (url.pathname === '/watch') return url.searchParams.get('v') ?? '';
    const match = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([^/?]+)/);
    if (match) return match[1];
  }
  return '';
}

function vimeoId(url: URL): string {
  if (!url.hostname.replace(/^www\./, '').endsWith('vimeo.com')) return '';
  const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
  return match ? match[1] : '';
}

/**
 * Work out how a pasted URL should be rendered: a YouTube/Vimeo embed, a video
 * file, or a plain image. Anything unrecognised is treated as an image, which is
 * what a link from an image host or the built-in uploader will be.
 */
export function parseMedia(raw: string | undefined): Media {
  const url = (raw ?? '').trim();
  if (!url) return { kind: 'none', src: '', description: '' };
  if (!isSafeUrl(url)) {
    return { kind: 'none', src: '', description: 'Not a usable link — use an http(s) address.' };
  }

  if (/^https?:\/\//i.test(url)) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { kind: 'none', src: '', description: 'That link could not be read.' };
    }

    const yt = youtubeId(parsed);
    if (yt) {
      const start = startSeconds(parsed.searchParams);
      const query = start > 0 ? `?start=${start}` : '';
      return {
        kind: 'youtube',
        src: `https://www.youtube-nocookie.com/embed/${yt}${query}`,
        description: start > 0 ? `YouTube video, starting at ${start}s` : 'YouTube video'
      };
    }

    const vimeo = vimeoId(parsed);
    if (vimeo) {
      return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeo}`, description: 'Vimeo video' };
    }
  }

  if (VIDEO_FILE_RE.test(url)) {
    return { kind: 'file', src: url, description: 'Video file' };
  }

  return { kind: 'image', src: url, description: 'Image' };
}

export function isVideo(media: Media): boolean {
  return media.kind === 'youtube' || media.kind === 'vimeo' || media.kind === 'file';
}
