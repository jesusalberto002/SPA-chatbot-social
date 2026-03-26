"use client"

import { useState } from "react"
import { Users, Flag } from "lucide-react"

// Import the components from their new files
import ManagementSelector from "./selectionMenu"
import UsersManagement from "./usersManagement"
import ReportsManagement from "./reportsManagement"

export default function ManagementPage() {
  const [activeView, setActiveView] = useState("users")

  const menuItems = [
    { id: "users", label: "Users Management", icon: Users },
    { id: "reports", label: "Reports Management", icon: Flag },
  ]

  // This function determines which management component to show
  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UsersManagement />
      case "reports":
        return <ReportsManagement />
      default:
        return <UsersManagement />
    }
  }

  return (
    <div className="main-container min-h-screen">
      {/* Spacer for a fixed TopBar */}
      <div className="h-20"></div>

      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <main className="flex-1 min-w-0">
            <div className="text-left">
              <ManagementSelector menuItems={menuItems} activeView={activeView} setActiveView={setActiveView} />
            </div>
            <div className="animate-fade-in">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
