"use client"

import { useState, useRef, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { motion, AnimatePresence } from "framer-motion" // Import motion components
import { useAuth } from "../../context/authContext"
import { useModal } from "../../context/modalContext"
import { useTherapist } from "@/context/therapistContext"
import api from "../../api/axios"
import ReactMarkdown from "react-markdown"
import "./chatPage.css"

import UpgradeModal from "../components/upgradeSubModal"

import ChatSuggestionsMenu from "../AppPages/chatPageComponents/chatSuggestionsMenu"
import SuggestionCarousel from "./chatPageComponents/suggestionCarousel"

const welcomeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // This will make the children animate one after another
      delayChildren: 0.1,
    },
  },
};

const welcomeItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// --- NEW: Helper component for the action icons on bot messages ---
const BotMessageActions = ({ onReadAloud, onCopy, onShare, isPlaying }) => (
    <div className="flex items-center gap-1 mt-0 self-start">
        <button
            onClick={onReadAloud}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
            aria-label="Read message aloud"
        >
            <i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-volume-high'} text-xs text-gray-500 dark:text-gray-400`}></i>
        </button>
        <button
            onClick={onCopy}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
            aria-label="Copy message"
        >
            <i className="fa-solid fa-copy text-xs text-gray-500 dark:text-gray-400"></i>
        </button>
        <button
            onClick={onShare}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
            aria-label="Share message"
        >
            <i className="fa-solid fa-share-nodes text-xs text-gray-500 dark:text-gray-400"></i>
        </button>
    </div>
);

const Chat = ({ sessionId, onSessionChange, setChatHistoryRefresh }) => {
  const { user } = useAuth()
  const {showModal, hideModal} = useModal()
  const { therapist } = useTherapist()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoadingHistory, setIsLoadingHistory] = useState([false]) // State to hold chat history
  const [isBotTyping, setIsBotTyping] = useState(false)

  // --- NEW: State for dictation, menu, and audio playback ---
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDictationOn, setIsDictationOn] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null)
  const audioRef = useRef(null) // To hold the current Audio object
  const queueRef = useRef([]);
  const activeAudioIdRef = useRef(null);
  const isFetchingRestRef = useRef(false);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const [chatSuggestions, setChatSuggestions] = useState([])
  const [isSuggestionsMenuOpen, setIsSuggestionsMenuOpen] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const formRef = useRef(null);

  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  const hasChatStarted = messages.length > 0

  useEffect(() => {
    queueRef.current = audioQueue;
  }, [audioQueue]);

  // --- FIX: This effect now correctly handles closing the menu ---
  useEffect(() => {
    console.log("User:", user);
    const handleClickOutside = (event) => {
      // Close menu if the click is outside both the button AND the dropdown
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        menuButtonRef.current && !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Only add the event listener when the menu is open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]); // Re-run this effect only when isMenuOpen changes

  useEffect(() => {
    const fetchHistory = async () => {
      if (sessionId) {
        setIsLoadingHistory(true)
        try {
          const response = await api.get(`/chat/history/${sessionId}`)

          const formattedMessages = response.data.map((msg) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender.toLowerCase(),
            therapist: msg.therapist,
          }))
          setMessages(formattedMessages)
          console.log("Chat history loaded:", formattedMessages)
        } catch (error) {
          console.error("Error loading chat history:", error)
        } finally {
          setIsLoadingHistory(false)
        }
      } else {
        setMessages([]) // Clear messages if no sessionId
        setIsLoadingHistory(false)
      }
    }
    fetchHistory()
  }, [sessionId])

  useEffect(() => {
    if (chatEndRef.current && hasChatStarted) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isBotTyping])

  useEffect(() => {
    const fetchChatSuggestions = async () => {
      try {
        const chatSuggestions = localStorage.getItem('chatSuggestions');
        const timestamp = localStorage.getItem('chatSuggestionsTimestamp');
        const timeLimit = 5 * 60 * 60 * 1000; // 6 hours in milliseconds

        if (chatSuggestions && timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age < timeLimit) {
            setChatSuggestions(JSON.parse(chatSuggestions));
            return; // Use cached suggestions
          } else {
            console.log("Chat suggestions cache expired, fetching new suggestions.");
          }
        }

        const response = await api.get("/chat/chat-suggestions");
        const suggestionsResponse = response.data.suggestions || [];
        setChatSuggestions(suggestionsResponse);

        localStorage.setItem('chatSuggestions', JSON.stringify(suggestionsResponse));
        localStorage.setItem('chatSuggestionsTimestamp', Date.now().toString());
      } catch (error) {
        console.error("Error fetching chat suggestions:", error);
      }
    };
    fetchChatSuggestions();
  }, []);

  useEffect(() => {
      // Only play if we have chunks AND the player is currently idle (false)
      if (audioQueue.length > 0 && !isAudioPlaying && currentlyPlayingId) {
          playNextInQueue();
      } 
  }, [audioQueue, isAudioPlaying, currentlyPlayingId]);

    const playNextInQueue = () => {
      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) {
        setIsAudioPlaying(false);
        setCurrentlyPlayingId(null);
        return;
      }

      setIsAudioPlaying(true);
      const base64Data = currentQueue[0];
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }

      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      audioRef.current = audio;

      audio.onended = () => {
        console.log("Chunk finished. Advancing queue...");
        
        setAudioQueue(prev => {
            const remaining = prev.slice(1);
            
            // LOGIC: Only shut down if the queue is empty AND the server is done.
            const isQueueEmpty = remaining.length === 0;
            const isServerDone = !isFetchingRestRef.current;

            if (isQueueEmpty) {
                if (isServerDone) {
                    // THE FINAL CLOSURE: Everything is finished.
                    console.log("Queue empty and server done. Resetting icons.");
                    setIsAudioPlaying(false);
                    setCurrentlyPlayingId(null);
                } else {
                    // BUFFERING: Queue is empty but server is still cooking.
                    // We set playing to false so the useEffect can "rest" 
                    // until the next fetchRestOfAudio updates the queue.
                    console.log("Queue empty but still fetching. Waiting...");
                    setIsAudioPlaying(false);
                }
            } else {
                // CONTINUING: There are still chunks in the rack.
                // We set playing to false briefly to trigger the useEffect 
                // which will immediately call playNextInQueue().
                setIsAudioPlaying(false);
            }

            return remaining;
        });
    };

      audio.play().catch(err => {
        console.error("Playback error:", err);
        stopAudio();
      });
    };

    const stopAudio = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.onended = null;
      }
      activeAudioIdRef.current = null; // Clear the Ref
      setAudioQueue([]);
      queueRef.current = [];
      setIsAudioPlaying(false);
      isFetchingRestRef.current = false;
      setCurrentlyPlayingId(null);
  };

  const handleSendMessage = async (e, directMessage = null) => {
    if (e) e.preventDefault(); // Prevent form submission if it's an event

    console.log("Therapist info at send message:", therapist);
    // Check subscription status before allowing to send a message
    if (user?.subscriptionTier === "FREE") {
      showModal(
        <UpgradeModal 
          onClose={hideModal} 
          featureName="Unlimited AI Messaging" 
          requiredTier="GOLD" 
        />
      );
      return; // Stop the function here
    }

    // Use the direct message if provided, otherwise use the input value
    const trimmedInput = (directMessage || inputValue).trim();
    if (trimmedInput === "") return;

    // Close suggestions menu when a message is sent
    setIsSuggestionsMenuOpen(false);

      const userMessage = {
          sender: "user",
          text: trimmedInput,
          id: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsBotTyping(true)

      try {
          const responseType = isDictationOn ? 'TEXT_AND_AUDIO' : 'TEXT_ONLY';

          const response = await api.post("/chat/send", {
              message: userMessage.text,
              sessionId: sessionId,
              responseType: responseType,
              therapistId: therapist?.id, // Pass the therapist ID for TTS voice selection
          })

          const { 
            reply, 
            sessionId: newSessionId, 
            audioData,
            remainingText,
            hasMore,
          } = response.data;

          if (reply && reply.sender) {
              const botMessage = {
                  id: reply.id,
                  text: reply.content,
                  sender: reply.sender.toLowerCase(),
                  therapist: reply.therapist, // This includes the therapist's name and imageUrl
              }
              setMessages((prev) => [...prev.filter(m => m.id !== userMessage.id), userMessage, botMessage])

              if (isDictationOn && audioData && audioData.length > 0) {
                  // 1. Set the active ID so the player knows which message to light up
                  setCurrentlyPlayingId(reply.id);
                  activeAudioIdRef.current = reply.id;
                  
                  // 2. Load the initial chunks
                  setAudioQueue(audioData);

                  // 3. Start fetching the rest if necessary
                  if (hasMore && remainingText) {
                      isFetchingRestRef.current = true;
                      fetchRestOfAudio(remainingText, reply.id);
                  }
              }
          } else {
              console.error("Received an invalid reply from the server:", response.data)
          }

          if (!sessionId && newSessionId) {
              onSessionChange(newSessionId)
              setChatHistoryRefresh((prev) => !prev)
          }
      } catch (error) {
          console.error("Error sending message:", error)
          const errorMessage = {
              id: "error-" + Date.now(),
              sender: "bot",
              text: "Sorry, I couldn't connect. Please try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
      } finally {
          setIsBotTyping(false)
      }
  }

  // Future carousel logic
  const handleSuggestionClick = (suggestionText) => {
    const messageText = "Hello Haiven, I am interested about " + suggestionText + " and I would like to talk about this topic.";
    const syntheticEvent = { preventDefault: () => {} };
    console.log("Suggestion clicked:", suggestionText);
    handleSendMessage(syntheticEvent, messageText);
  };

  // --- NEW: Handle selecting a suggestion from the menu ---
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion);
    setIsSuggestionsMenuOpen(false);
    // Send the message directly
    handleSendMessage(null, suggestion);
  };

  const handleReadMessage = async (text, messageId) => {
      if (currentlyPlayingId === messageId) {
          stopAudio();
          return;
      }

      stopAudio(); 
      activeAudioIdRef.current = messageId;

      try {
          // Set this immediately so fetchRestOfAudio guards pass
          setCurrentlyPlayingId(messageId);
          
          const response = await api.post("/chat/send", {
              message: text,
              responseType: 'AUDIO_ONLY',
              therapistId: therapist?.id, // Pass the therapist ID for TTS voice selection
          });

          const { audioChunks, remainingText, hasMore } = response.data;

          if (audioChunks && audioChunks.length > 0) {
              setAudioQueue(audioChunks);
          }

          // Start fetching the rest
          if (hasMore && remainingText) {
              isFetchingRestRef.current = true;
              fetchRestOfAudio(remainingText, messageId);
          } else {
              isFetchingRestRef.current = false;
          }
      } catch (error) {
          console.error("Error getting audio:", error);
          stopAudio();
      }
  };

    const fetchRestOfAudio = async (textToProcess, originalMsgId) => {
      if (!textToProcess || textToProcess.trim().length === 0) return;
      
      // Use the REF here, not the state, to avoid closure staleness
      if (activeAudioIdRef.current !== originalMsgId) {
          console.log("Fetch aborted: User switched messages.");
          return;
      }

      try {
          const response = await api.post("/chat/get-remaining-audio", { 
            text: textToProcess, 
            therapistId: therapist?.id 
          });

          const { audioChunks, remainingText, hasMore } = response.data;

          // Check ref again after network request
          if (activeAudioIdRef.current === originalMsgId) {
              if (audioChunks && audioChunks.length > 0) {
                  setAudioQueue(prev => [...prev, ...audioChunks]);
              }

              if (hasMore && remainingText) {
                  isFetchingRestRef.current = true;
                  // Pass the next chunk of text
                  fetchRestOfAudio(remainingText, originalMsgId);
              } else {
                  isFetchingRestRef.current = false;
              }
          }
      } catch (error) {
          console.error("Background fetch failed:", error);
      }
  };

  const handleCopyMessage = (text) => {
      navigator.clipboard.writeText(text);
      alert("Message copied to clipboard!");
  };

  const handleShareMessage = async (text) => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Haiven Chat Message',
                  text: text,
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          handleCopyMessage(text);
      }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    // Hide suggestions if user starts typing
    if (text.trim() !== "") {
        setIsSuggestionsMenuOpen(false);
        console.log('menu status:', isSuggestionsMenuOpen);
    } else if (isInputFocused) {
        // Show suggestions if user clears the input while focused
        setIsSuggestionsMenuOpen(true);
        console.log('menu status:', isSuggestionsMenuOpen);
    }
  }

  const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSendMessage(e)
      }
  }

  // --- Handlers for Suggestion Menu focus and blur ---
  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (inputValue.trim() === "" && chatSuggestions.length > 0) {
      setIsSuggestionsMenuOpen(true);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // We add a small delay to allow a "click" on the suggestions
    // to register before the menu closes.
    setTimeout(() => {
      setIsSuggestionsMenuOpen(false);
    }, 150);
  };

  const chatContainerVariants = {
    initial: { opacity: 0 },
    chat: { opacity: 1, transition: { delay: 0.3, duration: 0.5 } },
  }

  const formContainerVariants = {
    // Initial state: centered vertically
    initial: { top: "50%", bottom: "auto", y: "-50%" },
    // Chat state: positioned at the bottom
    chat: { top: "auto", bottom: "1rem", y: "0%" },
  }

  return (
      <div className="chat-container flex flex-col h-full w-full relative" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
            <AnimatePresence>
              {!hasChatStarted && (
                <motion.div
                  key="initial-view"
                  className="flex-1 flex flex-col items-center justify-center px-4"
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  <motion.div 
                    className="text-center max-w-3xl mx-auto mb-8"
                    variants={welcomeContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h1 
                      className="text-5xl md:text-7xl font-bold tracking-tighter brand-gradient-text-tri mb-6 pb-4"
                      variants={welcomeItemVariants}
                    >
                      Hello, {user?.firstName || "there"}
                    </motion.h1>
                    <motion.p 
                      className="text-lg md:text-xl" 
                      style={{ color: "var(--text-tertiary, #6b7280)" }}
                      variants={welcomeItemVariants}
                    >
                      How are you feeling today?
                    </motion.p>
                  </motion.div>

                  {/* --- INPUT FORM 1 (Initial View) --- */}
                  
                  {/* --- FIX 3: Added `relative`, `zIndex`, and corrected `ref` --- */}
                  <div className="w-full max-w-3xl mx-auto relative" ref={formRef} style={{ zIndex: 10 }}>
                    <AnimatePresence>
                      {isSuggestionsMenuOpen && chatSuggestions.length > 0 && (
                        <ChatSuggestionsMenu
                          suggestions={chatSuggestions}
                          onSelectSuggestion={handleSuggestionSelect}
                        />
                      )}
                    </AnimatePresence>
                    <form
                      onSubmit={(e) => handleSendMessage(e, null)}
                      className="w-full p-2 rounded-full flex items-end items-center gap-2 border"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "transparent",
                      }}
                    >
                      <div className="relative" ref={menuButtonRef}>
                          <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0"
                            style={{ color: "var(--text-tertiary)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--interactive-hover)"; e.currentTarget.style.color = "var(--text-primary)" }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)" }}
                          >
                            <i className="fa-solid fa-bars text-lg sm:text-lg"></i>
                          </button>
                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                  ref={menuRef} 
                                  className="absolute bottom-full mb-2 w-48 rounded-lg shadow-lg border"
                                  style={{ backgroundColor: "var(--bg-secondary)" }}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  transition={{ duration: 0.2 }}
                              >
                                <button
                                    onClick={() => setIsDictationOn(!isDictationOn)}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-[var(--interactive-hover)]"
                                    style={{ color: "var(--text-Secondary)" }}
                                >
                                  <i style={{ color: "var(--text-tertiary)" }} className={`fa-solid ${isDictationOn ? 'fa-volume-high' : 'fa-volume-off'} w-6`}></i>
                                  <span style={{ color: "var(--text-tertiary)" }}>Dictation {isDictationOn ? 'ON' : 'OFF'}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      <TextareaAutosize
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        // --- FIX 4: Added onFocus and onBlur handlers ---
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Share your thoughts..."
                        className="flex-grow bg-transparent md:text-md resize-none chat-textarea py-3 focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                        maxRows={5}
                        rows={1}
                      />
                      <button
                        type="submit"
                        className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                          inputValue.trim() ? "brand-gradient-bg hover:opacity-90" : ""
                        }`}
                        style={{
                          backgroundColor: !inputValue.trim() ? "var(--interactive-disabled)" : undefined,
                          color: "var(--text-inverse)",
                        }}
                        disabled={!inputValue.trim()}
                      >
                        <i className="fa-solid fa-arrow-up text-lg"></i>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          
          {hasChatStarted && (
              <div className="absolute inset-0 flex flex-col">
                  <motion.div
                      className="flex-1 overflow-y-auto px-4 w-full max-w-4xl mx-auto pb-4 custom-scrollbar"
                      style={{
                          height: "calc(100vh - 200px)",
                          marginTop: "80px",
                          paddingTop: "20px",
                          minHeight: 0,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                  >
                      <div className="space-y-6">
                          {messages.map((msg) => (
                              <div key={msg.id} className={`message-row ${msg.sender === "user" ? "user-message" : ""}`}>
                                  {msg.sender === "bot" && (
                                      <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-tertiary, #f3f4f6)", border: "1px solid var(--border-primary, #e5e7eb)" }}>
                                          <img
                                            src={msg.therapist?.imageUrl || '/default-avatar.png'}
                                            alt="Therapist Profile Avatar"
                                            className="rounded-full object-cover"
                                          />
                                      </div>
                                  )}
                                  {msg.sender === 'user' ? (
                                      <div className="px-4 py-3 rounded-2xl max-w-[80%] md:max-w-[70%] break-words" style={{ backgroundColor: "var(--brand-dark_green)", color: "#ffffff" }}>
                                          <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.text}</p>
                                      </div>
                                  ) : (
                                        <div className="flex flex-col flex-1 max-w-[80%] md:max-w-[70%]">
                                            <div className="px-4 py-3 rounded-2xl break-words bot-message-content text-sm sm:text-base" style={{ backgroundColor: "var(--bg-secondary, #f9fafb)", color: "var(--text-primary, #000000)" }}>
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                            <BotMessageActions
                                                messageText={msg.text}
                                                onReadAloud={() => handleReadMessage(msg.text, msg.id)}
                                                onCopy={() => handleCopyMessage(msg.text)}
                                                onShare={() => handleShareMessage(msg.text)}
                                                isPlaying={currentlyPlayingId === msg.id}
                                            />
                                        </div>
                                  )}
                                  {msg.sender === "user" && (
                                      <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ backgroundColor: "var(--brand-purple, #8b5cf6)", color: "var(--text-inverse, #ffffff)" }}>
                                          <img
                                            src={user?.profileImageUrl || '/default-avatar.png'}
                                            alt="Current Profile Avatar"
                                            className="rounded-full object-cover"
                                          />
                                      </div>
                                  )}
                              </div>
                          ))}
                          {isBotTyping && (
                            <div className="message-row">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-tertiary, #f3f4f6)", border: "1px solid var(--border-primary, #e5e7eb)" }}>
                                    <img
                                      src={therapist?.imageUrl || '/default-avatar.png'}
                                      alt="Therapist Profile Avatar"
                                      className="rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex-initial">
                                    <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: "var(--bg-secondary, #f9fafb)", border: "1px solid var(--border-secondary, #e5e7eb)" }}>
                                        <div className="typing-indicator"><span></span><span></span><span></span></div>
                                    </div>
                                </div>
                            </div>
                        )}
                          <div ref={chatEndRef} />
                      </div>
                  </motion.div>
                  
                  {/* --- INPUT FORM 2 (Chat View) --- */}
                  <motion.div
                      className="flex-shrink-0 w-full max-w-3xl mx-auto px-4 pb-4 relative" 
                      style={{ zIndex: 10 }} // zIndex is still good here
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      ref={formRef} 
                  >
                      {/* --- FIX 5: Suggestions Menu is REMOVED from this block --- */}
                      
                      <form
                          onSubmit={(e) => handleSendMessage(e, null)}
                          className="w-full p-2 rounded-full flex items-end items-center gap-2"
                          style={{ backgroundColor: "var(--bg-secondary)" }}
                      >
                          <div className="relative" ref={menuButtonRef}>
                              <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0"
                                style={{ color: "var(--text-tertiary)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--interactive-hover)"; e.currentTarget.style.color = "var(--text-primary)" }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)" }}
                              >
                                <i className="fa-solid fa-bars text-lg sm:text-lg"></i>
                              </button>
                              <AnimatePresence>
                                {isMenuOpen && (
                                  <motion.div
                                      ref={menuRef} 
                                      className="absolute bottom-full mb-2 w-48 rounded-lg shadow-lg border"
                                      style={{
                                        backgroundColor: "var(--bg-modal)",
                                        borderColor: "var(--border-primary)",
                                      }}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      transition={{ duration: 0.2 }}
                                  >
                                    <button
                                        onClick={() => setIsDictationOn(!isDictationOn)}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-[var(--interactive-hover)]"
                                        style={{ color: "var(--text-Secondary)" }}
                                    >
                                      <i style={{ color: "var(--text-tertiary)" }} className={`fa-solid ${isDictationOn ? 'fa-volume-high' : 'fa-volume-off'} w-6`}></i>
                                      <span style={{ color: "var(--text-tertiary)" }}>Dictation {isDictationOn ? 'ON' : 'OFF'}</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          <TextareaAutosize
                              value={inputValue}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              // --- FIX 6: REMOVED onFocus and onBlur ---
                              placeholder="Share your thoughts here..."
                              className="flex-grow bg-transparent text-sm sm:text-base resize-none chat-textarea py-2 sm:py-3 focus:outline-none"
                              style={{ color: "var(--text-primary)" }}
                              maxRows={5}
                              rows={1}
                          />
                          <button
                            type="submit"
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                              inputValue.trim() ? "brand-gradient-bg hover:opacity-90" : ""
                            }`}
                            style={{
                              backgroundColor: !inputValue.trim() ? "var(--interactive-disabled)" : undefined,
                              color: "var(--text-inverse)",
                            }}
                            disabled={!inputValue.trim()}
                          >
                            <i className="fa-solid fa-arrow-up text-lg"></i>
                          </button>
                      </form>
                  </motion.div>
              </div>
          )}
      </div>
  )
}

export default Chat