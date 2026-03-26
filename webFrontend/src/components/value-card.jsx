"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState } from "react"


export function ValueCard({ title, image, gradient, textColor, delay = 0, hoverText }) {
  // 'gradient' and 'textColor' props are no longer used by this updated component,
  // as the image covers the card and text is now white for readability.
  
  return (
    <Card
      className={cn(
        "rounded-3xl border-0 h-80 cursor-pointer group relative overflow-hidden", // Key changes: removed padding, flex. Added overflow-hidden
        "transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2",
        "hover:shadow-2xl hover:shadow-black/20",
        // 'gradient' prop is no longer used here
      )}
    >
      {/* Background Image */}
      <img
        src={image || "/placeholder.svg"}
        alt={`${title} illustration`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Container for original content (Title) */}
      <div className={cn(
        "relative z-10 h-full flex flex-col justify-end p-8", // Aligns title to bottom, adds padding
        "bg-gradient-to-t from-black/70 to-transparent", // Adds dark gradient for text readability
        "transition-opacity duration-300 group-hover:opacity-0" // Fades out on hover
      )}>
        {/* The old centered image div is removed */}
        <h3
          className={cn(
            "text-2xl font-bold transition-all duration-300",
            "group-hover:scale-105",
            "text-white", // Forcing white text for readability on the image/gradient
            // The 'textColor' prop is no longer used
          )}
        >
          {title}
        </h3>
      </div>

      {/* Hover Text Overlay */}
      <div className={cn(
        "absolute inset-0 p-6 flex items-center justify-center text-center z-20", // z-20 to be on top of title
        "bg-black/70 backdrop-blur-sm rounded-3xl", // Kept rounded-3xl
        "opacity-0 group-hover:opacity-100", // Fades in on hover
        "transition-all duration-300 ease-in-out"
      )}>
        <p className="text-white text-base font-medium">{hoverText}</p>
      </div>
    </Card>
  )
}