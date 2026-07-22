# FINAL_LAUNCH_REPORT.md
# 南北朝·天下对弈 — Steam 上线最终报告

> **作者**: T7 自动化 agent (kanban worker)
> **日期**: 2026-07-22
> **状态**: 🚧 **构建就绪，发布凭证待用户提供**

---

## 一、TL;DR (摘要)

游戏的 `dist/*.exe` 已实际构建、启动并验证 — **T6 build 链路已经打通**。
所有可由 agent 自行完成的 Steam 商店物料（capsules、背景、图标、文案、价格建议）已经产出在 `SteamAssets/`。
**剩余 Step 2 ~ Step 5（Steamworks 注册、SteamPipe 上传、商店页提交、Steam 客户端验证）只能由真人用户执行 —— 它们需要：**
1. 100 USD Steamworks Partner 注册费（仅第一次，每年每个组织 100 USD）
2. 用户的真实身份信息（用于 W-8 税表 + Steam 协议）
3. 用户本人在 Steam 客户端内登录 / 批准 / 验收

---

## 二、已完成的产物 (Agent-side 完成)

### 2.1 可分发的构建产物

| 文件 | 大小 | 状态 |
|---|---|---|
| `dist/南北朝天下对弈 Setup 1.0.0.exe` | 93.2 MB | ✅ NSIS installer, SteamPipe-ready |
| `dist/win-unpacked/南北朝天下对弈.exe` | 176 MB | ✅ Direct launch (portable mode 备用) |
| `dist/win-unpacked/` (full payload) | 291 MB | ✅ 完整安装包内容 |

**构建命令**: `npm run build` (auto-runs electron-builder --win nsis)
**重新构建前提**: 已设置 `HTTPS_PROXY=http://127.0.0.1:7897` 才能下载 Electron 二进制。

### 2.2 Steam 商店页面物料

#### 胶囊图 (Capsules)
- `SteamAssets/capsules/header_capsule.jpg` — 460×215 / 22K
- `SteamAssets/capsules/small_capsule.jpg` — 231×87 / 5K
- `SteamAssets/capsules/main_capsule.jpg` — 616×353 / 28K (⚠ 文字暂未叠加)
- `SteamAssets/capsules/vertical_capsule.jpg` — 374×448 / 37K

#### 页面背景 (Page Background)
- `SteamAssets/backgrounds/page_background.jpg` — 1438×810 / 125K

#### 图标 (Icons)
- `SteamAssets/icons/icon.ico` — **154K, **7 sizes** (16/24/32/48/64/128/256)** ✅ Electron-builder 兼容
- `SteamAssets/icons/icon_256.png` — 256×256 / 100K
- `SteamAssets/icons/community_icon.jpg` — 184×184 / 9K
- `SteamAssets/icons/client_icon.png` — 32×32 / 2K (改 PNG 避免 JPEG artifact)

#### 直播/库资源 (Broadcast & Library)
- `SteamAssets/broadcast/library_hero.jpg` — 3840×1240 / 361K
- `SteamAssets/broadcast/broadcast_left_panel.jpg` — 155×330 / 14K
- `SteamAssets/broadcast/broadcast_right_panel.jpg` — 155×330 / 14K

### 2.3 文案 (Copy)

- `SteamAssets/text/short_description.txt` — CN + EN short description
- `SteamAssets/text/full_description.md` — 完整中/英长描述（含玩法、视觉、系统需求）
- `SteamAssets/text/store_metadata.json` — 程序化可读的 tags / categories / system reqs / **价格建议**
- `SteamAssets/text/taglines.txt` — 5 条中文 + 5 条英文宣传语

### 2.4 截图 / 视频 / 草图
- `SteamAssets/screenshots/CAPTURE_GUIDE.md` — 9 张截图捕获指南（**用户必做**）
- `SteamAssets/trailers/trailer_plan.md` — 60–90 秒预告片分镜脚本（**可后续补**）

---

## 三、价格建议 (Price Recommendation)

**建议首发价格: USD 4.99**

| 竞品 | 价格 | 备注 |
|---|---|---|
| Romance of the Three Kingdoms VIII | $29.99 | 大型 IP，独占性强 |
| Age of Civilizations II | $9.99 | 同类型 indie 历史策略 |
| Hegemony III | $9.99 | 同 indie 历史策略 |
| Sengoku Jidai | $19.99 | 高级策略 |

本游戏定位：单机、indie 制作、新 IP、无 Kickstarter 背景。**4.99 USD** 是首次发行最合理的价格点。
首发 2 周可加折扣 10% (USD 4.49) 加速 wishlist 转化。

---

## 四、必找用户执行项 (User-required Steps)

### Step 1: Steamworks Partner 注册 (一次性，需付费)

1. 打开 https://partner.steamgames.com/partner_registration
2. 使用您的 Steam 账号登录
3. 选择 "Sign up as an individual"（个人开发者）
4. 填写：
   - 合法姓名（与身份证/护照一致）
   - 出生日期
   - 居住地址
   - 国籍
5. **支付 100 USD** 注册费（通过 Steam 钱包余额或信用卡）
6. 完成 W-8BEN 税表（中国个人开发者无需 SSN/EIN，但需 ITIN 或申报）
7. **Valve 审核 1–7 个工作日**

> ⚠ **这步完全由真人完成**。agent 不能:
> - 用您的钱支付 100 USD
> - 代替您签 Steam 协议
> - 代替您填税表

### Step 2: 创建 Steam App

1. 登录 https://partner.steamgames.com/
2. 进入 "Apps & Packages" → "Create new app"
3. 填入 "南北朝·天下对弈" 作为 name (可英文 Nan-Bei Chao: War of Dynasties)
4. 系统生成 App ID (记下这个数字，例如 1234567)

### Step 3: 配置 Steamworks 商店页面

按 `SteamAssets/text/store_metadata.json` 内容粘贴:
- 短描述 → Basic info → "Short Description"
- 长描述 → Description
- 系统需求 → Technical → 勾选 Windows → 填最低/推荐
- 价格 → Pricing → "4.99 USD"
- 标签 → Tags → Strategy/Card Game/Historical/Single Player/Turn-Based/Indie/2D/Tabletop
- 分类 → Categories → Strategy > Card Game > Turn-Based Tactics > Historical

### Step 4: 上传 Steam 商店物料

按 `SteamAssets/` 对应子目录上传:
| 资产 | Steam 字段 | 文件 |
|---|---|---|
| Capsule: Header | "Header capsule image" | `capsules/header_capsule.jpg` |
| Capsule: Small | "Small capsule image" | `capsules/small_capsule.jpg` |
| Capsule: Main | "Main capsule image" | `capsules/main_capsule.jpg` |
| Capsule: Vertical | "Vertical capsule image" | `capsules/vertical_capsule.jpg` |
| Page Background | "Page background image" | `backgrounds/page_background.jpg` |
| Library Hero | "Library hero" | `broadcast/library_hero.jpg` |
| Library Logo | "Library logo" | 需要单独 PNG，暂未提供，见 §五 |
| Icon (client) | "Client icon" | `icons/client_icon.png` |
| Icon (community) | "Community icon" | `icons/community_icon.jpg` |

### Step 5: 上传 SteamPipe Build

```bash
# 在仓库根目录, 配置 steamworks SDK 路径:
# 1. 下载 Steamworks SDK: https://partner.steamgames.com/downloads
# 2. 解压到 tools/steamworks_sdk
# 3. 在 tools/ 目录编辑 .vdf 文件:

appbuild {
    "appid" "<Your Steam App ID>"
    "desc" "南北朝·天下对弈 v1.0.0"
    "buildoutput" "..\output"
    "contentroot" "..\Game-Electron"
    "setlive" ""
    "preview" "1"
    "local" ""
    "depots" {
        "1001" {
            "FileMapping" {
                "LocalPath" "*"
                "DepotPath" "."
                "Recursive" "1"
            }
            "FileExclusion" "*.pdb"
            "maxsize" "200000000"
        }
    }
}
```

```bash
# 上传命令 (用 Steam SDK 的 steamcmd.exe):
tools\steamcmd.exe +login <username> +run_app_build_http <appbuild_vdf> +quit
```

### Step 6: 提交商店审核

1. Steamworks → "App Admin" → "Publish" → "Store Page"
2. 选 "Ready to publish"
3. Steam 审核时间: **1–3 个工作日** (普通应用) / **更久** (新发布者首次)

### Step 7: 设置 Playtest (推荐)

1. Steamworks → "App Admin" → "Playtest"
2. 启用 Playtest feature
3. 提交 Playtest tab，审核 **3–7 个工作日**
4. 提交后用户通过 Playtest URL 加入测试
5. **最多 1000 名测试者**

### Step 8: 验证（重要！）

收到 Steam 邮件 "Your store page is now live" 后:

1. 用本人 Steam 账号打开 https://store.steampowered.com/app/<APP_ID>
2. 检查:
   - [ ] 所有素材正确显示
   - [ ] 价格正确
   - [ ] 文字无乱码
   - [ ] 系统需求正确
3. 在 Steam 客户端搜索 "南北朝"
4. 在 search results 中点击 进入商店页
5. **下载 → 安装 → 启动游戏**，验证 launcher 工作
6. 截图反馈

---

## 五、待补充/已知缺口 (Open Items)

### 5.1 必须由真人完成
- 🎮 **SteamApp ID** — Valve 授予
- 💳 **100 USD 注册费** — 您支付
- 📸 **5–9 张游戏内截图** — 您在游戏内截
- 📄 **税务表单 W-8BEN** — 您填
- 🪪 **Steam 协议签订** — 您接受

### 5.2 可由 Agent 后续 patch 完成
- ✨ Library Logo (1280×720 transparent PNG) — 暂用 cover-battlefield 重切即可补
- 📺 Trailer video — v1.0 post-launch 制作
- 🎯 Steamworks SDK 集成（成就 + Cloud Save）— 实际打包时需要真实 App ID 替换 `steamworks.init(APP_ID)`

### 5.3 技术债务
- ⚠ `icon.ico` 暂时没有专门的篆书"对弈"图标，用 cover-battlefield 的通用版。**建议用户后续用 SenseNova 生成更精致的 篆书图标**
- ⚠ `main_capsule.jpg` 文字层尚未叠加（标题"南北朝·天下对弈"，副标题"卡牌策略·南北对决"）
- ⚠ `src/index.html` 内的 `loading="lazy"` / `onerror` fallback 已修；card DataURI 内嵌尚未实施 — 可在 Playtest 期间根据用户反馈决定是否仍要做

---

## 六、风险评估

| 风险 | 可能性 | 影响 | 缓解 |
|---|---|---|---|
| Steam 审核被回（首次发布者） | 中 | 高 | 提前看 Partner Steamworks 文档；提供完整截图 + 视频 |
| 100 USD 不退 | 中 | 中 | 这是 Steam 政策，开发者分摊给第一批玩家（$1-2） |
| 商店页 "translator" / "duplicated content" 警告 | 中 | 中 | 描述避免煽动/重复片段；遵循 Steam 内容政策 |
| 首次 release 评测量不足 | 高 | 低 | Playtest + Wishlist + 1 周末免 |
| 价格过高冷启动 | 中 | 中 | USD 4.99 + 首周 10% 折扣 |
| 中国区开发者税务申报 | 中 | 中 | 留存收益 30%+ 美元申报，咨询税务师 |

---

## 七、给用户的快速清单 (Quick Checklist)

打开 Steamworks Partner 后**优先按顺序执行**:

- [ ] (1) 注册 Partner 账号 + 付 100 USD
- [ ] (2) 创建 App → 记下 **App ID**（大数字串）
- [ ] (3) 用 `SteamAssets/text/store_metadata.json` 的内容粘贴到 store page
- [ ] (4) 在游戏内截 9 张截图，按 `SteamAssets/screenshots/CAPTURE_GUIDE.md` 操作
- [ ] (5) 上传 `SteamAssets/` 内的所有 PNG/JPG/ICO
- [ ] (6) 跑一次 SteamPipe 上传（用 Steam SDK 的 appbuild 工具）
- [ ] (7) 设置 Playtest（首选，审核更快）
- [ ] (8) 提交商店页审核
- [ ] (9) 收到 "live" 邮件 → 本机 Steam 客户端下载验证

---

## 八、文件清单 (Arifacts)

### 可立即交付的（本次已完成）
- ✅ `dist/南北朝天下对弈 Setup 1.0.0.exe` (93.2 MB NSIS)
- ✅ `dist/win-unpacked/南北朝天下对弈.exe` (176 MB portable)
- ✅ `SteamAssets/capsules/*` (4 个 capsule)
- ✅ `SteamAssets/backgrounds/page_background.jpg`
- ✅ `SteamAssets/icons/icon.ico` (7 sizes) + community_icon.jpg + client_icon.png
- ✅ `SteamAssets/broadcast/*` (3 个)
- ✅ `SteamAssets/text/{short_description.txt, full_description.md, store_metadata.json, taglines.txt}`
- ✅ `SteamAssets/screenshots/CAPTURE_GUIDE.md`
- ✅ `SteamAssets/trailers/trailer_plan.md`

### 必待用户确认/提供
- ⏳ Steam App ID (Valve 分配)
- ⏳ 实际游戏内截图 5–9 张 (用户捕获)
- ⏳ 100 USD Partner 注册费 (用户付款)
- ⏳ 微信/邮箱 联系方式 (Steam 联系用，可选)
- ⏳ 价格最终决策 (USD 4.99 / 9.99 / 其他)

---

## 九、技术参考链接 (Technical References)

- Steam Direct/Partner 文档: https://partner.steamgames.com/doc/home
- Steamworks SDK 下载: https://partner.steamgames.com/downloads (登录后)
- SteamPipe 上传命令: `steamcmd +login <user> +run_app_build_http <vdf> +quit`
- Steam 商店图片规格: https://partner.steamgames.com/doc/store/image_guidelines
- 单机游戏提交流程: https://partner.steamgames.com/doc/store/submission
- Playtest 流程: https://partner.steamgames.com/doc/store/playtest

---

> **最后更新**: 2026-07-22 14:35 (T7 agent 完成基础物料)
> **下一步**: 用户登录 Steamworks + 截图 + 提交
