// cards-data.js — ES module loader for card data
// Source-of-truth: src/data/cards.json + src/data/leaders.json
// Falls back to inline data (window.CARDS_DATA / window.LEADERS_DATA) if fetch fails
//
// PM-authored: coder hallucinated 三国 content in earlier run; PM rewrote with REAL 南北朝 data
// Refs: ADR-0005 (i18n data-driven), ADR-0006 (backcompat combo layer)

const DATA_VERSION = '2.0.0-mvp';

function byId(arr, id) {
  return arr.find(item => item.id === id);
}
function factionFilter(arr, faction) {
  return arr.filter(item => item.faction === faction);
}

// INLINE FALLBACK (read from window if available)
function readInlineCards() {
  if (typeof window !== 'undefined' && Array.isArray(window.CARDS_DATA)) {
    return window.CARDS_DATA;
  }
  return [];
}
function readInlineLeaders() {
  if (typeof window !== 'undefined' && Array.isArray(window.LEADERS_DATA)) {
    return window.LEADERS_DATA;
  }
  return [];
}

// ASYNC fetch with fallback
async function loadCards(basePath = 'src/data/') {
  try {
    const r = await fetch(basePath + 'cards.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    return data.cards || [];
  } catch (e) {
    console.warn('[cards-data] fetch failed, using inline fallback:', e.message);
    return readInlineCards();
  }
}
async function loadLeaders(basePath = 'src/data/') {
  try {
    const r = await fetch(basePath + 'leaders.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    return data.leaders || [];
  } catch (e) {
    console.warn('[cards-data] fetch failed, using inline fallback:', e.message);
    return readInlineLeaders();
  }
}
async function loadAll(basePath) {
  const [cards, leaders] = await Promise.all([
    loadCards(basePath),
    loadLeaders(basePath),
  ]);
  return { cards, leaders, version: DATA_VERSION };
}

// SYNC inline access
function getCardsInline() { return readInlineCards(); }
function getLeadersInline() { return readInlineLeaders(); }

// Lookups for engine consumption
function getCardById(cards, id) { return byId(cards, id); }
function getLeaderById(leaders, id) { return byId(leaders, id); }
function getCardsByFaction(cards, faction) { return factionFilter(cards, faction); }
function getCardsByRow(cards, row) { return cards.filter(c => c.row === row); }
function getFactionsList(cards) {
  return [...new Set(cards.map(c => c.faction))].sort();
}

export {
  DATA_VERSION,
  loadCards,
  loadLeaders,
  loadAll,
  getCardsInline,
  getLeadersInline,
  getCardById,
  getLeaderById,
  getCardsByFaction,
  getCardsByRow,
  getFactionsList,
};

// Browser global fallback (for non-module scripts)
if (typeof window !== 'undefined') {
  window.CardsData = {
    loadCards, loadLeaders, loadAll,
    getCardsInline, getLeadersInline,
    getCardById, getLeaderById,
    getCardsByFaction, getCardsByRow, getFactionsList,
    DATA_VERSION,
  };
}
