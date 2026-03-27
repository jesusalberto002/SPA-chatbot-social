"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Lock, Tag, Smile, ArrowRight, ArrowLeft, CreditCard, Check, Shield, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import api from "@/api/axios"

import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/authContext"

import LegalModal from "./legalModal"
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from "./legalContent";

// Step configuration
const STEPS = [
  { id: 1, name: "Personal Details", subtitle: "", icon: User, path: "details" },
  { id: 2, name: "Password", subtitle: "", icon: Lock, path: "password" },
  { id: 3, name: "Interests", subtitle: "", icon: Tag, path: "interests" },
  { id: 4, name: "Avatar", subtitle: "", icon: Smile, path: "avatar" },
  { id: 5, name: "Payment", subtitle: "", icon: CreditCard, path: "payment" },
]

// Sample data
const tagsList = [
  "HEALTH",
  "FITNESS",
  "NUTRITION",
  "WELLNESS",
  "MENTAL_HEALTH",
  "LIFESTYLE",
  "HEALTHY_HABITS",
  "SELF_CARE",
  "WORK_LIFE_BALANCE",
  "MINDFULNESS",
  "MEDITATION",
]

// Initialize Stripe outside of the component to avoid re-creation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Internal component to handle the actual Payment Submission
const PaymentForm = ({ onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setIsProcessing(false);
      return;
    }

    let result;

    // Determine flow based on prefix: Setup Intent (Trial) vs Payment Intent (Immediate)
    const isTrial = clientSecret.startsWith("seti_");

    if (isTrial) {
      result = await stripe.confirmSetup({
        elements,
        clientSecret, // Explicitly pass clientSecret for clarity
        confirmParams: {
          // Redirect to a loading and success landing page after trial setup
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });
    } else {
      result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          // Redirect to a loading and success landing page after trial setup
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });
    }

    const { error } = result;

    if (error) {
      // Handle known Stripe errors (e.g., card declined)
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      // The payment/setup has been processed successfully!
      try {
        await onSuccess(); // Finalize registration in your backend
        navigate('/payment-success'); // Redirect to success page
      } catch (err) {
        // Fallback for when payment works but your API fails
        setErrorMessage("Confirmation successful, but account setup failed. Please contact support.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement 
        options={{ 
          // Changed theme to 'stripe' (light) to match your light-mode container
          theme: 'stripe', 
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
          layout: {
            type: 'accordion', // Modern layout that stacks payment methods neatly
            defaultCollapsed: false,
          }
        }} 
      />

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit"
        disabled={!stripe || isProcessing} 
        className="w-full text-white transition-all shadow-md"
        style={{ 
          backgroundColor: isProcessing ? "var(--brand-dark_green)" : "var(--brand-green)" 
        }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Processing...
          </span>
        ) : (
          clientSecret.startsWith("seti_") ? "Start 7-Day Free Trial" : "Complete Subscription"
        )}
      </Button>
    </form>
  );
};

const StepSidebar = ({ currentStep }) => {
  return (
    <div
      className="hidden lg:flex flex-col flex-shrink-0 w-80 p-8 h-screen sticky top-0 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 100%)`,
        color: "white",
      }}
    >
      {/* Decorative blur elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="flex items-center mb-16 relative z-10">
        <img src="/logo-on-dark-bg.svg" alt="App logo" width={150} height={50} className="flex-shrink-0" />
      </div>

      {/* Steps */}
      <div className="flex flex-col flex-grow relative z-10">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep

          return (
            <div key={step.id} className="relative flex items-start">
              {/* Left side: Icon with connecting lines */}
              <div className="flex flex-col items-center mr-4">
                {/* Top connector line */}
                {/* {index > 0 && (
                  <div
                    className="w-0.5 h-6 transition-all duration-500"
                    style={{
                      backgroundColor: isCompleted ? "white" : "rgba(255, 255, 255, 0.2)",
                    }}
                  />
                )} */}

                {/* Step icon/number */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 transition-all duration-500",
                    isCompleted && "bg-white brand-green shadow-lg shadow-white/25",
                    isActive &&
                      "bg-white/20 text-white border-2 border-white backdrop-blur-sm shadow-lg shadow-white/10 scale-110",
                    !isCompleted && !isActive && "bg-white/5 text-white/40 border border-white/20",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <step.icon className="w-5 h-5" />}
                </div>

                {/* Bottom connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className="w-0.5 flex-1 min-h-16 transition-all duration-500"
                    style={{
                      backgroundColor: isCompleted ? "white" : "rgba(255, 255, 255, 0.2)",
                    }}
                  />
                )}
              </div>

              {/* Right side: Text content */}
              <div className="flex-1 pb-8">
                <h3
                  className={cn(
                    "text-base font-semibold mb-1 transition-all duration-300",
                    isActive && "text-white",
                    isCompleted && "text-white/90",
                    !isActive && !isCompleted && "text-white/40",
                  )}
                >
                  {step.name}
                </h3>
                <p
                  className={cn(
                    "text-sm transition-all duration-300",
                    isActive && "text-white/80",
                    isCompleted && "text-white/60",
                    !isActive && !isCompleted && "text-white/30",
                  )}
                >
                  {step.subtitle}
                </p>

                {/* Active step progress bar */}
                {/* {isActive && (
                  <div className="mt-3 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                )} */}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50 relative z-10">
        <p className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          Secure registration process
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} Demo. All rights reserved.</p>
      </div>
    </div>
  )
}

const handleGoogleLogin = () => {
  console.log("[v0] Google login clicked")
}

// Step 1: Personal Details
const StepDetails = ({ formData, handleChange, openLegal, emailTakenMessage, emailCheckStatus }) => (
  <div className="space-y-6">
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
          placeholder="John"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
          placeholder="Doe"
        />
      </div>
    </div>
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        aria-invalid={emailCheckStatus === "taken" || !!emailTakenMessage}
        aria-describedby={emailTakenMessage || emailCheckStatus === "checking" ? "email-hint" : undefined}
        className={cn(
          "w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent",
          emailCheckStatus === "taken" || emailTakenMessage
            ? "border-red-400 focus:ring-red-400/40"
            : "border-gray-300",
        )}
        placeholder="john.doe@example.com"
      />
      <p id="email-hint" className="mt-2 text-sm min-h-[1.25rem]">
        {emailCheckStatus === "checking" && (
          <span className="text-gray-500 flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            Checking if this email is available…
          </span>
        )}
        {emailTakenMessage && emailCheckStatus !== "checking" && (
          <span className="text-red-600">{emailTakenMessage}</span>
        )}
        {emailCheckStatus === "available" && !emailTakenMessage && (
          <span className="text-emerald-600">This email is available.</span>
        )}
      </p>
    </div>

    {/* Divider */}
    <div className="relative my-4">
      <div className="flex items-center">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="px-3 text-xs uppercase text-gray-500">Or continue with</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
    </div>

    {/* Google Login */}
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full h-11 flex items-center justify-center gap-2
                 border border-gray-300 rounded-lg bg-white
                 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Sign in with Google
    </button>

    <p className="text-center text-sm text-gray-600 pt-2">
      Already have an account?{" "}
      <Link
        to="/login"
        className="font-semibold text-[var(--brand-green)] hover:underline focus:outline-none focus:underline"
      >
        Log in
      </Link>
    </p>

    {/* Legal Links */}
    <div className="mt-6 flex items-start gap-3">
      <input
        type="checkbox"
        id="agreeTerms"
        name="hasAgreed"
        required
        checked={formData.hasAgreed || false}
        onChange={(e) => handleChange({ target: { name: 'hasAgreed', value: e.target.checked } })}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--brand-green)] focus:ring-[var(--brand-green)]"
      />
      <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-snug">
        I agree to the{" "}
        <button 
          type="button"
          onClick={() => openLegal('terms')}
          className="inline text-[var(--brand-green)] font-semibold hover:underline transition-all"
        >
          Terms and Conditions
        </button>
        {" "}and acknowledge the{" "}
        <button 
          type="button"
          onClick={() => openLegal('privacy')}
          className="inline text-[var(--brand-green)] font-semibold hover:underline transition-all"
        >
          Privacy Policy
        </button>.
      </label>
    </div>
  </div>
)

// Step 2: Password
const StepPassword = ({ formData, handleChange, confirmPassword, setConfirmPassword, error }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-center">Must be at least 8 characters.</p>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  )
}

// Step 3: Interests
const StepInterests = ({ handleTagClick, selectedTags, tagsList }) => (
  <div className="space-y-6">
    <p className="text-gray-500 text-center">
      Select topics you are interested in. This helps us personalize your experience!
    </p>
    {/* Changed bg-gray-800 to a light bg-gray-50 */}
    <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 scrollbar-hide">
      <div className="flex flex-wrap gap-2 justify-center">
        {tagsList.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedTags.includes(tag)
                ? "text-white shadow-lg" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            )}
            style={selectedTags.includes(tag) ? { 
              backgroundColor: "var(--brand-green)",
              boxShadow: "0 10px 15px -3px rgba(10, 186, 152, 0.3)" 
            } : {}}
          >
            {tag.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  </div>
)

// Step 4: Avatar
const StepAvatar = ({ handleSelectAvatar, selectedAvatarUrl, avatarOptions }) => (
  <div className="space-y-6">
    <p className="text-gray-500 text-center">Choose a profile image for your journey.</p>
    {/* Changed container to light theme */}
    <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 scrollbar-hide">
      <div className="grid grid-cols-4 gap-4">
        {avatarOptions.map((avatar) => (
          <motion.button
            key={avatar.id}
            type="button"
            onClick={() => handleSelectAvatar(avatar.url)}
            className={cn(
              "aspect-square rounded-full overflow-hidden transition-all duration-200",
              selectedAvatarUrl === avatar.url
                ? "ring-4 ring-[var(--brand-green)] ring-offset-4 ring-offset-white scale-105"
                : "hover:scale-105",
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={avatar.url || "/placeholder.svg"}
              alt={`Avatar ${avatar.id}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  </div>
)

// Step 5: Payment
const StepPayment = ({ selectedTier, setSelectedTier, formData, selectedTags, selectedAvatarUrl }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [billingCycle, setBillingCycle] = useState("MONTHLY");

  const { refreshSession } = useAuth()

  const tiers = [
    {
      name: "BRONZE",
      monthlyPrice: "$17.99",
      yearlyPrice: "$179.99",
      monthlyPriceId: "price_1SYiYRGTgb0pTdIDze66nPNJ", 
      yearlyPriceId: "price_1SYjt8GTgb0pTdIDGMqEYdpU", 
      features: ["Unlimited chat", "Advanced AI models", "Priority support"],
      gradient: "from-amber-500 to-yellow-700",
    },
    {
      name: "PLATINUM",
      monthlyPrice: "$29.99",
      yearlyPrice: "$299.99",
      monthlyPriceId: "price_1SYiZ2GTgb0pTdIDX9zqFGGi", 
      yearlyPriceId: "price_1SYjtdGTgb0pTdIDYeZaeUJ6", 
      features: ["All Bronze features", "Premium AI models", "24/7 dedicated support"],
      gradient: "from-slate-400 to-gray-600",
    },
  ];

  const handleStartTrial = async (tier) => {
    setSelectedTier(tier.name);
    setIsInitializing(true);
    const priceIdToUse = billingCycle === "MONTHLY" ? tier.monthlyPriceId : tier.yearlyPriceId;

    try {
      // 1. REGISTER THE USER FIRST
      // This creates the Prisma record and sets the token in localStorage
      const payLoad = {
        ...formData,
        tags: selectedTags,
        profileImageUrl: selectedAvatarUrl,
        subscriptionTier: 'FREE', // Start as FREE, webhook will upgrade them!
        billingCycle: billingCycle,
      }
      
      // We catch the returned token just in case your API interceptor 
      // hasn't attached the new localStorage token to headers yet.
      const regRes = await api.post('/auth/register', payLoad);
      const freshToken = regRes.data.token;
      const freshUser = regRes.data.user;

      // Store the credentials temporarily
      localStorage.setItem('pendingToken', freshToken);
      localStorage.setItem('pendingUser', JSON.stringify(freshUser)); 

      // 2. NOW GENERATE THE STRIPE SESSION
      // Now that the user exists and is logged in, your backend will successfully 
      // read req.user.id and attach it to the Stripe metadata!
      const res = await api.post('/subscriptions/create/', {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          priceId: priceIdToUse, 
          tierName: tier.name,
          billingCycle: billingCycle,
        }, {
          headers: { Authorization: `Bearer ${freshToken}` } 
        });
        
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      console.error("Payment setup or Registration failed:", err);
      // Optional: Add a toast error here
    } finally {
      setIsInitializing(false);
    }
  };

  const handleFinalRegistration = async () => {
    const pendingToken = localStorage.getItem('pendingToken');
    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));

    if (pendingToken && pendingUser) {
        // 1. Manually move the credentials to the official slots so AuthContext finds them
        localStorage.setItem('token', pendingToken);
        localStorage.setItem('user', JSON.stringify(pendingUser));
        
        // 2. Clean up temporary storage
        localStorage.removeItem('pendingToken');
        localStorage.removeItem('pendingUser');

        // 3. Let PaymentForm handle navigation via navigate() — no hard redirect to avoid double load
    }
  };

  if (clientSecret) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500 text-center text-sm">
           You will be charged for the {selectedTier} tier after the trial ends.
        </p>
        <p className="text-gray-500 text-center text-sm">
           You can cancel anytime.
        </p>
        
        {/* Changed to Light theme container */}
        <div className="bg-gray-50 p-6 rounded-xl w-full border border-gray-200">
           {/* Set Stripe theme to 'stripe' or 'flat' for light mode compatibility */}
           <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
             <PaymentForm
                 clientSecret={clientSecret}
                 onSuccess={handleFinalRegistration} 
              />
           </Elements>
        </div>

        <button 
            onClick={() => setClientSecret("")}
            className="text-sm text-gray-400 hover:text-gray-700 w-full text-center mt-4 transition-colors"
        >
          Cancel and go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center px-8">
        {/* Changed bg and border to light mode */}
        <div className="inline-flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setBillingCycle("MONTHLY")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              billingCycle === "MONTHLY" ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-700",
            )}
            style={billingCycle === "MONTHLY" ? { backgroundColor: "var(--brand-green)" } : {}}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("YEARLY")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              billingCycle === "YEARLY" ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-700",
            )}
            style={billingCycle === "YEARLY" ? { backgroundColor: "var(--brand-green)" } : {}}
          >
            Yearly
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Save 20% with yearly billing</p>
      </div>

      <div className="relative w-full overflow-visible"> 
  
        {/* 2. Change 'overflow-y-visible' and add 'py-4' for breathing room */}
        <div className="overflow-x-auto overflow-y-visible scrollbar-hide py-4"> 
          
          {/* 3. Increase padding (pb-8) and ensure 'overflow-visible' */}
          <div className="flex gap-6 pl-8 pr-8 pb-8 pt-8 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 md:px-2 md:pb-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden",
                  "snap-center flex-shrink-0 w-[min(320px,85vw)] md:w-full",
                  selectedTier === tier.name
                    ? "bg-white shadow-xl scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
                style={selectedTier === tier.name ? { borderColor: "var(--brand-green)" } : {}}
              >
                <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${tier.gradient} mb-4`} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

                <p className="text-2xl font-bold mb-4" style={{ color: "var(--brand-green)" }}>
                  {billingCycle === "MONTHLY" ? tier.monthlyPrice : tier.yearlyPrice}
                  <span className="text-sm text-gray-500 font-normal">
                    /{billingCycle === "MONTHLY" ? "mo" : "yr"}
                  </span>
                </p>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 mr-2" style={{ color: "var(--brand-green)" }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full text-white transition-colors"
                  style={{ backgroundColor: "var(--brand-green)" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--brand-dark_green)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--brand-green)")}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartTrial(tier)
                  }}
                  disabled={isInitializing}
                >
                  {isInitializing && selectedTier === tier.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Start 7 day trial"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MultiStepRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    tags: [],
    profileImageUrl: "",
    hasAgreed: false,
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  /** idle | checking | available | taken — mirrors server check for step 1 email */
  const [emailCheckStatus, setEmailCheckStatus] = useState("idle")
  const [emailTakenMessage, setEmailTakenMessage] = useState("")
  const [nextPending, setNextPending] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("")
  const [selectedTier, setSelectedTier] = useState("BRONZE")

  const [tagsList, setTagsList] = useState([]);
  const [avatarOptions, setAvatarOptions] = useState([]);

  const [modalContent, setModalContent] = useState({ open: false, title: "", text: null })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, avatarsRes] = await Promise.all([
          api.get('/tags/'),
          api.get('/avatars/')
        ]);
        setTagsList(tagsRes.data);
        setAvatarOptions(avatarsRes.data);
      } catch (error) {
        console.error("Failed to fetch registration data:", error);
      }
    };
    fetchData();
  }, []);

  // Debounced availability check while the user types on step 1
  useEffect(() => {
    if (currentStep !== 1) return
    const email = formData.email.trim()
    if (!email.includes("@") || email.length < 3) {
      setEmailCheckStatus("idle")
      setEmailTakenMessage("")
      return
    }

    let cancelled = false
    const t = setTimeout(async () => {
      setEmailCheckStatus("checking")
      try {
        const { data } = await api.post("/auth/check-email", { email })
        if (cancelled) return
        if (!data.available) {
          setEmailCheckStatus("taken")
          setEmailTakenMessage(
            "This email is already registered. Sign in instead, or use a different address.",
          )
        } else {
          setEmailCheckStatus("available")
          setEmailTakenMessage("")
        }
      } catch {
        if (!cancelled) {
          setEmailCheckStatus("idle")
          setEmailTakenMessage("")
        }
      }
    }, 600)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [formData.email, currentStep])

  const openLegal = (type) => {
    if (type === 'terms') {
      setModalContent({
        open: true,
        title: "Terms and Conditions",
        text: TERMS_AND_CONDITIONS
      });
    } else {
      setModalContent({
        open: true,
        title: "Privacy Policy",
        text: PRIVACY_POLICY
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName.trim() !== "" &&
          formData.email.includes("@") &&
          formData.hasAgreed === true &&
          emailCheckStatus !== "taken"
        );
      case 2:
        return (
          formData.password.length >= 8 &&
          formData.password === confirmPassword
        );
      case 3:
        return selectedTags.length > 0;
      case 4:
        return selectedAvatarUrl !== "";
      default:
        return true;
    }
  };

  const handleFormChange = (e) => {
    if (e.target.name === "email") {
      setEmailTakenMessage("")
      setEmailCheckStatus("idle")
    }
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTagClick = useCallback((tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const handleSelectAvatar = (url) => {
    setSelectedAvatarUrl(url)
    setFormData({ ...formData, profileImageUrl: url })
  }

  const handleNext = async () => {
    if (currentStep === 2 && formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    setPasswordError("")

    if (currentStep === 1) {
      if (emailCheckStatus === "taken") return
      const email = formData.email.trim()
      setNextPending(true)
      try {
        const { data } = await api.post("/auth/check-email", { email })
        if (!data.available) {
          setEmailCheckStatus("taken")
          setEmailTakenMessage(
            "This email is already registered. Sign in instead, or use a different address.",
          )
          return
        }
        setEmailCheckStatus("available")
        setEmailTakenMessage("")
      } catch (err) {
        setEmailTakenMessage(
          err.response?.data?.error || "Unable to verify this email. Please try again.",
        )
        return
      } finally {
        setNextPending(false)
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", { ...formData, selectedTags, selectedTier })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepDetails 
            formData={formData} 
            handleChange={handleFormChange} 
            openLegal={openLegal}
            emailTakenMessage={emailTakenMessage}
            emailCheckStatus={emailCheckStatus}
          />
        )
      case 2:
        return (
          <StepPassword
            formData={formData}
            handleChange={handleFormChange}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={passwordError}
          />
        )
      case 3:
        return <StepInterests 
          handleTagClick={handleTagClick} 
          selectedTags={selectedTags} 
          tagsList={tagsList}
        />
      case 4:
        return <StepAvatar 
          handleSelectAvatar={handleSelectAvatar} 
          selectedAvatarUrl={selectedAvatarUrl} 
          avatarOptions={avatarOptions}
        />
      case 5:
        return <StepPayment 
          selectedTier={selectedTier} 
          formData={formData} 
          setSelectedTier={setSelectedTier} 
          selectedTags={selectedTags}
          selectedAvatarUrl={selectedAvatarUrl}
        />
      default:
        return null
    }
  }

  return (
    // Changed bg-gray-900 to bg-white for the light theme
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0 h-full">
         <StepSidebar currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto scroll-smooth scrollbar-hide">
        <div className="flex min-h-full items-center justify-center p-0 sm:p-8">
          <div className="w-full max-w-2xl"> 
            <div onSubmit={handleSubmit} className="space-y-8">
              {/* Step Title - Changed text-white to text-gray-900 */}
              <div className="text-center mb-8 p-8 sm:p-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{STEPS[currentStep - 1].name}</h2>
                <p className="text-gray-500">{STEPS[currentStep - 1].subtitle}</p>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="backdrop-blur-sm rounded-2xl" 
                >
                  <div className={currentStep === 5 ? "p-0" : "p-8"}>
                    {renderStepContent()}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 pb-8 p-8 sm:p-0">
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="outline"
                  // Changed colors to match light theme login page button style
                  className="px-6 py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid() || nextPending}
                    className="px-6 py-3 text-white transition-colors"
                    style={{ backgroundColor: "var(--brand-green)" }}
                    onMouseEnter={(e) => {
                      if (isStepValid()) e.target.style.backgroundColor = "var(--brand-dark_green)";
                    }}
                    onMouseLeave={(e) => {
                      if (isStepValid()) e.target.style.backgroundColor = "var(--brand-green)";
                    }}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LegalModal 
        isOpen={modalContent.open} 
        onClose={() => setModalContent({ ...modalContent, open: false })}
        title={modalContent.title}
        content={modalContent.text}
      />
    </div>
  )
}