"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Search, Users, MessageSquareText, Menu, X, Home, Compass, Star, BarChart2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../../../api/axios"
import CommunitySearchBar from './communitySearchBar'

const CommunityTopBar = ({ activeTab, onNavigate, onCommunityClick, isVisible = true }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const mobileNavRef = useRef(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      setIsDropdownOpen(false)
      return
    }
    setIsSearching(true)
    setIsDropdownOpen(true)
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await api.get(`/community/search?term=${searchTerm}`)
        setSearchResults(response.data)
      } catch (error) {
        console.error("Failed to search communities:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleResultClick = (communityId) => {
    onCommunityClick(communityId)
    setSearchTerm("")
    setIsDropdownOpen(false)
  }

  const handleNavClick = (tabName) => {
    onNavigate(tabName)
    setIsMobileNavOpen(false)
  }

  const getButtonProps = (tabName) => {
    const isActive = activeTab === tabName
    return {
      style: {
        backgroundColor: isActive ? "var(--brand-green)" : "transparent",
        color: isActive ? "white" : "var(--text-secondary)",
      },
      onMouseEnter: (e) =>
        !isActive &&
        ((e.currentTarget.style.backgroundColor = "var(--interactive-hover)"),
        (e.currentTarget.style.color = "var(--text-primary)")),
      onMouseLeave: (e) =>
        !isActive &&
        ((e.currentTarget.style.backgroundColor = "transparent"),
        (e.currentTarget.style.color = "var(--text-secondary)")),
    }
  }

  return (
    <>
      <motion.header
        className="sticky top-0 left-0 right-0 z-40 flex items-center justify-between"
        style={{
          backgroundColor: "var(--bg-primary, #000)",
          borderBottom: "1px solid var(--border-secondary)",
        }}
        initial={false}
        animate={{
          y: isVisible ? 0 : "-100%",
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative z-50 flex-1 md:flex-none md:w-64"> {/* Increased z-index to 50 */}
            <CommunitySearchBar onCommunityClick={onCommunityClick} />
          </div>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick("home")}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold rounded-full whitespace-nowrap"
              {...getButtonProps("home")}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("my-communities")}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold rounded-full whitespace-nowrap"
              {...getButtonProps("my-communities")}
            >
              My Communities
            </button>
            <button
              onClick={() => handleNavClick("explore")}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold rounded-full whitespace-nowrap"
              {...getButtonProps("explore")}
            >
              Explore
            </button>
            <button
              onClick={() => handleNavClick("popular")}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold rounded-full whitespace-nowrap"
              {...getButtonProps("popular")}
            >
              Popular
            </button>
          </div>

          <div className="md:hidden flex-shrink-0">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-1.5 sm:p-2">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        </div>
      </motion.header>

      {createPortal(
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="fixed inset-0 bg-black/60 z-50"
              />
              <motion.div
                ref={mobileNavRef}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-64 sm:w-72 p-4 sm:p-6 z-50"
                style={{ backgroundColor: "var(--bg-secondary)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--text-secondary)" }} />
                </button>
                <nav className="mt-10 sm:mt-12 flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => handleNavClick("home")}
                    className={`flex items-center gap-3 p-3 rounded-lg text-base sm:text-lg ${activeTab === "home" ? "font-bold main-text" : "tertiary-text"}`}
                  >
                    <Home className="w-5 h-5" /> Home
                  </button>
                  <button
                    onClick={() => handleNavClick("my-communities")}
                    className={`flex items-center gap-3 p-3 rounded-lg text-base sm:text-lg ${activeTab === "my-communities" ? "font-bold main-text" : "tertiary-text"}`}
                  >
                    <Star className="w-5 h-5" /> My Communities
                  </button>
                  <button
                    onClick={() => handleNavClick("explore")}
                    className={`flex items-center gap-3 p-3 rounded-lg text-base sm:text-lg ${activeTab === "explore" ? "font-bold main-text" : "tertiary-text"}`}
                  >
                    <Compass className="w-5 h-5" /> Explore
                  </button>
                  <button
                    onClick={() => handleNavClick("popular")}
                    className={`flex items-center gap-3 p-3 rounded-lg text-base sm:text-lg ${activeTab === "popular" ? "font-bold main-text" : "tertiary-text"}`}
                  >
                    <BarChart2 className="w-5 h-5" /> Popular
                  </button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

export default CommunityTopBar