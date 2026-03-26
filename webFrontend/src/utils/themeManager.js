/**
 * Theme Manager Utility
 * Handles theme switching and persistence
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = this.getInitialTheme()
    this.applyTheme(this.currentTheme)
  }

  /**
   * Get the initial theme based on localStorage or system preference
   */
  getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem("haivens-theme")
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }

    // Default to light
    return "light"
  }

  /**
   * Apply theme to the document
   */
  applyTheme(theme) {
    const html = document.documentElement

    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }

    // Save to localStorage
    localStorage.setItem("haivens-theme", theme)
    this.currentTheme = theme

    // Dispatch custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme } }))
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light"
    this.applyTheme(newTheme)
    return newTheme
  }

  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (theme === "light" || theme === "dark") {
      this.applyTheme(theme)
      return theme
    }
    console.warn(`Invalid theme: ${theme}. Use 'light' or 'dark'.`)
    return this.currentTheme
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * Listen for system theme changes
   */
  listenForSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem("haivens-theme")
        if (!savedTheme) {
          this.applyTheme(e.matches ? "dark" : "light")
        }
      })
    }
  }
}

// Create global instance
export const themeManager = new ThemeManager()
