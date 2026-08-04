import type { SiteContent } from '../types/content';

const KEY = 'aurelle.snapshots.v1';

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  content: SiteContent;
}

export function listSnapshots(): Snapshot[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Snapshot[] : [];
  } catch {
    return [];
  }
}

function persist(snapshots: Snapshot[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshots));
  } catch {

    /* storage full or unavailable */}
}

export function saveSnapshot(name: string, content: SiteContent): Snapshot[] {
  const snapshot: Snapshot = {
    id: `snap-${Date.now()}`,
    name: name.trim() || new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
    content
  };
  const next = [snapshot, ...listSnapshots()].slice(0, 12);
  persist(next);
  return next;
}

export function deleteSnapshot(id: string): Snapshot[] {
  const next = listSnapshots().filter((snapshot) => snapshot.id !== id);
  persist(next);
  return next;
}