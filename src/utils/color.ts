export function isValidHex(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function normalizeHex(value: string): string {
  const hex = value.trim().replace(/^#?/, '');
  if (hex.length === 3) {
    return `#${hex.
    split('').
    map((c) => c + c).
    join('')}`.toLowerCase();
  }
  return `#${hex}`.toLowerCase();
}

/** Converts "#14453b" into "20 69 59" for use inside rgb(var(--x) / <alpha>) */
export function hexToRgbTriple(value: string): string {
  if (!isValidHex(value)) return '0 0 0';
  const hex = normalizeHex(value).slice(1);
  const int = parseInt(hex, 16);
  const r = int >> 16 & 255;
  const g = int >> 8 & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}