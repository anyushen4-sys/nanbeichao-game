# T7 [default] Steam 上传 + 最终发布 - 准备清单

**生成时间**: 2026-07-22
**生成人**: 小马 (主动接管 T7 准备工作)

---

## T7 启动前需要用户提供的材料

### A. Steam 账号 + 注册
- [ ] **Steam 账号** (https://store.steampowered.com/)
- [ ] **$100 USD Steam Direct 注册费** (信用卡/支付宝)
- [ ] **W-8BEN 税表** (中国个人开发者, Steam 后台引导填写)
- [ ] **万里汇账号** (国内收款用, 0 开户费)

### B. Steamworks 上传 (T7 自动做)
- [ ] 注册 Steamworks Partner (https://partner.steamgames.com/)
- [ ] 创建新 App
- [ ] 等待 App ID 分配 (1-3 天)
- [ ] 把 App ID 告诉 T7 → 自动配置 steamworks.js
- [ ] 跑 `steamcmd` 上传 build

---

## T7 已就绪的素材

### ✅ 已有
- 4 个胶囊图 (header/main/small/vertical capsules)
- 3 个图标 (client_icon / community_icon / icon.ico)
- 3 个背景图 (page_background / broadcast panels / library_hero)
- 商店文案 (full_description / short_description / taglines)
- 商店元数据 (store_metadata.json)
- 预告片规划 (trailer_plan.md)
- EXE 包 (95.3 MB NSIS + 168.5 MB 绿色版)

### ⚠️ 还差
- [ ] **5 张商店截图 (1920x1080)** - 需要从游戏里截
  - 主菜单页
  - 教程页
  - 领袖选择页 (9 张领袖图)
  - 对弈页 (战场 + 手牌)
  - 结算页 (1:1 棋逢对手 + 1:0 胜利 + 0:1 败北)

### 📋 截图操作流程
1. 启动游戏: `cd /g/Hermes项目/card-game-design/Game-Electron && npm start`
2. 到达每个页面后:
   - Windows 截图: `Win+Shift+S`
   - 全屏截图 (整个游戏窗口): 用 `screenshot-auto` 命令 (T1 报告里的方法)
3. 截图保存到 `SteamAssets/screenshots/`
4. 命名: `01_menu.png`, `02_tutorial.png`, `03_leaders.png`, `04_battle.png`, `05_round_result.png`

---

## T7 操作流程 (T7 接管后)

### 步骤 1: Steamworks Partner 注册
- 用户去 https://partner.steamgames.com/ 注册
- 填公司/个人 + 税号 + 银行账户 (用万里汇)
- 交 $100 USD 审核
- 审核通过后创建新 App

### 步骤 2: 配置 steamworks.js (T7 接管)
- 拿到 App ID 后, 修改 main.js 把 `STEAM_APP_ID` 从 480 改为真实 ID
- 加成就配置: Steamworks 后台 → Achievements → 配置 4 个成就 ID
- 修改 index.html `steamUnlock` 调用对应真实成就 ID

### 步骤 3: 准备商店页面 (T7 接管)
- 上传头图/胶囊图/截图
- 填写中文 + 英文描述
- 设置系统要求
- 设置定价 (按 T1 报告建议: ¥48-58 区间)
- 设置分类/标签

### 步骤 4: 上传 build (T7 接管)
```bash
cd /g/Hermes项目/card-game-design/Game-Electron
npm install -g steamcmd
steamcmd +login <username> +run_app_build_http <app_build_config>
```

### 步骤 5: 提交审核
- 等 1-3 天商店审核
- 提交 Playtest 链接 (审核 1 周)
- 通过后即可发布

### 步骤 6: 正式发布
- 设置上线日期 (T1 报告推荐 2026 年底/2027 年初)
- 收集愿望单
- 准备首发营销 (B站/抖音视频 + Steam 社区)

---

## T7 风险点

| 风险 | 缓解措施 |
|---|---|
| Steam 审核不通过 | 先提交 Playtest 试水, 提前 2 周开始 |
| 截图不够美 | 重新渲染卡图 (用 sn-image-base 增强) |
| 玩家不知道玩法 | 上传预告片 (60 秒玩法介绍) |
| 上线后没销量 | Steam 愿望单 + 社交媒体预热 |
| 退款率高 | 玩法教程做清楚, 难度曲线调好 |

---

## T7 时间线 (按 T1 报告)

```
Day 1-3:    Steamworks 注册 + 交 $100 + 填 W-8BEN
Day 3-30:   等待税务审查 (30 天强制等待期)
            ├── 截图 5 张 (T7 自动)
            ├── 写商店描述 (已有)
            ├── 集成真实 App ID (T7 自动)
            └── 创建 Playtest (T7 自动)
Day 30-44:  商店页面准备
Day 44-49:  提交审核
Day 50:     正式发布

总计: 约 7-8 周
```

---

> **T7 状态**: 等待用户给 Steam 账号 + 启动注册
> **T7 接管条件**: 用户完成 (A) 步骤后, T7 自动接管 (B) (C) (D)
