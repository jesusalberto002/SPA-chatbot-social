"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../context/authContext"
import { motion } from "framer-motion"

import CommunityTopBar from "./components/communityTopBar"
import CommunityHome from "./pages/communityHome"
import MyCommunitiesPage from "./pages/myCommunities"
import CommunityExplore from "./pages/communityExplore"
import CommunityPopular from "./pages/communityPopular"
import CommunityDashboard from "./pages/communityDashboard"
import CommentSection from "./pages/postCommentSection"
import YouWereBannedComModal from "../../components/youWereBannedComModal"
import { set } from "date-fns"

const CommunityPage = ({ saveScrollPosition }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [communityCount, setCommunityCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [navigationHistory, setNavigationHistory] = useState([])

  const scrollContainerRef = useRef(null)
  const [scrollPositions, setScrollPositions] = useState(new Map())

  const [isTopBarVisible, setIsTopBarVisible] = useState(true)
  const lastScrollY = useRef(0)
  const [hasEnoughScrollRoom, setHasEnoughScrollRoom] = useState(false)

  const [feedPosts, setFeedPosts] = useState([])

  useEffect(() => {
    // Restore state from localStorage on component mount
    const savedState = JSON.parse(localStorage.getItem('communityState'));
    if (savedState) {
        setActiveTab(savedState.activeTab);
        setSelectedCommunity(savedState.selectedCommunity);
        setSelectedPost(savedState.selectedPost);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    const stateToSave = { activeTab, selectedCommunity, selectedPost };
    localStorage.setItem('communityState', JSON.stringify(stateToSave));
  }, [activeTab, selectedCommunity, selectedPost]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const scrollHeight = entry.target.scrollHeight
        const viewportHeight = window.innerHeight
        setHasEnoughScrollRoom(scrollHeight >= viewportHeight * 2)
      }
    })

    observer.observe(scrollContainer)
    return () => observer.disconnect()
  }, [isLoading]) // Re-run when content loads to check new height

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !hasEnoughScrollRoom) {
        setIsTopBarVisible(true) // Force visible if not enough room
        return
      }

      const currentScrollY = scrollContainerRef.current.scrollTop

      if (currentScrollY > lastScrollY.current) {
        setIsTopBarVisible(false) // Scrolling Down
      } else {
        setIsTopBarVisible(true) // Scrolling Up
      }
      lastScrollY.current = currentScrollY
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [hasEnoughScrollRoom]) // Only re-run when scroll room changes

  const saveCurrentScrollPosition = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop
      const key = `${activeTab}-${selectedCommunity || "none"}-${selectedPost?.id || "none"}`
      setScrollPositions((prev) => new Map(prev.set(key, scrollTop)))
    }
  }

  const restoreScrollPosition = (tab, community, post) => {
    const key = `${tab}-${community || "none"}-${post?.id || "none"}`
    const savedPosition = scrollPositions.get(key)

    if (savedPosition !== undefined && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedPosition
        }
      })
    }
  }

  useEffect(() => {
    const fetchUserCommunityInfo = async () => {
      setIsLoading(true)
      try {
        const mockCount = 2
        setCommunityCount(mockCount)
      } catch (error) {
        console.error("Failed to fetch community info", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserCommunityInfo()
  }, [user])

  const handleCommunityClick = (communityId) => {
    saveCurrentScrollPosition()
    saveScrollPosition()

    setNavigationHistory((prev) => [...prev, { tab: activeTab, community: selectedCommunity, post: selectedPost }])
    setSelectedCommunity(communityId)
    setActiveTab("dashboard")
  }

  const handlePostCommentClick = (post) => {
    saveCurrentScrollPosition()
    saveScrollPosition()

    setNavigationHistory((prev) => [...prev, { tab: activeTab, community: selectedCommunity, post: selectedPost }])
    setSelectedPost(post)
    setActiveTab("comment")
  }

  const handleBack = () => {
    const lastState = navigationHistory[navigationHistory.length - 1]
    if (lastState) {
      setActiveTab(lastState.tab)
      setSelectedCommunity(lastState.community)
      setSelectedPost(lastState.post)
      setNavigationHistory((prev) => prev.slice(0, -1))

      setTimeout(() => {
        restoreScrollPosition(lastState.tab, lastState.community, lastState.post)
      }, 50)
    } else {
      setActiveTab("home")
      setSelectedCommunity(null)
      setSelectedPost(null)
    }
  }

  const handleTabNavigation = (newTab) => {
    if (newTab !== activeTab) {
      saveCurrentScrollPosition()
      setActiveTab(newTab)
      setSelectedCommunity(null)
      setSelectedPost(null)

      setTimeout(() => {
        restoreScrollPosition(newTab, null, null)
      }, 50)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center" style={{ color: "var(--text-primary)" }}>
          Loading...
        </div>
      )
    }

    switch (activeTab) {
      case "my-communities":
        return <MyCommunitiesPage onCommunityClick={handleCommunityClick} />
      case "explore":
        return <CommunityExplore onCommunityClick={handleCommunityClick} onPostClick={handlePostCommentClick} />
      case "popular":
        return <CommunityPopular onCommunityClick={handleCommunityClick} onPostClick={handlePostCommentClick} />
      case "dashboard":
        return (
          <CommunityDashboard
            communityId={selectedCommunity}
            onBack={handleBack}
            onPostClick={handlePostCommentClick}
          />
        )
      case "comment":
        return <CommentSection post={selectedPost} onBack={handleBack} />
      case "home":
      default:
        return (
          <CommunityHome
            userCommunityCount={communityCount}
            onCommunityClick={handleCommunityClick}
            onPostClick={handlePostCommentClick}
            setFeedPosts={setFeedPosts}
            restoreScrollPosition={restoreScrollPosition}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="flex-shrink-0"
        animate={{
          height: isTopBarVisible || !hasEnoughScrollRoom ? "5rem" : "0rem", // Stay at 5rem if no room
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="sticky top-20 z-40 flex-shrink-0 overflow-hidden"
        animate={{
          height: isTopBarVisible || !hasEnoughScrollRoom ? "auto" : 0, // Stay visible if no room
          opacity: isTopBarVisible || !hasEnoughScrollRoom ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <CommunityTopBar
          activeTab={activeTab}
          onNavigate={handleTabNavigation}
          onCommunityClick={handleCommunityClick}
          isVisible={isTopBarVisible || !hasEnoughScrollRoom} // Force visible if no room
        />
      </motion.div>

      <motion.div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto z-30"
        animate={{
          marginTop: (isTopBarVisible || !hasEnoughScrollRoom) ? "0rem" : "-5rem",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
      <main className="min-w-0 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto min-w-0">
            <div className="animate-fade-in">{renderContent()}</div>
        </div>
      </main>
      </motion.div>
    </div>
  )
}

export default CommunityPage