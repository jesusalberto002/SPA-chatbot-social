"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/authContext"
import { useNavigate } from "react-router-dom"
import { User, CreditCard, LogOut, Menu, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createPortal } from 'react-dom';
import { useModal } from "@/context/modalContext"
import "@/pages/AppPages/chatPage.css"

import TherapistsModal from "./therapistsModal/therapistsSelectionModal"
import TherapistCarousel from "./therapistsModal/therapistCarousel"
import MemberOnlyTooltip from "./MemberOnlyTooltip"
import { set } from "date-fns"
import { useTherapist } from "@/context/therapistContext"

const TopBar = ({ isMobileSidebarOpen, isSidebarOpen, onNavigate, onMenuClick }) => {
  const { showModal, hideModal } = useModal();
  const { therapist, setTherapist, isTherapistLoading } = useTherapist();
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isTherapistHovered, setIsTherapistHovered] = useState(false) // Track hover for tooltip
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const userIconRef = useRef(null)

  const isFreeUser = user?.subscriptionTier === "FREE";

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the user icon AND the menu itself
      if (
        userIconRef.current &&
        !userIconRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, []) // Dependencies are removed as refs don't need them here

  useEffect(() => {
    console.log("TopBar Render - Therapist:", therapist, "Loading:", isTherapistLoading);
    console.log("User info in TopBar:", user);
  }, [therapist, isTherapistLoading]);

  const getBadgeClasses = (tier) => {
    const baseClasses =
      "relative overflow-hidden z-0 px-4 py-1 text-xs font-bold tracking-wider rounded-full shadow-md capitalize"

    switch (tier?.toUpperCase()) {
      case "BRONZE":
        return `${baseClasses} subscription-badge-bronze shine-effect`
      case "PLATINUM":
        return `${baseClasses} subscription-badge-platinum shine-effect`
      case "FREE":
      default:
        return `${baseClasses} subscription-badge-free`
    }
  }

  const getMenuPosition = () => {
    if (userIconRef.current) {
      const rect = userIconRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right + window.scrollX,
        width: '300px',
      };
    }
    return { top: 0, right: 0, width: '300px' };
  };

  const menuContent = isMenuOpen && (
    <motion.div
      ref={menuRef} // *** FIX 1: Attach the ref here ***
      className="absolute rounded-lg shadow-xl border"
      style={{
        ...getMenuPosition(),
        zIndex: 10000,
        backgroundColor: "var(--bg-modal)",
        borderColor: "var(--border-primary)",
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="p-2">
        <div className="p-3 pb-4 text-center" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
          <p className="font-semibold text-md truncate" style={{ color: "var(--text-primary)" }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm truncate" style={{ color: "var(--text-tertiary)" }}>
            {user?.email}
          </p>
        </div>
        <div className="mt-2 space-y-1">
          <button
            onClick={() => {
              onNavigate("accountSettings")
              setIsMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-all duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
              e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            <User className="w-4 h-4" />
            <span>Account & Settings</span>
          </button>
          <button
            onClick={() => {
              navigate("/subscriptions")
              setIsMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-all duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
              e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            <CreditCard className="w-4 h-4" />
            <span>Manage Subscription</span>
          </button>
        </div>
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-all duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
              e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const handleTherapistsClick = () => {
    console.log("Therapists button clicked. Current therapist:", therapist);
    if (isFreeUser) return;

    showModal(
      <TherapistsModal onClose={hideModal}>
        <TherapistCarousel 
            onSelect={() => {
                hideModal(); // Close the modal after selection
            }} 
        />
      </TherapistsModal>
    );
  }

  return (
    <header
      className={`
        fixed top-0 z-40
        h-20 p-4 flex items-center justify-between
        transition-all duration-300 ease-in-out
        right-0 ${isSidebarOpen ? "left-0 md:left-64" : "left-0 md:left-20"}
      `}
      style={{
        backgroundColor: "var(--bg-topbar)",
      }}
    >
      {/* Left side content */}
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full transition-colors md:hidden"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'; 
            e.currentTarget.style.color = 'var(--text-primary)'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'transparent'; 
            e.currentTarget.style.color = 'var(--text-secondary)'; 
          }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <MemberOnlyTooltip 
          label="Therapist Selection" 
          isVisible={isFreeUser && isTherapistHovered}
        >
          <button
            onClick={handleTherapistsClick}
            onMouseEnter={() => setIsTherapistHovered(true)}
            onMouseLeave={() => setIsTherapistHovered(false)}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-full transition-all duration-200 border border-transparent group ${
              isFreeUser ? "cursor-not-allowed opacity-50 grayscale" : "hover:border-[var(--border-primary)]"
            }`}
            style={{ backgroundColor: "transparent" }}
          >
            {isTherapistLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--interactive-hover)] animate-pulse" />
                <div className="h-5 w-20 rounded bg-[var(--interactive-hover)] animate-pulse" />
              </div>
            ) : (
              <>
                {therapist?.imageUrl && (
                  <div className="relative w-8 h-8">
                    <img 
                      src={therapist.imageUrl} 
                      alt={therapist.name}
                      className="w-full h-full rounded-full object-cover border border-[var(--border-primary)] shadow-sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <span className="animated-gradient-text text-lg font-bold tracking-tight uppercase">
                    {therapist ? therapist.name : "Choose Therapist"}
                  </span>
                  {!isFreeUser && <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />}
                  {isFreeUser && <ChevronDown className="w-4 h-4 opacity-20" />}
                </div>
              </>
            )}
          </button>
        </MemberOnlyTooltip>
      </div>

      {/* Center content */}
      <div className="flex-1 flex justify-center items-center gap-4">
        <div className="hidden sm:block">
            {user?.subscriptionTier === "FREE" && (
            <button
                onClick={() => navigate("/subscriptions")}
                className="px-4 py-2 text-sm font-semibold rounded-full shadow-lg"
                style={{
                backgroundColor: "var(--brand-purple)",
                color: "white",
                }}
            >
                Upgrade Plan
            </button>
            )}
        </div>
      </div>

      {/* Right side content */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {/* <ThemeToggle /> */}
        {/* *** FIX 2: Remove the ref from this wrapper div *** */}
        <div className="relative">
          <div
            ref={userIconRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: "var(--brand-purple)",
              color: "white",
            }}
          >
            <img
                src={user?.profileImageUrl || '/default-avatar.png'}
                alt="Current Profile Avatar"
                className="rounded-full object-cover"
              />
          </div>
          {createPortal(
            <AnimatePresence>{menuContent}</AnimatePresence>,
            document.body
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar