# KNOWN_ISSUES.md — Steam 上线前未修问题清单

**生成时间**: 2026-07-22 (cron 巡检 agent 接管 T4)
**来源**: TEST_REPORT.md (T3 reviewer + cron 静态 review 产出)

---

## 低优先级 — 不修 (Steam 上线不阻塞)

### bug 2: card_data_uris.js 体积过大 (865KB inline base64)
- 位置: `src/js/card_data_uris.js`
- 影响: 首次加载会拖慢游戏启动 ~1s
- 缓解: leader 图已用 `<link rel="preload">` 优化 (index.html line 5-13)
- 决策: **不修** — 性能可接受,等 Steam 上线后看用户反馈

### bug 3: card hover + selected 同时触发时 1px 抖动
- 位置: `css/game.css` line 598-625
- 状态: 434c2dd 已移除 scale,改用 translateY
- 决策: **不修** — 纯视觉细节,不影响游戏可玩性

### bug 6: assets/leaders/leader_L5.png 等可能缺失
- 位置: `src/index.html` line 14-22 preload list
- 状态: 已有 leaderImgFallback 三级降级 (PNG → 现有 PNG → 色块)
- 决策: **不修** — 已有 fallback 覆盖

### bug 7: confirmMulligan 与 startRound 重复设置 provisions=[8,8]
- 位置: `src/index.html` line 979 vs line 503
- 决策: **不修** — 不算 bug,代码冗余

---

## 中优先级 — 已修

### bug 5: playerPass 确认弹窗导致 UX 困惑 ✅
- 位置: `src/index.html` line 535-555
- 修改: 移除 `showConfirmModal(...)` 包裹,直接 pass + toast 提示
- 理由: 用户可能误以为 Pass 没生效,实际是确认弹窗在背后

### bug 4: aiShouldPass 逻辑过简 ✅ (中优先级增强)
- 位置: `src/index.html` line 653-666
- 修改: 加入局势判断 (`aiP < plP - 5 && prov <= 4` → 战略性 Pass)
- 理由: 让 AI 在必输局能主动让子,提升 AI 强度感

---

## 高优先级 — 已修

### bug 1: js/ 目录死代码 + 架构说明缺失 ✅
- 位置: `src/index.html` line 22 后插入注释
- 修改: 加 ARCH 注释,说明 inline 模式 + js/ 为历史遗留 dead code
- 理由: 避免后续维护时误以为 js/ai.js 的高级 AI 生效

---

## Steam 上线后回归测试项

- [ ] 启动速度(关注 card_data_uris.js 865KB 的初次加载)
- [ ] AI Pass 行为(看是否会在合适时机让子)
- [ ] Pass 按钮响应(应该不再弹确认弹窗,只 toast 提示)
- [ ] 主菜单/教程/领袖选择/对弈页加载(确认死代码注释未破坏任何功能)
