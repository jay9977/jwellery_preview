// Builds a new client's starting website from the template content.
//   - every piece of copy rewritten for the client by Claude (when ANTHROPIC_API_KEY is set)
//   - the template's photos re-dealt so no two clients open with the same layout
//   - the colour palette and fonts the super admin picked
import crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { applyVariants } from './variants.js';

/** Keys whose string values are links, ids or media — never copy to rewrite. */
const NOT_COPY = /(^id$|Id$|href$|Href$|image$|Image$|logo$|Logo$|icon$|Icon$|url$|Url$|^video|^embed|^platform$)/;
const IMAGE = /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i;

function walk(node, path, visit) {
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, [...path, i], visit));
  else if (node && typeof node === 'object') for (const k of Object.keys(node)) walk(node[k], [...path, k], visit);
  else visit(node, path);
}

function setAt(root, path, value) {
  let node = root;
  for (const key of path.slice(0, -1)) node = node[key];
  node[path[path.length - 1]] = value;
}

/** Every human-readable string in the document, keyed by its dotted path. */
export function copyStrings(content) {
  const out = {};
  for (const top of Object.keys(content)) {
    if (top === 'theme' || top === 'order') continue;
    walk(content[top], [top], (value, path) => {
      const key = String(path[path.length - 1]);
      if (typeof value !== 'string' || NOT_COPY.test(key)) return;
      if (!/[a-z]{2}/i.test(value) || /^(https?:|\/|#|mailto:|tel:)/.test(value)) return;
      out[path.join('.')] = value;
    });
  }
  return out;
}

/** Give each distinct photo a different photo from the same pool, consistently. */
export function shuffleImages(content) {
  const slots = [];
  walk(content, [], (value, path) => {
    if (typeof value === 'string' && IMAGE.test(value)) slots.push({ path, value });
  });
  const pool = [...new Set(slots.map((s) => s.value))];
  const dealt = [...pool];
  for (let i = dealt.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [dealt[i], dealt[j]] = [dealt[j], dealt[i]];
  }
  const swap = new Map(pool.map((img, i) => [img, dealt[i]]));
  for (const slot of slots) setAt(content, slot.path, swap.get(slot.value));
}

const SYSTEM = `You write website copy for Indian jewellery businesses.
You receive a client brief and every text string of a template jewellery website, each with a key.
Rewrite every string for the client's brand: use their business name, city and style, keep each string
about the same length and role (a button label stays a short button label, a FAQ answer stays an answer),
write fresh headlines and punch lines rather than paraphrasing the template, and never invent
certifications, awards, years or statistics the brief does not give. Use the phone and email from the brief
wherever the template shows contact details. Return every key exactly once.`;

async function rewriteCopy(texts, brief) {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            texts: {
              type: 'array',
              items: {
                type: 'object',
                properties: { key: { type: 'string' }, text: { type: 'string' } },
                required: ['key', 'text'],
                additionalProperties: false
              }
            }
          },
          required: ['texts'],
          additionalProperties: false
        }
      }
    },
    messages: [
      {
        role: 'user',
        content: JSON.stringify({ brief, texts: Object.entries(texts).map(([key, text]) => ({ key, text })) })
      }
    ]
  });
  if (response.stop_reason === 'refusal') throw new Error('Claude declined to write this copy.');
  if (response.stop_reason === 'max_tokens') throw new Error('Claude ran out of room writing the copy.');
  const block = response.content.find((b) => b.type === 'text');
  return JSON.parse(block?.text ?? '{}').texts ?? [];
}

/**
 * @param template  a SiteContent document to start from
 * @param brief     { name, city, style, phone, email, notes, theme? }
 * @returns { content, ai: boolean, aiError?: string }
 */
export async function buildSiteContent(template, brief) {
  const content = applyVariants(structuredClone(template), brief);
  const oldName = template.brand?.name ?? '';
  const texts = copyStrings(content);

  let ai = false;
  let aiError;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      for (const { key, text } of await rewriteCopy(texts, brief)) {
        if (Object.hasOwn(texts, key) && typeof text === 'string' && text.trim()) {
          setAt(content, key.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)), text);
        }
      }
      ai = true;
    } catch (err) {
      aiError = err instanceof Error ? err.message : String(err);
      console.error('AI copy generation failed — falling back to the template copy:', aiError);
    }
  }

  // Without AI (or if it failed) at least the old brand name must not show up.
  if (!ai && oldName) {
    const re = new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    for (const [key, text] of Object.entries(texts)) {
      const next = text.replace(re, brief.name);
      if (next !== text) setAt(content, key.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)), next);
    }
  }

  content.brand = {
    ...content.brand,
    name: brief.name,
    phone: brief.phone || content.brand?.phone || '',
    headerLogo: '',
    logo: '',
    footerLogo: ''
  };
  if (brief.theme) content.theme = { ...content.theme, ...brief.theme, colors: { ...content.theme?.colors, ...brief.theme.colors } };
  shuffleImages(content);
  return { content, ai, aiError };
}
