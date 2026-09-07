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
  

  // ── Layer 5: 同行强化 ──
    // 场上同行同 faction **named 武将牌** (ID 1-50) ≥3 → 该行该 faction 牌 +1 额外
    // 注意: 只计 named 武将牌, 普通牌 (id > 50, common faction) 不参与
    function computeRowStacking(board) {
      const cards = boardFlatList(board);
      const strength = {};
      const signals = [];
      // Group by (faction, row)
      const keyMap = new Map();
      cards.forEach(c => {
        if (!c || typeof c !== 'object') return;
        // V4-fix: 只计 named 武将牌 (排除 common 普通牌)
        if (!isNamedCard(c)) return;
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
    const scholarCards = cards.filter(c => c && (c.type === 'poet' || c.type === 'minister' || c.type === 'monk' || c.type === 'industry'));
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

  // 第 2 层: 反制 (Counter) V42 — 对方场上满足条件时, 我方反制牌触发 nerf 对方
  // 3 种反制类型 (注: 「阵型」概念在玩法中不存在, formation 类已废弃):
  //   1. counter_faction:XXX:Y   → 对方 XXX 阵营武将 -Y
  //   2. counter_row:XXX:Y        → 对方 XXX 行所有牌 -Y
  //   3. counter_combo:all:Y      → 对方全场所有牌 -Y
  // 返回 { myNerfs: { oppCardId: -Y } } — 我方反制对对方的减益
  function computeAntiFaction(board, opponentBoard, hand) {
    const oppCards = boardFlatList(opponentBoard);
    const oppCounts = factionCount(oppCards);
    const oppN = Array.from(oppCounts.values()).reduce((a, b) => a + b, 0);
    const myNerfs = {};
    const candidates = [];
    boardFlatList(board).forEach(c => candidates.push(c));
    (hand || []).forEach(c => { if (c && typeof c === 'object') candidates.push(c); });
    candidates.forEach(c => {
      const ab = c.ability || '';
      const parts = ab.split(':');
      const type = parts[0];
      // V45-fix: 防止 _counterNerfs 残留导致非反制牌被错误减点
      // (实际修复在 startRound: G._counterNerfs={})
      // 这里加防御性 guard: 只处理 type 以 'counter_' 开头的牌
      if (type && type.indexOf('counter_') !== 0) return;

      // 1. counter_faction:faction:value
      if (type === 'counter_faction') {
        let target = null, value = 2;
        if (parts[2] !== undefined) { target = parts[1]; value = parseInt(parts[2], 10) || 2; }
        else if (parts[1] !== undefined) {
          if (parseInt(parts[1], 10) > 9) value = parseInt(parts[1], 10);
          else value = parseInt(parts[1], 10) || 2;
        }
        if (oppN < 3) return;
        if (target) {
          oppCards.forEach(oc => { if (oc.faction === target) myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        } else {
          oppCards.forEach(oc => { myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        }
        return;
      }
      // 2. counter_row:row:value
      if (type === 'counter_row') {
        const row = parts[1];
        const value = parseInt(parts[2], 10) || 1;
        if (!row) return;
        oppCards.forEach(oc => { if (oc.row === row) myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        return;
      }
      // 3. counter_combo:all:value 或 counter_combo:row:value 或 counter_combo:specific:value
      // (注: 「阵型」机制不存在, V22 起已无 formation 类)
      if (type === 'counter_combo') {
        const target = parts[1];
        const value = parseInt(parts[2], 10) || 3;
        if (target === 'all') {
          oppCards.forEach(oc => { myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        } else if (target === 'specific') {
          // 苦肉计: 只对对方最高战力的 1 张 -value
          if (oppCards.length > 0) {
            const sorted = oppCards.slice().sort((a, b) => (b.strength || 0) - (a.strength || 0));
            const top = sorted[0];
            if (top) myNerfs[top.id] = (myNerfs[top.id] || 0) - value;
          }
        } else if (target) {
          // 对方某 row -value
          oppCards.forEach(oc => { if (oc.row === target) myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        }
        return;
      }
      // 兼容: counter_cavalry / counter_all (旧别名)
      if (type === 'counter_cavalry') {
        const value = parseInt(parts[1], 10) || 1;
        oppCards.forEach(oc => { if (oc.row === 'cavalry') myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        return;
      }
      if (type === 'counter_all') {
        const value = parseInt(parts[1], 10) || 3;
        oppCards.forEach(oc => { myNerfs[oc.id] = (myNerfs[oc.id] || 0) - value; });
        return;
      }
    });
    return { myNerfs };
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
  // V38-fix: combo key 永久去重 — combo 持续激活时绝不再弹, 只有 removed 后重新激活才弹
    let _notifiedCombos = new Set();
    function _notifiedKey(layer, key) { return layer + ':' + (key || ''); }

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
    // 保存当前状态作为 prev (供 diffActiveCombos)
    _prevActiveCombos = JSON.parse(JSON.stringify(_activeCombos));
    const cards = boardFlatList(board);
    const factionCounts = factionCount(cards);

    // 清空当前追踪
    _activeCombos.same_faction = {};
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

    // Layer 4: row_stacking
        // 只计 named 武将牌 (排除 common 普通牌)
        const keyMap = new Map();
        cards.forEach(c => {
          if (!c || typeof c !== 'object') return;
          if (!isNamedCard(c)) return;
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
    // V5: 文人圈扩展 — 包含所有"特殊身份"（文臣/诗人/僧侣/行业）
    // 武将 (general) 不算文人, 普通牌 (id > 50) 也不算
    const scholarCards = cards.filter(c => c && (c.type === 'poet' || c.type === 'minister' || c.type === 'monk' || c.type === 'industry'));
    if (scholarCards.length >= 3) {
      _activeCombos.scholar_circle = {
        count: scholarCards.length,
        bonus: 1,
        uids: scholarCards.map(c => c.uid !== undefined ? c.uid : c.id),
        signals: ['combo_scholar_circle'],
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
    const prev = _prevActiveCombos;
    const added = [];
    const removed = [];

    // V38-fix: 触发那一刻弹, 后续持续激活不再弹, 只有 removed 后重新激活才弹
        // same_faction
        const prevSF = prev.same_faction || {};
        Object.keys(newBonuses.same_faction || {}).forEach(k => {
          const nk = _notifiedKey('same_faction', k);
          if (!prevSF[k] && !_notifiedCombos.has(nk)) {
            const data = newBonuses.same_faction[k] || {};
            added.push({ layer: 'same_faction', key: k, count: data.count, bonus: data.bonus, uids: data.uids });
            _notifiedCombos.add(nk);
          }
        });
        Object.keys(prevSF).forEach(k => {
          if (!(newBonuses.same_faction || {})[k]) {
            removed.push({ layer: 'same_faction', key: k });
            _notifiedCombos.delete(_notifiedKey('same_faction', k));
          }
        });

        // row_stacking
        const prevRow = prev.row_stacking || {};
        const newRow = newBonuses.row_stacking || {};
        Object.keys(newRow).forEach(k => {
          const nk = _notifiedKey('row_stacking', k);
          if (!prevRow[k] && !_notifiedCombos.has(nk)) {
            const data = newBonuses.row_stacking[k] || {};
            added.push({ layer: 'row_stacking', key: k, faction: k.split('::')[0], row: k.split('::')[1], count: data.count, bonus: data.bonus, uids: data.uids });
            _notifiedCombos.add(nk);
          }
        });
        Object.keys(prevRow).forEach(k => {
          if (!newRow[k]) {
            removed.push({ layer: 'row_stacking', key: k });
            _notifiedCombos.delete(_notifiedKey('row_stacking', k));
          }
        });

        // scholar_circle: uids.length > 0 indicates active
        const prevSC = prev.scholar_circle;
        const newSC = newBonuses.scholar_circle && newBonuses.scholar_circle.uids && newBonuses.scholar_circle.uids.length > 0 ? newBonuses.scholar_circle : null;
        if (!prevSC && newSC && !_notifiedCombos.has(_notifiedKey('scholar_circle'))) {
          added.push({ layer: 'scholar_circle', count: newSC.count, bonus: newSC.bonus, uids: newSC.uids });
          _notifiedCombos.add(_notifiedKey('scholar_circle'));
        }
        if (prevSC && !newSC) {
          removed.push({ layer: 'scholar_circle' });
          _notifiedCombos.delete(_notifiedKey('scholar_circle'));
        }

        // juzhongqu (non-empty object = active)
        const prevJZ = prev.juzhongqu;
        const newJZ = newBonuses.juzhongqu && Object.keys(newBonuses.juzhongqu).length > 0 ? newBonuses.juzhongqu : null;
        if (!prevJZ && newJZ && !_notifiedCombos.has(_notifiedKey('juzhongqu'))) {
          added.push({ layer: 'juzhongqu', count: newJZ.count, bonus: newJZ.bonus, uids: newJZ.uids });
          _notifiedCombos.add(_notifiedKey('juzhongqu'));
        }
        if (prevJZ && !newJZ) {
          removed.push({ layer: 'juzhongqu' });
          _notifiedCombos.delete(_notifiedKey('juzhongqu'));
        }

        return { added, removed };
      }

  // 合并所有层 → 最终 per-card bonus
  // V42: layer2 (computeAntiFaction) 现在返回 { myNerfs: { oppCardId: -X } }
  //   拆分: myNerfs 通过全局 window.G._counterNerfs[playerIdx] 传给 getRowPower,
  //   由 getRowPower 在算对方 board power 时减去。
  function computeAllBonuses({ board, opponentBoard, hand, leader, cardIdToUid }) {
    const layer1 = computeFactionBonus(board);  // { strength, armor, signals }
    const layer2 = computeAntiFaction(board, opponentBoard, hand);
    const layer3 = computeJuzhongqu(board, leader);
    const layer4 = computeRowStacking(board);
    const layer5 = computeScholarCircle(board);

    // 合并 strength bonus (向后兼容: total 只含 strength)
    const merged = {};
    function merge(o) {
      Object.keys(o).forEach(k => merged[k] = (merged[k] || 0) + o[k]);
    }
    merge(layer1.strength);
    // V42: layer2.myNerfs 不在这里合并 — 它作用在对方 board 上, 通过 _counterNerfs 通道
    if (layer2 && layer2.myNerfs) {
      window.G = window.G || {};
      window.G._counterNerfs = window.G._counterNerfs || {};
      // 当前 computeAllBonuses 接受 board 是 meBoard, 所以 layer2.myNerfs 是我对对方的 nerf
      // 记录到 _counterNerfs[myIdx], getRowPower 计算对方 board 时查找并应用
      // myIdx 通过 cardIdToUid 反查 (取任意 candidate 的 owner), 简化用 leader.faction
      const myIdx = (leader && leader.faction && ['song','qi','liang','chen'].includes(leader.faction)) ? 0 : 1;
      window.G._counterNerfs[myIdx] = layer2.myNerfs;
    }
    merge(layer3);
    merge(layer4.strength);
    merge(layer5.strength);

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
    const allSignals = Array.from(signalSet);

    const result = {
      same_faction: layer1.strength,  // 向后兼容: { cardId → strength }
      anti_faction: layer2,
      juzhongqu: layer3,
      row_stacking: layer4.strength,
      scholar_circle: layer5.strength,
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
        getPrevActiveCombos: () => _prevActiveCombos,
        diffActiveCombos,
    // 清除已通知标记 (新一局/新回合调用)
    resetNotifiedCombos: () => {
      _notifiedCombos.clear();
      _activeCombos = { same_faction: {}, row_stacking: {}, scholar_circle: null, juzhongqu: null };
      _prevActiveCombos = JSON.parse(JSON.stringify(_activeCombos));
    },
  };
})();
