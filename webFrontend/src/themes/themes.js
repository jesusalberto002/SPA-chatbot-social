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
      primary: "rgb(3 7 18)", // gray-950
      secondary: "rgb(17 24 39)", // gray-900
      tertiary: "rgb(31 41 55)", // gray-800
      card: "rgba(17, 24, 39, 0.8)",
      modal: "rgba(17, 24, 39, 0.95)",
      sidebar: "rgb(17 24 39)",
      topbar: "rgb(3 7 18)",
    },
    text: {
      primary: "rgb(255 255 255)",
      secondary: "rgb(229 231 235)", // gray-200
      tertiary: "rgb(156 163 175)", // gray-400
      muted: "rgb(107 114 128)", // gray-500
      inverse: "rgb(0 0 0)",
    },
    border: {
      primary: "rgb(75 85 99)", // gray-600
      secondary: "rgb(55 65 81)", // gray-700
      focus: "rgb(147 51 234)", // purple-600
      hover: "rgb(156 163 175)", // gray-400
    },
    brand: {
      purple: "rgb(147, 51, 234, 0.7)",
      blue: "rgb(6 182 212)",
      teal: "rgb(16 185 129)",
      amber: "rgb(245 158 11)",
      green: "rgb(34 197 94)",
      dark_green: "rgb(21 128 61)",
      red: "rgb(239 68 68)",
    },
    toast: {
      background: "rgb(30, 30, 34, 0.7)",
      text: "rgb(255 255 255)",
    },
    status: {
      success: "rgb(34 197 94)",
      error: "rgb(239 68 68)",
      warning: "rgb(245 158 11)",
      info: "rgb(59 130 246)",
    },
    interactive: {
      hover: "rgba(255, 255, 255, 0.1)",
      active: "rgba(255, 255, 255, 0.2)",
      disabled: "rgba(107, 114, 128, 0.5)",
      focus: "rgba(147, 51, 234, 0.2)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(0 0 0), rgb(17 24 39), rgb(0 0 0))",
    services: "linear-gradient(to bottom right, rgb(88 28 135), rgb(76 29 149), rgb(88 28 135))",
    values: "linear-gradient(to bottom right, rgb(19 78 74), rgb(15 118 110), rgb(6 95 70))",
    about: "linear-gradient(to bottom right, rgb(49 46 129), rgb(88 28 135), rgb(30 58 138))",
    contact: "linear-gradient(to bottom right, rgb(34 211 238), rgb(37 99 235))",
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
      primary: "rgb(255 255 255)",
      secondary: "rgb(229 231 235)", // gray-200
      tertiary: "rgb(243 244 246)", // gray-100
      card: "rgb(235, 235, 235)",
      modal: "rgba(229, 231, 235, 0.95)",
      sidebar: "rgb(235, 235, 235)",
      topbar: "rgb(255 255 255)",
    },
    text: {
      primary: "rgb(17 24 39)", // gray-900
      secondary: "rgb(55 65 81)", // gray-700
      tertiary: "rgb(107 114 128)", // gray-500
      muted: "rgb(156 163 175)", // gray-400
      inverse: "rgb(255 255 255)",
    },
    border: {
      primary: "rgb(209 213 219)", // gray-300
      secondary: "rgb(229 231 235)", // gray-200
      focus: "rgb(147 51 234)", // purple-600
      hover: "rgb(156 163 175)", // gray-400
    },
    brand: {
      purple: "rgb(147, 51, 234, 0.75)",
      blue: "rgb(6 182 212)",
      teal: "rgb(16 185 129)",
      amber: "rgb(245 158 11)",
      green: "rgb(10 186 152)",
      dark_green: "rgb(8 150 128)",
      red: "rgb(239 68 68)",
    },
    toast: {
      background: "rgba(230, 230, 230, 0.5)",
      text: "rgb(255 255 255)",
    },
    status: {
      success: "rgb(34 197 94)",
      error: "rgb(239 68 68)",
      warning: "rgb(245 158 11)",
      info: "rgb(59 130 246)",
    },
    interactive: {
      hover: "rgba(0, 0, 0, 0.05)",
      active: "rgba(0, 0, 0, 0.1)",
      disabled: "rgba(156, 163, 175, 0.5)",
      focus: "rgba(147, 51, 234, 0.1)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(255 255 255), rgb(243 244 246), rgb(255 255 255))",
    services: "linear-gradient(to bottom right, rgb(196 181 253), rgb(167 139 250), rgb(196 181 253))",
    values: "linear-gradient(to bottom right, rgb(153 246 228), rgb(94 234 212), rgb(45 212 191))",
    about: "linear-gradient(to bottom right, rgb(199 210 254), rgb(196 181 253), rgb(191 219 254))",
    contact: "linear-gradient(to bottom right, rgb(165 243 252), rgb(147 197 253))",
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
