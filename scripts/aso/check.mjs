/** Apple's rules for listing copy, shared by the localization doc and the ASC runbook. */
import { TRADEMARKS } from './listings.mjs';

export const LIMITS = { name: 30, subtitle: 30, keywords: 100, promo: 170, description: 4000, whatsNew: 4000 };


/** Apple treats a plural and its singular as one word, so compare stems. */
function stem(word) {
  const lower = word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (lower.length > 4 && lower.endsWith('es') && !lower.endsWith('ses')) return lower.slice(0, -2);
  if (lower.length > 3 && lower.endsWith('s') && !lower.endsWith('ss')) return lower.slice(0, -1);
  return lower;
}

function words(text) {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase());
}

/** Connectors Apple ignores; repeating them across fields costs nothing. */
const STOP = new Set(['and', 'y', 'de', 'et', 'la', 'le', 'les', 'the', 'of', 'for', 'a']);

export function check(listing) {
  const problems = [];
  for (const [field, limit] of Object.entries(LIMITS)) {
    const value = listing[field] ?? '';
    if (value.length > limit) problems.push(`${field} is ${value.length}/${limit}`);
    if (value.includes('!')) problems.push(`${field} has an exclamation mark (voice rules)`);
  }

  const kw = listing.keywords;
  if (/\s/.test(kw)) problems.push('keywords contain whitespace (wasted characters)');
  if (/,,|^,|,$/.test(kw)) problems.push('keywords have an empty entry');

  const terms = kw.split(',');
  const seen = new Map();
  for (const term of terms) {
    const key = stem(term);
    if (seen.has(key)) problems.push(`keywords repeat "${term}" (same as "${seen.get(key)}")`);
    seen.set(key, term);
  }

  const indexedAbove = new Map();
  for (const w of [...words(listing.name), ...words(listing.subtitle)]) {
    if (!STOP.has(w)) indexedAbove.set(stem(w), w);
  }
  for (const term of terms) {
    const hit = indexedAbove.get(stem(term));
    if (hit) problems.push(`keyword "${term}" repeats "${hit}" from the name or subtitle`);
  }

  const indexed = [listing.name, listing.subtitle, listing.keywords].join(' ').toLowerCase();
  for (const mark of TRADEMARKS) {
    if (words(indexed).includes(mark)) problems.push(`"${mark}" is a trademark in an indexed field`);
  }
  return problems;
}
