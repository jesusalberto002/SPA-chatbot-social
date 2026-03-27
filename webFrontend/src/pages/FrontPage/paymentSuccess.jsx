import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/authContext';

const PaymentSuccess = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [bootstrapping, setBootstrapping] = useState(true);
    const [isVerifying, setIsVerifying] = useState(true);
    const navigate = useNavigate();

    // 0. Bootstrap: run one auth refresh before any UI decisions (avoids flash of stale "ready" state)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            await refreshUser();
            if (!cancelled) setBootstrapping(false);
        })();
        return () => { cancelled = true; };
    }, []);

    // 1. After bootstrap: poll for payment status only if still on FREE
    useEffect(() => {
        if (bootstrapping) return;
        if (user?.subscriptionTier !== 'FREE') {
            setIsVerifying(false);
            return;
        }

        let attempts = 0;
        const maxAttempts = 10;

        const interval = setInterval(async () => {
            attempts++;
            await refreshUser();
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setIsVerifying(false);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [bootstrapping, user?.subscriptionTier]);

    // 2. Redirect to home when upgraded
    useEffect(() => {
        if (user?.subscriptionTier !== 'FREE') {
            const redirectTimer = setTimeout(() => navigate('/home'), 2000);
            return () => clearTimeout(redirectTimer);
        }
    }, [user?.subscriptionTier, navigate]);

    // RENDER: Spinner until bootstrap, then verifying, then success
    if (bootstrapping) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-green)] mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800">Preparing your account...</h2>
                <p className="text-gray-500 mt-2">Please wait a moment.</p>
            </div>
        );
    }

    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-green)] mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800">Verifying your payment...</h2>
                <p className="text-gray-500 mt-2">Please don't close this page. This will just take a moment.</p>
            </div>
        );
    }

    // RENDER STATE 2: Webhook finished, show success message for 3.5 seconds
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your account is ready!</h1>
            <p className="text-lg text-gray-600 mb-8">
                Your account has been upgraded to the <span className="font-bold text-[var(--brand-green)]">{user?.subscriptionTier}</span> plan.
            </p>
            <p className="text-sm text-gray-400 animate-pulse">
                Redirecting you to the home page...
            </p>
        </div>
    );
};

export default PaymentSuccess;