// ===== 南北朝卡牌博弈 — 核心游戏逻辑 =====

class Game {
    constructor(playerLeader, aiLeader, playerFaction, aiFaction) {
        this.player = {
            name: '我方',
            leader: playerLeader.clone(),
            faction: playerFaction,
            hand: [],
            board: { infantry: [], cavalry: [], navy: [] },
            graveyard: [],
            food: RULES.START_FOOD,
            wins: 0,
            passed: false,
            _nextCardDiscount: 0,
            _nextFoodBonus: 0,
            _turnBonus: 0,
            _firstPlayUsed: false,
            _wenTaiBuffs: 0,
            _skipNextTurn: false,
            _nextDrawPenalty: 0,
        };

        this.ai = {
            name: '对手',
            leader: aiLeader.clone(),
            faction: aiFaction,
            hand: [],
            board: { infantry: [], cavalry: [], navy: [] },
            graveyard: [],
            food: RULES.START_FOOD,
            wins: 0,
            passed: false,
            _nextCardDiscount: 0,
            _nextFoodBonus: 0,
            _turnBonus: 0,
            _firstPlayUsed: false,
            _wenTaiBuffs: 0,
            _skipNextTurn: false,
            _nextDrawPenalty: 0,
        };

        this.currentRound = 1;
        this.turnCount = 0;
        this.currentPlayer = this.player;
        this.activeWeathers = [];
        this.logs = [];
        this.gameOver = false;
        this.roundOver = false;
        this.firstPlayer = null;
        this.secondPlayer = null;
        this._spyReveal = null;

        this.init();
    }

    init() {
        const deck = shuffleDeck(buildDeck());
        const half = Math.floor(deck.length / 2);
        const playerCards = deck.slice(0, half).map(c => c.clone());
        const aiCards = deck.slice(half).map(c => c.clone());

        // 手牌取前STARTING_HAND张，剩余作为牌库
        this.player.hand = playerCards.slice(0, RULES.STARTING_HAND);
        this.ai.hand = aiCards.slice(0, RULES.STARTING_HAND);
        this._playerDeck = playerCards.slice(RULES.STARTING_HAND);
        this._aiDeck = aiCards.slice(RULES.STARTING_HAND);

        // 随机先手
        if (Math.random() < 0.5) {
            this.firstPlayer = this.player;
            this.secondPlayer = this.ai;
        } else {
            this.firstPlayer = this.ai;
            this.secondPlayer = this.player;
        }
        this.currentPlayer = this.firstPlayer;

        this.addLog('=== 第' + this.currentRound + '局开始 ===');
        this.addLog(`先手: ${this.firstPlayer.name}`);
    }

    // ===== 获取玩家对手 =====
    getOpponent(player) {
        return player === this.player ? this.ai : this.player;
    }

    // ===== 判断是否后手 =====
    isSecondPlayer(player) {
        return player === this.secondPlayer;
    }

    // ===== 判断是否最后一手 =====
    isLastTurn(player) {
        const opponent = this.getOpponent(player);
        return player.passed || opponent.passed;
    }

    // ===== 获取棋盘 =====
    getBoard(row, player) {
        return player.board[row] || [];
    }

    // ===== 添加日志 =====
    addLog(msg) {
        this.logs.push(msg);
        if (this.logs.length > 100) this.logs.shift();
    }

    // ===== 获取当前玩家 =====
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    // ===== 切换玩家 =====
    switchTurn() {
        this.currentPlayer = this.getOpponent(this.currentPlayer);
        // 粮草回复
        this.currentPlayer.food = Math.min(
            this.currentPlayer.food + RULES.FOOD_REGEN,
            RULES.MAX_FOOD
        );
    }

    // ===== 抽牌 =====
    drawCards(player, n) {
        const deck = player === this.player
            ? this._playerDeck || []
            : this._aiDeck || [];

        for (let i = 0; i < n; i++) {
            if (deck.length > 0) {
                player.hand.push(deck.pop());
            } else {
                // 从全局牌库补牌
                const allCards = CARD_DATABASE.filter(c => c.type !== CARD_TYPE.LEADER);
                if (allCards.length > 0) {
                    const idx = Math.floor(Math.random() * allCards.length);
                    player.hand.push(new Card(allCards[idx]));
                }
            }
        }

        // 应用抽牌惩罚
        if (player._nextDrawPenalty > 0) {
            const toRemove = Math.min(player._nextDrawPenalty, player.hand.length);
            for (let i = 0; i < toRemove; i++) {
                const idx = Math.floor(Math.random() * player.hand.length);
                player.graveyard.push(player.hand.splice(idx, 1)[0]);
            }
            player._nextDrawPenalty = 0;
        }
    }

    // ===== 出牌到棋盘 =====
    playToBoard(card, player, row) {
        if (!player.board[row]) player.board[row] = [];
        card._rowType = row;
        player.board[row].push(card);
    }

    // ===== 从棋盘移除 =====
    removeFromBoard(card, row, player) {
        const board = player.board[row];
        const idx = board.indexOf(card);
        if (idx !== -1) {
            board.splice(idx, 1);
            player.graveyard.push(card);
        }
    }

    // ===== 清空一行 =====
    clearRow(row, player) {
        const removed = player.board[row].splice(0);
        removed.forEach(c => player.graveyard.push(c));
    }

    // ===== 添加天时 =====
    addWeather(weather) {
        this.activeWeathers.push(weather);
    }

    // ===== 移除过期天时 =====
    tickWeathers() {
        this.activeWeathers = this.activeWeathers.filter(w => {
            w.duration--;
            return w.duration > 0;
        });
    }

    // ===== 增加/减少点数 =====
    addScore(player, delta) {
        // delta 可正可负，通过临时bonus实现
        // 这个函数简单地给所有行加减
        ['infantry', 'cavalry', 'navy'].forEach(r => {
            const board = player.board[r];
            if (board.length > 0) {
                const perCard = Math.floor(delta / board.length);
                board[0]._bonus = (board[0]._bonus || 0) + delta - perCard * (board.length - 1);
                for (let i = 1; i < board.length; i++) {
                    board[i]._bonus = (board[i]._bonus || 0) + perCard;
                }
            }
        });
    }

    // ===== 获取玩家总分 =====
    getPlayerScore(player) {
        return calculatePlayerTotal(player.board, this.activeWeathers);
    }

    // ===== 获取行分数 =====
    getRowScore(row, player) {
        return getRowPowerNumber(player.board[row] || [], this.activeWeathers);
    }

    // ===== 行协同计算 =====
    getRowSynergy(row, player) {
        return calculateSynergy(player.board[row] || [], player.faction);
    }

    // ===== 执行出牌 =====
    executePlayCard(card, player, targetRow) {
        const cost = getCostPreview(card, player);

        // 检查粮草
        if (player.food < cost) return false;

        // 扣除粮草
        player.food -= cost;
        
        // 消耗折扣（只在实际出牌时扣减）
        if (player._nextCardDiscount && player._nextCardDiscount > 0) {
            player._nextCardDiscount--;
        }

        // 从手牌移除
        const idx = player.hand.indexOf(card);
        if (idx === -1) return false;
        player.hand.splice(idx, 1);

        // 如果是单位牌，放到棋盘
        if (card.type === CARD_TYPE.GENERAL || card.type === CARD_TYPE.SOLDIER) {
            this.playToBoard(card, player, targetRow);

            // 领袖被动
            if (player.leader.passive) {
                player.leader.passive(this, player, card);
            }
        }

        // 执行特殊效果
        if (card.play) {
            card.play(this, player, targetRow);
        }

        // 加入弃牌堆
        if (card.type !== CARD_TYPE.GENERAL && card.type !== CARD_TYPE.SOLDIER) {
            player.graveyard.push(card);
        }

        this.turnCount++;
        this.switchTurn();
        return true;
    }

    // ===== 玩家出牌 =====
    playerPlayCard(cardIndex, targetRow) {
        const player = this.player;
        if (player.passed) return false;

        const card = player.hand[cardIndex];
        if (!card) return false;

        const check = canPlayCard(card, player, this);
        if (!check.valid) return false;

        return this.executePlayCard(card, player, targetRow);
    }

    // ===== AI出牌 =====
    aiPlayCard(cardIndex, targetRow) {
        const ai = this.ai;
        if (ai.passed) return false;

        const card = ai.hand[cardIndex];
        if (!card) return false;

        const check = canPlayCard(card, ai, this);
        if (!check.valid) return false;

        return this.executePlayCard(card, ai, targetRow);
    }

    // ===== Pass =====
    passTurn(player) {
        player.passed = true;
        this.addLog(`${player.name} 选择 Pass`);

        // 谢安效果：场上所有玩家的谢安在Pass时触发
        ['infantry', 'cavalry', 'navy'].forEach(r => {
            player.board[r].forEach(c => {
                if (c.id === 'G04' && c.onPass) {
                    c.onPass(this, player);
                }
            });
        });

        // 检查回合是否结束
        if (this.player.passed && this.ai.passed) {
            this.endRound();
        } else if (this.currentPlayer === player) {
            this.switchTurn();
        }

        return true;
    }

    // ===== 结束一局 =====
    endRound() {
        this.roundOver = true;

        const result = determineRoundWinner(this.player.board, this.ai.board, this.activeWeathers);
        let winner = null;
        if (result === 'player1') {
            winner = this.player;
            this.player.wins++;
        } else if (result === 'player2') {
            winner = this.ai;
            this.ai.wins++;
        }
        const playerScore = calculatePlayerTotal(this.player.board, this.activeWeathers);
        const aiScore = calculatePlayerTotal(this.ai.board, this.activeWeathers);

        this.addLog(`=== 第${this.currentRound}局结束 ===`);
        this.addLog(`我方: ${playerScore}  对手: ${aiScore}`);
        this.addLog(winner ? `${winner.name} 赢得本局!` : '平局!');
        
        // 保存回合结果供UI使用
        this.lastRoundResult = { winner, playerScore, aiScore };

        // 检查是否三局两胜已决出
        if (this.player.wins >= RULES.WINS_NEEDED || this.ai.wins >= RULES.WINS_NEEDED) {
            this.gameOver = true;
            const finalWinner = this.player.wins >= RULES.WINS_NEEDED ? this.player : this.ai;
            this.addLog(`=== ${finalWinner.name} 获得最终胜利! ===`);
        }

        return { winner, playerScore, aiScore };
    }

    // ===== 开始新的一局 =====
    startNewRound() {
        this.currentRound++;
        this.turnCount = 0;
        this.roundOver = false;
        this.tickWeathers();

        // 重置玩家状态
        this.player.board = { infantry: [], cavalry: [], navy: [] };
        this.ai.board = { infantry: [], cavalry: [], navy: [] };
        this.player.passed = false;
        this.ai.passed = false;
        this.player.food = RULES.START_FOOD;
        this.ai.food = RULES.START_FOOD;
        this.player._skipNextTurn = false;
        this.ai._skipNextTurn = false;
        this.player._firstPlayUsed = false;
        this.ai._firstPlayUsed = false;
        this.player._wenTaiBuffs = 0;
        this.ai._wenTaiBuffs = 0;
        this.player._nextCardDiscount = 0;
        this.ai._nextCardDiscount = 0;
        this.player._turnBonus = 0;
        this.ai._turnBonus = 0;
        this.player._nextDrawPenalty = 0;
        this.ai._nextDrawPenalty = 0;

        // 应用上局屯田
        if (this.player._nextFoodBonus) {
            this.player.food += this.player._nextFoodBonus;
            this.player._nextFoodBonus = 0;
        }
        if (this.ai._nextFoodBonus) {
            this.ai.food += this.ai._nextFoodBonus;
            this.ai._nextFoodBonus = 0;
        }

        // 抽牌
        this.drawCards(this.player, RULES.DRAW_PER_TURN);
        this.drawCards(this.ai, RULES.DRAW_PER_TURN);

        // 先手交换
        if (this.player.wins > this.ai.wins) {
            this.firstPlayer = this.ai;
            this.secondPlayer = this.player;
        } else if (this.ai.wins > this.player.wins) {
            this.firstPlayer = this.player;
            this.secondPlayer = this.ai;
        } else {
            // 平局则交换
            [this.firstPlayer, this.secondPlayer] = [this.secondPlayer, this.firstPlayer];
        }

        this.currentPlayer = this.firstPlayer;
        this._spyReveal = null;

        this.addLog(`=== 第${this.currentRound}局开始 ===`);
        this.addLog(`先手: ${this.firstPlayer.name}`);
    }

    // ===== 投降 =====
    surrender(player) {
        this.gameOver = true;
        const winner = this.getOpponent(player);
        winner.wins = RULES.WINS_NEEDED;
        this.addLog(`${player.name} 投降! ${winner.name} 获胜!`);
    }

    // ===== 获取游戏状态快照（给AI用） =====
    getState() {
        return {
            player: this.player,
            ai: this.ai,
            currentPlayer: this.currentPlayer,
            activeWeathers: this.activeWeathers,
            currentRound: this.currentRound,
            turnCount: this.turnCount,
        };
    }
}
