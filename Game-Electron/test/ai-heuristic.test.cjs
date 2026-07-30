/**
 * test/ai-heuristic.test.cjs — AI heuristic (score-card / card-selection) tests
 *
 * The AI layer is a best-effort heuristic, not a fixed module yet. These tests
 * encode the EXPECTED contract so the eventual src/js/ai.js / ai.esm.mjs can
 * be verified against it. The arithmetic helpers here define the canonical
 * scoring and the tests ensure the ESM implementation (when it exists) matches.
 *
 * node --test test/ai-heuristic.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Canonical scoring helpers (the heuristic contract)
// ---------------------------------------------------------------------------

// Power-per-cost value of a card. Higher = more efficient use of the mana pool.
function efficiency(card) {
  if (!card || !card.cost) return card ? card.power : 0;
  return card.cost === 0 ? (card.power || 0) : (card.power || 0) / card.cost;
}

// Faction-adjacency bonus: if a faction already has cards on the board,
// playing a same-faction card is worth the rally/same-faction bonus.
// 2 same-faction in row → +1 each; 3+ → +2 each.
function factionAdjacencyBonus(card, board) {
  if (!card) return 0;
  const inRow = (board || []).filter(b => b.row === card.row);
  const same = inRow.filter(b => b.faction === card.faction).length;
  // After playing this card, count becomes same+1
  const after = same + 1;
  const bonus = after >= 3 ? 2 : after >= 2 ? 1 : 0;
  // bonus applies to every same-faction card now in row (after)
  return bonus * after;
}

// Counter-card value: a unit whose ability set includes a counter_faction
// ability is worth extra when opponent has a dominant faction presence.
function isCounterCard(card) {
  return Array.isArray(card.abilities) && card.abilities.includes('counter_faction');
}

// Base AI card score = efficiency + adjacency bonus + counter bonus.
function scoreCard(card, board, opponentDominantFaction) {
  const eff = efficiency(card);
  const adj = factionAdjacencyBonus(card, board);
  const counter = isCounterCard(card) && opponentDominantFaction === card.faction ? 1.5 : 0;
  return eff + adj + counter;
}

// Select the best card from hand given board state.
function selectBest(hand, board, opponentDominantFaction) {
  if (!hand || hand.length === 0) return null;
  let best = hand[0];
  let bestScore = -Infinity;
  for (const c of hand) {
    const s = scoreCard(c, board, opponentDominantFaction);
    if (s > bestScore) { best = c; bestScore = s; }
  }
  return { card: best, score: bestScore };
}

// Mana feasibility: can this hand afford the best affordable card within budget?
function canAfford(card, budget) {
  if (!card) return false;
  return card.cost <= budget;
}

// ---------------------------------------------------------------------------
describe('ai heuristic — efficiency', () => {
  it('power/cost value', () => {
    const c = { power: 6, cost: 4 };
    assert.equal(efficiency(c), 1.5);
  });

  it('cheap card is high efficiency', () => {
    assert.equal(efficiency({ power: 4, cost: 2 }), 2);
    assert.equal(efficiency({ power: 3, cost: 3 }), 1);
    assert.ok(efficiency({ power: 4, cost: 2 }) > efficiency({ power: 3, cost: 3 }));
  });

  it('zero-cost card returns raw power', () => {
    assert.equal(efficiency({ power: 5, cost: 0 }), 5);
  });

  it('null/missing card', () => {
    assert.equal(efficiency(null), 0);
    assert.equal(efficiency({ power: 5 }), 5);
  });
});

describe('ai heuristic — faction adjacency bonus', () => {
  const boardEmpty = [];
  const boardTwoShu = [
    { faction: 'shu', row: 2 }, { faction: 'shu', row: 2 },
  ];
  const boardThreeShu = [
    { faction: 'shu', row: 3 }, { faction: 'shu', row: 3 }, { faction: 'shu', row: 3 },
  ];

  it('no adjacency on empty board', () => {
    assert.equal(factionAdjacencyBonus({ faction: 'shu', row: 1 }, boardEmpty), 0);
  });

  it('second same-faction same-row → after 3 → +2×3', () => {
    // After playing, same-faction in row = 3 → bonus 2 applied to all 3 = 6.
    const board = [
      { faction: 'shu', row: 2, power: 4 }, { faction: 'shu', row: 2, power: 5 },
    ];
    assert.equal(factionAdjacencyBonus({ faction: 'shu', row: 2 }, board), 6);
  });

  it('fourth same-faction same-row → +2×4', () => {
    assert.equal(factionAdjacencyBonus({ faction: 'shu', row: 3 }, boardThreeShu), 8);
  });

  it('different faction → no adjacency', () => {
    assert.equal(factionAdjacencyBonus({ faction: 'wei', row: 2 }, boardTwoShu), 0);
  });

  it('different row → no adjacency (even same faction)', () => {
    assert.equal(factionAdjacencyBonus({ faction: 'shu', row: 4 }, boardTwoShu), 0);
  });

  it('null board treated as empty', () => {
    assert.equal(factionAdjacencyBonus({ faction: 'shu', row: 1 }, null), 0);
  });
});

describe('ai heuristic — scoreCard', () => {
  it('efficiency dominates when board empty', () => {
    const high = scoreCard({ power: 8, cost: 4, abilities: [] }, []);
    const low  = scoreCard({ power: 3, cost: 2, abilities: [] }, []);
    assert.ok(high > low);
  });

  it('adjacency bonus lifts a matching same-faction card', () => {
    const board = [
      { faction: 'shu', row: 2, power: 4 },
      { faction: 'shu', row: 2, power: 5 },
    ];
    const match = scoreCard({ power: 4, cost: 3, faction: 'shu', row: 2, abilities: [] }, board);
    const diff  = scoreCard({ power: 4, cost: 3, faction: 'wei', row: 2, abilities: [] }, board);
    assert.ok(match > diff, 'same-faction card should score higher');
  });

  it('counter card bonus when opponent dominant faction matches', () => {
    const board = [{ faction: 'shu', row: 1 }];
    const counter = scoreCard(
      { power: 4, cost: 3, faction: 'shu', row: 1, abilities: ['counter_faction'] },
      board, 'shu',
    );
    const nonCounter = scoreCard(
      { power: 4, cost: 3, faction: 'shu', row: 1, abilities: ['reinforce'] },
      board, 'shu',
    );
    assert.ok(counter > nonCounter);
  });

  it('counter bonus does NOT apply for wrong dominant faction', () => {
    const board = [{ faction: 'shu', row: 1 }];
    const a = scoreCard(
      { power: 4, cost: 3, faction: 'wei', row: 1, abilities: ['counter_faction'] },
      board, 'shu',
    );
    const b = scoreCard(
      { power: 4, cost: 3, faction: 'wei', row: 1, abilities: ['counter_faction'] },
      board, 'wei',
    );
    assert.ok(b > a);
  });
});

describe('ai heuristic — selectBest', () => {
  it('returns best-scoring card from hand', () => {
    const hand = [
      { power: 5, cost: 3, abilities: [], faction: 'shu', row: 1 },
      { power: 7, cost: 3, abilities: [], faction: 'shu', row: 1 },
      { power: 3, cost: 4, abilities: [], faction: 'shu', row: 1 },
    ];
    const { card } = selectBest(hand, []);
    assert.equal(card.power, 7);
  });

  it('empty hand → null', () => {
    assert.equal(selectBest([], []), null);
    assert.equal(selectBest(null, []), null);
  });
});

describe('ai heuristic — mana affordability', () => {
  it('card affordable when cost <= budget', () => {
    assert.equal(canAfford({ cost: 4 }, 4), true);
    assert.equal(canAfford({ cost: 3 }, 5), true);
  });
  it('card unaffordable when cost > budget', () => {
    assert.equal(canAfford({ cost: 5 }, 4), false);
  });
  it('null card → not affordable', () => {
    assert.equal(canAfford(null, 5), false);
  });
});

describe('ai heuristic — ESM runner', () => {
  const runner = path.join(ROOT, 'test', '_esm', 'ai-heuristic.esm.mjs');
  if (!fs.existsSync(runner)) {
    it('ai-heuristic.esm.mjs exists', () => assert.ok(false, 'test/ai-heuristic.esm.mjs missing'));
    return;
  }
  it('ESM ai heuristic matches canonical scoring', () => {
    execSync(`node "${runner}"`, { encoding: 'utf8' });
  });
});
