import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { saveContent } from '../src/lib/content.js';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function upsertUser(email, password, role, tenantId) {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, role, tenantId },
    update: { passwordHash, role, tenantId }
  });
}

async function main() {
  /* ---- 0. Super admin — the platform owner, no tenant ---- */
  const superEmail = (process.env.SUPERADMIN_EMAIL ?? '').trim().toLowerCase();
  const superPassword = process.env.SUPERADMIN_PASSWORD ?? '';
  if (superEmail && superPassword) {
    await upsertUser(superEmail, superPassword, 'superadmin', null);
    console.log(`✔ Super admin ready: ${superEmail}`);
  } else {
    console.log('· SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set — super admin login not created.');
  }

  /* ---- 1. The first client site (Giriraj). Existing databases get it from upgrade-tenants.js ---- */
  const slug = process.env.FIRST_TENANT_SLUG ?? 'giriraj';
  let tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    tenant = await prisma.tenant.create({
      data: { slug, name: process.env.FIRST_TENANT_NAME ?? 'Giriraj Jewellers', plan: '12m', expiresAt }
    });
    console.log(`✔ Client created: ${tenant.name} (${slug})`);
  }

  /* ---- 2. That client's editor + leads logins ---- */
  const email = (process.env.ADMIN_EMAIL ?? 'admin@giriraj.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe@123';
  await upsertUser(email, password, 'admin', tenant.id);
  console.log(`✔ Admin user ready: ${email}`);

  const leadsEmail = (process.env.LEADS_EMAIL ?? '').toLowerCase();
  const leadsPassword = process.env.LEADS_PASSWORD ?? '';
  if (leadsEmail && leadsPassword) {
    await upsertUser(leadsEmail, leadsPassword, 'leads', tenant.id);
    console.log(`✔ Leads user ready: ${leadsEmail}`);
  } else {
    console.log('· LEADS_EMAIL / LEADS_PASSWORD not set — leads panel login not created.');
  }

  /* ---- 3. Default landing-page content (only if that client has none) ---- */
  if ((await prisma.section.count({ where: { tenantId: tenant.id } })) > 0) {
    console.log('✔ Sections already present — content seed skipped.');
    return;
  }
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaultContent.json'), 'utf8'));
  await saveContent(prisma, tenant.id, content, { label: 'seed' });
  console.log(`✔ Seeded ${Object.keys(content.sections).length} sections + global settings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
