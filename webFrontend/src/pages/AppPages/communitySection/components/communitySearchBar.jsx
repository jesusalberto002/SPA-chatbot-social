import React, { useState, useEffect, useRef } from "react";
import { Search, Users, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import api from '../../../../api/axios';

export default function CommunitySearchBar({ onCommunityClick }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }
        setIsSearching(true);
        setIsDropdownOpen(true);
        const debounceTimer = setTimeout(async () => {
            try {
                const response = await api.get(`/community/search?term=${searchTerm}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Failed to search communities:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsExpanded(false);
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);


    const handleResultClick = (communityId) => {
        onCommunityClick(communityId);
        setSearchTerm('');
        setIsDropdownOpen(false);
        setIsExpanded(false);
    };

    return (
        // --- THIS IS THE CHANGE ---
        // Removed 'justify-end' to align the component to the left
        <div className="relative flex items-center" ref={searchRef}>
            <motion.div
                className="relative flex items-center h-10"
                initial={false}
                animate={{ width: isExpanded ? '100%' : 40 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
                <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute left-0 top-0 flex items-center justify-center w-10 h-10"
                >
                    <Search className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => searchTerm && setIsDropdownOpen(true)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.15 }}
                            className="w-full h-full pl-12 pr-4 bg-transparent border-b-2 text-sm focus:outline-none"
                            style={{
                                borderColor: 'var(--border-primary)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {createPortal(
                <AnimatePresence>
                    {isDropdownOpen && (
                         <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute rounded-lg border shadow-lg"
                            style={{
                                top: searchRef.current?.getBoundingClientRect().bottom + window.scrollY + 8,
                                left: searchRef.current?.getBoundingClientRect().left + window.scrollX,
                                width: Math.max(searchRef.current?.getBoundingClientRect().width || 0, 320),
                                zIndex: 10000,
                                backgroundColor: 'var(--bg-modal)',
                                borderColor: 'var(--border-primary)',
                                maxHeight: '400px',
                                overflowY: 'auto',
                            }}
                        >
                            {isSearching && <div className="p-4 text-sm text-center tertiary-text">Searching...</div>}
                            {!isSearching && searchResults.length === 0 && searchTerm && (
                                <div className="p-4 text-sm text-center tertiary-text">No communities found.</div>
                            )}
                            {!isSearching && searchResults.length > 0 && (
                                <ul>
                                    {searchResults.map(community => (
                                        <li key={community.id}>
                                            <button onClick={() => handleResultClick(community.id)} className="w-full text-left flex items-center gap-3 p-3 hover-interactive transition-colors">
                                                 <img
                                                    src={community.imageUrl || 'https://placehold.co/100x100/a78bfa/ffffff?text=C'}
                                                    alt={community.name}
                                                    className="w-10 h-10 rounded-md object-cover"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold main-text">{community.name}</p>
                                                    <div className="flex items-center gap-3 text-xs tertiary-text">
                                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.memberCount}</span>
                                                        <span className="flex items-center gap-1"><MessageSquareText className="w-3 h-3" /> {community.postCount}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}