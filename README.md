[中文](README.md) | [English](README.en.md)

# item.show

一个轻量的静态托管仪表盘，用于浏览你的个人物品及其生命周期成本。零构建、纯 HTML/CSS/JS，可直接部署到任意静态托管服务。

## 特性

- 📊 资产总览：总资产价值、物品总数、平均每日成本
- 💰 三种计算模式：全部购入 / 未退役 / 净值
- 🔍 按名称、类别、备注搜索，按分类过滤
- 🌗 主题切换：自动 / 浅色 / 深色
- 🌐 中英文界面切换
- 📱 PWA 支持：可安装、离线可用

## 目录结构

```
item.show/
├── index.html          # 入口页面
├── manifest.json       # PWA 清单
├── sw.js               # Service Worker（离线缓存）
├── css/
│   └── styles.css      # 全局样式
├── js/
│   ├── script.js       # 主逻辑（统计、渲染、搜索）
│   ├── lang.js         # 国际化（中/英）
│   ├── theme.js        # 主题管理
│   ├── animations.js   # 动画（anime.js）
│   └── data.js         # 物品数据（编辑此文件维护清单）
└── assets/
    ├── favicon.ico
    ├── icon-192.png
    └── icon-512.png
```

## 本地运行

```bash
python -m http.server 8000
# 或
npx serve .
```

打开 <http://localhost:8000> 即可。

## 维护数据

编辑 `js/data.js`，按现有格式添加或更新物品条目：

```js
{
  id: 100,
  name: "📱New Device",
  purchaseDate: "2026-01-01",
  price: 4999,
  retirementDate: null, // 未退役
  warrantyDate: "2027-01-01",
  notes: "备注",
  category: "电子设备",
}
```

## 部署

本项目为零构建静态站点，可部署到任意静态托管（如 Nginx、GitHub Pages、Gitea Pages 等），无需任何构建步骤。

## 依赖（CDN）

- [anime.js](https://animejs.com/) v4.2.2
- [Font Awesome](https://fontawesome.com/) 6.5.1

## 许可证

[AGPL-3.0](LICENSE)