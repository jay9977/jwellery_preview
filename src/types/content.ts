export type SectionId =
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
}

export interface FeaturedSection {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  items: Product[];
}

export interface PromoSection {
  visible: boolean;
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
  eyebrow: string;
  title: string;
  items: Testimonial[];
}

export interface EditorialSection {
  visible: boolean;
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