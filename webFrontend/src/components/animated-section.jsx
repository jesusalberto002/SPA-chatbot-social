"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

export function AnimatedSection({ children, className, animation = "fadeIn", delay = 0 }) {
  const { ref, isVisible } = useScrollAnimation()

  const animationClasses = {
    fadeIn: "opacity-0 transition-all duration-1000 ease-out",
    slideUp: "opacity-0 translate-y-20 transition-all duration-1000 ease-out",
    slideLeft: "opacity-0 translate-x-20 transition-all duration-1000 ease-out",
    slideRight: "opacity-0 -translate-x-20 transition-all duration-1000 ease-out",
    scaleIn: "opacity-0 scale-95 transition-all duration-1000 ease-out",
  }

  const visibleClasses = {
    fadeIn: "opacity-100",
    slideUp: "opacity-100 translate-y-0",
    slideLeft: "opacity-100 translate-x-0",
    slideRight: "opacity-100 translate-x-0",
    scaleIn: "opacity-100 scale-100",
  }

  return (
    <div
      ref={ref}
      className={cn(animationClasses[animation], isVisible && visibleClasses[animation], className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
