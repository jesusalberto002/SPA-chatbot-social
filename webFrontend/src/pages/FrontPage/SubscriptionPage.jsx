import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import api from "@/api/axios";
import { Navigation } from "@/components/navigation";
import { SubscriptionCard } from "@/components/subscription-card";
import { FloatingElements } from "@/components/floating-elements";
import { AnimatedSection } from "@/components/animated-section";
import toastService from "@/services/toastService"; // Assuming you have a toast service

export default function SubscriptionPage() {
    // 1. ADD refreshUser here so we can poll the backend
    const { user, isAuthenticated: initialIsAuthenticated, logout, refreshUser } = useAuth();
    
    const [isExistingUser, setIsExistingUser] = useState(initialIsAuthenticated);
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('MONTHLY');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // 2. State to track the tier we are waiting for the webhook to apply
    const [targetTier, setTargetTier] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('returnedFromPortal') === 'true') {
            // Clean the URL immediately so it looks nice
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toastService.info("Syncing your latest billing status...");

            // Poll the backend to catch the webhook update
            let attempts = 0;
            const maxAttempts = 5; // Poll for about 10 seconds maximum

            const interval = setInterval(async () => {
                attempts++;
                
                // This forces the AuthContext to fetch the freshest Prisma data
                await refreshUser(); 
                
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                }
            }, 2000);

            // Cleanup interval if the user navigates away
            return () => clearInterval(interval);
        }
    }, [refreshUser]);

    useEffect(() => {
        const verifyUserAndFetchLatestInfo = async () => {
            if (initialIsAuthenticated) {
                try {
                    const response = await api.get('/auth/authenticate');
                    setIsExistingUser(true);
                } catch (error) {
                    logout();
                    setIsExistingUser(false);
                }
            } else {
                setIsExistingUser(false);
            }
            setIsLoading(false);
        };

        verifyUserAndFetchLatestInfo();
    }, [initialIsAuthenticated, logout]);

    // --- NEW: Webhook Polling Effect ---
    // This watches for the user object to update after the webhook fires
    useEffect(() => {
        let interval;
        
        if (targetTier) {
            let attempts = 0;
            const maxAttempts = 10; // Try for 20 seconds

            interval = setInterval(async () => {
                attempts++;
                await refreshUser(); // Ask backend for fresh data

                if (user?.subscriptionTier === targetTier) {
                    clearInterval(interval);
                    setTargetTier(null);
                    setIsProcessing(false);
                    toastService.success(`Successfully upgraded to ${targetTier} plan!`);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setTargetTier(null);
                    setIsProcessing(false);
                    toastService.error("Update taking longer than expected. Please refresh in a moment.");
                }
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [targetTier, user?.subscriptionTier, refreshUser]);

    const tiers = [
        {
            title: "BRONZE",
            monthlyPrice: "$13.99/month",
            yearlyPrice: "$139.99/year",
            description: "Ideal for growing users.",
            features: ["Unlimited chat interactions", "Advanced AI models", "Priority support"],
            gradient: "bg-gradient-to-br from-amber-500 to-yellow-700",
            isRecommended: true,
        },
        {
            title: "PLATINUM",
            monthlyPrice: "$23.99/month",
            yearlyPrice: "$239.99/year",
            description: "For power users and teams.",
            features: ["All Bronze features", "Access to premium AI models", "24/7 dedicated support"],
            gradient: "bg-gradient-to-br from-slate-400 to-gray-600",
        }
    ];

    // --- Handle Change Subscription ---
    const handleChangePlan = async (tierName) => {
        if (!isExistingUser) {
            toastService.info("Please log in to subscribe.");
            return;
        }
        
        if (user?.subscriptionTier === tierName && user?.billingCycle === billingCycle) {
            toastService.info(`You are already on the ${tierName} ${billingCycle} plan.`);
            return; 
        }

        setIsProcessing(true);
        try {
            const response = await api.post('/subscriptions/change', {
                tierName: tierName,
                billingCycle: billingCycle
            });

            // SCENARIO 2: FREE user -> Redirect to Stripe Checkout
            if (response.data.url) {
                window.location.href = response.data.url;
                return; // Stop execution, the page is changing
            }

            // SCENARIO 3: Existing user upgrading -> Trigger polling
            if (response.data.requiresPolling) {
                toastService.info("Processing your payment...");
                setTargetTier(tierName); // This activates the polling useEffect above
            }
            
        } catch (error) {
            console.error("Change plan failed:", error);
            setIsProcessing(false);
            toastService.error(error.response?.data?.error || "Failed to change plan.");
        }
    };

    const handleCancelSubscription = async () => {
        if (!isExistingUser || user?.subscriptionTier === 'FREE') return;

        if (!window.confirm("You are about to be redirected to the secure portal to manage or cancel your subscription. Continue?")) {
            return;
        }

        setIsProcessing(true);
        try {
            // --- NEW: Attach a tracking flag to the return URL ---
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('returnedFromPortal', 'true');

            const res = await api.post('/subscriptions/portal', {
                returnUrl: currentUrl.toString() // Send the flagged URL to Stripe
            });
            window.location.href = res.data.url;
        } catch (error) {
            console.error("Failed to load Stripe Portal:", error);
            toastService.error("Failed to load management portal. Please try again.");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading Plans...</div>;
    }

    return (
        <div className="relative min-h-screen bg-gray-900 text-white">
            <Navigation isFrontPage={false} />
            <FloatingElements />
            <AnimatedSection className="py-20 px-4 md:px-8 lg:px-16">
                <h1 className="text-5xl font-bold mb-4 text-center">Choose Your Plan</h1>
                
                {isExistingUser && (
                    <p className="text-gray-400 mb-10 text-center">
                        Current Plan: <span className="text-cyan-400 font-semibold uppercase">{user.subscriptionTier || 'FREE'}</span>
                    </p>
                )}

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center my-10">
                    <div className="relative flex w-64 p-1 bg-neutral-800 rounded-full">
                        <div
                            className="absolute top-1 bottom-1 w-1/2 bg-purple-600 rounded-full transition-transform duration-300 ease-out"
                            style={{ transform: billingCycle === 'YEARLY' ? 'translateX(100%)' : 'translateX(0)' }}
                        />
                        <button onClick={() => setBillingCycle('MONTHLY')} className="relative z-10 w-1/2 py-2 text-sm font-semibold text-center text-white rounded-full">Monthly</button>
                        <button onClick={() => setBillingCycle('YEARLY')} className="relative z-10 w-1/2 py-2 text-sm font-semibold text-center text-white rounded-full">Yearly</button>
                    </div>
                </div>

                {/* Subscription Cards */}
                <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier, index) => (
                        <div key={tier.title} className="w-full max-w-md flex-shrink-0">
                            <SubscriptionCard
                                {...tier}
                                price={billingCycle === 'MONTHLY' ? tier.monthlyPrice : tier.yearlyPrice}
                                billingCycle={billingCycle}
                                isAuthenticated={isExistingUser}
                                currentTier={user?.subscriptionTier}
                                delay={index * 100}
                                onSubscribe={() => handleChangePlan(tier.title)}
                                isLoading={isProcessing || targetTier === tier.title}
                            />
                        </div>
                    ))}
                </div>

                {/* Cancel Subscription Button */}
                {isExistingUser && user?.subscriptionTier !== 'FREE' && (
                    <div className="mt-16 text-center border-t border-gray-800 pt-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4 text-gray-300">Manage Subscription</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Need to take a break? You can cancel your subscription and view billing details on our secure portal.
                        </p>
                        <button
                            onClick={handleCancelSubscription} 
                            disabled={isProcessing}
                            className="px-6 py-2 text-red-400 border border-red-900/50 bg-red-950/20 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                            {isProcessing ? "Redirecting..." : "Manage or Cancel Subscription"}
                        </button>
                    </div>
                )}
            </AnimatedSection>
        </div>
    );
}