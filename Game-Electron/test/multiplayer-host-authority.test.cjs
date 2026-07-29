const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const assert=require('node:assert/strict');

const PROJECT=path.resolve(__dirname,'..');
const HTML_PATH=path.join(PROJECT,'src','index.html');
const MAIN_PATH=path.join(PROJECT,'main.js');
const EXTERNAL_CARD_PATH=path.join(PROJECT,'src','js','card_data_uris.js');

function extractInlineGameScript(html){
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length>=1,'index.html must contain the inline game script');
  return scripts.map((match)=>match[1]).join('\n');
}

function createGameHarness() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const externalCard = fs.readFileSync(EXTERNAL_CARD_PATH, 'utf8');
  const inlineScript = extractInlineGameScript(html);
  const sent = [];
  const notifications = [];
  const rendered = [];
  const timers = new Map();
  let nextTimerId = 1;
  let cryptoValue = 100;

  const sandbox = {
    console,
    Buffer,
    Uint8Array,
    Uint32Array,
    ArrayBuffer,
    TextEncoder,
    TextDecoder,
    Set,
    Map,
    Date,
    JSON,
    Math,
    Promise,
    CARD_DATA_URIS: {},
    crypto: {
      getRandomValues(target) {
        target[0] = cryptoValue >>> 0;
        return target;
      },
    },
    document: {
      addEventListener() {},
      getElementById() { return null; },
      querySelector() { return null; },
      head: { appendChild() {} },
      createElement(tagName) {
        const style = { setProperty() {} };
        return {
          tagName: String(tagName || '').toUpperCase(),
          id: '',
          className: '',
          innerHTML: '',
          textContent: '',
          style,
          dataset: {},
          parentNode: null,
          remove() {},
          appendChild() {},
          querySelector() { return null; },
          querySelectorAll() { return []; },
          addEventListener() {},
        };
      },
      body: { appendChild() {} },
    },
    setInterval(fn) {
      const id = nextTimerId++;
      timers.set(id, fn);
      return id;
    },
    clearInterval(id) { timers.delete(id); },
    setTimeout(fn) { return nextTimerId++; },
    clearTimeout() {},
    electronAPI: {
      multiplayer: {
        sendP2PMessage(steamId, data) {
          sent.push({ steamId, data });
          return Promise.resolve({ ok: true });
        },
        onP2PMessage() { return Promise.resolve({ ok: true, messages: [] }); },
        openInviteDialog() { return Promise.resolve({ ok: true }); },
        isSteamAvailable() { return Promise.resolve({ ok: true }); },
        acceptIncomingInvite() { return Promise.resolve({ ok: true }); },
        onSessionRequest() { return Promise.resolve({ ok: true, requests: [] }); },
        getLocalPlayerSteamId() { return Promise.resolve({ ok: true, steamId: '1' }); },
      },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(externalCard, sandbox, { filename: EXTERNAL_CARD_PATH });
  vm.runInContext(inlineScript, sandbox, { filename: HTML_PATH });

  sandbox.showNotification = (message) => notifications.push(message);
  sandbox.render = () => rendered.push(true);

  return {
    sandbox,
    sent,
    notifications,
    rendered,
    timers,
    setCryptoValue(value) { cryptoValue = value >>> 0; },
    unpackSent(index = -1) {
      const item = index < 0 ? sent[sent.length + index] : sent[index];
      assert.ok(item, 'expected a sent P2P message');
      const wire = typeof item.data === 'string' ? item.data : JSON.stringify(item.data);
      return { steamId: item.steamId, message: JSON.parse(wire) };
    },
  };
}

test('renderer inline script parses and boots', () => {
  const harness = createGameHarness();
  assert.equal(typeof harness.sandbox.render, 'function');
  assert.equal(harness.sandbox.G.phase, 'menu');
});

test('guest play-card action reaches host and produces state_diff', () => {
  const guest = createGameHarness();
  guest.sandbox.G._mpState = { isHost: false, _host: 'guest', peerId: 'host', localPlayerIdx: 1 };
  guest.sandbox.G.playerTurn = true;
  guest.sandbox.G.players[1].hand = [{ id: 'c1', name: '测试牌', strength: 1, row: 'infantry', faction: 'common' }];
  guest.sandbox.G.players[1].board = { infantry: [], cavalry: [], navy: [], strategy: [] };
  guest.sandbox.G.provisions[1] = 30;

  guest.sandbox.handleMultiplayerPlayCard(0, 'infantry');
  const action = guest.unpackSent().message;
  assert.equal(action.type, 'action');
  assert.deepEqual(action.payload, {
    type: 'play_card',
    payload: { cardId: 'c1', row: 'infantry', handIdx: 0 },
  });

  const host = createGameHarness();
  host.sandbox.G._mpState = { isHost: true, _host: 'host', peerId: 'guest', localPlayerIdx: 0 };
  host.sandbox.G.players[1].hand = [{ id: 'c1', name: '测试牌', strength: 1, row: 'infantry', faction: 'common' }];
  host.sandbox.G.players[1].board = { infantry: [], cavalry: [], navy: [], strategy: [] };
  host.sandbox.G.provisions[1] = 30;

  host.sandbox.handleMultiplayerMessage(action);
  assert.equal(host.sandbox.G.players[1].board.infantry.length, 1);
  assert.equal(host.unpackSent().message.type, 'state_diff');
});

test('guest acknowledges a host state_diff', () => {
  const guest = createGameHarness();
  guest.sandbox.G._mpState = { isHost: false, _host: 'guest', peerId: 'host', localPlayerIdx: 1 };
  const msg = {
    type: 'state_diff',
    payload: {
      seq: 7,
      beforeHash: '',
      afterHash: '',
      publicEffects: { activePlayer: 1, turnCount: 2, players: [] },
    },
    _fromSteamId: 'host',
  };

  guest.sandbox.handleMultiplayerMessage(msg);
  const ack = guest.unpackSent().message;
  assert.equal(ack.type, 'ack');
  assert.equal(ack.payload.ref_seq, 7);
  assert.equal(ack.payload.ok, true);
});

test('RNG comparison elects exactly one host and starts state_init', () => {
  const initialHost = createGameHarness();
  initialHost.sandbox.G._mpState = { isHost: null, _host: 'host', peerId: 'guest', localPlayerIdx: 0 };
  initialHost.sandbox.G.players[0].leader = initialHost.sandbox.LEADERS_DATA[0];
  initialHost.sandbox.G.players[1].leader = initialHost.sandbox.LEADERS_DATA[1];
  initialHost.setCryptoValue(100);
  initialHost.sandbox.initMultiplayerHost();
  assert.equal(initialHost.sandbox.G._mpState.myRngValue, 100);

  const initialGuest = createGameHarness();
  initialGuest.sandbox.G._mpState = { isHost: null, _host: 'guest', peerId: 'host', localPlayerIdx: 1 };
  initialGuest.setCryptoValue(200);
  initialGuest.sandbox.handleMultiplayerMessage(initialHost.unpackSent().message);
  assert.equal(initialGuest.sandbox.G._mpState.isHost, true);
  assert.equal(initialGuest.sandbox.G._mpState._host, 'host');

  initialHost.sandbox.handleMultiplayerMessage(initialGuest.unpackSent().message);
  assert.equal(initialHost.sandbox.G._mpState.isHost, false);
  assert.equal(initialHost.sandbox.G._mpState._host, 'guest');

  const stateInit = initialGuest.sent
    .map((entry) => JSON.parse(entry.data))
    .find((message) => message.type === 'state_init');
  assert.ok(stateInit, 'RNG winner must send state_init');
});

test('state_init contains real deck hashes and guest derives deterministic state', () => {
  const host = createGameHarness();
  host.sandbox.G._mpState = { isHost: true, _host: 'host', peerId: 'guest', localPlayerIdx: 0 };
  host.sandbox.G.players[0].leader = host.sandbox.LEADERS_DATA[0];
  host.sandbox.G.players[1].leader = host.sandbox.LEADERS_DATA[1];
  host.sandbox.sendMultiplayerStateInit();
  const init = host.unpackSent().message;
  assert.equal(init.type, 'state_init');
  assert.match(init.payload.deckHashP0, /^[0-9a-f]{8,64}$/i);
  assert.match(init.payload.deckHashP1, /^[0-9a-f]{8,64}$/i);

  const guest = createGameHarness();
  guest.sandbox.G._mpState = { isHost: false, _host: 'guest', peerId: 'host', localPlayerIdx: 1 };
  guest.sandbox.handleMultiplayerMessage(init);
  assert.equal(typeof guest.sandbox.G._rng.next, 'function');
  assert.equal(guest.sandbox.G._mpSeed, init.payload.rngSeed);
  assert.equal(guest.sandbox.G.players[0].deck.length, host.sandbox.G.players[0].deck.length);
  assert.equal(guest.sandbox.G.players[1].deck.length, host.sandbox.G.players[1].deck.length);
});

test('disconnect timeout sends protocol-valid timeout concede and awards guest', () => {
  const guest = createGameHarness();
  guest.sandbox.G._mpState = { isHost: false, _host: 'guest', peerId: 'host', localPlayerIdx: 1 };
  guest.sandbox.G.scores = [0, 0];
  guest.sandbox.timeoutReconnect();
  const concede = guest.unpackSent().message;
  assert.equal(concede.type, 'concede');
  assert.equal(concede.payload.reason, 'timeout');
  assert.equal(guest.sandbox.G.scores[1], 2);
});

test('main process uses the installed steamworks.js networking contract', () => {
  const src = fs.readFileSync(MAIN_PATH, 'utf8');
  assert.match(src, /isP2PPacketAvailable\s*\(/);
  assert.match(src, /readP2PPacket\s*\([^)]*available/i);
  assert.match(src, /acceptP2PSession\s*\(/);
  assert.doesNotMatch(src, /readP2PPacket\s*\(\s*0\s*\)/);
});
