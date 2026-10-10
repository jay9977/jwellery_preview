import type { TemplateId } from '../types/content';

/*
 * A template is a recipe: one layout per section, a light or dark canvas, a shape
 * language and a motion style. Twelve recipes over the same section variants give
 * twelve sites that look, move and feel different — and a new template is one entry here.
 */

export type HeroLayout = 'story' | 'card' | 'center' | 'split' | 'collage';
/** How the jewellery moves in the product-first story hero before the model is revealed. */
export type Intro = 'orbit' | 'fan' | 'rail';
export type CategoriesLayout = 'grid' | 'arch' | 'circle' | 'scroll';
export type FeaturedLayout = 'cards' | 'framed' | 'minimal' | 'spotlight';
export type PromoLayout = 'split' | 'parallax' | 'band';
export type TrustLayout = 'row' | 'diamond' | 'cards';
export type TestimonialsLayout = 'grid' | 'carousel';
export type EditorialLayout = 'side' | 'arch' | 'overlap';
export type GalleryLayout = 'grid' | 'mosaic' | 'strip';

/** How sections enter as they scroll into view. */
export type Motion = 'fade' | 'curtain' | 'zoom' | 'slide' | 'blur';
/** Corner language for images, cards and buttons. */
export type Shape = 'sharp' | 'soft' | 'round' | 'arch';
/** What photos and cards do under the pointer. */
export type Hover = 'zoom' | 'mono' | 'bright' | 'tilt' | 'glow';
/** What happens as the page scrolls. */
export type ScrollFx = 'none' | 'parallax' | 'scale' | 'progress';

export interface TemplateDef {
  id: TemplateId;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  shape: Shape;
  motion: Motion;
  hover: Hover;
  scroll: ScrollFx;
  intro: Intro;
  /** A soft light that follows the pointer — dark templates only. */
  cursorGlow?: boolean;
  /** Suggested palette and font pair — picked automatically for a new client, changeable after. */
  palette: string;
  font: string;
  layout: {
    hero: HeroLayout;
    categories: CategoriesLayout;
    featured: FeaturedLayout;
    promo: PromoLayout;
    trust: TrustLayout;
    testimonials: TestimonialsLayout;
    editorial: EditorialLayout;
    gallery: GalleryLayout;
  };
}

export const TEMPLATES: TemplateDef[] = [
{
  id: 'classic',
  name: 'Classic Maison',
  description: 'Light and editorial. Gentle fades, image zoom on hover.',
  mode: 'light', shape: 'sharp', motion: 'fade', hover: 'zoom', scroll: 'none',
  intro: 'fan', palette: 'emerald-ivory', font: 'atelier',
  layout: { hero: 'story', categories: 'grid', featured: 'cards', promo: 'split', trust: 'row', testimonials: 'grid', editorial: 'side', gallery: 'grid' }
},
{
  id: 'royal',
  name: 'Royal Heritage',
  description: 'Dark and gold. Arch frames, parallax, curtain reveals.',
  mode: 'dark', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax', cursorGlow: true,
  intro: 'orbit', palette: 'midnight-champagne', font: 'atelier',
  layout: { hero: 'story', categories: 'arch', featured: 'framed', promo: 'parallax', trust: 'diamond', testimonials: 'carousel', editorial: 'arch', gallery: 'mosaic' }
},
{
  id: 'modern',
  name: 'Modern Minimal',
  description: 'Bold split hero, word-by-word reveals, horizontal collections.',
  mode: 'light', shape: 'sharp', motion: 'slide', hover: 'mono', scroll: 'progress',
  intro: 'rail', palette: 'platinum-frost', font: 'editorial',
  layout: { hero: 'story', categories: 'scroll', featured: 'minimal', promo: 'band', trust: 'row', testimonials: 'carousel', editorial: 'overlap', gallery: 'strip' }
},
{
  id: 'blush',
  name: 'Bridal Blush',
  description: 'Soft and romantic. Floating photo collage, round shapes, dreamy blur-in.',
  mode: 'light', shape: 'round', motion: 'blur', hover: 'bright', scroll: 'scale',
  intro: 'fan', palette: 'rose-blush', font: 'warm',
  layout: { hero: 'story', categories: 'circle', featured: 'cards', promo: 'band', trust: 'cards', testimonials: 'carousel', editorial: 'overlap', gallery: 'mosaic' }
},
{
  id: 'temple',
  name: 'Temple Gold',
  description: 'Warm heritage gold, arch frames and diamond ornaments.',
  mode: 'light', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax',
  intro: 'orbit', palette: 'temple-gold', font: 'heritage',
  layout: { hero: 'story', categories: 'arch', featured: 'framed', promo: 'parallax', trust: 'diamond', testimonials: 'carousel', editorial: 'arch', gallery: 'grid' }
},
{
  id: 'midnight',
  name: 'Midnight Diamond',
  description: 'Dark, sharp and cinematic. Spotlight products, zoom reveals.',
  mode: 'dark', shape: 'sharp', motion: 'zoom', hover: 'tilt', scroll: 'scale', cursorGlow: true,
  intro: 'rail', palette: 'onyx-luxe', font: 'editorial',
  layout: { hero: 'story', categories: 'grid', featured: 'spotlight', promo: 'parallax', trust: 'row', testimonials: 'grid', editorial: 'overlap', gallery: 'mosaic' }
},
{
  id: 'polki',
  name: 'Polki Palace',
  description: 'Deep maroon grandeur, round collections, flowing strip gallery.',
  mode: 'dark', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax', cursorGlow: true,
  intro: 'orbit', palette: 'kundan-maroon', font: 'heritage',
  layout: { hero: 'story', categories: 'circle', featured: 'framed', promo: 'band', trust: 'diamond', testimonials: 'carousel', editorial: 'arch', gallery: 'strip' }
},
{
  id: 'pearl',
  name: 'Pearl Garden',
  description: 'Fresh and airy. Rounded cards, circle collections, soft fades.',
  mode: 'light', shape: 'round', motion: 'fade', hover: 'bright', scroll: 'progress',
  intro: 'fan', palette: 'mint-pearl', font: 'warm',
  layout: { hero: 'story', categories: 'circle', featured: 'minimal', promo: 'split', trust: 'cards', testimonials: 'carousel', editorial: 'side', gallery: 'strip' }
},
{
  id: 'emerald',
  name: 'Emerald Atelier',
  description: 'Rich green and gold, split hero, arch collections, sliding entries.',
  mode: 'light', shape: 'soft', motion: 'slide', hover: 'tilt', scroll: 'parallax',
  intro: 'rail', palette: 'emerald-ivory', font: 'atelier',
  layout: { hero: 'story', categories: 'arch', featured: 'cards', promo: 'parallax', trust: 'diamond', testimonials: 'grid', editorial: 'overlap', gallery: 'mosaic' }
},
{
  id: 'velvet',
  name: 'Velvet Noir',
  description: 'Moody and luxurious. Floating collage, scrolling collections, blur-in.',
  mode: 'dark', shape: 'soft', motion: 'blur', hover: 'mono', scroll: 'scale', cursorGlow: true,
  intro: 'orbit', palette: 'ruby-noir', font: 'editorial',
  layout: { hero: 'story', categories: 'scroll', featured: 'framed', promo: 'band', trust: 'cards', testimonials: 'carousel', editorial: 'side', gallery: 'grid' }
},
{
  id: 'sunlit',
  name: 'Sunlit Gold',
  description: 'Bright festive gold, centred hero, spotlight bestsellers, zoom-in.',
  mode: 'light', shape: 'soft', motion: 'zoom', hover: 'bright', scroll: 'parallax',
  intro: 'fan', palette: 'marigold-festive', font: 'heritage',
  layout: { hero: 'story', categories: 'grid', featured: 'spotlight', promo: 'split', trust: 'row', testimonials: 'carousel', editorial: 'arch', gallery: 'strip' }
},
{
  id: 'heirloom',
  name: 'Heirloom',
  description: 'Timeless and quiet. Overlay hero, horizontal collections, curtain reveals.',
  mode: 'light', shape: 'sharp', motion: 'curtain', hover: 'mono', scroll: 'scale',
  intro: 'rail', palette: 'mocha-cream', font: 'atelier',
  layout: { hero: 'story', categories: 'scroll', featured: 'framed', promo: 'parallax', trust: 'diamond', testimonials: 'grid', editorial: 'overlap', gallery: 'mosaic' }
}];


export function templateById(id: string | undefined): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
