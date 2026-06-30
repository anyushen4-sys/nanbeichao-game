// ===== 南北朝卡牌博弈 — 自动化测试 =====
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gameDir = 'G:/Hermes项目/card-game-design/game/js';
vm.runInThisContext(fs.readFileSync(path.join(gameDir, 'cards.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(gameDir, 'rules.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(gameDir, 'game.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(gameDir, 'ai.js'), 'utf8'));

let passed = 0, failed = 0;
function assert(condition, msg) {
    if (condition) { passed++; console.log('  PASS: ' + msg); }
    else { failed++; console.log('  FAIL: ' + msg); }
}

console.log('\n=== T1: 领袖选择 ===');
assert(LEADERS.length === 7, '7个领袖可选 (actual: ' + LEADERS.length + ')');
var southL = LEADERS.filter(function(l){return l.faction.dynasty === '南朝'});
var northL = LEADERS.filter(function(l){return l.faction.dynasty === '北朝'});
assert(southL.length >= 3, '南朝领袖>=3 (actual: ' + southL.length + ')');
assert(northL.length >= 2, '北朝领袖>=2 (actual: ' + northL.length + ')');

var l1 = getLeaderById('L1');
assert(l1 !== null, 'getLeaderById(L1) ok');
assert(l1.name === '刘裕', '刘裕 name ok: ' + l1.name);
assert(typeof l1.active === 'function', 'leader has active fn');
assert(typeof l1.passive === 'function', 'leader has passive fn');

console.log('\n=== T2: 游戏初始化 ===');
var game = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
assert(game.player.hand.length === RULES.STARTING_HAND, 'player hand=' + RULES.STARTING_HAND + ' (actual: ' + game.player.hand.length + ')');
assert(game.ai.hand.length === RULES.STARTING_HAND, 'ai hand=' + RULES.STARTING_HAND + ' (actual: ' + game.ai.hand.length + ')');
assert(game.player.food === RULES.START_FOOD, 'start food=' + RULES.START_FOOD);
assert(game.currentRound === 1, 'round 1');
assert(game._playerDeck.length > 0, 'player deck has cards: ' + game._playerDeck.length);
assert(game._aiDeck.length > 0, 'ai deck has cards: ' + game._aiDeck.length);

console.log('\n=== T3: 回合切换 (BUG1 fix) ===');
var g2 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
var fp = g2.currentPlayer;
var playable = fp.hand.find(function(c){return fp.food >= getCostPreview(c, fp)});
assert(playable !== undefined, 'has playable card');
var row = playable.infantry > 0 ? 'infantry' : playable.cavalry > 0 ? 'cavalry' : 'navy';
var prev = g2.currentPlayer;
var ok = g2.executePlayCard(playable, prev, row);
assert(ok === true, 'play success');
assert(g2.currentPlayer !== prev, 'turn switches after play (BUG1 fixed)');

console.log('\n=== T4: 费用折扣不被提前消耗 (BUG2 fix) ===');
var g3 = new Game(getLeaderById('L2'), getLeaderById('L4'), FACTIONS.LIANG, FACTIONS.NWEI);
g3.player._nextCardDiscount = 2;
var c1 = g3.player.hand[0];
var p1 = getCostPreview(c1, g3.player);
assert(g3.player._nextCardDiscount === 2, 'getCostPreview preserves discount: ' + g3.player._nextCardDiscount);
var cc = calculateCost(c1, g3.player);
assert(g3.player._nextCardDiscount === 2, 'calculateCost preserves discount: ' + g3.player._nextCardDiscount);

console.log('\n=== T5: 隐藏卡牌分数 (BUG3 fix) ===');
var g4 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
var pc = g4.player.hand.find(function(c){return c.type === 'general' || c.type === 'soldier'});
if (pc) {
    g4.playToBoard(pc, g4.player, 'infantry');
}
g4.player.board.infantry[0]._hidden = true;
var res = determineRoundWinner(g4.player.board, g4.ai.board, g4.activeWeathers);
assert(typeof res === 'string', 'determineRoundWinner returns string: ' + res);
assert(res === 'player1' || res === 'player2' || res === 'draw', 'valid result: ' + res);

// Test endRound doesn't crash with hidden cards
g4.endRound();
assert(g4.lastRoundResult !== undefined, 'lastRoundResult saved');

console.log('\n=== T6: 粮草回复 (BUG4 fix) ===');
var g5 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
var initF = g5.currentPlayer.food;
g5.switchTurn();
var afterF = g5.currentPlayer.food;
assert(afterF === initF + RULES.FOOD_REGEN || afterF === RULES.MAX_FOOD, 'food regen: ' + initF + ' -> ' + afterF);

console.log('\n=== T7: 陈庆之能力 (BUG5 fix) ===');
var g6 = new Game(getLeaderById('L3'), getLeaderById('L4'), FACTIONS.LIANG, FACTIONS.NWEI);
var cc1 = new Card({id:'t1',name:'t1',type:'soldier',cost:2,infantry:0,cavalry:5,navy:0});
var cc2 = new Card({id:'t2',name:'t2',type:'soldier',cost:3,infantry:0,cavalry:6,navy:0});
g6.player.board.cavalry.push(cc1, cc2);
g6.player.leader.active(g6, g6.player);
assert(g6.player.board.cavalry.length === 0, 'cavalry row cleared');
var tot = g6.getPlayerScore(g6.player);
assert(typeof tot === 'number', 'score is number after ability: ' + tot);

console.log('\n=== T8: 宇文泰被动 (BUG6 fix) ===');
var g7 = new Game(getLeaderById('L5'), getLeaderById('L4'), FACTIONS.XWEI, FACTIONS.NWEI);
var u1 = new Card({id:'u1',name:'u1',type:'soldier',cost:2,infantry:5,cavalry:0,navy:0});
var u2 = new Card({id:'u2',name:'u2',type:'soldier',cost:2,infantry:5,cavalry:0,navy:0});
var u3 = new Card({id:'u3',name:'u3',type:'soldier',cost:2,infantry:5,cavalry:0,navy:0});
var u4 = new Card({id:'u4',name:'u4',type:'soldier',cost:2,infantry:5,cavalry:0,navy:0});
g7.playToBoard(u1, g7.player, 'infantry');
g7.player.leader.passive(g7, g7.player, u1);
g7.playToBoard(u2, g7.player, 'infantry');
g7.player.leader.passive(g7, g7.player, u2);
g7.playToBoard(u3, g7.player, 'infantry');
g7.player.leader.passive(g7, g7.player, u3);
g7.playToBoard(u4, g7.player, 'infantry');
g7.player.leader.passive(g7, g7.player, u4);
assert(u1._bonus === 1, 'card1 +1 (actual: ' + u1._bonus + ')');
assert(u2._bonus === 1, 'card2 +1 (actual: ' + u2._bonus + ')');
assert(u3._bonus === 1, 'card3 +1 (actual: ' + u3._bonus + ')');
assert(!u4._bonus || u4._bonus === 0, 'card4 no bonus (actual: ' + u4._bonus + ')');

console.log('\n=== T9: 新局状态重置 (BUG7 fix) ===');
var g8 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
g8.player._firstPlayUsed = true;
g8.player._wenTaiBuffs = 3;
g8.player._nextCardDiscount = 5;
g8.player._turnBonus = 2;
g8.player.wins = 1;
g8.ai.wins = 1;
g8.endRound();
g8.startNewRound();
assert(g8.player._firstPlayUsed === false, '_firstPlayUsed reset');
assert(g8.player._wenTaiBuffs === 0, '_wenTaiBuffs reset');
assert(g8.player._nextCardDiscount === 0, '_nextCardDiscount reset');
assert(g8.player._turnBonus === 0, '_turnBonus reset');
assert(g8.currentRound === 2, 'round 2 started');

console.log('\n=== T10: AI决策 ===');
var ai = new AIEngine('E2');
var g9 = new Game(getLeaderById('L1'), getLeaderById('L5'), FACTIONS.SONG, FACTIONS.XWEI);
g9.currentPlayer = g9.ai;
var dec = ai.decideMove(g9);
assert(dec.action === 'play' || dec.action === 'pass', 'AI valid decision: ' + dec.action);
if (dec.action === 'play') {
    assert(typeof dec.cardIndex === 'number', 'AI cardIndex: ' + dec.cardIndex);
    assert(typeof dec.targetRow === 'string', 'AI targetRow: ' + dec.targetRow);
}

console.log('\n=== T11: 三局两胜 ===');
var g10 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
g10.player.board.infantry.push(new Card({id:'w1',name:'w1',type:'soldier',cost:2,infantry:20,cavalry:0,navy:0}));
g10.endRound();
assert(g10.player.wins === 1, 'player wins 1');
g10.startNewRound();
g10.player.board.infantry.push(new Card({id:'w2',name:'w2',type:'soldier',cost:2,infantry:20,cavalry:0,navy:0}));
g10.endRound();
assert(g10.player.wins === 2, 'player wins 2');
assert(g10.gameOver === true, 'game over after 2 wins');

console.log('\n=== T12: 卡牌clone保留特殊效果 ===');
var deck = buildDeck();
var tan = deck.find(function(c){return c.id === 'G01'});
assert(tan && typeof tan.play === 'function', '檀道济 has play');
var tanC = tan.clone();
assert(typeof tanC.play === 'function', 'cloned 檀道济 has play');

var xie = deck.find(function(c){return c.id === 'G04'});
assert(xie && typeof xie.onPass === 'function', '谢安 has onPass');
var xieC = xie.clone();
assert(typeof xieC.onPass === 'function', 'cloned 谢安 has onPass');

console.log('\n=== T13: 出牌消耗折扣 ===');
// L2 (萧衍) passive re-adds discount after consuming, so net stays at 1
// Test with L1 (刘裕) instead to verify pure consumption
var g11 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
g11.player._nextCardDiscount = 1;
var card11 = g11.player.hand.find(function(c){return c.type === 'general' || c.type === 'soldier'});
if (card11) {
    var r11 = card11.infantry > 0 ? 'infantry' : 'cavalry';
    g11.executePlayCard(card11, g11.player, r11);
    assert(g11.player._nextCardDiscount === 0, 'discount consumed after play (non-L2): ' + g11.player._nextCardDiscount);
}
// Also test L2 passive: discount should be 1 after play (consumed then re-added)
var g11b = new Game(getLeaderById('L2'), getLeaderById('L4'), FACTIONS.LIANG, FACTIONS.NWEI);
g11b.player._nextCardDiscount = 1;
var card11b = g11b.player.hand.find(function(c){return c.type === 'general' || c.type === 'soldier'});
if (card11b) {
    var r11b = card11b.infantry > 0 ? 'infantry' : 'cavalry';
    g11b.executePlayCard(card11b, g11b.player, r11b);
    assert(g11b.player._nextCardDiscount === 1, 'L2 passive re-adds discount: ' + g11b.player._nextCardDiscount);
}

console.log('\n=== T14: Weather tick between rounds ===');
var g12 = new Game(getLeaderById('L1'), getLeaderById('L4'), FACTIONS.SONG, FACTIONS.NWEI);
g12.activeWeathers.push({type: 'infantry', duration: 2, name: '暴风雪'});
g12.activeWeathers.push({type: 'cavalry', duration: 1, name: '梅雨'});
g12.player.wins = 0;
g12.ai.wins = 0;
g12.endRound();
g12.startNewRound();
assert(g12.activeWeathers.length === 1, 'weather with duration 1 expired, 1 remains: ' + g12.activeWeathers.length);
if (g12.activeWeathers.length === 1) {
    assert(g12.activeWeathers[0].duration === 1, 'remaining weather duration decremented: ' + g12.activeWeathers[0].duration);
}

console.log('\n========================================');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
if (failed > 0) process.exit(1);
