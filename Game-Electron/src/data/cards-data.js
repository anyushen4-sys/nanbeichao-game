/**
 * cards-data.js — Card Power Expansion data layer
 * ADR 0006: JSON-based data with inline fallback
 *
 * Provides loadCards() and loadLeaders() async functions.
 * Falls back to inline data when JSON fetch fails (offline/local file).
 */

// ============================================================
// Inline fallback data — mirrors cards.json and leaders.json
// ============================================================

const INLINE_CARDS = {
  "version": "1.0.0",
  "cards": [
    {
      "id": "cn_zhaoyun",
      "name": "常山赵子龙",
      "title": "龙胆将军",
      "faction": "shu",
      "type": "hero",
      "cost": 4,
      "power": 5,
      "hp": 5,
      "abilities": ["charge", "piercing"],
      "traits": ["cavalry", "righteous"],
      "image": "zhaoyun",
      "rarity": "legendary"
    },
    {
      "id": "cn_guanyu",
      "name": "关羽",
      "title": "武圣",
      "faction": "shu",
      "type": "hero",
      "cost": 5,
      "power": 6,
      "hp": 6,
      "abilities": ["overwhelm", "intimidation"],
      "traits": ["cavalry", "righteous"],
      "image": "guanyu",
      "rarity": "legendary"
    },
    {
      "id": "cn_zhangfei",
      "name": "张飞",
      "title": "万夫莫敌",
      "faction": "shu",
      "type": "hero",
      "cost": 4,
      "power": 5,
      "hp": 5,
      "abilities": ["breakthrough", "fury"],
      "traits": ["cavalry", "fierce"],
      "image": "zhangfei",
      "rarity": "epic"
    },
    {
      "id": "cn_zhugeliang",
      "name": "诸葛亮",
      "title": "卧龙",
      "faction": "shu",
      "type": "hero",
      "cost": 5,
      "power": 3,
      "hp": 3,
      "abilities": ["tactician", "reinforce"],
      "traits": ["strategist", "righteous"],
      "image": "zhugeliang",
      "rarity": "legendary"
    },
    {
      "id": "cn_caocao",
      "name": "曹操",
      "title": "乱世奸雄",
      "faction": "wei",
      "type": "hero",
      "cost": 5,
      "power": 5,
      "hp": 5,
      "abilities": ["command", "sacrifice"],
      "traits": ["cunning", "imperial"],
      "image": "caocao",
      "rarity": "legendary"
    },
    {
      "id": "cn_xiahoudun",
      "name": "夏侯惇",
      "title": "盲夏侯",
      "faction": "wei",
      "type": "hero",
      "cost": 4,
      "power": 5,
      "hp": 4,
      "abilities": ["retaliation", "tenacity"],
      "traits": ["fierce", "loyal"],
      "image": "xiahoudun",
      "rarity": "epic"
    },
    {
      "id": "cn_simayi",
      "name": "司马懿",
      "title": "冢虎",
      "faction": "wei",
      "type": "hero",
      "cost": 5,
      "power": 3,
      "hp": 4,
      "abilities": ["tactician", "patience"],
      "traits": ["cunning", "strategic"],
      "image": "simayi",
      "rarity": "legendary"
    },
    {
      "id": "cn_sunquan",
      "name": "孙权",
      "title": "紫髯碧眼",
      "faction": "wu",
      "type": "hero",
      "cost": 4,
      "power": 4,
      "hp": 5,
      "abilities": ["diplomacy", "recruitment"],
      "traits": ["imperial", "diplomatic"],
      "image": "sunquan",
      "rarity": "epic"
    },
    {
      "id": "cn_zhouyu",
      "name": "周瑜",
      "title": "美周郎",
      "faction": "wu",
      "type": "hero",
      "cost": 5,
      "power": 4,
      "hp": 3,
      "abilities": ["fire_attack", "tactical_retreat"],
      "traits": ["strategic", "naval"],
      "image": "zhouyu",
      "rarity": "epic"
    },
    {
      "id": "cn_lvbu",
      "name": "吕布",
      "title": "飞将",
      "faction": "neutral",
      "type": "hero",
      "cost": 6,
      "power": 8,
      "hp": 6,
      "abilities": ["fury", "overwhelm", "breakout"],
      "traits": ["cavalry", "fierce"],
      "image": "lvbu",
      "rarity": "legendary"
    },
    {
      "id": "cn_diaochan",
      "name": "貂蝉",
      "title": "闭月",
      "faction": "neutral",
      "type": "hero",
      "cost": 3,
      "power": 2,
      "hp": 2,
      "abilities": ["seduction", "espionage"],
      "traits": ["diplomatic", "cunning"],
      "image": "diaochan",
      "rarity": "epic"
    },
    {
      "id": "cn_huangzhong",
      "name": "黄忠",
      "title": "老当益壮",
      "faction": "shu",
      "type": "hero",
      "cost": 4,
      "power": 5,
      "hp": 4,
      "abilities": ["precision", "veteran"],
      "traits": ["archer", "righteous"],
      "image": "huangzhong",
      "rarity": "epic"
    },
    {
      "id": "cn_ganning",
      "name": "甘宁",
      "title": "锦帆贼",
      "faction": "wu",
      "type": "hero",
      "cost": 3,
      "power": 4,
      "hp": 3,
      "abilities": ["raider", "naval_assault"],
      "traits": ["fierce", "naval"],
      "image": "ganning",
      "rarity": "rare"
    }
  ],
  "abilities": {
    "charge": { "name": "突袭", "description": "部署回合可攻击", "type": "active" },
    "piercing": { "name": "贯穿", "description": "攻击可贯穿目标1次，伤害溢出到下一个单位", "type": "passive" },
    "overwhelm": { "name": "压制", "description": "力量比对手高时，额外造成差值 1/2 的伤害", "type": "passive" },
    "intimidation": { "name": "威慑", "description": "相邻敌方单位 -1 战力", "type": "aura" },
    "breakout": { "name": "突破", "description": "每击杀一个单位，+1 战力", "type": "triggered" },
    "fury": { "name": "狂怒", "description": "受到伤害后 +1 战力", "type": "triggered" },
    "tactician": { "name": "计谋", "description": "从牌堆抽 1 张卡", "type": "active" },
    "reinforce": { "name": "支援", "description": "相邻友方单位 +1 战力", "type": "aura" },
    "command": { "name": "号令", "description": "场上有其他己方单位时，获得 +1 战力", "type": "passive" },
    "sacrifice": { "name": "牺牲", "description": "消灭一个友方单位以 +3 战力", "type": "active" },
    "retaliation": { "name": "复仇", "description": "受到伤害后，对攻击者造成 1 点伤害", "type": "triggered" },
    "tenacity": { "name": "坚韧", "description": "不会因损伤而离开战场", "type": "passive" },
    "patience": { "name": "蓄势", "description": "回合结束时若未攻击，+1 战力", "type": "end_turn" },
    "diplomacy": { "name": "外交", "description": "从对手手牌中随机选取 1 张", "type": "active" },
    "recruitment": { "name": "征募", "description": "从牌堆中召唤 cost ≤ 1 的单位", "type": "active" },
    "fire_attack": { "name": "火攻", "description": "对目标及相邻单位各造成 1 点伤害", "type": "active" },
    "tactical_retreat": { "name": "撤退", "description": "返回手牌并获得 +1 战力", "type": "active" },
    "precision": { "name": "精准", "description": "攻击时忽略目标的防御性特性", "type": "passive" },
    "veteran": { "name": "老将", "description": "每回合首次受到伤害减少 1 点", "type": "passive" },
    "raider": { "name": "劫掠", "description": "攻击敌方单位时，可同时对其邻位各造成 1 点伤害", "type": "active" },
    "naval_assault": { "name": "水战", "description": "在水地区时获得 +2 战力", "type": "passive" },
    "seduction": { "name": "诱惑", "description": "目标友方单位获得 +1 战力，目标敌方单位失去 -1 战力", "type": "active" },
    "espionage": { "name": "间谍", "description": "查看对方手牌中的 2 张卡", "type": "active" },
    "breakthrough": { "name": "突破", "description": "攻击可对同一行所有敌方单位造成 1 点伤害", "type": "active" }
  },
  "traits": {
    "cavalry": "骑兵",
    "fierce": "猛将",
    "righteous": "忠义",
    "strategic": "谋略",
    "imperial": "帝室",
    "cunning": "奸诈",
    "loyal": "忠诚",
    "diplomatic": "外交",
    "naval": "水军",
    "arlett": "弓兵"
  },
  "factions": {
    "shu": { "name": "蜀汉", "color": "#F44336" },
    "wei": { "name": "魏", "color": "#1976D2" },
    "wu": { "name": "吴", "color": "#4CAF50" },
    "neutral": { "name": "中立", "color": "#9E9E9E" }
  }
};

const INLINE_LEADERS = {
  "version": "1.0.0",
  "leaders": [
    {
      "id": "leader_liubei",
      "name": "刘备",
      "title": "仁德之主",
      "faction": "shu",
      "power_mod": 1,
      "hp_mod": 1,
      "leader_ability": "brotherhood",
      "trait_boost": ["righteous"],
      "image": "liubei",
      "rarity": "exclusive"
    },
    {
      "id": "leader_caocao",
      "name": "曹操",
      "title": "魏武挥鞭",
      "faction": "wei",
      "power_mod": 1,
      "hp_mod": 1,
      "leader_ability": "supreme_command",
      "trait_boost": ["imperial"],
      "image": "caocao_leader",
      "rarity": "exclusive"
    },
    {
      "id": "leader_sunquan",
      "name": "孙权",
      "title": "江东霸王",
      "faction": "wu",
      "power_mod": 1,
      "hp_mod": 1,
      "leader_ability": "naval_dominance",
      "trait_boost": ["naval"],
      "image": "sunquan_leader",
      "rarity": "exclusive"
    },
    {
      "id": "leader_dongzhuo",
      "name": "董卓",
      "title": "残暴太师",
      "faction": "neutral",
      "power_mod": 2,
      "hp_mod": -1,
      "leader_ability": "despoil",
      "trait_boost": ["fierce"],
      "image": "dongzhuo",
      "rarity": "rare"
    }
  ],
  "leader_abilities": {
    "brotherhood": {
      "name": "仁德之力",
      "description": "场上有 2 个及以上己方单位时，所有己方单位获得 +1 战力",
      "trigger": "passive"
    },
    "supreme_command": {
      "name": "号令天下",
      "description": "每回合开始时，选择一个己方单位获得 +2 战力直到回合结束",
      "trigger": "start_turn"
    },
    "naval_dominance": {
      "name": "水军霸主",
      "description": "己方水军单位 +1 战力",
      "trigger": "aura"
    },
    "despoil": {
      "name": "掠夺",
      "description": "消灭一个己方单位以抽 2 张卡",
      "trigger": "active"
    }
  }
};

// ============================================================
// Public API
// ============================================================

/**
 * Attempt to fetch JSON from URL; fall back to inline data.
 *
 * @param {string} url - JSON endpoint (relative or absolute)
 * @param {object} inline - inline fallback data
 * @returns {Promise<object>} parsed data
 */
async function _fetchOrFallback(url, inline) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.warn(`[cards-data] fetch failed for ${url} (${err.message}), using inline fallback`);
    // Return a deep copy so callers can mutate safely
    return JSON.parse(JSON.stringify(inline));
  }
}

/**
 * Load card data (heroes, abilities, traits, factions).
 * @returns {Promise<object>}
 */
export async function loadCards(basePath = 'src/data') {
  return _fetchOrFallback(`${basePath}/cards.json`, INLINE_CARDS);
}

/**
 * Load leader data (leader definitions, leader abilities).
 * @returns {Promise<object>}
 */
export async function loadLeaders(basePath = 'src/data') {
  return _fetchOrFallback(`${basePath}/leaders.json`, INLINE_LEADERS);
}

/**
 * Synchronous, no-network accessors — use only when fetch is impossible.
 */
export function getCardsInline() {
  return JSON.parse(JSON.stringify(INLINE_CARDS));
}

export function getLeadersInline() {
  return JSON.parse(JSON.stringify(INLINE_LEADERS));
}

/**
 * Convenience: load both cards and leaders in parallel.
 * @returns {Promise<{cards: object, leaders: object}>}
 */
export async function loadAll(basePath = 'src/data') {
  const [cards, leaders] = await Promise.all([
    loadCards(basePath),
    loadLeaders(basePath)
  ]);
  return { cards, leaders };
}