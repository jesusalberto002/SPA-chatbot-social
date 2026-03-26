import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Compass, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path if needed
import { cn } from '@/lib/utils'; // Adjust path if needed

const pages = [
  {
    page: 1,
    icon: Heart,
    title: 'Welcome to HAIVENS!',
    content: (
      <p className="text-gray-600 text-center leading-relaxed text-lg">
        We're so excited to have you. Let's take a quick tour to help you get settled in and start your journey to better well-being.
      </p>
    ),
  },
  {
    page: 2,
    icon: Compass,
    title: 'Your First Steps',
    content: (
      <div className="space-y-6 text-left w-full mt-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-[var(--brand-green)] flex items-center justify-center font-bold">1</div>
          <div>
            <h3 className="font-semibold text-gray-900">Explore Communities</h3>
            <p className="text-sm text-gray-500 mt-1">Find groups that match your interests to connect with others and share experiences.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-[var(--brand-green)] flex items-center justify-center font-bold">2</div>
          <div>
            <h3 className="font-semibold text-gray-900">Personalize Your Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Add a profile picture and a bio. A complete profile helps build trust and connection.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-[var(--brand-green)] flex items-center justify-center font-bold">3</div>
          <div>
            <h3 className="font-semibold text-gray-900">Create Your First Post</h3>
            <p className="text-sm text-gray-500 mt-1">Introduce yourself or share what's on your mind. Your voice is a valuable part of our community.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    page: 3,
    icon: Sparkles,
    title: 'A Few Friendly Tips',
    content: (
      <div className="space-y-6 text-left w-full mt-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">Be Kind and Respectful</h3>
          <p className="text-sm text-gray-500">We are all on our own unique paths. Treat everyone's journey with the respect you'd want for your own.</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">Your Journey is Unique</h3>
          <p className="text-sm text-gray-500">There's no right or wrong way to grow. Engage at your own pace and find what works best for you.</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">We're Here to Help</h3>
          <p className="text-sm text-gray-500">If you have questions or need support, don't hesitate to reach out to our moderators and community guides.</p>
        </div>
      </div>
    ),
  },
];

export default function WelcomeAppModal({ onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = pages.length;

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const currentPageData = pages[currentPage - 1];
  const IconComponent = currentPageData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col items-center pt-12 px-8 pb-4 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center mb-6 shadow-inner border border-green-200">
                <IconComponent className="w-8 h-8 text-[var(--brand-green)]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {currentPageData.title}
              </h2>
              {currentPageData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer / Navigation */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {pages.map((p) => (
                <div 
                  key={p.page} 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentPage === p.page 
                      ? "w-6 bg-[var(--brand-green)]" 
                      : "w-2 bg-gray-200"
                  )}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {currentPage > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentPage < totalPages ? (
                <Button 
                  onClick={handleNext}
                  className="text-white rounded-full transition-colors"
                  style={{ backgroundColor: "var(--brand-green)" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--brand-dark_green)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--brand-green)")}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={onClose}
                  className="text-white rounded-full transition-colors shadow-lg shadow-green-500/30"
                  style={{ backgroundColor: "var(--brand-green)" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--brand-dark_green)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--brand-green)")}
                >
                  Get Started!
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}