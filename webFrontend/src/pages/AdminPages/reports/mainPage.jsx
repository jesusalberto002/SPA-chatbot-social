"use client"

import { useState } from "react";
import { User, CreditCard } from "lucide-react";

// Import the components from their new files
import ReportSelector from './selectionMenu';
import UsersReports from './usersReports';
import SubscriptionsReports from "./subscriptionsReports";

export default function ReportsPage() {
  const [activeView, setActiveView] = useState("users");

  const menuItems = [
    { id: "users", label: "Users Reports", icon: User },
    { id: "subscriptions", label: "Subscriptions Reports", icon: CreditCard },
  ];

  // This function determines which report component to show
  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UsersReports />;
      case "subscriptions":
        return <SubscriptionsReports />;
      default:
        return <UsersReports />;
    }
  };

  return (
    // 1. Replaced "bg-gray-950" with "main-container" to use theme variables.
    <div className="main-container min-h-screen">
      {/* Spacer for a fixed TopBar if you have one */}
      <div className="h-20"></div>

      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <main className="flex-1 min-w-0">
            <div className="text-left">
              <ReportSelector
                menuItems={menuItems}
                activeView={activeView}
                setActiveView={setActiveView}
              />
            </div>
            <div className="animate-fade-in">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}