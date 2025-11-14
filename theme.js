/**
 * Theme switching module (auto / light / dark) with persistence.
 *
 * Usage:
 *  - <select id="themeSwitcher"> values: auto | light | dark
 *  - CSS uses :root[data-theme="dark"] for dark mode tokens.
 *
 * Persistence key: localStorage 'appTheme'
 * Custom event dispatched: 'themeChanged'  (detail: { mode, effective })
 *
 * This module:
 *  - Loads stored preference or defaults to 'auto'
 *  - Applies effective theme (system preference when in auto)
 *  - Listens to OS theme changes while in 'auto'
 *  - Updates select UI + select element gradient style classes
 */

(function () {
  const STORAGE_KEY = "appTheme";
  const SELECTOR_ID = "themeSwitcher";
  const DARK_MQ = window.matchMedia("(prefers-color-scheme: dark)");

  /**
   * Read stored theme preference.
   * @returns {'auto'|'light'|'dark'}
   */
  function getStoredTheme() {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
    return "auto";
  }

  /**
   * Store theme preference.
   * @param {'auto'|'light'|'dark'} mode
   */
  function setStoredTheme(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  /**
   * Determine effective theme ('light'|'dark') given a mode.
   * @param {'auto'|'light'|'dark'} mode
   * @returns {'light'|'dark'}
   */
  function resolveEffectiveTheme(mode) {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    // auto -> system
    return DARK_MQ.matches ? "dark" : "light";
  }

  /**
   * Apply theme to document root and adjust UI classes.
   * @param {'auto'|'light'|'dark'} mode
   */
  function applyTheme(mode) {
    const effective = resolveEffectiveTheme(mode);
    const root = document.documentElement;

    if (effective === "dark") {
      root.dataset.theme = "dark";
    } else {
      // Remove to fall back to default (light) tokens
      delete root.dataset.theme;
    }

    decorateSwitcher(mode, effective);

    // Dispatch event for other modules (if needed)
    document.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { mode, effective } }),
    );
  }

  /**
   * Update select element visual state (gradient variant classes).
   * @param {'auto'|'light'|'dark'} mode
   * @param {'light'|'dark'} effective
   */
  function decorateSwitcher(mode, effective) {
    const sel = document.getElementById(SELECTOR_ID);
    const pill = document.getElementById("themeToggle");

    if (sel) {
      sel.classList.remove("dark-active", "light-active");
      if (mode === "auto") {
        if (effective === "dark") sel.classList.add("dark-active");
        else sel.classList.add("light-active");
      } else if (mode === "dark") {
        sel.classList.add("dark-active");
      } else if (mode === "light") {
        sel.classList.add("light-active");
      }
      sel.value = mode;
    }

    if (pill) {
      pill.classList.remove("theme-light", "theme-dark");
      if (mode === "light") pill.classList.add("theme-light");
      else if (mode === "dark") pill.classList.add("theme-dark");
      pill.dataset.mode = mode;
      pill.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
  }

  /**
   * Sync select value with stored mode.
   */
  function syncSelect(mode) {
    const sel = document.getElementById(SELECTOR_ID);
    if (!sel) return;
    sel.value = mode;
  }

  /**
   * Initialize theme system.
   */
  function initTheme() {
    const sel = document.getElementById(SELECTOR_ID);
    const pill = document.getElementById("themeToggle");

    const stored = getStoredTheme();
    if (sel) syncSelect(stored);
    applyTheme(stored);

    // Legacy select listener (if still present / hidden)
    if (sel) {
      sel.addEventListener("change", (e) => {
        const mode = e.target.value;
        if (mode !== "auto" && mode !== "light" && mode !== "dark") return;
        setStoredTheme(mode);
        applyTheme(mode);
      });
    }

    // Pill button cycling: auto -> light -> dark -> auto
    if (pill) {
      const cycle = ["auto", "light", "dark"];
      pill.addEventListener("click", () => {
        const currentMode = getStoredTheme();
        const idx = cycle.indexOf(currentMode);
        const next = cycle[(idx + 1) % cycle.length];
        setStoredTheme(next);
        applyTheme(next);
      });
    }

    // Listen OS changes only when mode=auto
    DARK_MQ.addEventListener("change", () => {
      const current = getStoredTheme();
      if (current === "auto") {
        applyTheme("auto");
      }
    });
  }

  // Expose helpers if other scripts need them
  window.getCurrentThemeMode = getStoredTheme;
  window.applyThemeMode = function (mode) {
    if (mode === "auto" || mode === "light" || mode === "dark") {
      setStoredTheme(mode);
      syncSelect(mode);
      applyTheme(mode);
    }
  };
  window.resolveEffectiveTheme = resolveEffectiveTheme;

  // Auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
