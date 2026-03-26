import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const UpgradeModal = ({ onClose, featureName = "Advanced AI Chat", requiredTier = "GOLD" }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <>
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 m-auto z-[110] w-full max-w-md h-fit bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div 
            className="h-32 w-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 100%)` }}
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
              <Crown className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Unlock</h3>
            <p className="text-gray-600 mb-6">
              To continue using <span className="font-semibold text-gray-900">{featureName}</span>, 
              you’ll need a <span className="text-[var(--brand-green)] font-bold">{requiredTier}</span> membership.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-[var(--brand-green)]" />
                <span className="text-left">Get priority access to the latest AI models.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/subscriptions')}
                className="w-full py-6 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "var(--brand-green)" }}
              >
                Join {requiredTier} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <button 
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

export default UpgradeModal