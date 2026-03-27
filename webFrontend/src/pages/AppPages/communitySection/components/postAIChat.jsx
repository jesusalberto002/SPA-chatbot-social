// webFrontend/src/pages/AppPages/communitySection/components/PostAIChat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import api from '@/api/axios';
import toastService from '@/services/toastService';
import ReactMarkdown from 'react-markdown';

// Helper Hook to determine view mode for responsiveness
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return isMobile;
};

// Simplified Message Component (omitted for brevity, assume no change)
const AIChatMessage = ({ sender, text }) => (
    <div className={`flex gap-3 items-start ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`p-3 rounded-xl max-w-[80%] text-sm break-words ${
            sender === 'user' 
                ? 'bg-[var(--brand-purple)] text-white rounded-br-none' 
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-secondary)] rounded-tl-none'
        }`}>
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    </div>
);


// Main Component
export default function PostAIChat({ post }) {
    const isMobileView = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [chatSessionId, setChatSessionId] = useState(null);
    const chatEndRef = useRef(null);
    const containerRef = useRef(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle closing the chat when clicking outside the container or the button
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickOnFloatingButton = document.getElementById('ai-chat-button')?.contains(event.target);

            if (containerRef.current && !containerRef.current.contains(event.target) && !isClickOnFloatingButton) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending) return;

    setIsSending(true);
    
    // The user's new message object must be part of the context sent to the API
    const userMessage = { sender: 'user', text: trimmedInput, id: Date.now() };

    // Optimistic UI Update - Keep your existing logic here
    setMessages(prev => [...prev, userMessage, { sender: 'bot', text: 'Typing...', id: 'typing', isTyping: true }]);
    setInputValue('');

    // Construct the context array using the current messages (excluding the typing indicator)
    const currentMessagesForContext = messages.filter(m => !m.isTyping).slice(-20); // Get last 20 messages

    // The FIRST message needs the extra context about the post. 
    const firstMessageText = !messages.length 
        ? `CONTEXT: The user is asking about a community post titled: "${post.title}" and content: "${post.content}". User's question: ${trimmedInput}`
        : trimmedInput;
    
    // This is the formatted history we send to the backend.
    const historyToSend = [
        ...currentMessagesForContext,
        { sender: 'user', text: firstMessageText } // The new user message
    ].map(m => ({
        sender: m.sender,
        text: m.text,
        // Exclude the 'id' field, as it's not strictly necessary for the AI and less error-prone
    }));


    try {
        const response = await api.post('/chat/temporary-chat/send', {
            // We now send the whole conversation history in the 'context' parameter.
            // The 'message' parameter can just be a placeholder or the last message.
            message: firstMessageText, // Pass the formatted first message text
            context: historyToSend, // Pass the full history
            responseType: 'TEXT_ONLY',
        });

            const { reply } = response.data;

            // Ensure you use the content of the reply to create the botMessage
            const botMessage = { sender: 'bot', text: reply.content, id: reply.id };
            
            // Remove typing indicator and add final user/bot messages
            setMessages(prev => {
                const tempMessages = prev.filter(m => m.id !== userMessage.id && !m.isTyping); 
                return [ 
                    ...tempMessages, 
                    userMessage, 
                    botMessage
                ];
            });

        } catch (error) {
            console.error("Error sending message to AI:", error);
            setMessages(prev => [
                ...prev.filter(m => !m.isTyping), 
                { sender: 'bot', text: 'Sorry, the AI is unavailable right now.', id: 'error' + Date.now() }
            ]);
            toastService.error("Failed to connect to AI.");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        // --- UPDATED ANIMATION FOR MOBILE ---
        mobileOpen: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        desktopOpen: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { opacity: 0, scale: 0.8, y: 50 },
    };
    
    // Define the style object for the floating container
    const floatingStyle = {
        position: 'fixed',
        right: isMobileView ? '1rem' : '2rem',
        bottom: isMobileView ? '1rem' : '2rem',
        zIndex: 1000, 
    };

    return (
        <div style={floatingStyle}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={containerRef}
                        className={`shadow-2xl rounded-xl border flex flex-col ${
                            isMobileView 
                                ? 'w-[calc(100vw-2rem)] h-[80vh] fixed bottom-4 left-4' // Mobile: fixed to bottom
                                : 'w-[400px] h-[550px]' // Desktop: medium size
                        }`}
                        style={{
                            backgroundColor: 'var(--bg-modal)',
                            borderColor: 'var(--border-primary)',
                            // Ensures it stays within the fixed position boundary on desktop
                            ...(!isMobileView && { position: 'absolute', bottom: 0, right: 0 })
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        // --- UPDATED ANIMATE PROP ---
                        animate={isMobileView ? "mobileOpen" : "desktopOpen"}
                        exit="exit"
                    >
                        {/* Chat Header */}
                        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                            <h3 className="font-bold main-text flex items-center gap-2">
                                <i className="fa-solid fa-brain" style={{ color: "var(--brand-purple)" }}></i>
                                AI temporary chat
                            </h3>
                            <button onClick={toggleOpen} className="p-1 rounded-full hover-interactive">
                                <X className="w-5 h-5 tertiary-text" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {!messages.length && (
                                <div className="text-center p-6 tertiary-text">
                                    Ask the assistant anything about the post you're viewing: <i className="italic">"{post.title}"</i>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={msg.id || index}>
                                    {msg.isTyping ? (
                                        <div className="flex justify-start items-center">
                                            <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-secondary)]">
                                                <div className="typing-indicator"><span></span><span></span><span></span></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <AIChatMessage sender={msg.sender} text={msg.text} />
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                            <div className="flex items-end gap-2 p-2 rounded-xl border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                                <TextareaAutosize
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isSending ? "Sending..." : "Message the assistant privately..."}
                                    className="flex-grow bg-transparent text-sm resize-none chat-textarea py-1 focus:outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                    maxRows={3}
                                    rows={1}
                                    disabled={isSending}
                                />
                                <button
                                    type="submit"
                                    className="p-2 rounded-full button-primary transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!inputValue.trim() || isSending}
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button (only visible when chat is closed) */}
            {!isOpen && (
                <motion.button
                    id="ai-chat-button"
                    onClick={toggleOpen}
                    className={`p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110`}
                    style={{
                        backgroundColor: 'var(--brand-purple)',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(147, 51, 234, 0.5)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    <MessageSquare className="w-6 h-6" />
                </motion.button>
            )}
            
            <style>{`
                .typing-indicator { display: flex; align-items: center; justify-content: center; height: 24px; }
                .typing-indicator span { height: 6px; width: 6px; background-color: var(--text-tertiary, #6b7280); border-radius: 50%; display: inline-block; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
                .typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
            `}</style>
        </div>
    );
}