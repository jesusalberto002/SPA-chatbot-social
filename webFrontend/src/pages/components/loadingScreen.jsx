import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themeContext";

const FullPageLoader = () => {
  const { theme } = useTheme();

  // Chooses the black logo for the white background
  // or the white logo if the app is in a darker state
  const logoSrc = theme === "light" 
    ? "/black_logo_transparent.png" 
    : "/white_logo_transparent.png";

  return (
    <div className="bg-primary fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        
        {/* Small Spinning Wheel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          className="h-8 w-8 rounded-full border-2 border-gray-100 mb-4"
          style={{
            borderTopColor: "var(--brand-green)",
          }}
        />

        {/* Small Logo */}
        <img
          src={logoSrc}
          alt="Haivens"
          className="h-8 w-auto object-contain opacity-80"
        />
      </div>
    </div>
  );
};

export default FullPageLoader;