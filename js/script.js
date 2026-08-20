// item data (externalized)

let items = [];
function parseDateFlexible(input) {
  if (!input && input !== 0) return null;
  if (input === null || input === "0" || input === 0) return null;

  if (input instanceof Date) {
    const t = input.getTime();
    return isNaN(t) ? null : input;
  }

  if (
    typeof input === "number" ||
    (typeof input === "string" && /^\d+$/.test(input))
  ) {
    const n = Number(input);
    // Heuristic: treat <= 1e11 as seconds, otherwise ms
    const d = new Date(n > 1e11 ? n : n * 1000);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    const s = input.trim().replace(/[./]/g, "-");
    const parts = s.split("-");
    let normalized = s;
    if (parts.length === 2) {
      normalized = `${parts[0]}-${parts[1]}-01`;
    }
    const d1 = new Date(normalized);
    if (!isNaN(d1.getTime())) return d1;
    const d2 = new Date(normalized + "T00:00:00");
    return isNaN(d2.getTime()) ? null : d2;
  }

  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Load items from external JSON and refresh UI.
 */
function initApp() {
  if (typeof itemsData !== "undefined") {
    items = itemsData;
  } else {
    items = [];
    console.warn("itemsData is not defined");
  }

  // Refresh UI if functions are ready
  if (typeof updateStatistics === "function") updateStatistics();
  if (typeof animateStatsCounters === "function") animateStatsCounters();
  if (typeof renderItems === "function") renderItems(items);
  document.dispatchEvent(
    new CustomEvent("itemsLoaded", { detail: { count: items.length } }),
  );
}

// Kick off loading ASAP
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.getItems = () => items;

window.parseDateFlexible = parseDateFlexible;

// debounce utility
function debounce(fn, wait = 300) {
  let timer;
  const debounced = function (...args) {
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(ctx, args), wait);
  };
  debounced.flush = function (...args) {
    clearTimeout(timer);
    return fn.apply(this, args);
  };
  return debounced;
}

let globalTotalValue = 0;

let globalTotalItems = 0;
let globalAvgDailyCost = 0;
let currentFilter = "all";
let currentCalcMode = 0; // 0=All Purchase, 1=Active Purchase, 2=Net Value
let currentSortOrder = "desc"; // desc=新→旧, asc=旧→新

const IS_SHORT_QUERY = window.matchMedia("(max-width: 480px)");

/**
 * Calculates the daily cost, total lifespan days, days used, and consumed value for an item.
 * Handles cases where retirementDate is null, 0, "0", or an invalid date string.
 * @param {object} item - The item object.
 * @returns {object} An object containing dailyCost, totalDays, daysUsed, and consumedValue.
 */

function calculateDailyCost(item) {
  const purchaseDate = parseDateFlexible(item.purchaseDate);

  const now = new Date();

  if (!purchaseDate) {
    return {
      dailyCost: "0.00",
      totalDays: 0,
      daysUsed: 0,
      consumedValue: "0.00",
    };
  }

  // 判断是否已退役

  const parsedRetirementDate = parseDateFlexible(item.retirementDate);

  const isIndefiniteUse =
    item.retirementDate === null ||
    item.retirementDate === 0 ||
    item.retirementDate === "0" ||
    !parsedRetirementDate;

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
  let originalDailyCost = null;
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

    // Calculate net cost if sold
    let netCost = item.price;
    if (item.soldPrice) {
      netCost = item.price - item.soldPrice;
    }

    if (totalDaysLifeSpan <= 0) {
      dailyCost = "0.00";
      if (item.soldPrice) {
        originalDailyCost = "0.00";
      }
      consumedValue = netCost.toFixed(2);
      totalDaysForDisplay = totalDaysLifeSpan;
    } else {
      dailyCost = (netCost / totalDaysLifeSpan).toFixed(2);
      if (item.soldPrice) {
        originalDailyCost = (item.price / totalDaysLifeSpan).toFixed(2);
      }
      consumedValue = Math.min(
        netCost,
        parseFloat(dailyCost) * daysUsed,
      ).toFixed(2);
      totalDaysForDisplay = totalDaysLifeSpan;
    }
  }

  return {
    dailyCost,
    originalDailyCost,
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
  const dict = typeof t === "function" ? t() : null;

  // 1. Check Retirement (Highest Priority)
  const parsedRetirementDate = parseDateFlexible(item.retirementDate);
  const isRetired = !(
    item.retirementDate === null ||
    item.retirementDate === 0 ||
    item.retirementDate === "0" ||
    !parsedRetirementDate
  );

  if (isRetired && parsedRetirementDate <= today) {
    return { text: dict ? dict.statusRetired : "已退役", class: "retired-tag" };
  }

  // 2. Check Warranty
  const warrantyDate = parseDateFlexible(item.warrantyDate);
  if (!warrantyDate) {
    return { text: dict ? dict.statusActive : "使用中", class: "active-tag" };
  }

  const daysToWarranty = Math.ceil((warrantyDate - today) / (1000 * 3600 * 24));

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
 * Sorts items by purchase date. Items without a parseable date always go last.
 * @param {Array<object>} list - The list to sort (not mutated).
 */
function sortItems(list) {
  const dir = currentSortOrder === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const ta = parseDateFlexible(a.purchaseDate);
    const tb = parseDateFlexible(b.purchaseDate);
    if (!ta && !tb) return 0;
    if (!ta) return 1;
    if (!tb) return -1;
    return (ta - tb) * dir;
  });
}

/**
 * Renders the list of items in the items grid.
 * @param {Array<object>} itemsToRender - An array of item objects to display.
 */

function renderItems(itemsToRender) {
  const container = document.getElementById("itemsContainer");
  const oldItems = container.querySelectorAll(".item-card, .empty-state");

  const performRender = () => {
    if (itemsToRender.length === 0) {
      const dict = typeof t === "function" ? t() : null;
      const emptyTitle = dict ? dict.emptyTitle : "未找到任何物品";
      const emptyText = dict
        ? dict.emptyText
        : "请尝试不同的搜索词或清除搜索条件。";

      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.style.opacity = 0;

      const icon = document.createElement("i");
      icon.className = "fas fa-search";

      const title = document.createElement("h3");
      title.textContent = emptyTitle;

      const text = document.createElement("p");
      text.textContent = emptyText;

      emptyState.appendChild(icon);
      emptyState.appendChild(title);
      emptyState.appendChild(text);

      container.replaceChildren(emptyState);
      AppAnimations.fadeInEmptyState(".empty-state");
      return;
    }

    const template = document.getElementById("itemCardTemplate");
    const fragment = document.createDocumentFragment();

    itemsToRender.forEach((item) => {
      const cost = calculateDailyCost(item);

      const status = getItemStatus(item);

      const dict = typeof t === "function" ? t() : null;

      // Clone template if available; otherwise fallback to previous HTML method
      if (template && template.content) {
        const node = template.content.cloneNode(true);
        const card = node.querySelector(".item-card");
        if (card) {
          card.style.opacity = 0; // initial opacity for animation
        }

        // helpers
        const setText = (sel, value) => {
          const el = node.querySelector(sel);
          if (el) el.textContent = value;
        };
        const setLabel = (key, value) => {
          const el = node.querySelector(`[data-i18n-key="${key}"]`);
          if (el) el.textContent = value;
        };

        // Fill fields
        setText('[data-field="name"]', item.name);
        const priceEl = node.querySelector('[data-field="price"]');
        const priceContainer = node.querySelector(".price");

        if (item.soldPrice && priceContainer) {
          const netCost = item.price - item.soldPrice;
          priceContainer.innerHTML = `<s style="opacity: 0.6; margin-right: 4px;">¥${item.price.toLocaleString()}</s> ¥${netCost.toLocaleString()}`;
        } else {
          if (priceEl) {
            priceEl.textContent = item.price.toLocaleString();
          }
          node.querySelectorAll('[data-field="currency"]').forEach((c) => {
            c.textContent = "¥";
          });
        }

        const statusEl = node.querySelector('[data-field="statusText"]');
        if (statusEl) {
          statusEl.textContent = status.text;
          statusEl.classList.add(status.class);
        }

        setText('[data-field="purchaseDate"]', item.purchaseDate);
        setText('[data-field="warrantyDate"]', item.warrantyDate);
        setText(
          '[data-field="retirementDate"]',
          item.retirementDate === null ||
            item.retirementDate === 0 ||
            item.retirementDate === "0"
            ? dict
              ? dict.inUse
              : "使用中"
            : item.retirementDate,
        );

        const daysUsedDisplay = `${cost.daysUsed} ${dict ? dict.dayWord : "天"}`;

        const dailyCostEl = node.querySelector('[data-field="dailyCost"]');
        if (dailyCostEl) {
          if (cost.originalDailyCost) {
            const parent = dailyCostEl.parentElement;
            if (parent) {
              parent.innerHTML = `<s style="opacity: 0.6; margin-right: 4px;">¥${cost.originalDailyCost}</s> ¥${cost.dailyCost}`;
            }
          } else {
            dailyCostEl.textContent = cost.dailyCost;
          }
        }

        setText('[data-field="daysUsed"]', daysUsedDisplay);

        // Set translatable labels from lang.js
        setLabel("purchaseDate", dict ? dict.purchaseDate : "购买日期");
        setLabel("warrantyUntil", dict ? dict.warrantyUntil : "保修至");
        setLabel("retirementDate", dict ? dict.retirementDate : "退役时间");
        setLabel("costCalcTitle", dict ? dict.costCalcTitle : "成本计算");
        setLabel("dailyCost", dict ? dict.dailyCost : "日均成本");
        setLabel("daysUsed", dict ? dict.daysUsed : "已使用天数");

        fragment.appendChild(node);
      } else {
        // Fallback: previous innerHTML method (kept for safety)
        const card = document.createElement("div");
        card.className = "item-card";
        card.style.opacity = 0;

        const daysUsedDisplay = `${cost.daysUsed} ${dict ? dict.dayWord : "天"}`;
        card.innerHTML = `
                <div class="item-header">

                    <h3>${item.name}</h3>

                    <div class="price">${
                      item.soldPrice
                        ? `<s style="opacity: 0.6; margin-right: 4px;">¥${item.price.toLocaleString()}</s> ¥${(
                            item.price - item.soldPrice
                          ).toLocaleString()}`
                        : "¥" + item.price.toLocaleString()
                    }</div>

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

                            <span class="detail-value">${
                              cost.originalDailyCost
                                ? `<s style="opacity: 0.6; margin-right: 4px;">¥${cost.originalDailyCost}</s> ¥${cost.dailyCost}`
                                : "¥" + cost.dailyCost
                            }</span>

                        </div>

                        <div class="item-detail">

                            <span class="detail-label">${dict ? dict.daysUsed : "已使用天数"}</span>

                            <span class="detail-value">${daysUsedDisplay}</span>

                        </div>

                    </div>

                </div>
            `;
        fragment.appendChild(card);
      }
    });

    container.replaceChildren(fragment);

    // Staggered slide-in animation for item cards
    AppAnimations.animateItemCardsEntry(".item-card");
  };

  if (oldItems.length > 0) {
    AppAnimations.animateOldItemsExit(oldItems, performRender);
  } else {
    performRender();
  }
}

/**
 * Updates the overall statistics in the dashboard, including total value,
 * total items, and average daily cost. Asset health calculation and display are removed.
 */
function updateStatistics() {
  let totalValue = 0;
  let totalDailyCost = 0;

  items.forEach((item) => {
    // Check retirement
    const parsedRetirementDate = parseDateFlexible(item.retirementDate);
    const isRetired = !(
      item.retirementDate === null ||
      item.retirementDate === 0 ||
      item.retirementDate === "0" ||
      !parsedRetirementDate
    );

    if (currentCalcMode === 1 && isRetired) {
      return;
    }

    if (currentCalcMode === 2) {
      if (item.soldPrice) {
        totalValue += item.price - item.soldPrice;
      } else {
        totalValue += item.price;
      }
    } else {
      totalValue += item.price;
    }

    const cost = calculateDailyCost(item);
    totalDailyCost += parseFloat(cost.dailyCost);
  });

  // Store values for main counter animations
  globalTotalValue = totalValue;
  globalTotalItems = items.length;
  globalAvgDailyCost = totalDailyCost;

  // Update Main Total Value Label based on mode
  const dict = typeof t === "function" ? t() : null;
  updateTotalValueLabel(dict);
}

/**
 * Updates the total value card label based on calc mode and viewport width.
 * Uses short labels on narrow screens to prevent wrapping.
 * @param {object|null} dict - Translation dictionary.
 */
function updateTotalValueLabel(dict) {
  const mainValueLabelEl = document.getElementById("totalValueLabel");
  if (!mainValueLabelEl) return;
  if (!dict) {
    mainValueLabelEl.textContent = "总资产价值";
    return;
  }
  if (IS_SHORT_QUERY.matches) {
    mainValueLabelEl.textContent = dict.totalValueLabelShort;
    return;
  }
  if (currentCalcMode === 0) {
    mainValueLabelEl.textContent =
      dict.totalValueLabelAll || "总资产价值 (全部购入)";
  } else if (currentCalcMode === 1) {
    mainValueLabelEl.textContent =
      dict.totalValueLabelActive || "总资产价值 (未退役)";
  } else {
    mainValueLabelEl.textContent =
      dict.totalValueLabelNet || "总资产价值 (净值)";
  }
}

/**
 * Syncs stat card labels (total items / avg daily cost) with short variants
 * on narrow screens, keeping them on a single line.
 */
function syncStatLabels() {
  const dict = typeof t === "function" ? t() : null;
  if (!dict) return;

  const itemsEl = document.getElementById("totalItemsLabel");
  if (itemsEl) {
    itemsEl.textContent = IS_SHORT_QUERY.matches
      ? dict.totalItemsLabelShort
      : dict.totalItemsLabel;
  }

  const avgEl = document.getElementById("avgDailyCostLabel");
  if (avgEl) {
    avgEl.textContent = IS_SHORT_QUERY.matches
      ? dict.avgDailyCostLabelShort
      : dict.avgDailyCostLabel;
  }

  updateTotalValueLabel(dict);
}

/**
 * Animates the main statistics counters (Total Value, Total Items, Average Daily Cost).
 */
function animateStatsCounters() {
  AppAnimations.animateDashboardStats(
    globalTotalValue,
    globalTotalItems,
    globalAvgDailyCost,
  );
}

/**
 * Updates translatable labels in existing item cards in-place when language changes.
 * Avoids full DOM re-render (and exit/entry animations) that causes visual flicker.
 */
function updateItemCardLabels(dict) {
  if (!dict) return;

  document.querySelectorAll(".item-card").forEach((card) => {
    // Update all data-i18n-key elements (static labels from template)
    card.querySelectorAll("[data-i18n-key]").forEach((el) => {
      const key = el.dataset.i18nKey;
      if (dict[key]) el.textContent = dict[key];
    });

    // Update status tag text based on its class
    const statusEl = card.querySelector(".status-tag");
    if (statusEl) {
      if (statusEl.classList.contains("active-tag")) {
        statusEl.textContent = dict.statusActive;
      } else if (statusEl.classList.contains("retired-tag")) {
        statusEl.textContent = dict.statusRetired;
      } else if (statusEl.classList.contains("expired-tag")) {
        statusEl.textContent = dict.statusExpired;
      } else if (statusEl.classList.contains("expiring-tag")) {
        const match = statusEl.textContent.match(/\d+/);
        if (match) {
          statusEl.textContent = dict.statusExpiring(Number(match[0]));
        }
      }
    }

    // Update retirement "In Use" / "使用中" text
    const retireEl = card.querySelector('[data-field="retirementDate"]');
    if (retireEl) {
      const t = retireEl.textContent.trim();
      if (t === "使用中" || t === "In Use") {
        retireEl.textContent = dict.inUse;
      }
    }

    // Update days used word ("5 天" → "5 d" / "5 d" → "5 天")
    const daysEl = card.querySelector('[data-field="daysUsed"]');
    if (daysEl) {
      const match = daysEl.textContent.match(/^(\d+)/);
      if (match) {
        daysEl.textContent = `${match[1]} ${dict.dayWord}`;
      }
    }
  });

  // Update empty state if present
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    const title = emptyState.querySelector("h3");
    const text = emptyState.querySelector("p");
    if (title) title.textContent = dict.emptyTitle;
    if (text) text.textContent = dict.emptyText;
  }
}

/**
 
 * Handles the search functionality based on user input.
 
 */

function initFilters() {
  const bar = document.getElementById("categoryFilter");
  if (!bar) return;

  const categories = [
    "all",
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ];

  while (bar.children.length > 2) bar.removeChild(bar.lastChild);

  categories.forEach((cat) => {
    if (cat === "all") return;
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cat;
    btn.dataset.cat = cat;
    bar.appendChild(btn);
  });

  const btns = bar.querySelectorAll(".filter-btn");

  function activateBtn(targetBtn) {
    btns.forEach((b) => b.classList.remove("active"));
    targetBtn.classList.add("active");
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target.closest(".filter-btn");
      if (!target) return;
      activateBtn(target);
      currentFilter = target.dataset.cat;
      handleSearch();
    });
  });

  const activeBtn = bar.querySelector(".filter-btn.active");
  if (activeBtn) activateBtn(activeBtn);
}

function initToggleGroups() {
  const groups = document.querySelectorAll(".toggle-group");

  groups.forEach((group) => {
    const btns = group.querySelectorAll(".toggle-btn");

    function activateBtn(targetBtn) {
      btns.forEach((b) => b.classList.remove("active"));
      targetBtn.classList.add("active");
    }

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activateBtn(btn);
        const val = btn.dataset.val;
        if (group.id === "langGroup") {
          if (typeof applyLanguage === "function") applyLanguage(val);
        } else if (group.id === "themeGroup") {
          if (typeof applyThemeMode === "function") applyThemeMode(val);
        }
      });
    });

    // Initial sync from stored preferences
    if (group.id === "langGroup") {
      const sync = () => {
        const cur = typeof currentLang === "function" ? currentLang() : "zh-CN";
        const target = group.querySelector(`[data-val="${cur}"]`);
        if (target) activateBtn(target);
      };
      setTimeout(sync, 100);
      document.addEventListener("languageChanged", (e) => {
        const target = group.querySelector(`[data-val="${e.detail.lang}"]`);
        if (target) activateBtn(target);
      });
    } else if (group.id === "themeGroup") {
      const sync = () => {
        const cur =
          typeof getCurrentThemeMode === "function"
            ? getCurrentThemeMode()
            : "auto";
        const target = group.querySelector(`[data-val="${cur}"]`);
        if (target) activateBtn(target);
      };
      setTimeout(sync, 100);
      document.addEventListener("themeChanged", (e) => {
        const target = group.querySelector(`[data-val="${e.detail.mode}"]`);
        if (target) activateBtn(target);
      });
    }
  });
}

function handleSearch() {
  const inputEl = document.getElementById("searchInput");
  const raw = inputEl ? inputEl.value : "";
  const searchTerm = String(raw || "")
    .toLowerCase()
    .trim();

  const list = Array.isArray(items) ? items : [];
  const filteredItems = list.filter((item) => {
    const matchesCat =
      currentFilter === "all" || item.category === currentFilter;

    const name = String(item?.name ?? "").toLowerCase();
    const category = String(item?.category ?? "").toLowerCase();
    const notes = String(item?.notes ?? "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm) ||
      category.includes(searchTerm) ||
      notes.includes(searchTerm);

    return matchesCat && matchesSearch;
  });
  renderItems(sortItems(filteredItems));
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const initialRender = () => {
    updateStatistics();

    animateStatsCounters();

    handleSearch();
    initFilters();
    initToggleGroups();
  };
  if (Array.isArray(items) && items.length) initialRender();
  document.addEventListener("itemsLoaded", initialRender);

  initBackgroundAnimation();

  const runSearch = debounce(handleSearch, 300);

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => runSearch.flush());
  }

  const toggleCalcBtn = document.getElementById("toggleCalcModeBtn");
  if (toggleCalcBtn) {
    toggleCalcBtn.addEventListener("click", () => {
      // Cycle: 0 -> 1 -> 2 -> 0
      currentCalcMode = (currentCalcMode + 1) % 3;
      updateStatistics();
      animateStatsCounters();
    });
  }

  const calcCard = document.querySelector(".stat-card:first-child");
  if (calcCard) {
    calcCard.addEventListener("click", () => {
      if (!IS_SHORT_QUERY.matches) return;
      currentCalcMode = (currentCalcMode + 1) % 3;
      updateStatistics();
      animateStatsCounters();
    });
  }

  const mobileLangBtn = document.getElementById("mobileLangBtn");
  if (mobileLangBtn) {
    mobileLangBtn.addEventListener("click", () => {
      if (typeof applyLanguage === "function") {
        applyLanguage(currentLang() === "zh-CN" ? "en" : "zh-CN");
      }
    });
  }

  const THEME_ICONS = {
    auto: "fa-circle-half-stroke",
    light: "fa-sun",
    dark: "fa-moon",
  };
  const mobileThemeBtn = document.getElementById("mobileThemeBtn");
  const updateMobileThemeIcon = () => {
    if (!mobileThemeBtn) return;
    const mode =
      typeof getCurrentThemeMode === "function"
        ? getCurrentThemeMode()
        : "auto";
    const icon = mobileThemeBtn.querySelector("i");
    if (icon) {
      icon.className = `fas ${THEME_ICONS[mode] || THEME_ICONS.auto}`;
    }
  };
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener("click", () => {
      const order = ["auto", "light", "dark"];
      const cur =
        typeof getCurrentThemeMode === "function"
          ? getCurrentThemeMode()
          : "auto";
      const next = order[(order.indexOf(cur) + 1) % order.length];
      if (typeof applyThemeMode === "function") applyThemeMode(next);
      updateMobileThemeIcon();
    });
    document.addEventListener("themeChanged", updateMobileThemeIcon);
  }

  const onResize = debounce(() => syncStatLabels(), 200);
  window.addEventListener("resize", onResize);

  const sortBtn = document.getElementById("sortOrderBtn");
  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      currentSortOrder = currentSortOrder === "desc" ? "asc" : "desc";
      const asc = currentSortOrder === "asc";
      sortBtn.dataset.order = currentSortOrder;
      sortBtn.classList.toggle("sort-asc", asc);
      sortBtn.setAttribute("aria-pressed", String(asc));
      const dict = typeof t === "function" ? t() : null;
      sortBtn.title = asc
        ? dict && dict.sortOldest
          ? dict.sortOldest
          : "按购买日期从旧到新排序"
        : dict && dict.sortNewest
          ? dict.sortNewest
          : "按购买日期从新到旧排序";
      handleSearch();
    });
  }

  document.getElementById("searchInput").addEventListener("input", runSearch);

  document

    .getElementById("searchInput")

    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        if (typeof runSearch?.flush === "function") {
          runSearch.flush();
        } else {
          handleSearch();
        }
      }
    });

  // Update dynamic areas when language changes (avoids full re-render)
  document.addEventListener("languageChanged", (e) => {
    updateStatistics();
    updateItemCardLabels(e.detail.dict);
    syncStatLabels();
    const sortBtn = document.getElementById("sortOrderBtn");
    if (sortBtn && e.detail.dict) {
      sortBtn.title =
        sortBtn.dataset.order === "asc"
          ? e.detail.dict.sortOldest
          : e.detail.dict.sortNewest;
    }
  });

  function initBackgroundAnimation() {
    AppAnimations.initBackground("bgAnimation");
  }

  syncStatLabels();
  handleSearch();
});

// i18n definitions removed from script.js.
// Use global currentLang() and t() provided by lang.js.
