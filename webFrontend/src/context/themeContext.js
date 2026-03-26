"use client"

import { createContext, useContext } from "react"

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * @typedef {Object} ThemeColors
 * @property {Object} background - Background colors
 * @property {string} background.primary - Primary background color
 * @property {string} background.secondary - Secondary background color
 * @property {string} background.tertiary - Tertiary background color
 * @property {string} background.card - Card background color
 * @property {string} background.modal - Modal background color
 * @property {string} background.sidebar - Sidebar background color
 * @property {string} background.topbar - Topbar background color
 *
 * @property {Object} text - Text colors
 * @property {string} text.primary - Primary text color
 * @property {string} text.secondary - Secondary text color
 * @property {string} text.tertiary - Tertiary text color
 * @property {string} text.muted - Muted text color
 * @property {string} text.inverse - Inverse text color
 *
 * @property {Object} border - Border colors
 * @property {string} border.primary - Primary border color
 * @property {string} border.secondary - Secondary border color
 * @property {string} border.focus - Focus border color
 * @property {string} border.hover - Hover border color
 *
 * @property {Object} brand - Brand colors
 * @property {string} brand.purple - Purple brand color
 * @property {string} brand.blue - Blue brand color
 * @property {string} brand.teal - Teal brand color
 * @property {string} brand.amber - Amber brand color
 * @property {string} brand.green - Green brand color
 * @property {string} brand.dark_green - Dark green brand color
 * @property {string} brand.red - Red brand color
 *
 * @property {Object} status - Status colors
 * @property {string} status.success - Success status color
 * @property {string} status.error - Error status color
 * @property {string} status.warning - Warning status color
 * @property {string} status.info - Info status color
 *
 * @property {Object} interactive - Interactive state colors
 * @property {string} interactive.hover - Hover state color
 * @property {string} interactive.active - Active state color
 * @property {string} interactive.disabled - Disabled state color
 * @property {string} interactive.focus - Focus state color
 * 
 * @property {Object} toast - Toast colors
 * @property {string} toast.background - Background color for toasts
 * @property {string} toast.text - Text color for toasts
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} name - Theme name
 * @property {ThemeColors} colors - Theme colors
 * @property {Object} gradients - Theme gradients
 * @property {string} gradients.hero - Hero section gradient
 * @property {string} gradients.services - Services section gradient
 * @property {string} gradients.values - Values section gradient
 * @property {string} gradients.about - About section gradient
 * @property {string} gradients.contact - Contact section gradient
 * @property {Object} shadows - Theme shadows
 * @property {string} shadows.sm - Small shadow
 * @property {string} shadows.md - Medium shadow
 * @property {string} shadows.lg - Large shadow
 * @property {string} shadows.xl - Extra large shadow
 */

/**
 * @typedef {Object} ThemeContextType
 * @property {Theme} theme - Current theme
 * @property {ThemeConfig} themeConfig - Current theme configuration
 * @property {Function} toggleTheme - Function to toggle between themes
 * @property {Function} setTheme - Function to set a specific theme
 */

/**
 * React context for theme management
 */
export const ThemeContext = createContext(undefined)

/**
 * Hook to use the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
