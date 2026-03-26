import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ImageModal({ imageUrl, onClose }) {
    return (
        // The modal itself is just the image, with a close button on top
        <motion.div
            className="relative w-full h-full max-w-4xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <img 
                src={imageUrl} 
                alt="Reported content"
                className="w-full h-full object-contain rounded-lg"
            />
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
                title="Close image"
            >
                <X className="w-6 h-6" />
            </button>
        </motion.div>
    );
}