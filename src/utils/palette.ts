import { isValidHex, normalizeHex } from './color';
import { contrastRatio } from './contrast';
import type { ThemeColors } from '../types/content';

/** Pull every hex colour out of pasted text, in the order they appear. */
export function parseHexList(text: string): string[] {
  const found = text.match(/#?\b[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of found) {
    const hex = normalizeHex(raw.startsWith('#') ? raw : `#${raw}`);
    if (!isValidHex(hex) || seen.has(hex)) continue;
    seen.add(hex);
    out.push(hex);
  }
  return out;
}

/* ---------- HSL helpers, so a pasted colour can be tinted or shaded ---------- */

interface Hsl {h: number;s: number;l: number;}

export function hexToHsl(hex: string): Hsl {
  const n = parseInt(normalizeHex(hex).slice(1), 16);
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
  max === r ? ((g - b) / d + (g < b ? 6 : 0)) :
  max === g ? ((b - r) / d + 2) :
  ((r - g) / d + 4);
  return { h: h * 60, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
  h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
  h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Same hue and saturation, forced to a given lightness. */
function atLightness(hex: string, l: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: Math.min(1, Math.max(0, l)) });
}

/**
 * Nudge `hex` darker (or lighter) until it reads against `against`, so a pasted
 * palette still produces a legible site instead of one that merely looks right.
 */
function forceContrast(hex: string, against: string, min: number, direction: 'darker' | 'lighter'): string {
  let out = hex;
  for (let i = 0; i < 40; i++) {
    if (contrastRatio(out, against) >= min) return out;
    const { l } = hexToHsl(out);
    const next = direction === 'darker' ? l - 0.025 : l + 0.025;
    if (next <= 0 || next >= 1) break;
    out = atLightness(out, next);
  }
  return out;
}

/**
 * Map any number of pasted colours onto the site's six roles.
 *
 * The site needs specific things — a page background, a dark text colour, a button
 * colour — so colours are assigned by lightness rather than by the order pasted,
 * and each one is then adjusted just enough to stay readable. Roles with nothing
 * to use are derived from the colours that were given.
 */
export function assignRoles(input: string[]): ThemeColors {
  const colors = input.filter(isValidHex).map(normalizeHex);
  if (colors.length === 0) {
    return { cream: '#faf6f0', sand: '#efe7dc', ink: '#1c1917', accent: '#14453b', accentDeep: '#0e322b', gold: '#b08d57' };
  }

  const byLight = [...colors].sort((a, b) => hexToHsl(a).l - hexToHsl(b).l);
  const darkest = byLight[0];
  const lightest = byLight[byLight.length - 1];

  /**
   * Pick the colour that needs the least change to reach a target lightness, so the
   * palette keeps its character. Choosing purely by saturation would darken a bright
   * yellow into olive when a green was already sitting at the right lightness.
   * Saturation only breaks ties.
   */
  const nearest = (targetL: number, exclude: string[] = []) => {
    const pool = colors.filter((c) => !exclude.includes(c));
    return [...(pool.length ? pool : colors)].sort((a, b) => {
      const da = Math.abs(hexToHsl(a).l - targetL);
      const db = Math.abs(hexToHsl(b).l - targetL);
      return Math.abs(da - db) > 0.06 ? da - db : hexToHsl(b).s - hexToHsl(a).s;
    })[0];
  };

  const cream = atLightness(lightest, Math.max(hexToHsl(lightest).l, 0.965));
  const ink = atLightness(darkest, Math.min(hexToHsl(darkest).l, 0.12));

  const accentSeed = nearest(0.32);
  const accent = forceContrast(atLightness(accentSeed, Math.min(hexToHsl(accentSeed).l, 0.32)), cream, 4.5, 'darker');
  const accentDeep = atLightness(accent, Math.max(hexToHsl(accent).l - 0.08, 0.04));

  const sand = atLightness(nearest(0.75, [accentSeed]), 0.9);

  // `gold` is the tightest role: dark enough to read on cream, light enough for ink on top.
  const goldSeed = nearest(0.52, [accentSeed]);
  let gold = atLightness(goldSeed, 0.52);
  gold = forceContrast(gold, cream, 2.4, 'darker');
  gold = forceContrast(gold, ink, 4.5, 'lighter');

  return { cream, sand, ink, accent, accentDeep, gold };
}
