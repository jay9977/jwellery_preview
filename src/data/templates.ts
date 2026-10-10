import type { TemplateId } from '../types/content';

/*
 * A template is a recipe: a hero, a header, one layout per section, fonts, a light or
 * dark canvas, a shape language, a motion style, and hover and scroll effects. Every
 * template has its own hero, and no two share the same hero + header + font.
 *
 * 'original' is the design the platform started with (Giriraj). It renders exactly as
 * it always did — none of the newer touches apply to it.
 */

export type HeroLayout =
'card' | 'center' | 'split' | 'collage' | 'story-orbit' | 'story-fan' | 'story-rail' |
'marquee' | 'spotlight' | 'bento' | 'zoom' | 'columns' | 'coverflow' |
'textmask' | 'horizontal' | 'curtain' | 'stack';
export type HeaderStyle = 'original' | 'center' | 'left' | 'minimal' | 'pill';
export type CategoriesLayout = 'grid' | 'arch' | 'circle' | 'scroll' | 'accordion' | 'list';
export type FeaturedLayout = 'cards' | 'framed' | 'minimal' | 'spotlight' | 'carousel';
export type PromoLayout = 'split' | 'parallax' | 'band' | 'textmask';
export type TrustLayout = 'row' | 'diamond' | 'cards' | 'marquee';
export type TestimonialsLayout = 'grid' | 'carousel' | 'marquee' | 'stack';
export type EditorialLayout = 'side' | 'arch' | 'overlap' | 'sticky';
export type GalleryLayout = 'grid' | 'mosaic' | 'strip' | 'masonry';
export type JournalLayout = 'grid' | 'list' | 'feature';
export type FaqLayout = 'accordion' | 'cards' | 'sticky';
export type NewsletterLayout = 'centered' | 'banner' | 'glass';

/** How sections enter as they scroll into view. */
export type Motion = 'fade' | 'curtain' | 'zoom' | 'slide' | 'blur';
/** Corner language for images, cards and buttons. */
export type Shape = 'sharp' | 'soft' | 'round' | 'arch';
/** What photos and cards do under the pointer. */
export type Hover = 'zoom' | 'mono' | 'bright' | 'tilt' | 'glow';
/** What happens as the page scrolls. */
export type ScrollFx = 'none' | 'parallax' | 'scale' | 'progress';
/** How the jewellery moves in the story heroes before the model is revealed. */
export type Intro = 'orbit' | 'fan' | 'rail';

export interface TemplateDef {
  id: TemplateId;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  header: HeaderStyle;
  shape: Shape;
  motion: Motion;
  hover: Hover;
  scroll: ScrollFx;
  /** A soft light that follows the pointer. */
  cursorGlow?: boolean;
  /** Suggested palette and font pair — applied when the template is chosen. */
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
    journal: JournalLayout;
    faq: FaqLayout;
    newsletter: NewsletterLayout;
  };
}

export const ORIGINAL: TemplateDef = {
  id: 'original',
  name: 'Original',
  description: 'The first design, kept exactly as it was built.',
  mode: 'light', header: 'original', shape: 'sharp', motion: 'fade', hover: 'zoom', scroll: 'none',
  palette: 'emerald-ivory', font: 'atelier',
  layout: { hero: 'card', categories: 'grid', featured: 'cards', promo: 'split', trust: 'row', testimonials: 'grid', editorial: 'side', gallery: 'grid', journal: 'grid', faq: 'accordion', newsletter: 'centered' }
};

export const TEMPLATES: TemplateDef[] = [
ORIGINAL,
{
  id: 'classic',
  name: 'Classic Maison',
  description: 'Huge headline over drifting rows of jewellery. Clean, editorial, light.',
  mode: 'light', header: 'left', shape: 'sharp', motion: 'fade', hover: 'zoom', scroll: 'none',
  palette: 'emerald-ivory', font: 'editorial',
  layout: { hero: 'marquee', categories: 'grid', featured: 'cards', promo: 'split', trust: 'row', testimonials: 'grid', editorial: 'side', gallery: 'grid', journal: 'grid', faq: 'accordion', newsletter: 'centered' }
},
{
  id: 'royal',
  name: 'Royal Heritage',
  description: 'Dark & gold. Jewels orbit, then a circle opens onto the bride.',
  mode: 'dark', header: 'center', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax', cursorGlow: true,
  palette: 'midnight-champagne', font: 'atelier',
  layout: { hero: 'story-orbit', categories: 'arch', featured: 'framed', promo: 'parallax', trust: 'diamond', testimonials: 'carousel', editorial: 'arch', gallery: 'mosaic', journal: 'feature', faq: 'sticky', newsletter: 'glass' }
},
{
  id: 'modern',
  name: 'Modern Minimal',
  description: 'Bold split hero, floating pill navigation, word-by-word reveals.',
  mode: 'light', header: 'pill', shape: 'sharp', motion: 'slide', hover: 'mono', scroll: 'progress',
  palette: 'platinum-frost', font: 'syne',
  layout: { hero: 'split', categories: 'grid', featured: 'spotlight', promo: 'textmask', trust: 'cards', testimonials: 'carousel', editorial: 'overlap', gallery: 'strip', journal: 'list', faq: 'sticky', newsletter: 'centered' }
},
{
  id: 'blush',
  name: 'Bridal Blush',
  description: 'Soft romance. Floating jewellery collage, round shapes, dreamy blur-in.',
  mode: 'light', header: 'pill', shape: 'round', motion: 'blur', hover: 'bright', scroll: 'scale',
  palette: 'rose-blush', font: 'gilda',
  layout: { hero: 'collage', categories: 'scroll', featured: 'framed', promo: 'textmask', trust: 'diamond', testimonials: 'marquee', editorial: 'side', gallery: 'masonry', journal: 'list', faq: 'accordion', newsletter: 'banner' }
},
{
  id: 'temple',
  name: 'Temple Gold',
  description: 'Full-screen gold close-up with a slow push-in. Carved Cinzel type.',
  mode: 'light', header: 'center', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax',
  palette: 'temple-gold', font: 'cinzel',
  layout: { hero: 'center', categories: 'accordion', featured: 'carousel', promo: 'split', trust: 'diamond', testimonials: 'stack', editorial: 'side', gallery: 'strip', journal: 'grid', faq: 'cards', newsletter: 'glass' }
},
{
  id: 'midnight',
  name: 'Midnight Diamond',
  description: 'One jewel on a dark stage — a spotlight follows your cursor and it tilts in 3D.',
  mode: 'dark', header: 'minimal', shape: 'sharp', motion: 'zoom', hover: 'tilt', scroll: 'scale', cursorGlow: true,
  palette: 'onyx-luxe', font: 'bodoni',
  layout: { hero: 'spotlight', categories: 'circle', featured: 'minimal', promo: 'parallax', trust: 'row', testimonials: 'marquee', editorial: 'sticky', gallery: 'grid', journal: 'list', faq: 'sticky', newsletter: 'glass' }
},
{
  id: 'polki',
  name: 'Polki Palace',
  description: 'Maroon grandeur. A 3D carousel of jewels turns slowly in the hero.',
  mode: 'dark', header: 'center', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax', cursorGlow: true,
  palette: 'kundan-maroon', font: 'yeseva',
  layout: { hero: 'coverflow', categories: 'arch', featured: 'carousel', promo: 'band', trust: 'cards', testimonials: 'marquee', editorial: 'overlap', gallery: 'mosaic', journal: 'grid', faq: 'accordion', newsletter: 'glass' }
},
{
  id: 'pearl',
  name: 'Pearl Garden',
  description: 'Airy and fresh. Endless columns of jewellery glide beside the headline.',
  mode: 'light', header: 'left', shape: 'round', motion: 'fade', hover: 'bright', scroll: 'progress',
  palette: 'mint-pearl', font: 'tenor',
  layout: { hero: 'columns', categories: 'list', featured: 'minimal', promo: 'split', trust: 'cards', testimonials: 'grid', editorial: 'side', gallery: 'mosaic', journal: 'feature', faq: 'sticky', newsletter: 'banner' }
},
{
  id: 'emerald',
  name: 'Emerald Atelier',
  description: 'A bento grid hero that assembles tile by tile. Old-world serif.',
  mode: 'light', header: 'left', shape: 'soft', motion: 'slide', hover: 'tilt', scroll: 'parallax',
  palette: 'emerald-ivory', font: 'garamond',
  layout: { hero: 'bento', categories: 'scroll', featured: 'cards', promo: 'parallax', trust: 'row', testimonials: 'marquee', editorial: 'overlap', gallery: 'strip', journal: 'feature', faq: 'cards', newsletter: 'banner' }
},
{
  id: 'velvet',
  name: 'Velvet Noir',
  description: 'Moody. A small jewel zooms to fill the screen as you scroll.',
  mode: 'dark', header: 'minimal', shape: 'soft', motion: 'blur', hover: 'mono', scroll: 'scale', cursorGlow: true,
  palette: 'ruby-noir', font: 'fraunces',
  layout: { hero: 'zoom', categories: 'circle', featured: 'spotlight', promo: 'textmask', trust: 'marquee', testimonials: 'grid', editorial: 'overlap', gallery: 'masonry', journal: 'feature', faq: 'accordion', newsletter: 'glass' }
},
{
  id: 'sunlit',
  name: 'Sunlit Gold',
  description: 'Festive. Jewels fan out like cards, then the campaign appears.',
  mode: 'light', header: 'pill', shape: 'soft', motion: 'zoom', hover: 'bright', scroll: 'parallax',
  palette: 'marigold-festive', font: 'dmserif',
  layout: { hero: 'story-fan', categories: 'grid', featured: 'framed', promo: 'band', trust: 'marquee', testimonials: 'stack', editorial: 'sticky', gallery: 'masonry', journal: 'grid', faq: 'sticky', newsletter: 'banner' }
},
{
  id: 'heirloom',
  name: 'Heirloom',
  description: 'Quiet and timeless. Jewels glide past in a rail, then the story opens.',
  mode: 'light', header: 'minimal', shape: 'sharp', motion: 'curtain', hover: 'mono', scroll: 'scale',
  palette: 'mocha-cream', font: 'prata',
  layout: { hero: 'story-rail', categories: 'accordion', featured: 'cards', promo: 'parallax', trust: 'cards', testimonials: 'stack', editorial: 'sticky', gallery: 'masonry', journal: 'feature', faq: 'accordion', newsletter: 'centered' }
},
{
  id: 'aurora',
  name: 'Aurora',
  description: 'Dark and luminous. The jewellery shows through giant letters that fly at you as you scroll.',
  mode: 'dark', header: 'minimal', shape: 'soft', motion: 'blur', hover: 'glow', scroll: 'scale', cursorGlow: true,
  palette: 'tanzanite-dusk', font: 'italiana',
  layout: { hero: 'textmask', categories: 'arch', featured: 'minimal', promo: 'band', trust: 'marquee', testimonials: 'grid', editorial: 'arch', gallery: 'strip', journal: 'list', faq: 'cards', newsletter: 'centered' }
},
{
  id: 'celeste',
  name: 'Celeste',
  description: 'Light and airy. Scrolling turns sideways and the collection glides past like a gallery walk.',
  mode: 'light', header: 'pill', shape: 'round', motion: 'slide', hover: 'bright', scroll: 'progress',
  palette: 'sky-linen', font: 'warm',
  layout: { hero: 'horizontal', categories: 'list', featured: 'spotlight', promo: 'band', trust: 'diamond', testimonials: 'carousel', editorial: 'sticky', gallery: 'grid', journal: 'feature', faq: 'cards', newsletter: 'centered' }
},
{
  id: 'rani',
  name: 'Rani Kundan',
  description: 'Royal theatre. Velvet curtains part on a jewel framed by a turning ring of gold words.',
  mode: 'dark', header: 'center', shape: 'arch', motion: 'curtain', hover: 'glow', scroll: 'parallax', cursorGlow: true,
  palette: 'garnet-gold', font: 'heritage',
  layout: { hero: 'curtain', categories: 'circle', featured: 'spotlight', promo: 'textmask', trust: 'row', testimonials: 'stack', editorial: 'arch', gallery: 'mosaic', journal: 'grid', faq: 'cards', newsletter: 'banner' }
},
{
  id: 'solitaire',
  name: 'Solitaire',
  description: 'Minimal and exact. A stack of jewels lifts away card by card, then the piece is worn.',
  mode: 'light', header: 'left', shape: 'sharp', motion: 'zoom', hover: 'mono', scroll: 'scale',
  palette: 'slate-silver', font: 'bellefair',
  layout: { hero: 'stack', categories: 'accordion', featured: 'carousel', promo: 'split', trust: 'marquee', testimonials: 'carousel', editorial: 'arch', gallery: 'grid', journal: 'list', faq: 'accordion', newsletter: 'banner' }
}];


/** Content saved before templates existed has no id — that content is the original design. */
export function templateById(id: string | undefined): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? ORIGINAL;
}
