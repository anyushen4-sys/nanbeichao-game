#!/usr/bin/env node
// test/combos-v4.test.cjs
// V4 combo engine comprehensive tests
// Covers: same_faction / type_synergy / row_stacking / scholar_circle / juzhongqu / anti_faction
// Plus: dynamic sync (add/remove combo)

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

global.window = {};
require('../src/js/combos.js');
const cb = global.window.ComboEngine;

// ===== Helpers =====
// isNamedCard: id must be 1-50
function mkBoard(...cards) {
  const board = { infantry: [], cavalry: [], navy: [], strategy: [] };
  for (const c of cards) {
    if (board[c.row]) board[c.row].push(c);
  }
  return board;
}
const NAMED = (id, faction, row, ability) => ({ id, faction, row, ability, strength: 3 });
const MINISTER = (id, faction, row) => ({ id, faction, row, type: 'minister', strength: 3 });
const POET = (id, faction, row) => ({ id, faction, row, type: 'poet', strength: 3 });
const INDUSTRY = (id, faction, row) => ({ id, faction, row, type: 'industry', strength: 3 });
const MONK = (id, faction, row) => ({ id, faction, row, type: 'monk', strength: 3 });
const GENERAL = (id, faction, row) => ({ id, faction, row, type: 'general', strength: 3 });
const COMMON = (id, row) => ({ id, faction: 'common', row, strength: 3 });
const mkLeader = (faction, juzhongqu) => ({ faction, juzhongqu });

// ===== Test 1: same_faction (threshold 3 for all) =====
describe('V4: same_faction (unified threshold=3)', () => {
  it('Song: 2 named → no trigger', () => {
    const board = mkBoard(NAMED(1, 'song', 'infantry'), NAMED(2, 'song', 'cavalry'));
    const result = cb.computeFactionBonus(board);
    assert.deepStrictEqual(result.strength, {});
  });

  it('Song: 3 named in same row → +1 each (no extra effect on cavalry/navy)', () => {
    const board = mkBoard(
      NAMED(1, 'song', 'cavalry'), NAMED(2, 'song', 'cavalry'),
      NAMED(3, 'song', 'cavalry')
    );
    const result = cb.computeFactionBonus(board);
    assert.strictEqual(result.strength[1], 1);
    assert.strictEqual(result.strength[2], 1);
    assert.strictEqual(result.strength[3], 1);
  });

  it('Song: 3 named with infantry extra → infantry gets +2, others +1', () => {
    // Song has 'infantry_boost' extra
    const board = mkBoard(
      NAMED(1, 'song', 'infantry'),
      NAMED(2, 'song', 'cavalry'),
      NAMED(3, 'song', 'navy')
    );
    const result = cb.computeFactionBonus(board);
    assert.strictEqual(result.strength[1], 2, 'infantry card gets base +1 + infantry_boost +1 = 2');
    assert.strictEqual(result.strength[2], 1, 'cavalry card gets only base +1');
    assert.strictEqual(result.strength[3], 1, 'navy card gets only base +1');
  });

  it('Bei Wei: 4 named with cavalry_boost → cavalry gets +3, infantry +2', () => {
    // Bei Wei has 'cavalry_boost' extra
    const board = mkBoard(
      NAMED(1, 'beiwei', 'infantry'), NAMED(2, 'beiwei', 'infantry'),
      NAMED(3, 'beiwei', 'cavalry'), NAMED(4, 'beiwei', 'cavalry')
    );
    const result = cb.computeFactionBonus(board);
    assert.strictEqual(result.strength[1], 2, 'infantry: base +2');
    assert.strictEqual(result.strength[2], 2, 'infantry: base +2');
    assert.strictEqual(result.strength[3], 3, 'cavalry: base +2 + cavalry_boost +1 = 3');
    assert.strictEqual(result.strength[4], 3, 'cavalry: base +2 + cavalry_boost +1 = 3');
  });
});

// ===== Test 2: type_synergy (skip general, threshold 3) =====
describe('V4: type_synergy (skip general, threshold 3)', () => {
  it('3 general cards → no trigger (skipped because type=general)', () => {
    const board = mkBoard(
      GENERAL(1, 'song', 'infantry'),
      GENERAL(2, 'song', 'cavalry'),
      GENERAL(3, 'song', 'navy')
    );
    const result = cb.computeTypeSynergy(board);
    assert.deepStrictEqual(result.strength, {});
    assert.deepStrictEqual(result.signals, []);
  });

  it('2 minister + 1 general → no trigger (only 2 minister)', () => {
    const board = mkBoard(
      MINISTER(1, 'song', 'infantry'),
      MINISTER(2, 'song', 'cavalry'),
      GENERAL(3, 'song', 'navy')
    );
    const result = cb.computeTypeSynergy(board);
    assert.deepStrictEqual(result.strength, {});
  });

  it('3 minister → +1 each (signal fires)', () => {
    const board = mkBoard(
      MINISTER(1, 'song', 'infantry'),
      MINISTER(2, 'song', 'cavalry'),
      MINISTER(3, 'song', 'navy')
    );
    const result = cb.computeTypeSynergy(board);
    assert.strictEqual(result.strength[1], 1);
    assert.strictEqual(result.strength[2], 1);
    assert.strictEqual(result.strength[3], 1);
    assert.deepStrictEqual(result.signals, ['combo_type_synergy:minister']);
  });

  it('3 poet → +1 each', () => {
    const board = mkBoard(
      POET(1, 'qi', 'strategy'),
      POET(2, 'qi', 'strategy'),
      POET(3, 'qi', 'strategy')
    );
    const result = cb.computeTypeSynergy(board);
    assert.strictEqual(result.strength[1], 1);
    assert.strictEqual(result.strength[2], 1);
    assert.strictEqual(result.strength[3], 1);
    assert.deepStrictEqual(result.signals, ['combo_type_synergy:poet']);
  });
});

// ===== Test 3: row_stacking (threshold 3 same faction same row) =====
describe('V4: row_stacking (threshold 3 same faction same row)', () => {
  it('2 same faction same row → no trigger', () => {
    const board = mkBoard(NAMED(1, 'song', 'infantry'), NAMED(2, 'song', 'infantry'));
    const result = cb.computeRowStacking(board);
    assert.deepStrictEqual(result.strength, {});
  });

  it('3 same faction same row → +1 each', () => {
    const board = mkBoard(
      NAMED(1, 'song', 'infantry'),
      NAMED(2, 'song', 'infantry'),
      NAMED(3, 'song', 'infantry')
    );
    const result = cb.computeRowStacking(board);
    assert.strictEqual(result.strength[1], 1);
    assert.strictEqual(result.strength[2], 1);
    assert.strictEqual(result.strength[3], 1);
  });

  it('3 same faction different rows → no trigger', () => {
    const board = mkBoard(
      NAMED(1, 'song', 'infantry'),
      NAMED(2, 'song', 'cavalry'),
      NAMED(3, 'song', 'navy')
    );
    const result = cb.computeRowStacking(board);
    assert.deepStrictEqual(result.strength, {});
  });
});

// ===== Test 4: scholar_circle (3 poet+minister) =====
describe('V4: scholar_circle (threshold 3 poet+minister)', () => {
  it('2 minister → no trigger', () => {
    const board = mkBoard(
      MINISTER(1, 'liang', 'strategy'),
      MINISTER(2, 'liang', 'strategy')
    );
    const result = cb.computeScholarCircle(board);
    assert.deepStrictEqual(result.strength, {});
  });

  it('2 minister + 1 poet → +1 each', () => {
    const board = mkBoard(
      MINISTER(1, 'liang', 'strategy'),
      MINISTER(2, 'liang', 'strategy'),
      POET(3, 'liang', 'strategy')
    );
    const result = cb.computeScholarCircle(board);
    assert.strictEqual(result.strength[1], 1);
    assert.strictEqual(result.strength[2], 1);
    assert.strictEqual(result.strength[3], 1);
    assert.deepStrictEqual(result.signals, ['combo_scholar_circle']);
  });
});

// ===== Test 5: juzhongqu (9 leaders) =====
describe('V4: juzhongqu - 9 leader designs', () => {
  const designs = [
    [1, 'song', 'infantry', 4, 2],
    [2, 'qi', 'cavalry', 4, 2],
    [3, 'liang', 'strategy', 4, 2],
    [4, 'chen', 'navy', 4, 2],
    [5, 'beiwei', 'cavalry', 5, 3],
    [6, 'dongwei', 'infantry', 5, 2],
    [7, 'xiwei', 'infantry', 5, 3],
    [8, 'beiqi', 'cavalry', 5, 2],
    [9, 'beizhou', 'infantry', 5, 3]
  ];

  for (const [lid, faction, row, count, bonus] of designs) {
    it(`Leader ${lid} (${faction}): ${count} cards in ${row} → +${bonus} each`, () => {
      const cards = [];
      for (let i = 1; i <= count; i++) {
        cards.push(NAMED(lid * 10 + i, faction, row));
      }
      const board = mkBoard(...cards);
      const leader = mkLeader(faction, { row, count, bonus_value: bonus });
      const result = cb.computeJuzhongqu(board, leader);
      cards.forEach(c => {
        assert.strictEqual(result[c.id], bonus, `Card ${c.id} should get +${bonus}`);
      });
    });

    it(`Leader ${lid}: ${count - 1} cards → no trigger`, () => {
      const cards = [];
      for (let i = 1; i <= count - 1; i++) {
        cards.push(NAMED(lid * 10 + i, faction, row));
      }
      const board = mkBoard(...cards);
      const leader = mkLeader(faction, { row, count, bonus_value: bonus });
      const result = cb.computeJuzhongqu(board, leader);
      assert.deepStrictEqual(result, {});
    });

    it(`Leader ${lid}: cross-row ${count} cards → no trigger (row matters)`, () => {
      const cards = [];
      const rows = ['infantry', 'cavalry', 'navy', 'strategy', 'infantry'];
      for (let i = 0; i < count; i++) {
        cards.push(NAMED(lid * 10 + i, faction, rows[i % 4]));
      }
      const board = mkBoard(...cards);
      const leader = mkLeader(faction, { row, count, bonus_value: bonus });
      const result = cb.computeJuzhongqu(board, leader);
      assert.deepStrictEqual(result, {});
    });
  }
});

// ===== Test 6: anti_faction (counter_faction requires opponent ≥3 named) =====
describe('V4: anti_faction (counter_faction requires opponent ≥3 NAMED cards)', () => {
  it('Opponent <3 named → no bonus', () => {
    const board = mkBoard(NAMED(1, 'song', 'infantry'), NAMED(2, 'song', 'cavalry'));
    const oppBoard = mkBoard(NAMED(3, 'beiwei', 'infantry'), NAMED(4, 'beiwei', 'cavalry'));
    const hand = [NAMED(50, 'song', 'infantry', 'counter_faction:2')];
    const result = cb.computeAntiFaction(board, oppBoard, hand);
    assert.deepStrictEqual(result, {});
  });

  it('Opponent ≥3 named (id 1-50) + my counter_faction card → +2', () => {
    // IMPORTANT: opponent cards must have id 1-50 (named cards only)
    const board = mkBoard(NAMED(1, 'song', 'infantry'));
    const oppBoard = mkBoard(
      NAMED(40, 'beiwei', 'infantry'),
      NAMED(41, 'beiwei', 'cavalry'),
      NAMED(42, 'beiwei', 'navy')
    );
    const hand = [NAMED(50, 'song', 'infantry', 'counter_faction:2')];
    const result = cb.computeAntiFaction(board, oppBoard, hand);
    assert.strictEqual(result[50], 2, 'counter_faction card on hand should get +2');
  });

  it('Specific target: counter_faction:song:3 (opponent has 3+ song) → +3', () => {
    const board = mkBoard(NAMED(1, 'song', 'infantry'));
    const oppBoard = mkBoard(
      NAMED(40, 'song', 'infantry'),
      NAMED(41, 'song', 'cavalry'),
      NAMED(42, 'song', 'navy')
    );
    const hand = [NAMED(50, 'song', 'infantry', 'counter_faction:song:3')];
    const result = cb.computeAntiFaction(board, oppBoard, hand);
    assert.strictEqual(result[50], 3);
  });
});

// ===== Test 7: Dynamic sync via _activeCombos =====
describe('V4: dynamic sync via _activeCombos', () => {
  it('Adds combo: 3 qi cards on board', () => {
    const board = mkBoard(
      NAMED(7, 'qi', 'infantry'),
      NAMED(9, 'qi', 'infantry'),
      NAMED(10, 'qi', 'cavalry')
    );
    cb.computeAllBonuses({ board, hand: [], leader: null });
    const active = cb.getActiveCombos();
    assert.ok(active.same_faction['qi'], 'qi combo should be active');
    assert.strictEqual(active.same_faction['qi'].count, 3);
    assert.strictEqual(active.same_faction['qi'].bonus, 1);
  });

  it('Removes combo: card removed drops count below threshold', () => {
    const board1 = mkBoard(
      NAMED(7, 'qi', 'infantry'),
      NAMED(9, 'qi', 'infantry'),
      NAMED(10, 'qi', 'cavalry')
    );
    cb.computeAllBonuses({ board: board1, hand: [], leader: null });
    let active = cb.getActiveCombos();
    assert.ok(active.same_faction['qi']);

    // Remove 1 card
    const board2 = mkBoard(
      NAMED(7, 'qi', 'infantry'),
      NAMED(9, 'qi', 'infantry')
    );
    cb.computeAllBonuses({ board: board2, hand: [], leader: null });
    active = cb.getActiveCombos();
    assert.ok(!active.same_faction['qi'], 'qi combo should NOT be active after removal');
  });

  it('diffActiveCombos: detects newly added combos', () => {
    const board1 = mkBoard(NAMED(7, 'qi', 'infantry'), NAMED(9, 'qi', 'infantry'));
    cb.computeAllBonuses({ board: board1, hand: [], leader: null });

    // Add 3rd card
    const board2 = mkBoard(
      NAMED(7, 'qi', 'infantry'),
      NAMED(9, 'qi', 'infantry'),
      NAMED(10, 'qi', 'cavalry')
    );
    const all = cb.computeAllBonuses({ board: board2, hand: [], leader: null });
    const nested = {
      same_faction: all.same_faction,
      type_synergy: all.type_synergy,
      row_stacking: all.row_stacking,
      scholar_circle: all.scholar_circle,
      juzhongqu: all.juzhongqu
    };
    const diff = cb.diffActiveCombos(nested);
    const sfAdded = diff.added.find(c => c.layer === 'same_faction');
    assert.ok(sfAdded, 'Should detect newly added same_faction combo');
  });
});
