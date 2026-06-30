// ===== 南北朝卡牌博弈 — 卡牌数据与类定义 =====

// 阵营定义
const FACTIONS = {
    SONG: { id: 'song', name: '宋', color: '#C41E3A', dynasty: '南朝' },
    QI:   { id: 'qi',   name: '齐', color: '#DAA520', dynasty: '南朝' },
    LIANG:{ id: 'liang',name: '梁', color: '#4169E1', dynasty: '南朝' },
    CHEN: { id: 'chen', name: '陈', color: '#228B22', dynasty: '南朝' },
    NWEI: { id: 'nwei', name: '北魏', color: '#4B0082', dynasty: '北朝' },
    EWU:  { id: 'ewu',  name: '东魏', color: '#FF8C00', dynasty: '北朝' },
    XWEI: { id: 'xwei', name: '西魏', color: '#C0C0C0', dynasty: '北朝' },
    BEIQI:{ id: 'beiqi',name: '北齐', color: '#FF8C00', dynasty: '北朝' },
    LIANG_REBEL: { id: 'liang_rebel', name: '梁叛', color: '#8B0000', dynasty: '北朝' },
    CHEN_FACTION: { id: 'chen_faction', name: '陈', color: '#228B22', dynasty: '北朝' },
};

// 行定义
const ROWS = {
    INFANTRY: { id: 'infantry', name: '步兵阵', icon: '⚔️' },
    CAVALRY:  { id: 'cavalry',  name: '骑兵阵', icon: '🐴' },
    NAVY:     { id: 'navy',     name: '水军阵', icon: '🚢' },
};

// 卡牌类型
const CARD_TYPE = {
    LEADER:    'leader',
    GENERAL:   'general',
    SOLDIER:   'soldier',
    STRATEGY:  'strategy',
    WEATHER:   'weather',
    SPECIAL:   'special',
};

// 稀有度
const RARITY = {
    LEGENDARY: { id: 'legendary', name: '传说', stars: 5, color: '#FFD700' },
    EPIC:      { id: 'epic',      name: '史诗', stars: 3, color: '#9370DB' },
    RARE:      { id: 'rare',      name: '稀有', stars: 2, color: '#4169E1' },
    COMMON:    { id: 'common',    name: '普通', stars: 1, color: '#808080' },
};

// ===== 卡牌基类 =====
class Card {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.faction = data.faction;
        this.cost = data.cost || 0;
        this.infantry = data.infantry || 0;
        this.cavalry = data.cavalry || 0;
        this.navy = data.navy || 0;
        this.ability = data.ability || null;
        this.abilityDesc = data.abilityDesc || '';
        this.rarity = data.rarity || RARITY.COMMON;
        this.targetRow = data.targetRow || null;
        this.duration = data.duration || 0;
        this.isSpecial = data.isSpecial || false;
        // 保留卡牌特殊效果函数（play/onPass等）
        if (data.play) this.play = data.play;
        if (data.onPass) this.onPass = data.onPass;
    }

    getTotalPower() {
        return this.infantry + this.cavalry + this.navy;
    }

    getRowPower(rowId) {
        switch (rowId) {
            case 'infantry': return this.infantry;
            case 'cavalry': return this.cavalry;
            case 'navy': return this.navy;
            default: return 0;
        }
    }

    clone() {
        return new Card({...this, rarity: this.rarity});
    }
}

// ===== 领袖类 =====
class Leader {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.faction = data.faction;
        this.activeDesc = data.activeDesc;
        this.passiveDesc = data.passiveDesc;
        this.activeUsed = false;
    }

    clone() {
        const l = new Leader({...this});
        l.active = this.active;
        l.passive = this.passive;
        l.activeUsed = false;
        return l;
    }
}

// ===== 领袖数据 =====
const LEADERS = [
    {
        id: 'L1', name: '刘裕', faction: FACTIONS.SONG,
        activeDesc: '步兵阵本回合+8点',
        passiveDesc: '步兵阵所有单位+1点',
        active: (game, player) => {
            const row = game.getBoard('infantry', player);
            row.forEach(c => { if (c.type !== 'strategy') c._bonus = (c._bonus || 0) + 8; });
            game.addLog(`${player.name} 使用刘裕能力：步兵阵+8`);
        },
        passive: (game, player, card) => {
            if (card && card.infantry > 0) {
                card._bonus = (card._bonus || 0) + 1;
            }
        }
    },
    {
        id: 'L2', name: '萧衍', faction: FACTIONS.LIANG,
        activeDesc: '牺牲10点，抽3张牌',
        passiveDesc: '每出一张牌，下一张-1费',
        active: (game, player) => {
            const score = game.getPlayerScore(player);
            if (score >= 10) {
                game.addScore(player, -10);
                game.drawCards(player, 3);
                game.addLog(`${player.name} 使用萧衍能力：牺牲10点抽3张`);
            }
        },
        passive: (game, player) => {
            player._nextCardDiscount = (player._nextCardDiscount || 0) + 1;
        }
    },
    {
        id: 'L3', name: '陈庆之', faction: FACTIONS.LIANG,
        activeDesc: '骑兵阵×2，之后该行清空',
        passiveDesc: '无',
        active: (game, player) => {
            const cavalry = game.getBoard('cavalry', player);
            const cavalryPower = cavalry.reduce((sum, c) => sum + c.getTotalPower() + (c._bonus || 0), 0);
            game.clearRow('cavalry', player);
            // 清行后将骑兵点数×2分配到剩余行
            game.addScore(player, cavalryPower * 2);
            game.addLog(`${player.name} 使用陈庆之能力：骑兵×2 (+${cavalryPower * 2}点)`);
        },
        passive: null
    },
    {
        id: 'L4', name: '拓跋宏', faction: FACTIONS.NWEI,
        activeDesc: '转化一张己方牌为对方阵营',
        passiveDesc: '每回合首次出牌+2点',
        active: (game, player) => {
            const opponent = game.getOpponent(player);
            const board = [];
            ['infantry', 'cavalry', 'navy'].forEach(r => {
                game.getBoard(r, player).forEach(c => board.push(c));
            });
            if (board.length > 0) {
                const card = board[Math.floor(Math.random() * board.length)];
                card.faction = opponent.leader.faction;
                game.addLog(`${player.name} 使用拓跋宏能力：转化${card.name}为对方阵营`);
            }
        },
        passive: (game, player, card) => {
            if (!player._firstPlayUsed) {
                card._bonus = (card._bonus || 0) + 2;
                player._firstPlayUsed = true;
            }
        }
    },
    {
        id: 'L5', name: '宇文泰', faction: FACTIONS.XWEI,
        activeDesc: '全场己方+6',
        passiveDesc: '每出牌+1，持续3回合',
        active: (game, player) => {
            ['infantry', 'cavalry', 'navy'].forEach(r => {
                game.getBoard(r, player).forEach(c => {
                    c._bonus = (c._bonus || 0) + 6;
                });
            });
            game.addLog(`${player.name} 使用宇文泰能力：全场+6`);
        },
        passive: (game, player, card) => {
            if (!player._wenTaiBuffs) player._wenTaiBuffs = 0;
            if (player._wenTaiBuffs < 3) {
                card._bonus = (card._bonus || 0) + 1;
                player._wenTaiBuffs++;
            }
        }
    },
    {
        id: 'L6', name: '萧道成', faction: FACTIONS.QI,
        activeDesc: '弃4+费换对手2-费牌',
        passiveDesc: '每回合额外抽1张牌',
        active: (game, player) => {
            const opponent = game.getOpponent(player);
            const myHand = player.hand.filter(c => c.cost >= 4);
            const oppHand = opponent.hand.filter(c => c.cost <= 2);
            if (myHand.length > 0 && oppHand.length > 0) {
                const myIdx = player.hand.indexOf(myHand[0]);
                const oppIdx = opponent.hand.indexOf(oppHand[0]);
                player.hand.splice(myIdx, 1);
                const stolen = opponent.hand.splice(oppIdx, 1)[0];
                player.hand.push(stolen);
                game.addLog(`${player.name} 使用萧道成能力：弃${myHand[0].name}换${stolen.name}`);
            }
        },
        passive: (game, player) => {
            game.drawCards(player, 1);
        }
    },
    {
        id: 'L7', name: '陈霸先', faction: FACTIONS.CHEN,
        activeDesc: '复活弃牌堆3费以下牌',
        passiveDesc: '后手时所有单位+1',
        active: (game, player) => {
            const candidates = player.graveyard.filter(c => c.cost <= 3 && c.type !== 'strategy' && c.type !== 'weather');
            if (candidates.length > 0) {
                const card = candidates[Math.floor(Math.random() * candidates.length)];
                const row = card.infantry >= card.cavalry && card.infantry >= card.navy ? 'infantry'
                    : card.cavalry >= card.navy ? 'cavalry' : 'navy';
                const idx = player.graveyard.indexOf(card);
                player.graveyard.splice(idx, 1);
                game.playToBoard(card, player, row);
                game.addLog(`${player.name} 使用陈霸先能力：复活${card.name}`);
            }
        },
        passive: (game, player) => {
            if (game.isSecondPlayer(player)) {
                ['infantry', 'cavalry', 'navy'].forEach(r => {
                    game.getBoard(r, player).forEach(c => {
                        c._bonus = (c._bonus || 0) + 1;
                    });
                });
            }
        }
    },
];

// ===== 全部卡牌数据 (48张) =====

const CARD_DATABASE = [
    // ===== 将领牌 (15张) =====
    // 南朝将领
    { id: 'G01', name: '檀道济', type: CARD_TYPE.GENERAL, faction: FACTIONS.SONG, cost: 4, infantry: 7, cavalry: 0, navy: 0,
      ability: 'sandbag', abilityDesc: '唱筹量沙：隐藏一行真实点数1回合', rarity: RARITY.EPIC,
      play: (game, player, row) => {
          const targetPlayer = game.getOpponent(player);
          const r = row || 'infantry';
          game.getBoard(r, targetPlayer).forEach(c => { c._hidden = true; });
          game.addLog(`${player.name} 檀道济：隐藏对方${ROWS[r.toUpperCase()].name}真实点数`);
      }},
    { id: 'G02', name: '刘义隆', type: CARD_TYPE.GENERAL, faction: FACTIONS.SONG, cost: 3, infantry: 5, cavalry: 3, navy: 0,
      ability: 'yuanjia', abilityDesc: '元嘉北伐：全场+5，若落后则-5', rarity: RARITY.EPIC,
      play: (game, player) => {
          const myScore = game.getPlayerScore(player);
          const oppScore = game.getPlayerScore(game.getOpponent(player));
          const delta = myScore < oppScore ? 0 : 10;
          ['infantry', 'cavalry', 'navy'].forEach(r => {
              game.getBoard(r, player).forEach(c => { c._bonus = (c._bonus || 0) + 5 - delta; });
          });
          game.addLog(`${player.name} 刘义隆：元嘉北伐全场${myScore < oppScore ? '不变' : '+5'}`);
      }},
    { id: 'G03', name: '韦睿', type: CARD_TYPE.GENERAL, faction: FACTIONS.LIANG, cost: 4, infantry: 3, cavalry: 0, navy: 8,
      ability: 'zhongli', abilityDesc: '钟离大捷：水军+10，骑兵-3', rarity: RARITY.EPIC,
      play: (game, player) => {
          game.getBoard('navy', player).forEach(c => { c._bonus = (c._bonus || 0) + 10; });
          game.getBoard('cavalry', player).forEach(c => { c._bonus = (c._bonus || 0) - 3; });
          game.addLog(`${player.name} 韦睿：水军+10 骑兵-3`);
      }},
    { id: 'G04', name: '谢安', type: CARD_TYPE.GENERAL, faction: FACTIONS.LIANG, cost: 3, infantry: 4, cavalry: 2, navy: 3,
      ability: 'xie_an', abilityDesc: '东山再起：Pass后抽2张', rarity: RARITY.EPIC,
      play: () => {},
      onPass: (game, player) => {
          game.drawCards(player, 2);
          game.addLog(`${player.name} 谢安：东山再起抽2张`);
      }},
    { id: 'G05', name: '宗悫', type: CARD_TYPE.GENERAL, faction: FACTIONS.SONG, cost: 2, infantry: 5, cavalry: 0, navy: 0,
      ability: 'zong_que', abilityDesc: '乘风破浪：首回合出牌+2', rarity: RARITY.RARE,
      play: (game, player, row) => {
          if (game.turnCount <= 1) {
              const board = game.getBoard(row || 'infantry', player);
              const thisCard = board[board.length - 1];
              if (thisCard) thisCard._bonus = (thisCard._bonus || 0) + 2;
          }
          game.addLog(`${player.name} 宗悫：乘风破浪`);
      }},
    { id: 'G06', name: '沈庆之', type: CARD_TYPE.GENERAL, faction: FACTIONS.SONG, cost: 3, infantry: 4, cavalry: 3, navy: 0,
      ability: 'shen_qz', abilityDesc: '老当益壮：费用-1', rarity: RARITY.RARE },

    // 北朝将领
    { id: 'G07', name: '拓跋珪', type: CARD_TYPE.GENERAL, faction: FACTIONS.NWEI, cost: 4, infantry: 5, cavalry: 7, navy: 0,
      ability: 'tuoba_gui', abilityDesc: '代国复兴：初始手牌+2', rarity: RARITY.EPIC,
      play: (game, player) => {
          game.drawCards(player, 2);
          game.addLog(`${player.name} 拓跋珪：代国复兴抽2张`);
      }},
    { id: 'G08', name: '拓跋焘', type: CARD_TYPE.GENERAL, faction: FACTIONS.NWEI, cost: 5, infantry: 3, cavalry: 10, navy: 0,
      ability: 'tuoba_tao', abilityDesc: '太武灭国：消灭对方最低点数牌', rarity: RARITY.LEGENDARY,
      play: (game, player) => {
          const opp = game.getOpponent(player);
          let weakest = null, weakestPower = Infinity, weakestRow = null;
          ['infantry', 'cavalry', 'navy'].forEach(r => {
              game.getBoard(r, opp).forEach(c => {
                  const p = c.getTotalPower() + (c._bonus || 0);
                  if (p < weakestPower && !c._protected) {
                      weakest = c; weakestPower = p; weakestRow = r;
                  }
              });
          });
          if (weakest) {
              game.removeFromBoard(weakest, weakestRow, opp);
              game.addLog(`${player.name} 拓跋焘：消灭${weakest.name}`);
          }
      }},
    { id: 'G09', name: '高欢', type: CARD_TYPE.GENERAL, faction: FACTIONS.EWU, cost: 4, infantry: 6, cavalry: 5, navy: 0,
      ability: 'gao_huan', abilityDesc: '晋阳霸业：出牌+6，下回合手牌-1', rarity: RARITY.EPIC,
      play: (game, player, row) => {
          const board = game.getBoard(row || 'infantry', player);
          const thisCard = board[board.length - 1];
          if (thisCard) thisCard._bonus = (thisCard._bonus || 0) + 6;
          player._nextDrawPenalty = (player._nextDrawPenalty || 0) + 1;
          game.addLog(`${player.name} 高欢：晋阳霸业+6`);
      }},
    { id: 'G10', name: '宇文邕', type: CARD_TYPE.GENERAL, faction: FACTIONS.XWEI, cost: 5, infantry: 4, cavalry: 6, navy: 3,
      ability: 'yuwen_yong', abilityDesc: '建德北伐：最后回合全场+8', rarity: RARITY.LEGENDARY,
      play: (game, player) => {
          if (game.isLastTurn(player)) {
              ['infantry', 'cavalry', 'navy'].forEach(r => {
                  game.getBoard(r, player).forEach(c => { c._bonus = (c._bonus || 0) + 8; });
              });
              game.addLog(`${player.name} 宇文邕：建德北伐全场+8`);
          }
      }},
    { id: 'G11', name: '尔朱荣', type: CARD_TYPE.GENERAL, faction: FACTIONS.NWEI, cost: 3, infantry: 2, cavalry: 5, navy: 0,
      ability: 'erzhu_rong', abilityDesc: '河阴之变：消灭对方1费牌', rarity: RARITY.RARE,
      play: (game, player) => {
          const opp = game.getOpponent(player);
          let target = null, targetRow = null;
          ['infantry', 'cavalry', 'navy'].forEach(r => {
              game.getBoard(r, opp).forEach(c => {
                  if (c.cost === 1 && !target) { target = c; targetRow = r; }
              });
          });
          if (target) {
              game.removeFromBoard(target, targetRow, opp);
              game.addLog(`${player.name} 尔朱荣：消灭${target.name}`);
          }
      }},
    { id: 'G12', name: '侯景', type: CARD_TYPE.GENERAL, faction: FACTIONS.LIANG_REBEL, cost: 3, infantry: 4, cavalry: 4, navy: 2,
      ability: 'hou_jing', abilityDesc: '反复无常：首回合加入对方', rarity: RARITY.RARE,
      play: (game, player, row) => {
          const opp = game.getOpponent(player);
          const board = game.getBoard(row || 'infantry', player);
          const idx = board.length - 1;
          if (idx >= 0) {
              const card = board.splice(idx, 1)[0];
              game.getBoard(row || 'infantry', opp).push(card);
              game.addLog(`${player.name} 侯景：叛逃至对方`);
          }
      }},
    { id: 'G13', name: '段韶', type: CARD_TYPE.GENERAL, faction: FACTIONS.BEIQI, cost: 3, infantry: 5, cavalry: 4, navy: 0,
      ability: 'duan_shao', abilityDesc: '常胜将军：天时影响时-1而非→1', rarity: RARITY.RARE,
      play: (game, player, row) => {
          const board = game.getBoard(row || 'infantry', player);
          const thisCard = board[board.length - 1];
          if (thisCard) thisCard._weatherResistant = true;
      }},
    { id: 'G14', name: '斛律光', type: CARD_TYPE.GENERAL, faction: FACTIONS.BEIQI, cost: 4, infantry: 0, cavalry: 8, navy: 0,
      ability: 'hulü_guang', abilityDesc: '落雕都督：骑兵×1.5', rarity: RARITY.EPIC,
      play: (game, player) => {
          game.getBoard('cavalry', player).forEach(c => {
              c._bonus = (c._bonus || 0) + Math.floor(c.getTotalPower() * 0.5);
          });
          game.addLog(`${player.name} 斛律光：骑兵×1.5`);
      }},
    { id: 'G15', name: '王僧辩', type: CARD_TYPE.GENERAL, faction: FACTIONS.CHEN_FACTION, cost: 3, infantry: 5, cavalry: 2, navy: 4,
      ability: 'wang_sb', abilityDesc: '江左长城：防守时所有行+2', rarity: RARITY.RARE,
      play: (game, player) => {
          ['infantry', 'cavalry', 'navy'].forEach(r => {
              game.getBoard(r, player).forEach(c => { c._bonus = (c._bonus || 0) + 2; });
          });
          game.addLog(`${player.name} 王僧辩：江左长城全场+2`);
      }},

    // ===== 士兵牌 (10张) =====
    { id: 'S01', name: '北府兵', type: CARD_TYPE.SOLDIER, faction: FACTIONS.SONG, cost: 2, infantry: 4, cavalry: 0, navy: 0,
      abilityDesc: '南朝精锐步兵', rarity: RARITY.COMMON },
    { id: 'S02', name: '北府弓手', type: CARD_TYPE.SOLDIER, faction: FACTIONS.SONG, cost: 2, infantry: 3, cavalry: 0, navy: 0,
      abilityDesc: '远程支援', rarity: RARITY.COMMON },
    { id: 'S03', name: '白袍军', type: CARD_TYPE.SOLDIER, faction: FACTIONS.LIANG, cost: 3, infantry: 5, cavalry: 3, navy: 0,
      abilityDesc: '陈庆之麾下', rarity: RARITY.RARE },
    { id: 'S04', name: '建康卫', type: CARD_TYPE.SOLDIER, faction: FACTIONS.CHEN, cost: 2, infantry: 4, cavalry: 0, navy: 0,
      abilityDesc: '京城防卫', rarity: RARITY.COMMON },
    { id: 'S05', name: '甲骑具装', type: CARD_TYPE.SOLDIER, faction: FACTIONS.NWEI, cost: 3, infantry: 0, cavalry: 6, navy: 0,
      abilityDesc: '重装骑兵', rarity: RARITY.RARE },
    { id: 'S06', name: '鲜卑轻骑', type: CARD_TYPE.SOLDIER, faction: FACTIONS.NWEI, cost: 2, infantry: 0, cavalry: 4, navy: 0,
      abilityDesc: '高速机动', rarity: RARITY.COMMON },
    { id: 'S07', name: '洛阳禁军', type: CARD_TYPE.SOLDIER, faction: FACTIONS.NWEI, cost: 3, infantry: 5, cavalry: 3, navy: 0,
      abilityDesc: '中央精锐', rarity: RARITY.RARE },
    { id: 'S08', name: '楼船水师', type: CARD_TYPE.SOLDIER, faction: FACTIONS.CHEN, cost: 3, infantry: 0, cavalry: 0, navy: 6,
      abilityDesc: '长江防线主力', rarity: RARITY.RARE },
    { id: 'S09', name: '襄阳水军', type: CARD_TYPE.SOLDIER, faction: FACTIONS.CHEN, cost: 2, infantry: 0, cavalry: 0, navy: 4,
      abilityDesc: '沿江巡逻', rarity: RARITY.COMMON },
    { id: 'S10', name: '青州兵', type: CARD_TYPE.SOLDIER, faction: FACTIONS.QI, cost: 2, infantry: 3, cavalry: 2, navy: 2,
      abilityDesc: '全能型士兵', rarity: RARITY.COMMON },

    // ===== 策略牌 (10张) =====
    // 攻击
    { id: 'A01', name: '杀', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'atk_line', abilityDesc: '对方一行-3点', rarity: RARITY.COMMON,
      targetRow: 'enemy',
      play: (game, player, row) => {
          const opp = game.getOpponent(player);
          game.getBoard(row, opp).forEach(c => { c._bonus = (c._bonus || 0) - 3; });
          game.addLog(`${player.name} 使用杀：对方${ROWS[row.toUpperCase()].name}-3`);
      }},
    { id: 'A02', name: '破阵', type: CARD_TYPE.STRATEGY, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      ability: 'atk_line2', abilityDesc: '对方一行-5点', rarity: RARITY.RARE,
      targetRow: 'enemy',
      play: (game, player, row) => {
          const opp = game.getOpponent(player);
          game.getBoard(row, opp).forEach(c => { c._bonus = (c._bonus || 0) - 5; });
          game.addLog(`${player.name} 使用破阵：对方${ROWS[row.toUpperCase()].name}-5`);
      }},
    { id: 'A03', name: '奇袭', type: CARD_TYPE.STRATEGY, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      ability: 'skip_turn', abilityDesc: '跳过对方下回合', rarity: RARITY.RARE,
      play: (game, player) => {
          const opp = game.getOpponent(player);
          opp._skipNextTurn = true;
          game.addLog(`${player.name} 使用奇袭：对方下回合跳过`);
      }},
    // 防御
    { id: 'D01', name: '守', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'protect_line', abilityDesc: '己方一行免伤', rarity: RARITY.COMMON,
      targetRow: 'ally',
      play: (game, player, row) => {
          game.getBoard(row, player).forEach(c => { c._protected = true; });
          game.addLog(`${player.name} 使用守：${ROWS[row.toUpperCase()].name}免伤`);
      }},
    { id: 'D02', name: '坚壁', type: CARD_TYPE.STRATEGY, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      ability: 'buff_line', abilityDesc: '己方一行+5点', rarity: RARITY.RARE,
      targetRow: 'ally',
      play: (game, player, row) => {
          game.getBoard(row, player).forEach(c => { c._bonus = (c._bonus || 0) + 5; });
          game.addLog(`${player.name} 使用坚壁：${ROWS[row.toUpperCase()].name}+5`);
      }},
    { id: 'D03', name: '退守', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'retreat', abilityDesc: '移除己方一行+粮草3', rarity: RARITY.RARE,
      targetRow: 'ally',
      play: (game, player, row) => {
          const board = game.getBoard(row, player);
          const removed = board.splice(0, board.length);
          removed.forEach(c => player.graveyard.push(c));
          player.food = Math.min(player.food + 3, 20);
          game.addLog(`${player.name} 使用退守：${ROWS[row.toUpperCase()].name}粮草+3`);
      }},
    // 资源
    { id: 'R01', name: '粮草', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'food_boost', abilityDesc: '粮草+2，出牌+1', rarity: RARITY.COMMON,
      play: (game, player) => {
          player.food = Math.min(player.food + 2, 20);
          player._turnBonus = (player._turnBonus || 0) + 1;
          game.addLog(`${player.name} 使用粮草：粮草+2`);
      }},
    { id: 'R02', name: '屯田', type: CARD_TYPE.STRATEGY, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      ability: 'tuntian', abilityDesc: '下回合粮草+3', rarity: RARITY.RARE,
      play: (game, player) => {
          player._nextFoodBonus = (player._nextFoodBonus || 0) + 3;
          game.addLog(`${player.name} 使用屯田：下回合粮草+3`);
      }},
    // 特殊
    { id: 'E01', name: '淝水之战', type: CARD_TYPE.STRATEGY, faction: null, cost: 3, infantry: 0, cavalry: 0, navy: 0,
      ability: 'feishui', abilityDesc: '落后时全场×2', rarity: RARITY.LEGENDARY,
      play: (game, player) => {
          const myScore = game.getPlayerScore(player);
          const oppScore = game.getPlayerScore(game.getOpponent(player));
          if (myScore < oppScore) {
              ['infantry', 'cavalry', 'navy'].forEach(r => {
                  game.getBoard(r, player).forEach(c => {
                      c._bonus = (c._bonus || 0) + c.getTotalPower();
                  });
              });
              game.addLog(`${player.name} 淝水之战：落后全场×2!`);
          } else {
              game.addLog(`${player.name} 淝水之战：未满足条件`);
          }
      }},
    { id: 'E02', name: '钟离大捷', type: CARD_TYPE.STRATEGY, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      ability: 'zhongli_jie', abilityDesc: '水军+10 骑兵-3', rarity: RARITY.EPIC,
      play: (game, player) => {
          game.getBoard('navy', player).forEach(c => { c._bonus = (c._bonus || 0) + 10; });
          game.getBoard('cavalry', player).forEach(c => { c._bonus = (c._bonus || 0) - 3; });
          game.addLog(`${player.name} 钟离大捷：水军+10 骑兵-3`);
      }},

    // ===== 天时牌 (5张) =====
    { id: 'W01', name: '暴风雪', type: CARD_TYPE.WEATHER, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      abilityDesc: '步兵→1，2回合', rarity: RARITY.RARE, duration: 2,
      targetRow: 'infantry',
      play: (game, player) => {
          game.addWeather({ type: 'infantry', duration: 2, name: '暴风雪' });
          game.addLog(`${player.name} 发动暴风雪：步兵阵→1`);
      }},
    { id: 'W02', name: '梅雨连绵', type: CARD_TYPE.WEATHER, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      abilityDesc: '骑兵→1，2回合', rarity: RARITY.RARE, duration: 2,
      targetRow: 'cavalry',
      play: (game, player) => {
          game.addWeather({ type: 'cavalry', duration: 2, name: '梅雨连绵' });
          game.addLog(`${player.name} 发动梅雨连绵：骑兵阵→1`);
      }},
    { id: 'W03', name: '长江洪水', type: CARD_TYPE.WEATHER, faction: null, cost: 2, infantry: 0, cavalry: 0, navy: 0,
      abilityDesc: '水军→1，2回合', rarity: RARITY.RARE, duration: 2,
      targetRow: 'navy',
      play: (game, player) => {
          game.addWeather({ type: 'navy', duration: 2, name: '长江洪水' });
          game.addLog(`${player.name} 发动长江洪水：水军阵→1`);
      }},
    { id: 'W04', name: '旱灾', type: CARD_TYPE.WEATHER, faction: null, cost: 3, infantry: 0, cavalry: 0, navy: 0,
      abilityDesc: '全场-2，3回合', rarity: RARITY.EPIC, duration: 3,
      play: (game, player) => {
          game.addWeather({ type: 'all', duration: 3, name: '旱灾', effect: -2 });
          game.addLog(`${player.name} 发动旱灾：全场-2`);
      }},
    { id: 'W05', name: '蝗灾', type: CARD_TYPE.WEATHER, faction: null, cost: 4, infantry: 0, cavalry: 0, navy: 0,
      abilityDesc: '全场-3，2回合', rarity: RARITY.EPIC, duration: 2,
      play: (game, player) => {
          game.addWeather({ type: 'all', duration: 2, name: '蝗灾', effect: -3 });
          game.addLog(`${player.name} 发动蝗灾：全场-3`);
      }},

    // ===== 特殊牌 (1张) =====
    { id: 'F01', name: '细作', type: CARD_TYPE.SPECIAL, faction: null, cost: 0, infantry: 0, cavalry: 0, navy: 0,
      ability: 'spy', abilityDesc: '给对方+3，查看1张手牌', rarity: RARITY.RARE,
      play: (game, player) => {
          const opp = game.getOpponent(player);
          const oppScore = game.getPlayerScore(opp);
          game.addScore(opp, 3);
          if (opp.hand.length > 0) {
              const peek = opp.hand[Math.floor(Math.random() * opp.hand.length)];
              game.addLog(`${player.name} 使用细作：对方+3，看到${peek.name}(${peek.cost}费)`);
              game._spyReveal = { player: player, card: peek };
          } else {
              game.addLog(`${player.name} 使用细作：对方+3`);
          }
      }},

    // ===== 额外反制牌 =====
    { id: 'X01', name: '晴天符', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'clear_weather', abilityDesc: '解除一张天时', rarity: RARITY.COMMON,
      play: (game, player) => {
          if (game.activeWeathers.length > 0) {
              const removed = game.activeWeathers.pop();
              game.addLog(`${player.name} 使用晴天符：解除${removed.name}`);
          }
      }},
    { id: 'X02', name: '坚壁清野', type: CARD_TYPE.STRATEGY, faction: null, cost: 1, infantry: 0, cavalry: 0, navy: 0,
      ability: 'remove_weather', abilityDesc: '移除场上一张天时', rarity: RARITY.COMMON,
      play: (game, player) => {
          if (game.activeWeathers.length > 0) {
              const removed = game.activeWeathers.shift();
              game.addLog(`${player.name} 使用坚壁清野：移除${removed.name}`);
          }
      }},
];

// ===== 牌库构建 =====
function buildDeck() {
    return CARD_DATABASE.map(c => new Card(c));
}

function shuffleDeck(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getCardById(id) {
    return CARD_DATABASE.find(c => c.id === id);
}

function getLeaderById(id) {
    const data = LEADERS.find(l => l.id === id);
    if (!data) return null;
    // Return a Leader instance with active/passive methods preserved
    const leader = new Leader(data);
    leader.active = data.active;
    leader.passive = data.passive;
    return leader;
}

function getCardsByFaction(factionId) {
    return CARD_DATABASE.filter(c => c.faction && c.faction.id === factionId);
}
