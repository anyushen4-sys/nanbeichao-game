# 南北朝·天下对弈 (Nan-Bei Chao: War of Dynasties)

> 一局南北，半部中国史。
> One game of North vs. South, half a history of China.

---

## 关于这款游戏 / About the Game

公元 420 年至 589 年，中国进入南北朝——南朝宋、齐、梁、陈更替嬗递，北朝北魏、东魏、西魏、北齐、北周递嬗兴革。九位传奇领袖逐鹿中原，63 位青史留名的武将纵横驰骋。

策略卡牌游戏 **《南北朝·天下对弈》** 以这一波澜壮阔的时代为背景，将史实人物、典故战役、兵种韬略化为可上手的对局。每位领袖都有独特阵营基调（宋·紫、齐·青、梁·金、陈·绿 vs 北魏·红、东魏·蓝、西魏·灰、北齐·橙、北周·暗金），每位武将有专属水墨立绘——所有卡面插画均为人工智能辅助生成的水墨武将风格，色调以赭石、藤黄、墨黑为主，辅以阵营主色高光。

A strategic card game set in China's Northern and Southern Dynasties (420–589 AD). Nine dynasties, sixty-three generals, and one battlefield where history pivots on the cards you play.

---

## 核心玩法 / Core Gameplay

### 三行战场 / Three Battle Lines
战场分为三行：
- **步兵行 (Infantry)** — 步战、攻城、近战搏杀
- **骑兵行 (Cavalry)** — 突袭、奔射、冲锋陷阵
- **水军行 (Navy)** — 战船、长江天堑、火攻

每一行各自计算战力，最终以"剩余战力"判定胜负。
Three battle lines: Infantry, Cavalry, Navy — each scored on residual might after the dust settles.

### 四大兵种 / Four Card Types
- **武官 (Officer)** — 基础将领，每位独有主动/被动技能
- **谋略 (Strategy)** — 改变局势的计策牌：过牌、暗度陈仓、连环计、反间、苦肉……
- **辎重 (Supply)** — 调粮、增援、护道
- **战术 (Tactic)** — 临时增益、强杀、阵型变换

### 领袖被动 / Leader Passives
九位领袖各有专属被动技能：
- **刘裕 (宋武帝)** — 「却月阵」：骑兵行首回合战力 +30%
- **萧衍 (梁武帝)** — 「崇佛」：每场限一次，谋略牌费用 -1
- **宇文邕 (北周武帝)** — 「灭佛兴道」：谋略与辎重互斥时优先谋略
……（共 9 种，体现各领袖史实决策风格）

### AI 对手 / AI Opponents
三种难度：
- **新学 (Novice)** — 适合熟悉卡牌机制
- **中坚 (Veteran)** — 兼顾思考和娱乐
- **大师 (Master)** — 会算牌、识破换牌、精准把握过牌窗口

每场 AI 对手根据所选阵营随机抽取，保证重玩价值。

---

## 视觉与音乐 / Visual & Audio Style

水墨古风画境 / Ink-wash historical aesthetic。

- **色调**：深棕 `#2A2018`、金高光 `#D4A840`、墨黑 `#1E1812`
- **字体**：篆书/隶书（标题），宋体（正文）
- **音效**：古筝、鼓点、竹笛、钟磬——全部为原创音频，无版权问题
- **音乐**：每领袖有专属主题旋律（按阵营色衍生）

---

## 单局流程 / Match Flow

```
选将 → 换牌 → 出牌 → 回合结算 → 下回合 → 胜负判定
```

单局时长约 **10–25 分钟**，视难度和出牌节奏。

---

## 系统需求 / System Requirements

| | 最低 (Minimum) | 推荐 (Recommended) |
|---|---|---|
| OS | Windows 10 (64-bit) | Windows 10/11 (64-bit) |
| CPU | 双核 1.6 GHz | 四核 2.0 GHz+ |
| RAM | 4 GB | 8 GB |
| GPU | 集成显卡 (Intel HD 4000+) | 独立显卡 |
| Disk | 200 MB | 500 MB |
| Display | 1280×720 | 1920×1080 |
| Network | 不需要 | 不需要（纯单机） |
| Input | 鼠标 + 键盘 | 鼠标 + 键盘 |

**完全单机游戏，无内购，无广告，无追踪，无云存档依赖。**
Fully offline. No microtransactions, no ads, no telemetry, no cloud-save requirement.

---

## 成就与解锁 / Achievements

16 项 Steam 成就：
- 初战告捷、百战不殆、九转功成（一轮通关 9 领袖）、摧枯拉朽（满血大胜）、一鼓作气（无跳过通关）
- 9 位领袖阵营各一项"X武 X扬威"（用 X 阵营赢 5 场）
- 速战速决（5 回合内取胜）、连环妙策（单局 3+ 谋略牌并获胜）

See [SteamIntegration.md](../SteamIntegration.md) for the technical design.

---

## 路线图 / Roadmap (v1.0 launch scope)

- ✅ 9 领袖 × 4-8 张专属卡 = 63 张武将卡
- ✅ AI 三难度
- ✅ Steam 成就 + Cloud Save
- 🔜 后续 DLC：多人对战（Steam P2P）、剧情战役模式

---

## 关于开发 / About the Developer

独立开发。Steam 首发，仅限 Windows 桌面版（Electron 28）。

---

## 中文 EN Subs

- 短描述 (steam 商店展示上限 ~250 字)
- 完整描述 (中文主，英文副)
- 标签: Strategy, Card Game, Historical, Single Player, Turn-Based, Indie, 2D, Tabletop
- 分类: Strategy > Card Game > Turn-Based
