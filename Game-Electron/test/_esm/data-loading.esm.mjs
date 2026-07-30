/**
 * test/data-loading.esm.mjs
 * Exercises the REAL ESM cards-data module (loadCards, loadLeaders, loadAll,
 * inline accessors) by mocking fetch to read the JSON files off disk.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const _cwd = fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(_cwd, '..', '..');

// Polyfill browser fetch to read local JSON.
globalThis.fetch = async (url) => {
  const u = String(url);
  const m = u.match(/(cards|leaders)\.json$/);
  if (!m) throw new Error(`fetch: unsupported URL ${u}`);
  const rel = `src/data/${m[0]}`;
  const fpath = path.join(ROOT, rel);
  if (!fs.existsSync(fpath)) throw Object.assign(new Error('HTTP 404'), { ok: false });
  return {
    ok: true,
    status: 200,
    json: async () => JSON.parse(fs.readFileSync(fpath, 'utf8')),
  };
};

import { loadCards, loadLeaders, loadAll, getCardsInline, getLeadersInline } from '../../src/data/cards-data.js';

describe('ESM data layer', () => {
  it('loadCards returns an object with cards/abilities/traits/factions', async () => {
    const d = await loadCards('src/data');
    assert.ok(Array.isArray(d.cards) && d.cards.length > 0);
    assert.ok(d.abilities && d.traits && d.factions);
  });

  it('loadLeaders returns leaders and leader_abilities', async () => {
    const d = await loadLeaders('src/data');
    assert.ok(Array.isArray(d.leaders) && d.leaders.length > 0);
    assert.ok(d.leader_abilities);
  });

  it('loadAll loads both in parallel', async () => {
    const out = await loadAll('src/data');
    assert.ok(Array.isArray(out.cards.cards));
    assert.ok(Array.isArray(out.leaders.leaders));
  });

  it('getCardsInline is a deep copy (mutation does not affect other call)', () => {
    const a = getCardsInline();
    const b = getCardsInline();
    const original = a.cards[0].name;
    a.cards[0].name = 'MUTATED';
    assert.equal(a.cards[0].name, 'MUTATED');
    assert.equal(b.cards[0].name, original, 'independent copy must keep original value');
  });

  it('getLeadersInline is a deep copy', () => {
    const a = getLeadersInline();
    const b = getLeadersInline();
    const original = a.leaders[0].name;
    a.leaders[0].name = 'MUTATED';
    assert.equal(a.leaders[0].name, 'MUTATED');
    assert.equal(b.leaders[0].name, original, 'independent copy must keep original value');
  });
});
