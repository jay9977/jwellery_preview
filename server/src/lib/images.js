// Fresh photos for a client's website from Unsplash (free API: https://unsplash.com/developers).
// Every image slot gets a photo matched to what sits in it — a category's name, a product's
// name — and no photo already used by another client is picked again.

const API = 'https://api.unsplash.com';
const IMAGE = /\.(jpe?g|png|webp|avif|gif)(\?.*)?$|images\.unsplash\.com/i;

function slots(content) {
  const out = [];
  const visit = (node, path) => {
    if (Array.isArray(node)) node.forEach((v, i) => visit(v, [...path, i]));
    else if (node && typeof node === 'object') for (const k of Object.keys(node)) visit(node[k], [...path, k]);
    else if (typeof node === 'string' && IMAGE.test(node)) out.push(path);
  };
  visit(content.sections ?? {}, ['sections']);
  return out;
}

const at = (root, path) => path.reduce((node, key) => node?.[key], root);
function setAt(root, path, value) {
  const parent = at(root, path.slice(0, -1));
  parent[path[path.length - 1]] = value;
}

/** What to search for in one slot: the item's own name when it has one. */
function queryFor(content, path, style) {
  const item = at(content, path.slice(0, -1)) ?? {};
  const section = path[1];
  const name = String(item.title || item.name || item.caption || '').replace(/[^\p{L}\p{N} ]/gu, ' ').trim();
  const base = style ? `${style} jewellery` : 'indian jewellery';
  if (section === 'hero') return `${base} model`;
  if (name && section === 'categories') return `${name} jewelry product photography`;
  if (name && section === 'featured') return `${name} jewelry product photography`;
  if (section === 'gallery') return `${base} close up`;
  if (section === 'journal') return 'jewellery craftsmanship';
  return base;
}

const PEOPLE = /\b(hand|hands|finger|fingers|person|people|woman|women|man|men|girl|boy|bride|groom|model|wearing|wrist|neck|ear|face|portrait|couple|watch|watches|clock|timepiece|wedding|silhouette)\b/i;

/** True when Unsplash's own description of the photo mentions no one in it. */
function isProductShot(photo) {
  const words = [photo.alt_description, photo.description, ...(photo.tags ?? []).map((t) => t.title)].filter(Boolean).join(' ');
  return !PEOPLE.test(words);
}

async function search(key, query, orientation) {
  const page = 1 + Math.floor(Math.random() * 3); // vary the pool between clients
  const url = `${API}/search/photos?query=${encodeURIComponent(query)}&per_page=30&page=${page}&orientation=${orientation}&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
  if (res.status === 401) throw new Error('UNSPLASH_ACCESS_KEY was rejected by Unsplash.');
  if (res.status === 403) throw new Error('Unsplash hourly limit reached — try again in an hour.');
  if (!res.ok) throw new Error(`Unsplash search failed (${res.status}).`);
  // Best-loved photos first, so a site is built from the strongest shots; a light shuffle
  // among the top ones keeps two clients with the same query from looking alike.
  const results = (await res.json()).results ?? [];
  results.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  const top = results.slice(0, 12).sort(() => Math.random() - 0.5);
  return [...top, ...results.slice(12)];
}

/**
 * Replace every photo in `content` with a new Unsplash photo.
 * @param usedText  every image URL already on the platform, joined — photos found in it are skipped
 * @returns number of photos replaced
 */
export async function freshPhotos(content, { style = '', usedText = '' } = {}) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return 0;

  const taken = new Set();
  const pools = new Map();
  let replaced = 0;

  for (const path of slots(content)) {
    const wide = path[1] === 'hero' || path[1] === 'promo';
    const orientation = wide ? 'landscape' : path[1] === 'categories' ? 'portrait' : 'squarish';
    const query = queryFor(content, path, style);
    const poolKey = `${query}|${orientation}`;
    if (!pools.has(poolKey)) pools.set(poolKey, await search(key, query, orientation));
    let pool = pools.get(poolKey);

    // Specific query came back thin: fall back to a broad one rather than repeat a photo.
    // Product and category tiles show the piece alone — never a hand, a person or a casual snapshot.
    const productSlot = path[1] === 'featured' || path[1] === 'categories';
    const usable = (p) => !taken.has(p.id) && !usedText.includes(p.id) && (!productSlot || isProductShot(p));
    let photo = pool.find(usable);
    if (!photo) {
      const broadQuery = productSlot ? 'luxury jewelry product photography' : 'luxury jewellery';
      const broadKey = `${broadQuery}|${orientation}`;
      if (!pools.has(broadKey)) pools.set(broadKey, await search(key, broadQuery, orientation));
      pool = pools.get(broadKey);
      photo = pool.find(usable);
    }
    if (!photo) continue;

    taken.add(photo.id);
    const width = wide ? 2000 : 1000;
    setAt(content, path, `${photo.urls.raw}&w=${width}&q=80&auto=format&fit=crop&ixid_photo=${photo.id}`);
    replaced++;
    // Unsplash API terms: report each photo that is actually used.
    fetch(photo.links.download_location, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => {});
  }

  // Social sharing image follows the first hero slide.
  const hero = content.sections?.hero?.slides?.[0]?.image;
  if (hero && content.seo) content.seo.ogImage = hero;
  return replaced;
}
