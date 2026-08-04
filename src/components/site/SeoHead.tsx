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

export function SeoHead({ seo }: {seo: SeoSettings;}) {
  useEffect(() => {
    if (seo.title) document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'keywords', seo.keywords);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:image', seo.ogImage);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
  }, [seo]);

  return null;
}