/**
 * One-time upgrade of a single-site database to multi-tenant. Run BEFORE `prisma db push`.
 *
 * `db push` cannot add a required tenantId to tables that already hold rows, so this
 * creates the tenants table, makes the existing site tenant #1 and stamps every
 * existing row with tenantId = 1. db push then adds the keys and foreign keys.
 * Safe to run again: it does nothing once sections.tenantId exists, or on an empty DB.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TABLES = ['admin_users', 'leads', 'sections', 'global_settings', 'subscribers', 'contact_messages', 'content_versions'];

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    table,
    column
  );
  return Number(rows[0].n) > 0;
}

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    table
  );
  return Number(rows[0].n) > 0;
}

async function main() {
  if (!(await tableExists('sections'))) {
    console.log('· Fresh database — nothing to upgrade.');
    return;
  }
  if (await columnExists('sections', 'tenantId')) {
    console.log('✔ Already multi-tenant — upgrade skipped.');
    return;
  }

  const slug = process.env.FIRST_TENANT_SLUG ?? 'giriraj';
  const name = process.env.FIRST_TENANT_NAME ?? 'Giriraj Jewellers';
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS tenants (id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(60) NOT NULL, ' +
    'name VARCHAR(120) NOT NULL, expiresAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3))'
  );
  // The existing paying site keeps running: one year from today.
  await prisma.$executeRawUnsafe(
    'INSERT IGNORE INTO tenants (id, slug, name, expiresAt) VALUES (1, ?, ?, DATE_ADD(NOW(3), INTERVAL 1 YEAR))',
    slug,
    name
  );

  for (const table of TABLES) {
    if ((await tableExists(table)) && !(await columnExists(table, 'tenantId'))) {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` ADD COLUMN tenantId INT NULL DEFAULT 1`);
      console.log(`✔ ${table}: existing rows moved to tenant #1 (${name})`);
    }
  }
  console.log('Now run: npx prisma db push   (then node prisma/seed.js)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
