import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../api/axios';
import toastService from '../../../../services/toastService';

const reasons = ["Spam", "Hate Speech", "Harassment", "Misinformation", "Nudity or Sexual Content", "Other"];

export default function ReportModal({ contentId, contentType, onCancel }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toastService.error("Please select a reason for your report.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/community/report', {
                contentId,
                type: contentType,
                reason,
            });
            toastService.success("Report submitted. Thank you for your feedback.");
            onCancel();
        } catch (error) {
            toastService.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="modal p-6 shadow-2xl w-full max-w-md rounded-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <h3 className="text-xl font-semibold main-text mb-4">Report Content</h3>
            <p className="secondary-text mb-6">Please select the reason for reporting this content. Your report is anonymous.</p>
            <div className="space-y-2">
                {reasons.map(r => (
                    <button
                        key={r}
                        onClick={() => setReason(r)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${reason === r ? 'bg-purple-600 text-white' : 'hover:bg-[var(--interactive-hover)]'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={onCancel} className="button-secondary rounded-lg px-4 py-2">Cancel</button>
                <button onClick={handleSubmit} className="button-primary rounded-lg px-4 py-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </motion.div>
    );
}