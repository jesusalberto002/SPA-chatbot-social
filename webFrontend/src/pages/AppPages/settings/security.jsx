"use client"

import { useState } from "react";
import toastService from "@/services/toastService";
import { Shield, ChevronRight, Eye, EyeOff } from "lucide-react";
import EditInfoModal from "./editInfoModal";
import { useModal } from "../../../context/modalContext";
import api from "../../../api/axios";

// --- FORM COMPONENT (Defined outside the main component) ---

const PasswordForm = ({ onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <PasswordInput 
        label="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        showPassword={showCurrent}
        onToggleVisibility={() => setShowCurrent(!showCurrent)}
      />
      <PasswordInput 
        label="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        showPassword={showNew}
        onToggleVisibility={() => setShowNew(!showNew)}
      />
      <PasswordInput 
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        showPassword={showConfirm}
        onToggleVisibility={() => setShowConfirm(!showConfirm)}
      />
      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2 rounded-md button-primary font-medium">
          Update Password
        </button>
      </div>
    </form>
  );
};

const PasswordInput = ({ value, onChange, showPassword, onToggleVisibility, label }) => (
  <div>
    <label className="block text-sm font-medium mb-2 secondary-text">{label}</label>
    <div className="relative">
      <input 
        type={showPassword ? "text" : "password"} 
        value={value} 
        onChange={onChange} 
        className="w-full form-input rounded-md p-2 pr-10"
        required
      />
      <button 
        type="button" 
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 px-3 flex items-center tertiary-text hover:main-text"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);


// --- MAIN SECURITY SETTINGS COMPONENT ---

export default function SecuritySettings({ userSettingsInfo, onUpdate }) {
  const { showModal, hideModal } = useModal(); // Use the global modal hook

  const handleSubmit = async (formData) => {
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toastService.error("New passwords do not match.");
        return;
      }
      
      await api.put('/user/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toastService.success("Password updated successfully!");
      onUpdate(); // Refresh user data
      
    } catch (error) {
      toastService.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      hideModal(); // Close the modal
    }
  };

  const openPasswordModal = () => {
    showModal(
      <EditInfoModal title="Change Your Password" onClose={hideModal}>
        <PasswordForm onSubmit={handleSubmit} />
      </EditInfoModal>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 main-text">Security Settings</h2>
      </div>

      <div className="card-secondary backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-3 main-text">
            Login & Security
          </h3>
        </div>
        <div className="space-y-1">
          <SecurityInfoRow
            label="Password"
            value="••••••••••••"
            onClick={openPasswordModal} // Use the function to open the global modal
            lastUpdated={userSettingsInfo?.updatedPasswordAt}
          />
        </div>
      </div>
    </div>
  );
}

// Reusable clickable row component
const SecurityInfoRow = ({ label, value, onClick, lastUpdated }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <button 
      onClick={onClick} 
      className="w-full flex justify-between items-center py-3 text-left transition-colors px-2 -mx-2 rounded-md hover-interactive"
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      <div>
        <span className="text-sm secondary-text">{label}</span>
        <p className="text-base font-medium main-text">{value}</p>
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-sm tertiary-text">
            Last updated {formatDate(lastUpdated)}
          </span>
        )}
        <ChevronRight className="w-5 h-5 tertiary-text" />
      </div>
    </button>
  );
};