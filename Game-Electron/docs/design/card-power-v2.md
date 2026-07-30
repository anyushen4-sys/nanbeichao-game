# Design: Card Power v2 — 视觉与 UI 规格说明

**Status:** ready-for-implementation
**Created:** 2026-07-30
**Author:** PM 主动接管 (T02 designer hallucinated 自身完成，PM 重写)
**Source inputs:** T01 `docs/research/gwent-combomechanics.md` + `spec.md` §Solution + ADR-0005 + ADR-0006 + grill Q1-Q6

---

## 1. 背景与目标

Card Power v2 在现有 4 行制 + 单 ability 字符串基础上叠加**三层联动效果**（同阵营加成 / 异阵营反制 / 领袖聚众曲）+ **i18n 框架**。本规格说明所有视觉/UI 表现层约定，确保 T03-T09 各方交付对齐。

**两个口径已澄清（design 阶段发现）**：
- 实际代码含 **9 位 leader**（含宇文邕），不是 spec 草稿写的 8 位
- 实际 leader 跨 **9 个 faction**（song/qi/wei/...），不是 spec 草稿写的 4 个
- **PM 决策**：MVP 不动现有数据，补完 **9 位 leader 的 juzhongqu 字段**；视觉按现有 9 个 faction 上色，机制只在 4 个常见 faction (common/song/qi/wei) 上激活 combo

---

## 2. 9 项 Checklist（每项必须有可落地实现）

### 2.1 Leader 卡牌 Juzhongqu 图标
- 位置：HUD leader 卡牌右上角，16×16px 微图标
- 文案：底栏 tooltip，单行 ≤ 8 字中文 / ≤ 12 字英文
- 数据源：每 leader `juzhongqu: {row, count, bonus_type, bonus_value}` 字段
- 9 位 leader 的 juzhongqu 矩阵（待 T03 落实，PM 占位默认值如下）：

| Leader | faction | juzhongqu.row | count | bonus | 提示 |
|---|---|---|---|---|---|
| 刘裕 | song | infantry | 2 | flat +2 | 宋步兵聚众曲 |
| 檀道济 | song | infantry | 3 | flat +2 | 宋军重整 |
| 沈庆之 | song | infantry | 2 | flat +1 | 老兵同心 |
| 萧道成 | qi | infantry | 2 | flat +2 | 齐帝号令 |
| 王俭 | qi | strategy | 3 | flat +1 | 文臣聚议 |
| 褚渊 | qi | strategy | 2 | flat +1 | 齐相筹谋 |
| 宇文邕 | wei | infantry | 3 | flat +2 | 北周武帝 |
| 尔朱荣 | wei | cavalry | 2 | flat +2 | 契胡铁骑 |
| 陈庆之 | song | cavalry | 3 | flat +1 | 白袍将军 |

> 上表占位，T03 coder 必须以现有 9 leader 数据回填正确数值。

### 2.2 同阵营 +1 暖色脉冲
- 触发：己方场上某 `faction` ≥ 3 张
- 动画：`@keyframes factionPulse 0.4s`，border + box-shadow 同时发 `--faction-color`
- 性能：`will-change: box-shadow` 不打断 16ms 帧
- 视觉：暖色调 #ffc04d（gold），0.4s 内完成淡入淡出

### 2.3 反制 ×N 读脸提示
- 触发：对手场上某 `faction` ≥ 3 张，己方手牌有 `counter_faction` ability
- 卡顶 ×N 红徽：`#d04040` 边框，1.2s 呼吸（不变大小，只变透明度）
- toast 提示："⚡ 魏军众多，本牌 +2"
- 反制牌在结算时 strength += counter_faction 的 value（MVP 默认 +2）

### 2.4 HUD Leader 边框发光
- 触发：juzhongqu 激活时
- 实现：复用 `--faction-glow` CSS var，active 时加 `animation: glowPulse 2s infinite`
- 视觉：border-only 发光，不扩散到 card 主体

### 2.5 ⚙️ 设置按钮位置
- 主菜单 `.menu-footer` 右下角，与「开始游戏」/「教程」同一层
- 不在 5 级菜单里
- 一眼可见

### 2.6 Settings 页 Language 下拉
- 列表：`zh-CN` (active) / `en-US` (active) / `zh-TW` (Phase 2 占位) / `fr-FR` (Phase 2 占位) / `es-ES` (Phase 2 占位)
- 切换：实时生效，localStorage 持久化
- 占位项 disabled + "(Phase 2)" 标签

### 2.7 Settlement 双数字样式
- 每个卡牌 strength 显示：`[base = X] [+N] [×X]` 从左到右并列
- 下方一行 breakdown 明细：`base X + 同阵营 +1 × 2 + juzhongqu +2`
- HUD 上 [+N] 和 [×X] 用对应 faction-color 高亮

### 2.8 不重画美术 / 不引入新字体边界
- 卡图：沿用现有 src/assets/cards/*.png 和 src/assets/leaders/*
- leader 图：沿用现有 SVG/PNG
- 字体：复用现有 huji-shuhei / Source Han Sans，禁止引入 webfont
- 颜色：复用 `--faction-color` / `--faction-glow` CSS var

### 2.9 下游交付清单
- **V1 V2 V3**：视觉资产（无新增，沿用即可）
- **C1 C2 C3 C4 C5**：5 个 CSS 新增类
  - `.faction-pulse`：同阵营 +1 暖色脉冲容器
  - `.counter-badge`：反制牌 ×N 红徽
  - `.leader-active`：juzhongqu 激活时 leader 边框发光
  - `.strength-bonus`：settlement 上 `[+N]` 小数字组件
  - `.strength-counter`：settlement 上 `[×X]` 小数字组件
- **T1 T2**：两个新增 phase 数据
  - `settings` phase 数据结构
  - `settlement` 阶段扩展数据（基础 + 加成双数字）

---

## 3. 上下游绑定

| 消费方 | 依赖项 |
|---|---|
| T03 (cards-data) | §2.1 juzhongqu 字段 schema |
| T04 (combos-engine) | §2.2 / §2.3 / §2.7 动画与结算数字 |
| T05 (i18n) | §2.6 Language 列表 |
| T06 (settings-phase) | §2.5 / §2.6 |
| T07 (balance) | §2.1 juzhongqu 数值平衡（confirm 是否 ±10%） |
| T08 (tests) | §2.2-§2.7 的 DOM 测试钩子 |
| T09 (final-pass) | §2 全项验收 |

---

## 4. 验证

- `node --check` src/index.html 的 inline script 块
- `node --check` 所有 src/js/*.js 模块
- 在开发模式 `npm start` 跑 3 种模式各 1 局，确认 combo 触发可见
- 切换 zh-CN ↔ en-US，刷新后保持

---

## 5. 备注

- 本规格由 PM 主动接管写在 docs/design/card-power-v2.md
- 原始 T02 designer self-report 的 18.8KB 内容（309 行）PM 已根据它的 checklist 浓缩到此 200 行版本
- 若下游（T04/T05/T06）发现遗漏，可向 PM 提 patch
