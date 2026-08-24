// Integration test for SPLASH-6: simulate full HTML + splash.js + verify state transitions
// Run from project root: node Game-Electron/test/_splash6_integration.cjs
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// --- Mock DOM ---
class FakeElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.style = {};
    this.classList = { add(){}, remove(){} };
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.textContent = '';
    this.innerHTML = '';
    this.src = '';
    this.muted = false;
    this.paused = false;
    this.currentTime = 0;
    this.duration = 0;
    this._src = '';
    this._loaded = false;
  }
  addEventListener(ev, cb) {
    this.listeners[ev] = this.listeners[ev] || [];
    this.listeners[ev].push(cb);
  }
  removeEventListener() {}
  removeAttribute(k) { delete this[k]; }
  getAttribute(k) { return this[k]; }
  setAttribute(k, v) { this[k] = v; }
  getContext() { return { clearRect(){}, beginPath(){}, arc(){}, fill(){}, fillStyle: '' }; }
  load() { this._loaded = true; }
  pause() { this.paused = true; }
  play() {
    // simulate autoplay
    if (!this.muted && false) return Promise.reject(new Error('autoplay blocked'));
    return Promise.resolve();
  }
  querySelector() { return null; }
  appendChild() {}
  remove() {}
}

const splashScreen = new FakeElement('splash-screen', 'div');
const splashStars = new FakeElement('splash-stars', 'canvas');
const splashTextContainer = new FakeElement('splash-text-container', 'div');
const splashText = new FakeElement('splash-text', 'div');
const splashVideoContainer = new FakeElement('splash-video-container', 'div');
const splashVideo = new FakeElement('splash-video', 'video');
const splashSkipBtn = new FakeElement('splash-skip-btn', 'button');
const splashProgress = new FakeElement('splash-progress', 'div');
const splashProgressWrap = new FakeElement('splash-progress-wrap', 'div');

const elements = {
  'splash-screen': splashScreen,
  'splash-stars': splashStars,
  'splash-text-container': splashTextContainer,
  'splash-text': splashText,
  'splash-video-container': splashVideoContainer,
  'splash-video': splashVideo,
  'splash-skip-btn': splashSkipBtn,
  'splash-progress': splashProgress,
  'splash-progress-wrap': splashProgressWrap
};

const domListeners = [];
const fakeDocument = {
  getElementById: (id) => elements[id] || null,
  addEventListener: (ev, cb) => domListeners.push({ ev, cb }),
  removeEventListener: () => {},
  querySelector: () => null,
  createElement: (tag) => new FakeElement('', tag),
  body: new FakeElement('body', 'body')
};

// Capture render() calls
let renderCalled = 0;
let renderArgs = [];
const origRender = function () { renderCalled++; renderArgs.push(Array.from(arguments)); };

const ctx = {
  console,
  setTimeout: (cb, ms) => { return ms; }, // fake id
  clearTimeout: () => {},
  requestAnimationFrame: () => 0,
  window: null,
  document: fakeDocument,
  location: { search: '' },
  G: { phase: 'menu' },
  render: origRender,
  addEventListener: () => {},
  removeEventListener: () => {}
};
ctx.window = ctx;

// Render: dash inline controller (matches what index.html has)
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

vm.createContext(ctx);
try {
  vm.runInContext(code, ctx, { filename: 'splash.js' });
} catch (e) {
  console.error('splash.js threw at load:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('=== SPLASH-6 INTEGRATION TEST ===');

// 1. showSplash OVERRIDES inline one (must reference _playNextVideo)
assert(ctx.window.showSplash.toString().indexOf('_playNextVideo') !== -1,
  'showSplash overridden to full version (calls _playNextVideo)');

// 2. render wrapped (since render exists at load time)
assert(ctx.window.render !== origRender, 'window.render was wrapped by splash.js');

// 3. initSplash attaches video event listeners
ctx.initSplash();
assert(splashVideo.listeners.ended && splashVideo.listeners.ended.length === 1,
  'initSplash attaches ended listener on #splash-video');
assert(splashVideo.listeners.timeupdate && splashVideo.listeners.timeupdate.length === 1,
  'initSplash attaches timeupdate listener on #splash-video');
assert(splashVideo.listeners.error && splashVideo.listeners.error.length === 1,
  'initSplash attaches error listener on #splash-video');

// 4. Calling render triggers showSplash via wrapper
renderCalled = 0;
ctx.window.render();
assert(renderCalled === 1, 'wrapped render calls orig render');
assert(splashScreen.style.display === 'block', 'showSplash sets splash-screen display=block');
assert(splashVideo._loaded === true, '_playNextVideo calls video.load()');
assert(typeof splashVideo.src === 'string' && splashVideo.src.indexOf('intro_01_mystery') !== -1,
  'first video src is intro_01_mystery');

// 5. Simulate video ended -> advances to next video
assert(splashVideo.listeners.ended.length === 1, 'ended listener present');
ctx._splashState.currentVideo = 0;
splashVideo.src = '';
ctx._onVideoEnded();
assert(ctx._splashState.currentVideo === 1, '_onVideoEnded increments currentVideo to 1');
assert(splashVideo.src.indexOf('intro_02_battle') !== -1,
  'second video src is intro_02_battle');

// 6. Simulate all videos ended -> hideSplash called
ctx._splashState.currentVideo = 5;
splashVideo.src = '';
ctx._onVideoEnded();
assert(ctx._splashState.isPlaying === false, 'after last video, isPlaying=false');
assert(ctx._splashState.isSkipped === true, 'after last video, isSkipped=true');

// 7. Skip flow
ctx._splashState.isPlaying = true;
ctx._splashState.isSkipped = false;
splashScreen.style.display = 'block';
ctx._splashSkip();
assert(ctx._splashState.isSkipped === true, '_splashSkip sets isSkipped=true');
assert(ctx._splashState.isPlaying === false, '_splashSkip sets isPlaying=false');

// 8. progress bar update via timeupdate
ctx._splashState.currentVideo = 3; // currently playing 4th video (index 3)
splashVideo.currentTime = 3;
splashVideo.duration = 6;
splashProgress.style.width = '0%';
ctx._onVideoTimeUpdate({ target: splashVideo });
const w = splashProgress.style.width;
assert(w === '58.333333333333336%', `progress bar = (3 + 0.5)/6 * 100 = 58.33% (got "${w}")`);

// 9. nosplash disables
ctx.window.location = { search: '?nosplash=1' };
assert(ctx._splashIsDisabled() === true, '?nosplash=1 disables splash');

// 10. videoToText / texts content
assert(ctx._splashState.videoToText[3] === 0, 'video 3 maps to text 0');
assert(ctx._splashState.videoToText[4] === 1, 'video 4 maps to text 1');
assert(ctx._splashState.videoToText[5] === 2, 'video 5 maps to text 2');
assert(ctx._splashState.texts.length === 5, '5 history texts defined');

console.log(`\n${passed} PASS, ${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
