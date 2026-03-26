"use client"

import { useAuth } from "../../../context/authContext";
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ChangePlanModal from "./changePlanModal";
import { useNavigate } from "react-router-dom";

export default function MembershipDetails({ userSettingsInfo }) {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  
  // Use data from API, or defaults if loading
  const nextPaymentDate = userSettingsInfo?.stripeInfo.nextPaymentDate || "N/A";
  const paymentMethod = userSettingsInfo?.stripeInfo.paymentMethod || "No card linked";
  const currentTier = userSettingsInfo?.stripeInfo.subscriptionTier || "FREE";

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("MembershipDetails received userSettingsInfo:", userSettingsInfo);
  }, []);

  const handleUpdatePayment = async () => {
    setIsPortalLoading(true)
    try {
      // Call backend to generate Stripe Portal Link
      const res = await api.post('/subscriptions/portal', {
        returnUrl: window.location.href // Come back to this page
      })
      // Redirect user to Stripe
      window.location.href = res.data.url
    } catch (error) {
      console.error("Failed to load portal", error)
      setIsPortalLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Membership & Billing
        </h2>
      </div>

      <div className="grid gap-6">
        {/* Current Plan Card */}
        <div 
          className="backdrop-blur-sm rounded-lg p-8"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Current Plan
            </h3>
            <span className="px-4 py-2 text-sm font-bold capitalize text-white rounded-full"
              style={{ 
                color: 'var(--text-primary)',
                backgroundColor: `var(--bg-tertiary)` 
              }}
            >
              {/* Display Dynamic Tier */}
              {currentTier}
            </span>
          </div>
          <div className="space-y-4">
            {/* <div 
              className="flex justify-between items-center py-3 border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Next Payment</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                 {nextPaymentDate}
              </span>
            </div> */}
            <div 
              className="flex justify-between items-center py-3 border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                 {/* Display Dynamic Card Info */}
                 {paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => {navigate("/subscriptions")}}
              className="px-4 py-2 rounded-full transition-colors font-sm"
              style={{ backgroundColor: 'var(--brand-green)', color: 'var(--text-inverse)' }}
            >
              Change Plan
            </button>

            <button 
              onClick={handleUpdatePayment} // Call Portal
              disabled={isPortalLoading}
              className="px-4 py-2 border rounded-full transition-colors font-medium disabled:opacity-50"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              {isPortalLoading ? "Loading..." : "Update Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}