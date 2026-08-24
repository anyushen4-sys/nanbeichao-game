// Smoke test for src/js/splash.js (SPLASH-6)
// Run from project root: node Game-Electron/test/_splash6_smoke.cjs
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Minimal browser-like globals
const ctx = {
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (cb) => 0, // no-op
  window: null,
  document: {
    getElementById: (id) => null,
    addEventListener: () => {},
    createElement: () => ({ getContext: () => null })
  },
  G: null,
  render: null
};
ctx.window = ctx;

// Inline splash-controller stub (matches inline controller in index.html)
ctx.window.showSplash = function () { console.log('[inline] showSplash (will be overridden)'); };
ctx.window.hideSplash = function () { console.log('[inline] hideSplash (will be overridden)'); };
ctx.window._splashSkip = function () { console.log('[inline] _splashSkip (will be overridden)'); };

// Load splash.js
const splashPath = path.resolve(__dirname, '..', 'src', 'js', 'splash.js');
const code = fs.readFileSync(splashPath, 'utf8');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log('  PASS', msg); passed++; }
  else      { console.log('  FAIL', msg); failed++; }
}

console.log('=== SPLASH-6 smoke ===');

// Render in sandbox
vm.createContext(ctx);
try {
  vm.runInContext(code, ctx, { filename: 'splash.js' });
} catch (e) {
  console.error('splash.js threw at load:', e.message);
  failed++;
}

// === Tests ===

// 1. State exists
assert(ctx._splashState !== undefined, '_splashState defined');
assert(Array.isArray(ctx._splashState.videos), '_splashState.videos is array');
assert(ctx._splashState.videos.length === 6, 'videos.length === 6');

// 2. Video filenames match actual files
const expected = ['intro_01_mystery', 'intro_02_battle', 'intro_03_generals', 'intro_04', 'intro_05', 'intro_06'];
expected.forEach((name, i) => {
  assert(ctx._splashState.videos[i] === name, `videos[${i}] === "${name}" (got "${ctx._splashState.videos[i]}")`);
});

// 3. Public API exposed
['initSplash', 'showSplash', 'hideSplash', '_splashSkip',
 '_playNextVideo', '_onVideoEnded', '_onVideoTimeUpdate',
 '_initSplashStars', '_initSplashAudio', 'toggleBGM', 'setBGMVolume', 'playSFX',
 '_splashIsDisabled'].forEach(fn => {
  assert(typeof ctx[fn] === 'function', `${fn} is function`);
});

// 4. splash.js showSplash OVERRIDES inline one (signature with _playNextVideo call inside)
assert(ctx.window.showSplash !== undefined, 'window.showSplash defined');
// Verify the new override calls _playNextVideo (the inline one didn't)
assert(ctx.window.showSplash.toString().indexOf('_playNextVideo') !== -1,
  'window.showSplash body references _playNextVideo (full version)');

// 5. _splashIsDisabled returns true for ?nosplash=1
ctx.window.location = { search: '?nosplash=1' };
assert(ctx._splashIsDisabled() === true, '_splashIsDisabled() === true for ?nosplash=1');
ctx.window.location = { search: '' };
assert(ctx._splashIsDisabled() === false, '_splashIsDisabled() === false for empty');
ctx.window.location = { search: '?foo=bar&nosplash=1' };
assert(ctx._splashIsDisabled() === true, '_splashIsDisabled() === true for &nosplash=1');

// 6. Idempotent initSplash
assert(ctx._splashInited === false || ctx._splashInited === true, '_splashInited flag set');
// Call twice - second should be no-op
try {
  ctx.initSplash();
  ctx.initSplash();
  // OK if no throw
  assert(true, 'initSplash() called twice without throw');
} catch (e) {
  assert(false, 'initSplash() threw: ' + e.message);
}

// 7. Video src composition: _playNextVideo references 'assets/intro/'
// (we can inspect the function body)
const playBody = ctx._playNextVideo.toString();
assert(playBody.indexOf('assets/intro/') !== -1, '_playNextVideo uses assets/intro/ path');
assert(playBody.indexOf('${state.videos') !== -1 || playBody.indexOf('state.videos[state.currentVideo]') !== -1,
  '_playNextVideo uses state.videos[currentVideo]');
assert(playBody.indexOf('.mp4') !== -1, '_playNextVideo uses .mp4 suffix');

// 8. Safety timeout reference
assert(playBody.indexOf('30000') !== -1 || ctx.window.showSplash.toString().indexOf('30000') !== -1,
  '30s safety timeout present');

// 9. Video ended -> _onVideoEnded increments
const endedBody = ctx._onVideoEnded.toString();
assert(endedBody.indexOf('currentVideo++') !== -1, '_onVideoEnded increments currentVideo');

// 10. _onVideoTimeUpdate uses local state
const tuBody = ctx._onVideoTimeUpdate.toString();
assert(tuBody.indexOf('state') !== -1, '_onVideoTimeUpdate references state (bug fix)');

console.log(`\n${passed} PASS, ${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
