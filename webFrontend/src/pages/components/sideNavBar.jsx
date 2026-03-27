"use client"

import { useAuth } from "../../context/authContext"
import { useState, useRef, useEffect } from "react"
import api from "../../api/axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  MoreHorizontal,
  Trash2,
  Edit3,
  X,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Users,
  BarChart2,
  Settings,
  MessageSquare,
  FolderArchive,
} from "lucide-react"
import toastService from "@/services/toastService"
import { useTheme } from "../../context/themeContext"

import MemberOnlyTooltip from "./MemberOnlyTooltip"

// --- Reusable Modal Component for Renaming Chats ---
const RenameModal = ({ session, onConfirm, onCancel }) => {
  const [newTitle, setNewTitle] = useState(session.title)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(session.id, newTitle)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <motion.div
        className="p-6 shadow-xl max-w-md w-full relative rounded-lg border"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          backgroundColor: "var(--bg-modal)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)"
          }}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Rename Chat
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-md px-3 py-2 border transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--border-focus)"
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--interactive-focus)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary)"
              e.currentTarget.style.boxShadow = "none"
            }}
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-semibold transition-colors border"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                borderColor: "var(--border-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: "var(--brand-green)",
                color: "var(--text-inverse)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brand-dark_green)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brand-green)"
              }}
            >
              Rename
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Animation variants for the mobile sidebar slide-in/out effect.
const mobileVariants = {
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
}

const Sidebar = ({
  currentPage,
  onNavigate,
  isSidebarOpen,
  onToggleSidebar,
  activeSessionId,
  chatHistoryRefresh,
  onSelectChat,
  onNewChat,
  // --- NEW PROPS FOR MOBILE ---
  isMobile = false,
  onClose,
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [chatSessions, setChatSessions] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [sessionToRename, setSessionToRename] = useState(null)
  const menuRefs = useRef({})

  // This logic determines if the sidebar should be in its expanded state.
  // On mobile, it's always "expanded" when visible. On desktop, it depends on the state.
  const isExpanded = isMobile ? true : isSidebarOpen

  // Use motion.aside for mobile to enable animations, otherwise a regular aside.
  const Component = motion.aside
  const motionProps = isMobile
    ? {
        initial: "closed",
        animate: "open",
        exit: "closed",
        variants: mobileVariants,
      }
    : {
        animate: {
          width: isExpanded ? 256 : 80, // px values for w-64 and w-20
          padding: isExpanded ? "1rem" : "0.5rem", // p-4 or p-2
        },
        transition: { duration: 0.3, ease: "easeInOut" },
      }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/chat/")
        setChatSessions(response.data)
      } catch (error) {
        console.error("Failed to fetch chat history:", error)
      }
    }
    fetchHistory()
  }, [chatHistoryRefresh])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  const handleDeleteChat = async (sessionId) => {
    try {
      await api.delete(`/chat/delete/${sessionId}`)
      setChatSessions((prev) => prev.filter((session) => session.id !== sessionId))
      setOpenMenuId(null)
      toastService.success("Chat deleted successfully")
    } catch (error) {
      console.error("Failed to delete chat:", error)
      toastService.error("Failed to delete chat. Please try again.")
    }
  }

  const handleRenameClick = (session) => {
    setSessionToRename(session)
    setOpenMenuId(null)
  }

  const confirmRename = async (sessionId, newTitle) => {
    if (!newTitle || !newTitle.trim()) {
      setSessionToRename(null)
      return
    }
    try {
      const response = await api.patch(`/chat/rename/${sessionId}`, { title: newTitle.trim() })
      const updatedSession = response.data

      setChatSessions((prevSessions) => prevSessions.map((s) => (s.id === sessionId ? updatedSession : s)))
      toastService.success("Chat renamed successfully")
    } catch (error) {
      console.error("Failed to rename chat:", error)
      toastService.error("Failed to rename chat. Please try again.")
    } finally {
      setSessionToRename(null)
    }
  }

  const getLogoSrc = () => {
    return theme === "light" ? "/logo-on-light-bg.svg" : "/logo-on-dark-bg.svg"
  }

  return (
    <>
      <AnimatePresence>{sessionToRename && <RenameModal session={sessionToRename} onConfirm={confirmRename} onCancel={() => setSessionToRename(null)} />}</AnimatePresence>
      <Component
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-colors duration-300 ease-in-out ${
          isExpanded ? "w-64 p-4" : "w-20 p-2"
        } ${sessionToRename ? "sidebar-faded" : ""}`}
        style={{
          backgroundColor: "var(--bg-sidebar)",
        }}
        {...motionProps}
      >
        <div className="flex flex-col gap-4 overflow-hidden flex-1">
          {/* Header Section */}
          <div className={`flex items-center pt-6 mb-4 ${isExpanded ? "justify-between" : "justify-center"}`}>
            <div
              className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                isExpanded ? "w-auto" : "w-0"
              }`}
            >
              <img src={getLogoSrc()} alt="App logo" width={120} height={40} className="flex-shrink-0" />
            </div>

            {/* Conditionally render the correct button for desktop vs mobile */}
            {!isMobile && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
                  e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "var(--text-tertiary)"
                }}
              >
                {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
              </button>
            )}
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--interactive-hover)"
                  e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "var(--text-tertiary)"
                }}
              >
                <X />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-0.5">
            <NavItem
              label="Chat"
              icon={MessageSquare}
              isActive={currentPage === "chat"}
              isExpanded={isExpanded}
              onClick={() => onNavigate("chat")}
            />
            <NavItem
              label="Community"
              icon={Users}
              isActive={currentPage === "community"}
              isExpanded={isExpanded}
              onClick={() => onNavigate("community")}
              isDisabled={user?.subscriptionTier === "FREE"}
            />
            {user?.role === "ADMIN" && (
              <>
                <NavItem
                  label="Reports"
                  icon={BarChart2}
                  isActive={currentPage === "reports"}
                  isExpanded={isExpanded}
                  onClick={() => onNavigate("reports")}
                />
                <NavItem
                  label="Management"
                  icon={FolderArchive}
                  isActive={currentPage === "management"}
                  isExpanded={isExpanded}
                  onClick={() => onNavigate("management")}
                />
              </>
            )}
          </nav>

          {/* Chat History Section */}
             <NavItem
              label="New Chat"
              icon={Plus}
              isExpanded={isExpanded}
              onClick={onNewChat}
            />

          {isExpanded && (
            <>
              {isExpanded && chatSessions.length > 0 && (
                <h3
                  className="text-xs font-bold tracking-wider uppercase px-2 my-2 text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  History
                </h3>
              )}
            <div className="flex flex-col flex-1 overflow-y-scroll custom-scrollbar">
              {chatSessions.map((session) => (
                <div key={session.id} className="group relative" ref={(el) => (menuRefs.current[session.id] = el)}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectChat(session.id);
                    }}
                    title={!isExpanded ? session.title : ""}
                    className={`flex items-center py-2.5 rounded-full transition-all duration-200 ${
                      isExpanded ? "px-4 gap-3 justify-start" : "justify-center px-0"
                    } ${
                      activeSessionId === session.id 
                        ? "brand-gradient-bg shadow-md text-white" 
                        : "text-[var(--text-tertiary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span
                      className={`transition-opacity whitespace-nowrap overflow-hidden text-sm min-w-0 flex-1 text-left ${
                        isExpanded ? "opacity-100" : "opacity-0 w-0"
                      }`}
                    >
                      {session.title}
                    </span>

                    {isExpanded && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === session.id ? null : session.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ml-2 ${
                          activeSessionId === session.id ? "text-white" : "text-[var(--text-tertiary)]"
                        }`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </a>

                  <AnimatePresence>
                    {openMenuId === session.id && isExpanded && (
                      <motion.div
                        className="absolute top-full mt-1 right-0 w-40 backdrop-blur-md rounded-lg shadow-xl z-50 border"
                        style={{
                          backgroundColor: "var(--bg-modal)",
                          borderColor: "var(--border-primary)",
                        }}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <div className="p-1">
                          <button
                            onClick={() => handleRenameClick(session)}
                            className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-all duration-200"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--interactive-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDeleteChat(session.id)}
                            className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-all duration-200"
                            style={{ color: "var(--status-error)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--interactive-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent";}}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </>
          )}
        </div>
      </Component>
    </>
  )
}

// --- Reusable NavItem Component ---
const NavItem = ({ label, icon: Icon, isActive, isExpanded, onClick, isDisabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MemberOnlyTooltip label={label} isVisible={isDisabled && isHovered}>
      <a
        href="#"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          if (!isDisabled) onClick();
        }}
        className={`flex items-center py-3 rounded-full transition-all duration-300 ${
          isExpanded ? "px-4 gap-3 justify-start" : "justify-center px-0"
        } ${
          isDisabled 
            ? "cursor-not-allowed opacity-40 grayscale" 
            : isActive 
              ? "brand-gradient-bg shadow-md text-white" 
              : "text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
        }`}
      >
        <div className={`flex items-center justify-center ${isExpanded ? "w-5 h-5" : "w-full h-5"}`}>
          <Icon className="text-lg" />
        </div>
        <span className={`transition-opacity whitespace-nowrap overflow-hidden text-sm ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
          {label}
        </span>
      </a>
    </MemberOnlyTooltip>
  );
};

export default Sidebar