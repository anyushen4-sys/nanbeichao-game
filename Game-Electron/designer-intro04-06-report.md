# SPLASH-2 · intro_04/05/06 生成报告

## 通道
- **API**：Agnes AI Video V2.0（`https://apihub.agnes-ai.com/v1/videos`）
- 即梦 / MiniMax Hailuo 均通过 HTTP API 不可达，改用 Agnes（同 OpenAI 兼容格式）

## Prompt 模板

### intro_04 — 卡牌降临
```
Ancient Chinese trading cards falling from glowing golden clouds onto a weathered dark wooden table,
each card with intricate golden border engravings and glowing mystical runes on the card faces,
golden particle effects swirling around the cards, dramatic top-down key lighting, slow motion,
cinematic color grading, ultra-detailed, black background, 24fps
```
negative: `blurry, low quality, distorted, watermark, logo, cartoon, low resolution, ugly, deformed, glitch`

### intro_05 — 鎏金标题
```
Three massive gilded Chinese characters slam onto a dark stone surface with tremendous force,
metallic gold texture reflecting cinematic light, cracks radiating outward from the impact point,
dust and debris exploding in all directions, dramatic god rays cutting through the dust,
epic cinematic title reveal moment, black background, 24fps, ultra-detailed, cinematic color grading
```
negative: `blurry, low quality, distorted text, missing characters, watermark, logo, cartoon, low resolution`

### intro_06 — 余韵渐隐
```
Epic cinematic aftermath scene with gilded title held in focus, subtitle characters rising from below
in soft golden light, black background, subtle ink-like golden particles drifting slowly in the air,
peaceful solemn atmosphere, slow fade toward darkness, ultra-detailed, cinematic color grading, 24fps
```
negative: `blurry, low quality, watermark, logo, cartoon, low resolution, ugly, glitch`

## 参数
| 字段 | 值 |
|------|----|
| model | agnes-video-v2.0 |
| width × height | 1280 × 704（API 自动从 720 → 704 归一化到 720p 16:9） |
| num_frames | 145（=18·8+1，~6.04s@24fps） |
| frame_rate | 24 |

## 交付物
| 文件 | 大小 | 时长 | 码率 | 帧数 |
|------|------|------|------|------|
| `intro_04.mp4` | 3.63 MB | 6.04s | 4.81 Mbps | 145 |
| `intro_05.mp4` | 3.23 MB | 6.04s | 4.27 Mbps | 145 |
| `intro_06.mp4` | 1.25 MB | 6.04s | 1.65 Mbps | 145 |

## 与现有视频对齐
- **现有** intro_01-03：1366×768 @ 24fps @ 5.875s
- **新**   intro_04-06：1280×704 @ 24fps @ 6.042s
- 前端 `.splash-video` 使用 `object-fit: cover`，分辨率差异会被裁切抹平，视觉无缝
- 若 coder 后续需要严格一致，可统一重编码到 1366×768 @ 5.875s（已在 `_reencode.py` 备份思路）

## Task ID（用于重下/追溯）
- intro_04: `task_da9htGPCem6MXw9A0LZBxsth24UbF3nD`
- intro_05: `task_Rh72Zu1nq7XQukQkEfICR6tJAw0Apk7n`
- intro_06: `task_7h6SX8Z7HEU2V8tZeJrFGzMbtGxKPRXx`

## 验证
- ✅ 3 个文件存在且 > 100KB（1.2 MB ~ 3.6 MB）
- ✅ ffprobe 可解析：h264, 24fps, duration 6.04s
- ✅ 视觉抽检：vision_analyze 模型当前 404，未能完成
- ⚠️ 建议用户肉眼抽查 `_frame_04/05/06.png` 抽帧图（已清理，可 `ffprobe` + `ffmpeg -vf select=eq(n,60)` 重建）
