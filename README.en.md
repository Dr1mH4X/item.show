[中文](README.md) | [English](README.en.md)

# item.show

A lightweight static dashboard to browse your personal items and their lifecycle cost. Data is externalized in `items.json`.

## Directory structure

- `index.html` — app shell and layout
- `styles.css` — design tokens, layout, dark/light adaptations
- `lang.js` — i18n management (zh-CN/en), pill-toggle glue
- `theme.js` — theme switching (auto/light/dark) + persistence
- `script.js` — data loading, rendering, stats, search, animations
- `items.json` — your items data (you own this file)
- `CNAME` — optional custom domain (if using GitHub Pages)


## Running from file:// (CORS)

If you open `index.html` directly via file://, the browser will block `fetch('items.json')` due to CORS/same-origin rules. You will see a message like:

- Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///.../items.json. (Reason: CORS request not http)

Solutions:
- Serve the folder via a local web server (see Quick start).
- Or, for development only, inline the data in `script.js` (not recommended for production).


## items.json schema

Each item is an object with the following fields:

- `id` (number) — unique identifier
- `name` (string) — display name, emoji supported
- `purchaseDate` (string|number) — date string or timestamp (see accepted formats below)
- `price` (number) — purchase price
- `retirementDate` (string|number|null|"0"|0) — end-of-life date or indefinite usage
- `warrantyDate` (string|number|null) — warranty end date
- `notes` (string) — short note
- `category` (string) — e.g., “电子设备”

Accepted date formats (robust parsing):
- ISO-like strings: `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`
- Partial month: `YYYY-MM` (treated as the 1st day of that month)
- Timestamps: milliseconds or seconds (auto-detected)
- Special indefinite values: `null`, `"0"`, `0`

Example:
```json
[
  {
    "id": 1,
    "name": "📱Samsung GALAXY Note II",
    "purchaseDate": "2014-10-15",
    "price": 2660,
    "retirementDate": "2016-03-15",
    "warrantyDate": "2015-10-15",
    "notes": "第一台手机",
    "category": "电子设备"
  },
  {
    "id": 2,
    "name": "📱Redmi K30",
    "purchaseDate": 1602892800,
    "price": 1999,
    "retirementDate": "2023/04/27",
    "warrantyDate": "2021.10.17",
    "notes": "主板烧了",
    "category": "电子设备"
  },
  {
    "id": 3,
    "name": "💻Lenovo ThinkPad X280",
    "purchaseDate": "2024-05",
    "price": 1146,
    "retirementDate": null,
    "warrantyDate": 1746576000000,
    "notes": "翻新机",
    "category": "电子设备"
  }
]
```

Notes:
- Currency symbol is presentation only (“¥”), not part of the schema.
- If `retirementDate` is indefinite, daily cost is price divided by days used so far.
- Warranty status:
  - Expired: today > `warrantyDate`
  - Expiring: days remaining ≤ 30 and > 0
  - Active: otherwise or no warranty date


## FAQ

Q: Why do I see a CORS error loading items.json?  
- A: You are probably opening via file://. Use a local web server (http:// or https://).

Q: How do I change the language or theme?  
- A: Update `#langSwitcher` / use the language pill; call `window.applyThemeMode('auto'|'light'|'dark')` or use the theme pill.

Q: What date formats are supported?  
- A: See “items.json schema” above (multiple string formats and timestamps).
