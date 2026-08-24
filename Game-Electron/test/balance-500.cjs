#!/usr/bin/env node
// test/balance-500.cjs
// 500 rounds AI vs AI balance test using REAL game code from src/index.html
// Must use verify-provisions.cjs scaffold: new Function + DOM stub + sync setTimeout loop

'use strict';

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'index.html'),
  'utf8'
);

const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, code = '', i = 0;
while ((m = scriptRe.exec(html)) !== null) {
  i++;
  if (i === 2) { code = m[1]; break; }
}
if (!code) { console.error('FAIL: no inline script'); process.exit(1); }

const comboCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'js', 'combos.js'),
  'utf8'
);

// ===== FAKE DECK: 80 cards, strength 1-9 (9 each = 81, minus 1 = 80) =====
const FAKE_DECK = [];
for (let strength = 1; strength <= 9; strength++) {
  const count = (strength === 1) ? 8 : 9; // 8*1 + 9*8 = 80
  for (let copy = 0; copy < count; copy++) {
    FAKE_DECK.push({
      id: FAKE_DECK.length + 1,
      name: `C${strength}_${copy}`,
      strength,
      row: 'infantry',
      faction: 'song',
      type: 'general'
    });
  }
}
console.log(`FAKE_DECK size: ${FAKE_DECK.length}`);

// ===== STUB PREFIX: DOM stubs + sync setTimeout wrapper =====
const stubPrefix = `
  // --- DOM stub element ---
  const stubEl = {
    innerHTML: '', textContent: '', outerHTML: '',
    appendChild: () => {}, removeChild: () => {}, remove: () => {},
    setAttribute: () => {}, getAttribute: () => null,
    addEventListener: () => {}, removeEventListener: () => {},
    style: new Proxy({}, { get: () => '', set: () => true }),
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    children: [], parentNode: null
  };
  const document = {
    addEventListener: () => {}, removeEventListener: () => {},
    getElementById: () => stubEl, querySelector: () => stubEl, querySelectorAll: () => [],
    body: stubEl, head: stubEl,
    createElement: () => Object.assign({}, stubEl, {
      cloneNode: () => Object.assign({}, stubEl),
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 })
    }),
    readyState: 'complete'
  };
  const window = globalThis; window.document = document;
  const localStorage = { getItem: () => null, setItem: () => {} };
  const console = globalThis.console;
  // --- i18n stubs (window.cn, window.ln, etc.) ---
  window.currentLocale = 'zh-CN';
  window.cn = (c) => c && c.name_en && window.currentLocale !== 'zh-CN' ? c.name_en : c && c.name || '';
  window.ln = (l) => l && l.name_en && window.currentLocale !== 'zh-CN' ? l.name_en : l && l.name || '';
  window.cd = (c) => c && c.desc_en && window.currentLocale !== 'zh-CN' ? c.desc_en : c && c.desc || '';
  window.ld = (l) => l && l.desc_en && window.currentLocale !== 'zh-CN' ? l.desc_en : l && l.desc || '';
  window.ctl = (c) => {
    if (!c) return '';
    const type = c.type;
    if (type === 'minister') return '文臣';
    if (type === 'poet') return '诗人';
    if (type === 'monk') return '僧侣';
    if (type === 'industry') return '行业';
    if (type === 'general') return '武将';
    if (c.faction === 'common') return '武将';
    if (c.id && c.id <= 50) return '武将';
    return '';
  };
  // --- CARD_DATA_URIS stub ---
  window.CARD_DATA_URIS = {};
  // --- sync setTimeout queue (no real async) ---
  const _timers = [];
  const setTimeout = (cb, ms) => { _timers.push({ cb, fireAt: Date.now() + (ms || 0) }); return _timers.length; };
  const clearTimeout = (id) => { if (id > 0 && id <= _timers.length) _timers[id - 1] = null; };
  const setInterval = () => 0; const clearInterval = () => {};
  const requestAnimationFrame = (cb) => 0; const cancelAnimationFrame = () => {};
`;

// ===== DRAW CARDS: use real drawCards from compiled code with FAKE_DECK override =====
// We need to override the deck to use FAKE_DECK for deterministic draws
function resetFakeDecks() {
  G.players[0].deck = FAKE_DECK.map((c, i) => ({ ...c, uid: 'p0_' + i }));
  G.players[1].deck = FAKE_DECK.map((c, i) => ({ ...c, uid: 'p1_' + i }));
}

// ===== COMPILE GAME CODE =====
const fullCode = stubPrefix + '\n' + comboCode + '\n' + code;

let ctx;
try {
  ctx = new Function(
    'stub_t', 'stub_addLog',
    'stub_render', 'stub_showNotification', 'stub_showToast', 'stub_renderPips',
    'stub_playSplashVideo', 'stub_initMultiplayer',
    `
    function t(key, params) { return stub_t(key, params); }
    function addLog(msg) { stub_addLog(msg); }
    function render() { stub_render(); }
    function showNotification(text, dur) { stub_showNotification(text, dur); }
    function showToast(text, dur) { stub_showToast(text, dur); }
    function renderPips() { return stub_renderPips(); }
    function playSplashVideo() { stub_playSplashVideo(); }
    function initMultiplayer() { stub_initMultiplayer(); }
    function getFactionName(f) { return (FACTIONS[f] && FACTIONS[f].name) || f; }
    ${fullCode}
    return {
      G,
      confirmLeader: typeof confirmLeader === 'function' ? confirmLeader : null,
      startRound: typeof startRound === 'function' ? startRound : null,
      endRound: typeof endRound === 'function' ? endRound : null,
      checkGameEnd: typeof checkGameEnd === 'function' ? checkGameEnd : null,
      playCard: typeof playCard === 'function' ? playCard : null,
      aiChooseCard: typeof aiChooseCard === 'function' ? aiChooseCard : null,
      aiShouldPass: typeof aiShouldPass === 'function' ? aiShouldPass : null,
      hasPlayableCard: typeof hasPlayableCard === 'function' ? hasPlayableCard : null,
      getCardCost: typeof getCardCost === 'function' ? getCardCost : null,
      getBoardPower: typeof getBoardPower === 'function' ? getBoardPower : null,
      triggerAbilityWithFlash: typeof triggerAbilityWithFlash === 'function' ? triggerAbilityWithFlash : null,
      triggerAbility: typeof triggerAbility === 'function' ? triggerAbility : null,
      afterPlayerTurn: typeof afterPlayerTurn === 'function' ? afterPlayerTurn : null,
      useLeaderAbility: typeof useLeaderAbility === 'function' ? useLeaderAbility : null,
      applyLeaderDeckAbility: typeof applyLeaderDeckAbility === 'function' ? applyLeaderDeckAbility : null,
      applyLeaderAbilityForRound: typeof applyLeaderAbilityForRound === 'function' ? applyLeaderAbilityForRound : null,
      buildDeck: typeof buildDeck === 'function' ? buildDeck : null,
      drawCards: typeof drawCards === 'function' ? drawCards : null,
      random: typeof random === 'function' ? random : null,
      _timers: _timers,
    };
    `
  )(
    (k, p) => { let s = k; if (p) for (const [k2, v] of Object.entries(p)) s = s.replace('{' + k2 + '}', v); return s; },
    () => {},
    () => {}, // render
    () => {}, // showNotification
    () => {}, // showToast
    () => '', // renderPips
    () => {}, // playSplashVideo
    () => {}  // initMultiplayer
  );
} catch (e) {
  console.error('Script evaluation failed:', e.message);
  console.error(e.stack.split('\n').slice(0, 10).join('\n'));
  process.exit(1);
}

const {
  G,
  confirmLeader,
  startRound,
  endRound,
  checkGameEnd,
  playCard,
  aiChooseCard,
  aiShouldPass,
  hasPlayableCard,
  getCardCost,
  getBoardPower,
  triggerAbilityWithFlash,
  triggerAbility,
  afterPlayerTurn,
  useLeaderAbility,
  applyLeaderDeckAbility,
  applyLeaderAbilityForRound,
  buildDeck,
  drawCards,
  random,
  _timers
} = ctx;

if (!confirmLeader || !startRound || !endRound || !checkGameEnd ||
    !playCard || !aiChooseCard || !aiShouldPass || !hasPlayableCard ||
    !applyLeaderAbilityForRound) {
  console.error('FAIL: required functions not exposed');
  process.exit(1);
}

// ===== LEADERS LIST (9 leaders) =====
const LEADERS = [
  { id: 1, name: '刘裕', faction: 'song' },
  { id: 2, name: '萧道成', faction: 'qi' },
  { id: 3, name: '萧衍', faction: 'liang' },
  { id: 4, name: '陈霸先', faction: 'chen' },
  { id: 5, name: '拓跋焘', faction: 'beiwei' },
  { id: 6, name: '元善见', faction: 'dongwei' },
  { id: 7, name: '元宝炬', faction: 'xiwei' },
  { id: 8, name: '高洋', faction: 'beiqi' },
  { id: 9, name: '宇文邕', faction: 'beizhou' }
];

function shuffleLeaders() {
  return LEADERS.sort(() => random() - 0.5);
}

// ===== SYNC TIMER FLUSH =====
function flushTimers() {
  while (_timers.length > 0) {
    const t = _timers.shift();
    if (t && t.cb) {
      try { t.cb(); } catch (e) { console.error('[timer error]', e.message); }
    }
  }
}

// ===== RESET GAME STATE =====
function resetGame(p0Leader, p1Leader) {
  G.phase = 'menu';
  G.round = 0;
  G.scores = [0, 0];
  G.provisions = [15, 15]; // Match src/index.html: initial = 15
  G.currentTurn = 'player';
  G.turnCount = 0;
  G.logs = [];
  G._comboDrawBonus = [0, 0];
  G.globalBuffs = {
    playerArmor: 0, aiArmor: 0, playerUnify: 0, aiUnify: 0,
    ambushTriggered: false, playerFarm: 0, aiFarm: 0,
    playerBerserkCard: null, aiBerserkCard: null
  };
  G.graveyard = [];
  G.leaderAbilityUsed = [false, false];
  G._lastPlayedUid = null;
  G._lastPlayedBy = null;
  G._nextRoundBusy = false;
  G._menuScreen = 'main';

  G.players = [
    { deck: [], hand: [], board: { infantry: [], cavalry: [], navy: [], strategy: [] }, leader: null, passed: false },
    { deck: [], hand: [], board: { infantry: [], cavalry: [], navy: [], strategy: [] }, leader: null, passed: false }
  ];

  G.players[0].leader = { ...p0Leader, ability: LEADERS_DATA.find(l => l.id === p0Leader.id)?.ability || null };
  G.players[1].leader = { ...p1Leader, ability: LEADERS_DATA.find(l => l.id === p1Leader.id)?.ability || null };

  // Use FAKE_DECK for deterministic draws
  resetFakeDecks();

  // Mulligan: draw 7 each
  drawCards(0, 7);
  drawCards(1, 7);
  G.phase = 'playing';
}

// ===== SIMULATE ONE ROUND =====
function simulateRound(roundIdx, stats) {
  // Record provisions at round start
  stats.roundProvisionsStart.push({ p: G.provisions[0], a: G.provisions[1] });

  // startRound is called at the beginning of each round
  startRound();
  flushTimers();

  let guard = 0;
  const MAX_TURNS = 200; // safety
  let roundPassCount = 0; // track passes this round

  while (G.phase === 'playing' && guard < MAX_TURNS) {
    guard++;

    const cur = G.currentTurn === 'player' ? 0 : 1;

    // Check if current player must pass
    if (!hasPlayableCard(cur)) {
      G.players[cur].passed = true;
      if (cur === 1) {
        stats.provisionsExhaustedPass++;
      }
      roundPassCount++;
    } else if (cur === 1 && aiShouldPass()) {
      G.players[cur].passed = true;
      stats.aiStrategicPass++;
      roundPassCount++;
    } else {
      // Play a card
      let handIdx = -1;
      let row = 'infantry';

      if (cur === 0) {
        // Player: greedy best card (same logic as AI but no pass check)
        const hand = G.players[0].hand;
        let bestScore = -1;
        for (let i = 0; i < hand.length; i++) {
          const c = hand[i];
          if (!c) continue;
          const cost = getCardCost(c.strength);
          if (cost > G.provisions[0]) continue;
          const score = c.strength * 10 - cost;
          if (score > bestScore) { bestScore = score; handIdx = i; }
        }
        if (handIdx >= 0) row = hand[handIdx].row || 'infantry';
      } else {
        // AI: use real aiChooseCard
        const choice = aiChooseCard();
        if (choice) { handIdx = choice.handIdx; row = choice.row; }
      }

      if (handIdx >= 0) {
        playCard(cur, handIdx, row);
        flushTimers(); // execute triggerAbilityWithFlash setTimeout
        stats.cardsPlayed[cur]++;
        const playedCard = G.players[cur].board[row][G.players[cur].board[row].length - 1];
        if (playedCard) {
          stats.provisionsSpent[cur] += getCardCost(playedCard.strength);
        }
      } else {
        G.players[cur].passed = true;
        roundPassCount++;
      }
    }

    // Switch turn
    if (G.players[0].passed && G.players[1].passed) {
      break;
    }
    G.currentTurn = G.currentTurn === 'player' ? 'ai' : 'player';
  }

  // End round
  endRound();
  flushTimers();

  // Record round stats
  const pPower = getBoardPower(G.players[0].board, 0);
  const aPower = getBoardPower(G.players[1].board, 1);
  stats.roundPowers.push({ p: pPower, a: aPower });
  stats.roundProvisionsEnd.push({ p: G.provisions[0], a: G.provisions[1] });
  stats.cardsPerRound.push(stats.cardsPlayed[0] + stats.cardsPlayed[1] - (stats.prevCardsPlayed || 0));
  stats.prevCardsPlayed = stats.cardsPlayed[0] + stats.cardsPlayed[1];

  // Check game end
  checkGameEnd();
  flushTimers();

  return G.phase === 'game_result';
}

// ===== SIMULATE ONE FULL GAME (3 rounds max) =====
function simulateGame(gameIdx) {
  const leaders = shuffleLeaders();
  const p0Leader = leaders[0];
  const p1Leader = leaders[1];

  // Track per-game stats
  const stats = {
    p0Leader: p0Leader.name,
    p1Leader: p1Leader.name,
    winner: null, // 0, 1, or -1 (draw)
    rounds: 0,
    cardsPlayed: [0, 0],
    provisionsSpent: [0, 0],
    provisionsExhaustedPass: 0,
    aiStrategicPass: 0,
    roundPowers: [],
    roundProvisionsStart: [],
    roundProvisionsEnd: [],
    cardsPerRound: [],
    prevCardsPlayed: 0
  };

  resetGame(p0Leader, p1Leader);

  let gameOver = false;
  while (!gameOver && stats.rounds < 3) {
    stats.rounds++;
    gameOver = simulateRound(stats.rounds - 1, stats);
  }

  // Determine winner
  if (G.scores[0] > G.scores[1]) stats.winner = 0;
  else if (G.scores[1] > G.scores[0]) stats.winner = 1;
  else stats.winner = -1;

  return stats;
}

// ===== RUN 500 ROUNDS (across multiple games) =====
console.log('\n=== 500 Round AI vs AI Balance Test ===\n');

const TOTAL_ROUNDS = 500;
const allStats = [];
let totalRoundsRun = 0;

for (let gameIdx = 0; totalRoundsRun < TOTAL_ROUNDS; gameIdx++) {
  const gameStats = simulateGame(gameIdx);
  allStats.push(gameStats);
  totalRoundsRun += gameStats.rounds;

  if (gameIdx % 20 === 0) {
    console.log(`  Game ${gameIdx + 1}: ${gameStats.rounds} rounds, total rounds: ${totalRoundsRun}`);
  }
}

console.log(`\nTotal games: ${allStats.length}, Total rounds: ${totalRoundsRun}\n`);

// ===== AGGREGATE STATISTICS =====
const p0Wins = allStats.filter(s => s.winner === 0).length;
const p1Wins = allStats.filter(s => s.winner === 1).length;
const draws = allStats.filter(s => s.winner === -1).length;
const validGames = p0Wins + p1Wins + draws;

let totalRounds = 0;
let totalCardsP0 = 0, totalCardsP1 = 0;
let totalProvSpentP0 = 0, totalProvSpentP1 = 0;
let totalProvStartP0 = 0, totalProvStartP1 = 0;
let totalProvEndP0 = 0, totalProvEndP1 = 0;
let totalExhaustedPass = 0, totalStrategicPass = 0;
const leaderWins = {};

for (const s of allStats) {
  totalRounds += s.rounds;
  totalCardsP0 += s.cardsPlayed[0];
  totalCardsP1 += s.cardsPlayed[1];
  totalProvSpentP0 += s.provisionsSpent[0];
  totalProvSpentP1 += s.provisionsSpent[1];

  for (const rp of s.roundProvisionsStart) {
    totalProvStartP0 += rp.p;
    totalProvStartP1 += rp.a;
  }
  for (const rp of s.roundProvisionsEnd) {
    totalProvEndP0 += rp.p;
    totalProvEndP1 += rp.a;
  }
  totalExhaustedPass += s.provisionsExhaustedPass;
  totalStrategicPass += s.aiStrategicPass;

  // Leader win rates
  if (!leaderWins[s.p0Leader]) leaderWins[s.p0Leader] = { wins: 0, games: 0 };
  if (!leaderWins[s.p1Leader]) leaderWins[s.p1Leader] = { wins: 0, games: 0 };
  leaderWins[s.p0Leader].games++;
  leaderWins[s.p1Leader].games++;
  if (s.winner === 0) leaderWins[s.p0Leader].wins++;
  else if (s.winner === 1) leaderWins[s.p1Leader].wins++;
}

// ===== OUTPUT REPORT =====
console.log('=== 500 Round Balance Test Report ===\n');

console.log('1. Win Rate Distribution:');
console.log(`   Player (p0): ${p0Wins} wins (${((p0Wins / validGames) * 100).toFixed(1)}%)`);
console.log(`   AI (p1):     ${p1Wins} wins (${((p1Wins / validGames) * 100).toFixed(1)}%)`);
console.log(`   Draw:        ${draws} (${((draws / validGames) * 100).toFixed(1)}%)`);
console.log(`   Valid games: ${validGames}/${allStats.length}`);

const maxWinRate = Math.max(p0Wins, p1Wins) / validGames;
console.log(`   Max single-side win rate: ${(maxWinRate * 100).toFixed(1)}% ${maxWinRate > 0.6 ? '❌ FAIL (>60%)' : '✅ PASS'}`);

console.log('\n2. Average Rounds per Game:');
const avgRounds = totalRounds / allStats.length;
console.log(`   ${avgRounds.toFixed(2)} rounds (min=1, max=3) ${avgRounds >= 1.8 && avgRounds <= 3.0 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n3. Provisions Consumption:');
const avgProvStartP0 = totalProvStartP0 / totalRounds;
const avgProvStartP1 = totalProvStartP1 / totalRounds;
const avgProvEndP0 = totalProvEndP0 / totalRounds;
const avgProvEndP1 = totalProvEndP1 / totalRounds;
console.log(`   Round start - p0: ${avgProvStartP0.toFixed(1)}, p1: ${avgProvStartP1.toFixed(1)} (expected ~30 + round*3, carries over)`);
console.log(`   Round end   - p0: ${avgProvEndP0.toFixed(1)}, p1: ${avgProvEndP1.toFixed(1)} (expected >= 0)`);
// Pass trigger rate: number of rounds where at least one pass happened / total rounds
const roundsWithPass = allStats.reduce((sum, s) => {
  // Count rounds where either side passed
  return sum + s.roundProvisionsStart.length; // Each round has an entry
}, 0);
// Actually, pass trigger rate = (exhausted pass + strategic pass) / total rounds
// But a round can have multiple passes. Let's measure differently:
// "provisions exhaustion pass trigger rate" = rounds where AI passed due to no provisions / total rounds
// "AI strategic pass rate" = rounds where AI strategically passed / total rounds
// Total pass trigger rate = rounds with any pass / total rounds
const totalPassEvents = totalExhaustedPass + totalStrategicPass;
const passTriggerRate = (totalPassEvents / totalRounds) * 100;
console.log(`   Exhausted pass events: ${totalExhaustedPass} (${(totalExhaustedPass / totalRounds * 100).toFixed(1)}% of rounds)`);
console.log(`   AI strategic pass events: ${totalStrategicPass} (${(totalStrategicPass / totalRounds * 100).toFixed(1)}% of rounds)`);
console.log(`   Total pass events per round: ${(totalPassEvents / totalRounds).toFixed(2)} (rate: ${passTriggerRate.toFixed(1)}%) ${passTriggerRate >= 20 && passTriggerRate <= 70 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n4. Cards Played per Round:');
const avgCardsPerRound = (totalCardsP0 + totalCardsP1) / totalRounds;
console.log(`   Average: ${avgCardsPerRound.toFixed(2)} cards/round ${avgCardsPerRound >= 4 && avgCardsPerRound <= 18 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Player avg: ${(totalCardsP0 / totalRounds).toFixed(2)}, AI avg: ${(totalCardsP1 / totalRounds).toFixed(2)}`);

console.log('\n5. Leader Win Rates (9 leaders):');
let maxLeaderRate = 0, minLeaderRate = 1;
for (const [name, data] of Object.entries(leaderWins)) {
  const rate = data.games > 0 ? data.wins / data.games : 0;
  maxLeaderRate = Math.max(maxLeaderRate, rate);
  minLeaderRate = Math.min(minLeaderRate, rate);
  console.log(`   ${name}: ${(rate * 100).toFixed(1)}% (${data.wins}/${data.games})`);
}
const leaderSpread = maxLeaderRate - minLeaderRate;
console.log(`   Spread: ${(leaderSpread * 100).toFixed(1)}% ${leaderSpread < 0.15 ? '✅ PASS' : '❌ FAIL'}`);

// ===== FINAL VERDICT =====
const passChecks = [
  maxWinRate <= 0.6,
  avgRounds >= 1.8 && avgRounds <= 3.0,
  passTriggerRate >= 20 && passTriggerRate <= 70,
  avgCardsPerRound >= 4 && avgCardsPerRound <= 18,
  leaderSpread < 0.15
];

console.log('\n=== CONCLUSION ===');
if (passChecks.every(c => c)) {
  console.log('PASS — All 5 balance indicators within thresholds');
  process.exit(0);
} else {
  console.log('FAIL — Indicators exceeding thresholds:');
  if (!passChecks[0]) console.log('  - Win rate distribution: one side > 60%');
  if (!passChecks[1]) console.log('  - Average rounds outside [1.8, 3.0]');
  if (!passChecks[2]) console.log('  - Pass trigger rate outside [20%, 70%]');
  if (!passChecks[3]) console.log('  - Cards per round outside [4, 18]');
  if (!passChecks[4]) console.log('  - Leader win rate spread >= 15%');
  process.exit(1);
}