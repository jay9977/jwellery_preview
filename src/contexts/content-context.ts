import { createContext } from 'react';
import type { BackendConfig } from '../utils/backend';
import type { ContactEnquiry } from '../utils/api';
import type {
  BuiltInSectionId,
  CustomSection,
  SectionId,
  Sections,
  SiteContent,
  Theme } from
'../types/content';

export type SyncStatus = 'offline' | 'loading' | 'synced' | 'saving' | 'error';

export interface ContentContextValue {
  content: SiteContent;
  /** False until the site's own content has been loaded (or a cached copy shown). */
  loaded: boolean;
  /** The site's plan expired or it was switched off — show the unavailable page. */
  suspended: boolean;
  /** No client website at this address — the platform homepage is shown instead. */
  noSite: boolean;
  isDirty: boolean;
  backend: BackendConfig;
  syncStatus: SyncStatus;
  syncError: string;
  lastSyncedAt: string;
  updateBackend: (patch: Partial<BackendConfig>) => void;
  publish: () => Promise<void>;
  pull: () => Promise<void>;
  subscribeEmail: (email: string) => Promise<void>;
  sendEnquiry: (enquiry: ContactEnquiry) => Promise<void>;
  updateBrand: (patch: Partial<SiteContent['brand']>) => void;
  updateSeo: (patch: Partial<SiteContent['seo']>) => void;
  updateAnnouncement: (patch: Partial<SiteContent['announcement']>) => void;
  updateFooter: (patch: Partial<SiteContent['footer']>) => void;
  updateNav: (nav: SiteContent['nav']) => void;
  updateTheme: (patch: Partial<Theme>) => void;
  updateSection: <K extends BuiltInSectionId>(id: K, patch: Partial<Sections[K]>) => void;
  updateCustomSection: (id: SectionId, patch: Partial<CustomSection>) => void;
  toggleSection: (id: SectionId) => void;
  moveSection: (id: SectionId, direction: -1 | 1) => void;
  renameSection: (id: SectionId, label: string) => void;
  addSection: (label?: string) => SectionId;
  removeSection: (id: SectionId) => void;
  replaceContent: (next: SiteContent) => void;
  resetAll: () => void;
}

/**
 * Kept out of the provider file so that file only exports a component — which is
 * what Fast Refresh needs to hot-reload the provider without losing site content.
 */
export const ContentContext = createContext<ContentContextValue | null>(null);
