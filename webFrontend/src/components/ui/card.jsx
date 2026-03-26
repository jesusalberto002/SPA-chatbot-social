import { cn } from "@/lib/utils"
import { forwardRef } from "react"

const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border border-gray-800 bg-gray-900 text-white shadow-sm", className)}
    {...props}
  />
))

Card.displayName = "Card"

export { Card }