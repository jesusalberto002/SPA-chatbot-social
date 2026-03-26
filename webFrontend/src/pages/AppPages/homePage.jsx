"use client"

import { useState, useRef, useLayoutEffect, useEffect } from "react"
import { useAuth } from '../../context/authContext'
import { useModal } from "../../context/modalContext"
import Sidebar from "../components/sideNavBar"
import TopBar from "../components/topBar"
import Chat from "./chatPage"
import CommunityPage from "./communitySection/communityLayout"
import AccountSettingsPage from "./settings/mainPage"
import AdminReportsPage from "../AdminPages/reports/mainPage"
import AdminManagementPage from "../AdminPages/management/mainPage"
import YouWereBannedComModal from "../components/youWereBannedComModal"
import WelcomeAppModal from "../components/welcomeAppModal"
import api from '../../api/axios'
import { motion, AnimatePresence } from "framer-motion"

export default function HomePage() {
  const { user, setUser, updateUser } = useAuth()
  const { showModal, hideModal } = useModal();
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'chat';
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  // --- MOBILE-FIRST CHANGES ---
  // State for the desktop sidebar (expanded/collapsed)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false)
  // State for the mobile sidebar's visibility (an overlay that slides in/out)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [activeSessionId, setActiveSessionId] = useState(null)
  const [chatHistoryRefresh, setChatHistoryRefresh] = useState(false)

  const [scrollPositions, setScrollPositions] = useState({});
  const mainContentRef = useRef(null);

  // State for suspension check
  const [suspensionStatus, setSuspensionStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // When the user object is available, check the `isNewUser` flag
    if (user?.isNewUser) {
      // Pass the modal component directly to the showModal function
      showModal(<WelcomeAppModal onClose={handleCloseWelcomeModal} />);
    }
  }, [user]); // This effect runs whenever the user object changes

  useEffect(() => {
    // Check for suspension status when the component mounts or user changes
    const checkSuspensionStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const response = await api.get('/user/community-suspension-status');
            if (response.data) {
                setSuspensionStatus(response.data);
            }
        } catch (error) {
            console.error("Failed to check suspension status:", error);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    if (user) {
        checkSuspensionStatus();
    } else {
        setIsCheckingStatus(false);
    }
  }, [user]);

  // This effect now ONLY saves the current page to localStorage when it changes.
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useLayoutEffect(() => {
    // When the currentPage changes, restore its last known scroll position
    const savedPosition = scrollPositions[currentPage];
    if (mainContentRef.current && savedPosition !== undefined) {
      mainContentRef.current.scrollTop = savedPosition;
    } else if (mainContentRef.current) {
      // If no position is saved for this view, scroll to the top
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentPage]); // This effect runs whenever the main page/view changes

  const saveScrollPosition = () => {
    if (mainContentRef.current) {
      setScrollPositions(prev => ({ ...prev, [currentPage]: mainContentRef.current.scrollTop }));
    }
  };

  const handleGoBackToHome = () => {
    setCurrentPage("chat")
  }

  const handleCloseWelcomeModal = async () => {
    // 1. Instantly update global context AND localStorage
    updateUser({ isNewUser: false });

    // 2. Quietly update the database in the background
    try {
        // You will need to create this simple route in your backend!
        await api.put('/user/dismiss-welcome-modal'); 
    } catch (error) {
        console.error("Failed to sync welcome modal status with server", error);
    } finally {
        // 3. Close the modal regardless of API success/failure to avoid blocking the user
        hideModal();
    }
};

  // --- NAVIGATION HANDLERS ---
  // These now close the mobile sidebar upon navigation
  const handleSelectChat = (sessionId) => {
    setActiveSessionId(sessionId)
    setCurrentPage("chat")
    setIsMobileSidebarOpen(false) // Close mobile sidebar
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setCurrentPage("chat")
    setChatHistoryRefresh((prev) => !prev)
    setIsMobileSidebarOpen(false) // Close mobile sidebar
  }
  
  const handleNavigate = (page) => {
      setCurrentPage(page);
      setIsMobileSidebarOpen(false); // Close mobile sidebar
  }

  // --- PAGE RENDERING LOGIC (Unchanged) ---
  const renderPage = () => {
    switch (currentPage) {
      case "chat":
        return (
          <Chat
            sessionId={activeSessionId}
            onSessionChange={setActiveSessionId}
            setChatHistoryRefresh={setChatHistoryRefresh}
            saveScrollPosition={saveScrollPosition}
          />
        )
      case "community":
        if (isCheckingStatus) {
            return <div className="text-center p-12 secondary-text">Verifying access...</div>;
        }

        // If status is ACTIVE, show the community. Otherwise, the user is suspended/banned.
        if (suspensionStatus?.status === 'ACTIVE') {
            return <CommunityPage saveScrollPosition={saveScrollPosition}/>
        } else {
            // Pass the suspension details to the modal so it can display the reason and duration.
            return <YouWereBannedComModal suspensionDetails={suspensionStatus} onGoBackToHome={handleGoBackToHome} />
        }
      case "accountSettings":
        return <AccountSettingsPage />
      case "reports":
        return <AdminReportsPage />
      case "management":
        return <AdminManagementPage />
      default:
        return (
          <Chat
            sessionId={activeSessionId}
            onSessionChange={setActiveSessionId}
            setChatHistoryRefresh={setChatHistoryRefresh}
          />
        )
    }
  }

  return (
    <div
      className="flex h-screen font-sans overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
      `}</style>

      {/* --- DESKTOP SIDEBAR (Visible on medium screens and up) --- */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          isSidebarOpen={isDesktopSidebarOpen}
          activeSessionId={activeSessionId}
          chatHistoryRefresh={chatHistoryRefresh}
          onToggleSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
        />
      </div>

      {/* --- MOBILE SIDEBAR (Renders as an overlay when open) --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar itself */}
            <div className="fixed top-0 left-0 h-full z-50 md:hidden">
              <Sidebar 
                isMobile={true} 
                onClose={() => setIsMobileSidebarOpen(false)}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                isSidebarOpen={true} // Always expanded in mobile overlay view
                activeSessionId={activeSessionId}
                chatHistoryRefresh={chatHistoryRefresh}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <div
        // Margin shifts for desktop, but is static on mobile
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <TopBar 
          isSidebarOpen={isDesktopSidebarOpen} 
          onNavigate={handleNavigate}
          // Pass the function to open the mobile sidebar
          onMenuClick={() => setIsMobileSidebarOpen(true)} 
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          <div key={currentPage} className="animate-fade-in h-full w-full min-w-0">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}