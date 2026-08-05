import type { BuiltInSectionId, SiteContent } from '../types/content';
import { FONT_PAIRS, PALETTES } from './palettes';

export const SECTION_LABELS: Record<BuiltInSectionId, string> = {
  hero: 'Hero Slider',
  categories: 'Shop by Category',
  featured: 'Featured Jewellery',
  promo: 'Offer Banner',
  trust: 'Why Shop With Us',
  testimonials: 'Customer Love',
  editorial: 'Our Craft Story',
  gallery: 'Lookbook Gallery',
  journal: 'Journal / Blog',
  faq: 'FAQ',
  contact: 'Contact Us',
  newsletter: 'Newsletter Signup'
};

export const IMAGES = {
  hero: "/42249ea0-d991-43cd-ab3a-09084d8b829f.jpg",
  editorial: "/b3114d75-2704-4097-998c-0ee579e1e09a.jpg",

  promo: "/78ca5a4c-1b01-4e4f-9196-50934d1ac47c.jpg",
  rings: "/5f2ce6fe-ae11-47f6-bdd7-492c795e26db.jpg",
  earrings: "/1b9349e0-3204-4747-9fdd-6f4f9d4ae1b2.jpg",

  necklaces: "/9060c6ae-43da-47e8-8157-2aa34f885062.jpg",

  bracelets: "/da864486-67e2-4b70-ab54-7d4cccabd89b.jpg",

  prodRing: "/d1067c91-5550-49a5-9a10-babd26de23d2.jpg",

  prodStuds: "/d80720a6-542a-42d2-839c-d906808f5d8a.jpg",

  prodBangle: "/9853d4e7-85bc-4237-a8f7-b23d85c6a318.jpg"

};

export const defaultContent: SiteContent = {
  theme: {
    paletteId: PALETTES[0].id,
    fontId: FONT_PAIRS[0].id,
    colors: { ...PALETTES[0].colors }
  },
  seo: {
    title: 'Maison girija · Certified Fine Jewellery & Bridal Diamonds',
    description:
    'Ethically sourced, IGI and GIA certified diamond and gold jewellery, hand-finished in our atelier. Free insured shipping, 30-day exchange and lifetime servicing.',
    keywords: 'diamond jewellery, engagement rings, bridal sets, gold bangles, certified diamonds',
    ogImage: IMAGES.hero
  },
  brand: {
    name: 'Maison girija',
    tagline: 'Fine jewellery, made to be remembered',
    phone: '+91 98200 11223',
    headerLogo: '',
    headerLogoHeight: 52,
    logo: '',
    logoHeight: 120,
    footerLogo: '',
    footerLogoHeight: 72
  },
  nav: [
  { id: 'nav-1', label: 'Engagement', href: '#categories' },
  { id: 'nav-2', label: 'Diamonds', href: '#featured' },
  { id: 'nav-3', label: 'Gold', href: '#featured' },
  { id: 'nav-4', label: 'Gifting', href: '#promo' },
  { id: 'nav-5', label: 'Our Craft', href: '#editorial' },
  { id: 'nav-6', label: 'Journal', href: '#journal' },
  { id: 'nav-7', label: 'Contact', href: '#contact' }],

  announcement: {
    visible: true,
    message: 'Complimentary insured shipping & lifetime servicing on every order',
    linkLabel: 'Book a styling appointment'
  },
  order: [
  'hero',
  'categories',
  'featured',
  'promo',
  'trust',
  'testimonials',
  'editorial',
  'gallery',
  'journal',
  'faq',
  'contact',
  'newsletter'],

  sections: {
    hero: {
      visible: true,
      autoplay: true,
      slides: [
      {
        id: 'slide-1',
        eyebrow: 'The Solitaire Edit',
        title: 'Brilliance that outlives the moment',
        subtitle:
        'Ethically sourced diamonds, hand-set by our master craftsmen in Jaipur and certified for life.',
        primaryLabel: 'Shop the edit',
        secondaryLabel: 'Book a consultation',
        image: IMAGES.hero
      },
      {
        id: 'slide-2',
        eyebrow: 'Bridal 2026',
        title: 'For the vows you only make once',
        subtitle:
        'Bespoke bridal sets designed with you, from first sketch to final polish — in four weeks.',
        primaryLabel: 'Explore bridal',
        secondaryLabel: 'Design your own',
        image: IMAGES.promo
      }]

    },
    categories: {
      visible: true,
      eyebrow: 'Curated for you',
      title: 'Shop by category',
      subtitle: 'Four houses of craft, one standard of finish.',
      items: [
      { id: 'cat-1', title: 'Engagement Rings', caption: '240+ designs', image: IMAGES.rings },
      { id: 'cat-2', title: 'Earrings', caption: '180+ designs', image: IMAGES.earrings },
      { id: 'cat-3', title: 'Necklaces', caption: '120+ designs', image: IMAGES.necklaces },
      { id: 'cat-4', title: 'Bracelets', caption: '90+ designs', image: IMAGES.bracelets }]

    },
    featured: {
      visible: true,
      eyebrow: 'Most loved',
      title: 'Pieces our clients return for',
      subtitle: 'Certified stones, transparent pricing, and a 30-day exchange promise.',
      enquiryLabel: 'Enquire now',
      trustBadges: 'BIS Hallmarked, IGI Certified, Lifetime servicing',
      items: [
      {
        id: 'p-1',
        name: 'girija Halo Ring',
        metal: '18K Rose Gold · 0.75ct',
        price: '₹1,24,900',
        compareAt: '₹1,49,000',
        badge: 'Bestseller',
        image: IMAGES.prodRing,
        specs:
        'Purity: 18K Rose Gold (BIS Hallmarked)\nDiamond: 0.75ct · VS clarity · IGI certified\nGross weight: 4.2 g\nAvailable sizes: 10 to 20'
      },
      {
        id: 'p-2',
        name: 'Lumière Solitaire',
        metal: '18K White Gold · 1.00ct',
        price: '₹2,18,500',
        compareAt: '',
        badge: 'New',
        image: IMAGES.rings,
        specs:
        'Purity: 18K White Gold (BIS Hallmarked)\nDiamond: 1.00ct solitaire · IGI certified\nGross weight: 3.6 g\nAvailable sizes: 10 to 20'
      },
      {
        id: 'p-3',
        name: 'Étoile Diamond Studs',
        metal: '18K White Gold · 0.50ct',
        price: '₹78,400',
        compareAt: '₹92,000',
        badge: '',
        image: IMAGES.prodStuds,
        specs:
        'Purity: 18K White Gold (BIS Hallmarked)\nDiamond: 0.50ct pair · VS clarity\nGross weight: 2.4 g\nFitting: Screw back'
      },
      {
        id: 'p-4',
        name: 'Rivière Gold Bangle',
        metal: '22K Yellow Gold',
        price: '₹96,200',
        compareAt: '',
        badge: 'Handcrafted',
        image: IMAGES.prodBangle,
        specs:
        'Purity: 22K Yellow Gold (BIS Hallmarked)\nGross weight: 18.6 g\nFinish: Hand engraved\nAvailable sizes: 2.4 to 2.8'
      }]

    },
    promo: {
      visible: true,
      eyebrow: 'Festive privilege',
      title: 'Flat 15% off on making charges',
      body: 'Plus a complimentary velvet travel case with every purchase above ₹75,000. Valid till the end of the month, in store and online.',
      ctaLabel: 'Claim the offer',
      couponCode: 'girija15',
      image: IMAGES.promo
    },
    trust: {
      visible: true,
      title: 'The Maison girija promise',
      items: [
      { id: 't-1', icon: 'gem', title: 'Certified diamonds', text: 'Every stone IGI or GIA certified, with full traceability.' },
      { id: 't-2', icon: 'truck', title: 'Insured delivery', text: 'Free, fully insured shipping across India in 3–5 days.' },
      { id: 't-3', icon: 'refresh', title: '30-day exchange', text: 'Change your mind, or your size, with no questions asked.' },
      { id: 't-4', icon: 'shield', title: 'Lifetime servicing', text: 'Complimentary cleaning, polishing and re-plating forever.' }]

    },
    testimonials: {
      visible: true,
      eyebrow: 'Client stories',
      title: 'Loved by 40,000+ families',
      items: [
      {
        id: 'r-1',
        quote:
        'The team redesigned my grandmother’s pendant into two rings for my sister and me. The craftsmanship is unreal — it still feels like her.',
        name: 'Ananya Rao',
        location: 'Bengaluru',
        rating: 5
      },
      {
        id: 'r-2',
        quote:
        'I bought a solitaire online, nervous the whole time. The certification, the video call viewing, the packaging — everything was flawless.',
        name: 'Rohan Mehta',
        location: 'Mumbai',
        rating: 5
      },
      {
        id: 'r-3',
        quote:
        'Our bridal set was ready in three weeks and fit perfectly. They even resized my mother’s bangle for free.',
        name: 'Ishita & Karan',
        location: 'Delhi NCR',
        rating: 5
      }]

    },
    editorial: {
      visible: true,
      eyebrow: 'Since 1987',
      title: 'Four generations of hands, one obsession with finish',
      body: 'Every girija piece passes through nine sets of hands — wax carver, setter, polisher, gemmologist — before it earns our hallmark. We buy only from Kimberley-certified suppliers, and we publish the origin of every stone above half a carat.',
      ctaLabel: 'Read our craft story',
      image: IMAGES.editorial,
      stat1Value: '38 yrs',
      stat1Label: 'Of atelier craft',
      stat2Value: '100%',
      stat2Label: 'Conflict-free stones'
    },
    gallery: {
      visible: true,
      eyebrow: 'Lookbook',
      title: 'Worn by you',
      handle: '@maisongirija',
      items: [
      { id: 'g-1', image: IMAGES.editorial, caption: 'Stacked rings, everyday' },
      { id: 'g-2', image: IMAGES.necklaces, caption: 'The Lumière pendant' },
      { id: 'g-3', image: IMAGES.earrings, caption: 'Festive drops' },
      { id: 'g-4', image: IMAGES.bracelets, caption: 'Rivière on repeat' },
      { id: 'g-5', image: IMAGES.hero, caption: 'Bridal, backstage' },
      { id: 'g-6', image: IMAGES.prodRing, caption: 'She said yes' }]

    },
    journal: {
      visible: true,
      eyebrow: 'The Journal',
      title: 'Notes from the atelier',
      subtitle: 'Buying guides, care tips and stories from behind the bench.',
      ctaLabel: 'Read all stories',
      items: [
      {
        id: 'j-1',
        title: 'How to choose a solitaire that suits her hand',
        excerpt:
        'Carat is only a third of the story. Here is how cut, setting height and finger length work together.',
        category: 'Buying guide',
        date: '12 Jul 2026',
        readTime: '6 min read',
        image: IMAGES.rings
      },
      {
        id: 'j-2',
        title: 'Caring for gold you never take off',
        excerpt:
        'A two-minute weekly ritual that keeps everyday gold bright without a single trip to the store.',
        category: 'Care',
        date: '28 Jun 2026',
        readTime: '4 min read',
        image: IMAGES.prodBangle
      },
      {
        id: 'j-3',
        title: 'Inside a four-week bespoke commission',
        excerpt:
        'From the first sketch to the final polish — what actually happens when you design with us.',
        category: 'Atelier',
        date: '02 Jun 2026',
        readTime: '8 min read',
        image: IMAGES.editorial
      }]

    },
    faq: {
      visible: true,
      eyebrow: 'Good to know',
      title: 'Questions we hear often',
      items: [
      {
        id: 'q-1',
        question: 'Are your diamonds certified and conflict-free?',
        answer:
        'Every diamond above 0.30ct ships with an IGI or GIA certificate, and all our suppliers are Kimberley Process compliant. Stones above half a carat carry a published origin record.'
      },
      {
        id: 'q-2',
        question: 'What if the ring size is wrong?',
        answer:
        'Your first resize within 60 days is free, including shipping both ways. Most resizes are completed and returned within seven working days.'
      },
      {
        id: 'q-3',
        question: 'Can I see a piece before I buy it?',
        answer:
        'Yes — book a video viewing and a gemmologist will take you through the actual piece on camera, or visit our Mumbai and Bengaluru ateliers by appointment.'
      },
      {
        id: 'q-4',
        question: 'Do you offer EMI or a gold savings plan?',
        answer:
        'We support no-cost EMI on most major cards for 3, 6 and 9 months, and an 11-month savings plan where we contribute the final instalment.'
      }]

    },
    contact: {
      visible: true,
      eyebrow: 'Talk to us',
      title: 'Contact our atelier',
      subtitle:
      'Questions about a piece, a custom commission or an order already on its way — a gemmologist will get back to you within one working day.',
      address: 'Maison girija Atelier, 12 Altamount Road, Mumbai 400026, India',
      phone: '+91 98200 12345',
      email: 'care@maisongirija.com',
      hours: 'Mon–Sat, 10am – 7pm IST',
      whatsapp: '+91 98200 12345',
      mapEmbedUrl: '',
      showForm: true,
      formTitle: 'Send us a message',
      formNote: 'We reply to every enquiry personally. Your details are never shared.',
      formCtaLabel: 'Send enquiry',
      successMessage: 'Thank you — your message is with our team. We usually reply within one working day.',
      showSocial: true
    },
    newsletter: {
      visible: true,
      title: 'First look at new collections',
      body: 'Join our list for private previews, atelier notes and early access to festive pricing.',
      ctaLabel: 'Subscribe',
      note: 'No more than two emails a month. Unsubscribe anytime.'
    }
  },
  footer: {
    about:
    'Maison girija is a family-run atelier crafting certified fine jewellery for weddings, milestones and everyday wear.',
    columns: [
    {
      id: 'f-1',
      title: 'Shop',
      links: [
      { id: 'fl-1', label: 'Engagement rings', href: '#categories' },
      { id: 'fl-2', label: 'Earrings', href: '#categories' },
      { id: 'fl-3', label: 'Necklaces', href: '#categories' },
      { id: 'fl-4', label: 'Gifting under ₹50k', href: '#promo' }]

    },
    {
      id: 'f-2',
      title: 'Support',
      links: [
      { id: 'fl-5', label: 'FAQ', href: '#faq' },
      { id: 'fl-6', label: 'Shipping & returns', href: '#trust' },
      { id: 'fl-7', label: 'Care & servicing', href: '#trust' },
      { id: 'fl-8', label: 'Contact us', href: '#contact' }]

    },
    {
      id: 'f-3',
      title: 'House',
      links: [
      { id: 'fl-9', label: 'Our craft', href: '#editorial' },
      { id: 'fl-10', label: 'Responsible sourcing', href: '#editorial' },
      { id: 'fl-11', label: 'Book an appointment', href: '#contact' },
      { id: 'fl-12', label: 'Gift cards', href: '#promo' }]

    }],

    copyright: '© 2026 Maison girija Fine Jewellery. All rights reserved.',
    social: [
    { id: 's-1', platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/maisongirija' },
    { id: 's-2', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/maisongirija' },
    { id: 's-3', platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@maisongirija' },
    { id: 's-4', platform: 'twitter', label: 'X / Twitter', url: 'https://x.com/maisongirija' },
    { id: 's-5', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/maisongirija' },
    { id: 's-6', platform: 'email', label: 'Email', url: 'mailto:care@maisongirija.com' }]

  }
};