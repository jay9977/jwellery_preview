// Assemble / decompose the SiteContent document <-> relational rows

export const GLOBAL_KEYS = ['theme', 'seo', 'brand', 'nav', 'announcement', 'footer'];

/**
 * Build the full SiteContent document from DB rows.
 * Returns null when the database has not been seeded yet.
 */
export async function assembleContent(prisma) {
  const [sections, globals] = await Promise.all([
    prisma.section.findMany({ orderBy: { position: 'asc' } }),
    prisma.globalSetting.findMany()
  ]);
  if (sections.length === 0) return null;

  const doc = { order: [], sections: {} };
  for (const key of GLOBAL_KEYS) {
    const row = globals.find((g) => g.key === key);
    if (row) doc[key] = row.data;
  }
  for (const s of sections) {
    doc.order.push(s.id);
    doc.sections[s.id] = { ...s.data, visible: s.visible };
  }
  return doc;
}

/**
 * Decompose a SiteContent document into Section + GlobalSetting rows.
 * Runs inside a transaction so a failed save never leaves half a document.
 */
export async function saveContent(prisma, content, { force = false } = {}) {
  if (!content || typeof content !== 'object' || !content.sections) {
    throw Object.assign(new Error('Body must contain a "content" object with "sections".'), { status: 400 });
  }
  if (Object.keys(content.sections).length === 0) {
    throw Object.assign(new Error('A content document must contain at least one section.'), { status: 400 });
  }

  const order = Array.isArray(content.order) ? content.order : Object.keys(content.sections);

  const ops = [];

  // Globals
  for (const key of GLOBAL_KEYS) {
    if (content[key] !== undefined) {
      ops.push(
        prisma.globalSetting.upsert({
          where: { key },
          create: { key, data: content[key] },
          update: { data: content[key] }
        })
      );
    }
  }

  const ids = Object.keys(content.sections);

  // Guard: auto-publish fires ~1s after every keystroke, so a truncated or
  // half-built document must not be able to wipe the site. Removing most of the
  // sections at once needs an explicit ?force=1.
  const existing = await prisma.section.findMany({ select: { id: true } });
  const dropped = existing.filter((s) => !ids.includes(s.id));
  if (!force && existing.length > 1 && dropped.length * 2 >= existing.length) {
    throw Object.assign(
      new Error(
        `Refusing to save: this would delete ${dropped.length} of ${existing.length} sections ` +
        `(${dropped.map((s) => s.id).join(', ')}). Retry with ?force=1 if that is intended.`
      ),
      { status: 409 }
    );
  }

  // Sections — upsert every section in the document
  for (const id of ids) {
    const { visible = true, ...data } = content.sections[id] ?? {};
    const position = order.indexOf(id) === -1 ? order.length : order.indexOf(id);
    ops.push(
      prisma.section.upsert({
        where: { id },
        create: { id, visible: Boolean(visible), position, data },
        update: { visible: Boolean(visible), position, data }
      })
    );
  }

  // Delete sections that are no longer part of the document
  ops.push(prisma.section.deleteMany({ where: { id: { notIn: ids } } }));

  // Version snapshot + keep only the newest 20
  ops.push(prisma.contentVersion.create({ data: { content, label: 'autosave' } }));

  await prisma.$transaction(ops);

  const old = await prisma.contentVersion.findMany({
    orderBy: { createdAt: 'desc' },
    skip: 20,
    select: { id: true }
  });
  if (old.length > 0) {
    await prisma.contentVersion.deleteMany({ where: { id: { in: old.map((v) => v.id) } } });
  }
}
