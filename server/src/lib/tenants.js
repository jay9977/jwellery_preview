// Which client website a request belongs to, and whether that site may serve.

export const PLAN_MONTHS = { '1m': 1, '6m': 6, '12m': 12 };

/** `from` pushed forward by the plan's length. */
export function addPlan(from, plan) {
  const date = new Date(from);
  date.setMonth(date.getMonth() + PLAN_MONTHS[plan]);
  return date;
}

/** A site serves only while switched on and paid up. */
export function isLive(tenant) {
  return tenant.status === 'active' && new Date(tenant.expiresAt) > new Date();
}

/** "WWW.Example.com:443" -> "example.com". www and bare domain are the same site. */
export function normalizeHost(host) {
  return String(host ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^www\./, '');
}

// ponytail: per-process cache, 30s staleness across instances; move to Redis if the API ever runs on more than one box.
const TTL_MS = 30_000;
const cache = new Map();

export function clearTenantCache() {
  cache.clear();
}

async function cached(key, load) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.tenant;
  const tenant = await load();
  cache.set(key, { tenant, at: Date.now() });
  return tenant;
}

export function tenantById(prisma, id) {
  return cached(`id:${id}`, () => prisma.tenant.findUnique({ where: { id: Number(id) } }));
}

export function tenantBySlug(prisma, slug) {
  const clean = String(slug ?? '').trim().toLowerCase();
  if (!clean) return Promise.resolve(null);
  return cached(`slug:${clean}`, () => prisma.tenant.findUnique({ where: { slug: clean } }));
}

/**
 * A custom domain ("girirajjewellers.com") or a free platform subdomain
 * ("giriraj.<PLATFORM_DOMAIN>").
 */
export async function tenantByHost(prisma, rawHost) {
  const host = normalizeHost(rawHost);
  if (!host) return null;
  const platform = normalizeHost(process.env.PLATFORM_DOMAIN);
  if (platform && host.endsWith(`.${platform}`)) {
    const slug = host.slice(0, -(platform.length + 1));
    if (!slug.includes('.')) return tenantBySlug(prisma, slug);
  }
  return cached(`host:${host}`, () => prisma.tenant.findUnique({ where: { domain: host } }));
}
