/**
 * End-to-end check of multi-tenancy against a running API:
 *   node test-tenants.mjs [http://localhost:4001/api]
 * Creates a throwaway client, proves its data is isolated from Giriraj, expires it,
 * renews it, then deletes it. Needs SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in server/.env.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';

const API = process.argv[2] ?? `http://localhost:${process.env.PORT ?? 4001}/api`;
const slug = `test-${Date.now().toString(36)}`;

async function call(method, path, { token, site, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(site ? { 'X-Tenant': site } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

const login = await call('POST', '/auth/login', {
  body: { email: process.env.SUPERADMIN_EMAIL, password: process.env.SUPERADMIN_PASSWORD }
});
assert.equal(login.status, 200, JSON.stringify(login.json));
const superToken = login.json.token;

// A client admin can never reach the super admin API.
const created = await call('POST', '/super/tenants', {
  token: superToken,
  body: {
    name: 'Test Jewellers',
    slug,
    plan: '1m',
    city: 'Pune',
    style: 'modern minimal',
    adminEmail: `${slug}@example.com`,
    adminPassword: 'test-pass-123'
  }
});
assert.equal(created.status, 201, JSON.stringify(created.json));
const id = created.json.tenant.id;

try {
  // Public site: each slug serves its own content.
  const mine = await call('GET', '/content', { site: slug });
  const giriraj = await call('GET', '/content', { site: 'giriraj' });
  assert.equal(mine.json.content.brand.name, 'Test Jewellers');
  assert.notEqual(giriraj.json.content.brand.name, 'Test Jewellers');

  // Client login is scoped to its own tenant even when it asks for another one.
  const client = await call('POST', '/auth/login', { body: { email: `${slug}@example.com`, password: 'test-pass-123' } });
  assert.equal(client.status, 200);
  // A signed-in client always gets its own site, whatever the header says.
  const sneaky = await call('GET', '/content', { token: client.json.token, site: 'giriraj' });
  assert.equal(sneaky.json.content.brand.name, 'Test Jewellers');
  const leads = await call('GET', '/leads', { token: client.json.token, site: 'giriraj' });
  assert.equal(leads.json.total, 0, 'client must not see Giriraj leads');
  assert.equal((await call('GET', '/super/tenants', { token: client.json.token })).status, 403);

  // Expired -> site and client login both stop; super admin can still support it.
  await call('PATCH', `/super/tenants/${id}`, { token: superToken, body: { expiresAt: '2020-01-01' } });
  assert.equal((await call('GET', '/content', { site: slug })).status, 402);
  assert.equal((await call('GET', '/leads', { token: client.json.token })).status, 402);
  assert.equal(
    (await call('POST', '/auth/login', { body: { email: `${slug}@example.com`, password: 'test-pass-123' } })).status,
    402
  );
  assert.equal((await call('GET', '/versions', { token: superToken, site: slug })).status, 200);

  // Renew -> back online, expiry about six months from today.
  const renewed = await call('POST', `/super/tenants/${id}/renew`, { token: superToken, body: { plan: '6m' } });
  const days = (new Date(renewed.json.tenant.expiresAt) - Date.now()) / 86_400_000;
  assert.ok(days > 175 && days < 190, `renewal gave ${days} days`);
  assert.equal((await call('GET', '/content', { site: slug })).status, 200);

  // Suspend switch.
  await call('PATCH', `/super/tenants/${id}`, { token: superToken, body: { status: 'suspended' } });
  assert.equal((await call('GET', '/content', { site: slug })).status, 402);

  console.log(`✔ multi-tenant checks passed (AI copy: ${created.json.ai ? 'yes' : 'no — ' + (created.json.aiError ?? 'no ANTHROPIC_API_KEY')})`);
} finally {
  const del = await call('DELETE', `/super/tenants/${id}?confirm=${slug}`, { token: superToken });
  assert.equal(del.status, 204, 'cleanup failed');
}
