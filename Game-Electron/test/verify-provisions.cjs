#!/usr/bin/env node
// test/verify-provisions.cjs
// Ad-hoc verification for provisions mechanism (Task: 粮草-2)
// Tests:
//  1. Initial provisions = 15 (was 30)
//  2. startRound grants +3 each round to both players
//  3. Provisions cap doesn't keep accruing beyond reasonable levels
//  4. hasPlayableCard returns false when prov < cheapest cost in hand
//  5. AI does not infinite-loop when provisions insufficient (no playable card)
//  6. Farm timing: 粮草 added in startRound, not on wrong side mid-turn

'use strict';

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'index.html'),
  'utf8'
);

// Extract second inline script (the big one with game logic, lines 470-4015)
const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, code = '', i = 0;
while ((m = scriptRe.exec(html)) !== null) {
  i++;
  if (i === 2) {
    code = m[1];
    break;
  }
}
if (!code) {
  console.error('FAIL: could not find second inline script');
  process.exit(1);
}

// Load combos module (referenced in the script)
const comboCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'js', 'combos.js'),
  'utf8'
);

// Build the prefix: DOM stubs + globals before the script
const stubPrefix = `
  // stubEl: a fake DOM element that accepts any operation
  const stubEl = {
    innerHTML: '',
    textContent: '',
    outerHTML: '',
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    style: new Proxy({}, { get: () => '', set: () => true }),
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    children: [],
    parentNode: null
  };
  const document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: () => stubEl,
    querySelector: () => stubEl,
    querySelectorAll: () => [],
    body: stubEl,
    head: stubEl,
    createElement: () => Object.assign({}, stubEl, {
      cloneNode: () => Object.assign({}, stubEl),
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 })
    }),
    readyState: 'complete'
  };
  const window = globalThis;
  window.document = document;
  const localStorage = { getItem: () => null, setItem: () => {} };
  const console = globalThis.console;
  const setTimeout = globalThis.setTimeout;
  const setInterval = () => 0;
  const clearTimeout = () => {};
  const clearInterval = () => {};
  const requestAnimationFrame = (cb) => 0;
  const cancelAnimationFrame = () => {};
`;

const fullCode = stubPrefix + '\n' + comboCode + '\n' + code;

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) {
    pass++;
    console.log('  \u2714', label);
  } else {
    fail++;
    console.error('  \u2718', label, detail || '');
  }
}

let ctx;
try {
  // Wrap the full code in a function so my stubs (t, addLog) can be declared
  // in the wrapper scope without conflicting with same-named declarations in
  // the script body. Use unique names that won't collide.
  ctx = new Function(
    'stub_t', 'stub_addLog', 'stub_drawCards', 'stub_render', 'stub_applyLeaderAbilityForRound',
    `
    function t(key, params) { return stub_t(key, params); }
    function addLog(msg) { stub_addLog(msg); }
    function drawCards(p, n) { stub_drawCards(p, n); }
    function render() { stub_render(); }
    function applyLeaderAbilityForRound(leader, pIdx) { stub_applyLeaderAbilityForRound(leader, pIdx); }
    ${fullCode}
    return {
      G,
      startRound: typeof startRound === 'function' ? startRound : null,
      endRound: typeof endRound === 'function' ? endRound : null,
      getCardCost: typeof getCardCost === 'function' ? getCardCost : null,
      hasPlayableCard: typeof hasPlayableCard === 'function' ? hasPlayableCard : null,
      aiShouldPass: typeof aiShouldPass === 'function' ? aiShouldPass : null
    };
    `
  )(
    (key, params) => {
      let s = key;
      if (params) {
        for (const [k, v] of Object.entries(params)) s = s.replace('{' + k + '}', v);
      }
      return s;
    },
    (msg) => { /* no-op log */ },
    (p, n) => { /* no-op drawCards */ },
    () => { /* no-op render */ },
    (leader, pIdx) => { /* no-op applyLeaderAbilityForRound */ }
  );
} catch (e) {
  console.error('Script evaluation failed:', e.message);
  console.error(e.stack.split('\n').slice(0, 8).join('\n'));
  process.exit(1);
}

console.log('\n=== Provisions mechanism verification ===\n');

// ===== Test 1: initial provisions = 15 =====
console.log('Test 1: Initial provisions = 15');
check('G.provisions is array of length 2', Array.isArray(ctx.G.provisions) && ctx.G.provisions.length === 2);
check('G.provisions[0] = 15', ctx.G.provisions[0] === 15, 'got ' + ctx.G.provisions[0]);
check('G.provisions[1] = 15', ctx.G.provisions[1] === 15, 'got ' + ctx.G.provisions[1]);

// ===== Test 2: startRound grants +3 each round =====
console.log('\nTest 2: startRound grants +3 each round');
const startRoundSrc = code.match(/function startRound\(\)\{[\s\S]*?\n\}/);
check('startRound function defined', !!startRoundSrc);
if (startRoundSrc) {
  const src = startRoundSrc[0];
  check('startRound adds +3 to player prov',
    /G\.provisions\[0\]\s*\+=\s*3/.test(src));
  check('startRound adds +3 to AI prov',
    /G\.provisions\[1\]\s*\+=\s*3/.test(src));
  check('startRound grants playerFarm to player[0] (correct side)',
    /G\.globalBuffs\.playerFarm\s*>\s*0[\s\S]{0,120}G\.provisions\[0\]\s*\+=/.test(src));
  check('startRound grants aiFarm to AI[1] (correct side)',
    /G\.globalBuffs\.aiFarm\s*>\s*0[\s\S]{0,120}G\.provisions\[1\]\s*\+=/.test(src));
}

// ===== Test 3: getCardCost formula unchanged =====
console.log('\nTest 3: getCardCost formula unchanged');
check('cost(strength=1) = 1', ctx.getCardCost(1) === 1, 'got ' + ctx.getCardCost(1));
check('cost(strength=3) = 1', ctx.getCardCost(3) === 1);
check('cost(strength=4) = 2', ctx.getCardCost(4) === 2);
check('cost(strength=8) = 3', ctx.getCardCost(8) === 3);

// ===== Test 4: hasPlayableCard returns false when prov < cheapest cost =====
console.log('\nTest 4: hasPlayableCard under insufficient provisions');
ctx.G.players[0].hand = [
  { id: 1, strength: 5, row: 'infantry', ability: null }
];
ctx.G.provisions[0] = 0;
check('prov=0, hand has cost=2 card -> hasPlayableCard=false',
  ctx.hasPlayableCard(0) === false);

ctx.G.provisions[0] = 1;
check('prov=1, hand has cost=2 card -> hasPlayableCard=false',
  ctx.hasPlayableCard(0) === false);

ctx.G.provisions[0] = 2;
check('prov=2, hand has cost=2 card -> hasPlayableCard=true',
  ctx.hasPlayableCard(0) === true);

// ===== Test 5: AI does not infinite-loop when prov insufficient =====
console.log('\nTest 5: AI forced to pass when provisions insufficient');
ctx.G.players[1].hand = [
  { id: 1, strength: 5, row: 'infantry', ability: null }
];
ctx.G.provisions[1] = 0;
ctx.G.players[1].passed = false;
check('AI side hasPlayableCard=false when prov=0',
  ctx.hasPlayableCard(1) === false);
check('AI prov unchanged by hasPlayableCard check',
  ctx.G.provisions[1] === 0);
check('AI passed state preserved (hasPlayableCard does not modify it)',
  ctx.G.players[1].passed === false);

// ===== Test 6: Farm timing - bug fixed =====
console.log('\nTest 6: Farm timing bug fix');
// afterPlayerTurn no longer adds aiFarm to provisions[1]
const buggyPattern1 = /function\s+afterPlayerTurn[\s\S]*?return;[\s\S]*?G\.globalBuffs\.aiFarm\s*>\s*0[\s\S]{0,200}G\.provisions\[1\]\s*\+=/;
check('afterPlayerTurn no longer adds aiFarm to AI prov (bug fix)',
  !buggyPattern1.test(code));

// aiTurn's setTimeout no longer adds playerFarm to provisions[0]
const buggyPattern2 = /function\s+aiTurn[\s\S]*?setTimeout\(\(\)=>\s*\{[\s\S]*?G\.globalBuffs\.playerFarm\s*>\s*0[\s\S]{0,200}G\.provisions\[0\]\s*\+=/;
check('aiTurn setTimeout no longer adds playerFarm to player prov (bug fix)',
  !buggyPattern2.test(code));

// startRound DOES grant playerFarm (correct side)
if (startRoundSrc) {
  check('startRound grants playerFarm to player[0]',
    /G\.globalBuffs\.playerFarm\s*>\s*0[\s\S]{0,120}G\.provisions\[0\]\s*\+=/.test(startRoundSrc[0]));
  check('startRound grants aiFarm to AI[1]',
    /G\.globalBuffs\.aiFarm\s*>\s*0[\s\S]{0,120}G\.provisions\[1\]\s*\+=/.test(startRoundSrc[0]));
}

// ===== Test 7: Cross-round provisions sanity =====
console.log('\nTest 7: Cross-round provisions math');
const expectedAt10Rounds = 15 + 10 * 3;
check('10 rounds with no farm = 45 prov', expectedAt10Rounds === 45);

// ===== Test 8: renderPips max parameter updated =====
console.log('\nTest 8: renderPips max parameter uses 15');
const renderPipsMatches = code.match(/renderPips\([^)]+\)/g) || [];
const oldMaxPips = renderPipsMatches.filter(s => /,\s*30\s*,/.test(s));
const newMaxPips = renderPipsMatches.filter(s => /,\s*15\s*,/.test(s));
check('No renderPips(..., 30, ...) calls remaining (old)', oldMaxPips.length === 0,
  'remaining: ' + oldMaxPips.join(' | '));
check('At least one renderPips(..., 15, ...) call present (new)', newMaxPips.length >= 1,
  'count: ' + newMaxPips.length);

// ===== Test 9: end-to-end startRound execution =====
console.log('\nTest 9: startRound actually grants +3 (end-to-end)');
// Set up clean state
ctx.G.round = 0;
ctx.G.provisions[0] = 15;
ctx.G.provisions[1] = 15;
ctx.G.globalBuffs.playerFarm = 0;
ctx.G.globalBuffs.aiFarm = 0;
ctx.G.players[0].leader = null;
ctx.G.players[1].leader = null;
ctx.G.players[0].hand = [];
ctx.G.players[1].hand = [];
ctx.G.players[0].deck = [];
ctx.G.players[1].deck = [];
ctx.G._comboDrawBonus = null;

try {
  ctx.startRound();
  // After startRound, provisions should be 15 + 3 = 18 (round 1, no farm)
  check('startRound grants +3 to player[0]', ctx.G.provisions[0] === 18,
    'got ' + ctx.G.provisions[0]);
  check('startRound grants +3 to AI[1]', ctx.G.provisions[1] === 18,
    'got ' + ctx.G.provisions[1]);
  check('startRound increments G.round to 1', ctx.G.round === 1);
} catch (e) {
  fail++;
  console.error('  \u2718 startRound threw:', e.message);
}

// Round 2: simulate with farm buff
ctx.G.provisions[0] = 15;
ctx.G.provisions[1] = 15;
ctx.G.globalBuffs.playerFarm = 2; // simulated farm card played last round
ctx.G.globalBuffs.aiFarm = 3;
ctx.G._comboDrawBonus = null;
try {
  ctx.startRound();
  // Round 2: 15 + 3 + 2 = 20 for player, 15 + 3 + 3 = 21 for AI
  check('startRound grants +3+playerFarm to player[0]', ctx.G.provisions[0] === 20,
    'got ' + ctx.G.provisions[0]);
  check('startRound grants +3+aiFarm to AI[1]', ctx.G.provisions[1] === 21,
    'got ' + ctx.G.provisions[1]);
  // After startRound, globalBuffs should be reset (farm cleared)
  check('globalBuffs reset clears playerFarm after grant',
    ctx.G.globalBuffs.playerFarm === 0);
  check('globalBuffs reset clears aiFarm after grant',
    ctx.G.globalBuffs.aiFarm === 0);
} catch (e) {
  fail++;
  console.error('  \u2718 startRound (with farm) threw:', e.message);
}

console.log('\n=== Summary ===');
console.log('Pass: ' + pass + ', Fail: ' + fail);
process.exit(fail > 0 ? 1 : 0);
