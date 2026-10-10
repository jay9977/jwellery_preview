// Free variety for new client websites, no API key needed: each section draws a different
// mix from these pools, so two clients never open with the same headlines, products,
// articles or FAQs. Claude (when ANTHROPIC_API_KEY is set) then rewrites the mix further.
//
// Nothing here invents facts about a business — no founding years, customer counts,
// awards or reviews. Those belong to the client and are filled in by them.
import crypto from 'node:crypto';

function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const pick = (list) => list[crypto.randomInt(list.length)];

const HERO = [
['The Bridal Edit', 'Crafted for the day you will remember forever', 'Bridal sets, chokers and maang tikkas designed around your outfit, your family and your story.', 'Explore bridal', 'Book a visit'],
['Heritage Gold', 'Gold that carries generations', 'Traditional designs in hallmarked gold, finished by hand for the pieces you will one day pass on.', 'See the collection', 'Visit our showroom'],
['Diamond Classics', 'Brilliance you will want to wear every day', 'Solitaires, studs and tennis bracelets chosen for fire, clarity and a finish that lasts.', 'Shop diamonds', 'Talk to an expert'],
['Festive Collection', 'Shine brighter this festive season', 'New jhumkas, bangles and necklaces made for Diwali, weddings and every celebration in between.', 'View festive picks', 'Enquire now'],
['Polki & Kundan', 'Royal craft, made for today', 'Uncut polki and kundan pieces in the grand tradition — lighter, wearable and made to order.', 'Discover polki', 'Book an appointment'],
['Everyday Luxury', 'Fine jewellery for every single day', 'Delicate chains, minimal rings and lightweight earrings that go from work to dinner.', 'Shop everyday', 'Find your style'],
['Made to Order', 'Your design, our hands', 'Bring a sketch, a photo or an old piece — our craftsmen will make it uniquely yours.', 'Start your design', 'Talk to us'],
['Temple Jewellery', 'Timeless temple art in pure gold', 'Lakshmi motifs, nakshi work and antique finishes inspired by South Indian temple craft.', 'Explore temple', 'Visit us'],
['Engagement Rings', 'The ring that starts forever', 'Solitaires and halo rings in yellow, white and rose gold, sized and set to perfection.', 'Find the ring', 'Book a consultation'],
['Silver & Gifting', 'Thoughtful gifts that sparkle', 'Silver jewellery, baby bangles and gift-ready pieces for birthdays, anniversaries and rakhi.', 'Shop gifts', 'Ask for ideas']];


const CATEGORY_HEADS = [
['Curated for you', 'Shop by category', 'Find the piece that fits the moment.'],
['Our collections', 'Explore our world of jewellery', 'From everyday sparkle to bridal grandeur.'],
['Browse', 'Something for every occasion', 'Handpicked collections, finished with care.'],
['Collections', 'What are you looking for today?', 'Start with a category and let us help with the rest.']];


const CATEGORIES = [
['Bridal Sets', 'Complete wedding looks'],
['Necklaces', 'Statement to everyday'],
['Earrings', 'Studs, drops & jhumkas'],
['Bangles', 'Gold, kada & stackables'],
['Engagement Rings', 'Solitaires & halos'],
['Mangalsutra', 'Classic & modern'],
['Chokers', 'Close to the heart'],
['Pendants', 'Small, meaningful, daily'],
['Bracelets', 'Tennis, chain & cuff'],
['Nose Pins', 'Delicate details'],
['Temple Jewellery', 'Heritage motifs'],
['Men’s Collection', 'Rings, chains & kadas']];


const FEATURED_HEADS = [
['Most loved', 'Pieces our customers return for', 'Hallmarked gold, honest advice and craftsmanship you can see.'],
['Bestsellers', 'Customer favourites', 'The designs everyone keeps asking about.'],
['Handpicked', 'This season’s highlights', 'A few of our favourite pieces right now.'],
['Featured', 'Signature pieces', 'Designs that show what our craftsmen do best.']];


const PRODUCTS = [
['Rani Haar', '22K Gold · Long necklace', 'Bridal', 'Purity: 22K Gold (BIS Hallmarked)\nStyle: Long layered haar\nFinish: Antique matte'],
['Kundan Choker Set', '22K Gold · Kundan', 'Bestseller', 'Purity: 22K Gold (BIS Hallmarked)\nStones: Kundan with pearl drops\nIncludes: Choker & earrings'],
['Solitaire Ring', '18K White Gold · Diamond', 'New', 'Metal: 18K White Gold\nCentre stone: Round brilliant diamond\nSizes: Made to your size'],
['Polki Jhumkas', '22K Gold · Uncut diamonds', 'Trending', 'Purity: 22K Gold\nStones: Polki (uncut diamonds)\nClosure: Screw back'],
['Diamond Tennis Bracelet', '18K Gold · Diamonds', 'New', 'Metal: 18K Gold\nStones: Round diamonds, prong set\nClasp: Box clasp with safety'],
['Temple Lakshmi Necklace', '22K Gold · Nakshi work', 'Heritage', 'Purity: 22K Gold (BIS Hallmarked)\nMotif: Goddess Lakshmi\nFinish: Antique'],
['Modern Mangalsutra', '18K Gold · Diamond pendant', 'Bestseller', 'Metal: 18K Gold\nPendant: Diamond accent\nChain: Black bead, adjustable'],
['Classic Gold Kada', '22K Gold · Handcrafted', '', 'Purity: 22K Gold (BIS Hallmarked)\nStyle: Openable kada\nSizes: 2.4 to 2.8'],
['Halo Engagement Ring', '18K Rose Gold · Diamond', 'Bestseller', 'Metal: 18K Rose Gold\nStones: Centre diamond with halo\nSizes: Made to your size'],
['Pearl Drop Earrings', '18K Gold · Freshwater pearls', '', 'Metal: 18K Gold\nPearls: Freshwater, hand-matched\nClosure: Push back'],
['Emerald Pendant', '18K Gold · Emerald', 'New', 'Metal: 18K Gold\nStone: Natural emerald\nChain: Included'],
['Bridal Maang Tikka', '22K Gold · Kundan & pearls', 'Bridal', 'Purity: 22K Gold\nStones: Kundan with pearls\nFit: Adjustable chain'],
['Everyday Chain', '22K Gold · Lightweight', '', 'Purity: 22K Gold (BIS Hallmarked)\nLength: 18 inches\nWeight: Lightweight daily wear'],
['Diamond Studs', '18K White Gold · Diamonds', 'Gift pick', 'Metal: 18K White Gold\nStones: Round diamonds\nClosure: Screw back'],
['Antique Bangles Pair', '22K Gold · Antique finish', 'Heritage', 'Purity: 22K Gold\nFinish: Antique with ruby accents\nSizes: 2.4 to 2.8'],
['Men’s Signet Ring', '22K Gold · Handcrafted', '', 'Purity: 22K Gold\nStyle: Signet\nSizes: Made to your size']];


const PROMOS = [
['Festive offer', 'Special prices on making charges', 'Celebrate with us — ask our team about this month’s offer on making charges for gold jewellery.', 'Ask about the offer'],
['Wedding season', 'Your complete bridal look, under one roof', 'Book a private bridal appointment and our designers will build your full set with you.', 'Book bridal appointment'],
['Exchange', 'Bring your old gold, take home something new', 'Exchange old gold jewellery for new designs at fair, transparent rates. Ask in store for today’s rate.', 'Ask about exchange'],
['Made for you', 'Custom jewellery, designed with you', 'Share an idea or a picture — we will design, show you a preview and craft it by hand.', 'Start a custom piece'],
['Gifting', 'Gifts that are remembered', 'Beautifully packed jewellery for birthdays, anniversaries and every special occasion.', 'Find a gift']];


const TRUST_TITLES = ['The {name} promise', 'Why customers choose {name}', 'Our promise to you', 'Shop with confidence'];
const TRUST = [
['shield', 'BIS Hallmarked gold', 'Every gold piece carries the BIS hallmark for guaranteed purity.'],
['gem', 'Certified diamonds', 'Diamonds come with certificates on request.'],
['refresh', 'Easy exchange', 'Exchange old jewellery for new designs at transparent rates.'],
['award', 'Expert craftsmanship', 'Finished by hand by experienced karigars.'],
['headset', 'Personal guidance', 'Talk to us before you buy — in store, on call or on WhatsApp.'],
['truck', 'Safe delivery', 'Carefully packed and insured delivery on request.'],
['gem', 'Custom designs', 'Bring your idea and we will make it yours.'],
['shield', 'Transparent pricing', 'Clear breakup of gold rate, making and stones on every bill.']];


const EDITORIALS = [
['Our story', 'Jewellery made with patience and pride', 'At {name}, every piece is checked by hand before it reaches you — from the purity of the gold to the setting of each stone. We believe jewellery should be honest, beautiful and made to last for generations.'],
['The craft', 'Where tradition meets your taste', 'Our karigars bring together traditional techniques and modern design, so every piece feels rooted in heritage yet made for the way you live today.'],
['About us', 'A family that loves fine jewellery', '{name} is a family jewellery house built on trust. We take time to understand what you are looking for and help you choose a piece you will love for years.'],
['Our promise', 'Beautiful jewellery, honestly made', 'We keep things simple: pure metal, clear pricing and craftsmanship you can see. Visit us and experience jewellery shopping the way it should be.']];

const EDITORIAL_STATS = [
['BIS', 'Hallmarked gold'],
['100%', 'Transparent billing'],
['Custom', 'Designs made to order'],
['Expert', 'Guidance in store']];


const JOURNAL_HEADS = [
['The Journal', 'Stories & guides', 'Buying guides, care tips and stories from our workshop.'],
['Learn', 'Know your jewellery', 'Simple guides to help you buy with confidence.'],
['Blog', 'From our showroom', 'Ideas, trends and tips from our team.']];

const ARTICLES = [
['How to choose the perfect bridal set', 'Your outfit, neckline and the ceremony all matter. Here is how to pick a set that completes your look.', 'Bridal guide'],
['Understanding gold purity: 22K vs 18K', 'What the karat number really means, and which purity suits which kind of jewellery.', 'Buying guide'],
['Caring for your gold jewellery at home', 'A few simple habits that keep your gold shining for years — no special tools needed.', 'Care'],
['A beginner’s guide to diamond 4Cs', 'Cut, colour, clarity and carat explained in plain words, so you know what you are paying for.', 'Buying guide'],
['Polki vs kundan: what is the difference?', 'Both are royal, both are beautiful — but they are made very differently. Here is how to tell.', 'Craft'],
['Jewellery trends for this wedding season', 'From layered haars to pastel stones, the looks brides are asking for right now.', 'Trends'],
['How to pick a ring size without guessing', 'Easy ways to find the right size — even when the ring is a surprise.', 'Guide'],
['Why BIS hallmarking matters', 'The small stamp that guarantees the purity of your gold, and how to read it.', 'Know your gold'],
['Styling temple jewellery with modern outfits', 'Heritage pieces are not just for sarees. Here are fresh ways to wear them.', 'Style'],
['Exchanging old gold: what you should know', 'How old gold is valued, what affects the rate, and how to get the most from an exchange.', 'Guide']];


const FAQ_HEADS = [['Good to know', 'Questions we hear often'], ['FAQ', 'Frequently asked questions'], ['Help', 'Before you visit']];
const FAQS = [
['Is your gold jewellery hallmarked?', 'Yes. Our gold jewellery carries the BIS hallmark, which certifies its purity. You can check the hallmark on every piece.'],
['Can I get a custom design made?', 'Yes. Share your idea, a sketch or a photo and our team will guide you on design, time and price before we begin.'],
['Do you exchange old gold?', 'Yes, we accept old gold for exchange against new jewellery. The value depends on purity and weight — visit us for a free check.'],
['How is the price of a piece calculated?', 'The price is based on the day’s gold rate, the weight, making charges and any stones. Every bill shows this breakup clearly.'],
['Can I see a piece before buying?', 'Of course. Visit our showroom, or message us on WhatsApp and we will share photos and videos of the piece.'],
['Do you offer resizing?', 'Yes, most rings and bangles can be resized. Ask our team and we will tell you what is possible for your piece.'],
['Do you deliver outside the city?', 'Please contact us — we can arrange safe, insured delivery for many locations.'],
['How long does a custom order take?', 'It depends on the design. Simple pieces can be ready quickly while bridal sets take longer — we will give you a clear date upfront.'],
['Do diamonds come with a certificate?', 'Certificates are available for diamonds on request. Ask our team when you choose your piece.'],
['What payment options do you accept?', 'We accept cash, cards and UPI. Ask us about any other option you prefer.']];


const GALLERY_HEADS = [['Lookbook', 'Worn with love'], ['Gallery', 'Moments in gold'], ['Inspiration', 'See it styled']];
const CAPTIONS = ['Bridal, up close', 'Everyday stack', 'Festive drops', 'Heirloom gold', 'Little sparkle', 'The perfect pair', 'Detail of the craft', 'Made for the mandap', 'Just for her', 'Golden hour'];

const NEWSLETTERS = [
['First look at new collections', 'Join our list for new arrivals, festive offers and styling ideas.'],
['Stay in the loop', 'Be the first to know about new designs and special events at {name}.'],
['Get our latest designs', 'New collections, care tips and offers — straight to your inbox.']];

const ANNOUNCEMENTS = [
'BIS hallmarked gold · Transparent pricing on every piece',
'Now taking custom and bridal orders — book your appointment',
'Exchange your old gold for new designs',
'Visit our showroom for this season’s new collection',
'Ask us on WhatsApp — we reply quickly'];

const ABOUTS = [
'{name} creates hallmarked gold and fine jewellery for weddings, festivals and every day.',
'{name} is a family jewellery house known for honest pricing and beautiful craftsmanship.',
'At {name}, we design and craft jewellery you will treasure for generations.'];


/**
 * Fill `content` (a clone of the template) with a fresh mix for this client.
 * brief: { name, slug, city, phone, email }
 */
export function applyVariants(content, brief) {
  const name = brief.name;
  const fill = (text) => text.replaceAll('{name}', name);
  const s = content.sections;

  if (s.hero?.slides) {
    const heroes = shuffled(HERO);
    s.hero.slides = s.hero.slides.map((slide, i) => {
      const [eyebrow, title, subtitle, primaryLabel, secondaryLabel] = heroes[i % heroes.length];
      return { ...slide, eyebrow, title, subtitle, primaryLabel, secondaryLabel };
    });
  }
  if (s.categories) {
    const [eyebrow, title, subtitle] = pick(CATEGORY_HEADS);
    const cats = shuffled(CATEGORIES);
    Object.assign(s.categories, { eyebrow, title, subtitle });
    s.categories.items = s.categories.items.map((item, i) => ({ ...item, title: cats[i][0], caption: cats[i][1] }));
  }
  if (s.featured) {
    const [eyebrow, title, subtitle] = pick(FEATURED_HEADS);
    const products = shuffled(PRODUCTS);
    Object.assign(s.featured, { eyebrow, title, subtitle, trustBadges: 'BIS Hallmarked, Transparent pricing, Expert craftsmanship' });
    s.featured.items = s.featured.items.map((item, i) => {
      const [pname, metal, badge, specs] = products[i % products.length];
      return { ...item, name: pname, metal, badge, specs, price: '', compareAt: '' };
    });
  }
  if (s.promo) {
    const [eyebrow, title, body, ctaLabel] = pick(PROMOS);
    Object.assign(s.promo, { eyebrow, title, body, ctaLabel, couponCode: '' });
  }
  if (s.trust) {
    const items = shuffled(TRUST);
    s.trust.title = fill(pick(TRUST_TITLES));
    s.trust.items = s.trust.items.map((item, i) => ({ ...item, icon: items[i][0], title: items[i][1], text: items[i][2] }));
  }
  if (s.editorial) {
    const [eyebrow, title, body] = pick(EDITORIALS);
    const stats = shuffled(EDITORIAL_STATS);
    Object.assign(s.editorial, {
      eyebrow,
      title,
      body: fill(body),
      stat1Value: stats[0][0],
      stat1Label: stats[0][1],
      stat2Value: stats[1][0],
      stat2Label: stats[1][1],
      ctaLabel: 'Visit our showroom',
      ctaHref: '#contact'
    });
  }
  if (s.journal) {
    const [eyebrow, title, subtitle] = pick(JOURNAL_HEADS);
    const posts = shuffled(ARTICLES);
    Object.assign(s.journal, { eyebrow, title, subtitle });
    s.journal.items = s.journal.items.map((item, i) => {
      const date = new Date(Date.now() - (i + 1) * (9 + crypto.randomInt(12)) * 86_400_000);
      return {
        ...item,
        title: posts[i][0],
        excerpt: posts[i][1],
        category: posts[i][2],
        readTime: `${3 + crypto.randomInt(5)} min read`,
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    });
  }
  if (s.faq) {
    const [eyebrow, title] = pick(FAQ_HEADS);
    Object.assign(s.faq, { eyebrow, title });
    s.faq.items = shuffled(FAQS).slice(0, Math.max(s.faq.items.length, 5)).map(([question, answer], i) => ({ id: `q-${i + 1}`, question, answer }));
  }
  if (s.gallery) {
    const [eyebrow, title] = pick(GALLERY_HEADS);
    const caps = shuffled(CAPTIONS);
    Object.assign(s.gallery, { eyebrow, title, handle: brief.slug ? `@${brief.slug.replace(/-/g, '')}` : '' });
    s.gallery.items = s.gallery.items.map((item, i) => ({ ...item, caption: caps[i % caps.length] }));
  }
  if (s.newsletter) {
    const [title, body] = pick(NEWSLETTERS);
    Object.assign(s.newsletter, { title, body: fill(body) });
  }
  // Reviews must be real — the section stays hidden until the client adds their own.
  if (s.testimonials) {
    s.testimonials.visible = false;
    s.testimonials.title = 'What our customers say';
    s.testimonials.items = [{ id: 'r-1', quote: 'Add a review from one of your customers here.', name: 'Customer name', location: brief.city || 'City', rating: 5 }];
  }
  // Contact details are the client's own — never the template's.
  if (s.contact) {
    Object.assign(s.contact, {
      title: `Visit ${name}`,
      address: [name, brief.city].filter(Boolean).join(', '),
      phone: brief.phone || '',
      whatsapp: brief.phone || '',
      email: brief.email || '',
      hours: 'Mon–Sat, 11am – 8pm',
      mapEmbedUrl: ''
    });
  }

  if (content.announcement) content.announcement.message = pick(ANNOUNCEMENTS);
  if (content.footer) {
    content.footer.about = fill(pick(ABOUTS));
    // The template's social links point at another business; the client adds their own.
    content.footer.social = (content.footer.social ?? []).map((link) => ({
      ...link,
      url: link.platform === 'email' && brief.email ? `mailto:${brief.email}` : ''
    }));
  }
  const where = brief.city ? ` in ${brief.city}` : '';
  content.seo = {
    ...content.seo,
    title: `${name} · Gold, Diamond & Bridal Jewellery${where}`,
    description: `${name}${where} — hallmarked gold, diamond and bridal jewellery, custom designs and honest pricing.`,
    keywords: ['gold jewellery', 'bridal jewellery', 'diamond jewellery', brief.city && `jewellers in ${brief.city}`, name].filter(Boolean).join(', ')
  };
  return content;
}
