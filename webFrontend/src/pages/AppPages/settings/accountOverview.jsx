"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Check, ChevronRight, AlertCircle } from "lucide-react";
import EditInfoModal from "./editInfoModal";
import api from "../../../api/axios";
import { useModal } from "../../../context/modalContext";
import toastService from "@/services/toastService";

// --- FORM COMPONENTS (Defined outside the main component) ---

const NameForm = ({ initialData, onSubmit }) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({ firstName, lastName });
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 secondary-text">First Name</label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full form-input rounded-md p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 secondary-text">Last Name</label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full form-input rounded-md p-2" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2 rounded-md button-primary font-medium">Save Changes</button>
      </div>
    </form>
  );
};

const EmailForm = ({ initialData, onSubmit, type = 'email' }) => {
  const [email, setEmail] = useState(initialData?.email || '');
  const [recoveryEmail, setRecoveryEmail] = useState(initialData?.recoveryEmail || '');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(type === 'recoveryEmail' ? { recoveryEmail } : { email });
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 secondary-text">
          {type === 'recoveryEmail' ? 'Recovery Email Address' : 'Email Address'}
        </label>
        <input
          type="email"
          value={type === 'recoveryEmail' ? recoveryEmail : email}
          onChange={(e) => type === 'recoveryEmail' ? setRecoveryEmail(e.target.value) : setEmail(e.target.value)}
          className="w-full form-input rounded-md p-2"
        />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2 rounded-md button-primary font-medium">Save Changes</button>
      </div>
    </form>
  );
};

// --- MAIN COMPONENT ---

export default function AccountOverview({ userSettingsInfo, onUpdate }) {
  const { showModal, hideModal } = useModal(); // Use the global modal hook
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData, type) => {
    try {
      let response;
      if (type === 'name') {
        response = await api.put('/user/update', { firstName: formData.firstName, lastName: formData.lastName });
        toastService.success("Name updated successfully!");
      } else if (type === 'email') {
        response = await api.put('/user/update-email', { email: formData.email });
        toastService.success("Email updated successfully!");
      } else if (type === 'recoveryEmail') {
        response = await api.put('/user/update-email', { recoveryEmail: formData.recoveryEmail });
        toastService.success("Recovery email updated successfully!");
      }
      
      onUpdate();
    } catch (error) {
      toastService.error("Failed to update settings. Please try again.");
    } finally {
      hideModal(); // Close the modal
    }
  };

  const openModal = (type) => {
    const modalContent = {
      name: {
        title: "Change Your Name",
        form: <NameForm initialData={userSettingsInfo} onSubmit={(data) => handleSubmit(data, 'name')} />
      },
      email: {
        title: "Change Your Email",
        form: <EmailForm initialData={userSettingsInfo} onSubmit={(data) => handleSubmit(data, 'email')} type="email"/>
      },
      recoveryEmail: {
        title: "Change Your Recovery Email",
        form: <EmailForm initialData={userSettingsInfo} onSubmit={(data) => handleSubmit(data, 'recoveryEmail')} type="recoveryEmail"/>
      }
    };

    const content = modalContent[type];
    if (content) {
      showModal(
        <EditInfoModal title={content.title} onClose={hideModal}>
          {content.form}
        </EditInfoModal>
      );
    }
  };

  return (
    <div className="space-y-6 w-full">
    <div className="text-center w-full">
        <h2 className="text-2xl font-bold mb-6 main-text">Account Overview</h2>
      </div>
      <div className="grid gap-4">
        {/* --- Personal Information Card --- */}
        <div className="card-secondary backdrop-blur-sm rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-3 main-text">
              Personal Information
            </h3>
          </div>
          <div className="space-y-1">
            <InfoRow label="Full Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} onClick={() => openModal('name')} />
            <InfoRow label="Email Address" value={user?.email} onClick={() => openModal('email')} isVerified={userSettingsInfo?.isEmailVerified} />
            <InfoRow label="Recovery Email" value={userSettingsInfo?.recoveryEmail || "Not set"} onClick={() => openModal('recoveryEmail')} isVerified={userSettingsInfo?.isRecoveryEmailVerified} />
          </div>
        </div>
        {/* --- Subscription Card --- */}
        <div className="card-secondary backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-3 main-text">
              Current Subscription
            </h3>
            <button onClick={() => navigate('/subscriptions')} className="button-primary px-3 py-1.5 rounded-full text-sm font-medium">
              Change Plan
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span 
              className={`subscription-badge-${user?.subscriptionTier?.toLowerCase() || 'free'} px-3 py-1.5 text-xs font-bold capitalize rounded-full border`}
              style={{ 
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-tertiary)'
              }}
            >
              {user?.subscriptionTier || 'FREE'}
            </span>
            <div className="flex items-center gap-2 status-success">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable InfoRow component
const InfoRow = ({ label, value, onClick, isVerified }) => (
  <button 
    onClick={onClick} 
    className="w-full flex justify-between items-center py-3 border-b text-left transition-colors px-2 -mx-2 rounded-md hover-interactive"
    style={{ borderColor: 'var(--border-primary)' }}
  >
    <div>
      <span className="text-sm secondary-text">{label}</span>
      <p className="text-base font-medium main-text">{value}</p>
    </div>
    <div className="flex items-center gap-4">
      {value && value !== "Not set" && isVerified === false && (
        <div className="flex items-center gap-2 text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Not Verified</span>
        </div>
      )}
      <ChevronRight className="w-5 h-5 tertiary-text"/>
    </div>
  </button>
);