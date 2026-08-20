/**
 * UI language switching (Chinese / English).
 *
 * Consolidated all translation keys (static + dynamic) here for maintainability.
 * Dispatches a custom 'languageChanged' event after applying language.
 * Current language is persisted in localStorage under 'appLang'.
 */

(function () {
  const STORAGE_KEY = "appLang";
  const DEFAULT_LANG = "zh-CN";

  const translations = {
    "zh-CN": {
      // Static UI labels
      totalValueLabel: "总资产",
      totalValueLabelAll: "总资产 (总值)",
      totalValueLabelActive: "总资产 (未退役)",
      totalValueLabelNet: "总资产 (净值)",

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
      statusRetired: "已退役",
      statusExpired: "已过保",
      statusExpiring: (d) => `保修即将到期 (${d}天)`,
      statusActive: "使用中",

      dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
      dayOrdinalPrefix: "第",
      dayOrdinalSuffix: "天",
      dayWord: "天",
      currentItemsCount: "当前物品总数：",
      totalValueFooter: "总价值：",
    },

    en: {
      // Static UI labels
      totalValueLabel: "Total Asset Value",
      totalValueLabelAll: "Total Asset Value (All)",
      totalValueLabelActive: "Total Asset Value (Active)",
      totalValueLabelNet: "Total Asset Value (Net)",

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
      statusRetired: "Retired",
      statusExpired: "Expired",
      statusExpiring: (d) => `Expiring (${d}d)`,
      statusActive: "Active",

      dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      dayOrdinalPrefix: "Day",
      dayOrdinalSuffix: "",
      dayWord: "d",
      currentItemsCount: "Items:",
      totalValueFooter: "Total Value:",
    },
  };

  /**
   * Get the current language from localStorage.
   * @returns {'zh-CN'|'en'}
   */
  function currentLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return translations[stored] ? stored : DEFAULT_LANG;
  }

  /**
   * Get the translation dictionary for the current language.
   */
  function t() {
    return translations[currentLang()];
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /**
   * Apply the given language to the UI.
   * @param {'zh-CN'|'en'} lang
   */
  function applyLanguage(lang) {
    const dict = translations[lang] || translations[DEFAULT_LANG];

    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem(STORAGE_KEY, lang);

    setText("totalValueLabel", dict.totalValueLabel);
    setText("totalItemsLabel", dict.totalItemsLabel);
    setText("avgDailyCostLabel", dict.avgDailyCostLabel);
    setText("itemsListTitleText", dict.itemsListTitle);
    setText("searchBtnText", dict.searchBtnText);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.setAttribute("placeholder", dict.searchPlaceholder);
    }

    setText("assetsCostNote", dict.assetsCostNote);

    const systemLabelSpan = document.querySelector("#systemTimeLabel .label-text");
    if (systemLabelSpan) {
      systemLabelSpan.textContent = dict.systemTimeLabel;
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang, dict } }),
    );
  }

  window.applyLanguage = applyLanguage;
  window.switchLanguage = applyLanguage;
  window.uiTranslations = translations;
  window.currentLang = currentLang;
  window.t = t;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyLanguage(currentLang()));
  } else {
    applyLanguage(currentLang());
  }
})();