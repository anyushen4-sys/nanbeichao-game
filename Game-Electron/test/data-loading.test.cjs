#!/usr/bin/env node
// test/data-loading.test.cjs
// ============================================================================
// T08: Data loading 测试
//
// 验证:
//   1. cards.json 格式正确、无重复 id
//   2. leaders.json 格式正确、9 leaders
//   3. faction 枚举一致性
//   4. ability 字符串无拼写错误
//   5. cards-data.js inline fallback 存在
// ============================================================================
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const PROJECT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');

const cards = JSON.parse(fs.readFileSync(path.join(PROJECT, 'src', 'data', 'cards.json'), 'utf8'));
const leaders = JSON.parse(fs.readFileSync(path.join(PROJECT, 'src', 'data', 'leaders.json'), 'utf8'));

describe('cards.json format', () => {
  it('has cards array', () => {
    assert.ok(Array.isArray(cards.cards));
    assert.ok(cards.cards.length >= 50);
  });

  it('every card has id/faction/row/strength', () => {
    for (const c of cards.cards) {
      assert.ok(typeof c.id === 'number', `card ${c.id} missing numeric id`);
      assert.ok(typeof c.faction === 'string', `card ${c.id} missing faction`);
      assert.ok(typeof c.row === 'string', `card ${c.id} missing row`);
      assert.ok(typeof c.strength === 'number', `card ${c.id} missing strength`);
    }
  });

  it('no duplicate ids', () => {
    const ids = new Set();
    for (const c of cards.cards) {
      assert.ok(!ids.has(c.id), `duplicate card id: ${c.id}`);
      ids.add(c.id);
    }
  });

  it('rows are valid (infantry/cavalry/navy/strategy)', () => {
    const VALID_ROWS = ['infantry', 'cavalry', 'navy', 'strategy'];
    for (const c of cards.cards) {
      assert.ok(VALID_ROWS.includes(c.row), `card ${c.id} invalid row: ${c.row}`);
    }
  });

  it('factions include known values', () => {
    const factions = new Set(cards.cards.map(c => c.faction));
    const expected = ['common', 'song', 'qi', 'liang', 'chen', 'beiwei', 'dongwei', 'xiwei', 'beiqi', 'beizhou'];
    for (const e of expected) {
      assert.ok(factions.has(e), `missing faction: ${e}`);
    }
  });
});

describe('leaders.json format', () => {
  it('has leaders array with 9 entries', () => {
    assert.ok(Array.isArray(leaders.leaders));
    assert.strictEqual(leaders.leaders.length, 9);
  });

  it('each leader has required fields', () => {
    for (const l of leaders.leaders) {
      assert.ok(typeof l.id === 'number', `leader ${l.id} missing id`);
      assert.ok(typeof l.name === 'string', `leader ${l.id} missing name`);
      assert.ok(typeof l.faction === 'string', `leader ${l.id} missing faction`);
      assert.ok(typeof l.ability === 'string', `leader ${l.id} missing ability`);
    }
  });

  it('each leader faction matches cards.json', () => {
    const cardFactions = new Set(cards.cards.map(c => c.faction));
    for (const l of leaders.leaders) {
      assert.ok(cardFactions.has(l.faction) || l.faction === 'common',
        `leader ${l.id} faction '${l.faction}' not in cards.json`);
    }
  });
});

// T08 found bug: cards.json 'conductance' vs INLINE_CARDS 'seduction'
describe('ability key consistency', () => {
  it('cards.json has no ability key drift vs known canonical set', () => {
    const CANONICAL_ABILITIES = [
          'ambush', 'ambush_card', 'anti_south', 'armor', 'assimilate',
          'berserk', 'boost_row', 'combo_boost', 'command', 'control',
          'coordinate', 'crit', 'destroy', 'discard', 'draw', 'draw_extra',
          'farm', 'flex', 'fortify', 'gain_provisions', 'navy_boost',
          'protect', 'resurrect', 'shield', 'siege', 'skirmish', 'spy',
          'unify', 'weaken_row',
        ];
    for (const c of cards.cards) {
      if (!c.ability) continue;
      const base = c.ability.split(':')[0];
      assert.ok(CANONICAL_ABILITIES.includes(base),
        `card ${c.id} has unknown ability: '${base}'`);
    }
  });
});

describe('cards-data.js exists and is loadable', () => {
  it('file exists', () => {
    const p = path.join(PROJECT, 'src', 'data', 'cards-data.js');
    assert.ok(fs.existsSync(p), 'cards-data.js not found');
  });

  it('contains import/export statements', () => {
    const p = path.join(PROJECT, 'src', 'data', 'cards-data.js');
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('export'), 'missing export');
  });
});

describe('i18n JSON files exist', () => {
  it('zh-CN.json exists', () => {
    assert.ok(fs.existsSync(path.join(PROJECT, 'src', 'i18n', 'zh-CN.json')));
  });
  it('en-US.json exists', () => {
    assert.ok(fs.existsSync(path.join(PROJECT, 'src', 'i18n', 'en-US.json')));
  });
});