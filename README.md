
[中文](README.md) | [English](README.en.md)


# item.show



一个轻量的静态托管仪表盘，用于浏览你的个人物品及其生命周期成本。数据外置在 `items.json`。


## 目录结构

- `index.html` — 应用骨架与布局
- `styles.css` — 设计变量、布局、深/浅主题适配
- `lang.js` — 语言切换（zh-CN/en），与胶囊按钮联动
- `theme.js` — 主题切换（auto/light/dark）与持久化
- `script.js` — 数据加载、渲染、统计、搜索、动画
- `items.json` — 你的数据文件（自行维护）
- `CNAME` — 自定义域名（若使用 GitHub Pages）


## items.json 数据结构

每条物品记录包含以下字段：

- `id`（number）— 唯一标识
- `name`（string）— 展示名称，支持 Emoji
- `purchaseDate`（string|number）— 购买日期字符串或时间戳（见下方可接受格式）
- `price`（number）— 购买价格
- `retirementDate`（string|number|null|"0"|0）— 退役日期或“无限期使用”
- `warrantyDate`（string|number|null）— 保修截止日期
- `notes`（string）— 备注
- `category`（string）— 如 “电子设备”

可接受的日期格式：
- 类 ISO 字符串：`YYYY-MM-DD`、`YYYY/MM/DD`、`YYYY.MM.DD`
- 只有年月：`YYYY-MM`（默认按当月 1 日处理）
- 时间戳：毫秒或秒（自动识别）
- 表示“无限期”的特殊值：`null`、`"0"`、`0`

说明：
- 若 `retirementDate` 为“无限期”，日均成本 = 价格 / 已使用天数
- 保修状态：
  - 已过保：今天 > `warrantyDate`
  - 即将过保：剩余天数 ≤ 30 且 > 0
  - 使用中：其他情况或无保修日期


## 常见问题（FAQ）

问：为什么加载 items.json 时出现 CORS 错误？
- 答：你很可能通过 file:// 打开了页面。请使用本地 Web 服务器（http:// 或 https://）。参见“快速开始”。

问：如何通过代码切换语言或主题？
- 答：语言：更新 `#langSwitcher` 或使用胶囊按钮；主题：调用 `window.applyThemeMode('auto'|'light'|'dark')` 或使用胶囊按钮。两者都会持久化设置。

问：支持哪些日期格式？
- 答：见“items.json 数据结构”。解析器支持多格式字符串和时间戳。
