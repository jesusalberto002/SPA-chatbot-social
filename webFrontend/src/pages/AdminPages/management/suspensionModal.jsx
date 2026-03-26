import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const durationOptions = [
    { label: '1 Day', value: '1d' },
    { label: '3 Days', value: '3d' },
    { label: '1 Week', value: '7d' },
    { label: '2 Weeks', value: '14d' },
    { label: '1 Month', value: '1m' },
    { label: 'Indefinite (Ban)', value: 'indefinite' },
];

const SuspensionModal = ({ user, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('1d');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            userId: user.id,
            reason,
            duration,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                className="p-6 shadow-xl max-w-md w-full relative rounded-lg border"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    backgroundColor: "var(--bg-modal)",
                    borderColor: "var(--border-primary)",
                }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 transition-colors tertiary-text hover:main-text">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold mb-4 main-text">Suspend User: {user.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium secondary-text mb-1">Reason for Suspension</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full form-input rounded-md p-2 min-h-[80px]"
                                placeholder="e.g., Violation of community guidelines."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium secondary-text mb-2">Duration</label>
                            <div className="grid grid-cols-2 gap-2">
                                {durationOptions.map((option) => (
                                    <label key={option.value} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${duration === option.value ? 'bg-[var(--brand-purple)] text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--interactive-hover)]'}`}>
                                        <input
                                            type="radio"
                                            name="duration"
                                            value={option.value}
                                            checked={duration === option.value}
                                            onChange={() => setDuration(option.value)}
                                            className="w-4 h-4 mr-2"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg button-secondary">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Confirm Suspension</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SuspensionModal;