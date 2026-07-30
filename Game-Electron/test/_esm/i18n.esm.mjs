/**
 * test/i18n.esm.mjs
 * Exercises the REAL ESM i18n.js + locale.js modules: init, t(), switchLocale,
 * fallback chain. Polyfills window / localStorage / fetch / CustomEvent / navigator.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const _cwd = fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(_cwd, '..', '..');

const store = {};
globalThis.localStorage = {
  getItem(k) { return store[k] ?? null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; },
};
globalThis.document = { documentElement: { lang: '' } };
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { language: 'zh-CN', userLanguage: '' },
});
globalThis.window = {};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, opts) { this.type = type; this.detail = (opts || {}).detail; }
};
globalThis.window.dispatchEvent = () => true;

globalThis.fetch = async (url) => {
  const u = String(url);
  const m = u.match(/src\/i18n\/([^/]+)\.json$/);
  if (!m) throw Object.assign(new Error(`fetch 404: ${u}`), { ok: false });
  const fpath = path.join(ROOT, `src/i18n/${m[1]}.json`);
  if (!fs.existsSync(fpath)) throw Object.assign(new Error('HTTP 404'), { ok: false });
  return { ok: true, json: async () => JSON.parse(fs.readFileSync(fpath, 'utf8')) };
};

import {
  t, initLocale, switchLocale, getCurrent, loadLocale, setLocaleTable,
  setBasePath, getBasePath, getSupported, getAllLocales,
} from '../../src/js/i18n.js';

describe('ESM i18n', () => {
  it('initLocale loads zh-CN and en-US and returns active locale', async () => {
    const active = await initLocale();
    assert.equal(active, 'zh-CN', 'default active locale zh-CN');
  });

  it('t() translates a key in zh-CN', () => {
    assert.equal(t('ui.menu.start'), '开始游戏');
    assert.equal(t('ui.menu.title'), '南北朝·牌力无限');
  });

  it('t() interpolates templates', () => {
    assert.equal(t('ui.game.round', { round: 3 }), '第 3 回合');
  });

  it('switchLocale to en-US works', () => {
    const changed = switchLocale('en-US');
    assert.equal(changed, true);
    assert.equal(t('ui.menu.start'), 'Start Game');
    assert.equal(t('ui.game.round', { round: 3 }), 'Round 3');
  });

  it('setLocaleTable + t() uses inline table', () => {
    setLocaleTable('en-US', { settings: { title: 'SETTINGS' } });
    assert.equal(t('settings.title', 'en-US'), 'SETTINGS');
  });

  it('fallback: missing key → key itself', () => {
    switchLocale('zh-CN');
    assert.equal(t('nonexistent.key'), 'nonexistent.key');
  });

  it('getCurrent returns the active locale', () => {
    assert.equal(getCurrent(), 'zh-CN');
  });

  it('path config round-trip', () => {
    setBasePath('x');
    assert.equal(getBasePath(), 'x/');
    setBasePath('src/i18n/');
    assert.equal(getBasePath(), 'src/i18n/');
  });

  it('getSupported / getAllLocales', () => {
    assert.equal(getSupported().length, 2);
    assert.equal(getAllLocales().length, 5);
  });

  it('loadLocale returns a table; null on failure', async () => {
    const zh = await loadLocale('zh-CN');
    assert.ok(zh && zh.ui);
    const bad = await loadLocale('qq-QQ');
    assert.equal(bad, null);
  });
});
