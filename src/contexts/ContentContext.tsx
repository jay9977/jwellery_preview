import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState } from
'react';
import { defaultContent } from '../data/defaultContent';
import { FONT_PAIRS } from '../data/palettes';
import { hexToRgbTriple } from '../utils/color';
import {
  isConnected,
  loadBackendConfig,
  persistBackendConfig,
  type BackendConfig } from
'../utils/backend';
import { fetchRemoteContent, pushRemoteContent, submitSubscriber } from '../utils/api';
import type { SectionId, Sections, SiteContent, Theme } from '../types/content';

const STORAGE_KEY = 'aurelle.site.content.v1';

export type SyncStatus = 'offline' | 'loading' | 'synced' | 'saving' | 'error';

interface ContentContextValue {
  content: SiteContent;
  isDirty: boolean;
  backend: BackendConfig;
  syncStatus: SyncStatus;
  syncError: string;
  lastSyncedAt: string;
  updateBackend: (patch: Partial<BackendConfig>) => void;
  publish: () => Promise<void>;
  pull: () => Promise<void>;
  subscribeEmail: (email: string) => Promise<void>;
  updateBrand: (patch: Partial<SiteContent['brand']>) => void;
  updateSeo: (patch: Partial<SiteContent['seo']>) => void;
  updateAnnouncement: (patch: Partial<SiteContent['announcement']>) => void;
  updateFooter: (patch: Partial<SiteContent['footer']>) => void;
  updateNav: (nav: SiteContent['nav']) => void;
  updateTheme: (patch: Partial<Theme>) => void;
  updateSection: <K extends SectionId>(id: K, patch: Partial<Sections[K]>) => void;
  toggleSection: (id: SectionId) => void;
  moveSection: (id: SectionId, direction: -1 | 1) => void;
  replaceContent: (next: SiteContent) => void;
  resetAll: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function normalize(parsed: Partial<SiteContent> | null | undefined): SiteContent {
  if (!parsed || typeof parsed !== 'object') return defaultContent;
  const order = (parsed.order ?? []).filter((id) => id in defaultContent.sections);
  const missing = defaultContent.order.filter((id) => !order.includes(id));
  return {
    ...defaultContent,
    ...parsed,
    order: [...order, ...missing],
    theme: {
      ...defaultContent.theme,
      ...parsed.theme,
      colors: { ...defaultContent.theme.colors, ...parsed.theme?.colors }
    },
    seo: { ...defaultContent.seo, ...parsed.seo },
    sections: { ...defaultContent.sections, ...parsed.sections }
  };
}

function loadLocalContent(): SiteContent {
  if (typeof window === 'undefined') return defaultContent;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw) as SiteContent) : defaultContent;
  } catch {
    return defaultContent;
  }
}

export function ContentProvider({ children }: {children: React.ReactNode;}) {
  const [content, setContent] = useState<SiteContent>(loadLocalContent);
  const [isDirty, setIsDirty] = useState(false);
  const [backend, setBackend] = useState<BackendConfig>(loadBackendConfig);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [syncError, setSyncError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const skipPublish = useRef(true);
  const publishTimer = useRef<number | null>(null);

  /* ---------- local cache (offline draft) ---------- */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {

      /* storage unavailable — in-memory edits still work */}
  }, [content]);

  /* ---------- theme tokens ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const { colors, fontId } = content.theme;
    root.style.setProperty('--c-cream', hexToRgbTriple(colors.cream));
    root.style.setProperty('--c-sand', hexToRgbTriple(colors.sand));
    root.style.setProperty('--c-ink', hexToRgbTriple(colors.ink));
    root.style.setProperty('--c-accent', hexToRgbTriple(colors.accent));
    root.style.setProperty('--c-accent-deep', hexToRgbTriple(colors.accentDeep));
    root.style.setProperty('--c-gold', hexToRgbTriple(colors.gold));
    const pair = FONT_PAIRS.find((f) => f.id === fontId) ?? FONT_PAIRS[0];
    root.style.setProperty('--font-display', pair.display);
    root.style.setProperty('--font-body', pair.body);
  }, [content.theme]);

  /* ---------- backend ---------- */
  const pull = useCallback(async () => {
    if (!isConnected(backend)) return;
    setSyncStatus('loading');
    setSyncError('');
    try {
      const remote = await fetchRemoteContent(backend);
      skipPublish.current = true;
      setContent(normalize(remote));
      setIsDirty(false);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Could not load content.');
      setSyncStatus('error');
    }
  }, [backend]);

  const publish = useCallback(async () => {
    if (!isConnected(backend)) return;
    setSyncStatus('saving');
    setSyncError('');
    try {
      await pushRemoteContent(backend, content);
      setIsDirty(false);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Could not save content.');
      setSyncStatus('error');
    }
  }, [backend, content]);

  const publishRef = useRef(publish);
  publishRef.current = publish;

  /* load from the server whenever the connection settings change */
  useEffect(() => {
    if (!isConnected(backend)) {
      setSyncStatus('offline');
      setSyncError('');
      return;
    }
    void pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend.enabled, backend.baseUrl, backend.apiKey]);

  /* debounced auto-publish of edits */
  useEffect(() => {
    if (skipPublish.current) {
      skipPublish.current = false;
      return;
    }
    // Only an authenticated admin session can publish; visitors never do.
    if (!isConnected(backend) || !backend.autoPublish || !backend.apiKey) return;
    if (publishTimer.current) window.clearTimeout(publishTimer.current);
    publishTimer.current = window.setTimeout(() => {
      void publishRef.current();
    }, 1200);
    return () => {
      if (publishTimer.current) window.clearTimeout(publishTimer.current);
    };
  }, [content, backend]);

  const updateBackend = useCallback((patch: Partial<BackendConfig>) => {
    setBackend((prev) => {
      const next = { ...prev, ...patch };
      persistBackendConfig(next);
      return next;
    });
  }, []);

  const subscribeEmail = useCallback(
    async (email: string) => {
      // Never report success we cannot deliver: without a server there is nowhere
      // to store the address, so the form must say so instead of pretending.
      if (!isConnected(backend)) {
        throw new Error('Newsletter signup is unavailable right now. Please try again later.');
      }
      await submitSubscriber(backend, email);
    },
    [backend]
  );

  /* ---------- content mutations ---------- */
  const mutate = useCallback((updater: (prev: SiteContent) => SiteContent) => {
    setIsDirty(true);
    setContent(updater);
  }, []);

  const updateBrand = useCallback(
    (patch: Partial<SiteContent['brand']>) => mutate((prev) => ({ ...prev, brand: { ...prev.brand, ...patch } })),
    [mutate]
  );

  const updateSeo = useCallback(
    (patch: Partial<SiteContent['seo']>) => mutate((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } })),
    [mutate]
  );

  const updateAnnouncement = useCallback(
    (patch: Partial<SiteContent['announcement']>) =>
    mutate((prev) => ({ ...prev, announcement: { ...prev.announcement, ...patch } })),
    [mutate]
  );

  const updateFooter = useCallback(
    (patch: Partial<SiteContent['footer']>) =>
    mutate((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } })),
    [mutate]
  );

  const updateNav = useCallback(
    (nav: SiteContent['nav']) => mutate((prev) => ({ ...prev, nav })),
    [mutate]
  );

  const updateTheme = useCallback(
    (patch: Partial<Theme>) =>
    mutate((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch, colors: { ...prev.theme.colors, ...patch.colors } }
    })),
    [mutate]
  );

  const updateSection = useCallback(
    <K extends SectionId,>(id: K, patch: Partial<Sections[K]>) =>
    mutate((prev) => ({
      ...prev,
      sections: { ...prev.sections, [id]: { ...prev.sections[id], ...patch } }
    })),
    [mutate]
  );

  const toggleSection = useCallback(
    (id: SectionId) =>
    mutate((prev) => ({
      ...prev,
      sections: { ...prev.sections, [id]: { ...prev.sections[id], visible: !prev.sections[id].visible } }
    })),
    [mutate]
  );

  const moveSection = useCallback(
    (id: SectionId, direction: -1 | 1) =>
    mutate((prev) => {
      const order = [...prev.order];
      const from = order.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= order.length) return prev;
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { ...prev, order };
    }),
    [mutate]
  );

  const replaceContent = useCallback(
    (next: SiteContent) => mutate(() => normalize(next)),
    [mutate]
  );

  const resetAll = useCallback(() => {
    setIsDirty(false);
    setContent(defaultContent);
  }, []);

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      isDirty,
      backend,
      syncStatus,
      syncError,
      lastSyncedAt,
      updateBackend,
      publish,
      pull,
      subscribeEmail,
      updateBrand,
      updateSeo,
      updateAnnouncement,
      updateFooter,
      updateNav,
      updateTheme,
      updateSection,
      toggleSection,
      moveSection,
      replaceContent,
      resetAll
    }),
    [
    content,
    isDirty,
    backend,
    syncStatus,
    syncError,
    lastSyncedAt,
    updateBackend,
    publish,
    pull,
    subscribeEmail,
    updateBrand,
    updateSeo,
    updateAnnouncement,
    updateFooter,
    updateNav,
    updateTheme,
    updateSection,
    toggleSection,
    moveSection,
    replaceContent,
    resetAll]

  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside a ContentProvider');
  return ctx;
}
