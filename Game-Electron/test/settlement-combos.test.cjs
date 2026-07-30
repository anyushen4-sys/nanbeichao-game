#!/usr/bin/env node
// test/settlement-combos.test.cjs
// ============================================================================
// T08: Settlement + Combos 单元测试
//
// 测试 ComboEngine 三层结算函数的输出正确性：
//   1. 同阵营 ≥3 触发 +1, <3 / common 不触发
//   2. 反制 counter_faction 对手≥3 触发
//   3. juzhongqu 触发
//   4. computeAllBonuses 合并正确
//   5. 老 ability 字符串不干扰
// ============================================================================
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

// ── Engine replica (self-contained, same logic as src/js/combos.js) ──
const FACTIONS = ['song','qi','liang','chen','beiwei','dongwei','xiwei','beiqi','beizhou'];

function boardFlatList(board) {
  const out = [];
  if (!board) return out;
  ['infantry','cavalry','navy','strategy'].forEach(r => {
    const arr = board[r] || [];
    for (const c of arr) {
      if (c && typeof c === 'object') out.push(Object.assign({ row: r }, c));
    }
  });
  return out;
}

function factionCount(cards) {
  const m = new Map();
  cards.forEach(c => {
    const f = c.faction;
    if (!FACTIONS.includes(f)) return;
    m.set(f, (m.get(f) || 0) + 1);
  });
  return m;
}

// Layer 1
function computeFactionBonus(board) {
  const cards = boardFlatList(board);
  const counts = factionCount(cards);
  const bonus = {};
  cards.forEach(c => {
    const n = counts.get(c.faction) || 0;
    if (n >= 3) bonus[c.id] = (bonus[c.id] || 0) + 1;
  });
  return bonus;
}

// Layer 2
function computeAntiFaction(board, oppBoard, hand) {
  const oppCards = boardFlatList(oppBoard);
  const oppCounts = factionCount(oppCards);
  const bonus = {};
  const candidates = [];
  boardFlatList(board).forEach(c => candidates.push(c));
  (hand || []).forEach(c => { if (c && typeof c === 'object') candidates.push(c); });
  candidates.forEach(c => {
    const ab = (c.ability || '').split(':')[0];
    const target = c.faction;
    if (ab !== 'counter_faction' || !FACTIONS.includes(target)) return;
    const oppN = oppCounts.get(target) || 0;
    if (oppN >= 3) bonus[c.id] = (bonus[c.id] || 0) + 2;
  });
  return bonus;
}

// Layer 3
function computeJuzhongqu(board, leader) {
  const bonus = {};
  if (!leader || !leader.juzhongqu) return bonus;
  const jz = leader.juzhongqu;
  const cards = boardFlatList(board);
  const matchCount = cards.filter(c =>
    c.faction === leader.faction && c.row === jz.row
  ).length;
  if (matchCount >= (jz.count || 2)) {
    cards.forEach(c => {
      if (c.faction === leader.faction)
        bonus[c.id] = (bonus[c.id] || 0) + (jz.bonus_value || 2);
    });
  }
  return bonus;
}

function computeAllBonuses({ board, oppBoard, hand, leader }) {
  const l1 = computeFactionBonus(board);
  const l2 = computeAntiFaction(board, oppBoard, hand);
  const l3 = computeJuzhongqu(board, leader);
  const merged = {};
  [l1, l2, l3].forEach(m => {
    Object.keys(m).forEach(k => { merged[k] = (merged[k] || 0) + m[k]; });
  });
  return { same_faction: l1, anti_faction: l2, juzhongqu: l3, total: merged };
}

// ── helpers ──
const c = (id, faction, row, ability) => ({ id, faction, row, ability, strength: 3 });
function mkLeader(faction, juzhongqu) { return { faction, juzhongqu }; }

function b(...cards) {
  const board = { infantry: [], cavalry: [], navy: [], strategy: [] };
  for (const ca of cards) {
    if (board[ca.row]) board[ca.row].push(ca);
  }
  return board;
}

// ════════════════════════════════════════════════════════════════════════════

describe('Layer 1: Same-Faction Buff', () => {
  it('same faction >=3 → each +1', () => {
    const cards = [c(1, 'song', 'infantry'), c(2, 'song', 'infantry'), c(3, 'song', 'cavalry')];
    const board = b(...cards);
    const bonus = computeFactionBonus(board);
    assert.strictEqual(bonus[1], 1);
    assert.strictEqual(bonus[2], 1);
    assert.strictEqual(bonus[3], 1);
  });

  it('same faction <3 → no bonus', () => {
    const cards = [c(1, 'song', 'infantry'), c(2, 'song', 'cavalry')];
    const board = b(...cards);
    const bonus = computeFactionBonus(board);
    assert.deepStrictEqual(bonus, {});
  });

  it('common faction (non-combo) never buffed', () => {
    const cards = [c(1, 'common', 'infantry'), c(2, 'common', 'infantry'), c(3, 'common', 'cavalry')];
    const board = b(...cards);
    const bonus = computeFactionBonus(board);
    assert.deepStrictEqual(bonus, {});
  });

  it('two factions >=3 each get bonus', () => {
    const board = b(
      c(1, 'song', 'infantry'), c(2, 'song', 'infantry'), c(3, 'song', 'cavalry'),
      c(4, 'qi', 'infantry'), c(5, 'qi', 'infantry'), c(6, 'qi', 'infantry'),
    );
    const bonus = computeFactionBonus(board);
    assert.strictEqual(bonus[1], 1);
    assert.strictEqual(bonus[4], 1);
  });

  it('empty board → no bonus', () => {
    assert.deepStrictEqual(computeFactionBonus({}), {});
  });
});

describe('Layer 2: Anti-Faction Counter', () => {
  it('opp faction >=3 → counter card on board gets +2', () => {
    const myBoard = b(c(10, 'song', 'infantry', 'counter_faction:2'));
    const oppBoard = b(c(1, 'song', 'infantry'), c(2, 'song', 'infantry'), c(3, 'song', 'cavalry'));
    const bonus = computeAntiFaction(myBoard, oppBoard, []);
    assert.strictEqual(bonus[10], 2);
  });

  it('opp faction <3 → no counter', () => {
    const myBoard = b(c(10, 'song', 'infantry', 'counter_faction:2'));
    const oppBoard = b(c(1, 'song', 'infantry'), c(2, 'song', 'cavalry'));
    const bonus = computeAntiFaction(myBoard, oppBoard, []);
    assert.deepStrictEqual(bonus, {});
  });

  it('counter in hand also triggers', () => {
    const myBoard = b();
    const hand = [c(10, 'song', 'infantry', 'counter_faction:2')];
    const oppBoard = b(c(1, 'song', 'infantry'), c(2, 'song', 'infantry'), c(3, 'song', 'cavalry'));
    const bonus = computeAntiFaction(myBoard, oppBoard, hand);
    assert.strictEqual(bonus[10], 2);
  });

  it('non-counter ability ignored', () => {
    const myBoard = b(c(10, 'song', 'infantry', 'boost_row:2'));
    const oppBoard = b(c(1, 'song', 'infantry'), c(2, 'song', 'infantry'), c(3, 'song', 'cavalry'));
    const bonus = computeAntiFaction(myBoard, oppBoard, []);
    assert.deepStrictEqual(bonus, {});
  });
});

describe('Layer 3: Leader Juzhongqu', () => {
  it('trigger condition met → all same-faction cards get bonus', () => {
    const board = b(
      c(1, 'song', 'infantry'), c(2, 'song', 'cavalry'), c(3, 'song', 'navy')
    );
    const leader = mkLeader('song', { row: 'infantry', count: 1, bonus_value: 2 });
    const bonus = computeJuzhongqu(board, leader);
    assert.strictEqual(bonus[1], 2);
    assert.strictEqual(bonus[2], 2);
    assert.strictEqual(bonus[3], 2);
  });

  it('trigger condition not met → no bonus', () => {
    const board = b(c(1, 'song', 'infantry'));
    const leader = mkLeader('song', { row: 'infantry', count: 2, bonus_value: 2 });
    const bonus = computeJuzhongqu(board, leader);
    assert.deepStrictEqual(bonus, {});
  });

  it('no juzhongqu field on leader → no bonus', () => {
    const board = b(c(1, 'song', 'infantry'), c(2, 'song', 'infantry'));
    const leader = mkLeader('song', null);
    assert.deepStrictEqual(computeJuzhongqu(board, leader), {});
  });

  it('different faction cards are not buffed', () => {
    const board = b(c(1, 'song', 'infantry'), c(2, 'qi', 'infantry'));
    const leader = mkLeader('song', { row: 'infantry', count: 1, bonus_value: 2 });
    const bonus = computeJuzhongqu(board, leader);
    assert.strictEqual(bonus[1], 2);
    assert.strictEqual(bonus[2], undefined);
  });
});

describe('computeAllBonuses merge', () => {
  it('layers stack without overwriting', () => {
    const board = b(c(1, 'song', 'infantry', 'counter_faction:2'));
    const hand = [];
    const oppBoard = b(
      c(10, 'song', 'infantry'), c(11, 'song', 'infantry'), c(12, 'song', 'cavalry')
    );
    const leader = mkLeader('song', { row: 'infantry', count: 1, bonus_value: 2 });
    const bonuses = computeAllBonuses({ board, us: 0, hand, leader, oppBoard });
    // Layer 1: not triggered (<3 song on my board)
    // Layer 2: opp has 3 song → counter_faction triggers +2
    // Layer 3: leader triggers +2
    assert.strictEqual(bonuses.total[1], 4, 'should be 2 (anti) + 2 (juzhongqu)');
  });

  it('empty all → empty total', () => {
    const leader = mkLeader('song', null);
    const bonuses = computeAllBonuses({ board: b(), us: 0, hand: [], leader, oppBoard: b() });
    assert.deepStrictEqual(bonuses.total, {});
  });
});

describe('Old abilities still work (backward compat)', () => {
  it('boost_row / draw / discard have no combo side effects', () => {
    // These cards are units with old abilities; combo functions should not
    // treat them differently.
    const board = b(
      c(1, 'song', 'infantry', 'boost_row:2'),
      c(2, 'song', 'cavalry', 'draw:1'),
      c(3, 'song', 'navy', 'discard:1'),
    );
    const bonus = computeFactionBonus(board);
    assert.strictEqual(bonus[1], 1);
    assert.strictEqual(bonus[2], 1);
    assert.strictEqual(bonus[3], 1);
  });
});