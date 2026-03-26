import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

const MemberOnlyTooltip = ({ label, isVisible, children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isVisible) {
        setMousePos({ x: e.clientX + 15, y: e.clientY + 15 });
      }
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [isVisible]);

  return (
    <div className="relative w-full">
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePos.x,
              y: mousePos.y 
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
            className="fixed top-0 left-0 z-[1000] pointer-events-none w-52 overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-md shadow-2xl"
            style={{ borderColor: "var(--border-primary)" }}
          >
            {/* Top Gradient Banner with Crown */}
            <div 
              className="h-8 w-full flex items-center justify-between px-3"
              style={{ background: `linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 100%)` }}
            >
              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Premium</span>
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[var(--brand-green)] uppercase tracking-wider">
                Members Only
              </span>
              <p className="text-[11px] leading-tight text-gray-600">
                The <span className="text-gray-900 font-bold">{label}</span> feature is available for <span className="font-bold text-gray-900 underline decoration-[var(--brand-green)]">Bronze</span> members.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberOnlyTooltip;