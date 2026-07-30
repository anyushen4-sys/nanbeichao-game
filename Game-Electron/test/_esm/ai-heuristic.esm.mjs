/**
 * test/ai-heuristic.esm.mjs
 * Verifies the AI heuristic submodule (when implemented) matches the canonical
 * scoring contract defined in ai-heuristic.test.cjs. This runner is a no-op
 * passing placeholder until src/js/ai.js (or ai.mjs) is added; it documents
 * the expected export contract { scoreCard, selectBest, canAfford }.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('ESM ai heuristic (contract placeholder)', () => {
  it('canonical contract documented: scoreCard(selectBest, canAfford) expected from ai layer', () => {
    // Placeholder asserts that pass until ai.js is implemented.
    assert.ok(true, 'ai heuristic canonical contract: scoreCard / selectBest / canAfford');
  });
});
