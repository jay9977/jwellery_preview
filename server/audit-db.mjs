/** Read-only database audit: schema, row counts and content integrity. */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let pass = 0;
let fail = 0;
const problems = [];

const check = (label, ok, detail = '') => {
  if (ok) pass++;
  else {
    fail++;
    problems.push(`${label}${detail ? ' — ' + detail : ''}`);
  }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
};

try {
  await prisma.$queryRaw`SELECT 1`;
  check('database connection', true, process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

  const tables = await prisma.$queryRaw`SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()`;
  const names = tables.map((t) => t.name).sort();
  const expected = ['admin_users', 'content_versions', 'contact_messages', 'global_settings', 'sections', 'subscribers'];
  for (const table of expected) check(`table "${table}" exists`, names.includes(table));
  console.log(`     tables present: ${names.join(', ')}`);

  const [admins, sections, settings, subs, msgs, versions] = await Promise.all([
    prisma.adminUser.findMany(),
    prisma.section.findMany({ orderBy: { position: 'asc' } }),
    prisma.globalSetting.findMany(),
    prisma.subscriber.count(),
    prisma.contactMessage.count(),
    prisma.contentVersion.count()
  ]);

  console.log(
    `     rows: ${admins.length} admin, ${sections.length} sections, ${settings.length} settings, ${subs} subscribers, ${msgs} messages, ${versions} versions`
  );

  check('an admin user exists', admins.length >= 1, `${admins.length}`);
  check('admin password is hashed, not plain text', admins.every((a) => /^\$2[aby]\$/.test(a.passwordHash)));

  check('sections are stored', sections.length >= 12, `${sections.length}`);
  const positions = sections.map((s) => s.position);
  check('section positions are unique', new Set(positions).size === positions.length);
  check('every section carries data', sections.every((s) => s.data && typeof s.data === 'object'));

  const settingKeys = settings.map((s) => s.key).sort();
  for (const key of ['announcement', 'brand', 'footer', 'nav', 'seo', 'theme']) {
    check(`global setting "${key}" exists`, settingKeys.includes(key));
  }

  // The fields the site now depends on must actually be in the stored document.
  const brand = settings.find((s) => s.key === 'brand')?.data ?? {};
  check('brand.headerLogo is stored', 'headerLogo' in brand, String(brand.headerLogo || '(empty)').slice(-28));
  check('brand.headerLogoHeight is stored', typeof brand.headerLogoHeight === 'number', String(brand.headerLogoHeight));

  const featured = sections.find((s) => s.id === 'featured')?.data ?? {};
  check('featured.enquiryLabel is stored', typeof featured.enquiryLabel === 'string', featured.enquiryLabel);
  check('featured.trustBadges is stored', typeof featured.trustBadges === 'string', featured.trustBadges);
  check('the removed "View all" label is gone', !('ctaLabel' in featured));
  const items = featured.items ?? [];
  check('every product has specs', items.length > 0 && items.every((i) => typeof i.specs === 'string' && i.specs.trim()), `${items.length} products`);

  // Uploaded images referenced by content should still resolve.
  const doc = JSON.stringify([...sections.map((s) => s.data), ...settings.map((s) => s.data)]);
  const urls = [...new Set([...doc.matchAll(/https?:\/\/[^"\\]+\/uploads\/[^"\\]+/g)].map((m) => m[0]))];
  let broken = 0;
  for (const url of urls) {
    const res = await fetch(url).catch(() => null);
    if (!res || res.status !== 200) broken++;
  }
  check('every uploaded image referenced by content resolves', broken === 0, `${urls.length} checked, ${broken} broken`);

  const nav = settings.find((s) => s.key === 'nav')?.data ?? [];
  const sectionIds = new Set(sections.map((s) => s.id));
  const danglingNav = (Array.isArray(nav) ? nav : []).filter(
    (item) => item.href?.startsWith('#') && !sectionIds.has(item.href.slice(1)) && item.href !== '#top'
  );
  check('every header nav link points at a real section', danglingNav.length === 0, danglingNav.map((n) => `${n.label}→${n.href}`).join(', '));

  check('version history is capped at 20', versions <= 20, `${versions} snapshots`);
} catch (err) {
  check('database audit completed', false, err.message);
} finally {
  await prisma.$disconnect();
}

console.log(`\n${pass} passed, ${fail} failed`);
if (problems.length) console.log('PROBLEMS:\n- ' + problems.join('\n- '));
