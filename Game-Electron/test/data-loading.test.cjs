/**
 * test/data-loading.test.cjs — data layer (cards-data) tests
 *
 * Pure synchronous invariants verified inline; the real ESM cards-data.js
 * (uses fetch + export) is exercised via an isolated ESM runner spawned here.
 *
 * node --test test/data-loading.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

// ---------------------------------------------------------------------------
describe('JSON shape — cards.json', () => {
  const data = readJson('src/data/cards.json');
  it('has top-level version, cards, abilities, traits, factions', () => {
    assert.ok(data.version);
    assert.ok(Array.isArray(data.cards));
    assert.ok(data.abilities && Object.keys(data.abilities).length);
    assert.ok(data.traits && Object.keys(data.traits).length);
    assert.ok(data.factions && Object.keys(data.factions).length);
  });

  it('all cards are heroes of the 4 factions', () => {
    const validFactions = new Set(Object.keys(data.factions));
    for (const c of data.cards) {
      assert.equal(c.type, 'hero', `${c.id} should be hero`);
      assert.ok(validFactions.has(c.faction), `${c.id} faction ${c.faction} invalid`);
      assert.ok(c.id && c.name && c.title);
      assert.ok(typeof c.cost === 'number' && c.cost > 0);
      assert.ok(typeof c.power === 'number' && c.power > 0);
      assert.ok(typeof c.hp === 'number' && c.hp > 0);
      assert.ok(Array.isArray(c.abilities) && c.abilities.length > 0);
      assert.ok(Array.isArray(c.traits) && c.traits.length > 0);
    }
  });

  it('card abilities are valid in the canonical data source (cards-data.js inline map)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/data/cards-data.js'), 'utf8');
    // Extract the canonical abilities object via Node's parser (robust to nested braces).
    const INLINE_CARDS_MARKER = 'const INLINE_CARDS = ';
    const LEADERS_MARKER = '\nconst INLINE_LEADERS';
    const i1 = src.indexOf(INLINE_CARDS_MARKER);
    const i2 = src.indexOf(LEADERS_MARKER);
    const wrapped = 'return ' + src.slice(i1 + INLINE_CARDS_MARKER.length, i2);
    const INLINE_CARDS = (new Function(wrapped))();
    const abilities = INLINE_CARDS.abilities;
    const data = readJson('src/data/cards.json');
    for (const c of data.cards) {
      for (const ab of c.abilities) {
        assert.ok(ab in abilities, `${c.id} references ability "${ab}" missing from canonical INLINE_CARDS abilities`);
      }
    }
  });

  it('cards.json abilities definition keys match INLINE_CARDS abilities keys (no drift)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/data/cards-data.js'), 'utf8');
    const i1 = src.indexOf('const INLINE_CARDS = ');
    const i2 = src.indexOf('\nconst INLINE_LEADERS');
    const INLINE_CARDS = (new Function('return ' + src.slice(i1 + 20, i2)))();
    const canonical = new Set(Object.keys(INLINE_CARDS.abilities));
    const jsonAbils = Object.keys(data.abilities);
    const onlyInJson = jsonAbils.filter(k => !canonical.has(k));
    const onlyInCanonical = [...canonical].filter(k => !jsonAbils.includes(k));
    assert.deepEqual(onlyInJson, [],
      `cards.json defines ability keys absent from canonical INLINE_CARDS: ${onlyInJson.join(', ')}`);
    assert.deepEqual(onlyInCanonical, [],
      `INLINE_CARDS defines ability keys absent from cards.json: ${onlyInCanonical.join(', ')}`);
  });

  it('card ids are unique', () => {
    const ids = data.cards.map(c => c.id);
    assert.equal(ids.length, new Set(ids).size, 'duplicate card ids');
  });

  it('factions object has exactly 4 entries', () => {
    assert.equal(Object.keys(data.factions).length, 4);
    for (const [k, v] of Object.entries(data.factions)) {
      assert.ok(v.name && v.color, `faction ${k} missing name/color`);
    }
  });
});

describe('JSON shape — leaders.json', () => {
  const data = readJson('src/data/leaders.json');
  it('has version, leaders, leader_abilities', () => {
    assert.ok(data.version);
    assert.ok(Array.isArray(data.leaders));
    assert.ok(data.leader_abilities);
  });

  it('leaders have required fields and valid factions', () => {
    const validFactions = new Set(['shu', 'wei', 'wu', 'neutral']);
    for (const l of data.leaders) {
      assert.ok(l.id && l.name && l.title);
      assert.ok(l.faction);
      assert.equal(typeof l.power_mod, 'number');
      assert.equal(typeof l.hp_mod, 'number');
      assert.ok(l.leader_ability);
      assert.ok(Array.isArray(l.trait_boost));
      assert.ok(validFactions.has(l.faction), `${l.id} faction ${l.faction} invalid`);
    }
  });

  it('every leader_ability is defined', () => {
    const ids = new Set(Object.keys(data.leader_abilities));
    for (const l of data.leaders) {
      assert.ok(ids.has(l.leader_ability), `${l.id} undefined ability ${l.leader_ability}`);
      const ab = data.leader_abilities[l.leader_ability];
      assert.ok(ab.name && ab.description && ab.trigger);
    }
  });

  it('leader ids are unique', () => {
    const ids = data.leaders.map(l => l.id);
    assert.equal(ids.length, new Set(ids).size, 'duplicate leader ids');
  });
});

describe('synchronous accessor contract (cards-data)', () => {
  // cards-data exports getCardsInline / getLeadersInline that return deep copies.
  // We verify the contract via the inline data we already read: getCardsInline()
  // is equivalent to the INLINE_CARDS object; here we confirm the source exports
  // the names by a syntax check.
  const src = fs.readFileSync(path.join(ROOT, 'src/data/cards-data.js'), 'utf8');
  it('cards-data exports loadCards, loadLeaders, loadAll', () => {
    assert.ok(/export\s+async\s+function\s+loadCards/.test(src));
    assert.ok(/export\s+async\s+function\s+loadLeaders/.test(src));
    assert.ok(/export\s+async\s+function\s+loadAll/.test(src));
  });
  it('cards-data exports getCardsInline, getLeadersInline', () => {
    assert.ok(/export\s+function\s+getCardsInline/.test(src));
    assert.ok(/export\s+function\s+getLeadersInline/.test(src));
  });
  it('cards-data defines fetch→inline fallback (_fetchOrFallback)', () => {
    assert.ok(src.includes('_fetchOrFallback'));
    assert.ok(src.includes('INLINE_CARDS'));
    assert.ok(src.includes('INLINE_LEADERS'));
  });
});

describe('data layer — ESM module runner', () => {
  const runner = path.join(ROOT, 'test', '_esm', 'data-loading.esm.mjs');
  if (!fs.existsSync(runner)) {
    it('data-loading.esm.mjs exists', () => assert.ok(false, 'test/data-loading.esm.mjs missing'));
    return;
  }
  it('ESM loadAll / inline accessors load real data', () => {
    execSync(`node "${runner}"`, { encoding: 'utf8' });
  });
});
