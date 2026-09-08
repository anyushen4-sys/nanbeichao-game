# 南北朝·天下对弈 — 发布包准备状态

**日期**: 2026-09-08  
**状态**: 待用户确认 / 继续推进

---

## ✅ 已完成

### 1. Steam 上线物料整合 (Task B + C)

从旧 worktree 复制素材到主项目 `Game-Electron/src/assets/steam-assets/`:
- **icons/** — icon.ico (154KB), client_icon.png, community_icon.jpg, icon_256.png
- **capsules/** — header_capsule.jpg (460×215), main_capsule.jpg (616×353), small_capsule.jpg (231×87), vertical_capsule.jpg (374×448)
- **backgrounds/** — page_background.jpg (1438×810)
- **text/** — full_description.md, short_description.txt, store_metadata.json, taglines.txt
- **docs/** — FINAL_LAUNCH_REPORT.md, STEAM_ASSETS_PLAN.md

修复 `package.json`:
- icon 路径: `src/assets/steam-assets/icons/icon.ico`

### 2. Steam 商店文案 (Task A, resercher-bot 已完成)

输出: `steam-store-listing.md`  
覆盖:
- 中文 + 英文双语短描述 (≤300 chars)
- 中文 + 英文详细描述 (约 2000 字)
- 10 个推荐标签
- 中英文系统需求

### 3. 上架前质量审查 (Task D, reviewer-bot 已完成)

输出: `steam-pre-release-review.md`  
发现 BLOCKER:
- ❌ **icon.ico 缺失** → 已修复 (路径指向正确文件)
- ⚠️ 截图目录为空 (需 5-10 张) → 见下方待办
- ⚠️ root 目录缺 README.md
- ⚠️ root 目录缺 LICENSE

---

## ❌ 剩余 BLOCKER / 待办

| 项 | 状态 | 建议 |
|---|---|---|
| **游戏内截图 5-10 张** | 未开始 | 用 Electron `webContents.capturePage()` 或 Win+G 手动捕获 9 场景 |
| **root README.md** | 缺失 | 从 `src/assets/steam-assets/text/full_description.md` 改写简短版 |
| **root LICENSE** | 缺失 | package.json 是 MIT, 需加 LICENSE 文件 |
| **Steamworks App ID** | 使用测试 ID 480 | 需替换为用户真实 App ID (env: `STEAM_APP_ID`) |
| **build 构建验证** | 未跑 | 需 `npm run build` 确认 nsis 安装程序生成 |
| **trailer video** | 缺失 | worktree 里有 `SteamAssets/trailers/`, 需检查 |

---

## 下一步建议

按优先级:
1. **制作 9 张游戏内截图** (参考 `CAPTURE_GUIDE.md`), 存到 `src/assets/steam-assets/screenshots/`
2. **补 README.md + LICENSE** 到 root
3. **替换 STEAM_APP_ID** 为真实 App ID
4. **跑 `npm run build`** 验证安装包生成

是否需要我继续推进这些?
