// combos.js — 三层叠加 Combo Bonus 引擎
// ref: spec §Solution §1-3, ADR-0006, .scratch/card-power-expansion/issues/04-combos-engine.md
//
// 三层叠加 (按优先级叠加):
//   1. 同阵营加成 (Same-Faction Buff): 我方场上 f ≥ 3 → 该 f 每张 +1 strength
//   2. 异阵营反制 (Cross-Faction Counter): 对手场上 f ≥ 3 → 我方手牌/board 的 counter_faction 牌 +X
//   3. 领袖羁绊 (Leader Juzhongqu): 我方场上同 f 同 row 牌 ≥ count → 该 f 所有牌 +bonus_value
//
// 老 13 种 ability 字符串 100% 保留, 不动.
window.ComboEngine = (function() {
  const FACTIONS_WITH_COMBO = ['song', 'qi', 'liang', 'chen', 'beiwei', 'dongwei', 'xiwei', 'beiqi', 'beizhou'];
  // common 阵营按设计不进 combo (user story #3)

  function boardFlatList(board) {
    const out = [];
    if (!board) return out;
    ['infantry', 'cavalry', 'navy', 'strategy'].forEach(row => {
      const arr = board[row] || [];
      for (const c of arr) {
        if (c && typeof c === 'object') out.push(Object.assign({ row }, c));
      }
    });
    return out;
  }

  function factionCount(cards) {
    const m = new Map();
    cards.forEach(c => {
      const f = c.faction;
      if (!FACTIONS_WITH_COMBO.includes(f)) return;
      m.set(f, (m.get(f) || 0) + 1);
    });
    return m;
  }

  // 第 1 层: 同阵营加成 — 我方场上 f ≥ 3 时, f 每张 +1 strength
  function computeFactionBonus(board) {
    const cards = boardFlatList(board);
    const counts = factionCount(cards);
    const bonus = {}; // cardId → bonus value
    cards.forEach(c => {
      const n = counts.get(c.faction) || 0;
      if (n >= 3) bonus[c.id] = (bonus[c.id] || 0) + 1;
    });
    return bonus;
  }

  // 第 2 层: 异阵营反制 — 对手场上 f ≥ 3 时, 我方 counter_faction 牌 +X (X 默认 2)
  function computeAntiFaction(board, opponentBoard, hand) {
    const oppCards = boardFlatList(opponentBoard);
    const oppCounts = factionCount(oppCards);
    const bonus = {};
    const candidates = [];
    boardFlatList(board).forEach(c => candidates.push(c));
    (hand || []).forEach(c => candidates.push(c));
    candidates.forEach(c => {
      const ab = c.ability || '';
      const type = ab.split(':')[0];
      const value = parseInt(ab.split(':')[1] || '0', 10);
      if (type !== 'counter_faction') return;
      // 该牌针对的阵营 = 卡牌自己的 faction
      const target = c.faction;
      if (!FACTIONS_WITH_COMBO.includes(target)) return;
      const oppN = oppCounts.get(target) || 0;
      if (oppN >= 3) bonus[c.id] = (bonus[c.id] || 0) + (value || 2);
    });
    return bonus;
  }

  // 第 3 层: 领袖聚众曲 — 同 f 同 row ≥ count → 该 f 所有牌 +bonus_value
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
        if (c.faction === leader.faction) {
          bonus[c.id] = (bonus[c.id] || 0) + (jz.bonus_value || 2);
        }
      });
    }
    return bonus;
  }

  // 合并所有层 → 最终 per-card bonus
  function computeAllBonuses({ board, opponentBoard, hand, leader, cardIdToUid }) {
    const layer1 = computeFactionBonus(board);
    const layer2 = computeAntiFaction(board, opponentBoard, hand);
    const layer3 = computeJuzhongqu(board, leader);
    const merged = new Map();
    function merge(o) {
      Object.keys(o).forEach(k => merged.set(k, (merged.get(k) || 0) + o[k]));
    }
    merge(layer1); merge(layer2); merge(layer3);
    const out = {};
    merged.forEach((v, k) => out[k] = v);
    return {
      same_faction: layer1,
      anti_faction: layer2,
      juzhongqu: layer3,
      total: out,
    };
  }

  return {
    computeFactionBonus,
    computeAntiFaction,
    computeJuzhongqu,
    computeAllBonuses,
    boardFlatList,
    factionCount,
    FACTIONS_WITH_COMBO,
  };
})();
