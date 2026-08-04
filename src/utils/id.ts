/**
 * Short unique id for content items (slides, cards, links, sections).
 * Ids only need to be unique inside one content document, not globally.
 */
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
