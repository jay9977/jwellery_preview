import { isValidHex, normalizeHex } from './color';
import type { ThemeColors } from '../types/content';

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const h = normalizeHex(hex).slice(1);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const int = parseInt(h, 16);
  return (
    0.2126 * channel(int >> 16 & 255) +
    0.7152 * channel(int >> 8 & 255) +
    0.0722 * channel(int & 255));

}

/** WCAG contrast ratio between two hex colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  if (!isValidHex(a) || !isValidHex(b)) return NaN;
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastRule {
  fg: keyof ThemeColors;
  bg: keyof ThemeColors;
  /** Minimum acceptable ratio for how this pair is actually rendered. */
  min: number;
  /** Where the pair shows up on the site. */
  where: string;
}

/**
 * The colour pairs the landing page really renders, taken from src/index.css.
 * Body copy is held to AAA (7:1); button and badge labels to AA (4.5:1).
 * `gold` on `cream` is decorative (eyebrows, star ratings) so it gets a lower bar —
 * but it still has to stay dark enough to be visible on the page background.
 */
export const CONTRAST_RULES: ContrastRule[] = [
{ fg: 'ink', bg: 'cream', min: 7, where: 'Body text on the page background' },
{ fg: 'ink', bg: 'sand', min: 7, where: 'Body text on banded sections' },
{ fg: 'cream', bg: 'accent', min: 4.5, where: 'Primary button label' },
{ fg: 'cream', bg: 'accentDeep', min: 4.5, where: 'Primary button label on hover' },
{ fg: 'accent', bg: 'cream', min: 4.5, where: 'Secondary button label and links' },
{ fg: 'ink', bg: 'gold', min: 4.5, where: 'Label on the gold badge' },
{ fg: 'gold', bg: 'cream', min: 2.4, where: 'Eyebrows and star ratings' }];


export interface ContrastResult extends ContrastRule {
  ratio: number;
  ok: boolean;
}

export function checkContrast(colors: ThemeColors): ContrastResult[] {
  return CONTRAST_RULES.map((rule) => {
    const ratio = contrastRatio(colors[rule.fg], colors[rule.bg]);
    // An unparseable hex is flagged elsewhere; don't also report it as a contrast failure.
    return { ...rule, ratio, ok: Number.isNaN(ratio) || ratio >= rule.min };
  });
}

export function contrastFailures(colors: ThemeColors): ContrastResult[] {
  return checkContrast(colors).filter((r) => !r.ok);
}
