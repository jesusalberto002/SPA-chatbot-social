import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Check } from 'lucide-react';
import { useTherapist } from '@/context/therapistContext';

const TherapistCard = ({ therapist, onSelect, onPlay, isPlaying }) => {
  const { therapist: selectedTherapist } = useTherapist();
  const isSelected = selectedTherapist?.id === therapist.id;

  return (
    <motion.div 
      className={`w-full h-[480px] rounded-[2.5rem] relative overflow-hidden shadow-1xl transition-all duration-300 ${
        isSelected ? 'ring-4 ring-[var(--brand-green)]' : 'ring-0'
      }`}
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Background Image */}
      <img 
        src={therapist.imageUrl} 
        alt={therapist.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Selected Badge Overlay */}
      {isSelected && (
        <div className="absolute top-6 right-6 z-10 bg-[var(--brand-green)] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 stroke-[3px]" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Active</span>
        </div>
      )}

      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all z-0">
          <div className="flex items-end gap-1 h-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-white rounded-full"
                animate={{ height: ["20%", "100%", "20%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">{therapist.name}</h3>
        <p className="text-teal-400 font-bold text-sm mb-3 uppercase tracking-widest">{therapist.specialty}</p>
        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 mb-6">{therapist.bio}</p>

        <div className="flex gap-3">
          <button 
            onClick={() => onPlay(therapist)}
            className="w-10 h-10 rounded-full flex items-center justify-center brand-gradient-bg-tri text-white shadow-lg active:scale-90 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button 
            onClick={() => !isSelected && onSelect(therapist)} 
            disabled={isSelected}
            className={`flex-1 font-black uppercase tracking-widest text-xs rounded-2xl transition-all ${
              isSelected 
                ? "bg-[var(--brand-green)] text-white cursor-default opacity-100" 
                : "bg-white text-black hover:bg-gray-100 active:scale-95"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TherapistCard;