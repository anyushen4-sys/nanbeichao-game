#!/usr/bin/env node
// test/ai-shouldpass.test.cjs
// ============================================================================
// T09: aiShouldPass 真实场景测试 (regression for commit 0386f2d bug)
// ============================================================================
// Bug: aiShouldPass 条件 3 用 c.type 判断 combo card, 但 cards.json 中
// 卡牌没有 type 字段 → c.type 永远 undefined → hasComboCard 永远 false
// → AI 有手牌也永远 pass.
// Fix: 新逻辑用 handCount >= 3 + hasPlayableCard 阻止过早 pass.
// ============================================================================
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Load cards from actual cards.json to test with real card shape
const cardsPath = path.join(__dirname, '..', 'src', 'data', 'cards.json');
const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
const CARDS = cardsData.cards;

console.log('Loaded', CARDS.length, 'cards from cards.json');
console.log('Sample card:', JSON.stringify(CARDS[0]));

// Check: cards.json has NO type field (this is what broke the old logic)
const hasTypeField = CARDS.some(c => 'type' in c);
assert.strictEqual(hasTypeField, false,
  'cards.json should not have type field (regression check)');

// Replicate real getCardCost from src/index.html
function getCardCost(s) { return Math.ceil(s / 3); }

// Replicate fixed aiShouldPass condition 3 from src/index.html
function shouldContinuePlaying(hand, prov) {
  const handCount = hand.filter(c => c).length;
  const hasPlayableCard = hand.some(c => c && getCardCost(c.strength) <= prov);
  if (hasPlayableCard && handCount >= 3) return false;  // false = don't pass
  return true;  // true = can pass
}

describe('aiShouldPass condition 3 fix (regression for c.type bug)', () => {
  it('cards have no type field (regression for old logic)', () => {
    for (const c of CARDS) {
      assert.strictEqual(c.type, undefined,
        `Card ${c.name} should not have type field`);
    }
  });

  it('OLD bug: hasComboCard is ALWAYS false because c.type is undefined', () => {
    // Old logic: hand.some(c => c && ['minister', 'poet', ...].includes(c.type))
    const sampleHand = CARDS.slice(0, 9);
    const oldHasComboCard = sampleHand.some(c =>
      c && ['minister', 'poet', 'industry', 'monk', 'general'].includes(c.type));
    assert.strictEqual(oldHasComboCard, false,
      'Old hasComboCard would be false for ALL hands (this is the bug)');
  });

  it('NEW fix: AI with 9 cards and playable prov should NOT pass', () => {
    const hand9 = CARDS.slice(0, 9);  // 9 cards like the user reported
    const prov = 15;  // plenty of provisions
    const shouldPass = shouldContinuePlaying(hand9, prov);
    assert.strictEqual(shouldPass, false,
      'AI with 9 cards + playable should NOT pass (this was the bug)');
  });

  it('NEW fix: AI with 2 cards CAN pass (handCount < 3)', () => {
    const hand2 = CARDS.slice(0, 2);
    const prov = 15;
    const shouldPass = shouldContinuePlaying(hand2, prov);
    assert.strictEqual(shouldPass, true,
      'AI with 2 cards CAN pass (low cards → strategic pass)');
  });

  it('NEW fix: AI with 5 cards but no prov CAN pass (no playable)', () => {
    const hand5 = CARDS.slice(0, 5);
    const prov = 0;  // no provisions
    const shouldPass = shouldContinuePlaying(hand5, prov);
    assert.strictEqual(shouldPass, true,
      'AI with 5 cards but prov=0 CAN pass');
  });

  it('NEW fix: AI with 7 cards and prov=15 should NOT pass', () => {
    const hand7 = CARDS.slice(0, 7);
    const prov = 15;
    const shouldPass = shouldContinuePlaying(hand7, prov);
    assert.strictEqual(shouldPass, false,
      'AI with 7 cards + prov=15 should NOT pass');
  });
});

console.log('\n=== ai-shouldpass regression test ===');
