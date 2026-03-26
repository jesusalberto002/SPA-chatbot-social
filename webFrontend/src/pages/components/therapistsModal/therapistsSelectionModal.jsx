import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './therapistsSelectionModal.css';
import api from '@/api/axios';

export default function TherapistsSelectionModal ({ onClose, children }) {

  // const [isLoading, setIsLoading] = useState(true);
  // const [therapists, setTherapists] = useState([]);

  // useEffect(() => {
  //   console.log("TherapistsSelectionModal mounted, fetching therapists...");
  //   try {
  //     const fetchTherapists = async () => {
  //       setIsLoading(true);
  //       console.log("Fetching therapists from API...");
  //       const response = await api.get("/therapists/");
  //       console.log("Fetched therapists:", response.data);
  //       setTherapists(response.data);
  //       setIsLoading(false);
  //     };
  //     fetchTherapists();
  //   } catch (error) {
  //     console.error("Failed to fetch therapists", error);
  //     setIsLoading(false);
  //   }
  // }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 1. Backdrop Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* 2. Modal Content Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: "var(--bg-modal)", border: "transparent" }}
        >
          {/* Header / Close Button */}
          <div className="flex justify-between items-center p-6 pb-0">
            <h2 className="text-2xl font-black tracking-tighter uppercase" style={{ color: "var(--text-primary)" }}>
              Choose Your Therapist
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--interactive-hover)] transition-colors"
            >
              <X className="w-6 h-6" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* This is where the Carousel will live */}
          <div className="p-6 flex flex-col items-center justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
