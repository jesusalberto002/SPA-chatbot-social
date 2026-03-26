"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/api/axios"
import toastService from "@/services/toastService"
import { useAuth } from "@/context/authContext"

export default function ChangePlanModal({ isOpen, onClose, currentTier }) {
  const [selectedTier, setSelectedTier] = useState(currentTier || "BRONZE")
  const [billingCycle, setBillingCycle] = useState("MONTHLY")
  const [isLoading, setIsLoading] = useState(false)
  const { updateUser } = useAuth() // Assuming you have this to update local user state

  const tiers = [
    { name: "BRONZE", monthly: "$17.99", yearly: "$179.99", features: ["Unlimited chat", "Advanced AI"] },
    { name: "PLATINUM", monthly: "$29.99", yearly: "$299.99", features: ["All Bronze features", "Premium AI models"] },
  ]

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const res = await api.post('/subscriptions/change/', {
        tierName: selectedTier,
        billingCycle: billingCycle
      })
      
      // Update local context
      if (res.data.token) localStorage.setItem('token', res.data.token)
      if (res.data.user) updateUser(res.data.user)

      toastService.success("Plan updated successfully!")
      onClose()
    } catch (error) {
      toastService.error("Failed to change plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center my-4">
          <div className="inline-flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            {['MONTHLY', 'YEARLY'].map(cycle => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  billingCycle === cycle ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {cycle.charAt(0) + cycle.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              onClick={() => setSelectedTier(tier.name)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                selectedTier === tier.name ? "border-purple-600 bg-purple-600/10" : "border-gray-700 bg-gray-800/50"
              )}
            >
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="text-xl font-bold text-purple-400 my-2">
                {billingCycle === "MONTHLY" ? tier.monthly : tier.yearly}
                <span className="text-xs text-gray-400">/{billingCycle === "MONTHLY" ? "mo" : "yr"}</span>
              </p>
              <ul className="text-xs space-y-1 text-gray-300">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex gap-2"><Check className="w-3 h-3 text-purple-400"/> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Button onClick={handleConfirm} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Change"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}