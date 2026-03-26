"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const pricingPlans = [
  {
    id: 1,
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individuals and small teams",
    badge: "7 DAY FREE TRIAL",
    features: [
      "Up to 10 team members",
      "100 GB cloud storage",
      "Basic analytics",
      "Email support",
      "Mobile app access",
    ],
    gradient: "from-purple-500 to-pink-500",
    highlight: false,
  },
  {
    id: 2,
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For growing teams and businesses",
    badge: "7 DAY FREE TRIAL",
    features: [
      "Unlimited team members",
      "1 TB cloud storage",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "API access",
    ],
    gradient: "from-blue-500 to-cyan-500",
    highlight: true,
  },
]

export function PricingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = pricingPlans.length - 1
      if (nextIndex >= pricingPlans.length) nextIndex = 0
      return nextIndex
    })
  }

  const currentPlan = pricingPlans[currentIndex]

  return (
    <div className="relative w-full max-w-lg mx-auto px-4 sm:px-8 md:px-12">
      {/* Carousel Container */}
      <div className="relative h-[500px] sm:h-[520px] flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="absolute w-full max-w-sm"
          >
            <Card
              className={cn(
                "relative overflow-hidden border-2 shadow-xl",
                currentPlan.highlight ? "border-[#6b46c1]" : "border-gray-200",
              )}
            >
              {/* Gradient Header */}
              <div
                className={cn(
                  "relative h-36 bg-gradient-to-br p-6 text-white",
                  `bg-gradient-to-br ${currentPlan.gradient}`,
                )}
              >
                {/* Badge */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-3 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {currentPlan.badge}
                  </Badge>
                </motion.div>

                {/* Plan Name */}
                <motion.h3
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-1.5"
                >
                  {currentPlan.name}
                </motion.h3>

                {/* Price */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-baseline"
                >
                  <span className="text-4xl font-bold">{currentPlan.price}</span>
                  <span className="text-base ml-1.5 opacity-90">{currentPlan.period}</span>
                </motion.div>

                {/* Decorative circles */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 text-sm"
                >
                  {currentPlan.description}
                </motion.p>

                {/* Features List */}
                <ul className="space-y-2.5">
                  {currentPlan.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                  <Button
                    className={cn(
                      "w-full h-11 text-sm font-semibold rounded-lg shadow-lg",
                      currentPlan.highlight
                        ? "bg-[#6b46c1] hover:bg-[#5a3ba8] text-white shadow-[#6b46c1]/30"
                        : "bg-gray-900 hover:bg-gray-800 text-white",
                    )}
                  >
                    Start Free Trial
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        aria-label="Previous plan"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        aria-label="Next plan"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {pricingPlans.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              index === currentIndex ? "w-6 bg-[#6b46c1]" : "bg-gray-300 hover:bg-gray-400",
            )}
            aria-label={`Go to plan ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
