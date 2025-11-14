// item data
const items = [
  {
    id: 1,
    name: "📱Samsung GALAXY Note II",
    purchaseDate: "2014-10-15",
    price: 2660,
    retirementDate: "2016-03-15",
    warrantyDate: "2015-10-15",
    notes: "第一台手机",
    category: "电子设备",
  },
  {
    id: 2,
    name: "📱Redmi K30",
    purchaseDate: "2020-10-17",
    price: 1999,
    retirementDate: "2023-04-27",
    warrantyDate: "2021-10-17",
    notes: "主板烧了",
    category: "电子设备",
  },
  {
    id: 3,
    name: "💻ROG 魔霸新锐2020",
    purchaseDate: "2020-11-05",
    price: 8999,
    retirementDate: "2024-05-18",
    warrantyDate: "2021-11-05",
    notes: "2700出手",
    category: "电子设备",
  },
  {
    id: 4,
    name: "🎧SONY WH-CH710N",
    purchaseDate: "2022-03-29",
    price: 557,
    retirementDate: null,
    warrantyDate: "2023-03-29",
    notes: "不常用",
    category: "电子设备",
  },
  {
    id: 5,
    name: "🎧Redmi Buds4",
    purchaseDate: "2023-03-07",
    price: 129,
    retirementDate: "2024-06-19",
    warrantyDate: "2024-03-07",
    notes: "掉了",
    category: "电子设备",
  },
  {
    id: 6,
    name: "🖱️Logitech PRO X SUPERLIGHT",
    purchaseDate: "2023-04-22",
    price: 707,
    retirementDate: null,
    warrantyDate: "2026-01-26",
    notes: "CS箱子卖了买的",
    category: "电子设备",
  },
  {
    id: 7,
    name: "📱Redmi K50",
    purchaseDate: "2023-04-28",
    price: 2399,
    retirementDate: "2024-11-24",
    warrantyDate: "2024-04-28",
    notes: "换代",
    category: "电子设备",
  },
  {
    id: 8,
    name: "💻Lenovo ThinkPad X280",
    purchaseDate: "2024-05-07",
    price: 1146,
    retirementDate: null,
    warrantyDate: "2025-05-07",
    notes: "翻新机",
    category: "电子设备",
  },
  {
    id: 9,
    name: "📱Apple iPhone 15Pro",
    purchaseDate: "2024-11-23",
    price: 7499,
    retirementDate: null,
    warrantyDate: "2025-11-23",
    notes: "好贵",
    category: "电子设备",
  },
  {
    id: 10,
    name: "🎧Apple AirPods 4 ANC",
    purchaseDate: "2025-05-08",
    price: 1061,
    retirementDate: null,
    warrantyDate: "2027-06-04",
    notes: "p😭q",
    category: "电子设备",
  },
  {
    id: 11,
    name: "🗂️UGREEN DXP4800 Plus",
    purchaseDate: "2025-05-27",
    price: 2350,
    retirementDate: null,
    warrantyDate: "2026-05-29",
    notes: "UGOSPro还不错",
    category: "电子设备",
  },
];

let globalTotalValue = 0;
let globalTotalItems = 0;
let globalAvgDailyCost = 0;

/**
 * Updates the current date and time displayed in the banner.
 */
function updateRealTime() {
  const now = new Date();
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const lang = typeof currentLang === "function" ? currentLang() : "zh-CN";
  const locale = lang === "en" ? "en-US" : "zh-CN";
  const dateStr = now.toLocaleDateString(locale, dateOptions);
  const timeStr = now.toLocaleTimeString(locale, timeOptions);
  const dayNames =
    typeof t === "function"
      ? t().dayNames
      : ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dayOfWeek = dayNames[now.getDay()];
  const ordinalPrefix = typeof t === "function" ? t().dayOrdinalPrefix : "第";
  const ordinalSuffix = typeof t === "function" ? t().dayOrdinalSuffix : "天";

  document.getElementById("currentDateTime").textContent = dateStr;
  document.getElementById("currentDayInfo").textContent =
    `${dayOfWeek} | ${ordinalPrefix}${Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)}${ordinalSuffix}`;
  document.getElementById("systemTime").textContent = timeStr;
}

/**
 * Calculates the daily cost, total lifespan days, days used, and consumed value for an item.
 * Handles cases where retirementDate is null, 0, "0", or an invalid date string.
 * @param {object} item - The item object.
 * @returns {object} An object containing dailyCost, totalDays, daysUsed, and consumedValue.
 */
function calculateDailyCost(item) {
  const purchaseDate = new Date(item.purchaseDate);
  const now = new Date();

  // 判断是否已退役
  const parsedRetirementDate = item.retirementDate
    ? new Date(item.retirementDate)
    : null;
  const isIndefiniteUse =
    item.retirementDate === null ||
    item.retirementDate === 0 ||
    item.retirementDate === "0" ||
    (parsedRetirementDate && isNaN(parsedRetirementDate.getTime()));

  // 计算使用天数（关键修改）
  let daysUsed;
  if (isIndefiniteUse) {
    // 未退役：使用当前时间计算
    daysUsed = Math.max(
      0,
      Math.ceil((now.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24)),
    );
  } else {
    // 已退役：使用退役时间计算
    const retirementDate = parsedRetirementDate;
    daysUsed = Math.max(
      0,
      Math.ceil(
        (retirementDate.getTime() - purchaseDate.getTime()) /
          (1000 * 3600 * 24),
      ),
    );
  }

  let dailyCost;
  let totalDaysForDisplay;
  let consumedValue;

  if (isIndefiniteUse) {
    // 如果物品处于无限期使用状态
    dailyCost = daysUsed > 0 ? (item.price / daysUsed).toFixed(2) : "0.00";
    totalDaysForDisplay = Infinity;

    consumedValue = (parseFloat(dailyCost) * daysUsed).toFixed(2);
    consumedValue = Math.min(item.price, parseFloat(consumedValue)).toFixed(2);
  } else {
    // 对于有明确退役日期的物品
    const retirementDate = parsedRetirementDate;
    const totalDaysLifeSpan = Math.ceil(
      (retirementDate.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24),
    );

    if (totalDaysLifeSpan <= 0) {
      dailyCost = "0.00";
      consumedValue = item.price.toFixed(2);
      totalDaysForDisplay = totalDaysLifeSpan;
    } else {
      dailyCost = (item.price / totalDaysLifeSpan).toFixed(2);
      consumedValue = Math.min(
        item.price,
        parseFloat(dailyCost) * daysUsed,
      ).toFixed(2);
      totalDaysForDisplay = totalDaysLifeSpan;
    }
  }

  return {
    dailyCost,
    totalDays: totalDaysForDisplay,
    daysUsed,
    consumedValue,
  };
}

/**
 * Determines the status of an item based on its warranty date.
 * @param {object} item - The item object.
 * @returns {object} An object with status text and CSS class.
 */
function getItemStatus(item) {
  const today = new Date();
  const warrantyDate = new Date(item.warrantyDate);
  const daysToWarranty = Math.ceil((warrantyDate - today) / (1000 * 3600 * 24));
  const dict = typeof t === "function" ? t() : null;

  if (warrantyDate < today) {
    return { text: dict ? dict.statusExpired : "已过保", class: "expired-tag" };
  } else if (daysToWarranty <= 30 && daysToWarranty > 0) {
    const text = dict
      ? dict.statusExpiring(daysToWarranty)
      : `保修即将到期 (${daysToWarranty}天)`;
    return { text, class: "expiring-tag" };
  }
  return { text: dict ? dict.statusActive : "使用中", class: "active-tag" };
}

/**
 * Renders the list of items in the items grid.
 * @param {Array<object>} itemsToRender - An array of item objects to display.
 */
function renderItems(itemsToRender) {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = ""; // Clear previous items

  if (itemsToRender.length === 0) {
    const dict = typeof t === "function" ? t() : null;
    const emptyTitle = dict ? dict.emptyTitle : "未找到任何物品";
    const emptyText = dict
      ? dict.emptyText
      : "请尝试不同的搜索词或清除搜索条件。";
    container.innerHTML = `<div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>${emptyTitle}</h3>
            <p>${emptyText}</p>
        </div>`;
    return;
  }

  itemsToRender.forEach((item) => {
    const cost = calculateDailyCost(item);
    const status = getItemStatus(item);

    const card = document.createElement("div");
    card.className = "item-card";
    card.style.opacity = 0; // Set initial opacity for animation

    // Display dynamic "days used" with language-specific unit
    const dict = typeof t === "function" ? t() : null;
    const daysUsedDisplay = `${cost.daysUsed} ${dict ? dict.dayWord : "天"}`;

    card.innerHTML = `
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <div class="price">¥${item.price.toLocaleString()}</div>
                    <span class="status-tag ${status.class}">${status.text}</span>
                </div>
                <div class="item-body">
                    <div class="item-detail">
                        <span class="detail-label">${dict ? dict.purchaseDate : "购买日期"}</span>
                        <span class="detail-value">${item.purchaseDate}</span>
                    </div>
                    <div class="item-detail">
                        <span class="detail-label">${dict ? dict.warrantyUntil : "保修至"}</span>
                        <span class="detail-value">${item.warrantyDate}</span>
                    </div>
                    <div class="item-detail">
                        <span class="detail-label">${dict ? dict.retirementDate : "退役时间"}</span>
                        <span class="detail-value">${item.retirementDate === null || item.retirementDate === 0 || item.retirementDate === "0" ? (dict ? dict.inUse : "使用中") : item.retirementDate}</span>
                    </div>
                    <div class="cost-calculation">
                        <div class="title">${dict ? dict.costCalcTitle : "成本计算"}</div>
                        <div class="item-detail">
                            <span class="detail-label">${dict ? dict.dailyCost : "日均成本"}</span>
                            <span class="detail-value">¥${cost.dailyCost}</span>
                        </div>
                        <div class="item-detail">
                            <span class="detail-label">${dict ? dict.daysUsed : "已使用天数"}</span>
                            <span class="detail-value">${daysUsedDisplay}</span>
                        </div>
                    </div>
                    <!-- Removed "备注" (Notes) section -->
                </div>
            `;
    container.appendChild(card);
  });

  // Staggered slide-in animation for item cards
  anime({
    targets: ".item-card",
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    easing: "easeOutQuad",
  });
}

/**
 * Updates the overall statistics in the dashboard, including total value,
 * total items, and average daily cost. Asset health calculation and display are removed.
 */
function updateStatistics() {
  let totalValue = 0;
  let totalDailyCost = 0;

  items.forEach((item) => {
    totalValue += item.price;
    const cost = calculateDailyCost(item);
    totalDailyCost += parseFloat(cost.dailyCost);
  });

  // Store values for main counter animations
  globalTotalValue = totalValue;
  globalTotalItems = items.length;
  globalAvgDailyCost = totalDailyCost;

  // Build translated footer labels
  const dict = typeof t === "function" ? t() : null;
  const updatedLabel = dict ? dict.systemDataUpdated : "系统数据更新时间：";
  const itemsLabel = dict ? dict.currentItemsCount : "当前物品总数：";
  const valueLabel = dict ? dict.totalValueFooter : "总价值：";

  const now = new Date();
  const locale =
    typeof currentLang === "function" && currentLang() === "en"
      ? "en-US"
      : "zh-CN";
  const dateStr = now.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const footer = document.getElementById("systemDataInfo");
  if (footer) {
    footer.innerHTML = `${updatedLabel}<span id="updateTime">${dateStr}</span> | ${itemsLabel}<span id="infoTotalItems">${items.length}</span> | ${valueLabel}<span id="infoTotalValue">¥${totalValue.toLocaleString()}</span>`;
  }
}

/**
 * Animates the main statistics counters (Total Value, Total Items, Average Daily Cost).
 */
function animateStatsCounters() {
  const totalValueElement = document.getElementById("totalValue");
  const totalItemsElement = document.getElementById("totalItems");
  const avgDailyCostElement = document.getElementById("avgDailyCost");

  // Reset text content to 0 before animation to ensure consistent animation start
  totalValueElement.textContent = "¥0";
  totalItemsElement.textContent = "0";
  avgDailyCostElement.textContent = "¥0.00";

  // Animate total value
  anime({
    targets: { num: 0 },
    num: globalTotalValue,
    easing: "easeOutQuad",
    duration: 1500,
    update: (anim) => {
      totalValueElement.textContent = `¥${Math.round(anim.animatables[0].target.num).toLocaleString()}`;
    },
    complete: () => {
      totalValueElement.textContent = `¥${globalTotalValue.toLocaleString()}`;
    },
  });

  // Animate total items
  anime({
    targets: { num: 0 },
    num: globalTotalItems,
    easing: "easeOutQuad",
    duration: 1200,
    round: 1,
    update: (anim) => {
      totalItemsElement.textContent = anim.animatables[0].target.num;
    },
    complete: () => {
      totalItemsElement.textContent = globalTotalItems;
    },
  });

  // Animate average daily cost
  anime({
    targets: { num: 0 },
    num: globalAvgDailyCost,
    easing: "easeOutQuad",
    duration: 1500,
    update: (anim) => {
      avgDailyCostElement.textContent = `¥${anim.animatables[0].target.num.toFixed(2)}`;
    },
    complete: () => {
      avgDailyCostElement.textContent = `¥${globalAvgDailyCost.toFixed(2)}`;
    },
  });
}

/**
 * Handles the search functionality based on user input.
 */
function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.notes.toLowerCase().includes(searchTerm),
  );
  renderItems(filteredItems);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  updateRealTime();
  setInterval(updateRealTime, 1000);

  updateStatistics();
  animateStatsCounters();
  renderItems(items);

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document
    .getElementById("searchInput")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    });

  // Re-render translated dynamic areas when language changes
  const langSel = document.getElementById("langSwitcher");
  if (langSel) {
    langSel.addEventListener("change", () => {
      updateStatistics();
      renderItems(items);
    });
  }
  // i18n definitions removed from script.js.
  // Use global currentLang() and t() provided by lang.js.
  // languageChanged event is handled above via the select listener.
});
