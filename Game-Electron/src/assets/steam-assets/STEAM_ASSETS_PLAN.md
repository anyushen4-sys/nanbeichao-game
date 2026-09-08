# Steam 商店页面物料需求清单

> 南北朝·天下对弈 / Nan-Bei Chao: War of Dynasties

---

## 一、胶囊图 (Capsule Art)

| 尺寸 | 文件名 | 规格 | 设计方向 |
|---|---|---|---|
| Header Capsule | `header_capsule.jpg` | 460×215 | 横版，左侧游戏 Logo + 右侧战将对峙剪影。暖棕底色，金色"南北朝"大篆标题 |
| Small Capsule | `small_capsule.jpg` | 231×87 | Header 缩略版，去文字，只留 Logo + 背景 |
| Main Capsule | `main_capsule.jpg` | 616×353 | 竖版双封面：上下分层。上方 墨笔战场（骑兵冲锋剪影+烟尘），下方 深棕底色+篆书标题 + 小字"卡牌策略·南北对决" |
| Vertical Capsule | `vertical_capsule.jpg` | 374×448 | 纯竖版，人物在前（刘裕 vs 拓跋焘 对仗剪影），墨笔背景，金色标题 |

**风格约束**：
- 色调：`#2A2018`(深棕底)、`#D4A840`(金高亮)、`#1E1812`(暗部)
- 禁止：西方奇幻风、现代 UI 元素、3D 渲染感、脏描乱线
- 字体：篆书/隶书风格（标题），正文用宋体

---

## 二、页面背景 (Page Background)

| 文件名 | 规格 | 设计方向 |
|---|---|---|
| `page_background.jpg` | 1438×810 | 墨笔古战场景：远处城楼剪影、近处阵列骑兵烟尘、天空淡暖（米黄渐变）。不抢文字焦点，做"底"不喧宾夺主 |

---

## 三、商店截图 (Screenshots)

共 9 张，1280×720 PNG，展示核心玩法：

| # | 场景 | 重点展示 |
|---|---|---|
| 1 | **领袖选择页** | 9 位领袖全身画像，阵营徽标（宋紫、齐青、梁金、陈绿 vs 北魏红、东魏蓝等），视觉最华丽的页面 |
| 2 | **换牌阶段** | 手牌 7 张并排，金色边框选中效果，底部兵种图标 |
| 3 | **对弈界面（全景）** | 三行战场布局：步兵行/骑兵行/水军行，双方卡牌对峙，行标签清晰 |
| 4 | **卡牌放大特写** | 1-2 张卡 hover 放大效果——展示古风水墨卡图细节 + 属性文字 |
| 5 | **谋略行对决** | 策略/辅助卡特效：过牌、暗度陈仓、连环计等视觉亮点 |
| 6 | **战力再平衡界面** | 粮草消耗 + 战力条变化 + 三行力量对比 |
| 7 | **AI 回合动画** | AI 出牌 + 战场更新瞬间，展示对手 AI 行为 |
| 8 | **结算页（胜利）** | 胜负判定 + 对战统计（回合数、消灭数、剩余粮草） |
| 9 | **主菜单/封面** | 封面页：古战场全景 + 标题大字 + "开始游戏"按钮 |

---

## 四、游戏图标

| 类型 | 规格 | 说明 |
|---|---|---|
| 桌面图标 | `icon.ico` (256×256 含多尺寸) | "对弈"二字篆书 + 青铜底色 |
| Steam 库图标 | `client_icon.jpg` (32×32) | 同图标 32px 缩略版 |
| 社区图标 | `community_icon.jpg` (184×184) | 游戏 Logo 方形版 |

---

## 五、宣传文案

**短描述** (约 100 字):
> 南北朝·天下对弈——以中国南北朝时代为背景的策略卡牌游戏。选择宋齐梁陈或北魏北齐北周九位历史领袖之一，在三行战场上运筹帷幄、调兵遣将。水墨古风画境，百余张史实武将卡牌，每一局都是新的南北之争。

**宣传语** (3-5 条):
> 「九州裂，谁主沉浮。」
> 「九位领袖，六十三将，三行对峙，一次翻盘。」
> 「运筹帷幄之中，烟尘千里之外。」

---

## 六、预告片方案

- 时长：60-90 秒
- 结构：封面 → 领袖选择(10s) → 换牌(8s) → 对弈精华(30s：连出 5-6 张有特效的卡牌) → 结算画面(8s) → 结尾 Logo(5s)
- 配乐：古筝/鼓点为主，节奏由缓到急再收
- 禁止：AI 配音解说（直接放实际 UI 音效+背景音乐）

---

## 七、广播图 (Broadcast Assets)

| 文件名 | 规格 | 用途 |
|---|---|---|
| `broadcast_left_panel.jpg` | 155×330 | 直播左侧面板 |
| `broadcast_right_panel.jpg` | 155×330 | 直播右侧面板 |
| `library_hero.jpg` | 3840×1240 | Steam 库大横幅 |
| `library_logo.png` | 1280×720 | 库页面 Logo (透明底 PNG) |

---

## 八、文件夹结构（建议）

```
SteamAssets/
├── capsules/
│   ├── header_capsule.jpg
│   ├── small_capsule.jpg
│   ├── main_capsule.jpg
│   └── vertical_capsule.jpg
├── screenshots/
│   ├── screenshot_01_leader_select.png
│   ├── screenshot_02_mulligan.png
│   ├── ...
│   └── screenshot_09_title.png
├── backgrounds/
│   └── page_background.jpg
├── icons/
│   ├── icon.ico
│   ├── client_icon.jpg
│   └── community_icon.jpg
├── broadcast/
│   ├── broadcast_left_panel.jpg
│   ├── broadcast_right_panel.jpg
│   ├── library_hero.jpg
│   └── library_logo.png
├── trailers/
│   └── trailer_plan.md
└── text/
    ├── short_description.txt
    ├── full_description.md
    └── taglines.txt
```