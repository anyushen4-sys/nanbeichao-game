// ===== 南北朝卡牌博弈 — UI 渲染与交互 =====

class GameUI {
    constructor() {
        this.game = null;
        this.aiEngine = null;
        this.selectedCard = null;
        this.selectedTargetRow = null;
        this.isAnimating = false;
        this.messageTimeout = null;
    }

    // ===== 初始化 =====
    init(playerLeaderId, aiLeaderId) {
        const playerLeader = getLeaderById(playerLeaderId);
        const aiLeader = getLeaderById(aiLeaderId);

        this.game = new Game(playerLeader, aiLeader, playerLeader.faction, aiLeader.faction);
        this.aiEngine = new AIEngine('E2');

        this.showScreen('game-screen');
        this.render();
        this.addLog(`游戏开始! 你选择了${playerLeader.name}，对手是${aiLeader.name}`);

        // 如果AI是先手，自动开始AI回合
        if (this.game.getCurrentPlayer() === this.game.ai) {
            setTimeout(() => this.aiTurn(), 500);
        }
    }

    // ===== 渲染 =====
    render() {
        if (!this.game) return;

        this.renderHeader();
        this.renderOpponentBoard();
        this.renderPlayerBoard();
        this.renderHand();
        this.renderFood();
        this.renderActions();
        this.renderWeathers();
        this.renderLogs();
        this.renderRoundInfo();
    }

    // ===== 渲染头部 =====
    renderHeader() {
        const header = document.getElementById('game-header');
        if (!header) return;

        header.innerHTML = `
            <div class="header-left">
                <span class="game-title">南北朝卡牌博弈</span>
                <span class="round-info">第${this.game.currentRound}局</span>
            </div>
            <div class="header-center">
                <div class="score-board">
                    <div class="score-item">
                        <span class="score-label">对手</span>
                        <span class="score-value">${this.game.ai.wins}</span>
                    </div>
                    <div class="score-divider">-</div>
                    <div class="score-item">
                        <span class="score-label">我方</span>
                        <span class="score-value">${this.game.player.wins}</span>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button class="btn btn-small" onclick="ui.showScreen('menu-screen')">返回</button>
            </div>
        `;
    }

    // ===== 渲染对手棋盘 =====
    renderOpponentBoard() {
        const board = document.getElementById('opponent-board');
        if (!board) return;

        const ai = this.game.ai;
        const rows = ['infantry', 'cavalry', 'navy'];
        const rowNames = { infantry: '步兵阵', cavalry: '骑兵阵', navy: '水军阵' };
        const rowIcons = { infantry: '⚔️', cavalry: '🐴', navy: '🚢' };

        let html = '';
        rows.forEach(row => {
            const cards = ai.board[row] || [];
            const power = this.game.getRowScore(row, ai);
            const synergy = this.game.getRowSynergy(row, ai);

            html += `
                <div class="board-row opponent-row" data-row="${row}">
                    <div class="row-header">
                        <span class="row-icon">${rowIcons[row]}</span>
                        <span class="row-name">${rowNames[row]}</span>
                        <span class="row-power">${power}${synergy > 0 ? ' <span class="synergy">+' + synergy + '</span>' : ''}</span>
                        <span class="row-count">${cards.length}/10</span>
                    </div>
                    <div class="row-cards">
                        ${cards.map(c => this.renderBoardCard(c, true)).join('')}
                    </div>
                </div>
            `;
        });

        board.innerHTML = html;
    }

    // ===== 渲染己方棋盘 =====
    renderPlayerBoard() {
        const board = document.getElementById('player-board');
        if (!board) return;

        const player = this.game.player;
        const rows = ['infantry', 'cavalry', 'navy'];
        const rowNames = { infantry: '步兵阵', cavalry: '骑兵阵', navy: '水军阵' };
        const rowIcons = { infantry: '⚔️', cavalry: '🐴', navy: '🚢' };

        let html = '';
        rows.forEach(row => {
            const cards = player.board[row] || [];
            const power = this.game.getRowScore(row, player);
            const synergy = this.game.getRowSynergy(row, player);

            html += `
                <div class="board-row player-row ${this.selectedCard !== null ? 'selectable' : ''}"
                     data-row="${row}"
                     onclick="ui.onBoardRowClick('${row}')">
                    <div class="row-header">
                        <span class="row-icon">${rowIcons[row]}</span>
                        <span class="row-name">${rowNames[row]}</span>
                        <span class="row-power">${power}${synergy > 0 ? ' <span class="synergy">+' + synergy + '</span>' : ''}</span>
                        <span class="row-count">${cards.length}/10</span>
                    </div>
                    <div class="row-cards">
                        ${cards.map(c => this.renderBoardCard(c, false)).join('')}
                    </div>
                </div>
            `;
        });

        board.innerHTML = html;
    }

    // ===== 渲染棋盘卡牌 =====
    renderBoardCard(card, isOpponent) {
        const color = getFactionColor(card.faction);
        const power = card.getTotalPower() + (card._bonus || 0);
        const hidden = card._hidden;
        const protectedClass = card._protected ? 'protected' : '';

        if (isOpponent && hidden) {
            return `<div class="board-card face-down ${protectedClass}">
                <span class="card-back">?</span>
            </div>`;
        }

        return `
            <div class="board-card ${protectedClass}" style="border-color: ${color}">
                <div class="card-icon"><img src="assets/cards/card_${card.id}.svg" alt="${card.name}" width="40" height="40"/></div>
                <div class="card-name">${card.name}</div>
                <div class="card-power" style="color: ${power > 0 ? '#2d5a27' : '#8b0000'}">${power}</div>
            </div>
        `;
    }

    // ===== 渲染手牌 =====
    renderHand() {
        const hand = document.getElementById('hand-area');
        if (!hand) return;

        const player = this.game.player;
        const isMyTurn = this.game.getCurrentPlayer() === player;

        let html = '';
        player.hand.forEach((card, index) => {
            const isSelected = this.selectedCard === index;
            const canPlay = isMyTurn && player.food >= calculateCost(card, player);
            const color = getFactionColor(card.faction);

            html += `
                <div class="hand-card ${isSelected ? 'selected' : ''} ${canPlay ? '' : 'disabled'}"
                     style="--faction-color: ${color}"
                     onclick="ui.onHandCardClick(${index})">
                    <div class="card-cost">${card.cost}</div>
                    <div class="card-icon"><img src="assets/cards/card_${card.id}.svg" alt="${card.name}" width="40" height="40"/></div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-stats">
                        ${card.infantry > 0 ? `<span class="stat">步${card.infantry}</span>` : ''}
                        ${card.cavalry > 0 ? `<span class="stat">骑${card.cavalry}</span>` : ''}
                        ${card.navy > 0 ? `<span class="stat">水${card.navy}</span>` : ''}
                    </div>
                    <div class="card-ability">${card.abilityDesc || ''}</div>
                    <div class="card-type">${this.getCardTypeLabel(card)}</div>
                </div>
            `;
        });

        hand.innerHTML = html;
    }

    // ===== 获取卡牌类型标签 =====
    getCardTypeLabel(card) {
        switch (card.type) {
            case CARD_TYPE.GENERAL: return '将领';
            case CARD_TYPE.SOLDIER: return '士兵';
            case CARD_TYPE.STRATEGY: return '策略';
            case CARD_TYPE.WEATHER: return '天时';
            case CARD_TYPE.SPECIAL: return '特殊';
            default: return '';
        }
    }

    // ===== 渲染粮草 =====
    renderFood() {
        const foodBar = document.getElementById('food-bar');
        if (!foodBar) return;

        const player = this.game.player;
        const ai = this.game.ai;

        const playerFoodPct = (player.food / RULES.MAX_FOOD) * 100;
        const aiFoodPct = (ai.food / RULES.MAX_FOOD) * 100;

        foodBar.innerHTML = `
            <div class="food-section">
                <div class="food-label">对手粮草</div>
                <div class="food-bar-track">
                    <div class="food-bar-fill ai-food" style="width: ${aiFoodPct}%"></div>
                </div>
                <div class="food-value">${ai.food}</div>
            </div>
            <div class="food-section">
                <div class="food-label">我方粮草</div>
                <div class="food-bar-track">
                    <div class="food-bar-fill player-food" style="width: ${playerFoodPct}%"></div>
                </div>
                <div class="food-value">${player.food}</div>
            </div>
        `;
    }

    // ===== 渲染操作按钮 =====
    renderActions() {
        const actions = document.getElementById('action-bar');
        if (!actions) return;

        const player = this.game.player;
        const isMyTurn = this.game.getCurrentPlayer() === player;
        const canUseLeader = !player.leader.activeUsed && isMyTurn;

        actions.innerHTML = `
            <div class="action-buttons">
                <button class="btn btn-pass" onclick="ui.onPass()" ${isMyTurn ? '' : 'disabled'}>
                    Pass
                </button>
                <button class="btn btn-leader" onclick="ui.onLeaderAbility()" ${canUseLeader ? '' : 'disabled'}>
                    领袖: ${player.leader.name}
                    <span class="leader-desc">${player.leader.activeDesc}</span>
                </button>
                <button class="btn btn-surrender" onclick="ui.onSurrender()">
                    投降
                </button>
            </div>
            <div class="turn-indicator">
                ${isMyTurn ? '<span class="my-turn">你的回合</span>' : '<span class="opp-turn">对手回合</span>'}
            </div>
        `;
    }

    // ===== 渲染天时 =====
    renderWeathers() {
        const weathers = document.getElementById('weather-area');
        if (!weathers) return;

        if (this.game.activeWeathers.length === 0) {
            weathers.innerHTML = '<div class="no-weather">无天时效果</div>';
            return;
        }

        let html = '';
        this.game.activeWeathers.forEach(w => {
            const rowName = w.type === 'all' ? '全场' : getRowName(w.type);
            html += `
                <div class="weather-badge">
                    <span class="weather-icon">❄️</span>
                    <span class="weather-name">${w.name}</span>
                    <span class="weather-target">${rowName}</span>
                    <span class="weather-duration">剩余${w.duration}回合</span>
                </div>
            `;
        });

        weathers.innerHTML = html;
    }

    // ===== 渲染日志 =====
    renderLogs() {
        const logs = document.getElementById('log-area');
        if (!logs) return;

        const recentLogs = this.game.logs.slice(-8);
        logs.innerHTML = recentLogs.map(l => `<div class="log-entry">${l}</div>`).join('');
        logs.scrollTop = logs.scrollHeight;
    }

    // ===== 渲染回合信息 =====
    renderRoundInfo() {
        const info = document.getElementById('round-info');
        if (!info) return;

        const playerScore = this.game.getPlayerScore(this.game.player);
        const aiScore = this.game.getPlayerScore(this.game.ai);

        info.innerHTML = `
            <div class="total-score">
                <span class="score-label">对手总分</span>
                <span class="score-value">${aiScore}</span>
                <span class="score-vs">VS</span>
                <span class="score-value">${playerScore}</span>
                <span class="score-label">我方总分</span>
            </div>
        `;
    }

    // ===== 事件处理 =====
    onHandCardClick(index) {
        if (this.isAnimating) return;
        if (this.game.getCurrentPlayer() !== this.game.player) return;

        const card = this.game.player.hand[index];
        if (!card) return;

        if (this.selectedCard === index) {
            this.selectedCard = null;
        } else {
            this.selectedCard = index;
        }

        this.render();
    }

    onBoardRowClick(row) {
        if (this.isAnimating) return;
        if (this.selectedCard === null) return;
        if (this.game.getCurrentPlayer() !== this.game.player) return;

        const card = this.game.player.hand[this.selectedCard];
        if (!card) return;

        // 策略牌需要选择目标行
        if (card.type === CARD_TYPE.STRATEGY) {
            if (card.targetRow === 'enemy') {
                // 需要点击对手的行
                this.showMessage('请点击对手的行作为目标');
                return;
            }
            if (card.targetRow === 'ally') {
                // 己方行
            }
        }

        // 单位牌需要匹配行
        if (card.type === CARD_TYPE.GENERAL || card.type === CARD_TYPE.SOLDIER) {
            // 检查行容量
            if (this.game.player.board[row].length >= RULES.MAX_CARDS_PER_ROW) {
                this.showMessage('该行已满!');
                return;
            }
        }

        // 执行出牌
        const success = this.game.playerPlayCard(this.selectedCard, row);
        if (success) {
            this.selectedCard = null;
            this.render();
            this.checkRoundEnd();
        }
    }

    onOpponentRowClick(row) {
        if (this.isAnimating) return;
        if (this.selectedCard === null) return;

        const card = this.game.player.hand[this.selectedCard];
        if (!card || card.targetRow !== 'enemy') return;

        const success = this.game.playerPlayCard(this.selectedCard, row);
        if (success) {
            this.selectedCard = null;
            this.render();
            this.checkRoundEnd();
        }
    }

    onPass() {
        if (this.game.getCurrentPlayer() !== this.game.player) return;

        this.game.passTurn(this.game.player);
        this.selectedCard = null;
        this.render();

        if (!this.game.gameOver && !this.game.roundOver) {
            this.aiTurn();
        }
    }

    onLeaderAbility() {
        const player = this.game.player;
        if (player.leader.activeUsed) return;
        if (this.game.getCurrentPlayer() !== player) return;

        player.leader.active(this.game, player);
        player.leader.activeUsed = true;

        this.render();
    }

    onSurrender() {
        if (confirm('确定要投降吗?')) {
            this.game.surrender(this.game.player);
            this.showGameOver();
        }
    }

    // ===== AI 回合 =====
    async aiTurn() {
        if (this.game.gameOver || this.game.roundOver) return;
        if (this.game.getCurrentPlayer() !== this.game.ai) return;

        this.isAnimating = true;
        this.render();

        await this.sleep(800);

        // AI 决策
        const decision = this.aiEngine.decideMove(this.game);

        if (decision.action === 'pass') {
            this.game.passTurn(this.game.ai);
        } else if (decision.action === 'play') {
            // 尝试使用领袖能力
            if (this.aiEngine.shouldUseLeaderAbility(this.game)) {
                this.game.ai.leader.active(this.game, this.game.ai);
                this.game.ai.leader.activeUsed = true;
                await this.sleep(500);
            }

            const success = this.game.aiPlayCard(decision.cardIndex, decision.targetRow);
            if (!success) {
                this.game.passTurn(this.game.ai);
            }
        }

        this.isAnimating = false;
        this.render();
        this.checkRoundEnd();
    }

    // ===== 检查回合结束 =====
    checkRoundEnd() {
        if (this.game.roundOver) {
            setTimeout(() => {
                if (this.game.gameOver) {
                    this.showGameOver();
                } else {
                    this.showRoundResult(this.game.lastRoundResult || { winner: null, playerScore: 0, aiScore: 0 });
                }
            }, 500);
            return;
        }

        // 如果对手pass了且当前是玩家回合，继续
        if (this.game.ai.passed && this.game.getCurrentPlayer() === this.game.player) {
            this.showMessage('对手已Pass，你可以继续出牌或Pass');
        }

        // 如果当前是AI回合
        if (this.game.getCurrentPlayer() === this.game.ai && !this.game.ai.passed) {
            this.aiTurn();
        }
    }

    // ===== 显示回合结果 =====
    showRoundResult(result) {
        const modal = document.getElementById('modal');
        if (!modal) return;

        const winnerText = result.winner === this.game.player ? '你赢得本局!'
            : result.winner === this.game.ai ? '对手赢得本局!' : '平局!';

        modal.innerHTML = `
            <div class="modal-content">
                <h2>第${this.game.currentRound}局结束</h2>
                <div class="result-scores">
                    <span>我方: ${result.playerScore}</span>
                    <span>对手: ${result.aiScore}</span>
                </div>
                <p>${winnerText}</p>
                <p>比分: ${this.game.player.wins} - ${this.game.ai.wins}</p>
                <button class="btn" onclick="ui.startNextRound()">下一局</button>
            </div>
        `;
        modal.classList.add('show');
    }

    // ===== 开始下一局 =====
    startNextRound() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('show');

        this.game.startNewRound();
        this.render();

        // 如果AI先手
        if (this.game.getCurrentPlayer() === this.game.ai) {
            this.aiTurn();
        }
    }

    // ===== 显示游戏结束 =====
    showGameOver() {
        const modal = document.getElementById('modal');
        if (!modal) return;

        const winner = this.game.player.wins >= RULES.WINS_NEEDED ? '你' : '对手';

        modal.innerHTML = `
            <div class="modal-content game-over">
                <h2>游戏结束</h2>
                <div class="final-result">
                    <p>${winner} 获得最终胜利!</p>
                    <p>最终比分: ${this.game.player.wins} - ${this.game.ai.wins}</p>
                </div>
                <div class="game-over-buttons">
                    <button class="btn" onclick="ui.showScreen('menu-screen')">返回菜单</button>
                    <button class="btn btn-primary" onclick="ui.restart()">重新开始</button>
                </div>
            </div>
        `;
        modal.classList.add('show');
    }

    // ===== 重新开始 =====
    restart() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('show');
        this.showScreen('menu-screen');
    }

    // ===== 显示消息 =====
    showMessage(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = msg;
        toast.classList.add('show');

        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // ===== 添加日志 =====
    addLog(msg) {
        if (this.game) {
            this.game.addLog(msg);
            this.renderLogs();
        }
    }

    // ===== 显示/隐藏屏幕 =====
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }

    // ===== 工具函数 =====
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== 全局UI实例 =====
const ui = new GameUI();

// ===== 对手行点击绑定（通过事件委托） =====
document.addEventListener('click', (e) => {
    const opponentRow = e.target.closest('.opponent-row');
    if (opponentRow && ui.selectedCard !== null) {
        const row = opponentRow.dataset.row;
        if (row) ui.onOpponentRowClick(row);
    }
});
