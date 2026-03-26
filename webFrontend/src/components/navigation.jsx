"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { InteractiveButton } from "./interactive-button"
import { useNavigate } from "react-router-dom"

export function Navigation({ isFrontPage }) {

  const navigate = useNavigate() 

  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Update active section based on scroll position
      const sections = ["hero", "services", "about", "products", "contact"]
      const current = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (current) {
        setActiveSection(current)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleNavigate = (path) => {
    navigate(path)
  }

  const handleNavigateToHome = () => {
    navigate("/")
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-grey/50 backdrop-blur-md border-gray-800 shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
          <img
              src="/white_logo_transparent.png"
              alt="Haivens Logo"
              width={150}
              height={50}
              className="flex-shrink-0"
              loading="lazy"
            />
        </div>
        { isFrontPage && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "services", label: "Services" },
                { id: "about", label: "About" },
                { id: "products", label: "Products" },
                { id: "contact", label: "Contact" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    "relative hover:text-purple-400 transition-all duration-300 py-2 px-4 rounded-full",
                    "hover:bg-white/10 hover:scale-105",
                    activeSection === id && "text-purple-400 bg-white/10",
                  )}
                >
                  {label}
                  {activeSection === id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          
            <InteractiveButton
              className="bg-purple-600 text-white hover:bg-purple-700 rounded-full"
              onClick={() => handleNavigate("/login")}
            >
              Log In
            </InteractiveButton>
          </div>
        )}
      </div>
    </nav>
  )
}
