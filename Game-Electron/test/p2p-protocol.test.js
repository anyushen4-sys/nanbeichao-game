/**
 * L0: p2p-protocol — packMessage / unpackMessage / seq 管理 / 大小校验
 *
 * node --test test/p2p-protocol.test.js
 *
 * 被测函数从 src/index.html 手工提取 (inline 架构下的临时测试策略)。
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ===== mock =====
globalThis.window = globalThis;
globalThis.document = { addEventListener: () => {} };
const _origWarn = console.warn, _origError = console.error;
console.warn = () => {}; console.error = () => {};

// ===== 被测函数 (同步自 index.html) =====
const G = globalThis.G = {
  _rng: null, _p2pState: null,
  players: [],
  phase: 'menu', round: 0, scores: [0, 0],
  provisions: [30, 30], currentTurn: 'player',
  selectedCard: null, logs: [], turnCount: 0,
  globalBuffs: {}, graveyard: [],
  mulliganSelected: new Set(), leaderAbilityUsed: [false, false],
  activePlayer: 0, _isHotSeat: false
};

const MSG_SCHEMA = {
  state_init:       { fields: ['rngSeed','deckHashP0','deckHashP1','leaderP0','leaderP1','firstTurnIdx'] },
  action:           { fields: ['type','payload'] },
  state_diff:       { fields: ['seq','beforeHash','afterHash','publicEffects'] },
  ack:              { fields: ['ref_seq','ok','error'] },
  match_result:     { fields: ['winnerIdx','finalScore','settlementHash'] },
  concede:          { fields: ['reason'] },
  reconnect_resume: { fields: ['missedSeqs','catchupDiffs'] }
};

const MAX_STATE_DIFF_BYTES = 4096;
const MAX_STATE_INIT_BYTES = 256;

function ensureP2PState() {
  if (!G._p2pState) G._p2pState = { clientSeq: {}, missedSeqs: {}, lastReceivedSeq: {} };
}

function getNextSeq(steamId64) {
  ensureP2PState();
  if (!G._p2pState.clientSeq[steamId64]) G._p2pState.clientSeq[steamId64] = 0;
  return ++G._p2pState.clientSeq[steamId64];
}

function recordReceivedSeq(steamId64, seq) {
  ensureP2PState();
  const last = G._p2pState.lastReceivedSeq[steamId64] || 0;
  G._p2pState.lastReceivedSeq[steamId64] = seq;
  if (seq > last + 1) {
    const missed = [];
    for (let s = last + 1; s < seq; s++) missed.push(s);
    if (!G._p2pState.missedSeqs[steamId64]) G._p2pState.missedSeqs[steamId64] = [];
    G._p2pState.missedSeqs[steamId64].push(...missed);
  }
}

function packMessage(type, payload) {
  if (!MSG_SCHEMA[type]) throw new Error('packMessage: unknown message type "' + type + '"');
  const json = JSON.stringify({ type, payload, ts: Date.now() });
  if (type === 'state_diff' && json.length > MAX_STATE_DIFF_BYTES)
    throw new Error('packMessage: state_diff exceeds 4 KB (' + json.length + ' bytes)');
  if (type === 'state_init' && json.length > MAX_STATE_INIT_BYTES)
    throw new Error('packMessage: state_init exceeds 256 bytes (' + json.length + ' bytes)');
  return json;
}

function unpackMessage(input) {
  if (!input) throw new Error('unpackMessage: empty input');
  if (typeof input === 'string') {
    if (input.length === 0) throw new Error('unpackMessage: empty input');
    let parsed; try { parsed = JSON.parse(input); } catch (e) {
      throw new Error('unpackMessage: JSON parse error — ' + e.message);
    }
    if (!parsed || typeof parsed !== 'object') throw new Error('unpackMessage: parsed value is not an object');
    if (!parsed.type || typeof parsed.type !== 'string') throw new Error('unpackMessage: missing or invalid "type" field');
    return { type: parsed.type, payload: parsed.payload || {}, ts: parsed.ts || 0 };
  }
  let buf;
  if (input instanceof Buffer) buf = input;
  else if (input instanceof ArrayBuffer) buf = Buffer.from(new Uint8Array(input));
  else throw new Error('unpackMessage: unsupported input type: ' + typeof input);
  const jsonStr = buf.toString('utf-8');
  if (jsonStr.length === 0) throw new Error('unpackMessage: empty buffer');
  let parsed; try { parsed = JSON.parse(jsonStr); } catch (e) {
    throw new Error('unpackMessage: JSON parse error — ' + e.message);
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('unpackMessage: parsed value is not an object');
  if (!parsed.type || typeof parsed.type !== 'string') throw new Error('unpackMessage: missing or invalid "type" field');
  return { type: parsed.type, payload: parsed.payload || {}, ts: parsed.ts || 0 };
}

function sendStateDiff(bh, ah, fx, sid) {
  if (!sid) return;
  return packMessage('state_diff', { seq: getNextSeq(sid), beforeHash: bh || '', afterHash: ah || '', publicEffects: fx || [] });
}

function onStateDiff(msg, handler) {
  const p = msg.payload;
  if (!p || !p.seq) return;
  recordReceivedSeq(msg._fromSteamId || '', p.seq);
  if (typeof handler === 'function') { try { handler(p.publicEffects || []); } catch (e) {} }
}

function packStateInit(seed, h0, h1, l0, l1, f) {
  return packMessage('state_init', {
    rngSeed: seed, deckHashP0: h0 || '', deckHashP1: h1 || '',
    leaderP0: l0 || '', leaderP1: l1 || '', firstTurnIdx: f
  });
}

// ===== TESTS =====

describe('pack/unpack 往返', () => {
  const payloads = {
    state_init:        { rngSeed: 42, deckHashP0: 'abc', deckHashP1: 'def', leaderP0: 'L1', leaderP1: 'L2', firstTurnIdx: 0 },
    action:            { type: 'play_card', payload: { cardId: 1, row: 'infantry' } },
    state_diff:        { seq: 1, beforeHash: 'aa', afterHash: 'bb', publicEffects: [{ row: 'infantry', type: 'addCard', cardName: 't', strength: 5 }] },
    ack:               { ref_seq: 1, ok: true, error: null },
    match_result:      { winnerIdx: 0, finalScore: [2, 1], settlementHash: 'sha256hex' },
    concede:           { reason: 'manual' },
    reconnect_resume:  { missedSeqs: [2, 3], catchupDiffs: [{ seq: 2, payload: {} }] }
  };

  for (const t of Object.keys(payloads)) {
    it(t, () => {
      const p = packMessage(t, payloads[t]);
      const u = unpackMessage(p);
      assert.equal(u.type, t);
      assert.deepEqual(u.payload, payloads[t]);
      assert.ok(typeof u.ts === 'number' && u.ts > 0);
    });
  }

  it('unpack 非法 JSON → throw', () => {
    assert.throws(() => unpackMessage('not{json'), /JSON parse/);
    assert.throws(() => unpackMessage('"string"'), /not an object/);
    assert.throws(() => unpackMessage('42'), /not an object/);
  });

  it('unpack 空值 / 缺 type → throw', () => {
    assert.throws(() => unpackMessage(''), /empty input/);
    assert.throws(() => unpackMessage(null), /empty input/);
    assert.throws(() => unpackMessage('{"payload":{}}'), /missing.*"type"/);
  });

  it('unpack Buffer 输入', () => {
    const p = packMessage('action', { type: 'pass', payload: {} });
    const u = unpackMessage(Buffer.from(p, 'utf-8'));
    assert.equal(u.type, 'action');
  });

  it('unpack ArrayBuffer 输入', () => {
    const p = packMessage('concede', { reason: 'timeout' });
    const u = unpackMessage(new TextEncoder().encode(p).buffer);
    assert.equal(u.type, 'concede');
  });

  it('unpack 空 Buffer → throw', () => {
    assert.throws(() => unpackMessage(Buffer.from('')), /empty buffer/);
  });

  it('pack 未知类型 → throw', () => {
    assert.throws(() => packMessage('nope', {}), /unknown message type/);
  });
});

describe('大小校验', () => {
  it('state_diff > 4KB → throw', () => {
    const p = { seq: 1, beforeHash: '', afterHash: '', publicEffects: [{ desc: 'x'.repeat(4000) }] };
    assert.throws(() => packMessage('state_diff', p), /exceeds 4 KB/);
  });

  it('state_init > 256B → throw', () => {
    const p = { rngSeed: 1, deckHashP0: 'x'.repeat(300), deckHashP1: '', leaderP0: '', leaderP1: '', firstTurnIdx: 0 };
    assert.throws(() => packMessage('state_init', p), /exceeds 256 bytes/);
  });

  it('正常 state_diff ≤ 4KB 通过', () => {
    const p = packMessage('state_diff', { seq: 1, beforeHash: '', afterHash: '', publicEffects: [] });
    assert.ok(p.length <= MAX_STATE_DIFF_BYTES);
  });
});

describe('seq', () => {
  it('递增', () => {
    G._p2pState = null;
    assert.equal(getNextSeq('s1'), 1);
    assert.equal(getNextSeq('s1'), 2);
    assert.equal(getNextSeq('s1'), 3);
  });

  it('独立 client 计数', () => {
    G._p2pState = null;
    assert.equal(getNextSeq('A'), 1);
    assert.equal(getNextSeq('B'), 1);
    assert.equal(getNextSeq('A'), 2);
  });

  it('检测丢失', () => {
    G._p2pState = null;
    recordReceivedSeq('X', 1);
    assert.deepEqual(G._p2pState.missedSeqs.X || [], []);
    recordReceivedSeq('X', 5);
    assert.deepEqual(G._p2pState.missedSeqs.X, [2, 3, 4]);
    recordReceivedSeq('X', 8);
    assert.deepEqual(G._p2pState.missedSeqs.X, [2, 3, 4, 6, 7]);
  });
});

describe('stateDiff', () => {
  it('send → pack 正确', () => {
    G._p2pState = null;
    const j = sendStateDiff('h1', 'h2', [{ row: 'cav', type: 'add', cardName: '刀', strength: 5 }], 'S_0');
    const u = unpackMessage(j);
    assert.equal(u.type, 'state_diff');
    assert.equal(u.payload.seq, 1);
    assert.equal(u.payload.beforeHash, 'h1');
    assert.equal(u.payload.afterHash, 'h2');
  });

  it('onStateDiff 调用 handler', () => {
    G._p2pState = null;
    let ok = false;
    onStateDiff({ type: 'state_diff', payload: { seq: 1, publicEffects: [{ v: 2 }] }, _fromSteamId: 'S_X' }, effs => {
      ok = true;
      assert.deepEqual(effs, [{ v: 2 }]);
    });
    assert.ok(ok);
    assert.equal(G._p2pState.lastReceivedSeq['S_X'], 1);
  });
});

describe('packStateInit', () => {
  it('所有字段', () => {
    const u = unpackMessage(packStateInit(99, 'h0', 'h1', 'l0', 'l1', 0));
    assert.equal(u.type, 'state_init');
    assert.equal(u.payload.rngSeed, 99);
    assert.equal(u.payload.leaderP0, 'l0');
  });

  it('null→空串', () => {
    const u = unpackMessage(packStateInit(0, null, null, null, null, 1));
    assert.equal(u.payload.deckHashP0, '');
    assert.equal(u.payload.leaderP0, '');
  });
});

// restore
process.on('exit', () => { console.warn = _origWarn; console.error = _origError; });