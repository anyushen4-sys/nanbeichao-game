// ===== 南北朝卡牌博弈 — 规则引擎 =====

const RULES = {
    // 每行最大卡牌数
    MAX_CARDS_PER_ROW: 10,

    // 初始粮草
    START_FOOD: 10,

    // 每回合粮草回复
    FOOD_REGEN: 1,

    // 起手牌数
    STARTING_HAND: 10,

    // 抽牌数
    DRAW_PER_TURN: 1,

    // 克制加成
    COUNTER_BONUS: 2,

    // 行协同加成（同阵营>=3张）
    SYNERGY_THRESHOLD: 3,
    SYNERGY_BONUS: 2,

    // 最大粮草
    MAX_FOOD: 20,

    // 三局两胜
    WINS_NEEDED: 2,
    MAX_ROUNDS: 3,

    // 行克制关系: infantry -> cavalry -> navy -> infantry
    COUNTER_MAP: {
        infantry: 'cavalry',
        cavalry: 'navy',
        navy: 'infantry',
    },
};

// ===== 克制计算 =====
function calculateCounterBonus(infantryRow, cavalryRow, navyRow) {
    let bonus = 0;
    // 步兵克制骑兵
    if (infantryRow.length > 0 && cavalryRow.length > 0) {
        bonus += RULES.COUNTER_BONUS;
    }
    // 骑兵克制水军
    if (cavalryRow.length > 0 && navyRow.length > 0) {
        bonus += RULES.COUNTER_BONUS;
    }
    // 水军克制步兵
    if (navyRow.length > 0 && infantryRow.length > 0) {
        bonus += RULES.COUNTER_BONUS;
    }
    return bonus;
}

// ===== 行协同计算 =====
function calculateSynergy(row, faction) {
    if (!faction) return 0;
    const sameFaction = row.filter(c => c.faction && c.faction.id === faction.id);
    if (sameFaction.length >= RULES.SYNERGY_THRESHOLD) {
        return RULES.SYNERGY_BONUS;
    }
    return 0;
}

// ===== 天时效果计算 =====
function calculateWeatherEffect(card, weather) {
    let effect = 0;
    weather.forEach(w => {
        if (w.type === 'all') {
            effect += (w.effect || -2);
        } else if (w.type === card._rowType) {
            if (card._weatherResistant) {
                effect -= 1;
            } else {
                const power = card.getTotalPower() + (card._bonus || 0);
                if (power > 1) {
                    effect = 1 - power;
                }
            }
        }
    });
    return effect;
}

// ===== 行点数计算 =====
function calculateRowPower(cards, weather) {
    let total = 0;
    let hasHidden = false;
    cards.forEach(c => {
        let power = c.getTotalPower() + (c._bonus || 0);
        if (weather && weather.length > 0) {
            const weatherEffect = calculateWeatherEffect(c, weather);
            if (weatherEffect !== 0) {
                power += weatherEffect;
            }
        }
        power = Math.max(power, 0);
        if (c._hidden) {
            hasHidden = true;
        } else {
            total += power;
        }
    });
    return { total, hasHidden };
}

// ===== 玩家总点数 =====
function calculatePlayerTotal(board, weather) {
    let total = 0;
    let hasAnyHidden = false;

    ['infantry', 'cavalry', 'navy'].forEach(row => {
        const result = calculateRowPower(board[row] || [], weather);
        total += result.total;
        if (result.hasHidden) hasAnyHidden = true;
    });

    // 返回数字或'?''（保持向后兼容）
    return hasAnyHidden ? '??' : total;
}

// ===== 行点数（数字） =====
function getRowPowerNumber(cards, weather) {
    let total = 0;
    cards.forEach(c => {
        let power = c.getTotalPower() + (c._bonus || 0);
        if (weather && weather.length > 0) {
            const weatherEffect = calculateWeatherEffect(c, weather);
            if (weatherEffect !== 0) {
                power += weatherEffect;
            }
        }
        total += Math.max(power, 0);
    });
    return total;
}

// ===== 费用预览（不消耗折扣） =====
function getCostPreview(card, player) {
    let cost = card.cost;
    if (player._nextCardDiscount && player._nextCardDiscount > 0) {
        cost = Math.max(0, cost - player._nextCardDiscount);
    }
    return cost;
}

// ===== 费用计算（考虑折扣，向后兼容） =====
function calculateCost(card, player) {
    return getCostPreview(card, player);
}

// ===== 出牌合法性检查 =====
function canPlayCard(card, player, gameState) {
    const cost = calculateCost(card, player);

    // 粮草检查
    if (player.food < cost) return { valid: false, reason: '粮草不足' };

    // 回合跳过检查
    if (player._skipNextTurn) return { valid: false, reason: '被奇袭跳过' };

    // 策略牌需要目标行
    if (card.type === CARD_TYPE.STRATEGY && card.targetRow === 'enemy') {
        // 需要对方有牌的行
    }
    if (card.type === CARD_TYPE.STRATEGY && card.targetRow === 'ally') {
        // 需要己方有牌的行
    }

    return { valid: true, cost };
}

// ===== 局结束判定 =====
function shouldEndRound(player1, player2) {
    return player1.passed && player2.passed;
}

// ===== 胜者判定 =====
function determineRoundWinner(board1, board2, weather) {
    const score1 = calculatePlayerTotal(board1, weather);
    const score2 = calculatePlayerTotal(board2, weather);

    if (score1 === '??' && score2 === '??') return 'draw';
    if (score1 === '??') return 'player2';
    if (score2 === '??') return 'player1';

    if (score1 > score2) return 'player1';
    if (score2 > score1) return 'player2';
    return 'draw';
}

// ===== 行名称映射 =====
function getRowName(rowId) {
    const map = {
        infantry: '步兵阵',
        cavalry: '骑兵阵',
        navy: '水军阵',
    };
    return map[rowId] || rowId;
}

// ===== 阵营名称 =====
function getFactionName(faction) {
    if (!faction) return '中立';
    return faction.name || faction.id;
}

// ===== 阵营颜色 =====
function getFactionColor(faction) {
    if (!faction) return '#888';
    return faction.color || '#888';
}
