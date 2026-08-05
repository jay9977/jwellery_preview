/** Sections that ship with the product and have their own bespoke component. */
export type BuiltInSectionId =
'hero' |
'categories' |
'featured' |
'promo' |
'trust' |
'testimonials' |
'editorial' |
'gallery' |
'journal' |
'faq' |
'contact' |
'newsletter';

/**
 * Any section id on the page. Built-in ids are suggested by autocomplete, but
 * sections created from the admin panel get their own generated ids.
 * The `Record<never, never>` intersection is what keeps the literal suggestions
 * alive — a plain `string` would swallow them.
 */
export type SectionId = BuiltInSectionId | (string & Record<never, never>);

export type IconKey = 'gem' | 'truck' | 'shield' | 'refresh' | 'award' | 'headset';

/** Platforms the social/media links can point at. `website` is the catch-all. */
export type SocialPlatform =
'instagram' |
'facebook' |
'youtube' |
'twitter' |
'linkedin' |
'pinterest' |
'tiktok' |
'whatsapp' |
'telegram' |
'email' |
'website';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ThemeColors {
  cream: string;
  sand: string;
  ink: string;
  accent: string;
  accentDeep: string;
  gold: string;
}

export interface Palette {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface FontPair {
  id: string;
  name: string;
  display: string;
  body: string;
}

export interface Theme {
  paletteId: string;
  fontId: string;
  colors: ThemeColors;
  /** Palettes the admin saved themselves. Stored with the content, so they sync to the server. */
  customPalettes?: Palette[];
}

export interface Brand {
  name: string;
  tagline: string;
  phone: string;
  /** Logo image shown at the start of the header, beside the nav. Empty hides it. */
  headerLogo: string;
  /** Rendered header logo height in px. The header bar is 72px tall. */
  headerLogoHeight: number;
  /** Logo image shown in the Contact section. Empty hides it. */
  logo: string;
  /** Rendered Contact-section logo height in px — logos vary wildly in aspect ratio. */
  logoHeight: number;
  /** Footer logo image. Empty falls back to the store name as text. */
  footerLogo: string;
  /** Rendered footer logo height in px. */
  footerLogoHeight: number;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface AnnouncementSection {
  visible: boolean;
  message: string;
  linkLabel: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  image: string;
}

export interface HeroSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  autoplay: boolean;
  slides: HeroSlide[];
}

export interface CategoryItem {
  id: string;
  title: string;
  caption: string;
  image: string;
}

export interface CategoriesSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  items: CategoryItem[];
}

export interface Product {
  id: string;
  name: string;
  metal: string;
  price: string;
  compareAt: string;
  badge: string;
  image: string;
  /**
   * Jewellery specifications for the quick view, one per line as `Label: Value`
   * (e.g. `Purity: 22K BIS Hallmarked`). Empty hides the table.
   */
  specs: string;
}

export interface FeaturedSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Label on the enquiry button under every product. */
  enquiryLabel: string;
  /** Trust badges shown in the quick view, comma separated (e.g. `BIS Hallmarked, Certified`). */
  trustBadges: string;
  items: Product[];
}

export interface PromoSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  couponCode: string;
  image: string;
}

export interface TrustItem {
  id: string;
  icon: IconKey;
  title: string;
  text: string;
}

export interface TrustSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  title: string;
  items: TrustItem[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
}

export interface TestimonialsSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  items: Testimonial[];
}

export interface EditorialSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  image: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
}

export interface NewsletterSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  title: string;
  body: string;
  ctaLabel: string;
  note: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string;
}

export interface GallerySection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  handle: string;
  items: GalleryItem[];
}

export interface JournalPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

export interface JournalSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  items: JournalPost[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  items: FaqItem[];
}

export interface FooterContent {
  about: string;
  columns: {
    id: string;
    title: string;
    links: NavItem[];
  }[];
  copyright: string;
  /** Social / media links. Rendered in the footer and in the Contact section. */
  social: SocialLink[];
}

export interface ContactSection {
  visible: boolean;
  /** Admin-editable display name. Falls back to the built-in label. */
  label?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Blank fields are hidden rather than rendered empty. */
  address: string;
  phone: string;
  email: string;
  hours: string;
  whatsapp: string;
  /** Google Maps "Embed a map" src URL. Blank hides the map. */
  mapEmbedUrl: string;
  showForm: boolean;
  formTitle: string;
  formNote: string;
  formCtaLabel: string;
  successMessage: string;
  showSocial: boolean;
}

/* ---------- Sections created from the admin panel ---------- */

/** Layouts a custom section can be rendered with. */
export type CustomLayout = 'text' | 'cards' | 'banner' | 'gallery' | 'video';

/** Background band a custom section sits on. */
export type SectionBackground = 'cream' | 'sand' | 'ink';

export interface CustomItem {
  id: string;
  title: string;
  text: string;
  image: string;
  /**
   * YouTube / Vimeo link or a video-file URL. When set it replaces `image`
   * as the item's media, so a grid can mix photos and videos.
   */
  video: string;
  linkLabel: string;
  linkHref: string;
}

export interface CustomSection {
  /** Discriminator: present only on admin-created sections. */
  kind: 'custom';
  visible: boolean;
  label?: string;
  layout: CustomLayout;
  background: SectionBackground;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Used by the `text` layout. Blank lines start a new paragraph. */
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Used by the `banner` layout. */
  image: string;
  /** Used by the `video` layout: a YouTube / Vimeo link or a video-file URL. */
  video: string;
  /** Poster frame shown before a video *file* plays. YouTube and Vimeo supply their own. */
  videoPoster: string;
  /** Used by the `cards`, `gallery` and `video` layouts. */
  items: CustomItem[];
}

export type SiteSection =
HeroSection |
CategoriesSection |
FeaturedSection |
PromoSection |
TrustSection |
TestimonialsSection |
EditorialSection |
GallerySection |
JournalSection |
FaqSection |
ContactSection |
NewsletterSection |
CustomSection;

export interface Sections {
  hero: HeroSection;
  categories: CategoriesSection;
  featured: FeaturedSection;
  promo: PromoSection;
  trust: TrustSection;
  testimonials: TestimonialsSection;
  editorial: EditorialSection;
  gallery: GallerySection;
  journal: JournalSection;
  faq: FaqSection;
  contact: ContactSection;
  newsletter: NewsletterSection;
  /** Sections added from the admin panel, keyed by their generated id. */
  [id: string]: SiteSection;
}

export interface SiteContent {
  theme: Theme;
  seo: SeoSettings;
  brand: Brand;
  nav: NavItem[];
  announcement: AnnouncementSection;
  order: SectionId[];
  sections: Sections;
  footer: FooterContent;
}