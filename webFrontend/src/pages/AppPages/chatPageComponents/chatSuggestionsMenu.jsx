import React from 'react';
import { motion } from 'framer-motion';
import { WandSparkles } from 'lucide-react'; // Using a nice icon

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      ease: 'easeOut'
    },
  }),
};

export default function ChatSuggestionsMenu({ suggestions, onSelectSuggestion }) {
  return (
    <motion.div
      // --- FIX: Changed `bottom-full mb-2` to `top-full mt-2` ---
      className="absolute top-full mt-2 w-full rounded-xl overflow-hidden"
      style={{
        zIndex: 1000,
      }}
      // --- FIX: Changed animation direction from `y: 10` to `y: -10` ---
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="p-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold secondary-text px-2 mb-1">
          <WandSparkles className="w-4 h-4" />
          Suggestions
        </h4>
        <div className="flex flex-col gap-1">
          {suggestions.map((text, i) => (
            <motion.button
              key={i}
              className="w-full text-left p-2 rounded-lg text-sm main-text hover-interactive transition-colors"
              // Use onMouseDown to prevent the input's onBlur from firing before the click
              onMouseDown={(e) => {
                e.preventDefault(); 
                onSelectSuggestion(text);
              }}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              {text}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}