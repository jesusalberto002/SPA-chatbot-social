"use client"

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { User, Shield, CreditCard, Settings2, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsLoadingSkeleton from "./settingsLoadingSkeleton";
import api from "../../../api/axios"; // Adjust the import path as needed

// --- Import the view components from their new files ---
import AccountOverview from "./accountOverview";
import MembershipDetails from "./membership";
import SecuritySettings from "./security";
import ProfileSettings from "./profileSettings";

// --- Main Settings Page Component ---
export default function AccountSettingsPage() {
  const [activeView, setActiveView] = useState("overview");
  const [userSettingsInfo, setUserSettingsInfo] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshInfo, setRefreshInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { updateUser } = useAuth(); // Get the updateUser function from context

  const menuItems = [
    { id: "overview", label: "Account Overview", icon: User },
    { id: "membership", label: "Membership", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
    { id: "profile", label: "Profile Settings", icon: Settings2 },
  ];

  const ActiveIcon = menuItems.find(item => item.id === activeView)?.icon || User;

  const fetchUserSettings = async () => {
    try {
      const response = await api.get("/user/settings-info"); // Use your api instance
      console.log("Fetched user settings info:", response.data);
      setUserSettingsInfo(response.data);
      updateUser(response.data);
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []); // Runs once on initial load

  const renderContent = () => {
    if (isLoading) {
      return <SettingsLoadingSkeleton />;
    }

    // --- MODIFIED ---
    // Pass both the data AND the function to refresh it
    const props = {
      userSettingsInfo,
      onUpdate: fetchUserSettings, // Pass the fetch function as a prop
    };

    switch (activeView) {
      case "overview":
        return <AccountOverview {...props} />;
      case "membership":
        return <MembershipDetails {...props} />;
      case "security":
        return <SecuritySettings {...props} />;
      case "profile":
        return <ProfileSettings {...props} />;
      default:
        return <AccountOverview {...props} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="h-20"></div>

      <div className="p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* NAVIGATION AREA */}
            <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24 z-20">
              
              {/* Mobile/Tablet Dropdown (Visible below 'lg') */}
              <div className="lg:hidden relative w-full max-w-md mx-auto mb-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ActiveIcon className="w-5 h-5 brand-green" />
                    <span className="font-bold">
                      {menuItems.find(i => i.id === activeView)?.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden z-30"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                    >
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 text-left hover-interactive transition-colors"
                          style={{ color: activeView === item.id ? 'var(--brand-green)' : 'var(--text-secondary)' }}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Sidebar (Visible only at 'lg') */}
              <div 
                className="hidden lg:block backdrop-blur-sm rounded-xl p-4 border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all border"
                        style={isActive ? {
                          background: 'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 100%)',
                          color: '#ffffff',
                          borderColor: 'transparent'
                        } : {
                          color: 'var(--text-secondary)',
                          backgroundColor: 'transparent',
                          borderColor: 'transparent'
                        }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* CONTENT AREA */}
            <main className="flex-1 w-full flex flex-col items-center min-w-0">
              <div className="animate-fade-in w-full max-w-md lg:max-w-2xl">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}