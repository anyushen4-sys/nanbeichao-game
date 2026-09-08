# Steam 上线前质量审查报告

**项目**: 南北朝·天下对弈 (Nan-Bei Chao: War of Dynasties)  
**分支**: `wt/splash-intro-restart` (HEAD `a324be9`)  
**日期**: 2026-09-08  
**审查方式**: Hermes 直接审查 (reviewer-bot 因 rate limit 失败)

---

## 一、BLOCKER (必须修复才能构建)

### B1. icon.ico 路径修复 ✅ 已修复
- **问题**: `package.json` 配置 `win.icon: "src/assets/icon.ico"`, 但该文件不存在
- **解决**: 从旧 worktree `.worktrees/t_f0290660/SteamAssets/icons/icon.ico` 复制到 `src/assets/steam-assets/icons/icon.ico`, 更新 `package.json` 路径
- **状态**: ✅ 已修复 (待 commit)

### B2. README.md 缺失
- **问题**: 仓库根目录无 `README.md` (GitHub 和 Steam 都需要)
- **状态**: ✅ 已新建 `README.md` (待 commit)

### B3. LICENSE 缺失
- **问题**: 仓库无 `LICENSE` 文件
- **状态**: ✅ 已新建 `LICENSE` (MIT, 待 commit)

---

## 二、WARNING (建议修复, 不影响功能)

### W1. main.js 遗留 console.log
- **位置**: main.js L71, L90, L92, L204, L318, L393 (共 8 处)
- **影响**: Steam 打包后用户调试日志泄露到控制台; 不是严重安全问题, 但不专业
- **建议**: 改用 `dlog` 或用 `DEBUG=1` 环境变量门控
- **状态**: ⚠️ 待修复 (优先级低, 可 post-launch fix)

### W2. STEAM_APP_ID 占位符
- **位置**: `main.js` 中 `STEAM_APP_ID = '480'` (Spacewar placeholder)
- **影响**: 实际 Steamworks 集成时会被 Valve 拒绝; 目前成就系统已 config, 等 App ID 批下来后只需改这一行
- **建议**: 记录到发布 checklist, App ID 获批后立即替换
- **状态**: ⚠️ 需记录, 等 App ID 后修复

### W3. 截图素材缺失
- **位置**: `SteamAssets/screenshots/` 目录为空
- **影响**: Steam 商店需要至少 5 张高质量截图 (16:9, ≥1920×1080)
- **已有**: 旧 worktree 有截图指南 `CAPTURE_GUIDE.md` (含最佳实践: 战斗画面、领袖选择、卡牌细节)
- **建议**: 手动在游戏内截图 5-8 张, 放入 `src/assets/steam-assets/screenshots/`
- **状态**: ❌ 待执行 (需人工操作)

### W4. Capsule 尺寸未验证
- **规格**: Steam 要求三种 capsule:
  - Header: 460×215 px
  - Main: 616×353 px
  - Small: 231×87 px
- **已有**: 旧 worktree 提供 `.png` 模板 + 生成说明
- **建议**: 使用已有素材或请设计师生成, 放入 `src/assets/steam-assets/capsules/`
- **状态**: ❌ 待执行 (需设计师)

---

## 三、INFO (已知但无需立即处理)

### I1. Steamworks 集成已准备
- `main.js` 中 `steamworks.js` 依赖已引入
- 16 项成就 + 6 个统计字段已定义
- Cloud Save config 已编写 (`SteamIntegration.md`)
- 缺: App ID (等 Steam 审批通过后填入)

### I2. i18n 完整性
- zh-CN.json: 347 leaf keys
- en-US.json: 348 leaf keys (多 1 key: `ui.tutorial.combo_counter_hint` — 需补全)
- zh-TW / fr-FR / es-ES: 195 keys (翻译不完整, 但非 release 必须)
- **状态**: ⚠️ 建议上线前补完 en-US 缺失的 1 key

### I3. 音频版权
- BGM 来自 Pixabay (有授权), 已在 README 中注明
- 音效为原创 (guzheng/drums/flute/bells), 无版权问题
- **状态**: ✅ 已合规

---

## 四、行动清单 (按优先级)

| 序号 | 任务 | 负责 | 状态 |
|---|---|---|---|
| 1 | 提交 icon.ico 修复 + README + LICENSE | Hermes | ⏳ 待用户确认 |
| 2 | 替换 main.js STEAM_APP_ID (等 App ID 获批后) | 用户 | ⏳ 等待 |
| 3 | 游戏内截图 5-8 张 (战斗/领袖/卡牌) | 用户 | ❌ 待执行 |
| 4 | 生成 Steam capsule 图 (460×215, 616×353, 231×87) | designer-bot | ⏳ 待命 |
| 5 | 补全 en-US.json 缺失的 1 个 key | Hermes | ⏳ 待确认 |
| 6 | 清理 main.js 中 8 处 console.log | Hermes | ⏳ 可选 post-launch |

---

## 五、发布检查清单 (Release Checklist)

- [ ] Steam App ID 获批, 更新 `main.js` 中 `STEAM_APP_ID`
- [ ] Steamworks Partner Dashboard 上传图标 + capsule
- [ ] 游戏内截图 5-8 张上传至 Steamworks
- [ ] 发布 `v1.0.0` tag
- [ ] electron-builder --win 构建成功
- [ ] Steamworks `app_build.cfg` 配置正确 (build_id / branch)
- [ ] 成就 JSON 上传至 Steamworks
- [ ] Cloud Save key 配置完成
- [ ] 短描述 + 完整描述 + 标签 + 系统需求填入 Steamworks
- [ ] 价格设置 (USD $4.99)
- [ ] 语言设置 (zh-CN interface, en-US subtitles)
- [ ] 提交审核

---

**审查结论**: 主要 blocker (icon.ico + README + LICENSE) 已修复。其余为 INFO/WARNING 级, 不影响构建。截图 + capsule 需人工/designed 补充。**可进入发布流程** (待 App ID 获批后)。
