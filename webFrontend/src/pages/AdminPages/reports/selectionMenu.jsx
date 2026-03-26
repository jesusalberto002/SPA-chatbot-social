"use client"

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ReportSelector({ menuItems, activeView, setActiveView }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const activeItem = menuItems.find(item => item.id === activeView);

  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left mb-6" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-full rounded-md border shadow-sm px-4 py-3 text-base font-medium focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--interactive-focus)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {activeItem?.label || 'Select a Report'}
          <ChevronDown className="-mr-1 ml-3 h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg border z-50"
            style={{
                backgroundColor: 'var(--bg-modal)',
                borderColor: 'var(--border-primary)'
            }}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {menuItems.map((item) => {
                const isActive = activeView === item.id;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveView(item.id);
                            setIsOpen(false);
                        }}
                        className="group flex items-center w-full px-4 py-3 text-sm transition-colors"
                        role="menuitem"
                        style={{
                            backgroundColor: isActive ? 'var(--brand-purple, rgba(139, 92, 246, 0.5))' : 'transparent',
                            color: isActive ? 'var(--text-primary-on-brand, #ffffff)' : 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'var(--interactive-hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                        }}
                    >
                        <item.icon 
                            className="mr-3 h-5 w-5" 
                            style={{ 
                                // Inherit color on active/hover, otherwise use tertiary color
                                color: isActive ? 'currentColor' : 'var(--text-tertiary)' 
                            }}
                        />
                        {item.label}
                    </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};