"use client"

import { Card } from "@/components/ui/card"
import { InteractiveButton } from "./interactive-button"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ProductCard({ title, image, gradient, imageGradient, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "w-full rounded-3xl overflow-hidden border-0 transition-all duration-500 ease-out",
        "hover:scale-105 hover:-translate-y-4 hover:shadow-2xl hover:shadow-black/30",
        gradient,
      )}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* FIX 1: Removed flex/center classes. 
        This div is now just a positioned container. 
      */}
      <div className={cn(
        "h-64 relative overflow-hidden", 
        imageGradient
      )}>
        <div
          className={cn(
            "absolute inset-0 bg-black/20 transition-opacity duration-300 z-10", // Added z-10
            isHovered ? "opacity-0" : "opacity-100",
          )}
        />
        {/* FIX 1: Image is now absolute, w-full, h-full, and object-cover 
          to fill the entire container.
        */}
        <img
          src={image || "https://placehold.co/300x200/4a4a4a/ffffff?text=Product"}
          alt={`${title} tier`}
          // Removed width and height props, as className handles it
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500", // Fills parent
            isHovered ? "scale-110 opacity-100" : "opacity-80"
          )}
        />
      </div>
      <div className="p-8 text-center">
        <h3 className={cn("text-4xl font-bold text-white mb-6 transition-all duration-300", isHovered && "scale-105")}>
          {title}
        </h3>
      </div>
    </Card>
  )
}