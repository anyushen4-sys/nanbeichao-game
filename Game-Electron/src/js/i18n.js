/**
 * i18n.js — Translation framework for NanBeiChao Card Power
 *
 * Implements ADR-0005:
 *   - t(key, lang?) with fallback chain: locale → en-US → zh-CN → key itself
 *   - Template interpolation: t('ui.game.round', { round: 3 }) → "第 3 回合"
 *   - Dynamic lazy-load of translation JSON files
 *   - Inline translation bundles for offline/fallback use
 *   - resolutionChain() per locale.js contract
 *
 * Usage:
 *   import { t, initLocale, switchLocale, getTranslation } from './i18n.js';
 *   initLocale();                    // load from storage, apply DOM
 *   t('ui.menu.start');             // → '开始游戏' or 'Start Game'
 *   t('ui.game.round', { round:3 }); // → '第 3 回合' or 'Round 3'
 *
 * Dependencies: locale.js (in same dir)
 */

import {
  getLocale,
  setLocale,
  resolutionChain,
  getSupported,
  getAllLocales
} from './locale.js';

// ── translation store ─────────────────────────────────────────────────────────

/** @type {Map<string, Object>} locale → translation table */
const _tables = new Map();

// ── path config ──────────────────────────────────────────────────────────────

/** Base path for translation JSON files, relative to HTML root */
let _i18nBasePath = 'src/i18n/';

/**
 * Set the base path from which locale JSON files are loaded.
 * @param {string} path — e.g. 'src/i18n/' or '/static/i18n/'
 */
export function setBasePath(path) {
  if (typeof path !== 'string') return;
  _i18nBasePath = path.endsWith('/') ? path : path + '/';
}

// ── lazy loader ──────────────────────────────────────────────────────────────

/**
 * Async load a locale's translation table from JSON file.
 * Caches result; subsequent calls are no-ops.
 *
 * @param {string} locale — e.g. 'zh-CN'
 * @returns {Promise<object>} translation object
 */
export async function loadLocale(locale) {
  if (_tables.has(locale)) {
    return _tables.get(locale);
  }

  try {
    const url = _i18nBasePath + locale + '.json';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _tables.set(locale, data);
    return data;
  } catch (err) {
    console.warn(`[i18n] Failed to load ${locale} from ${_i18nBasePath}${locale}.json: ${err.message}`);
    return null;
  }
}

/**
 * Sync option: set a locale table directly (used by inline bundles).
 * @param {string} locale
 * @param {Object} table
 */
export function setLocaleTable(locale, table) {
  if (table && typeof table === 'object') {
    _tables.set(locale, table);
  }
}

// ── key resolution ───────────────────────────────────────────────────────────

/**
 * Walk a dotted key path into a nested object.
 * e.g. getNested('ui.menu.start', obj) → obj.ui.menu.start
 *
 * @param {string} key — dotted path
 * @param {Object} obj
 * @returns {*} value or undefined
 */
function getNested(key, obj) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    if (!(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Template interpolation.
 * Accepts named params: t('a {x} b', { x: 1 }) → 'a 1 b'
 *
 * @param {string} template
 * @param {Object} [params]
 * @returns {string}
 */
function interpolate(template, params) {
  if (!params || typeof params !== 'object') return template;

  let result = template;
  for (const [k, v] of Object.entries(params)) {
    const placeholder = `{${k}}`;
    if (result.includes(placeholder)) {
      result = result.split(placeholder).join(String(v ?? ''));
    }
  }
  return result;
}

/**
 * Resolve a translation key synchronously across the fallback chain.
 *
 * @param {string} key — dotted key (e.g. 'ui.menu:start')
 * @param {string} [locale] — target locale; defaults to active locale
 * @returns {string} resolved string, or key itself as absolute fallback
 */
function resolve(key, locale) {
  const chain = resolutionChain(locale);

  for (const loc of chain) {
    // null means 'use key itself'
    if (loc === null) return key;

    const table = _tables.get(loc);
    if (!table) continue;

    const val = getNested(key, table);
    if (val !== undefined) return val;
  }

  return key;
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Translate a key with optional template interpolation.
 *
 * FALLBACK CHAIN (per ADR-0005):
 *   requested locale → en-US → zh-CN → key literal itself
 *
 * Examples:
 *   t('ui.menu:start')                    // '开始游戏'
 *   t('ui.game:round', { round: 3 })      // '第 3 回合'
 *   t('nonexistent')                      // 'nonexistent' (last-resort fallback)
 *   t('ui.menu:start', 'en-US')           // force English
 *
 * @param {string} key       — dotted translation key (e.g. 'ui.menu:start')
 * @param {string|Object} [langOrParams] — locale string OR params object
 * @param {Object} [params]  — template variables {round: 3, faction:'Song'}
 * @returns {string}
 */
export function t(key, langOrParams, params) {
  let locale, interpolationParams;

  if (langOrParams && typeof langOrParams === 'object') {
    // t('key', { a: 1 })
    locale = undefined;
    params = langOrParams;
  } else if (typeof langOrParams === 'string') {
    // t('key', 'en-US', { a: 1 })   or   t('key', 'en-US')
    locale = langOrParams;
    params = params || undefined;
  } else {
    locale = undefined;
    params = undefined;
  }

  const loc = locale || getLocale();
  const raw = resolve(key, loc);

  if (raw === null || raw === key) {
    // Absolute fallback — no translation found, return key
    return interpolate(key, params);
  }

  return interpolate(raw, params);
}

/**
 * Get current locale (delegates to locale.js).
 * @returns {string}
 */
export { getLocale as getCurrent };

/**
 * Async init: ensure at least zh-CN and en-US are loaded,
 * then set locale from storage/detection.
 * Returns a Promise that resolves when ready.
 *
 * @returns {Promise<string>} active locale
 */
export async function initLocale() {
  // Load zh-CN and en-US (at minimum)
  await Promise.all([
    loadLocale('zh-CN'),
    loadLocale('en-US')
  ]);

  return getLocale();
}

/**
 * Switch locale at runtime.
 * - UI modules should listen for 'localechange' event on window.
 * - Returns immediately; async loading happens in background.
 *
 * @param {string} locale
 * @returns {boolean} true if changed
 */
export function switchLocale(locale) {
  const changed = setLocale(locale);
  if (changed) {
    // Pre-load the new locale if not cached
    if (!_tables.has(locale)) {
      loadLocale(locale); // fire-and-forget
    }
  }
  return changed;
}

// ── re-exports from locale.js ─────────────────────────────────────────────



// ── global exposure for inline scripts ──
if (typeof window !== "undefined") {
  if (typeof window !== "undefined" && !window.t) { window.t = t; }
  window._i18nT = t;
}

export { getSupported, getAllLocales } from './locale.js';

// ── path utility ──────────────────────────────────────────────────────────

/**
 * Get the base path configured for loading locale files.
 * @returns {string}
 */
export function getBasePath() {
  return _i18nBasePath;
}