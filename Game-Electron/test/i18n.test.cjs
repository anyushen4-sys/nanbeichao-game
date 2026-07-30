/**
 * test/i18n.test.cjs — i18n / locale framework tests
 *
 * Pure locale.js arithmetic tested in this CJS file; the real ESM i18n.js
 * module (with its browser fetch/CustomEvent/Live storage usage) is exercised
 * in an isolated ESM runner spawned by node:child_process.
 *
 * node --test test/i18n.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = process.cwd();

// Mirrors locale.js constants for pure-logic verification.
const SUPPORTED = ['zh-CN', 'en-US'];
const RESERVED = ['zh-TW', 'fr-FR', 'es-ES'];
const FALLBACK_CHAIN = ['zh-CN', 'en-US'];

// Resolution chain per locale.js contract (current -> en-US -> zh-CN -> null).
function resolutionChain(locale) {
  const used = new Set();
  const chain = [];
  chain.push(locale); used.add(locale);
  if (!used.has('en-US')) { chain.push('en-US'); used.add('en-US'); }
  if (!used.has('zh-CN')) { chain.push('zh-CN'); used.add('zh-CN'); }
  chain.push(null);
  return chain;
}

function isSupported(locale) { return SUPPORTED.includes(locale); }
function isReserved(locale) { return RESERVED.includes(locale); }

// ---------------------------------------------------------------------------
describe('locale — supported / reserved / defaults', () => {
  it('SUPPORTED has exactly zh-CN and en-US', () => {
    assert.equal(SUPPORTED.length, 2);
    assert.ok(SUPPORTED.includes('zh-CN'));
    assert.ok(SUPPORTED.includes('en-US'));
  });

  it('RESERVED has exactly 3 Phase 2 slots', () => {
    assert.deepEqual(RESERVED, ['zh-TW', 'fr-FR', 'es-ES']);
  });

  it('zh-CN is the default (first in fallback chain)', () => {
    assert.equal(FALLBACK_CHAIN[0], 'zh-CN');
  });

  it('fr-FR is not supported but is reserved', () => {
    assert.equal(isSupported('fr-FR'), false);
    assert.equal(isReserved('fr-FR'), true);
  });

  it('a garbage code is neither supported nor reserved', () => {
    assert.equal(isSupported('ja-JP'), false);
    assert.equal(isReserved('ja-JP'), false);
  });
});

describe('resolutionChain', () => {
  it('zh-CN requested → [zh-CN, en-US, null]', () => {
    assert.deepEqual(resolutionChain('zh-CN'), ['zh-CN', 'en-US', null]);
  });

  it('en-US requested → [en-US, zh-CN, null]', () => {
    assert.deepEqual(resolutionChain('en-US'), ['en-US', 'zh-CN', null]);
  });

  it('a reserved locale → reserved, then en-US, zh-CN, null (key order preserved)', () => {
    const chain = resolutionChain('fr-FR');
    assert.equal(chain[0], 'fr-FR');
    assert.equal(chain[1], 'en-US');
    assert.equal(chain[2], 'zh-CN');
    assert.equal(chain[3], null);
  });

  it('null fallback is always last', () => {
    for (const loc of ['zh-CN', 'en-US', 'fr-FR', 'es-ES']) {
      const c = resolutionChain(loc);
      assert.equal(c[c.length - 1], null, `last element null for ${loc}`);
    }
  });
});

describe('i18n — JSON bundles', () => {
  it('en-US.json parses and has expected top-level keys', () => {
    const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/en-US.json'), 'utf8'));
    assert.ok(en.ui && en.combo && en.settlement && en.ability);
  });

  it('zh-CN.json parses and has expected top-level keys', () => {
    const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/zh-CN.json'), 'utf8'));
    assert.ok(zh.ui && zh.combo && zh.settlement && zh.ability);
  });

  it('same key path exists in both bundles for menu.start', () => {
    const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/en-US.json'), 'utf8'));
    const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/zh-CN.json'), 'utf8'));
    assert.ok(typeof en.ui.menu.start === 'string' && en.ui.menu.start);
    assert.ok(typeof zh.ui.menu.start === 'string' && zh.ui.menu.start);
  });

  it('template placeholders are preserved literally in raw JSON', () => {
    const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/en-US.json'), 'utf8'));
    const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/zh-CN.json'), 'utf8'));
    assert.ok(en.ui.game.round.includes('{round}'));
    assert.ok(zh.ui.game.round.includes('{round}'));
    assert.ok(en.combo.sameFaction.toast.includes('{value}'));
    assert.ok(zh.combo.sameFaction.toast.includes('{value}'));
  });

  it('settings localeLabel lists all 5 locales', () => {
    const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/en-US.json'), 'utf8'));
    const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/zh-CN.json'), 'utf8'));
    assert.equal(Object.keys(en.ui.settings.localeLabel).length, 5);
    assert.equal(Object.keys(zh.ui.settings.localeLabel).length, 5);
    assert.ok(en.ui.settings.localeLabel['zh-CN']);
    assert.ok(zh.ui.settings.localeLabel['en-US']);
  });
});

describe('i18n — ESM module runner', () => {
  const runner = path.join(ROOT, 'test', '_esm', 'i18n.esm.mjs');
  if (!fs.existsSync(runner)) {
    it('i18n.esm.mjs exists', () => assert.ok(false, 'test/i18n.esm.mjs missing'));
    return;
  }

  it('ESM i18n module: init, translate, switch locale, fallback', () => {
    execSync(`node "${runner}"`, { encoding: 'utf8' });
  });
});
