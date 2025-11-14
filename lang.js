/**

 * UI language switching (Chinese / English).

 * Consolidated all translation keys (static + dynamic) here for maintainability.

 * Dispatches a custom 'languageChanged' event after applying language.

 * Updated to support pill button toggles (#langToggle / #themeToggle) replacing hidden selects.

 */
(function () {
  const translations = {
    "zh-CN": {
      // Static UI labels

      totalValueLabel: "总资产价值",

      totalItemsLabel: "物品总数",

      avgDailyCostLabel: "平均每日成本",

      itemsListTitle: "物品资产清单",

      searchBtnText: "搜索",

      searchPlaceholder: "搜索物品名称、类别或备注...",

      assetsCostNote: "所有资产成本均基于当前时间计算",

      systemTimeLabel: "系统时间:",

      // Dynamic item card & runtime labels

      purchaseDate: "购买日期",

      warrantyUntil: "保修至",

      retirementDate: "退役时间",

      inUse: "使用中",

      costCalcTitle: "成本计算",

      dailyCost: "日均成本",

      daysUsed: "已使用天数",

      emptyTitle: "未找到任何物品",

      emptyText: "请尝试不同的搜索词或清除搜索条件。",

      statusExpired: "已过保",

      statusExpiring: (d) => `保修即将到期 (${d}天)`,

      statusActive: "使用中",

      dayNames: [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ],

      dayOrdinalPrefix: "第",
      dayOrdinalSuffix: "天",
      dayWord: "天",
      systemDataUpdated: "系统数据更新时间：",

      currentItemsCount: "当前物品总数：",

      totalValueFooter: "总价值：",
    },

    en: {
      // Static UI labels

      totalValueLabel: "Total Asset Value",

      totalItemsLabel: "Total Items",

      avgDailyCostLabel: "Average Daily Cost",

      itemsListTitle: "Asset Items List",

      searchBtnText: "Search",

      searchPlaceholder: "Search name, category or notes...",

      assetsCostNote: "All asset costs are calculated based on current time",

      systemTimeLabel: "System Time:",

      // Dynamic item card & runtime labels

      purchaseDate: "Purchased",

      warrantyUntil: "Warranty Until",

      retirementDate: "Retirement",

      inUse: "In Use",

      costCalcTitle: "Cost Calculation",

      dailyCost: "Avg Daily Cost",

      daysUsed: "Days Used",

      emptyTitle: "No items found",

      emptyText: "Try different keywords or clear search filters.",

      statusExpired: "Warranty expired",

      statusExpiring: (d) => `Warranty expiring (${d}d)`,

      statusActive: "Active",

      dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],

      dayOrdinalPrefix: "Day",
      dayOrdinalSuffix: "",
      dayWord: "d",
      systemDataUpdated: "Data Updated:",

      currentItemsCount: "Items:",

      totalValueFooter: "Total Value:",
    },
  };

  function applyLanguage(lang) {
    const dict = translations[lang] || translations["zh-CN"];

    document.documentElement.setAttribute("lang", lang);

    setText("totalValueLabel", dict.totalValueLabel);

    setText("totalItemsLabel", dict.totalItemsLabel);

    setText("avgDailyCostLabel", dict.avgDailyCostLabel);

    const itemsTitleEl = document.getElementById("itemsListTitle");

    if (itemsTitleEl) {
      itemsTitleEl.innerHTML =
        '<i class="fas fa-list"></i> ' + dict.itemsListTitle;
    }

    setText("searchBtnText", dict.searchBtnText);

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
      searchInput.setAttribute("placeholder", dict.searchPlaceholder);
    }

    setText("assetsCostNote", dict.assetsCostNote);

    const systemLabelSpan = document.querySelector(
      "#systemTimeLabel .label-text",
    );
    if (systemLabelSpan) {
      systemLabelSpan.textContent = dict.systemTimeLabel;
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang, dict } }),
    );
  }

  function currentLang() {
    const sel = document.getElementById("langSwitcher");

    return sel ? sel.value : "zh-CN";
  }

  function t() {
    return translations[currentLang()] || translations["zh-CN"];
  }

  function setText(id, value) {
    const el = document.getElementById(id);

    if (el) el.textContent = value;
  }

  function initLang() {
    const switcher = document.getElementById("langSwitcher");

    if (!switcher) return;

    const stored = localStorage.getItem("appLang");

    if (stored && translations[stored]) {
      switcher.value = stored;
    }

    applyLanguage(switcher.value);

    switcher.addEventListener("change", (e) => {
      const chosen = e.target.value;

      localStorage.setItem("appLang", chosen);

      applyLanguage(chosen);

      syncLangPill();
    });

    // Pill button language toggle
    const langPill = document.getElementById("langToggle");
    function syncLangPill() {
      if (!langPill) return;
      const cur = currentLang();
      langPill.textContent = cur === "zh-CN" ? "中文" : "EN";
      langPill.classList.toggle("lang-en", cur === "en");
      langPill.dataset.lang = cur;
    }

    if (langPill) {
      langPill.addEventListener("click", () => {
        const next = currentLang() === "zh-CN" ? "en" : "zh-CN";
        switcher.value = next;
        localStorage.setItem("appLang", next);
        applyLanguage(next);
        syncLangPill();
      });
      syncLangPill();
    }

    // Theme pill bridge (cycle: auto -> light -> dark -> auto)
    const themeSelect = document.getElementById("themeSwitcher");
    const themePill = document.getElementById("themeToggle");
    if (themeSelect && themePill) {
      const cycle = ["auto", "light", "dark"];
      function applyThemePill(mode) {
        themePill.dataset.mode = mode;
        themePill.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        themePill.classList.remove("theme-light", "theme-dark");
        if (mode === "light") themePill.classList.add("theme-light");
        else if (mode === "dark") themePill.classList.add("theme-dark");
      }
      applyThemePill(themeSelect.value);
      themePill.addEventListener("click", () => {
        const idx = cycle.indexOf(themeSelect.value);
        const next = cycle[(idx + 1) % cycle.length];
        themeSelect.value = next;
        applyThemePill(next);
        themeSelect.dispatchEvent(new Event("change"));
      });
      document.addEventListener("themeChanged", (e) => {
        if (e.detail && e.detail.mode) {
          applyThemePill(e.detail.mode);
        }
      });
    }
  }

  window.applyLanguage = applyLanguage;

  window.uiTranslations = translations;

  window.currentLang = currentLang;

  window.t = t;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLang);
  } else {
    initLang();
  }
})();
