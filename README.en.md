[中文](README.md) | [English](README.en.md)

# item.show

A lightweight static dashboard to browse your personal items and their lifecycle cost. Zero-build, pure HTML/CSS/JS, deployable to any static hosting service.

## Features

- 📊 Asset overview: total value, item count, average daily cost
- 💰 Three calculation modes: all purchases / active / net value
- 🔍 Search by name, category or notes; filter by category
- 🌗 Theme switching: auto / light / dark
- 🌐 Chinese & English UI
- 📱 PWA support: installable and offline-capable

## Structure

```
item.show/
├── index.html          # Entry page
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline cache)
├── css/
│   └── styles.css      # Global styles
├── js/
│   ├── script.js       # Core logic (stats, rendering, search)
│   ├── lang.js         # i18n (zh-CN / en)
│   ├── theme.js        # Theme management
│   ├── animations.js   # Animations (anime.js)
│   └── data.js         # Item data (edit this file to maintain)
└── assets/
    ├── favicon.ico
    ├── icon-192.png
    └── icon-512.png
```

## Run locally

```bash
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Maintaining data

Edit `js/data.js` and add or update item entries following the existing format:

```js
{
  id: 100,
  name: "📱New Device",
  purchaseDate: "2026-01-01",
  price: 4999,
  retirementDate: null, // not retired
  warrantyDate: "2027-01-01",
  notes: "Notes",
  category: "Electronics",
}
```

## Deployment

Zero-build static site — deploy to any static host (Nginx, GitHub Pages, Gitea Pages, etc.) without any build step.

## Dependencies (CDN)

- [anime.js](https://animejs.com/) v4.2.2
- [Font Awesome](https://fontawesome.com/) 6.5.1

## License

[AGPL-3.0](LICENSE)