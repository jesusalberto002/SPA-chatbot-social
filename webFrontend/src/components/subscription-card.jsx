import { Card } from "@/components/ui/card";
import { InteractiveButton } from "./interactive-button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/authContext";

export function SubscriptionCard({
  title,
  price,
  description,
  features = [],
  hoverInfo,
  gradient = "bg-gray-800",
  isRecommended = false,
  delay = 0,
  // --- Props received from the parent page ---
  isAuthenticated,
  currentTier,
  billingCycle = "MONTHLY",
  onSubscribe,
  isLoading // Add this to show loading state on the button
}) {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Check if this card represents the user's current plan
  const isCurrentPlan = (title.toUpperCase() === currentTier?.toUpperCase()) && (billingCycle === user?.billingCycle);

  // --- Dynamic Button Logic ---
  let buttonLabel = "Get Started";
  let onButtonClick;

  if (isAuthenticated) {
    // --- LOGIC FOR LOGGED-IN USERS ---
    if (isCurrentPlan) {
      buttonLabel = "Current Plan";
    } else {
      buttonLabel = `Switch to ${title}`;
      // Call the function passed from Parent
      onButtonClick = () => onSubscribe(title.toUpperCase());
    }
  } else {
    // --- LOGIC FOR NEW VISITORS ---
    buttonLabel = "Get Started";
    // Navigate to register page, passing the chosen tier in the state
    onButtonClick = () => navigate('/register-flow', { state: { subscriptionTier: title.toUpperCase(), billingCycle } });
  }

  return (
    <Card
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-300 ease-out relative min-h-[480px] text-white",
        isCurrentPlan
          ? "border-cyan-500 shadow-lg shadow-cyan-500/30" // Highlight the current plan
          : isRecommended
          ? "border-cyan-500 shadow-lg shadow-cyan-500/30"
          : "border-neutral-700 hover:border-neutral-500",
        "hover:scale-105 hover:-translate-y-2",
        isHovered && isRecommended && "shadow-xl shadow-cyan-500/40",
        isHovered && !isRecommended && "shadow-2xl shadow-black/40",
        gradient
      )}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isRecommended && !isCurrentPlan && (
        <div className="absolute top-4 right-4 bg-cyan-400 text-neutral-900 text-xs font-bold px-3 py-1 rounded-full z-20">
          Recommended
        </div>
      )}

      <div className="flex flex-col p-6 sm:p-8 flex-grow relative z-10">
        <div className="mb-6 text-left">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          <div className="flex items-baseline mb-3">
            <p className="text-4xl font-extrabold">{price.split('/')[0]}</p>
            {price.includes('/') && <p className="text-sm text-neutral-400 ml-1">/{price.split('/')[1]}</p>}
          </div>
          <p className="text-sm text-neutral-300 min-h-[2.5rem]">{description}</p>
        </div>

        <ul className="space-y-3 mb-8 flex-grow text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-cyan-400 mr-2.5 shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-200">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <InteractiveButton
            onClick={onButtonClick}
            disabled={isCurrentPlan || isLoading} // Disable if processing
            className={cn(
              "w-full font-medium py-3 rounded-md text-base transition-colors duration-200",
              isCurrentPlan
                ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                : isRecommended
                ? "bg-cyan-400 text-neutral-900 hover:bg-cyan-300"
                : "bg-white text-neutral-900 hover:bg-neutral-200"
            )}
          >
            {isLoading ? "Processing..." : buttonLabel}
          </InteractiveButton>
        </div>
      </div>

      {hoverInfo && (
        <div
          className={cn(
            "absolute inset-0 bg-black/80 backdrop-blur-sm p-6 transition-opacity duration-300 ease-out flex flex-col justify-center items-center text-center z-30",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {typeof hoverInfo === 'string' ? (
            <p className="text-neutral-200">{hoverInfo}</p>
          ) : (
            hoverInfo.map((info, index) => (
              <p key={index} className="text-neutral-200 mb-2 last:mb-0">{info}</p>
            ))
          )}
        </div>
      )}
    </Card>
  );
}