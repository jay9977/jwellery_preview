import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { GLOBAL_KEYS } from '../src/lib/content.js';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  /* ---- 1. Admin user ---- */
  const email = process.env.ADMIN_EMAIL ?? 'admin@aurelle.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe@123';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash }
  });
  console.log(`✔ Admin user ready: ${email}`);

  /* ---- 2. Default landing-page content (only if DB is empty) ---- */
  const existing = await prisma.section.count();
  if (existing > 0) {
    console.log('✔ Sections already present — content seed skipped.');
    return;
  }

  const raw = fs.readFileSync(path.join(__dirname, 'defaultContent.json'), 'utf8');
  const content = JSON.parse(raw);

  for (const key of GLOBAL_KEYS) {
    if (content[key] !== undefined) {
      await prisma.globalSetting.upsert({
        where: { key },
        create: { key, data: content[key] },
        update: { data: content[key] }
      });
    }
  }

  const order = content.order ?? Object.keys(content.sections);
  for (const id of Object.keys(content.sections)) {
    const { visible = true, ...data } = content.sections[id];
    await prisma.section.create({
      data: { id, visible, position: order.indexOf(id), data }
    });
  }

  await prisma.contentVersion.create({ data: { content, label: 'seed' } });
  console.log(`✔ Seeded ${Object.keys(content.sections).length} sections + global settings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
