/**
 * @typedef {import('../context/themeContext.js').ThemeConfig} ThemeConfig
 */

// Example of how to create new themes in the future

/**
 * Ocean theme configuration
 * @type {ThemeConfig}
 */
export const oceanTheme = {
  name: "ocean",
  colors: {
    background: {
      primary: "rgb(8 47 73)", // Deep ocean blue
      secondary: "rgb(12 74 110)", // Ocean blue
      tertiary: "rgb(14 116 144)", // Lighter ocean
      card: "rgba(12, 74, 110, 0.8)",
      modal: "rgba(12, 74, 110, 0.9)",
      sidebar: "rgb(12 74 110)",
      topbar: "rgba(8, 47, 73, 0.8)",
    },
    text: {
      primary: "rgb(240 249 255)", // Very light blue
      secondary: "rgb(186 230 253)", // Light blue
      tertiary: "rgb(125 211 252)", // Sky blue
      muted: "rgb(56 189 248)", // Bright blue
      inverse: "rgb(8 47 73)",
    },
    border: {
      primary: "rgb(14 116 144)",
      secondary: "rgb(12 74 110)",
      focus: "rgb(6 182 212)", // Cyan
      hover: "rgb(125 211 252)",
    },
    brand: {
      purple: "rgb(147 51 234)",
      blue: "rgb(6 182 212)",
      teal: "rgb(16 185 129)",
      amber: "rgb(245 158 11)",
      green: "rgb(34 197 94)",
      red: "rgb(239 68 68)",
    },
    status: {
      success: "rgb(34 197 94)",
      error: "rgb(239 68 68)",
      warning: "rgb(245 158 11)",
      info: "rgb(59 130 246)",
    },
    interactive: {
      hover: "rgba(125, 211, 252, 0.1)",
      active: "rgba(125, 211, 252, 0.2)",
      disabled: "rgba(56, 189, 248, 0.3)",
      focus: "rgba(6, 182, 212, 0.2)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(8 47 73), rgb(12 74 110), rgb(8 47 73))",
    services: "linear-gradient(to bottom right, rgb(14 116 144), rgb(6 182 212), rgb(14 116 144))",
    values: "linear-gradient(to bottom right, rgb(6 182 212), rgb(16 185 129), rgb(34 197 94))",
    about: "linear-gradient(to bottom right, rgb(59 130 246), rgb(6 182 212), rgb(16 185 129))",
    contact: "linear-gradient(to bottom right, rgb(125 211 252), rgb(6 182 212))",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(8, 47, 73, 0.1)",
    md: "0 4px 6px -1px rgba(8, 47, 73, 0.2)",
    lg: "0 10px 15px -3px rgba(8, 47, 73, 0.3)",
    xl: "0 20px 25px -5px rgba(8, 47, 73, 0.4)",
  },
}

/**
 * Sunset theme configuration
 * @type {ThemeConfig}
 */
export const sunsetTheme = {
  name: "sunset",
  colors: {
    background: {
      primary: "rgb(69 10 10)", // Deep red
      secondary: "rgb(127 29 29)", // Dark red
      tertiary: "rgb(185 28 28)", // Red
      card: "rgba(127, 29, 29, 0.8)",
      modal: "rgba(127, 29, 29, 0.9)",
      sidebar: "rgb(127 29 29)",
      topbar: "rgba(69, 10, 10, 0.8)",
    },
    text: {
      primary: "rgb(255 241 242)", // Very light red
      secondary: "rgb(254 202 202)", // Light red
      tertiary: "rgb(252 165 165)", // Pink
      muted: "rgb(248 113 113)", // Light red
      inverse: "rgb(69 10 10)",
    },
    border: {
      primary: "rgb(185 28 28)",
      secondary: "rgb(127 29 29)",
      focus: "rgb(245 158 11)", // Amber
      hover: "rgb(252 165 165)",
    },
    brand: {
      purple: "rgb(147 51 234)",
      blue: "rgb(6 182 212)",
      teal: "rgb(16 185 129)",
      amber: "rgb(245 158 11)",
      green: "rgb(34 197 94)",
      red: "rgb(239 68 68)",
    },
    status: {
      success: "rgb(34 197 94)",
      error: "rgb(239 68 68)",
      warning: "rgb(245 158 11)",
      info: "rgb(59 130 246)",
    },
    interactive: {
      hover: "rgba(252, 165, 165, 0.1)",
      active: "rgba(252, 165, 165, 0.2)",
      disabled: "rgba(248, 113, 113, 0.3)",
      focus: "rgba(245, 158, 11, 0.2)",
    },
  },
  gradients: {
    hero: "linear-gradient(to bottom right, rgb(69 10 10), rgb(127 29 29), rgb(69 10 10))",
    services: "linear-gradient(to bottom right, rgb(185 28 28), rgb(245 158 11), rgb(185 28 28))",
    values: "linear-gradient(to bottom right, rgb(245 158 11), rgb(251 191 36), rgb(252 211 77))",
    about: "linear-gradient(to bottom right, rgb(239 68 68), rgb(245 158 11), rgb(251 191 36))",
    contact: "linear-gradient(to bottom right, rgb(252 165 165), rgb(245 158 11))",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(69, 10, 10, 0.1)",
    md: "0 4px 6px -1px rgba(69, 10, 10, 0.2)",
    lg: "0 10px 15px -3px rgba(69, 10, 10, 0.3)",
    xl: "0 20px 25px -5px rgba(69, 10, 10, 0.4)",
  },
}

// To add these themes to your app, simply import them in themes.js and add them to the themes object:
// export const themes = {
//   dark: darkTheme,
//   light: lightTheme,
//   ocean: oceanTheme,
//   sunset: sunsetTheme,
// };
