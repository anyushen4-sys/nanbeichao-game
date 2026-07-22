# 商店截图捕获指南 / Screenshot Capture Guide

> Steam 商店页面需要 5+ 张截图（最多 10 张），全部 1920×1080 PNG/JPG，≤ 5 MB/张
> 推荐采用游戏内嵌 OBS / Windows Game Bar / Electron capturePage() 录制

---

## 必备 9 张（已在 STEAM_ASSETS_PLAN.md 中列出）

| # | 场景 | 关键元素 | 屏幕分辨率 |
|---|---|---|---|
| 1 | 领袖选择页 | 9 位领袖立绘 + 阵营徽标 | 1920×1080 |
| 2 | 换牌阶段 | 手牌 7 张并排 + 金色边框 | 1920×1080 |
| 3 | 对弈界面（全景） | 三行战场 + 双方对峙 | 1920×1080 |
| 4 | 卡牌放大特写 | 1-2 张 hover + 卡图细节可见 | 1920×1080 |
| 5 | 谋略行对决 | 暗度陈仓/连环计 视觉特效 | 1920×1080 |
| 6 | 战力再平衡界面 | 粮草消耗条 + 力量对比 | 1920×1080 |
| 7 | AI 回合动画 | AI 出牌 + 战场更新 | 1920×1080 |
| 8 | 结算页（胜利） | 胜负大字 + 数据统计 | 1920×1080 |
| 9 | 封面/主菜单 | 古战场全景 + 标题字 | 1920×1080 |

---

## 捕获方法 (任选其一)

### 方法 A: Windows Game Bar (推荐)
1. 启动游戏 → 进入目标场景
2. `Win + G` → 点 "捕获" → 截图按钮 (Win+Alt+PrtScn)
3. 默认存到 `视频\Captures\` 目录
4. 用 `sips` / ImageMagick / PIL resize 到 1920×1080

### 方法 B: OBS Studio
1. 添加"游戏捕获"源 → 选择 南北朝天下对弈.exe
2. 输出设置 1920×1080 30fps + 截图快捷键
3. 单帧快捷键导出 PNG

### 方法 C: Electron 自带 capturePage()
```javascript
// 在 src/index.html 添加 ?capture=1 参数时自动触发
const win = require('electron').BrowserWindow;
if (process.argv.includes('--capture')) {
  setTimeout(async () => {
    const img = await win.getCurrentWebContents().capturePage();
    require('fs').writeFileSync('screenshot.png', img.toPNG());
  }, 5000);
}
// 然后: 南北朝天下对弈.exe --capture
// 选择不同场景时改 setTimeout 间隔
```

### 方法 D: Playwright 自动化（开发用）
仅当 T7 后续有 Playwright 集成时考虑。当前不带 Playwright 跑得过重。

---

## 当前截图状态

**尚未捕获**。这是 T7 任务中**必找用户**的项目之一：
- 用户需在游戏内逐一进入上述 9 个场景
- 截图保存到 `SteamAssets/screenshots/screenshot_01..09.png`
- 必须保证：UI 显示清晰、文字无遮挡、特效完整呈现

## 临时占位（可选）

如果 v1.0 不打算首批 Steam 上线时上传截图，可暂不上传 screenshots （Steam 允许先 store-page-live-pending 状态），但商店审核会被打回要求至少 5 张。

**最实际做法：用户先上传已捕获的 5 张关键截图（领袖选择/换牌/对弈/结算/封面），其余 4 张可在 v1.01 patch 后补。**
