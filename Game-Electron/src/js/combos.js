// combos.js — 六层叠加 Combo Bonus 引擎 V4
// V4 refactor: unified threshold=3, skip general type, dynamic sync, toast notifications
//
// 六层叠加 (按优先级叠加):
//   1. 同阵营加成 (Same-Faction Buff): 只计 ID 1-50 武将牌, per-faction threshold=3/bonus/extra
//   2. 异阵营反制 (Cross-Faction Counter): 对手场上 f ≥ 3 → 我方手牌/board 的 counter_faction 牌 +X
//   3. 领袖羁绊 (Leader Juzhongqu): 我方场上同 f 同 row 牌 ≥ count → 该 f 所有牌 +bonus_value
//   4. 卡牌类型联动 (Card Type Synergy): 场上同 type 牌 ≥3 → 所有该 type 牌 +1 强度 (跳过 type=general/未设置)
//   5. 同行强化 (Row Stacking): 场上同行 (infantry/cavalry/navy/strategy) 同 faction 牌 ≥3 → 该行该 faction 牌 +1 额外
//   6. 文人圈联动 (Scholar Circle): 场上诗人牌 + 文臣牌 总数 ≥3 → 所有诗人+文臣牌 +1
//
// 老 ability 字符串 100% 保留, 不动.
window.ComboEngine = (function() {
  const FACTIONS_WITH_COMBO = ['song', 'qi', 'liang', 'chen', 'beiwei', 'dongwei', 'xiwei', 'beiqi', 'beizhou'];
  // common 阵营按设计不进 combo (user story #3)

  // ADR-0007: 只计 ID 1-50 的武将牌
  const NAMED_CARD_IDS = [];
  for (let i = 1; i <= 50; i++) NAMED_CARD_IDS.push(i);

  function isNamedCard(c) {
    return c && typeof c.id === 'number' && NAMED_CARD_IDS.includes(c.id);
  }

  // ── Layer 4: 卡牌类型联动 ──
  // type 字段: general(默认), minister, poet, industry, monk
  function countByType(cards) {
    const m = new Map();
    cards.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const t = c.type || 'general';
      if (!m.has(t)) m.set(t, []);
      m.get(t).push(c);
    });
    return m;
  }

  // Layer 4: 同 type 牌 ≥3 → 所有该 type 牌 +1 强度 (V4: skip 'general' + threshold 3)
  function computeTypeSynergy(board) {
    const cards = boardFlatList(board);
    const byType = new Map();
    cards.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const t = c.type;
      // V4: skip cards without explicit type or type='general'
      if (!t || t === 'general') return;
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t).push(c);
    });
    const strength = {};
    const signals = [];
    byType.forEach((arr, t) => {
      if (arr.length >= 3) {
        arr.forEach(c => {
          strength[c.id] = (strength[c.id] || 0) + 1;
        });
        signals.push('combo_type_synergy:' + t);
      }
    });
    return { strength, signals };
  }

  // ── Layer 5: 同行强化 ──
  // 场上同行同 faction 牌 ≥3 → 该行该 faction 牌 +1 额外
  function computeRowStacking(board) {
    const cards = boardFlatList(board);
    const strength = {};
    const signals = [];
    // Group by (faction, row)
    const keyMap = new Map();
    cards.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const f = c.faction;
      const r = c.row;
      if (!f || !r) return;
      const key = f + '::' + r;
      if (!keyMap.has(key)) keyMap.set(key, []);
      keyMap.get(key).push(c);
    });
    keyMap.forEach((arr, key) => {
      if (arr.length >= 3) {
        const [faction, row] = key.split('::');
        arr.forEach(c => {
          strength[c.id] = (strength[c.id] || 0) + 1;
        });
        signals.push('combo_row_stacking:' + row);
      }
    });
    return { strength, signals };
  }

  // ── Layer 6: 文人圈联动 ──
  // 场上诗人牌 + 文臣牌 总数 ≥3 → 所有诗人+文臣牌 +1
  function computeScholarCircle(board) {
    const cards = boardFlatList(board);
    const strength = {};
    const scholarCards = cards.filter(c => c && c.type === 'poet' || c && c.type === 'minister');
    if (scholarCards.length < 3) return { strength: {}, signals: [] };
    scholarCards.forEach(c => {
      strength[c.id] = (strength[c.id] || 0) + 1;
    });
    return { strength, signals: ['combo_scholar_circle'] };
  }

  // ADR-0008: Per-Faction Bonus Map — 每个阵营独立的 threshold / bonus / extra 效果
  // V4 refactor: unified threshold=3 for all factions (was 2 for South, 4 for North)
  const FACTION_BONUS_MAP = {
    song:    { threshold: 3, bonus: 1, extra: 'infantry_boost',    desc: '步兵精锐' },
    qi:      { threshold: 3, bonus: 1, extra: 'draw_card',        desc: '文臣运筹' },
    liang:   { threshold: 3, bonus: 1, extra: 'armor_boost',      desc: '佛佑护甲' },
    chen:    { threshold: 3, bonus: 1, extra: 'navy_boost',       desc: '水军制胜' },
    beiwei:  { threshold: 3, bonus: 2, extra: 'cavalry_boost',    desc: '铁骑冲锋' },
    dongwei: { threshold: 3, bonus: 2, extra: 'discard_opponent', desc: '权谋制衡' },
    xiwei:   { threshold: 3, bonus: 2, extra: 'weaken_opponent',  desc: '府兵整合' },
    beiqi:   { threshold: 3, bonus: 2, extra: 'self_weaken',      desc: '双刃暴君' },
    beizhou: { threshold: 3, bonus: 2, extra: 'armor_all',        desc: '武帝改革' },
  };

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

  // 只计 named 武将牌 (ID 1-50)
  function factionCount(cards) {
    const m = new Map();
    cards.forEach(c => {
      if (!isNamedCard(c)) return;
      const f = c.faction;
      if (!FACTIONS_WITH_COMBO.includes(f)) return;
      m.set(f, (m.get(f) || 0) + 1);
    });
    return m;
  }

  // ── Extra effect functions ──
  // 每个函数接收 (cards, faction) 返回 { strength: {}, armor: {}, signals: [] }
  const EXTRA_EFFECTS = {
    // +1 to all infantry row cards of this faction
    infantry_boost: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      cards.forEach(c => {
        if (c.faction === faction && c.row === 'infantry') {
          result.strength[c.id] = (result.strength[c.id] || 0) + 1;
        }
      });
      return result;
    },

    // draw 1 card next round (game-level signal, not a per-card bonus)
    draw_card: function() {
      return { strength: {}, armor: {}, signals: ['draw_card'] };
    },

    // +1 armor to all cards of this faction
    armor_boost: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      cards.forEach(c => {
        if (c.faction === faction) {
          result.armor[c.id] = (result.armor[c.id] || 0) + 1;
        }
      });
      return result;
    },

    // +1 to navy row cards of this faction
    navy_boost: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      cards.forEach(c => {
        if (c.faction === faction && c.row === 'navy') {
          result.strength[c.id] = (result.strength[c.id] || 0) + 1;
        }
      });
      return result;
    },

    // cavalry row gets +1 extra
    cavalry_boost: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      cards.forEach(c => {
        if (c.faction === faction && c.row === 'cavalry') {
          result.strength[c.id] = (result.strength[c.id] || 0) + 1;
        }
      });
      return result;
    },

    // opponent discards 1 random card from hand
    discard_opponent: function() {
      return { strength: {}, armor: {}, signals: ['discard_opponent'] };
    },

    // reduce opponent's strongest row by 1
    weaken_opponent: function() {
      return { strength: {}, armor: {}, signals: ['weaken_opponent'] };
    },

    // lose 1 strength from your weakest named card (双刃暴君)
    self_weaken: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      let weakest = null;
      cards.forEach(c => {
        if (c.faction === faction && isNamedCard(c)) {
          const s = typeof c.strength === 'number' ? c.strength : 0;
          if (!weakest || s < weakest.strength) {
            weakest = { id: c.id, strength: s };
          }
        }
      });
      if (weakest) {
        result.strength[weakest.id] = (result.strength[weakest.id] || 0) - 1;
      }
      return result;
    },

    // +1 armor to ALL your cards (same faction only)
    armor_all: function(cards, faction) {
      const result = { strength: {}, armor: {}, signals: [] };
      cards.forEach(c => {
        if (c.faction === faction) {
          result.armor[c.id] = (result.armor[c.id] || 0) + 1;
        }
      });
      return result;
    },
  };

  // 第 1 层 (V2): 同阵营加成 — 只计 named 武将牌, per-faction 差异化 threshold/bonus/extra
  function computeFactionBonus(board) {
    const cards = boardFlatList(board);
    const counts = factionCount(cards);
    const strength = {};
    const armor = {};
    const signals = [];

    FACTIONS_WITH_COMBO.forEach(faction => {
      const cfg = FACTION_BONUS_MAP[faction];
      if (!cfg) return;
      const n = counts.get(faction) || 0;
      if (n < cfg.threshold) return;

      // 基础 bonus: 该阵营所有 named 武将牌 +bonus
      const namedCards = cards.filter(c => c.faction === faction && isNamedCard(c));
      namedCards.forEach(c => {
        strength[c.id] = (strength[c.id] || 0) + cfg.bonus;
      });

      // Extra 效果
      const extraFn = EXTRA_EFFECTS[cfg.extra];
      if (extraFn) {
        const extraResult = extraFn(cards, faction);
        Object.keys(extraResult.strength).forEach(k => {
          strength[k] = (strength[k] || 0) + extraResult.strength[k];
        });
        Object.keys(extraResult.armor).forEach(k => {
          armor[k] = (armor[k] || 0) + extraResult.armor[k];
        });
        extraResult.signals.forEach(s => signals.push(s));
      }
    });

    return { strength, armor, signals };
  }

  // 第 2 层: 异阵营反制 — 对手场上 f ≥ 3 时, 我方 counter_faction 牌 +X (X 默认 2)
  // 保持不变 (counter_faction 是独立机制, 不受 ADR-0007 / ADR-0008 影响)
  function computeAntiFaction(board, opponentBoard, hand) {
    const oppCards = boardFlatList(opponentBoard);
    const oppCounts = factionCount(oppCards);
    const bonus = {};
    const candidates = [];
    boardFlatList(board).forEach(c => candidates.push(c));
    (hand || []).forEach(c => { if (c && typeof c === 'object') candidates.push(c); });
    candidates.forEach(c => {
      const ab = c.ability || '';
      const parts = ab.split(':');
      const type = parts[0];
      // 支持两种格式:
      // 1. 'counter_faction:value' — 针对对手所有 combo 阵营
      // 2. 'counter_faction:target_faction:value' — 针对特定阵营
      let target = parts[1];
      let value = parts[2] ? parseInt(parts[2], 10) : (parts[1] ? parseInt(parts[1], 10) : 2);
      if (value > 9) { // 如果第二个部分是数值而不是 faction
        target = null;
        value = parseInt(parts[1], 10);
      }
      if (type !== 'counter_faction') return;
      // 检查对手是否有 ≥3 named cards
      const oppN = Array.from(oppCounts.values()).reduce((a, b) => a + b, 0);
      if (oppN >= 3) bonus[c.id] = (bonus[c.id] || 0) + (value || 2);
    });
    return bonus;
  }

  // 第 3 层: 领袖聚众曲 — 同 f 同 row ≥ count → 该 f 所有牌 +bonus_value
  // ADR-0009: 聚众曲对所有同阵营牌生效, 不限于 named
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

  // ── V4: 动态 combo 状态追踪 ──
  // 跟踪当前激活的 combos, 用于检测 delta (新增/消失) 和 UI 展示
  window.G = window.G || {};
  let _activeCombos = {
    same_faction: {},     // { 'qi': { count, bonus, uids:[], signal, extra } }
    type_synergy: {},     // { 'minister': { count, bonus, uids:[], signal } }
    row_stacking: {},     // { 'song:infantry': { ... } }
    scholar_circle: null, // { count, bonus, uids:[], signal }
    juzhongqu: null,      // { count, bonus, uids:[], signal }
  };

  // 快照当前 combos 状态 (深拷贝, 不带引用)
  function _snapshotActive() {
    return JSON.parse(JSON.stringify(_activeCombos));
  }

  // 从 faction 获取中文标签
  function _factionLabel(faction) {
    const names = {
      song: '宋', qi: '齐', liang: '梁', chen: '陈',
      beiwei: '北魏', dongwei: '东魏', xiwei: '西魏',
      beiqi: '北齐', beizhou: '北周',
    };
    return names[faction] || faction;
  }

  // 重建 _activeCombos 从最新牌面状态和 signals
  function _rebuildActiveCombos(board, leader, signals) {
    const cards = boardFlatList(board);
    const factionCounts = factionCount(cards);

    // 清空当前追踪
    _activeCombos.same_faction = {};
    _activeCombos.type_synergy = {};
    _activeCombos.row_stacking = {};
    _activeCombos.scholar_circle = null;
    _activeCombos.juzhongqu = null;

    // Layer 1: same_faction — 从牌面 faction 计数推断
    FACTIONS_WITH_COMBO.forEach(faction => {
      const cfg = FACTION_BONUS_MAP[faction];
      if (!cfg) return;
      const n = factionCounts.get(faction) || 0;
      if (n >= cfg.threshold) {
        const factionCards = cards.filter(c => c.faction === faction && isNamedCard(c));
        _activeCombos.same_faction[faction] = {
          count: n,
          bonus: cfg.bonus,
          uids: factionCards.map(c => c.uid !== undefined ? c.uid : c.id),
          extra: cfg.extra,
          desc: cfg.desc,
        };
      }
    });

    // Layer 4: type_synergy — 跳过 type='general' 和未设置 type
    const byType = new Map();
    cards.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const t = c.type;
      if (!t || t === 'general') return;
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t).push(c);
    });
    byType.forEach((arr, t) => {
      if (arr.length >= 3) {
        _activeCombos.type_synergy[t] = {
          count: arr.length,
          bonus: 1,
          uids: arr.map(c => c.uid !== undefined ? c.uid : c.id),
        };
      }
    });

    // Layer 5: row_stacking
    const keyMap = new Map();
    cards.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const f = c.faction;
      const r = c.row;
      if (!f || !r) return;
      const key = f + '::' + r;
      if (!keyMap.has(key)) keyMap.set(key, []);
      keyMap.get(key).push(c);
    });
    keyMap.forEach((arr, key) => {
      if (arr.length >= 3) {
        _activeCombos.row_stacking[key] = {
          count: arr.length,
          bonus: 1,
          uids: arr.map(c => c.uid !== undefined ? c.uid : c.id),
          row: key.split('::')[1],
          faction: key.split('::')[0],
        };
      }
    });

    // Layer 6: scholar_circle
    const scholarCards = cards.filter(c => c && (c.type === 'poet' || c.type === 'minister'));
    if (scholarCards.length >= 3) {
      _activeCombos.scholar_circle = {
        count: scholarCards.length,
        bonus: 1,
        uids: scholarCards.map(c => c.uid !== undefined ? c.uid : c.id),
      };
    }

    // Layer 3: juzhongqu
    if (leader && leader.juzhongqu) {
      const jz = leader.juzhongqu;
      const matchCount = cards.filter(c =>
        c.faction === leader.faction && c.row === jz.row
      ).length;
      if (matchCount >= (jz.count || 2)) {
        _activeCombos.juzhongqu = {
          count: matchCount,
          bonus: jz.bonus_value || 2,
          uids: cards.filter(c => c.faction === leader.faction).map(c => c.uid !== undefined ? c.uid : c.id),
        };
      }
    }
  }

  // 对比新旧 active combos, 返回新增和消失的 combos
  function diffActiveCombos(newBonuses) {
    const prev = _snapshotActive();
    const added = [];
    const removed = [];

    // same_faction
    const prevSF = prev.same_faction || {};
    Object.keys(newBonuses.same_faction || {}).forEach(k => {
      if (!prevSF[k]) {
        added.push({ layer: 'same_faction', key: k, desc: prevSF[k] ? prevSF[k].desc : '' });
      }
    });
    Object.keys(prevSF).forEach(k => {
      if (!(newBonuses.same_faction || {})[k]) {
        removed.push({ layer: 'same_faction', key: k });
      }
    });

    // type_synergy
    const prevTS = prev.type_synergy || {};
    const newTS = newBonuses.type_synergy || {};
    Object.keys(newTS).forEach(t => {
      if (!prevTS[t]) added.push({ layer: 'type_synergy', key: t });
    });
    Object.keys(prevTS).forEach(t => {
      if (!newTS[t]) removed.push({ layer: 'type_synergy', key: t });
    });

    // row_stacking
    const prevRow = prev.row_stacking || {};
    const newRow = newBonuses.row_stacking || {};
    Object.keys(newRow).forEach(k => {
      if (!prevRow[k]) added.push({ layer: 'row_stacking', key: k });
    });
    Object.keys(prevRow).forEach(k => {
      if (!newRow[k]) removed.push({ layer: 'row_stacking', key: k });
    });

    // scholar_circle
    const prevSC = prev.scholar_circle;
    const newSC = newBonuses.scholar_circle;
    if (!prevSC && newSC) added.push({ layer: 'scholar_circle' });
    if (prevSC && !newSC) removed.push({ layer: 'scholar_circle' });

    // juzhongqu
    const prevJZ = prev.juzhongqu;
    const newJZ = newBonuses.juzhongqu;
    if (!prevJZ && newJZ) added.push({ layer: 'juzhongqu' });
    if (prevJZ && !newJZ) removed.push({ layer: 'juzhongqu' });

    return { added, removed };
  }

  // 合并所有层 → 最终 per-card bonus
  function computeAllBonuses({ board, opponentBoard, hand, leader, cardIdToUid }) {
    const layer1 = computeFactionBonus(board);  // { strength, armor, signals }
    const layer2 = computeAntiFaction(board, opponentBoard, hand);
    const layer3 = computeJuzhongqu(board, leader);
    const layer4 = computeTypeSynergy(board);
    const layer5 = computeRowStacking(board);
    const layer6 = computeScholarCircle(board);

    // 合并 strength bonus (向后兼容: total 只含 strength)
    const merged = {};
    function merge(o) {
      Object.keys(o).forEach(k => merged[k] = (merged[k] || 0) + o[k]);
    }
    merge(layer1.strength);
    merge(layer2);
    merge(layer3);
    merge(layer4.strength);
    merge(layer5.strength);
    merge(layer6.strength);

    // 合并 armor
    const mergedArmor = {};
    Object.keys(layer1.armor).forEach(k => {
      mergedArmor[k] = (mergedArmor[k] || 0) + layer1.armor[k];
    });

    // 收集 signals (去重)
    const signalSet = new Set();
    layer1.signals.forEach(s => signalSet.add(s));
    layer4.signals.forEach(s => signalSet.add(s));
    layer5.signals.forEach(s => signalSet.add(s));
    layer6.signals.forEach(s => signalSet.add(s));
    const allSignals = Array.from(signalSet);

    const result = {
      same_faction: layer1.strength,  // 向后兼容: { cardId → strength }
      anti_faction: layer2,
      juzhongqu: layer3,
      type_synergy: layer4.strength,
      row_stacking: layer5.strength,
      scholar_circle: layer6.strength,
      total: merged,
      armor: mergedArmor,              // V2: { cardId → armor }
      signals: allSignals,             // V2: game-level signals
    };

    // V4: 重建 active combos 追踪状态
    _rebuildActiveCombos(board, leader, allSignals);

    return result;
  }

  return {
    computeFactionBonus,
    computeAntiFaction,
    computeJuzhongqu,
    computeTypeSynergy,
    computeRowStacking,
    computeScholarCircle,
    computeAllBonuses,
    boardFlatList,
    factionCount,
    FACTIONS_WITH_COMBO,
    NAMED_CARD_IDS,
    FACTION_BONUS_MAP,
    isNamedCard,
    // V4: 暴露动态同步
    getActiveCombos: () => _activeCombos,
    diffActiveCombos,
  };
})();
