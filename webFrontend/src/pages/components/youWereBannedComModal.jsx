import { motion } from "framer-motion";
import { Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

const YouWereBannedComModal = ({ suspensionDetails, onGoBackToHome }) => {
    const navigate = useNavigate();

    const handleReturnHome = () => {
        navigate('/home');
    };

    if (!suspensionDetails) return null;

    const isBan = suspensionDetails.status === 'BANNED';
    const endDate = suspensionDetails.endDate ? new Date(suspensionDetails.endDate).toLocaleString() : 'Not applicable';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                className="p-8 shadow-2xl max-w-lg w-full text-center rounded-2xl border flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                    backgroundColor: "var(--bg-modal)",
                    borderColor: "var(--border-primary)",
                }}
            >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Ban className="w-8 h-8 text-red-500" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3 main-text">
                    Community Access Restricted
                </h2>
                
                <p className="secondary-text mb-6">
                    {isBan 
                        ? "Your account has been banned from accessing the community indefinitely due to a violation of our guidelines." 
                        : "Your account has been temporarily suspended from accessing the community."
                    }
                </p>

                <div className="w-full text-left bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-primary)] mb-8">
                    <p className="text-sm font-semibold secondary-text mb-2">Reason for action:</p>
                    <p className="main-text italic">"{suspensionDetails.reason || 'No reason provided.'}"</p>
                    {!isBan && (
                         <p className="text-sm tertiary-text mt-3">Suspension ends: {endDate}</p>
                    )}
                </div>

                <button 
                    onClick={onGoBackToHome} 
                    className="w-full max-w-xs px-4 py-3 rounded-lg button-primary font-semibold text-base"
                >
                    Return to Homepage
                </button>
            </motion.div>
        </div>
    );
};

export default YouWereBannedComModal;