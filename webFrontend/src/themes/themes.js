/**
 * @typedef {import('../context/themeContext.js').ThemeConfig} ThemeConfig
 */

/**
 * Dark theme configuration
 * @type {ThemeConfig}
 */
export const darkTheme = {
  name: "dark",
  colors: {
    background: {
      primary: "rgb(8 15 35)", // deep blue-slate
      secondary: "rgb(15 23 42)", // slate-900
      tertiary: "rgb(30 41 59)", // slate-800
      card: "rgba(15, 23, 42, 0.92)",
      modal: "rgba(15, 23, 42, 0.97)",
      sidebar: "rgb(15 23 42)",
      topbar: "rgb(8 15 35)",
    },
    text: {
      primary: "rgb(241 245 249)", // slate-100
      secondary: "rgb(203 213 225)", // slate-300
      tertiary: "rgb(148 163 184)", // slate-400
      muted: "rgb(100 116 139)", // slate-500
      inverse: "rgb(15 23 42)",
    },
    border: {
      primary: "rgb(71 85 105)", // slate-600
      secondary: "rgb(51 65 85)", // slate-700
      focus: "rgb(96 165 250)", // blue-400
      hover: "rgb(148 163 184)", // slate-400
    },
    brand: {
      purple: "rgb(129 140 248)", // indigo-400
      blue: "rgb(56 189 248)", // sky-400
      teal: "rgb(34 211 238)", // cyan-400
      amber: "rgb(251 191 36)", // amber-400
      green: "rgb(96 165 250)", // blue-400 (primary actions)
      dark_green: "rgb(59 130 246)", // blue-500
      red: "rgb(248 113 113)", // red-400
    },
    toast: {
      background: "rgba(15, 23, 42, 0.88)",
      text: "rgb(241 245 249)",
    },
    status: {
      success: "rgb(52 211 153)", // emerald-400
      error: "rgb(248 113 113)",
      warning: "rgb(251 191 36)",
      info: "rgb(96 165 250)",
    },
    interactive: {
      hover: "rgba(148, 163, 184, 0.12)",
      active: "rgba(148, 163, 184, 0.22)",
      disabled: "rgba(100, 116, 139, 0.45)",
      focus: "rgba(96, 165, 250, 0.25)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(8 15 35), rgb(15 23 42), rgb(8 15 35))",
    services: "linear-gradient(to bottom right, rgb(49 46 129), rgb(67 56 202), rgb(30 58 138))",
    values: "linear-gradient(to bottom right, rgb(12 74 110), rgb(14 116 144), rgb(21 94 117))",
    about: "linear-gradient(to bottom right, rgb(30 58 138), rgb(67 56 202), rgb(30 64 175))",
    contact: "linear-gradient(to bottom right, rgb(14 165 233), rgb(59 130 246))",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
}

/**
 * Light theme configuration
 * @type {ThemeConfig}
 */
export const lightTheme = {
  name: "light",
  colors: {
    background: {
      primary: "rgb(239 246 255)", // blue-50
      secondary: "rgb(224 242 254)", // sky-100
      tertiary: "rgb(255 255 255)",
      card: "rgb(255 255 255)",
      modal: "rgba(255, 255, 255, 0.97)",
      sidebar: "rgb(238 242 255)", // indigo-50
      topbar: "rgb(239 246 255)",
    },
    text: {
      primary: "rgb(15 23 42)", // slate-900
      secondary: "rgb(51 65 85)", // slate-700
      tertiary: "rgb(100 116 139)", // slate-500
      muted: "rgb(148 163 184)", // slate-400
      inverse: "rgb(255 255 255)",
    },
    border: {
      primary: "rgb(191 219 254)", // blue-200
      secondary: "rgb(224 242 254)", // sky-100
      focus: "rgb(37 99 235)", // blue-600
      hover: "rgb(148 163 184)", // slate-400
    },
    brand: {
      purple: "rgb(79 70 229)", // indigo-600
      blue: "rgb(14 165 233)", // sky-500
      teal: "rgb(6 182 212)", // cyan-500
      amber: "rgb(245 158 11)",
      green: "rgb(37 99 235)", // blue-600 (primary actions)
      dark_green: "rgb(29 78 216)", // blue-700
      red: "rgb(220 38 38)",
    },
    toast: {
      background: "rgb(255 255 255)",
      text: "rgb(15 23 42)",
    },
    status: {
      success: "rgb(5 150 105)", // emerald-600
      error: "rgb(220 38 38)",
      warning: "rgb(217 119 6)",
      info: "rgb(37 99 235)",
    },
    interactive: {
      hover: "rgba(37, 99, 235, 0.06)",
      active: "rgba(37, 99, 235, 0.12)",
      disabled: "rgba(148, 163, 184, 0.5)",
      focus: "rgba(37, 99, 235, 0.15)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(239 246 255), rgb(224 242 254), rgb(238 242 255))",
    services: "linear-gradient(to bottom right, rgb(199 210 254), rgb(165 180 252), rgb(191 219 254))",
    values: "linear-gradient(to bottom right, rgb(186 230 253), rgb(165 243 252), rgb(153 246 228))",
    about: "linear-gradient(to bottom right, rgb(219 234 254), rgb(199 210 254), rgb(224 242 254))",
    contact: "linear-gradient(to bottom right, rgb(125 211 252), rgb(96 165 250))",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
}

/**
 * Available themes object
 * @type {Object.<string, ThemeConfig>}
 */
export const themes = {
  dark: darkTheme,
  light: lightTheme,
}

/**
 * @typedef {'dark' | 'light'} ThemeName
 */
