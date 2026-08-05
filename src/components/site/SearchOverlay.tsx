import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { openQuickView } from '../../utils/events';

interface SearchResult {
  id: string;
  /** Which part of the page this result lives in, e.g. "Jewellery". */
  group: string;
  title: string;
  detail: string;
  /** Section anchor to scroll to. */
  href: string;
  /** Products open their quick view instead of only scrolling. */
  productId?: string;
  image?: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { content } = useContent();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Everything a visitor might reasonably type: pieces, categories, journal posts and
  // the FAQ. Built from the live content, so anything added in the admin is searchable.
  const index = useMemo<SearchResult[]>(() => {
    const { sections } = content;
    const entries: SearchResult[] = [];

    if (sections.featured?.visible !== false) {
      for (const product of sections.featured?.items ?? []) {
        entries.push({
          id: `product-${product.id}`,
          group: 'Jewellery',
          title: product.name,
          detail: product.metal,
          href: '#featured',
          productId: product.id,
          image: product.image
        });
      }
    }

    if (sections.categories?.visible !== false) {
      for (const category of sections.categories?.items ?? []) {
        entries.push({
          id: `category-${category.id}`,
          group: 'Categories',
          title: category.title,
          detail: category.caption,
          href: '#categories',
          image: category.image
        });
      }
    }

    if (sections.journal?.visible !== false) {
      for (const post of sections.journal?.items ?? []) {
        entries.push({
          id: `journal-${post.id}`,
          group: 'Journal',
          title: post.title,
          detail: post.excerpt,
          href: '#journal',
          image: post.image
        });
      }
    }

    if (sections.faq?.visible !== false) {
      for (const item of sections.faq?.items ?? []) {
        entries.push({
          id: `faq-${item.id}`,
          group: 'Questions',
          title: item.question,
          detail: item.answer,
          href: '#faq'
        });
      }
    }

    return entries;
  }, [content]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const words = needle.split(/\s+/);
    return index
      .map((entry) => {
        const haystack = `${entry.title} ${entry.detail} ${entry.group}`.toLowerCase();
        if (!words.every((word) => haystack.includes(word))) return null;
        // A hit in the title is what the visitor most likely meant.
        return { entry, score: entry.title.toLowerCase().includes(needle) ? 0 : 1 };
      })
      .filter((hit): hit is {entry: SearchResult;score: number;} => hit !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((hit) => hit.entry);
  }, [index, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    // Wait for the panel to mount before moving focus into it.
    const focus = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focus);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  function go(result: SearchResult) {
    onClose();
    document.querySelector(result.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Give the scroll a moment before the dialog opens over it.
    if (result.productId) window.setTimeout(() => openQuickView(result.productId as string), 450);
  }

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-start justify-center" role="dialog" aria-modal="true" aria-label="Search">
          <motion.button
          type="button"
          tabIndex={-1}
          aria-label="Close search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/55" />

          <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-0 w-full max-w-2xl bg-cream shadow-xl sm:mt-24">

            <form
            onSubmit={(event) => {
              event.preventDefault();
              if (results[0]) go(results[0]);
            }}
            className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">

              <SearchIcon className="h-5 w-5 shrink-0 text-ink/40" />
              <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rings, earrings, gold…"
              aria-label="Search the site"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/35" />

              <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 p-1 text-ink/45 transition-colors hover:text-ink">

                <XIcon className="h-5 w-5" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ?
            <p className="body-sm px-5 py-6 text-ink/50">
                  Start typing to find a piece, a category, a journal story or an answer.
                </p> :
            results.length === 0 ?
            <p className="body-sm px-5 py-6 text-ink/50">
                  Nothing matched “{query.trim()}”. Try a metal, a stone or a category.
                </p> :

            <ul className="divide-y divide-ink/5">
                  {results.map((result) =>
              <li key={result.id}>
                      <button
                  type="button"
                  onClick={() => go(result)}
                  className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-sand/60">

                        {result.image ?
                  <img src={result.image} alt="" className="h-12 w-12 shrink-0 object-cover" /> :
                  <span className="h-12 w-12 shrink-0 bg-sand" />
                  }
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-ink">{result.title}</span>
                          <span className="block truncate text-xs text-ink/50">{result.detail}</span>
                        </span>
                        <span className="meta ml-auto shrink-0 text-[9px] text-ink/40">{result.group}</span>
                      </button>
                    </li>
              )}
                </ul>
            }
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
