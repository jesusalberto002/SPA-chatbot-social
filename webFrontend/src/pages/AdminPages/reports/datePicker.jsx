"use client"

import { useState } from "react";
import { motion } from "framer-motion";

export default function DatePickerModal({ onApply, onCancel, initialRange }) {
    const [startDate, setStartDate] = useState(initialRange.startDate || '');
    const [endDate, setEndDate] = useState(initialRange.endDate || '');

    const handleApply = () => {
        // Ensure both dates are selected before applying
        if (startDate && endDate) {
            onApply({ startDate, endDate });
        }
    };

    return (
        <motion.div
            // 1. Replaced hardcoded styles with the .modal semantic class
            className="modal p-6 shadow-2xl w-full max-w-sm rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {/* 2. Text now uses semantic classes */}
            <h3 className="text-lg font-semibold main-text mb-4">Select Custom Date Range</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium secondary-text mb-1">Start Date</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        // 3. Input now uses the .form-input semantic class
                        className="w-full form-input rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium secondary-text mb-1">End Date</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        // 4. Input now uses the .form-input semantic class
                        className="w-full form-input rounded-md p-2"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                {/* 5. Buttons now use the semantic button classes */}
                <button onClick={onCancel} className="px-4 py-2 rounded-lg button-secondary transition-colors">Cancel</button>
                <button onClick={handleApply} className="px-4 py-2 rounded-lg button-primary transition-colors font-semibold">Apply</button>
            </div>
        </motion.div>
    );
};