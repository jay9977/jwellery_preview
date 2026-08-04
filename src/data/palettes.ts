import type { FontPair, Palette } from '../types/content';

/**
 * Colour roles (see COLOR_FIELDS below and src/index.css):
 *   cream      page background            sand   banded section background
 *   ink        headlines + body copy      accent buttons and dark panels
 *   accentDeep button hover / testimonials
 *   gold       eyebrows, stars, links, and the gold badge (ink sits on top of it)
 *
 * Every palette is checked against the pairs those roles actually render as:
 * ink on cream/sand, cream on accent/accentDeep, accent on cream, and ink on gold.
 * `gold` is the tightest role — it has to stay dark enough to read on cream and
 * light enough for ink to read on top of it, which keeps it a mid-tone.
 */
export const PALETTES: Palette[] = [
/* ---------- Signature ---------- */
{
  id: 'emerald-ivory',
  name: 'Emerald & Ivory',
  description: 'Classic fine-jewellery house',
  colors: {
    cream: '#faf6f0',
    sand: '#efe7dc',
    ink: '#1c1917',
    accent: '#14453b',
    accentDeep: '#0e322b',
    gold: '#b08d57'
  }
},
{
  id: 'rose-blush',
  name: 'Rose & Blush',
  description: 'Soft, romantic, bridal',
  colors: {
    cream: '#fdf6f3',
    sand: '#f4e3dd',
    ink: '#2a1c1a',
    accent: '#9c4a52',
    accentDeep: '#7b353c',
    gold: '#c08a72'
  }
},
{
  id: 'midnight-champagne',
  name: 'Midnight & Champagne',
  description: 'Dark, modern, high jewellery',
  colors: {
    cream: '#f7f5f2',
    sand: '#e6e2db',
    ink: '#14161c',
    accent: '#1f2937',
    accentDeep: '#111827',
    gold: '#a4841c'
  }
},
{
  id: 'sapphire-ice',
  name: 'Sapphire & Ice',
  description: 'Cool, crisp, diamond-forward',
  colors: {
    cream: '#f6f8fb',
    sand: '#e3e9f2',
    ink: '#14203a',
    accent: '#1d3f76',
    accentDeep: '#152e56',
    gold: '#7891b3'
  }
},
{
  id: 'terracotta-heritage',
  name: 'Terracotta Heritage',
  description: 'Warm, traditional, festive',
  colors: {
    cream: '#fbf5ec',
    sand: '#f0e2cd',
    ink: '#2b1d13',
    accent: '#8c3b1e',
    accentDeep: '#6d2c14',
    gold: '#c08b3e'
  }
},
{
  id: 'onyx-luxe',
  name: 'Onyx Luxe',
  description: 'Minimal monochrome',
  colors: {
    cream: '#f7f7f5',
    sand: '#e7e7e3',
    ink: '#121212',
    accent: '#2b2b2b',
    accentDeep: '#000000',
    gold: '#9a9689'
  }
},

/* ---------- Fresh & bright ---------- */
{
  id: 'mint-pearl',
  name: 'Mint & Pearl',
  description: 'Fresh, airy, contemporary',
  colors: {
    cream: '#f3fbf7',
    sand: '#dcf0e6',
    ink: '#11211b',
    accent: '#1c6b4f',
    accentDeep: '#12503a',
    gold: '#5f9d7d'
  }
},
{
  id: 'lagoon-breeze',
  name: 'Lagoon Breeze',
  description: 'Fresh turquoise, coastal light',
  colors: {
    cream: '#f1fafb',
    sand: '#d8eff2',
    ink: '#0f2226',
    accent: '#116372',
    accentDeep: '#0b4a56',
    gold: '#4f97a4'
  }
},
{
  id: 'sea-glass',
  name: 'Sea Glass',
  description: 'Pale seafoam, spa-clean',
  colors: {
    cream: '#f2faf8',
    sand: '#dcefea',
    ink: '#152624',
    accent: '#2b6f66',
    accentDeep: '#1d544c',
    gold: '#63a096'
  }
},
{
  id: 'sky-linen',
  name: 'Sky & Linen',
  description: 'Fresh sky blue, everyday light',
  colors: {
    cream: '#f4f9fd',
    sand: '#dfeaf6',
    ink: '#142130',
    accent: '#1f5f96',
    accentDeep: '#164871',
    gold: '#5d94bd'
  }
},
{
  id: 'matcha-cream',
  name: 'Matcha & Cream',
  description: 'Fresh green tea, calm and modern',
  colors: {
    cream: '#f8faf0',
    sand: '#e8eeda',
    ink: '#1d2413',
    accent: '#4a6b25',
    accentDeep: '#374f1b',
    gold: '#8ba455'
  }
},
{
  id: 'citrus-bloom',
  name: 'Citrus Bloom',
  description: 'Bright, zesty, summer-forward',
  colors: {
    cream: '#fdfaef',
    sand: '#f6efd4',
    ink: '#22200f',
    accent: '#6b6416',
    accentDeep: '#4f4a10',
    gold: '#a89b2f'
  }
},
{
  id: 'coral-reef',
  name: 'Coral Reef',
  description: 'Fresh coral, warm and playful',
  colors: {
    cream: '#fff6f3',
    sand: '#fbe3db',
    ink: '#2a1713',
    accent: '#a8402a',
    accentDeep: '#8b3624',
    gold: '#d1826a'
  }
},
{
  id: 'peach-sorbet',
  name: 'Peach Sorbet',
  description: 'Soft fresh peach, light and sweet',
  colors: {
    cream: '#fff7f0',
    sand: '#fce7d5',
    ink: '#2b1d12',
    accent: '#a8552a',
    accentDeep: '#83401e',
    gold: '#cf8d5f'
  }
},
{
  id: 'lilac-mist',
  name: 'Lilac Mist',
  description: 'Fresh lavender, delicate and modern',
  colors: {
    cream: '#f9f6fd',
    sand: '#eae2f5',
    ink: '#1f1a2b',
    accent: '#5b4292',
    accentDeep: '#443070',
    gold: '#9683c0'
  }
},
{
  id: 'spring-meadow',
  name: 'Spring Meadow',
  description: 'Fresh grass green, optimistic',
  colors: {
    cream: '#f5fbf2',
    sand: '#dff0d8',
    ink: '#16240f',
    accent: '#2f6b2a',
    accentDeep: '#22521e',
    gold: '#6da35f'
  }
},
{
  id: 'berry-fresh',
  name: 'Berry Fresh',
  description: 'Bright raspberry, youthful',
  colors: {
    cream: '#fdf5f8',
    sand: '#f7dfe8',
    ink: '#26141b',
    accent: '#9c2f5c',
    accentDeep: '#7a2247',
    gold: '#c9738f'
  }
},
{
  id: 'aquamarine-ice',
  name: 'Aquamarine Ice',
  description: 'Fresh aqua, gemstone-clear',
  colors: {
    cream: '#f2fbfb',
    sand: '#d9f0f0',
    ink: '#102324',
    accent: '#14666a',
    accentDeep: '#0d4d50',
    gold: '#4f9b9f'
  }
},
{
  id: 'peridot-fresh',
  name: 'Peridot',
  description: 'Fresh yellow-green gemstone',
  colors: {
    cream: '#f9fbef',
    sand: '#eaf0d6',
    ink: '#1e2412',
    accent: '#526b1f',
    accentDeep: '#3d5017',
    gold: '#93a84c'
  }
},

/* ---------- Jewel tones ---------- */
{
  id: 'amethyst-royale',
  name: 'Amethyst Royale',
  description: 'Deep violet, regal',
  colors: {
    cream: '#f8f6fb',
    sand: '#e7e1f0',
    ink: '#1b1526',
    accent: '#4b2d7f',
    accentDeep: '#382060',
    gold: '#a58bc9'
  }
},
{
  id: 'ruby-noir',
  name: 'Ruby Noir',
  description: 'Deep red on charcoal, dramatic',
  colors: {
    cream: '#faf6f6',
    sand: '#eddede',
    ink: '#1a1113',
    accent: '#8e1c2b',
    accentDeep: '#6d1420',
    gold: '#bf7c72'
  }
},
{
  id: 'jade-empire',
  name: 'Jade Empire',
  description: 'Imperial jade, heritage green',
  colors: {
    cream: '#f4f9f5',
    sand: '#dfece1',
    ink: '#14201a',
    accent: '#20624a',
    accentDeep: '#164936',
    gold: '#7ba58a'
  }
},
{
  id: 'garnet-gold',
  name: 'Garnet & Gold',
  description: 'Rich wine red with warm gold',
  colors: {
    cream: '#fbf6f2',
    sand: '#f0e0d6',
    ink: '#231313',
    accent: '#7a2436',
    accentDeep: '#5c1927',
    gold: '#bd8a4e'
  }
},
{
  id: 'topaz-amber',
  name: 'Topaz Amber',
  description: 'Warm amber, honeyed light',
  colors: {
    cream: '#fdf8ef',
    sand: '#f6e8cf',
    ink: '#261c0f',
    accent: '#8a5514',
    accentDeep: '#6a400e',
    gold: '#c3903c'
  }
},
{
  id: 'tanzanite-dusk',
  name: 'Tanzanite Dusk',
  description: 'Violet-blue twilight',
  colors: {
    cream: '#f6f7fc',
    sand: '#e2e5f3',
    ink: '#161a2e',
    accent: '#33408c',
    accentDeep: '#252f6b',
    gold: '#8d95c9'
  }
},
{
  id: 'peacock-plume',
  name: 'Peacock Plume',
  description: 'Teal-blue with festive depth',
  colors: {
    cream: '#f3f9fa',
    sand: '#daebee',
    ink: '#0f2029',
    accent: '#0f5a6e',
    accentDeep: '#0a4252',
    gold: '#c19a4b'
  }
},
{
  id: 'opal-iridescent',
  name: 'Opal',
  description: 'Pale iridescent, soft and luminous',
  colors: {
    cream: '#f7f8fb',
    sand: '#e6e9f1',
    ink: '#1b1e26',
    accent: '#476080',
    accentDeep: '#334760',
    gold: '#9d93ab'
  }
},

/* ---------- Warm neutrals ---------- */
{
  id: 'mocha-cream',
  name: 'Mocha & Cream',
  description: 'Soft coffee neutrals',
  colors: {
    cream: '#faf7f3',
    sand: '#ece2d7',
    ink: '#231c16',
    accent: '#5c4433',
    accentDeep: '#453227',
    gold: '#a98b6b'
  }
},
{
  id: 'sand-dune',
  name: 'Sand Dune',
  description: 'Desert nude, understated',
  colors: {
    cream: '#fcf9f3',
    sand: '#f0e7d8',
    ink: '#272117',
    accent: '#6e5b38',
    accentDeep: '#54452a',
    gold: '#af9663'
  }
},
{
  id: 'olive-atelier',
  name: 'Olive Atelier',
  description: 'Muted olive, quietly luxe',
  colors: {
    cream: '#f9f9f1',
    sand: '#e9e9d7',
    ink: '#202213',
    accent: '#4d5526',
    accentDeep: '#3a411c',
    gold: '#93985c'
  }
},
{
  id: 'copper-patina',
  name: 'Copper Patina',
  description: 'Aged copper with verdigris',
  colors: {
    cream: '#f9f7f2',
    sand: '#e9e3d6',
    ink: '#221c15',
    accent: '#7a4526',
    accentDeep: '#5c331b',
    gold: '#b38358'
  }
},
{
  id: 'charcoal-rose',
  name: 'Charcoal & Rose',
  description: 'Cool grey warmed with dusty pink',
  colors: {
    cream: '#f8f7f7',
    sand: '#e6e3e3',
    ink: '#1b1a1c',
    accent: '#42393d',
    accentDeep: '#2e2729',
    gold: '#b4838c'
  }
},

/* ---------- Cool neutrals ---------- */
{
  id: 'slate-silver',
  name: 'Slate & Silver',
  description: 'Modern grey, platinum-forward',
  colors: {
    cream: '#f7f8f9',
    sand: '#e5e8ea',
    ink: '#171a1c',
    accent: '#3b474e',
    accentDeep: '#2a3338',
    gold: '#8b9aa3'
  }
},
{
  id: 'platinum-frost',
  name: 'Platinum Frost',
  description: 'Icy neutral, bridal white',
  colors: {
    cream: '#f8fafb',
    sand: '#e7edf0',
    ink: '#151b1e',
    accent: '#2f4f5c',
    accentDeep: '#213943',
    gold: '#7d9aa6'
  }
},
{
  id: 'royal-indigo',
  name: 'Royal Indigo',
  description: 'Deep indigo, evening formal',
  colors: {
    cream: '#f6f7fa',
    sand: '#e3e6ef',
    ink: '#131728',
    accent: '#2a3570',
    accentDeep: '#1d2653',
    gold: '#8891bd'
  }
},
{
  id: 'forest-fern',
  name: 'Forest Fern',
  description: 'Deep woodland green',
  colors: {
    cream: '#f5f8f4',
    sand: '#e0e9dd',
    ink: '#151d15',
    accent: '#2c4a2c',
    accentDeep: '#1f371f',
    gold: '#7d9a72'
  }
},

/* ---------- Festive / Indian bridal ---------- */
{
  id: 'kundan-maroon',
  name: 'Kundan Maroon',
  description: 'Bridal maroon with kundan gold',
  colors: {
    cream: '#fdf7f2',
    sand: '#f4e2d6',
    ink: '#241412',
    accent: '#7e1f2b',
    accentDeep: '#5f151f',
    gold: '#c1913f'
  }
},
{
  id: 'marigold-festive',
  name: 'Marigold Festive',
  description: 'Saffron and marigold, celebration',
  colors: {
    cream: '#fff9ee',
    sand: '#fbebcd',
    ink: '#2a1d0c',
    accent: '#a05a10',
    accentDeep: '#7c440b',
    gold: '#c9922e'
  }
},
{
  id: 'mehendi-green',
  name: 'Mehendi Green',
  description: 'Henna green with antique gold',
  colors: {
    cream: '#f9faef',
    sand: '#e9edd4',
    ink: '#1e2412',
    accent: '#45591f',
    accentDeep: '#334216',
    gold: '#a08f45'
  }
},
{
  id: 'temple-gold',
  name: 'Temple Gold',
  description: 'Antique temple jewellery tones',
  colors: {
    cream: '#fdf9f0',
    sand: '#f4e9d2',
    ink: '#282013',
    accent: '#7d5a1c',
    accentDeep: '#5f4414',
    gold: '#b59440'
  }
}];


/**
 * Display grouping for the palette picker. Ids not listed here fall into "More".
 * Kept separate from the palette objects so adding a palette is a single edit.
 */
export const PALETTE_GROUPS: {name: string;ids: string[];}[] = [
{
  name: 'Signature',
  ids: ['emerald-ivory', 'rose-blush', 'midnight-champagne', 'sapphire-ice', 'terracotta-heritage', 'onyx-luxe']
},
{
  name: 'Fresh & bright',
  ids: [
  'mint-pearl', 'lagoon-breeze', 'sea-glass', 'sky-linen', 'matcha-cream', 'citrus-bloom',
  'coral-reef', 'peach-sorbet', 'lilac-mist', 'spring-meadow', 'berry-fresh', 'aquamarine-ice',
  'peridot-fresh']

},
{
  name: 'Jewel tones',
  ids: [
  'amethyst-royale', 'ruby-noir', 'jade-empire', 'garnet-gold', 'topaz-amber',
  'tanzanite-dusk', 'peacock-plume', 'opal-iridescent']

},
{
  name: 'Warm neutrals',
  ids: ['mocha-cream', 'sand-dune', 'olive-atelier', 'copper-patina', 'charcoal-rose']
},
{
  name: 'Cool neutrals',
  ids: ['slate-silver', 'platinum-frost', 'royal-indigo', 'forest-fern']
},
{
  name: 'Festive & bridal',
  ids: ['kundan-maroon', 'marigold-festive', 'mehendi-green', 'temple-gold']
}];


export const CUSTOM_PALETTE_PREFIX = 'custom-';

export const isCustomPaletteId = (id: string) => id.startsWith(CUSTOM_PALETTE_PREFIX);

export const FONT_PAIRS: FontPair[] = [
{
  id: 'atelier',
  name: 'Classic Atelier',
  display: '"Cormorant Garamond", Georgia, serif',
  body: 'Jost, ui-sans-serif, system-ui, sans-serif'
},
{
  id: 'editorial',
  name: 'Modern Editorial',
  display: '"Playfair Display", Georgia, serif',
  body: 'Inter, ui-sans-serif, system-ui, sans-serif'
},
{
  id: 'heritage',
  name: 'Heritage',
  display: 'Marcellus, Georgia, serif',
  body: 'Karla, ui-sans-serif, system-ui, sans-serif'
},
{
  id: 'warm',
  name: 'Warm Contemporary',
  display: 'Lora, Georgia, serif',
  body: '"Work Sans", ui-sans-serif, system-ui, sans-serif'
}];


export const COLOR_FIELDS: {key: keyof Palette['colors'];label: string;hint: string;}[] = [
{ key: 'cream', label: 'Page background', hint: 'Main light surface' },
{ key: 'sand', label: 'Alternate background', hint: 'Banded sections' },
{ key: 'ink', label: 'Text & footer', hint: 'Headlines and body copy' },
{ key: 'accent', label: 'Accent', hint: 'Buttons and dark panels' },
{ key: 'accentDeep', label: 'Accent (deep)', hint: 'Hover and testimonials' },
{ key: 'gold', label: 'Highlight', hint: 'Eyebrows, stars, links' }];
