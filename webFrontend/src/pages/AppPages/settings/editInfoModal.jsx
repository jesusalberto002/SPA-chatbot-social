"use client"

import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function EditInfoModal({ onClose, title, children }) {
  return (
    <motion.div
      className="modal p-0 shadow-2xl w-full max-w-md rounded-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()} // Prevents clicks inside from closing the modal
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      style={{ margin: 'auto' }} // Keeps it centered
    >
      {/* Modal Header */}
      <div 
        className="flex items-center justify-between p-6"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <h3 className="text-xl font-bold main-text">
          {title}
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover-interactive"
        >
          <X className="w-6 h-6 tertiary-text" />
        </button>
      </div>

      {/* Modal Content - This is where the form will go */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}