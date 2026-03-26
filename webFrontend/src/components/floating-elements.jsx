"use client"

import { useParallax } from "@/hooks/use-scroll-animation"

export function FloatingElements() {
  const offset = useParallax()

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating circles */}
      <div
        className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        style={{
          top: "10%",
          left: "10%",
          transform: `translateY(${offset * 0.1}px)`,
        }}
      />
      <div
        className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        style={{
          top: "60%",
          right: "10%",
          transform: `translateY(${offset * -0.15}px)`,
        }}
      />
      <div
        className="absolute w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"
        style={{
          bottom: "20%",
          left: "20%",
          transform: `translateY(${offset * 0.08}px)`,
        }}
      />
    </div>
  )
}
