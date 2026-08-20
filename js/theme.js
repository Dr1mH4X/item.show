/**
 * Theme switching module (auto / light / dark) with persistence.
 *
 * Persistence key: localStorage 'appTheme'
 * Custom event dispatched: 'themeChanged'  (detail: { mode, effective })
 *
 * This module:
 *  - Loads stored preference or defaults to 'auto'
 *  - Applies effective theme (system preference when in auto)
 *  - Listens to OS theme changes while in 'auto'
 */

(function () {
  const STORAGE_KEY = "appTheme";
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
   * Apply theme to document root and notify other modules.
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

    document.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { mode, effective } }),
    );
  }

  /**
   * Initialize theme system.
   */
  function initTheme() {
    applyTheme(getStoredTheme());

    // Listen OS changes only when mode=auto
    DARK_MQ.addEventListener("change", () => {
      if (getStoredTheme() === "auto") {
        applyTheme("auto");
      }
    });
  }

  // Expose helpers for other scripts
  window.getCurrentThemeMode = getStoredTheme;
  window.applyThemeMode = function (mode) {
    if (mode === "auto" || mode === "light" || mode === "dark") {
      setStoredTheme(mode);
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
