// ===== 南北朝卡牌博弈 — AI 决策引擎 =====

class AIEngine {
    constructor(difficulty = 'E2') {
        this.difficulty = difficulty;
        this.weights = this.getWeights();
    }

    getWeights() {
        switch (this.difficulty) {
            case 'E1': return { power: 1.0, efficiency: 0, timing: 0, counter: 0 };
            case 'E2': return { power: 0.6, efficiency: 0.3, timing: 0.1, counter: 0 };
            case 'E3': return { power: 0.4, efficiency: 0.2, timing: 0.3, counter: 0.1 };
            case 'E4': return { power: 0.3, efficiency: 0.2, timing: 0.3, counter: 0.2 };
            default: return { power: 0.6, efficiency: 0.3, timing: 0.1, counter: 0 };
        }
    }

    // ===== 决策出牌 =====
    decideMove(game) {
        const ai = game.ai;
        const opponent = game.player;

        // 检查是否应该Pass
        if (this.shouldPass(game)) {
            return { action: 'pass' };
        }

        // 评估所有手牌
        const playableCards = [];
        for (let i = 0; i < ai.hand.length; i++) {
            const card = ai.hand[i];
            const cost = calculateCost(card, ai);
            if (ai.food >= cost) {
                playableCards.push({
                    index: i,
                    card: card,
                    score: this.scoreCard(card, game, ai, opponent),
                    targetRow: this.chooseTargetRow(card, game),
                    cost: cost,
                });
            }
        }

        if (playableCards.length === 0) {
            return { action: 'pass' };
        }

        // 按分数排序
        playableCards.sort((a, b) => b.score - a.score);

        // 选择最佳牌
        const best = playableCards[0];

        // E2+: 粮草管理 - 如果粮草紧张且有屯田牌
        if (this.difficulty !== 'E1' && ai.food <= 3) {
            const tuntian = playableCards.find(p => p.card.ability === 'tuntian');
            if (tuntian) {
                return { action: 'play', cardIndex: tuntian.index, targetRow: tuntian.targetRow };
            }
        }

        // E3+: 评估是否使用天时
        if (this.difficulty === 'E3' || this.difficulty === 'E4') {
            const weatherCard = playableCards.find(p => p.card.type === CARD_TYPE.WEATHER);
            if (weatherCard && this.shouldUseWeather(game, weatherCard.card)) {
                return { action: 'play', cardIndex: weatherCard.index, targetRow: weatherCard.targetRow };
            }
        }

        return { action: 'play', cardIndex: best.index, targetRow: best.targetRow };
    }

    // ===== 评分函数 =====
    scoreCard(card, game, ai, opponent) {
        const w = this.weights;
        let score = 0;

        // 点数分
        const powerScore = card.getTotalPower();
        score += powerScore * w.power;

        // 费用效率分
        const efficiency = card.cost > 0 ? powerScore / card.cost : powerScore;
        score += efficiency * 5 * w.efficiency;

        // 时机分
        const timingScore = this.evaluateTiming(card, game, ai, opponent);
        score += timingScore * w.timing;

        // 反制抗性分
        const counterScore = this.evaluateCounterResistance(card, game);
        score += counterScore * w.counter;

        // 策略牌额外分
        if (card.type === CARD_TYPE.STRATEGY) {
            score += this.evaluateStrategy(card, game, ai, opponent);
        }

        // 天时牌分
        if (card.type === CARD_TYPE.WEATHER) {
            score += this.evaluateWeather(card, game, ai, opponent);
        }

        // 特殊牌分
        if (card.type === CARD_TYPE.SPECIAL) {
            score += 3;
        }

        return score;
    }

    // ===== 时机评估 =====
    evaluateTiming(card, game, ai, opponent) {
        let score = 0;

        // 粮草充足时高费牌更有价值
        if (ai.food >= card.cost + 3) {
            score += card.cost * 2;
        }

        // 对手点数领先时，攻击牌更有价值
        const aiScore = getPlayerScoreSafe(ai, game.activeWeathers);
        const oppScore = getPlayerScoreSafe(opponent, game.activeWeathers);

        if (typeof aiScore === 'number' && typeof oppScore === 'number') {
            if (oppScore > aiScore) {
                if (card.type === CARD_TYPE.STRATEGY) score += 5;
                if (card.getTotalPower() > 5) score += 3;
            }
        }

        // 对手pass后，出大牌没意义
        if (opponent.passed) {
            if (card.getTotalPower() > 0) score -= 2;
        }

        return score;
    }

    // ===== 反制抗性评估 =====
    evaluateCounterResistance(card, game) {
        let score = 0;
        // 低费牌被杀/破阵的价值低
        if (card.cost <= 2) score += 1;
        // 高点数牌容易被针对
        if (card.getTotalPower() > 7) score -= 2;
        return score;
    }

    // ===== 策略牌评估 =====
    evaluateStrategy(card, game, ai, opponent) {
        let score = 0;

        switch (card.ability) {
            case 'atk_line':
            case 'atk_line2':
                // 评估对方行的点数
                ['infantry', 'cavalry', 'navy'].forEach(row => {
                    const rowScore = getRowPowerNumber(opponent.board[row] || [], game.activeWeathers);
                    if (rowScore > 5) score += rowScore;
                });
                break;
            case 'protect_line':
                // 己方有牌的行
                ['infantry', 'cavalry', 'navy'].forEach(row => {
                    if (ai.board[row] && ai.board[row].length > 0) score += 3;
                });
                break;
            case 'buff_line':
                ['infantry', 'cavalry', 'navy'].forEach(row => {
                    if (ai.board[row] && ai.board[row].length > 0) score += 5;
                });
                break;
            case 'retreat':
                // 粮草紧张时有价值
                if (ai.food <= 3) score += 8;
                break;
            case 'food_boost':
                if (ai.food <= 5) score += 5;
                break;
            case 'tuntian':
                if (ai.food <= 4) score += 7;
                break;
            case 'skip_turn':
                if (!opponent.passed) score += 6;
                break;
            case 'feishui':
                const aiTotal = getPlayerScoreSafe(ai, game.activeWeathers);
                const oppTotal = getPlayerScoreSafe(opponent, game.activeWeathers);
                if (typeof aiTotal === 'number' && typeof oppTotal === 'number' && aiTotal < oppTotal) {
                    score += 15;
                }
                break;
            case 'clear_weather':
            case 'remove_weather':
                if (game.activeWeathers.length > 0) score += 8;
                break;
            case 'spy':
                score += 2;
                break;
        }

        return score;
    }

    // ===== 天时牌评估 =====
    evaluateWeather(card, game, ai, opponent) {
        let score = 0;

        // 对手在某行有更多牌时更有价值
        ['infantry', 'cavalry', 'navy'].forEach(row => {
            const oppRow = opponent.board[row] || [];
            const aiRow = ai.board[row] || [];
            if (oppRow.length > aiRow.length) score += oppRow.length * 2;
        });

        // 旱灾/蝗灾对全场有效
        if (card.ability === 'all' || card.id === 'W04' || card.id === 'W05') {
            const oppTotal = opponent.board.infantry.length + opponent.board.cavalry.length + opponent.board.navy.length;
            score += oppTotal * 1.5;
        }

        return score;
    }

    // ===== 是否使用天时 =====
    shouldUseWeather(game, card) {
        const ai = game.ai;
        const opponent = game.player;

        // 己方牌数少于对方时使用
        const aiTotal = ai.board.infantry.length + ai.board.cavalry.length + ai.board.navy.length;
        const oppTotal = opponent.board.infantry.length + opponent.board.cavalry.length + opponent.board.navy.length;

        return oppTotal > aiTotal + 2;
    }

    // ===== 选择目标行 =====
    chooseTargetRow(card, game) {
        const ai = game.ai;
        const opponent = game.player;

        // 需要选择敌方行的牌
        if (card.targetRow === 'enemy') {
            let bestRow = 'infantry';
            let bestScore = 0;

            ['infantry', 'cavalry', 'navy'].forEach(row => {
                const score = getRowPowerNumber(opponent.board[row] || [], game.activeWeathers);
                if (score > bestScore) {
                    bestScore = score;
                    bestRow = row;
                }
            });
            return bestRow;
        }

        // 需要选择己方行的牌
        if (card.targetRow === 'ally') {
            let bestRow = 'infantry';
            let bestScore = 0;

            ['infantry', 'cavalry', 'navy'].forEach(row => {
                const score = ai.board[row] ? ai.board[row].length : 0;
                if (score > bestScore) {
                    bestScore = score;
                    bestRow = row;
                }
            });
            return bestRow;
        }

        // 单位牌：放到点数最低的行
        if (card.infantry > 0 || card.cavalry > 0 || card.navy > 0) {
            const rowScores = {
                infantry: getRowPowerNumber(ai.board.infantry || [], game.activeWeathers),
                cavalry: getRowPowerNumber(ai.board.cavalry || [], game.activeWeathers),
                navy: getRowPowerNumber(ai.board.navy || [], game.activeWeathers),
            };

            // 根据卡牌的主要兵种选择
            if (card.infantry >= card.cavalry && card.infantry >= card.navy) return 'infantry';
            if (card.cavalry >= card.navy) return 'cavalry';
            return 'navy';
        }

        return 'infantry';
    }

    // ===== 是否应该Pass =====
    shouldPass(game) {
        const ai = game.ai;
        const opponent = game.player;

        // 已经pass了
        if (ai.passed) return false;

        // 没有可出的牌
        if (ai.hand.length === 0) return true;

        // 检查是否所有手牌都出不起
        const playable = ai.hand.some(c => ai.food >= calculateCost(c, ai));
        if (!playable) return true;

        const aiScore = getPlayerScoreSafe(ai, game.activeWeathers);
        const oppScore = getPlayerScoreSafe(opponent, game.activeWeathers);

        if (typeof aiScore !== 'number' || typeof oppScore !== 'number') return false;

        // 对手已pass
        if (opponent.passed) {
            // 已经领先，pass
            if (aiScore > oppScore) return true;
            // 差距不大，继续出牌追赶
            if (oppScore - aiScore <= 5 && ai.hand.length > 0) return false;
            return true;
        }

        // E1: 简单策略
        if (this.difficulty === 'E1') {
            // 领先超过5分就pass
            if (aiScore - oppScore >= 5) return Math.random() < 0.6;
            return false;
        }

        // E2+: 考虑更多因素
        const lead = aiScore - oppScore;

        // 领先较多
        if (lead >= 8) return Math.random() < 0.7;
        if (lead >= 5) return Math.random() < 0.4;
        // 落后较多
        if (lead <= -8) return Math.random() < 0.2;
        // 差距小
        if (Math.abs(lead) <= 3) return Math.random() < 0.15;

        return false;
    }

    // ===== 领袖能力使用决策 =====
    shouldUseLeaderAbility(game) {
        const ai = game.ai;
        if (ai.leader.activeUsed) return false;

        const aiScore = getPlayerScoreSafe(ai, game.activeWeathers);
        const oppScore = getPlayerScoreSafe(game.player, game.activeWeathers);

        if (typeof aiScore !== 'number' || typeof oppScore !== 'number') return false;

        // 落后时使用
        if (oppScore > aiScore) return true;

        // 最后一局
        if (game.currentRound === 3) return true;

        // 手牌少时使用
        if (ai.hand.length <= 3) return true;

        return false;
    }
}

// ===== 安全获取分数 =====
function getPlayerScoreSafe(player, weather) {
    try {
        return calculatePlayerTotal(player.board, weather);
    } catch {
        return 0;
    }
}
