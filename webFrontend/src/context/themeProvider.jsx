"use client"

import { useState, useEffect } from "react"
import { ThemeContext } from "./themeContext"
import { themes } from "@/themes/themes"

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference, default to dark
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        return savedTheme
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light"
      }
    }

    return "dark"
  })

  const themeConfig = themes[theme]

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    console.log("Toggling theme to:", newTheme)
  }

  const handleSetTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme)
      console.log("Setting theme to:", newTheme)
    }
  }

  // Apply theme to document root and save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement
    const colors = themeConfig.colors

    console.log("Applying theme:", theme, colors)

    // Set CSS custom properties
    root.style.setProperty("--bg-primary", colors.background.primary)
    root.style.setProperty("--bg-secondary", colors.background.secondary)
    root.style.setProperty("--bg-tertiary", colors.background.tertiary)
    root.style.setProperty("--bg-card", colors.background.card)
    root.style.setProperty("--bg-modal", colors.background.modal)
    root.style.setProperty("--bg-sidebar", colors.background.sidebar)
    root.style.setProperty("--bg-topbar", colors.background.topbar)

    root.style.setProperty("--text-primary", colors.text.primary)
    root.style.setProperty("--text-secondary", colors.text.secondary)
    root.style.setProperty("--text-tertiary", colors.text.tertiary)
    root.style.setProperty("--text-muted", colors.text.muted)
    root.style.setProperty("--text-inverse", colors.text.inverse)

    root.style.setProperty("--border-primary", colors.border.primary)
    root.style.setProperty("--border-secondary", colors.border.secondary)
    root.style.setProperty("--border-focus", colors.border.focus)
    root.style.setProperty("--border-hover", colors.border.hover)

    root.style.setProperty("--brand-purple", colors.brand.purple)
    root.style.setProperty("--brand-blue", colors.brand.blue)
    root.style.setProperty("--brand-teal", colors.brand.teal)
    root.style.setProperty("--brand-amber", colors.brand.amber)
    root.style.setProperty("--brand-green", colors.brand.green)
    root.style.setProperty("--brand-dark_green", colors.brand.dark_green)
    root.style.setProperty("--brand-red", colors.brand.red)

    root.style.setProperty("--status-success", colors.status.success)
    root.style.setProperty("--status-error", colors.status.error)
    root.style.setProperty("--status-warning", colors.status.warning)
    root.style.setProperty("--status-info", colors.status.info)

    root.style.setProperty("--interactive-hover", colors.interactive.hover)
    root.style.setProperty("--interactive-active", colors.interactive.active)
    root.style.setProperty("--interactive-disabled", colors.interactive.disabled)
    root.style.setProperty("--interactive-focus", colors.interactive.focus)

    root.style.setProperty("--toast-background", colors.toast.background)
    root.style.setProperty("--toast-text", colors.toast.text)

    // Set gradients
    root.style.setProperty("--gradient-hero", themeConfig.gradients.hero)
    root.style.setProperty("--gradient-services", themeConfig.gradients.services)
    root.style.setProperty("--gradient-values", themeConfig.gradients.values)
    root.style.setProperty("--gradient-about", themeConfig.gradients.about)
    root.style.setProperty("--gradient-contact", themeConfig.gradients.contact)

    // Set shadows
    root.style.setProperty("--shadow-sm", themeConfig.shadows.sm)
    root.style.setProperty("--shadow-md", themeConfig.shadows.md)
    root.style.setProperty("--shadow-lg", themeConfig.shadows.lg)
    root.style.setProperty("--shadow-xl", themeConfig.shadows.xl)

    // Save to localStorage
    localStorage.setItem("theme", theme)

    // Set data attribute for CSS selectors AND class for CSS
    root.setAttribute("data-theme", theme)

    // Apply the theme class to HTML element
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }

    // Also set the background color directly on the body
    document.body.style.backgroundColor = colors.background.primary
    document.body.style.color = colors.text.primary
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease"

  }, [theme, themeConfig])

  const value = {
    theme,
    themeConfig,
    toggleTheme,
    setTheme: handleSetTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
