/**
 * test/settlement-combos.esm.mjs
 * Exercises the REAL ESM data layer under the combo/settlement wiring:
 * loadAll loads cards & leaders that combo scoring can operate on, and the
 * juzhongqu / same-faction i18n keys exist.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const _cwd = fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(_cwd, '..', '..');

globalThis.fetch = async (url) => {
  const u = String(url);
  const m = u.match(/(cards|leaders)\.json$/);
  if (!m) throw Object.assign(new Error('fetch unsupported'), { ok: false });
  const fpath = path.join(ROOT, `src/data/${m[0]}`);
  if (!fs.existsSync(fpath)) throw Object.assign(new Error('HTTP 404'), { ok: false });
  return { ok: true, json: async () => JSON.parse(fs.readFileSync(fpath, 'utf8')) };
};

import { loadAll } from '../../src/data/cards-data.js';

describe('ESM settlement/combo wiring', () => {
  it('loadAll loads cards and leaders usable by combo scoring', async () => {
    const { cards, leaders } = await loadAll('src/data');
    assert.ok(Array.isArray(cards.cards) && cards.cards.length > 0);
    assert.ok(Array.isArray(leaders.leaders) && leaders.leaders.length > 0);
    assert.ok(cards.factions && Object.keys(cards.factions).length === 4);
  });

  it('juzhongqu i18n keys defined in both locales', async () => {
    const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/en-US.json'), 'utf8'));
    const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/zh-CN.json'), 'utf8'));
    assert.equal(en.combo.juzhongqu.label, 'Rally');
    assert.equal(zh.combo.juzhongqu.label, '聚众曲');
    assert.ok(en.combo.sameFaction.toast.includes('{faction}'));
    assert.ok(zh.combo.counter.toast.includes('{faction}'));
  });
});
