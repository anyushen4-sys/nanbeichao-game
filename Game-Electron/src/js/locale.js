/**
 * locale.js — Locale management for NanBeiChao Card Power
 *
 * Implements ADR-0005 i18n locale lifecycle:
 *   - Read/write nanbeichao.locale in localStorage
 *   - Sync document.documentElement.lang on change
 *   - Supported: zh-CN, en-US (Phase 2 slots: zh-TW, fr-FR, es-ES)
 *   - Default: zh-CN
 *   - Event dispatch on locale change for downstream consumers
 */

const STORAGE_KEY = 'nanbeichao.locale';

/** @type {string[]} — all locale codes that have real translation data */
const SUPPORTED = ['zh-CN', 'en-US', 'fr-FR', 'zh-TW'];

/** @type {string[]} — Phase 2 placeholder slots (no data yet, not selectable) */
const RESERVED = ['es-ES'];

/** @type {string} — fallback chain, most to least preferred */
const FALLBACK_CHAIN = ['zh-CN', 'en-US', 'fr-FR', 'zh-TW'];

// ── current locale (mutable) ──────────────────────────────────────────────────

/** @type {string} */
let _current = null;

// ── internal ─────────────────────────────────────────────────────────────────

function _detectBrowserLocale() {
  if (typeof navigator === 'undefined') return 'zh-CN';
  try {
    const raw = navigator.language || navigator.userLanguage || '';
    return raw.startsWith('zh') ? 'zh-CN' : raw;
  } catch {
    return 'zh-CN';
  }
}

function _readStorage() {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function _saveStorage(locale) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch { /* ignore quota / private mode */ }
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Get the currently active locale.
 * Lazy-init: first call resolves storage → browser → default ('zh-CN').
 *
 * @returns {string} e.g. 'zh-CN'
 */
export function getLocale() {
  if (_current !== null) return _current;

  const stored = _readStorage();
  if (stored) {
    // Only SUPPORTED locales are allowed for the active locale.
    // RESERVED values in storage are an artifact; fall back to default.
    if (SUPPORTED.includes(stored)) {
      _current = stored;
      _applyDOM(_current);
      return _current;
    }
  }

  // No valid stored locale — try browser
  const browser = _detectBrowserLocale();
  if (SUPPORTED.includes(browser)) {
    _current = browser;
  } else {
    _current = FALLBACK_CHAIN[0]; // zh-CN
  }

  _saveStorage(_current);
  _applyDOM(_current);
  return _current;
}

/**
 * Switch locale at runtime.
 * - Saves to localStorage
 * - Updates document.documentElement.lang
 * - Dispatches 'localechange' event for UI re-render
 *
 * @param {string} locale — one of SUPPORTED or RESERVED
 * @returns {boolean} true if locale changed, false if same or invalid
 */
export function setLocale(locale) {
  // Only allow actually SUPPORTED locales (NOT reserved Phase 2 slots)
  if (!SUPPORTED.includes(locale)) {
    console.warn(`[locale] Unsupported locale "${locale}", ignoring. Supported: ${SUPPORTED.join(', ')}`);
    return false;
  }

  if (locale === _current) return false;

  _current = locale;
  _saveStorage(locale);
  _applyDOM(locale);

  // Fire event so UI modules can re-render
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
  }

  return true;
}

/**
 * Return the ordered fallback chain for the current locale.
 * e.g. if current is 'en-US', returns ['en-US', 'zh-CN', absolute fallback]
 * Missing keys resolve: current → en-US → zh-CN → key itself
 *
 * @param {string} [locale] — fallback for this locale (default: getLocale())
 * @returns {(string|null)[]} chain of locale codes; last element is null (key-itself fallback)
 */
export function resolutionChain(locale = getLocale()) {
  const used = new Set();
  const chain = [];

  // 1. requested locale
  chain.push(locale);
  used.add(locale);

  // 2. primary fallback (always en-US unless itself)
  if (!used.has('en-US')) {
    chain.push('en-US');
    used.add('en-US');
  }

  // 3. ultimate fallback (zh-CN unless duplicate)
  if (!used.has('zh-CN')) {
    chain.push('zh-CN');
    used.add('zh-CN');
  }

  // 4. key itself (represented by null)
  chain.push(null);

  return chain;
}

/**
 * All locale codes with real translation data.
 * @returns {string[]}
 */
export function getSupported() {
  return [...SUPPORTED];
}

/**
 * All locale codes (including reserved Phase 2 slots).
 * @returns {string[]}
 */
export function getAllLocales() {
  return [...SUPPORTED, ...RESERVED];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function _applyDOM(locale) {
  if (typeof document !== 'undefined' && document.documentElement) {
    // Only set if it maps to a real BCP47-compliant tag
    // zh-CN → zh-CN, en-US → en-US (both valid BCP47)
    document.documentElement.lang = locale;
  }
}

// ── global exposure (for non-module inline scripts like renderSettings) ──
if (typeof window !== 'undefined') {
  window.Locale = {
    getLocale,
    setLocale,
    getSupported,
    getAllLocales,
    resolutionChain,
    applyToDocument: _applyDOM,
  };
}