# BGM 音乐素材目录

把 4 个 `.mp3` 放到这个目录,游戏自动识别:

| 文件名 | 场景 | 风格 | 建议时长 |
|--------|------|------|---------|
| `leader_select.mp3` | 选将页 | 舒缓 / 古风(古琴 / 笛子) | 30-60s 循环 |
| `playing.mp3` | 对战页 | 激昂 / 鼓点(战鼓 / 琵琶 / 急促) | 60-120s 循环 |
| `victory.mp3` | 结算获胜 | 赞歌 / 雄壮(铜管 / 凯旋) | 30-60s 一次性 |
| `defeat.mp3` | 结算失败 | 遗憾 / 凄凉(箫 / 低音弦乐) | 30-60s 一次性 |

## 缺失时游戏行为

如果某个 `.mp3` 不存在,**游戏照常运行**(BGM 代码 try/catch 静默忽略,不刷 error),仅是没有该场景的 BGM。

## 来源

推荐:
1. **AI 生成**: Suno / Udio / MusicGen — 付费 key
2. **公开素材**: FreePD / FreeMusicArchive / ccMixter — CC0 / CC-BY 协议
3. **自制**: 找音乐人/自己编曲

## 格式

- `.mp3`(首选,体积小,Electron + Chromium 兼容)
- 44.1kHz / 128kbps mono 或 stereo 都行
- 单首 ≤ 2MB 比较理想,循环用

## 体积警告

不要 commit 大 mp3 到 git 仓库(克隆时会很难受)。两种处理:

1. **本地开发**: gitignore 整个 `bgm/*.mp3`,只 commit `bgm/README.md`
2. **正式发布**: 用 electron-builder 把 `bgm/` 打包进 asar,但不进 git

当前选择: **gitignore `bgm/*.mp3`**,只 commit `README.md`。
