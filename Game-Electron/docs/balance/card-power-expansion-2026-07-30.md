# 平衡报告 — 1000 局 AI vs AI 模拟

- **日期:** 2026-07-30
- **脚本:** `test/balance.test.cjs`
- **运行:** `node test/balance.test.cjs` (stdout 输出 JSON)
- **配置:** N=1000 局 / leader; 总计 9000 局 (9 leader × 1000); AI vs AI, 伪随机
- **数据版本:** cards.json / leaders.json v2.0.0-mvp
- **引擎:** `src/js/combos.js` 三层 combo (同阵营 + 反制 + 聚众曲)
- **判定阈值:** 任一 leader 的 **juzhongqu 触发率 <10% 或 >60% → FAIL**

> ⚠️ **数据前提 (重要):** `leaders.json` 当前不含 `juzhongqu` 字段(见文件 note: "MVP: 暂不加 juzhongqu 字段, 留 Phase 2")。本脚本按 `docs/design/card-power-v2.md §2.3` 的 spec 矩阵注入 9 leader 的聚众曲参数运行;counter 牌 (ability `counter_faction`) 在 `cards.json` 中**目前不存在**, 因此 counter 触发率恒为 0 —— 这是 deck 尚未落地的真实缺口。

---

## 汇总判定: ❌ FAIL (2 leader 触发率 < 10%)

| leader | 阵营 | 聚众曲 spec | 聚众曲触发率 | 同阵营 buff 触发率 | 反制触发率 | 平均终 strength | 胜率 | 判定 |
|---|---|---|---|---|---|---|---|---|
| 宋武帝刘裕 | 宋 | 步兵 ≥2 → +2 | **38.37%** | 33.30% | 0% | 2.90 | 5.3% | ✅ |
| 齐高帝萧道成 | 齐 | 谋士 ≥2 → +1 | **0.00%** | 24.13% | 0% | 2.24 | 0.3% | ❌ FAIL |
| 梁武帝萧衍 | 梁 | 水军 ≥2 → +2 | **23.13%** | 33.33% | 0% | 2.89 | 5.6% | ✅ |
| 陈武帝陈霸先 | 陈 | 步兵 ≥3 → +2 | **21.77%** | 33.33% | 0% | 2.88 | 5.3% | ✅ |
| 北魏太武帝拓跋焘 | 魏 | 骑兵 ≥2 → +2 | **37.90%** | 33.33% | 0% | 2.89 | 7.8% | ✅ |
| 东魏孝静帝元善见 | 东魏 | 步兵 ≥2 → +1 | **37.03%** | 33.30% | 0% | 2.88 | 4.9% | ✅ |
| 西魏文帝元宝炬 | 西魏 | 步兵 ≥3 → +2 | **0.00%** | 33.33% | 0% | 2.54 | 2.9% | ❌ FAIL |
| 北齐文宣帝高洋 | 北齐 | 骑兵 ≥2 → +3 | **33.30%** | 33.30% | 0% | 2.89 | 6.7% | ✅ |
| 北周武帝宇文邕 | 北周 | 未定义 (留空) | **0.00%** | 33.33% | 0% | 2.89 | 5.4% | (不计,spec 留空) |

> 宇文邕按 spec §2.3 聚众曲留空、不触发也不报错,0% 触发率**不计入 FAIL**。

---

## 反向断言 (负样本)

| 断言 | 结果 |
|---|---|
| "common 阵营不应被 same-faction buff 触发" | ✅ **通过** — 纯 common 牌 ≥3 张时 `computeFactionBonus` 返回空 |

---

## 两个 FAIL 的结构化归因与调整建议

### 1. 齐高帝萧道成 (juzhongqu: 谋士 ≥2 → +1) — 触发率 0%

**根因 (结构性不可能):** spec 把齐的聚众曲行设为 `strategy`。但 `strategy` 行牌是**技能牌** (王俭、褚渊), 出牌即消耗、**不上棋盘**。`computeJuzhongqu` 只在**我方场上**的牌中计数, 因此 `row=strategy` 永远无法凑齐 count=2。

**建议调整:**
1. **改聚众曲行为 `infantry`** (齐步兵 ≥2 → +1)。齐阵营共有步兵 2 张 (萧道成、崔祖思), 加 common 步兵后场上可达 ≥2,触发可达 15–30%,落在通过区间。
2. 或保留策略行但把判定改为"手牌+场上" (与 counter 反制卡一致口径) —— 需改动 `computeJuzhongqu` 签名。
3. **增加 1–2 张齐阵营谋士步兵卡** (如"刘宋文士/北府谋"步兵 3–4 费), 让谋士 ≥2 能上板。

### 2. 西魏文帝元宝炬 (juzhongqu: 步兵 ≥3 → +2) — 触发率 0%

**根因 (卡组不足):** 西魏 deck 仅 5 张牌,其中步兵仅 **2 张** (宇文泰、赵贵), 骑兵 2 张, 谋士 1 张。单局最多上 2 张西魏步兵,永远达不到 count=3。

**建议调整:**
1. **降低 count 到 2** (步兵 ≥2 → +2),与东魏对称,可立即从 0% 抬到约 30%。
2. 或**新增 1 张西魏步兵卡** (如"宇文护/李弼系步兵"3–5 费),使步兵 ≥3 可达。
3. 同时建议西魏 deck 扩充到 6–7 张 (与宋、北魏对齐),否则胜率 (2.9%) 在所有 leader 中垫底,deck 广度失衡。

### 全局观察

- **同阵营 buff 触发率 ~33% (恒定):** 10 张 common 牌中步兵多、各主将牌同阵营 ≥3 的门槛对 6 张主将 deck 来说约 1/3 局能触发,合理。
- **平均终 strength ~2.9:** AI heuristic 偏保守 (early pass、低费单位优先),终局强度整体偏低,属 AI 策略特征而非 combo 失衡。
- **counter 触发率恒为 0:** `cards.json` 无任何 `counter_faction` 牌 —— 数据尚未落地 (issue 04 的异阵营反制机制)。需在数据层新增反制牌 (建议各阵营 ≥2 张, ability `counter_faction:2`) 后重跑。
- **counter 与 juzhongqu 的 deck 缺口**是 issue 04/07 共同的 Phase-2 债务;平衡判定建议等数据落地后对 8 位有定义 leader 重跑一次。

---

## 脚本运行结果 (JSON, 可机读)

脚本把完整结果 (含逐局 `round result` / `game result`) 输出到 stdout:

```bash
node test/balance.test.cjs 2>/dev/null          # 看报告
node test/balance.test.cjs 2>/dev/null > report.json   # 持久记录
N=100 node test/balance.test.cjs                # 快速试跑
```

**本次运行原始 JSON 摘要:** 见上方表格;完整输出 `totalGames=9000`, 每 leader 含 `rounds / games / winrate / 逐层 bonus key` 字段。

---

*编写: Hermes Reviewer · issue 07-balance-script · 生成时间 2026-07-30*
