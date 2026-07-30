#!/usr/bin/env node
// test/balance.test.cjs
// ============================================================================
// 1000-局 AI vs AI balance 模拟器  (issue: 07-balance-script)
//
// 数据:  src/data/cards.json + src/data/leaders.json  (v2 数据)
// 引擎:  src/js/combos.js 三层 combo bonus (此处内联, 保证 Node 下自包含)
// leader.juzhongqu 来自 spec (issue 02 §2.3 矩阵);
//   当前 leaders.json 缺 juzhongqu 字段, 本脚本注入 spec 值。
// ============================================================================
// 用法:  node test/balance.test.cjs          -> stdout 输出 JSON 报告
//        node test/balance.test.cjs > report.json
// 可选:  N=100 node test/balance.test.cjs   (默认 1000)
'use strict';

const fs   = require('fs');
const path = require('path');

// ---------- 路径 -----------------------------------------------------------
const PROJECT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');
const CARDS_FILE    = path.join(PROJECT, 'src', 'data', 'cards.json');
const LEADERS_FILE  = path.join(PROJECT, 'src', 'data', 'leaders.json');
function loadJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// ---------- spec 矩阵 (issue 02 §2.3) -------------------------------------
// 9 leader 的聚众曲; beizhou(宇文邕)留空, 不触发也不报错
const SPEC_JZQ = {
  song:    { row: 'infantry',  count: 2, bonus_value: 2 },
  qi:      { row: 'infantry',  count: 2, bonus_value: 1 },
  liang:   { row: 'navy',      count: 2, bonus_value: 2 },
  chen:    { row: 'infantry',  count: 3, bonus_value: 2 },
  beiwei:  { row: 'cavalry',   count: 2, bonus_value: 2 },
  dongwei: { row: 'infantry',  count: 2, bonus_value: 1 },
  xiwei:   { row: 'infantry',  count: 2, bonus_value: 2 },
  beiqi:   { row: 'cavalry',   count: 2, bonus_value: 3 },
  beizhou: null,
};
const FACTION_LABEL = {
  song:'宋', qi:'齐', liang:'梁', chen:'陈',
  beiwei:'魏(北魏)', dongwei:'东魏', xiwei:'西魏',
  beiqi:'北齐', beizhou:'北周', common:'中立(common)',
};

// ---------- 工具 -----------------------------------------------------------
function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
let _uid = 0;
function newUidGen() { return () => ++_uid; }
function rowPower(cards) {
  return cards.reduce((s, c) => s + (c ? Math.max(1, (c._s || 0)) : 0), 0);
}
function boardPower(b) {
  return rowPower(b.infantry) + rowPower(b.cavalry) + rowPower(b.navy) + rowPower(b.strategy);
}
function isUnit(c) { return ['infantry','cavalry','navy'].includes(c.row); }

// 策略/特殊牌 cost 默认表 (cards.json 策略牌 cost 缺失 -> 合理默认值,
// 对齐 v1 engine 用粮草出牌的语义)
const S_COST = {
  atk_line:1,atk_line2:2,skip_turn:2,protect_line:1,buff_line:2,
  retreat:1,food_boost:1,tuntian:2,feishui:3,zhongli_jie:2,
  clear_weather:1,remove_weather:1,draw:1,gain_provisions:1,
  spy:1,draw_extra:1,control:2,skirmish:2,weaken_row:2,farm:1,
  fortify:1,armor:2,siege:2,boost_row:2,discard:1,ambush:1,
  ambush_card:1,assimilate:2,coordinate:2,berserk:1,crit:1,
  unify:2,anti_south:2,counter_faction:2,combo_boost:1,
  destroy:2,resurrect:2,protect:2,
};
function normCard(c) {
  const card = { ...c };
  if (!isUnit(card)) {
    let cost = card.cost;
    if (cost == null || Number.isNaN(cost)) {
      cost = S_COST[(card.ability||'').split(':')[0]] ?? (card._cost ?? 1);
    }
    card.cost = cost;
    card.strength = card.strength || 0;
  } else {
    // 单位牌: cards.json 无显式 cost -> 0 (免费出牌, 粮草由 AI 策略另行约束)
    card.cost = card.cost ?? 0;
  }
  card._s = 0;
  card._id = card.id + '_' + (Math.random() * 1e9 | 0);
  return card;
}

// ---------- 引擎 (内联 combos.js, 同一算法) ---------------------------------
const FACTIONS = ['song','qi','liang','chen','beiwei',
                  'dongwei','xiwei','beiqi','beizhou'];
function flatList(b) {
  const out = [];
  if (!b) return out;
  ['infantry','cavalry','navy','strategy'].forEach(r => {
    (b[r]||[]).forEach(c => { if (c && typeof c === 'object') out.push({ ...c, row: r }); });
  });
  return out;
}
function factionCount(cards) {
  const m = new Map();
  cards.forEach(c => {
    const f = c.faction;
    if (!f || !FACTIONS.includes(f)) return;
    m.set(f, (m.get(f)||0) + 1);
  });
  return m;
}
function computeFactionBonus(board) {
  const cards = flatList(board);
  const counts = factionCount(cards);
  const bonus = {};
  cards.forEach(c => { if ((counts.get(c.faction)||0) >= 3) bonus[c._id] = (bonus[c._id]||0) + 1; });
  return bonus;
}
function computeAntiFaction(board, oppBoard, hand) {
  const opp = factionCount(flatList(oppBoard));
  const bonus = {};
  const candidates = flatList(board);
  (hand||[]).forEach(c => { if (c && typeof c === 'object') candidates.push(c); });
  candidates.forEach(c => {
    const t = (c.ability||'').split(':')[0];
    if (t !== 'counter_faction') return;
    const target = c.faction;
    if (!target || !FACTIONS.includes(target)) return;
    if (opp.get(target) >= 3) bonus[c._id] = (bonus[c._id]||0) + 2;
  });
  return bonus;
}
function computeJuzhongqu(board, leader) {
  const bonus = {};
  const jz = (leader && leader.juzhongqu);
  if (!jz) return bonus;
  const cards = flatList(board);
  if (cards.filter(c => c.faction === leader.faction && c.row === jz.row).length >= (jz.count||2)) {
    cards.forEach(c => {
      if (c.faction === leader.faction) bonus[c._id] = (bonus[c._id]||0) + (jz.bonus_value||2);
    });
  }
  return bonus;
}
function applyBonus(board, map) {
  flatList(board).forEach(c => { c._s = c.strength + (map[c._id]||0); });
}
function merge(o1, o2, o3) { const m = {}; Object.assign(m, o1, o2, o3); return m; }

// ---------- AI (移植 v1 engine aiChooseCard + aiShouldPass) -----------------
const ABILITY_SCORE = {
  ambush:5,command:3,control:5,skirmish:4,shield:4,navy_boost:3,
  farm:3,fortify:3,flex:2,assimilate:5,armor:4,siege:4,coordinate:3,
  ambush_card:3,berserk:5,crit:6,unify:3,anti_south:4,boost_row:3,
  weaken_row:4,discard:3,draw:2,gain_provisions:1,combo_boost:3,
  destroy:5,resurrect:4,protect:3,spy:5,draw_extra:3,
};
function aiPick(hand, prov, b) {
  const playable = hand.map((c, i) => ({ card: c, idx: i }))
    .filter(x => x.card && x.card.cost <= prov);
  if (!playable.length) return null;
  const rp = { infantry:rowPower(b.infantry), cavalry:rowPower(b.cavalry), navy:rowPower(b.navy) };
  const minR = ['infantry','cavalry','navy'].reduce((aa, bb) => rp[aa]<rp[bb] ? aa : bb);
  let best = null, bestS = -1e9;
  let nUnit = 0;
  for (const { card, idx } of playable) {
    if (!isUnit(card)) continue;
    nUnit++;
    let score = card.strength;
    if (card.row === minR) score += 4;
    const t = (card.ability||'').split(':')[0];
    score += ABILITY_SCORE[t] || 0;
    score += Math.random() * 2;
    if (score > bestS) { bestS = score; best = { handIdx: idx, row: card.row }; }
  }
  if (nUnit === 0) return null;
  return best;
}
function aiPass(hand, prov, myP, oppP) {
  if (!hand.length) return true;
  if (!hand.some(c => c && c.cost <= prov)) return true;
  if (myP < oppP - 5 && prov <= 4) return true;
  return false;
}

// ---------- 单局模拟 -------------------------------------------------------
function simGame(p0Faction, p1Faction) {
  const uid = newUidGen();
  const p0 = { leader: null, board:{infantry:[],cavalry:[],navy:[],strategy:[]}, hand:[], prov:10 };
  const p1 = { leader: null, board:{infantry:[],cavalry:[],navy:[],strategy:[]}, hand:[], prov:10 };
  p0.leader = { faction: p0Faction };
  p1.leader = { faction: p1Faction };
  p0.leader.juzhongqu = SPEC_JZQ[p0Faction] || null;
  p1.leader.juzhongqu = SPEC_JZQ[p1Faction] || null;

  const all = CARDS.slice();
  const fc0 = all.filter(c => c.faction === p0Faction);
  const fc1 = all.filter(c => c.faction === p1Faction);
  const common = shuffle(all.filter(c => c.faction === 'common'));
  const d0 = shuffle([...fc0, ...common.slice(0, Math.floor(common.length/2))]);
  const d1 = shuffle([...fc1, ...common.slice(Math.floor(common.length/2))]);
  const gen = uid;
  const make = (arr, tag) => shuffle(arr).map(c => { const n = normCard(c); n._id = tag + '_' + gen(); return n; });
  const deck0 = make(d0, '0'); const deck1 = make(d1, '1');
  p0.hand = deck0.slice(0, 10); p0.deck = deck0.slice(10);
  p1.hand = deck1.slice(0, 10); p1.deck = deck1.slice(10);

  function draw(p) {
    while (p.hand.length < 10 && p.deck.length) p.hand.push(p.deck.pop());
  }
  const rounds = [];
  const acc = { 0:{jz:0,ally:0,endStr:0,rounds:0}, 1:{jz:0,ally:0,endStr:0,rounds:0} };
  const counterByGame = { 0:0, 1:0 };

  for (let r = 1; r <= 3; r++) {
    p0.board = {infantry:[],cavalry:[],navy:[],strategy:[]};
    p1.board = {infantry:[],cavalry:[],navy:[],strategy:[]};
    draw(p0); draw(p1);
    const log = [];
    for (let pl = 0; pl < 14; pl++) {
      // p0 turn
      const p0p = boardPower(p0.board), p1p = boardPower(p1.board);
      if (p0.hand.length === 0) break;
      if (aiPass(p0.hand, p0.prov, p0p, p1p)) { log.push('p0-pass'); break; }
      const ch0 = aiPick(p0.hand, p0.prov, p0.board);
      if (ch0) {
        const c = p0.hand.splice(ch0.handIdx,1)[0];
        p0.board[c.row || 'infantry'].push(c);
        p0.prov = Math.max(0, p0.prov - c.cost);
        log.push('p0:' + c.id);
      } else { p0.hand = []; break; }
      // p1 turn
      const p0pb = boardPower(p0.board), p1pb = boardPower(p1.board);
      if (p1.hand.length === 0) break;
      if (aiPass(p1.hand, p1.prov, p1pb, p0pb)) { log.push('p1-pass'); break; }
      const ch1 = aiPick(p1.hand, p1.prov, p1.board);
      if (ch1) {
        const c = p1.hand.splice(ch1.handIdx,1)[0];
        p1.board[c.row || 'infantry'].push(c);
        p1.prov = Math.max(0, p1.prov - c.cost);
        log.push('p1:' + c.id);
      } else { p1.hand = []; break; }
      p0.prov = Math.min(20, p0.prov + 1);
      p1.prov = Math.min(20, p1.prov + 1);
    }
    // 结算
    const fb0 = computeFactionBonus(p0.board);
    const jz0 = computeJuzhongqu(p0.board, p0.leader);
    const cf0 = computeAntiFaction(p0.board, p1.board, p0.hand);
    const fb1 = computeFactionBonus(p1.board);
    const jz1 = computeJuzhongqu(p1.board, p1.leader);
    const cf1 = computeAntiFaction(p1.board, p0.board, p1.hand);
    applyBonus(p0.board, merge(fb0, jz0, cf0));
    applyBonus(p1.board, merge(fb1, jz1, cf1));
    const s0 = boardPower(p0.board), s1 = boardPower(p1.board);
    const winner = s0 > s1 ? 0 : (s1 > s0 ? 1 : null);
    const jz0t = Object.keys(jz0).length > 0;
    const jz1t = Object.keys(jz1).length > 0;
    const fb0t = Object.keys(fb0).length > 0;
    const fb1t = Object.keys(fb1).length > 0;
    const cf0t = Object.keys(cf0).length > 0;
    const cf1t = Object.keys(cf1).length > 0;
    acc[0].rounds++; acc[1].rounds++;
    acc[0].endStr += s0; acc[1].endStr += s1;
    acc[0].jz += jz0t ? 1 : 0; acc[1].jz += jz1t ? 1 : 0;
    acc[0].ally += fb0t ? 1 : 0; acc[1].ally += fb1t ? 1 : 0;
    rounds.push({ round:r, winner, s0, s1, jz0:jz0t, jz1:jz1t, fb0:fb0t, fb1:fb1t, cf0:cf0t, cf1:cf1t, log });
  }
  return { rounds, acc };
}

// ---------- main -----------------------------------------------------------
let CARDS, LEADERS;
function main() {
  CARDS   = loadJSON(CARDS_FILE).cards   || [];
  LEADERS = loadJSON(LEADERS_FILE).leaders || [];
  const N = Math.max(1, parseInt(process.env.N || '1000', 10));
  const rows = [];
  let total = 0;
  for (const leader of LEADERS) {
    const f = leader.faction;
    const spec = SPEC_JZQ[f];
    const acc = { wins:0, losses:0, draws:0, games:0, endStr:0, rounds:0, jz:0, ally:0, counter:0 };
    for (let g = 0; g < N; g++) {
      const opp = LEADERS[Math.floor(Math.random()*LEADERS.length)].faction;
      const r = simGame(f, opp);
      acc.games++;
      acc.rounds += r.acc[0].rounds;
      acc.endStr += r.acc[0].endStr;
      acc.jz += r.acc[0].jz;
      acc.ally += r.acc[0].ally;
      r.rounds.forEach(rs => { if (rs.cf0) acc.counter++; });
      const last = r.rounds[r.rounds.length-1];
      if (last.winner === 0) acc.wins++;
      else if (last.winner === 1) acc.losses++;
      else acc.draws++;
      total++;
    }
    const jzRate  = acc.rounds ? acc.jz/acc.rounds*100 : 0;
    const allyRate= acc.rounds ? acc.ally/acc.rounds*100 : 0;
    const cfRate  = acc.games  ? acc.counter/acc.games*100 : 0;
    const avgEnd  = acc.rounds ? acc.endStr/acc.rounds : 0;
    rows.push({
      leader: leader.name, faction:f, label:FACTION_LABEL[f]||f,
      spec: spec ? `${spec.row}≥${spec.count} → +${spec.bonus_value}` : '未定义(留空)',
      specActive: !!spec,
      jzRate: +jzRate.toFixed(2),
      allyRate: +allyRate.toFixed(2),
      counterRate: +cfRate.toFixed(2),
      avgEndStr: +avgEnd.toFixed(2),
      rounds: acc.rounds, games: acc.games,
      fail: jzRate < 10 || jzRate > 60,
      winrate: +((acc.wins/acc.games*100)).toFixed(2),
    });
  }
  // 反向断言: common 牌不应触发 same-faction buff
  const tc = CARDS.filter(c=>c.faction==='common').slice(0,4).map((c,i)=>{
    const n = normCard(c); n._id = 'test_'+i; return n;
  });
  const testB = { infantry: tc, cavalry:[], navy:[], strategy:[] };
  const commonBuffed = Object.keys(computeFactionBonus(testB)).length === 0;
  const pass = rows.every(r => !r.fail);
  return {
    runAt: new Date().toISOString(), N, totalGames: total,
    version: loadJSON(CARDS_FILE).version || '2.0.0-mvp',
    rows,
    commonFactionNotBuffed: commonBuffed,
    pass,
  };
}

const report = main();
process.stdout.write(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
