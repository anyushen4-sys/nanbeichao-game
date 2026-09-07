# BGM 音乐素材目录

游戏按 `G.phase` 自动切换 4 轨 BGM:

| 文件名 | 场景 | 实际素材 | 艺术家 |
|--------|------|---------|--------|
| `leader_select.mp3` | 选将 / 菜单 / 教程 / 换牌 / 设置 | Chinese Lunar New Year | Viacheslav |
| `playing.mp3` | 对战 / 结算中 | Total War (Epic Action Cinematic Trailer Main) | AudioAtlant |
| `victory.mp3` | 玩家胜利 | Epic - Epic Music | Pavel |
| `defeat.mp3` | 玩家失败 | Sad - Sad Music | Pavel |

## 来源

所有素材下载自 [Pixabay Music](https://pixabay.com/music/),遵循
**Pixabay Content License**（免费,无需署名,允许商用,禁止单独转售）。

## 缺失时游戏行为

如果某个 `.mp3` 不存在,游戏照常运行(BGM 代码 try/catch 静默忽略,
不刷 error),仅没有该场景 BGM。

## 格式

- `.mp3`(首选,体积小,Electron + Chromium 兼容)
- 44.1kHz 或 48kHz / 128kbps+ 都行
- 循环用 (loopable) — game code 会自动 `audio.loop=true`

## 体积警告

不要 commit 大 mp3 到 git 仓库。两种处理:
1. **本地开发**: gitignore 整个 `bgm/*.mp3`,只 commit `README.md`(当前选择)
2. **正式发布**: 用 electron-builder 把 `bgm/` 打包进 asar,但不进 git

## 替换素材

如果你想换音乐,只需用同名 mp3 覆盖 `src/assets/bgm/` 下对应文件。
建议时长: leader_select 60-180s,playing 60-180s,victory/defeat 20-90s。
