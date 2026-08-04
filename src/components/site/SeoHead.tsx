import { useEffect } from 'react';
import type { SeoSettings } from '../../types/content';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  if (!value) return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

/** Canonical URL, so query strings and the SPA catch-all route don't split rankings. */
function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function SeoHead({ seo, siteName }: {seo: SeoSettings;siteName?: string;}) {
  useEffect(() => {
    if (seo.title) document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'keywords', seo.keywords);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:image', seo.ogImage);
    setMeta('property', 'og:type', 'website');
    // og:url and a canonical link were missing: without them a shared link and the
    // indexed page can disagree, and query strings look like separate pages.
    setMeta('property', 'og:url', window.location.origin + window.location.pathname);
    if (siteName) setMeta('property', 'og:site_name', siteName);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', seo.ogImage);
    setCanonical(window.location.origin + window.location.pathname);
  }, [seo, siteName]);

  return null;
}