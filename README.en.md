[中文](README.md) | [English](README.en.md)

# item.show

A lightweight static dashboard to browse your personal items and their lifecycle cost. Data is externalized in `items.json`.



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

Notes:
- Currency symbol is presentation only (“¥”), not part of the schema.
- If `retirementDate` is indefinite, daily cost is price divided by days used so far.
- Warranty status:
  - Expired: today > `warrantyDate`
  - Expiring: days remaining ≤ 30 and > 0
  - Active: otherwise or no warranty date
