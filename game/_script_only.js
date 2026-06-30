
const ROW_NAMES={infantry:'步兵',cavalry:'骑兵',navy:'水军',strategy:'谋略'};

const CARD_IMAGES={
  1:'assets/cards/card_001.png',
  2:'assets/cards/card_002.png',
  3:'assets/cards/card_003.png',
  4:'assets/cards/card_004.png',
  5:'assets/cards/card_005.png',
  6:'assets/cards/card_006.png',
  7:'assets/cards/card_007.png',
  8:'assets/cards/card_008.png',
  9:'assets/cards/card_009.png',
  10:'assets/cards/card_010.png',
  11:'assets/cards/card_011.png',
  12:'assets/cards/card_012.png',
  13:'assets/cards/card_013.png',
  14:'assets/cards/card_014.png',
  15:'assets/cards/card_015.png',
  16:'assets/cards/card_016.png',
  17:'assets/cards/card_017.png',
  18:'assets/cards/card_018.png',
  19:'assets/cards/card_019.png',
  20:'assets/cards/card_020.png',
  21:'assets/cards/card_021.png',
  22:'assets/cards/card_022.png',
  23:'assets/cards/card_023.png',
  24:'assets/cards/card_024.png',
  25:'assets/cards/card_025.png',
  26:'assets/cards/card_026.png',
  27:'assets/cards/card_027.png',
  28:'assets/cards/card_028.png',
  29:'assets/cards/card_029.png',
  30:'assets/cards/card_030.png',
  31:'assets/cards/card_031.png',
  32:'assets/cards/card_032.png',
  33:'assets/cards/card_033.png',
  34:'assets/cards/card_034.png',
  35:'assets/cards/card_035.png',
  36:'assets/cards/card_036.png',
  37:'assets/cards/card_037.png',
  38:'assets/cards/card_038.png',
  39:'assets/cards/card_039.png',
  40:'assets/cards/card_040.png',
  41:'assets/cards/card_041.png',
  42:'assets/cards/card_042.png',
  43:'assets/cards/card_043.png',
  44:'assets/cards/card_044.png',
  45:'assets/cards/card_045.png',
  46:'assets/cards/card_046.png',
  47:'assets/cards/card_047.png',
  48:'assets/cards/card_048.png',
  49:'assets/cards/card_049.png',
  50:'assets/cards/card_050.png',
  100:'assets/cards/card_100.png',
  101:'assets/cards/card_101.png',
  102:'assets/cards/card_102.png',
  103:'assets/cards/card_103.png',
  104:'assets/cards/card_104.png',
  105:'assets/cards/card_105.png',
  106:'assets/cards/card_106.png',
  107:'assets/cards/card_107.png',
  108:'assets/cards/card_108.png',
  109:'assets/cards/card_109.png',
  110:'assets/cards/card_110.png',
  111:'assets/cards/card_111.png',
  112:'assets/cards/card_112.png',
  113:'assets/cards/card_113.png',
  114:'assets/cards/card_114.png',
  115:'assets/cards/card_115.png',
  116:'assets/cards/card_116.png',
  117:'assets/cards/card_117.png',
  118:'assets/cards/card_118.png',
  119:'assets/cards/card_119.png',
  120:'assets/cards/card_120.png',
  121:'assets/cards/card_121.png',
  122:'assets/cards/card_122.png',
  123:'assets/cards/card_123.png',
  124:'assets/cards/card_124.png',
  125:'assets/cards/card_125.png',
  126:'assets/cards/card_126.png',
};

function getCardImage(card){
  if(CARD_IMAGES[card.id]) return CARD_IMAGES[card.id];
  // fallback: generate based on category
  const cat=getCardCategory(card);
  if(cat==='infantry') return 'assets/cards/card_placeholder_infantry.svg';
  if(cat==='cavalry') return 'assets/cards/card_placeholder_cavalry.svg';
  if(cat==='navy') return 'assets/cards/card_placeholder_navy.svg';
  if(cat==='strategy') return 'assets/cards/card_placeholder_strategy.svg';
  if(cat==='weather') return 'assets/cards/card_placeholder_weather.svg';
  if(cat==='commander') return 'assets/cards/card_placeholder_commander.svg';
  return '';
}

const ROW_ICONS={
infantry:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.6) brightness(0.8) contrast(1.2)">`,
cavalry:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.5) hue-rotate(-10deg) brightness(0.85) contrast(1.2)">`,
navy:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.7) hue-rotate(-20deg) brightness(0.75) contrast(1.3)">`,
strategy:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.8) hue-rotate(-30deg) brightness(0.7) contrast(1.4)">`,
weather:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.9) hue-rotate(-40deg) brightness(0.65) contrast(1.5)">`,
commander:`<img src="assets/card-hero.png" class="card-svg-icon" style="filter:sepia(0.4) hue-rotate(0deg) brightness(0.9) contrast(1.1)">`,
};

/* T32b 已生成插画图片的卡牌ID列表 */
const CARDS_WITH_IMAGES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 111, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126]);

/* T32b 生成卡牌插画HTML：有图片则显示，无图片显示灰色占位符 */
function getCardImageHTML(card){
  if(CARDS_WITH_IMAGES.has(card.id)){
    const idStr = String(card.id).padStart(3,'0');
    return `<img src="assets/cards/card_${idStr}.svg" class="card-img-real" alt="${card.name}">`;
  }
  return `<svg viewBox="0 0 100 120" class="card-placeholder">
    <rect x="15" y="8" width="70" height="85" rx="6" fill="#d0d0d0" opacity="0.35"/>
    <circle cx="50" cy="35" r="14" fill="#bbb" opacity="0.4"/>
    <rect x="28" y="55" width="44" height="30" rx="4" fill="#ccc" opacity="0.35"/>
    <text x="50" y="110" text-anchor="middle" font-size="9" fill="#999" font-family="'Noto Serif SC','STKaiti','KaiTi',serif">${card.name}</text>
  </svg>`;
}

function getCardCategory(card){
  if(!card.ability) return 'commander';
  const t=card.ability.split(':')[0];
  if(t==='boost_row'||t==='weaken_row'||t==='discard'||t==='combo_boost'||t==='destroy'||t==='resurrect'||t==='protect'||t==='spy'||t==='draw_extra'||t==='poison'||t==='bleed'||t==='revive'||t==='transform'||t==='bounty') return 'strategy';
  if(t==='draw'||t==='gain_provisions') return 'weather';
  if(t==='shield_wall'||t==='ambush_trap'||t==='devour'||t==='duel'||t==='barrier') return 'commander';
  return 'commander';
}

function getCardRarity(card){
  if(card.strength>=8) return 'gold';
  if(card.strength>=6) return 'purple';
  if(card.strength>=4) return 'blue';
  return 'gray';
}

function getCategoryIcon(card){
  return getCardImageHTML(card);
}

const FACTIONS={
common:{name:'公用',color:'#4A4A6A',bg:'#F5F0E8'},
song:{name:'宋',color:'#C83C3C',bg:'#F8E8EA'},
qi:{name:'齐',color:'#3D6B8E',bg:'#E4EAF4'},
liang:{name:'梁',color:'#3D6B8E',bg:'#E4EAF4'},
chen:{name:'陈',color:'#3D6B8E',bg:'#E4EAF4'},
beiwei:{name:'北魏',color:'#8B6914',bg:'#F0EAD8'},
dongwei:{name:'东魏',color:'#8B6914',bg:'#F0EAD8'},
xiwei:{name:'西魏',color:'#8B6914',bg:'#F0EAD8'},
beiqi:{name:'北齐',color:'#3D4F5F',bg:'#EDEDF2'},
beizhou:{name:'北周',color:'#3D4F5F',bg:'#EDEDF2'}
};

const CARDS_DATA=[
{id:100,name:'斥候',faction:'common',strength:2,row:'infantry',ability:null,desc:'探听敌情'},
{id:101,name:'民兵',faction:'common',strength:3,row:'infantry',ability:null,desc:'保家卫国'},
{id:102,name:'弓箭手',faction:'common',strength:4,row:'cavalry',ability:null,desc:'远程射击'},
{id:103,name:'辎重',faction:'common',strength:1,row:'navy',ability:'gain_provisions:1',desc:'补给粮草+1'},
{id:104,name:'谋士',faction:'common',strength:2,row:'strategy',ability:'draw:1',desc:'运筹帷幄，抽1牌'},
{id:105,name:'刺客',faction:'common',strength:5,row:'cavalry',ability:'discard:1',desc:'暗杀行动，对手弃1牌'},
{id:106,name:'弩手',faction:'common',strength:6,row:'cavalry',ability:null,desc:'强弓劲弩'},
{id:107,name:'盾兵',faction:'common',strength:3,row:'infantry',ability:'boost_row:1',desc:'盾阵，本行+1'},
{id:108,name:'轻骑',faction:'common',strength:4,row:'cavalry',ability:null,desc:'轻骑突进'},
{id:109,name:'传令',faction:'common',strength:1,row:'strategy',ability:'draw:1',desc:'传令兵，抽1牌'},
{id:1,name:'刘裕',faction:'song',strength:6,row:'infantry',ability:'ambush:3',desc:'突袭！首回合步兵+3'},
{id:2,name:'檀道济',faction:'song',strength:7,row:'infantry',ability:null,desc:'唱筹量沙，名将'},
{id:3,name:'沈庆之',faction:'song',strength:5,row:'infantry',ability:'boost_row:1',desc:'老兵名将，本行+1'},
{id:4,name:'到彦之',faction:'song',strength:4,row:'infantry',ability:'command:2',desc:'军令如山，弃最弱牌抽2'},
{id:5,name:'谢晦',faction:'song',strength:3,row:'strategy',ability:'draw:1',desc:'谋略过人，抽1牌'},
{id:6,name:'萧道成',faction:'qi',strength:5,row:'infantry',ability:null,desc:'齐高帝，雄主'},
{id:7,name:'王俭',faction:'qi',strength:4,row:'strategy',ability:'control:1',desc:'离间计，对手最强行-1'},
{id:8,name:'褚渊',faction:'qi',strength:3,row:'strategy',ability:'skirmish:0',desc:'书谋，跳过对手一回合'},
{id:9,name:'崔祖思',faction:'qi',strength:5,row:'infantry',ability:'weaken_row:1',desc:'削弱对手一行-1'},
{id:10,name:'王僧虔',faction:'qi',strength:6,row:'cavalry',ability:null,desc:'书法传家，名士'},
{id:11,name:'萧衍',faction:'liang',strength:7,row:'navy',ability:null,desc:'梁武帝，崇佛'},
{id:12,name:'韦睿',faction:'liang',strength:6,row:'infantry',ability:'shield:1',desc:'佛光普照，全场+1'},
{id:13,name:'陈庆之',faction:'liang',strength:8,row:'cavalry',ability:null,desc:'白袍战神，名垂千古'},
{id:14,name:'羊侃',faction:'liang',strength:5,row:'navy',ability:'navy_boost:2',desc:'水攻，水军+2'},
{id:15,name:'侯景',faction:'liang',strength:4,row:'infantry',ability:'discard:1',desc:'乱臣贼子，对手弃1牌'},
{id:16,name:'陈霸先',faction:'chen',strength:6,row:'infantry',ability:null,desc:'陈武帝，开国'},
{id:17,name:'吴明彻',faction:'chen',strength:7,row:'infantry',ability:null,desc:'南朝名将，北伐'},
{id:18,name:'侯瑱',faction:'chen',strength:5,row:'navy',ability:'farm:2',desc:'屯田，每回合+2粮草'},
{id:19,name:'章昭达',faction:'chen',strength:4,row:'infantry',ability:'fortify:1',desc:'坚壁清野，本行+1'},
{id:20,name:'黄法氍',faction:'chen',strength:3,row:'navy',ability:'gain_provisions:1',desc:'筹措粮草，+1'},
{id:21,name:'拓跋焘',faction:'beiwei',strength:8,row:'cavalry',ability:null,desc:'太武帝，统一北方'},
{id:22,name:'崔浩',faction:'beiwei',strength:5,row:'strategy',ability:'weaken_row:2',desc:'军师，对手一行-2'},
{id:23,name:'尔朱荣',faction:'beiwei',strength:7,row:'cavalry',ability:null,desc:'权臣，骁勇善战'},
{id:24,name:'贺拔岳',faction:'beiwei',strength:6,row:'cavalry',ability:'flex:0',desc:'铁骑纵横，骑兵任意行'},
{id:25,name:'奚康生',faction:'beiwei',strength:4,row:'cavalry',ability:'assimilate:0',desc:'汉化，吸收对手一张牌'},
{id:26,name:'高欢',faction:'dongwei',strength:7,row:'infantry',ability:null,desc:'神武帝，雄主'},
{id:27,name:'高澄',faction:'dongwei',strength:5,row:'strategy',ability:'gain_provisions:2',desc:'富国强兵，+2粮草'},
{id:28,name:'慕容绍宗',faction:'dongwei',strength:6,row:'infantry',ability:'armor:1',desc:'坚甲，所有友方+1'},
{id:29,name:'高岳',faction:'dongwei',strength:4,row:'infantry',ability:'siege:2',desc:'围城，对手最强行-2'},
{id:30,name:'刘丰',faction:'dongwei',strength:3,row:'navy',ability:'draw:1',desc:'水军将领，抽1牌'},
{id:31,name:'宇文泰',faction:'xiwei',strength:8,row:'infantry',ability:null,desc:'大冢宰，八柱国'},
{id:32,name:'李虎',faction:'xiwei',strength:6,row:'cavalry',ability:'coordinate:1',desc:'联防，同阵营相邻+1'},
{id:33,name:'侯莫陈崇',faction:'xiwei',strength:5,row:'cavalry',ability:'boost_row:1',desc:'骁勇，本行+1'},
{id:34,name:'赵贵',faction:'xiwei',strength:4,row:'infantry',ability:'ambush_card:0',desc:'伏兵，藏一张牌'},
{id:35,name:'独孤信',faction:'xiwei',strength:5,row:'strategy',ability:null,desc:'八柱国，美男子'},
{id:36,name:'高洋',faction:'beiqi',strength:8,row:'cavalry',ability:null,desc:'文宣帝，疯癫天才'},
{id:37,name:'斛律光',faction:'beiqi',strength:7,row:'cavalry',ability:'crit:0',desc:'暴击，随机消灭对手一张'},
{id:38,name:'兰陵王',faction:'beiqi',strength:6,row:'cavalry',ability:'berserk:0',desc:'狂攻！战力翻倍但下回合-2'},
{id:39,name:'段韶',faction:'beiqi',strength:5,row:'infantry',ability:'boost_row:2',desc:'名将，本行+2'},
{id:40,name:'傅伏',faction:'beiqi',strength:4,row:'infantry',ability:null,desc:'忠臣守城'},
{id:41,name:'宇文邕',faction:'beizhou',strength:7,row:'cavalry',ability:null,desc:'周武帝，雄才大略'},
{id:42,name:'韦孝宽',faction:'beizhou',strength:6,row:'infantry',ability:'unify:0',desc:'统一之势，每出一张辅助类+0.5全局'},
{id:43,name:'于翼',faction:'beizhou',strength:5,row:'cavalry',ability:'anti_south:3',desc:'灭陈，对南朝阵营+3'},
{id:44,name:'辛威',faction:'beizhou',strength:4,row:'infantry',ability:'draw:1',desc:'勇将，抽1牌'},
{id:45,name:'梁士彦',faction:'beizhou',strength:3,row:'navy',ability:'discard:1',desc:'猛将，对手弃1牌'},
{id:46,name:'宋军旗',faction:'song',strength:2,row:'infantry',ability:'combo_boost:2',desc:'连携，友方连携+2'},
{id:47,name:'铁鹞子',faction:'beiwei',strength:3,row:'cavalry',ability:'destroy:1',desc:'拆牌，消灭对手1张'},
{id:48,name:'舍利',faction:'liang',strength:1,row:'strategy',ability:'resurrect:1',desc:'回收，从墓地拉1张'},
{id:49,name:'铁甲',faction:'dongwei',strength:2,row:'infantry',ability:'protect:1',desc:'护盾，获得1点护甲'},
{id:50,name:'细作',faction:'beiqi',strength:1,row:'strategy',ability:'spy:1',desc:'间谍，查看并弃对手1张'},
{id:110,name:'过牌',faction:'common',strength:1,row:'strategy',ability:'draw_extra:2',desc:'运筹，额外抽2张牌'},
{id:111,name:'连环计',faction:'common',strength:2,row:'strategy',ability:'destroy:1',desc:'连环计，消灭对手1张'},
{id:112,name:'暗度陈仓',faction:'common',strength:1,row:'strategy',ability:'spy:1',desc:'暗度陈仓，间谍行动'},
{id:113,name:'离间',faction:'qi',strength:2,row:'strategy',ability:'draw_extra:2',desc:'挑拨离间，额外抽2张牌'},
{id:114,name:'屯垦',faction:'chen',strength:2,row:'infantry',ability:'draw:1',desc:'屯田开垦，抽1张牌'},
{id:115,name:'奇袭',faction:'xiwei',strength:3,row:'cavalry',ability:'destroy:1',desc:'奇袭敌后，消灭对手1张牌'},
{id:116,name:'密探',faction:'beizhou',strength:2,row:'strategy',ability:'spy:1',desc:'秘密探子，间谍行动'},
{id:117,name:'毒箭',faction:'common',strength:3,row:'strategy',ability:'bleed:2',desc:'淬毒箭矢，对手每回合-1战力'},
{id:118,name:'鸩酒',faction:'qi',strength:2,row:'strategy',ability:'poison:2',desc:'鸩酒毒杀，消灭对手最强牌'},
{id:119,name:'铁壁',faction:'liang',strength:4,row:'infantry',ability:'shield_wall:1',desc:'铁壁防御，本行+1护甲'},
{id:120,name:'伏兵',faction:'xiwei',strength:2,row:'infantry',ability:'ambush_trap:1',desc:'设伏，对手出牌时消灭其1张'},
{id:121,name:'吞并',faction:'dongwei',strength:5,row:'cavalry',ability:'devour:0',desc:'吞并弱牌，获得其战力'},
{id:122,name:'招魂',faction:'beiwei',strength:3,row:'strategy',ability:'revive:0',desc:'招魂复生，从墓地回收最强牌'},
{id:123,name:'单挑',faction:'song',strength:6,row:'infantry',ability:'duel:0',desc:'决斗，与对手最强牌互换战力'},
{id:124,name:'招降',faction:'beizhou',strength:4,row:'strategy',ability:'transform:0',desc:'招降纳叛，转化对手一张牌'},
{id:125,name:'法阵',faction:'chen',strength:2,row:'navy',ability:'barrier:1',desc:'八卦法阵，免疫负面效果'},
{id:126,name:'悬赏',faction:'beiqi',strength:3,row:'cavalry',ability:'bounty:2',desc:'悬赏追杀，消灭目标得2粮草'}
];

const LEADERS_DATA=[
{id:1,name:'宋武帝刘裕',faction:'song',ability:{type:'row_boost',row:'infantry',value:2},desc:'本局步兵战力+2',era:'南朝·宋'},
{id:2,name:'齐高帝萧道成',faction:'qi',ability:{type:'extra_draw',value:2},desc:'每局多抽2张牌',era:'南朝·齐'},
{id:3,name:'梁武帝萧衍',faction:'liang',ability:{type:'row_boost',row:'navy',value:2},desc:'本局水军战力+2',era:'南朝·梁'},
{id:4,name:'陈武帝陈霸先',faction:'chen',ability:{type:'extra_provisions',value:3},desc:'每局粮草+3',era:'南朝·陈'},
{id:5,name:'北魏太武帝拓跋焘',faction:'beiwei',ability:{type:'row_boost',row:'cavalry',value:2},desc:'本局骑兵战力+2',era:'北朝·北魏'},
{id:6,name:'东魏孝静帝元善见',faction:'dongwei',ability:{type:'opponent_discard',value:1},desc:'每局对手弃1张牌',era:'北朝·东魏'},
{id:7,name:'西魏文帝元宝炬',faction:'xiwei',ability:{type:'all_boost',value:1},desc:'本局全军战力+1',era:'北朝·西魏'},
{id:8,name:'北齐文宣帝高洋',faction:'beiqi',ability:{type:'extra_draw',value:1},desc:'每局多抽1张牌',era:'北朝·北齐'},
{id:9,name:'北周武帝宇文邕',faction:'beizhou',ability:{type:'row_boost',row:'cavalry',value:2},desc:'本局骑兵战力+2',era:'北朝·北周'}
];

let uid=0;
function makeCard(c){return{...c,uid:++uid}}
function getCardCost(s){return Math.ceil(s/3)}

window.G={
phase:'menu',round:0,scores:[0,0],
playerLeader:null,aiLeader:null,
playerDeck:[],aiDeck:[],
playerHand:[],aiHand:[],
playerBoard:{infantry:[],cavalry:[],navy:[],strategy:[]},
aiBoard:{infantry:[],cavalry:[],navy:[],strategy:[]},
provisions:[8,8],
currentTurn:'player',
playerPassed:false,aiPassed:false,
selectedCard:null,logs:[],turnCount:0,
globalBuffs:{playerArmor:0,aiArmor:0,playerUnify:0,aiUnify:0,ambushTriggered:false,playerFarm:0,aiFarm:0,playerBerserkCard:null,aiBerserkCard:null,playerBleed:0,aiBleed:0,poisonCount:{0:0,1:0},playerBarrier:0,aiBarrier:0,bountyTarget:null,bountyOwner:-1,bountyGold:0},
graveyard:[],
mulliganSelected:new Set(),
leaderAbilityUsed:[false,false]
};

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function buildDeck(faction){
  const fc=CARDS_DATA.filter(c=>c.faction===faction);
  const commonCards=CARDS_DATA.filter(c=>c.faction==='common');
  shuffle(commonCards);
  const deck=[...fc,...commonCards];
  shuffle(deck);
  return deck.map(c=>makeCard(c));
}

function applyLeaderDeckAbility(leader,deck){
  const a=leader.ability;
  if(a.type==='row_boost') deck.forEach(c=>{if(c.row===a.row)c.strength+=a.value});
  if(a.type==='all_boost') deck.forEach(c=>c.strength+=a.value);
}

function applyRoundStartAbilities(){
  applyLeaderAbilityForRound(G.playerLeader,0);
  applyLeaderAbilityForRound(G.aiLeader,1);
}

function applyLeaderAbilityForRound(leader,playerIdx){
  if(!leader)return;
  const a=leader.ability;
  if(a.type==='extra_draw') drawCards(playerIdx,a.value);
  if(a.type==='extra_provisions') G.provisions[playerIdx]+=a.value;
  if(a.type==='opponent_discard'){
    const opp=1-playerIdx;
    const h=getHand(opp);
    for(let i=0;i<a.value&&h.length>0;i++){
      const idx=Math.floor(Math.random()*h.length);
      addLog(`【${leader.name}】效果：${opp===0?'你':'AI'}弃掉了${h[idx].name}`);
      h.splice(idx,1);
    }
  }
}

function getHand(p){return p===0?G.playerHand:G.aiHand}
function getDeck(p){return p===0?G.playerDeck:G.aiDeck}
function getBoard(p){return p===0?G.playerBoard:G.aiBoard}

function drawCards(playerIdx,count){
  const hand=getHand(playerIdx);
  const deck=getDeck(playerIdx);
  for(let i=0;i<count&&hand.length<10&&deck.length>0;i++) hand.push(deck.shift());
}

function getRowPower(cards,playerIdx){
  const buffs=G.globalBuffs;
  const armor=playerIdx===0?buffs.playerArmor:buffs.aiArmor;
  const unify=playerIdx===0?buffs.playerUnify:buffs.aiUnify;
  return cards.reduce((s,c)=>s+Math.max(1,c.strength+armor+Math.floor(unify*0.5)),0);
}
function getBoardPower(board,playerIdx){return getRowPower(board.infantry,playerIdx)+getRowPower(board.cavalry,playerIdx)+getRowPower(board.navy,playerIdx)+getRowPower(board.strategy,playerIdx)}

function weakestOpponentRow(opponentBoard,oppIdx){
  const rows=['infantry','cavalry','navy','strategy'];
  let min=Infinity,wk='infantry';
  rows.forEach(r=>{const p=getRowPower(opponentBoard[r],oppIdx);if(p<min){min=p;wk=r}});
  return wk;
}

function triggerAbility(card,playerIdx){
  if(!card.ability)return;
  const[t,v]=card.ability.split(':');
  const n=parseInt(v);
  const opp=1-playerIdx;
  const myBoard=getBoard(playerIdx);
  const oppBoard=getBoard(opp);
  switch(t){
    case'draw':
      drawCards(playerIdx,n);
      addLog(`${card.name}的效果：抽${n}张牌`);
      break;
    case'discard':{
      const oppH=getHand(opp);
      for(let i=0;i<n&&oppH.length>0;i++){
        const idx=Math.floor(Math.random()*oppH.length);
        addLog(`${card.name}的效果：${opp===0?'你':'AI'}弃掉了${oppH[idx].name}`);
        oppH.splice(idx,1);
      }
      break;}
    case'boost_row':
      myBoard[card.row].forEach(c=>{if(c.uid!==card.uid)c.strength+=n});
      addLog(`${card.name}的效果：本行+${n}`);
      break;
    case'weaken_row':{
      const wk=weakestOpponentRow(oppBoard,opp);
      oppBoard[wk].forEach(c=>{
        let dmg=n;
        if(c.protectArmor>0){const absorbed=Math.min(c.protectArmor,dmg);c.protectArmor-=absorbed;dmg-=absorbed}
        if(dmg>0)c.strength=Math.max(1,c.strength-dmg);
      });
      addLog(`${card.name}的效果：${opp===0?'你':'AI'}${ROW_NAMES[wk]}行-${n}`);
      break;}
    case'gain_provisions':
      G.provisions[playerIdx]+=n;
      addLog(`${card.name}的效果：+${n}粮草`);
      break;
    case'ambush':
      if(G.turnCount===0&&!G.globalBuffs.ambushTriggered){
        myBoard.infantry.forEach(c=>c.strength+=n);
        G.globalBuffs.ambushTriggered=true;
        addLog(`${card.name}的效果：突袭！步兵行+${n}`);
      }
      break;
    case'command':{
      const cmdH=getHand(playerIdx);
      if(cmdH.length>0){
        let weakIdx=0,weakStr=Infinity;
        cmdH.forEach((c,i)=>{if(c.strength<weakStr){weakStr=c.strength;weakIdx=i}});
        const discarded=cmdH.splice(weakIdx,1)[0];
        addLog(`${card.name}的效果：弃掉了${discarded.name}（${discarded.strength}）`);
        if(cmdH.length>0){
          drawCards(playerIdx,n);
          addLog(`${card.name}的效果：抽${n}张牌`);
        }
      }
      break;}
    case'control':{
      let ctrlMaxP=-1,ctrlMaxRow='infantry';
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        const p=getRowPower(oppBoard[r],opp);
        if(p>ctrlMaxP){ctrlMaxP=p;ctrlMaxRow=r}
      });
      oppBoard[ctrlMaxRow].forEach(c=>{
        let dmg=1;
        if(c.protectArmor>0){const absorbed=Math.min(c.protectArmor,dmg);c.protectArmor-=absorbed;dmg-=absorbed}
        if(dmg>0)c.strength=Math.max(1,c.strength-dmg);
      });
      addLog(`${card.name}的效果：离间计！${opp===0?'你':'AI'}${ROW_NAMES[ctrlMaxRow]}行-1`);
      break;}
    case'skirmish':
      if(playerIdx===0) G.aiPassed=true;
      else G.playerPassed=true;
      addLog(`${card.name}的效果：${opp===0?'你':'AI'}被迫跳过`);
      break;
    case'shield':
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        myBoard[r].forEach(c=>c.strength+=n);
      });
      addLog(`${card.name}的效果：全场+${n}`);
      break;
    case'navy_boost':
      myBoard.navy.forEach(c=>{if(c.uid!==card.uid)c.strength+=n});
      addLog(`${card.name}的效果：水军行+${n}`);
      break;
    case'farm':
      if(playerIdx===0) G.globalBuffs.playerFarm=n;
      else G.globalBuffs.aiFarm=n;
      addLog(`${card.name}的效果：每回合+${n}粮草`);
      break;
    case'fortify':
      myBoard[card.row].forEach(c=>{if(c.uid!==card.uid)c.strength+=n});
      addLog(`${card.name}的效果：本行+${n}`);
      break;
    case'flex':
      addLog(`${card.name}的效果：可放入任意行`);
      break;
    case'assimilate':{
      let aMinCard=null,aMinStr=Infinity,aMinRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>{
          if(c.strength<aMinStr){aMinStr=c.strength;aMinCard=c;aMinRow=r}
        });
      });
      if(aMinCard){
        oppBoard[aMinRow]=oppBoard[aMinRow].filter(c=>c.uid!==aMinCard.uid);
        getHand(playerIdx).push(aMinCard);
        addLog(`${card.name}的效果：吸收了${opp===0?'你':'AI'}的${aMinCard.name}`);
      }
      break;}
    case'armor':
      if(playerIdx===0) G.globalBuffs.playerArmor+=n;
      else G.globalBuffs.aiArmor+=n;
      addLog(`${card.name}的效果：全军护甲+${n}`);
      break;
    case'siege':{
      let sMaxP=-1,sMaxRow='infantry';
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        const p=getRowPower(oppBoard[r],opp);
        if(p>sMaxP){sMaxP=p;sMaxRow=r}
      });
      oppBoard[sMaxRow].forEach(c=>{
        let dmg=n;
        if(c.protectArmor>0){const absorbed=Math.min(c.protectArmor,dmg);c.protectArmor-=absorbed;dmg-=absorbed}
        if(dmg>0)c.strength=Math.max(1,c.strength-dmg);
      });
      addLog(`${card.name}的效果：围城！${opp===0?'你':'AI'}${ROW_NAMES[sMaxRow]}行-${n}`);
      break;}
    case'coordinate':
      myBoard[card.row].forEach(c=>{
        if(c.uid!==card.uid&&c.faction===card.faction) c.strength+=n;
      });
      addLog(`${card.name}的效果：联防，同阵营+${n}`);
      break;
    case'ambush_card':{
      drawCards(playerIdx,1);
      const ambH=getHand(opp);
      if(ambH.length>0){
        const idx=Math.floor(Math.random()*ambH.length);
        addLog(`${card.name}的效果：${opp===0?'你':'AI'}弃掉了${ambH[idx].name}`);
        ambH.splice(idx,1);
      }
      addLog(`${card.name}的效果：抽1牌，对手弃1牌`);
      break;}
    case'berserk':
      card.strength*=2;
      if(playerIdx===0) G.globalBuffs.playerBerserkCard=card.uid;
      else G.globalBuffs.aiBerserkCard=card.uid;
      addLog(`${card.name}的效果：狂攻！战力翻倍为${card.strength}`);
      break;
    case'crit':{
      let cMaxCard=null,cMaxStr=-1,cMaxRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>{
          if(c.strength>cMaxStr){cMaxStr=c.strength;cMaxCard=c;cMaxRow=r}
        });
      });
      if(cMaxCard){
        oppBoard[cMaxRow]=oppBoard[cMaxRow].filter(c=>c.uid!==cMaxCard.uid);
        G.graveyard.push(cMaxCard);
        checkBountyOnDestroy(cMaxCard);
        addLog(`${card.name}的效果：消灭了${opp===0?'你':'AI'}的${cMaxCard.name}（${cMaxStr}）`);
      }
      break;}
    case'unify':
      if(playerIdx===0) G.globalBuffs.playerUnify+=1;
      else G.globalBuffs.aiUnify+=1;
      addLog(`${card.name}的效果：统一之力+1`);
      break;
    case'anti_south':{
      const southFactions=['song','qi','liang','chen'];
      const oppLeaderFaction=(playerIdx===0?G.aiLeader:G.playerLeader)?.faction||'';
      if(southFactions.includes(oppLeaderFaction)){
        card.strength+=n;
        addLog(`${card.name}的效果：灭${oppLeaderFaction}！战力+${n}`);
      }
      break;}
    case'combo_boost':{
      const sameFaction=Object.values(myBoard).flat().filter(c=>c.faction===card.faction);
      if(sameFaction.length>=3){
        sameFaction.forEach(c=>c.strength+=n);
        addLog(`${card.name}的效果：同阵营${sameFaction.length}张≥3，${FACTIONS[card.faction]?.name||card.faction}全体+${n}`);
      }else{
        addLog(`${card.name}的效果：同阵营仅${sameFaction.length}张，不足3张未触发`);
      }
      break;}
    case'destroy':{
      const allCards=[];
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>allCards.push({card:c,row:r}));
      });
      for(let i=0;i<n&&allCards.length>0;i++){
        const ri=Math.floor(Math.random()*allCards.length);
        const target=allCards.splice(ri,1)[0];
        if(target.card.protectArmor>0){
          target.card.protectArmor--;
          addLog(`${card.name}的效果：${target.card.name}的护甲抵消了伤害`);
          continue;
        }
        oppBoard[target.row]=oppBoard[target.row].filter(c=>c.uid!==target.card.uid);
        G.graveyard.push(target.card);
        checkBountyOnDestroy(target.card);
        addLog(`${card.name}的效果：消灭了${opp===0?'你':'AI'}的${target.card.name}`);
      }
      break;}
    case'resurrect':{
      for(let i=0;i<n&&G.graveyard.length>0;i++){
        const ri=Math.floor(Math.random()*G.graveyard.length);
        const card2=G.graveyard.splice(ri,1)[0];
        getHand(playerIdx).push(card2);
        addLog(`${card.name}的效果：从墓地回收了${card2.name}`);
      }
      break;}
    case'protect':
      card.protectArmor=(card.protectArmor||0)+n;
      addLog(`${card.name}的效果：获得${n}点护甲`);
      break;
    case'spy':{
      const oppBoard2=getBoard(opp);
      const spyRows=['infantry','cavalry','navy','strategy'];
      const spyRow=spyRows[Math.floor(Math.random()*spyRows.length)];
      const spyCard={name:'间谍',faction:'common',strength:0,row:spyRow,spy:true,uid:++uid};
      oppBoard2[spyRow].push(spyCard);
      addLog(`${card.name}的效果：在${opp===0?'你':'AI'}的${ROW_NAMES[spyRow]}行放置了1张间谍`);
      drawCards(playerIdx,2);
      addLog(`${card.name}的效果：抽2张牌`);
      break;}
    case'draw_extra':
      drawCards(playerIdx,n);
      addLog(`${card.name}的效果：额外抽${n}张牌`);
      break;
    case'bleed':
      if(playerIdx===0)G.globalBuffs.aiBleed=n;
      else G.globalBuffs.playerBleed=n;
      addLog(`${card.name}的效果：流血！对手每回合-1战力，持续${n}回合`);
      break;
    case'poison':{
      const pk=playerIdx===0?'ai':'player';
      G.globalBuffs.poisonCount[pk]=(G.globalBuffs.poisonCount[pk]||0)+1;
      addLog(`${card.name}的效果：中毒层数+1（${G.globalBuffs.poisonCount[pk]}/${n}）`);
      if(G.globalBuffs.poisonCount[pk]>=n){
        let pMaxCard=null,pMaxStr=-1,pMaxRow=null;
        ['infantry','cavalry','navy','strategy'].forEach(r=>{
          oppBoard[r].forEach(c=>{if(c.strength>pMaxStr){pMaxStr=c.strength;pMaxCard=c;pMaxRow=r}});
        });
        if(pMaxCard){
          oppBoard[pMaxRow]=oppBoard[pMaxRow].filter(c=>c.uid!==pMaxCard.uid);
          G.graveyard.push(pMaxCard);
          addLog(`${card.name}的效果：剧毒发作！消灭了${opp===0?'你':'AI'}的${pMaxCard.name}（${pMaxStr}）`);
        }
        G.globalBuffs.poisonCount[pk]=0;
      }
      break;}
    case'shield_wall':
      myBoard[card.row].forEach(c=>{c.protectArmor=(c.protectArmor||0)+n});
      addLog(`${card.name}的效果：本行全体+${n}护甲`);
      break;
    case'ambush_trap':
      if(playerIdx===0)G.globalBuffs.aiAmbushTrap=(G.globalBuffs.aiAmbushTrap||0)+n;
      else G.globalBuffs.playerAmbushTrap=(G.globalBuffs.playerAmbushTrap||0)+n;
      addLog(`${card.name}的效果：设伏！对手出牌时消灭其${n}张`);
      break;
    case'devour':{
      let dMinCard=null,dMinStr=Infinity,dMinRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        myBoard[r].forEach(c=>{if(c.uid!==card.uid&&c.strength<dMinStr){dMinStr=c.strength;dMinCard=c;dMinRow=r}});
      });
      if(dMinCard){
        myBoard[dMinRow]=myBoard[dMinRow].filter(c=>c.uid!==dMinCard.uid);
        G.graveyard.push(dMinCard);
        card.strength+=dMinCard.strength;
        addLog(`${card.name}的效果：吞并了${dMinCard.name}（${dMinCard.strength}），战力升至${card.strength}`);
      }else{
        addLog(`${card.name}的效果：没有可吞并的牌`);
      }
      break;}
    case'revive':{
      if(G.graveyard.length>0){
        let rMaxCard=null,rMaxStr=-1;
        G.graveyard.forEach(c=>{if(c.strength>rMaxStr){rMaxStr=c.strength;rMaxCard=c}});
        if(rMaxCard){
          G.graveyard=G.graveyard.filter(c=>c.uid!==rMaxCard.uid);
          getHand(playerIdx).push(rMaxCard);
          addLog(`${card.name}的效果：从墓地回收了${rMaxCard.name}（${rMaxStr}）`);
        }
      }else{
        addLog(`${card.name}的效果：墓地为空`);
      }
      break;}
    case'duel':{
      let duMaxCard=null,duMaxStr=-1,duMaxRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>{if(c.strength>duMaxStr){duMaxStr=c.strength;duMaxCard=c;duMaxRow=r}});
      });
      if(duMaxCard){
        const dmg1=Math.min(card.strength,duMaxStr);
        card.strength=Math.max(1,card.strength-duMaxStr);
        duMaxCard.strength=Math.max(1,duMaxCard.strength-dmg1);
        addLog(`${card.name}的效果：决斗！${card.name}(${card.strength}) vs ${duMaxCard.name}(${duMaxCard.strength})`);
      }
      break;}
    case'transform':{
      let tMinCard=null,tMinStr=Infinity,tMinRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>{if(c.strength<tMinStr){tMinStr=c.strength;tMinCard=c;tMinRow=r}});
      });
      if(tMinCard){
        oppBoard[tMinRow]=oppBoard[tMinRow].filter(c=>c.uid!==tMinCard.uid);
        tMinCard.faction=card.faction;
        myBoard[card.row].push(tMinCard);
        addLog(`${card.name}的效果：招降了${opp===0?'你':'AI'}的${tMinCard.name}（${tMinStr}）`);
      }
      break;}
    case'barrier':
      if(playerIdx===0)G.globalBuffs.playerBarrier+=n;
      else G.globalBuffs.aiBarrier+=n;
      addLog(`${card.name}的效果：法阵开启，免疫负面效果${n}回合`);
      break;
    case'bounty':{
      let boMaxCard=null,boMaxStr=-1,boMaxRow=null;
      ['infantry','cavalry','navy','strategy'].forEach(r=>{
        oppBoard[r].forEach(c=>{if(c.strength>boMaxStr){boMaxStr=c.strength;boMaxCard=c;boMaxRow=r}});
      });
      if(boMaxCard){
        G.globalBuffs.bountyTarget=boMaxCard.uid;
        G.globalBuffs.bountyOwner=playerIdx;
        G.globalBuffs.bountyGold=n;
        addLog(`${card.name}的效果：悬赏了${opp===0?'你':'AI'}的${boMaxCard.name}，消灭得${n}粮草`);
      }
      break;}
  }
}


function processBleed(targetIdx){
  const bleedVal=targetIdx===0?G.globalBuffs.playerBleed:G.globalBuffs.aiBleed;
  if(bleedVal<=0)return;
  const board=getBoard(targetIdx);
  const name=targetIdx===0?'你':'AI';
  ['infantry','cavalry','navy','strategy'].forEach(r=>{
    board[r].forEach(c=>{
      let dmg=1;
      if(c.protectArmor>0){const absorbed=Math.min(c.protectArmor,dmg);c.protectArmor-=absorbed;dmg-=absorbed}
      if(dmg>0)c.strength=Math.max(1,c.strength-dmg);
    });
  });
  if(targetIdx===0)G.globalBuffs.playerBleed--;
  else G.globalBuffs.aiBleed--;
  addLog(`【流血】${name}全体-1战力（剩余${targetIdx===0?G.globalBuffs.playerBleed:G.globalBuffs.aiBleed}回合）`);
}

function processAmbushTrap(attackerIdx){
  const trapKey=attackerIdx===0?'aiAmbushTrap':'playerAmbushTrap';
  const trapVal=G.globalBuffs[trapKey]||0;
  if(trapVal<=0)return;
  const board=getBoard(attackerIdx);
  const name=attackerIdx===0?'你':'AI';
  for(let i=0;i<trapVal;i++){
    const allCards=[];
    ['infantry','cavalry','navy','strategy'].forEach(r=>{
      board[r].forEach(c=>allCards.push({card:c,row:r}));
    });
    if(allCards.length===0)break;
    const ri=Math.floor(Math.random()*allCards.length);
    const target=allCards[ri];
    if(target.card.protectArmor>0){target.card.protectArmor--;continue}
    board[target.row]=board[target.row].filter(c=>c.uid!==target.card.uid);
    G.graveyard.push(target.card);
    addLog(`【伏兵】消灭了${name}的${target.card.name}`);
  }
  G.globalBuffs[trapKey]=0;
}

function checkBountyOnDestroy(card){
  if(G.globalBuffs.bountyTarget!=null&&card.uid===G.globalBuffs.bountyTarget){
    const owner=G.globalBuffs.bountyOwner;
    G.provisions[owner]+=G.globalBuffs.bountyGold;
    addLog(`【赏金】${owner===0?'你':'AI'}获得${G.globalBuffs.bountyGold}粮草`);
    G.globalBuffs.bountyTarget=null;
    G.globalBuffs.bountyOwner=-1;
    G.globalBuffs.bountyGold=0;
  }
}

function checkBarrier(playerIdx){
  const key=playerIdx===0?'playerBarrier':'aiBarrier';
  if(G.globalBuffs[key]>0){
    G.globalBuffs[key]--;
    return true;
  }
  return false;
}

function showSkillEffect(text, rowType, playerIdx) {
  const battlefield = document.querySelector('.battlefield');
  if (!battlefield) return;
  const el = document.createElement('div');
  el.className = 'skill-effect-text';
  el.textContent = text;
  const prefix = playerIdx === 0 ? 'player-rows' : 'ai-rows';
  const rowsSection = battlefield.querySelector('.' + prefix);
  if (rowsSection) {
    const rowLabels = rowsSection.querySelectorAll('.row');
    const rowMap = { infantry: 2, cavalry: 1, navy: 0, strategy: 3 };
    const rowIdx = rowMap[rowType] || 0;
    const targetRow = rowLabels[rowIdx];
    if (targetRow) {
      const rect = targetRow.getBoundingClientRect();
      const battlefieldRect = battlefield.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.left = (rect.left - battlefieldRect.left + rect.width / 2 - 60) + 'px';
      el.style.top = (rect.top - battlefieldRect.top - 30) + 'px';
    }
  }
  el.style.zIndex = '200';
  el.style.pointerEvents = 'none';
  battlefield.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

/* T23 水墨特效粒子函数 */
function createBuffParticles(el,value){
  if(!el)return;
  const rect=el.getBoundingClientRect();
  /* buff数字 */
  const floater=document.createElement('div');
  floater.className='buff-float';
  floater.textContent=(value>0?'+':'')+value;
  if(value<0){
    floater.style.background='linear-gradient(180deg,#FF6B6B,#E53935,#C62828)';
    floater.style.backgroundClip='text';floater.style.webkitBackgroundClip='text';floater.style.webkitTextFillColor='transparent';
    floater.style.filter='drop-shadow(0 0 8px rgba(229,57,53,.9)) drop-shadow(0 0 16px rgba(198,40,40,.6)) drop-shadow(0 2px 4px rgba(0,0,0,.3))';
  }
  el.appendChild(floater);
  setTimeout(()=>floater.remove(),1600);
  /* 墨色圆形渐变背景 */
  const bgEl=document.createElement('div');
  bgEl.className='buff-float-bg';
  el.appendChild(bgEl);
  setTimeout(()=>bgEl.remove(),1600);
  /* 金色墨点飞溅 */
  for(let i=0;i<16;i++){
    const p=document.createElement('div');
    p.className='gold-particle';
    const angle=(Math.PI*2*i)/16+Math.random()*.5;
    const dist=40+Math.random()*60;
    p.style.setProperty('--dx',Math.cos(angle)*dist+'px');
    p.style.setProperty('--dy',Math.sin(angle)*dist+'px');
    p.style.left='50%';p.style.top='50%';
    p.style.width=(4+Math.random()*6)+'px';
    p.style.height=p.style.width;
    el.appendChild(p);
    setTimeout(()=>p.remove(),1100);
  }
  /* 墨色涟漪 */
  const ripple=document.createElement('div');
  ripple.className='ink-ripple gold';
  el.appendChild(ripple);
  setTimeout(()=>ripple.remove(),900);
  /* 卡牌发光 */
  el.style.animation='cardInkBurst 0.8s ease-out';
  setTimeout(()=>el.style.animation='',900);
}

function createDestroyParticles(el){
  if(!el)return;
  el.classList.add('card-destroy');
  /* 墨迹碎块飞散 */
  for(let i=0;i<12;i++){
    const shard=document.createElement('div');
    shard.className='ink-shard';
    const angle=(Math.PI*2*i)/12+Math.random()*.4;
    const dist=60+Math.random()*60;
    shard.style.setProperty('--sx',Math.cos(angle)*dist+'px');
    shard.style.setProperty('--sy',Math.sin(angle)*dist+'px');
    shard.style.setProperty('--sr',(Math.random()*360)+'deg');
    shard.style.left='50%';shard.style.top='50%';
    el.appendChild(shard);
    setTimeout(()=>shard.remove(),800);
  }
  /* 墨滴飞溅 */
  for(let i=0;i<20;i++){
    const drop=document.createElement('div');
    drop.className='ink-particle'+(Math.random()>.4?' red':'');
    const angle=Math.random()*Math.PI*2;
    const dist=30+Math.random()*80;
    drop.style.setProperty('--sx',Math.cos(angle)*dist+'px');
    drop.style.setProperty('--sy',Math.sin(angle)*dist+'px');
    drop.style.left='50%';drop.style.top='50%';
    drop.style.width=(2+Math.random()*5)+'px';
    drop.style.height=drop.style.width;
    el.appendChild(drop);
    setTimeout(()=>drop.remove(),1000);
  }
  /* 墨渍扩散 */
  const blot=document.createElement('div');
  blot.style.cssText='position:absolute;top:50%;left:50%;width:80px;height:80px;margin:-40px 0 0 -40px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(44,44,44,.45) 0%,rgba(139,105,20,.2) 50%,transparent 70%);animation:inkBlotSpread 0.9s ease-out forwards;z-index:100';
  el.appendChild(blot);
  setTimeout(()=>blot.remove(),1000);
}

function createDestroyParticlesByUid(uid){
  const els=document.querySelectorAll('.card-mini');
  for(const el of els){
    if(el.dataset.uid==uid){
      createDestroyParticles(el);
      return;
    }
  }
}

/* T24 技能文字在战场中显示 */
function showSkillTextInBattlefield(text,type){
  const battlefield=document.querySelector('.battlefield');
  if(!battlefield)return;
  const container=document.createElement('div');
  container.className='skill-text-container';
  const span=document.createElement('div');
  span.className='skill-text-ink '+(type||'neutral');
  span.textContent=text;
  container.appendChild(span);
  /* 墨滴装饰 */
  const drip=document.createElement('div');
  drip.className='skill-text-drip';
  container.appendChild(drip);
  battlefield.appendChild(container);
  setTimeout(()=>container.remove(),2000);
}

/* T24 增强技能触发特效 */
function triggerAbilityWithFlash(card,playerIdx,row){
  const opp=1-playerIdx;
  const oppBoard=getBoard(opp);
  const oppBefore=Object.entries(oppBoard).flatMap(([r,cards])=>cards.map(c=>c.uid));
  const myBoard=getBoard(playerIdx);
  const myBefore=Object.entries(myBoard).flatMap(([r,cards])=>cards.map(c=>({uid:c.uid,row:r})));
  triggerAbility(card,playerIdx);
  const oppAfter=new Set(Object.values(oppBoard).flat().map(c=>c.uid));
  const destroyedUids=oppBefore.filter(uid=>!oppAfter.has(uid));
  const board=getBoard(playerIdx);
  const cards=board[row];
  const lastCard=cards[cards.length-1];
  setTimeout(()=>{
    /* T23 已出卡牌闪光 */
    if(lastCard){
      const els=document.querySelectorAll('.card-mini');
      for(const el of els){
        const nameEl=el.querySelector('.c-name');
        if(nameEl&&nameEl.textContent===card.name){
          el.classList.add('skill-flash');
          setTimeout(()=>el.classList.remove('skill-flash'),700);
          break;
        }
      }
    }
    /* T23 销毁卡牌动画 */
    destroyedUids.forEach(uid=>{
      createDestroyParticlesByUid(uid);
    });
    /* T23 增益动画 - 找到本行所有被buff的卡牌 */
    if(card.ability){
      const[t,v]=card.ability.split(':');
      const n=parseInt(v)||0;
      const boostTypes=['boost_row','shield','navy_boost','fortify','armor','coordinate','combo_boost','weaken_row','siege','control'];
      if(boostTypes.includes(t)){
        setTimeout(()=>{
          const els=document.querySelectorAll('.card-mini');
          els.forEach(el=>{
            const uid=parseInt(el.dataset.uid);
            const myCards=myBoard[row]||[];
            if(myCards.some(c=>c.uid===uid&&c.uid!==card.uid)){
              createBuffParticles(el,n);
            }
          });
        },100);
      }
      if(t==='weaken_row'||t==='siege'||t==='control'){
        setTimeout(()=>{
          const els=document.querySelectorAll('.card-mini');
          els.forEach(el=>{
            const uid=parseInt(el.dataset.uid);
            const oppCards=Object.values(oppBoard).flat();
            if(oppCards.some(c=>c.uid===uid)){
              createBuffParticles(el,-n);
            }
          });
        },100);
      }
      /* 技能效果浮动文字 */
      const effectText = t === 'boost_row' ? '本行+' + n
        : t === 'weaken_row' ? '对手行-' + n
        : t === 'discard' ? '弃对手' + n + '张'
        : t === 'destroy' ? '消灭对手' + n + '张'
        : t === 'draw' ? '抽' + n + '张'
        : t === 'shield' ? '全场+' + n
        : t === 'siege' ? '围城-' + n
        : t === 'shield_wall' ? '护甲+' + n
        : t === 'armor' ? '全军护甲+' + n
        : t === 'draw_extra' ? '额外抽' + n + '张'
        : t === 'bleed' ? '流血' + n + '回合'
        : t === 'poison' ? '中毒'
        : t === 'revive' ? '复活'
        : t === 'duel' ? '决斗'
        : t === 'transform' ? '招降'
        : t === 'barrier' ? '八卦法阵'
        : t === 'bounty' ? '悬赏'
        : t === 'spy' ? '间谍'
        : t === 'ambush' ? '突袭!' + n
        : t === 'command' ? '军令'
        : t === 'control' ? '离间计'
        : t === 'skirmish' ? '跳过回合'
        : t === 'navy_boost' ? '水军+' + n
        : t === 'farm' ? '屯田+' + n
        : t === 'fortify' ? '本行+' + n
        : t === 'flex' ? '灵活部署'
        : t === 'assimilate' ? '吸收'
        : t === 'coordinate' ? '联防+' + n
        : t === 'ambush_card' ? '伏兵'
        : t === 'berserk' ? '狂攻!'
        : t === 'crit' ? '暴击!'
        : t === 'unify' ? '统一之力'
        : t === 'anti_south' ? '灭南+' + n
        : t === 'combo_boost' ? '连携+' + n
        : t === 'resurrect' ? '回收'
        : t === 'protect' ? '护盾+' + n
        : t === 'devour' ? '吞并'
        : t === 'shoot_wall' ? '铁壁'
        : null;
      if (effectText) {
        showSkillEffect(effectText, row, playerIdx);
        if (effectText) {
          let stype = 'neutral';
          const negSkills = ['weaken_row','discard','destroy','siege','control','skirmish','bleed','poison'];
          const posSkills = ['boost_row','shield','armor','navy_boost','fortify','shield_wall','combo_boost','coordinate','ambush','resurrect','protect','farm','gain_provisions','draw','draw_extra'];
          if (negSkills.includes(t)) stype = 'negative';
          else if (posSkills.includes(t)) stype = 'positive';
          showSkillTextInBattlefield(effectText, stype);
        }
      }
    }
  },50);
}

function playCard(playerIdx,handIdx,row){
  const hand=getHand(playerIdx);
  const card=hand.splice(handIdx,1)[0];

  const berserkKey=playerIdx===0?'playerBerserkCard':'aiBerserkCard';
  const berserkUid=G.globalBuffs[berserkKey];
  if(berserkUid!=null){
    const board=getBoard(playerIdx);
    for(const r of ['infantry','cavalry','navy','strategy']){
      const bCard=board[r].find(c=>c.uid===berserkUid);
      if(bCard){
        bCard.strength=Math.max(1,bCard.strength-2);
        addLog(`${bCard.name} 狂攻反噬，战力-2`);
        break;
      }
    }
    G.globalBuffs[berserkKey]=null;
  }

  const board=getBoard(playerIdx);
  board[row].push(card);
  G.provisions[playerIdx]-=getCardCost(card.strength);
  G._lastPlayedUid=card.uid;
  G._lastPlayedBy=playerIdx;
  const name=playerIdx===0?'你':'AI';
  addLog(`${name}打出了 ${card.name}（${ROW_NAMES[row]} ${card.strength}）`);
  if(playerIdx===1){
    setTimeout(()=>{
      triggerAbilityWithFlash(card,playerIdx,row);
      processAmbushTrap(playerIdx);
    },650);
  }else{
    triggerAbilityWithFlash(card,playerIdx,row);
    processAmbushTrap(playerIdx);
  }
}

function startRound(){
  G.round++;
  G.playerPassed=false;
  G.aiPassed=false;
  G.selectedCard=null;
  G.turnCount=0;
  G.provisions=[8,8];
  G.playerBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.aiBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.globalBuffs={playerArmor:0,aiArmor:0,playerUnify:0,aiUnify:0,ambushTriggered:false,playerFarm:0,aiFarm:0,playerBerserkCard:null,aiBerserkCard:null,playerBleed:0,aiBleed:0,poisonCount:{0:0,1:0},playerBarrier:0,aiBarrier:0,bountyTarget:null,bountyOwner:-1,bountyGold:0};
  G.graveyard=[];
  G.logs=[];
  // 第1局不自动抽牌（换牌阶段已经处理）
  const drawCount=G.round<=1?0:4;
  if(drawCount>0){
    drawCards(0,drawCount);
    drawCards(1,drawCount);
  }
  applyRoundStartAbilities();
  G.currentTurn='player';
  addLog(`═══ 第${G.round}局开始 ═══`);
  if(drawCount>0) addLog(`双方各抽${drawCount}张牌`);
  render();
}

function playerPlayCard(handIdx,row){
  if(G.phase!=='playing'||G.currentTurn!=='player'||G.playerPassed)return;
  const card=G.playerHand[handIdx];
  if(getCardCost(card.strength)>G.provisions[0])return;
  playCard(0,handIdx,row);
  G.selectedCard=null;
  G.turnCount++;
  afterPlayerTurn();
}

function playerPass(){
  if(G.phase!=='playing'||G.currentTurn!=='player'||G.playerPassed)return;
  G.playerPassed=true;
  G.selectedCard=null;
  addLog('你放弃了本局');
  if(G.aiPassed){endRound();return}
  G.currentTurn='ai';
  render();
  setTimeout(aiTurn,800);
}

function afterPlayerTurn(){
  // 如果玩家没有可出的牌，自动Pass
  if(!hasPlayableCard(0)){
    addLog('你没有可出的牌了');
    G.playerPassed=true;
    G.selectedCard=null;
    if(G.aiPassed){endRound();return}
    G.currentTurn='ai';
    render();
    setTimeout(aiTurn,600);
    return;
  }
  if(G.aiPassed){
    if(G.playerPassed){
      endRound();return;
    }
    G.currentTurn='player';
    render();
    return;
  }
  G.currentTurn='ai';
  if(G.globalBuffs.aiFarm>0){
    G.provisions[1]+=G.globalBuffs.aiFarm;
    addLog(`AI获得${G.globalBuffs.aiFarm}粮草（屯田）`);
  }
  processBleed(1);
  render();
  setTimeout(aiTurn,600);
}

function hasPlayableCard(p){
  const hand=getHand(p);
  const prov=G.provisions[p];
  return hand.some(c=>getCardCost(c.strength)<=prov);
}

function aiTurn(){
  if(G.phase!=='playing')return;
  if(G.aiPassed){
    if(G.playerPassed){endRound();return}
    G.currentTurn='player';
    render();
    return;
  }
  if(!hasPlayableCard(1)){
    G.aiPassed=true;
    addLog('AI无牌可出，放弃了');
    if(G.playerPassed){endRound();return}
    G.currentTurn='player';
    render();return;
  }
  if(G.leaderAbilityUsed[1]===false&&Math.random()<0.4){
    useLeaderAbility(1);
    render();
  }
  if(aiShouldPass()){
    G.aiPassed=true;
    addLog('AI放弃了本局');
    if(G.playerPassed){endRound();return}
    G.currentTurn='player';
    render();return;
  }
  const choice=aiChooseCard();
  if(!choice){G.aiPassed=true;addLog('AI放弃了');if(G.playerPassed){endRound();return}G.currentTurn='player';render();return}
  setTimeout(()=>{
    playCard(1,choice.handIdx,choice.row);
    G.turnCount++;
    if(G.playerPassed){endRound();return}
    G.currentTurn='player';
    if(G.globalBuffs.playerFarm>0){
      G.provisions[0]+=G.globalBuffs.playerFarm;
      addLog(`你获得${G.globalBuffs.playerFarm}粮草（屯田）`);
    }
    processBleed(0);
    render();
    setTimeout(()=>render(),750);
  },600);
}

function aiShouldPass(){
  if(G.turnCount<3)return false;
  const aiP=getBoardPower(G.aiBoard,1);
  const plP=getBoardPower(G.playerBoard,0);
  // 只有当AI无牌可出时才Pass
  if(!hasPlayableCard(1))return true;
  return false;
}

function aiChooseCard(){
  const hand=G.aiHand;
  const prov=G.provisions[1];
  const playable=hand.map((c,i)=>({card:c,idx:i})).filter(x=>getCardCost(x.card.strength)<=prov);
  if(!playable.length)return null;
  const aiP=getBoardPower(G.aiBoard,1);
  const plP=getBoardPower(G.playerBoard,0);
  let best=null,bestScore=-9999;
  for(const{card,idx}of playable){
    let score=card.strength;
    const rp={infantry:getRowPower(G.aiBoard.infantry,1),cavalry:getRowPower(G.aiBoard.cavalry,1),navy:getRowPower(G.aiBoard.navy,1),strategy:getRowPower(G.aiBoard.strategy,1)};
    const minR=Object.keys(rp).reduce((a,b)=>rp[a]<rp[b]?a:b);
    let targetRow=card.row;
    if(card.row===minR)score+=4;
    if(card.ability){
      const[t]=card.ability.split(':');
      if(t==='ambush')score+=(G.turnCount===0?5:0);
      if(t==='command')score+=3;
      if(t==='control')score+=5;
      if(t==='skirmish')score+=4;
      if(t==='shield')score+=4;
      if(t==='navy_boost')score+=3;
      if(t==='farm')score+=3;
      if(t==='fortify')score+=3;
      if(t==='flex'){score+=2;targetRow=minR}
      if(t==='assimilate')score+=5;
      if(t==='armor')score+=4;
      if(t==='siege')score+=4;
      if(t==='coordinate')score+=3;
      if(t==='ambush_card')score+=3;
      if(t==='berserk')score+=(aiP<plP?5:2);
      if(t==='crit')score+=6;
      if(t==='unify')score+=3;
      if(t==='anti_south'){
        const oppFaction=G.playerLeader?G.playerLeader.faction:'';
        if(['song','qi','liang','chen'].includes(oppFaction))score+=4;
      }
      if(t==='boost_row')score+=3;
      if(t==='weaken_row')score+=4;
      if(t==='discard')score+=3;
      if(t==='draw')score+=2;
      if(t==='gain_provisions')score+=1;
      if(t==='combo_boost')score+=3;
      if(t==='destroy')score+=5;
      if(t==='resurrect')score+=4;
      if(t==='protect')score+=3;
      if(t==='spy')score+=5;
      if(t==='draw_extra')score+=3;
      if(t==='bleed')score+=4;
      if(t==='poison')score+=5;
      if(t==='shield_wall')score+=3;
      if(t==='ambush_trap')score+=4;
      if(t==='devour')score+=4;
      if(t==='revive')score+=4;
      if(t==='duel')score+=5;
      if(t==='transform')score+=5;
      if(t==='barrier')score+=3;
      if(t==='bounty')score+=4;
    }
    if(aiP<plP)score+=card.strength*0.5;
    score+=Math.random()*2;
    if(score>bestScore){bestScore=score;best={handIdx:idx,row:targetRow}}
  }
  return best;
}

function endRound(){
  const pP=getBoardPower(G.playerBoard,0);
  const aP=getBoardPower(G.aiBoard,1);
  let winner;
  if(pP>aP){winner=0;G.scores[0]++}
  else if(aP>pP){winner=1;G.scores[1]++}
  else{winner=-1}
  const winText=winner===0?'你赢了本局！':winner===1?'AI赢了本局！':'本局平局！';
  addLog(`═══ 第${G.round}局结束 ═══`);
  addLog(`你的战力：${pP} vs AI战力：${aP} → ${winText}`);
  G.phase='round_result';
  G._roundResult={playerPower:pP,aiPower:aP,winner};
  render();
  showNotification(winText);
}

function checkGameEnd(){
  if(G.scores[0]>=2||G.scores[1]>=2||G.round>=3){
    G.phase='game_result';
    render();
    const winText=G.scores[0]>G.scores[1]?'你赢得了天下！':'AI赢得了天下！';
    showNotification(winText,3000);
  }else{
    G.phase='playing';
    setTimeout(startRound,1500);
  }
}

function nextRoundOrGame(){
  checkGameEnd();
}

function addLog(msg){G.logs.push(msg);if(G.logs.length>50)G.logs.shift()}

function showNotification(text,dur=2500){
  const el=document.createElement('div');
  el.className='notification';
  el.textContent=text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),dur+500);
}

function render(){
  const app=document.getElementById('app');
  const lastUid=G._lastPlayedUid;
  const lastBy=G._lastPlayedBy;
  G._lastPlayedUid=null;
  G._lastPlayedBy=null;
  switch(G.phase){
    case'menu':renderMenu(app);break;
    case'tutorial':renderTutorial(app);break;
    case'leader_select':renderLeaderSelect(app);break;
    case'mulligan':renderMulligan(app);break;
    case'playing':renderGame(app,lastUid,lastBy);break;
    case'round_result':renderRoundResult(app);break;
    case'game_result':renderGameResult(app);break;
  }
}

function drawCoverCanvas(){
  try{
    var c=document.getElementById('coverCanvas');
    if(!c)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var rect=c.getBoundingClientRect();
    if(rect.width===0||rect.height===0)return;
    c.width=rect.width*dpr;
    c.height=rect.height*dpr;
    var ctx=c.getContext('2d');
    ctx.scale(dpr,dpr);
    var W=rect.width,H=rect.height;
    // 天空
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#6b7a8a');
    sky.addColorStop(0.35,'#8a9aa8');
    sky.addColorStop(0.7,'#a09888');
    sky.addColorStop(1,'#5a4a3a');
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,W,H);
    // 远山
    function drawMountain(baseY,h,color,opacity){
      ctx.globalAlpha=opacity;
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.moveTo(0,H);
      var step=W/6;
      for(var x=0;x<=W;x+=step){
        var y=baseY-Math.abs(Math.sin(x/W*Math.PI*2+h))*h;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha=1;
    }
    drawMountain(H*0.5,H*0.16,'#7a8a9a',0.3);
    drawMountain(H*0.55,H*0.13,'#5a6a7a',0.4);
    drawMountain(H*0.62,H*0.1,'#3a4a5a',0.55);
    // 城墙
    var wallY=H*0.64;
    ctx.fillStyle='#3a3530';
    ctx.globalAlpha=0.9;
    ctx.fillRect(W*0.1,wallY,W*0.8,H*0.22);
    ctx.globalAlpha=1;
    // 垛口
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=2;
    ctx.beginPath();
    var cw=W*0.8/20;
    for(var i=0;i<20;i++){
      var x=W*0.1+i*cw;
      ctx.moveTo(x,wallY);
      ctx.lineTo(x+cw/2,wallY-H*0.035);
      ctx.lineTo(x+cw,wallY);
    }
    ctx.stroke();
    // 城楼
    var tx=W*0.42,ty=wallY-H*0.1,tw=W*0.16,th=H*0.13;
    ctx.fillStyle='#2a2520';
    ctx.fillRect(tx,ty,tw,th);
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=1.5;
    ctx.strokeRect(tx,ty,tw,th);
    ctx.beginPath();
    ctx.moveTo(tx-12,ty);
    ctx.quadraticCurveTo(tx+tw/2,ty-22,tx+tw+12,ty);
    ctx.quadraticCurveTo(tx+tw/2,ty-6,tx-12,ty);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle='#1a1510';
    ctx.fillRect(tx+tw*0.35,ty+th*0.25,tw*0.3,th*0.35);
    ctx.fillStyle='#8a7a60';
    ctx.font='bold '+(Math.max(10,W*0.015))+'px "Noto Serif SC","STKaiti",serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('天 下',tx+tw/2,ty+th*0.45);
    // 城门
    ctx.fillStyle='#1a1510';
    ctx.beginPath();
    ctx.moveTo(tx+tw*0.15,wallY);
    ctx.lineTo(tx+tw*0.15,wallY+H*0.1);
    ctx.quadraticCurveTo(tx+tw*0.5,wallY+H*0.14,tx+tw*0.85,wallY+H*0.1);
    ctx.lineTo(tx+tw*0.85,wallY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle='#6b6560';
    ctx.lineWidth=2;
    ctx.stroke();
    // 烽火
    function drawBeacon(bx,by,sc){
      var r=Math.max(14,W*0.016)*sc;
      var g=ctx.createRadialGradient(bx,by,0,bx,by,r*2);
      g.addColorStop(0,'rgba(255,140,60,0.85)');
      g.addColorStop(0.35,'rgba(255,100,30,0.45)');
      g.addColorStop(0.7,'rgba(200,60,20,0.12)');
      g.addColorStop(1,'rgba(139,0,0,0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.arc(bx,by,r*2,0,Math.PI*2);
      ctx.fill();
    }
    drawBeacon(W*0.1,H*0.44,1);
    drawBeacon(W*0.9,H*0.44,0.9);
    // 旌旗
    function drawFlag(fx,fy,dir,sz){
      ctx.strokeStyle='#3a3530';
      ctx.lineWidth=2*sz;
      ctx.beginPath();
      ctx.moveTo(fx,fy);
      ctx.lineTo(fx,fy+H*0.2*sz);
      ctx.stroke();
      ctx.fillStyle='#a82a32';
      ctx.beginPath();
      ctx.moveTo(fx,fy+3*sz);
      ctx.bezierCurveTo(fx+dir*40*sz,fy-2*sz,fx+dir*75*sz,fy+12*sz,fx+dir*90*sz,fy+18*sz);
      ctx.bezierCurveTo(fx+dir*60*sz,fy+28*sz,fx+dir*25*sz,fy+32*sz,fx,fy+26*sz);
      ctx.closePath();
      ctx.fill();
    }
    drawFlag(W*0.13,H*0.36,1,1);
    drawFlag(W*0.87,H*0.35,-1,1);
    // 中旗
    ctx.strokeStyle='#4a4540';
    ctx.lineWidth=3.5;
    ctx.beginPath();
    ctx.moveTo(W*0.5,H*0.32);
    ctx.lineTo(W*0.5,H*0.5);
    ctx.stroke();
    ctx.fillStyle='#a82a32';
    ctx.beginPath();
    ctx.moveTo(W*0.5,H*0.34);
    ctx.bezierCurveTo(W*0.5+W*0.07,H*0.31,W*0.5+W*0.1,H*0.37,W*0.5+W*0.12,H*0.4);
    ctx.bezierCurveTo(W*0.5+W*0.09,H*0.46,W*0.5+W*0.04,H*0.48,W*0.5,H*0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#1a1410';
    ctx.font='bold '+(Math.max(14,W*0.022))+'px "Noto Serif SC","STKaiti",serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('征',W*0.5+W*0.06,H*0.4);
    // 烟雾
    function smoke(sx,sy,sr,col,op){
      var g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr);
      g.addColorStop(0,col);
      g.addColorStop(1,'rgba(26,20,16,0)');
      ctx.globalAlpha=op;
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.arc(sx,sy,sr,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    }
    smoke(W*0.3,H*0.72,Math.max(70,W*0.09),'rgba(180,170,160,0.45)',0.3);
    smoke(W*0.6,H*0.74,Math.max(85,W*0.11),'rgba(160,150,140,0.4)',0.28);
    smoke(W*0.8,H*0.7,Math.max(60,W*0.08),'rgba(150,140,130,0.35)',0.25);
    // 前景士兵
    ctx.fillStyle='#0f0d0b';
    ctx.beginPath();
    ctx.arc(W*0.06,H*0.91,Math.max(12,W*0.016),0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(W*0.06-6,H*0.91,Math.max(12,W*0.016),H*0.07);
    ctx.beginPath();
    ctx.arc(W*0.94,H*0.91,Math.max(11,W*0.015),0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(W*0.94-5,H*0.91,Math.max(11,W*0.015),H*0.07);
    // 暗角
    var vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,Math.max(W,H)*0.7);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(1,'rgba(0,0,0,0.4)');
    ctx.fillStyle=vig;
    ctx.fillRect(0,0,W,H);
  }catch(e){}
}

function renderMenu(el){
  el.innerHTML=`
  <div class="menu-screen">
    <div class="menu-battlefield">
      <img src="assets/cover-battlefield.png" style="width:100%;height:100%;object-fit:cover;opacity:0.95" alt="战场背景">
    </div>

    <div class="poetry-container">
      <div class="poetry-col poetry-col-left">
        <div class="poetry-line">余 霞 散 成 绮</div>
        <div class="poetry-line">池 塘 生 春 草</div>
        <div class="poetry-line">大 江 流 日 夜</div>
        <div class="poetry-line">蝉 噪 林 逾 静</div>
        <div class="poetry-line">泻 水 置 平 地</div>
      </div>
      <div class="poetry-col poetry-col-right">
        <div class="poetry-line">澄 江 静 如 练</div>
        <div class="poetry-line">园 柳 变 鸣 禽</div>
        <div class="poetry-line">客 心 悲 未 央</div>
        <div class="poetry-line">鸟 鸣 山 更 幽</div>
        <div class="poetry-line">各 自 东 西 南 北 流</div>
      </div>
    </div>
    <div class="menu-seal">天下<br>对弈</div>
    <div class="menu-title">南北朝·天下对弈</div>
    <div class="menu-subtitle">— 卡 牌 对 战 —</div>
    <div class="decorative-line" style="width:200px"></div>
    <p style="color:#8B7050;margin:16px 0 28px;font-size:.9em;letter-spacing:2px;line-height:1.8">
      四行布阵·三局两胜<br>运筹帷幄·决胜千里
    </p>
    <button class="btn btn-primary" onclick="G.phase='tutorial';render()">开 始 游 戏</button>
    <div style="margin-top:40px;color:#6B5B47;font-size:.75em;letter-spacing:1px">
      昆特牌风格 · 南北朝历史题材
    </div>
  </div>`;
  setTimeout(drawCoverCanvas, 0);
}

function renderTutorial(el){
  el.innerHTML=`
  <div class="tutorial-overlay" onclick="event.target===this&&(G.phase='leader_select';render())">
    <div class="tutorial-card">
      <div class="tut-title">天下对弈</div>
      <div class="tut-subtitle">— 游戏规则 —</div>
      <div class="tut-deco">☰ ☰ ☰</div>
      <ul class="tut-rules">
        <li><span class="tut-rule-icon">⚔</span>四行布阵：步兵、骑兵、水军、谋略各占一行，计算各行战力总和</li>
        <li><span class="tut-rule-icon">🌾</span>粮草出牌：每张牌需要消耗粮草（力量值÷3向上取整）</li>
        <li><span class="tut-rule-icon">🏆</span>三局两胜：先赢两局者获胜，共三局</li>
        <li><span class="tut-rule-icon">🏳</span>Pass机制：放弃本局后不可再出牌，双方都Pass则结算</li>
      </ul>
      <div class="tut-btn-wrap">
        <button class="tut-btn" onclick="G.phase='leader_select';render()">我明白了，开始！</button>
      </div>
    </div>
  </div>`;
}

function renderLeaderSelect(el){
  let cards='';
  LEADERS_DATA.forEach(l=>{
    const f=FACTIONS[l.faction];
    const sel=G._selectedLeader===l.id?'selected':'';
    cards+=`<div class="leader-card ${sel}" onclick="selectLeader(${l.id})">
      <div class="scroll-line-left"></div>
      <div class="scroll-line-right"></div>
      <div class="era">${l.era}</div>
      <div class="name">${l.name}</div>
      <span class="faction-tag" style="background:${f.color}">${f.name}</span>
      <div class="ability">✦ ${l.desc}</div>
      <div class="leader-skill-detail ${l.ability.type==='row_boost'||l.ability.type==='all_boost'?'passive':'active'}">
        [${l.ability.type==='row_boost'||l.ability.type==='all_boost'?'被动':'主动'}] ${l.name} · ${l.desc}
      </div>
    </div>`;
  });
  el.innerHTML=`
  <div class="leader-select">
    <h2>选择领袖</h2>
    <p class="subtitle">你的领袖将决定阵营与特殊能力</p>
    <div class="leader-grid">${cards}</div>
    <button class="btn btn-primary" onclick="confirmLeader()" ${G._selectedLeader?'':'disabled'}>确 认 出 征</button>
  </div>`;
}

function selectLeader(id){
  G._selectedLeader=id;
  render();
}

function confirmLeader(){
  if(!G._selectedLeader)return;
  G.playerLeader=LEADERS_DATA.find(l=>l.id===G._selectedLeader);
  let aiLeaders=LEADERS_DATA.filter(l=>l.id!==G._selectedLeader);
  G.aiLeader=aiLeaders[Math.floor(Math.random()*aiLeaders.length)];
  G.playerDeck=buildDeck(G.playerLeader.faction);
  G.aiDeck=buildDeck(G.aiLeader.faction);
  applyLeaderDeckAbility(G.playerLeader,G.playerDeck);
  applyLeaderDeckAbility(G.aiLeader,G.aiDeck);
  G.scores=[0,0];
  G.round=0;
  drawCards(0,7);
  drawCards(1,7);
  G.phase='mulligan';
  G.mulliganSelected=new Set();
  addLog('进入换牌阶段');
  render();
}

function renderMulligan(app){
  const f=FACTIONS[G.playerLeader.faction];
  const sel=G.mulliganSelected;
  const cardsHtml=G.playerHand.map((c,i)=>{
    const cf=FACTIONS[c.faction];
    const isSelected=sel.has(i);
    const rarity=getCardRarity(c);
    const rarityCls='card-rarity-'+rarity;
    const rarityIcons={gold:'✦',purple:'◆',blue:'◇',gray:''};
    const rarityIcon=rarityIcons[rarity]||'';
    const cardIcon=getCategoryIcon(c);
    const abilityText=(c.desc||'');
    const rowName=ROW_NAMES[c.row];
    return`<div class="card ${isSelected?'selected':''} ${rarityCls}" onclick="onMulliganCardClick(${i})" title="${c.name} - ${c.desc}"
      style="--faction-color:${cf.color};--faction-glow:${cf.color}40;perspective:600px;${isSelected?'transform:translateY(-8px) scale(1.03);':''}">
      <div class="card-faction-stripe" style="background:${cf.color}"></div>
      <div class="card-top-bar">
        <span class="card-cost-chip">${getCardCost(c.strength)}</span>
        <span class="card-rarity-icon" style="color:${rarity==='gold'?'#D4A840':rarity==='purple'?'#9B59B6':rarity==='blue'?'#3D6B8E':'#4A4A6A'}">${rarityIcon}</span>
      </div>
      <div class="card-illustration" style="color:${cf.color}">${cardIcon}</div>
      <div class="card-name">${c.name}</div>
      <div class="card-tags">
        <span class="card-type-tag">${rowName}</span>
        <span class="card-faction-tag" style="background:${cf.color}">${cf.name}</span>
      </div>
      <div class="card-ability">${abilityText}</div>
      <div class="card-stats-bar">
        <span class="card-atk">${c.strength}</span>
        <span class="card-sep"></span>
        <span class="card-def">${c.strength}</span>
      </div>
    </div>`;
  }).join('');
  app.innerHTML=`
  <div class="leader-select">
    <h2>换牌阶段</h2>
    <p class="subtitle">点击选择要替换的牌（可换 ${sel.size} 张）</p>
    <div class="hand-cards" style="justify-content:center;flex-wrap:wrap;gap:10px;padding:16px">
      ${cardsHtml}
    </div>
    <div style="text-align:center;margin-top:20px">
      <button class="btn btn-primary" onclick="confirmMulligan()">确认换牌</button>
    </div>
  </div>`;
}

function onMulliganCardClick(idx){
  if(G.phase!=='mulligan')return;
  if(G.mulliganSelected.has(idx)){
    G.mulliganSelected.delete(idx);
  }else{
    G.mulliganSelected.add(idx);
  }
  render();
}

function confirmMulligan(){
  const sorted=[...G.mulliganSelected].sort((a,b)=>b-a);
  sorted.forEach(idx=>{
    if(G.playerHand.length>idx) G.playerHand.splice(idx,1);
    drawCards(0,1);
  });
  const aiReplace=Math.floor(Math.random()*3);
  for(let i=0;i<aiReplace&&G.aiHand.length>0;i++){
    const ri=Math.floor(Math.random()*G.aiHand.length);
    G.aiHand.splice(ri,1);
    drawCards(1,1);
  }
  G.phase='playing';
  G.round=1;
  G.mulliganSelected=new Set();
  G.currentTurn='player';
  G.playerPassed=false;
  G.aiPassed=false;
  G.provisions=[8,8];
  G.playerBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.aiBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.globalBuffs={playerArmor:0,aiArmor:0,playerUnify:0,aiUnify:0,ambushTriggered:false,playerFarm:0,aiFarm:0,playerBerserkCard:null,aiBerserkCard:null,playerBleed:0,aiBleed:0,poisonCount:{0:0,1:0},playerBarrier:0,aiBarrier:0,bountyTarget:null,bountyOwner:-1,bountyGold:0,playerAmbushTrap:0,aiAmbushTrap:0};
  addLog('换牌完成！第1局开始');
  addLog(`你现有 ${G.playerHand.length} 张手牌，牌库剩余 ${G.playerDeck.length} 张`);
  showNotification('换牌完成！');
  render();
}

function useLeaderAbility(playerIdx){
  if(G.leaderAbilityUsed[playerIdx])return;
  const leader=playerIdx===0?G.playerLeader:G.aiLeader;
  if(!leader)return;
  const ability=leader.ability;
  switch(ability.type){
    case'row_boost':
      getBoard(playerIdx)[ability.row].forEach(c=>c.strength+=ability.value);
      addLog(`【${leader.name}】技能：${ROW_NAMES[ability.row]}行+${ability.value}`);
      break;
    case'extra_draw':
      drawCards(playerIdx,ability.value);
      addLog(`【${leader.name}】技能：抽${ability.value}张牌`);
      break;
    case'opponent_discard':{
      const opp=1-playerIdx;
      const oppH=getHand(opp);
      for(let i=0;i<ability.value&&oppH.length>0;i++){
        const ri=Math.floor(Math.random()*oppH.length);
        addLog(`【${leader.name}】技能：对手弃${oppH[ri].name}`);
        oppH.splice(ri,1);
      }
      break;}
    case'extra_provisions':
      G.provisions[playerIdx]+=ability.value;
      addLog(`【${leader.name}】技能：粮草+${ability.value}`);
      break;
    case'all_boost':
      ['infantry','cavalry','navy','strategy'].forEach(r=>getBoard(playerIdx)[r].forEach(c=>c.strength+=ability.value));
      addLog(`【${leader.name}】技能：全场+${ability.value}`);
      break;
  }
  G.leaderAbilityUsed[playerIdx]=true;
  render();
}

function renderGame(el,lastUid,lastBy){
  const pF=FACTIONS[G.playerLeader.faction];
  const aF=FACTIONS[G.aiLeader.faction];
  const pP=getBoardPower(G.playerBoard,0);
  const aP=getBoardPower(G.aiBoard,1);
  const turnText=G.currentTurn==='player'?'你的回合':'AI思考中...';
  const turnClass=G.currentTurn==='player'?'your-turn':'ai-turn';

  el.innerHTML=`
  <div class="game-header">
    <div class="player-info">
      <div class="name" style="color:${pF.color}">你</div>
      <div class="leader">${G.playerLeader.name}</div>
      <div class="provisions-bar">
        <span class="label">粮草</span>
        <div class="pips">${renderPips(G.provisions[0],10,'player')}</div>
        <span class="count">${G.provisions[0]}</span>
      </div>
    </div>
    <div class="score-center">
      <div class="rounds">第 ${G.round} / 3 局</div>
      <div class="score">${G.scores[0]} : ${G.scores[1]}</div>
      <div class="rounds-won">你 ${G.scores[0]}胜 · AI ${G.scores[1]}胜</div>
    </div>
    <div class="player-info">
      <div class="name" style="color:${aF.color}">AI</div>
      <div class="leader">${G.aiLeader.name}</div>
      <div class="provisions-bar">
        <span class="label">粮草</span>
        <div class="pips">${renderPips(G.provisions[1],10,'ai')}</div>
        <span class="count">${G.provisions[1]}</span>
      </div>
      <div class="opponent-hand-pile">
        <span style="font-size:.85em;color:#8B7050;font-weight:500">🃏 ${G.aiHand.length} 张手牌</span>
      </div>
    </div>
  </div>
  <div class="battlefield">
    <div class="board-section ai-rows">
      <div class="section-label">— AI 阵营 · 战力 ${aP} —</div>
      ${renderRow('navy',G.aiBoard.navy,false,lastUid,lastBy)}
      ${renderRow('cavalry',G.aiBoard.cavalry,false,lastUid,lastBy)}
      ${renderRow('infantry',G.aiBoard.infantry,false,lastUid,lastBy)}
      ${renderRow('strategy',G.aiBoard.strategy,false,lastUid,lastBy)}
    </div>
    <div class="decorative-line"></div>
    <div class="board-section player-rows">
      <div class="section-label">— 你的阵营 · 战力 ${pP} —</div>
      ${renderRow('infantry',G.playerBoard.infantry,true,lastUid,lastBy)}
      ${renderRow('cavalry',G.playerBoard.cavalry,true,lastUid,lastBy)}
      ${renderRow('navy',G.playerBoard.navy,true,lastUid,lastBy)}
      ${renderRow('strategy',G.playerBoard.strategy,true,lastUid,lastBy)}
    </div>
  </div>
  <div class="turn-indicator">
    <span class="${turnClass}">${turnText}</span>
    ${G.playerPassed&&!G.aiPassed?'<span class="waiting"> · 你已放弃，等待AI</span>':''}
  </div>
  <div class="hand-area">
    <div class="hand-label">— 你的手牌 (${G.playerHand.length}张) —</div>
    <div class="hand-cards ${G.playerHand.length===0?'empty':''}">
      ${G.playerHand.length===0?'无手牌':G.playerHand.map((c,i)=>renderHandCard(c,i)).join('')}
    </div>
  </div>
  <div class="action-bar">
    <button class="btn btn-sm btn-primary" onclick="useLeaderAbility(0)" ${G.currentTurn!=='player'||G.playerPassed||G.leaderAbilityUsed[0]?'disabled':''}>${G.leaderAbilityUsed[0]?'已使用':'主将技能'} · ${G.playerLeader?G.playerLeader.name:''}</button>
    <span class="leader-skill-badge">✦ ${G.playerLeader?G.playerLeader.desc:''}</span>
    <button class="btn btn-sm btn-pass" onclick="playerPass()" ${G.currentTurn!=='player'||G.playerPassed?'disabled':''}>放弃本局</button>
  </div>
  <div class="log-area">
    ${G.logs.map(l=>`<div class="log-entry">${l}</div>`).join('')}
  </div>
  <!-- 游戏背景诗句 - 左右两侧 -->
  <div class="poetry-container game-poetry">
    <div class="poetry-col poetry-col-left">
      <div class="poetry-line">余 霞 散 成 绮</div>
      <div class="poetry-line">池 塘 生 春 草</div>
      <div class="poetry-line">大 江 流 日 夜</div>
      <div class="poetry-line">蝉 噪 林 逾 静</div>
      <div class="poetry-line">泻 水 置 平 地</div>
    </div>
    <div class="poetry-col poetry-col-right">
      <div class="poetry-line">澄 江 静 如 练</div>
      <div class="poetry-line">园 柳 变 鸣 禽</div>
      <div class="poetry-line">客 心 悲 未 央</div>
      <div class="poetry-line">鸟 鸣 山 更 幽</div>
      <div class="poetry-line">各 自 东 西 南 北 流</div>
    </div>
  </div>`;

  const la=document.querySelector('.log-area');
  if(la)la.scrollTop=la.scrollHeight;
}

function renderPips(current,max,playerClass){
  let html='';
  for(let i=0;i<max;i++){
    const filled=i<current?`filled ${playerClass}`:'';
    html+=`<div class="pip ${filled}"></div>`;
  }
  return html;
}

function renderRow(rowType,cards,isPlayer,lastUid,lastBy){
  const playerIdx=isPlayer?0:1;
  const power=getRowPower(cards,playerIdx);
  const highlight=isPlayer&&G.currentTurn==='player'&&!G.playerPassed&&G.selectedCard!==null;
  const canPlay=highlight;
  const cardsHtml=cards.length===0?'<span style="color:#6B5B47;font-size:.75em">空</span>':
    cards.map(c=>{
      const f=FACTIONS[c.faction];
      let animClass='';
      let flyStyle='';
      if(c.uid===lastUid){
        if(lastBy===1){
          animClass=' ai-play-card';
        }else{
          const angles=[-15,-10,-5,0,5,10,15];
          const startXs=[-120,-80,-40,0,40,80,120];
          const startYs=[160,180,200,220,200,180,160];
          const ri=Math.floor(Math.random()*angles.length);
          animClass=' play-animation fly-random';
          flyStyle=`--fly-x:${startXs[ri]}px;--fly-y:${startYs[ri]}px;--fly-r:${angles[ri]}deg;`;
        }
      }
      return`<div class="card-mini ${c.ability?'has-ability':''}${animClass}" data-uid="${c.uid}" style="perspective:600px;${flyStyle}" title="${c.name}${c.ability?' - '+c.desc:''}">
        <div class="c-faction-dot" style="background:${f.color}"></div>
        <div class="c-name" title="${c.name}">${c.name}</div>
        ${c.ability?`<div class="c-ability">${c.ability.split(':')[0]}</div>`:''}
        <div class="c-str">${c.strength}${c.protectArmor?`<span style="color:#4A90D9;font-size:.7em">🛡${c.protectArmor}</span>`:''}</div>
      </div>`;
    }).join('');
  const isMatch=G.selectedCard!==null&&G.selectedCard!==undefined&&G.playerHand[G.selectedCard]&&G.playerHand[G.selectedCard].row===rowType;
const canPlayRow=isMatch&&canPlay;
return`<div class="row ${canPlayRow?'highlight':''}" ${canPlayRow?`onclick="onRowClick('${rowType}')"`:''}>
    <div class="row-label">${ROW_NAMES[rowType]}</div>
    <div class="row-cards">${cardsHtml}</div>
    <div class="row-power"><div class="val">${power}</div></div>
  </div>`;
}

function renderHandCard(card,idx){
  const f=FACTIONS[card.faction];
  const cost=getCardCost(card.strength);
  const playable=G.currentTurn==='player'&&!G.playerPassed&&cost<=G.provisions[0];
  const selected=G.selectedCard===idx;
  const cls=selected?'selected':(!playable?'unplayable':'');
  const rarity=getCardRarity(card);
  const rarityCls='card-rarity-'+rarity;
  const rarityIcons={gold:'✦',purple:'◆',blue:'◇',gray:''};
  const rarityIcon=rarityIcons[rarity]||'';
  const abilityText=(card.desc||'')+(card.protectArmor?`<span style="color:#4A90D9;font-weight:bold">🛡${card.protectArmor}</span>`:'');
  const cardIcon=getCategoryIcon(card);
  const rowName=ROW_NAMES[card.row];
  const factionName=FACTIONS[card.faction]?.name||card.faction;
  const abilityType=card.ability?(card.ability.split(':')[0]):'';
  const abilityLabel=card.ability?'技能:'+abilityType:'';
  const armorText=card.protectArmor?` 护甲:${card.protectArmor}`:'';
  const tooltipTitle=`${card.name} - ${card.desc} | 战力:${card.strength} 费用:${cost} | 阵营:${factionName} 行:${rowName}${armorText}`;
  return`<div class="card ${cls} ${rarityCls}" onclick="onCardClick(${idx})" title="${tooltipTitle}"
    onmouseenter="showCardTooltipByIdx(event,${idx})"
    onmouseleave="hideCardTooltip()"
    style="--faction-color:${f.color};--faction-glow:${f.color}40;perspective:600px">
    <div class="card-faction-stripe" style="background:${f.color}"></div>
    <div class="card-top-bar">
      <span class="card-cost-chip">${cost}</span>
      <span class="card-rarity-icon" style="color:${rarity==='gold'?'#D4A840':rarity==='purple'?'#9B59B6':rarity==='blue'?'#3D6B8E':'#4A4A6A'}">${rarityIcon}</span>
    </div>
    <div class="card-illustration" style="color:${f.color}">${cardIcon}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-tags">
      <span class="card-type-tag">${rowName}</span>
      <span class="card-faction-tag" style="background:${f.color}">${factionName}</span>
    </div>
    <div class="card-ability">${abilityText}</div>
    <div class="card-stats-bar">
      <span class="card-atk">${card.strength}</span>
      <span class="card-sep"></span>
      <span class="card-def">${card.strength}</span>
    </div>
  </div>`;
}

function onCardClick(idx){
  if(G.phase!=='playing'||G.currentTurn!=='player'||G.playerPassed)return;
  const card=G.playerHand[idx];
  if(getCardCost(card.strength)>G.provisions[0])return;
  if(G.selectedCard===idx){
    G.selectedCard=null;
  }else{
    G.selectedCard=idx;
  }
  render();
}

let _cardTooltip=null;
function showCardTooltipByIdx(e,idx){
  const card=G.playerHand[idx];
  if(!card)return;
  showCardTooltip(e,card);
}
function showCardTooltip(e,card){
  hideCardTooltip();
  const f=FACTIONS[card.faction]||{name:card.faction,color:'#4A4A6A'};
  const rarity=getCardRarity(card);
  const rarityNames={gold:'金',purple:'紫',blue:'蓝',gray:'灰'};
  const rowName=ROW_NAMES[card.row]||card.row;
  const cost=getCardCost(card.strength);
  const armor=card.protectArmor?` · 护甲:${card.protectArmor}`:'';
  const abilityType=card.ability?(card.ability.split(':')[0]):'';
  const abilityLabel=card.ability?` · 技能:${abilityType}`:'';
  const div=document.createElement('div');
  div.className='card-tooltip show';
  div.innerHTML=`<div class="tt-name">${card.name}</div>
    <div class="tt-row"><span class="tt-label">稀有度</span><span class="tt-val">${rarityNames[rarity]||'灰'}</span></div>
    <div class="tt-row"><span class="tt-label">阵营</span><span class="tt-val" style="color:${f.color}">${f.name}</span></div>
    <div class="tt-row"><span class="tt-label">战力</span><span class="tt-val">${card.strength}</span></div>
    <div class="tt-row"><span class="tt-label">费用</span><span class="tt-val">${cost}</span></div>
    <div class="tt-row"><span class="tt-label">行</span><span class="tt-val">${rowName}</span></div>
    ${abilityType?`<div class="tt-row"><span class="tt-label">技能</span><span class="tt-val">${abilityType}</span></div>`:''}
    ${card.protectArmor?`<div class="tt-row"><span class="tt-label">护甲</span><span class="tt-val">🛡${card.protectArmor}</span></div>`:''}
    <div class="tt-desc">${card.desc||'无特殊效果'}</div>`;
  document.body.appendChild(div);
  const rect=div.getBoundingClientRect();
  let x=e.clientX+12;
  let y=e.clientY+12;
  if(x+rect.width>window.innerWidth)x=e.clientX-rect.width-8;
  if(y+rect.height>window.innerHeight)y=e.clientY-rect.height-8;
  div.style.left=x+'px';
  div.style.top=y+'px';
  _cardTooltip=div;
}
function hideCardTooltip(){
  if(_cardTooltip){_cardTooltip.remove();_cardTooltip=null}
}

function onRowClick(rowType){
  if(G.selectedCard===null||G.selectedCard===undefined)return;
  const card=G.playerHand[G.selectedCard];
  if(!card)return;
  // 只能放到对应行
  if(card.row!==rowType){
    addLog('该卡牌只能放入'+ROW_NAMES[card.row]);
    return;
  }
  playerPlayCard(G.selectedCard,rowType);
}

function renderRoundResult(el){
  const r=G._roundResult;
  const pWin=r.winner===0;
  const aWin=r.winner===1;
  const tie=r.winner===-1;
  el.innerHTML=`
  <div class="round-result">
    <h2>第${G.round}局 结果</h2>
    <div class="power-compare">
      <div class="power-row">
        <div>
          <div style="color:#8B7050;font-size:.85em">你的战力</div>
          <div class="power-val ${pWin?'win':'lose'}">${r.playerPower}</div>
        </div>
        <div style="font-size:1.5em;color:#B8A070;align-self:center">VS</div>
        <div>
          <div style="color:#8B7050;font-size:.85em">AI战力</div>
          <div class="power-val ${aWin?'win':'lose'}">${r.aiPower}</div>
        </div>
      </div>
    </div>
    <div class="result-text">${pWin?'你赢得了本局！':aWin?'AI赢得了本局！':'本局平局！'}</div>
    <div style="color:#8B7050;margin-bottom:20px">当前比分：${G.scores[0]} : ${G.scores[1]}</div>
    <button class="btn btn-primary" onclick="nextRoundOrGame()">${G.scores[0]>=2||G.scores[1]>=2||G.round>=3?'查看最终结果':'继续下一局'}</button>
  </div>`;
}

function renderGameResult(el){
  const playerWin=G.scores[0]>G.scores[1];
  el.innerHTML=`
  <div class="game-result">
    <div class="menu-seal" style="margin:0 auto 30px">${playerWin?'胜利':'败北'}</div>
    <h1 class="${playerWin?'victory':'defeat'}">${playerWin?'天下归一':'功败垂成'}</h1>
    <div class="final-score">${G.scores[0]} : ${G.scores[1]}</div>
    <div class="detail">
      ${G.playerLeader.name}（${FACTIONS[G.playerLeader.faction].name}）VS ${G.aiLeader.name}（${FACTIONS[G.aiLeader.faction].name}）
    </div>
    <div class="decorative-line" style="width:200px;margin:20px auto"></div>
    <p style="color:#8B7050;margin:20px 0 30px;letter-spacing:2px;line-height:1.8">
      ${playerWin?'运筹帷幄之中，决胜千里之外。':'胜败乃兵家常事，再接再厉。'}
    </p>
    <button class="btn btn-primary" onclick="resetGame()">再 战 一 局</button>
  </div>`;
}

function resetGame(){
  uid=0;
  G.phase='menu';G.round=0;G.scores=[0,0];
  G.playerLeader=null;G.aiLeader=null;
  G.playerDeck=[];G.aiDeck=[];
  G.playerHand=[];G.aiHand=[];
  G.playerBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.aiBoard={infantry:[],cavalry:[],navy:[],strategy:[]};
  G.provisions=[8,8];G.currentTurn='player';
  G.playerPassed=false;G.aiPassed=false;
  G.selectedCard=null;G.logs=[];G.turnCount=0;
  G.globalBuffs={playerArmor:0,aiArmor:0,playerUnify:0,aiUnify:0,ambushTriggered:false,playerFarm:0,aiFarm:0,playerBerserkCard:null,aiBerserkCard:null,playerBleed:0,aiBleed:0,poisonCount:{0:0,1:0},playerBarrier:0,aiBarrier:0,bountyTarget:null,bountyOwner:-1,bountyGold:0};
  G.graveyard=[];
  G._selectedLeader=null;G._roundResult=null;G._lastPlayedBy=null;
  G.mulliganSelected=new Set();G.leaderAbilityUsed=[false,false];
  render();
}

document.addEventListener('DOMContentLoaded',()=>render());
