import { motion } from 'framer-motion';
import { User, X } from 'lucide-react';

export default function ReporterListModal({ reports, onClose }) {
    return (
        <motion.div
            className="modal p-0 shadow-2xl w-full max-w-lg rounded-lg flex flex-col h-[60vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <h3 className="text-lg font-semibold main-text">Reporters ({reports.length})</h3>
                <button onClick={onClose} className="p-1 rounded-full hover-interactive"><X className="w-5 h-5 tertiary-text" /></button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="divide-y" style={{ divideColor: "var(--border-primary)" }}>
                    {reports.map(report => (
                        <div key={report.id} className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 tertiary-text"/>
                                <span className="text-sm main-text">{report.reporter.email}</span>
                            </div>
                            <span className="text-sm font-medium secondary-text">{report.reason}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}