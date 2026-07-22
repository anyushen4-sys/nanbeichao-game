# 宣传视频方案 / Trailer Plan — 南北朝·天下对弈

> 时长：60–90 秒 / Duration: 60–90 seconds
> 输出规格：MP4 H.264 1920×1080 30fps, AAC 音频 192kbps, ≤ 1 GB
> 上传：Steamworks → 商店页面 → 影片（最多 5 个）

---

## 时间轴 (Narrative Timeline)

| 时段 | 内容 | 配音/字幕 |
|---|---|---|
| 0:00–0:05 | 封面压黑场 (1.5s) → 标题淡入：「南北朝·天下对弈」+ 副标题"南北对峙·历史翻覆" | 古筝长音 + 鼓一记 |
| 0:05–0:15 | 九位领袖全身立绘依次划过 (3.5s/位 = 0.35s/位 x 9) | 每个 0.35s |
| 0:15–0:25 | 换牌阶段 demo (2.5s)：发牌 + 选中 + 切走 | 竹笛 counter-melody |
| 0:25–0:55 | 对弈精华 (30s)：<br>- 0:25–0:30 先手 5 张连出<br>- 0:30–0:35 暗度陈仓 翻拍<br>- 0:35–0:42 连环计 三连牌<br>- 0:42–0:50 AI 回合：对手出 3 张<br>- 0:50–0:55 战场战力条剧烈变化 | 鼓点加速 |
| 0:55–1:00 | 结算页：胜负大字 + 数据统计 | 大鼓 + 钟一记 |
| 1:00–1:05 | Logo 回正 + "现可加入 Playtest" + Steam 链接 | 收尾泛音 |

**结构**：封面 (5s) → 领袖 (10s) → 换牌 (10s) → 对弈精华 (30s) → 结算 (5s) → Logo (5s) = 65s
可剪辑 30s/45s/60s 三版。

---

## 录音 / Recording Notes

- **不使用 AI 解说**（用户偏好：纯 UI 音效 + 配乐）
- 原始音乐：用 古筝/鼓/竹笛/钟磬 四个 loop 拼接
- 录制方式：启动游戏 → Windows Game Bar / OBS Studio 录 1920×1080 60fps → 截取对弈精华段

## 截屏 (Screenshot Capture) 替代方案

若 1.0 启动不打算做 trailer，**截屏序列替代**:
- 用 Playwright 或 puppeteer 启动 Electron 后按时间线截 9 张关键帧
- 配乐 + 转场效果（FFmpeg zoompan + crossfade）
- 输出 60s mp4

## 自动截屏脚本 (Playwright-style, Electron 后台截屏)

```javascript
// Electron 主进程中加 capturePage() 调用
const { capturePage } = require('electron');
// 每 3 秒截一张 1920x1080，存到 SteamAssets/screenshots/captured/
```

可由 implementer 在 v1.0 post-launch patch 实施。当前 v1.0 可不上传影片 (影片是 Steam 选填)。
