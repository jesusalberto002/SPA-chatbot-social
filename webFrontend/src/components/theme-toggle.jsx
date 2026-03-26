"use client"

import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "../context/themeContext" // 1. Import the useTheme hook

export function ThemeToggle({ className = "" }) {
  // 2. Get the current theme and the toggle function from the context
  const { theme, toggleTheme } = useTheme()

  const handleToggle = () => {
    // 3. Add a console log to confirm the click is registered
    console.log("Theme toggle clicked. Current theme:", theme, "Switching to:", theme === 'light' ? 'dark' : 'light');
    toggleTheme();
  };


  return (
    <button
      onClick={handleToggle}
      className={`theme-toggle-button ${className}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          opacity: theme === "light" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="theme-toggle-icon"
      >
        <Sun className="w-5 h-5 brand-amber" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          opacity: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="theme-toggle-icon"
      >
        <Moon className="w-5 h-5 brand-blue" />
      </motion.div>

      {/* Invisible placeholder to maintain button size */}
      <div className="w-5 h-5 opacity-0">
        <Sun className="w-5 h-5" />
      </div>
    </button>
  )
}