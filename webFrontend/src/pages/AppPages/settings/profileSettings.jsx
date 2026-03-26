import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Sun, Moon, Laptop, X } from 'lucide-react';
// --- Mock Auth Context Hook (for demonstration) ---
// In your actual app, you would remove this and use your real useAuth hook.
import { useAuth } from '../../../context/authContext'; // Adjust the import path as needed
import { useTheme } from '../../../context/themeContext'; // Adjust the import path as needed
import api from '@/api/axios';

const fetchAvatars = async () => {
  const response = await api.get('/avatars/');
  return response.data;
}

export default function ProfileSettings({ userSettingsInfo, onUpdate }) {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  // State to control the avatar selection modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleToggle = () => {
      console.log("Theme toggle clicked. Current theme:", theme, "Switching to:", theme === 'light' ? 'dark' : 'light');
      toggleTheme();
  };

  // Effect to apply the theme to the document body
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    console.log('Avatar:', userSettingsInfo?.profileImageUrl);
    // You might also want to save the theme preference to localStorage
    // localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAvatarChange = async (newAvatarUrl) => {
    try {
      console.log("Selected new avatar URL:", newAvatarUrl);
      const response = await api.put('/user/update', { profileImageUrl: newAvatarUrl })
      setIsModalOpen(false);
      onUpdate(); // Refresh user settings info after update
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
    // Here you would call your API to save the new URL to the user's profile
    // updateUser({ profilePictureUrl: newAvatarUrl });
  };
  
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Here you would call your API to save the theme preference
    // updateUser({ themePreference: newTheme });
  };

  return (
    <div>
      <div className="mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Profile Settings
          </h2>
        </div>

        <div className="card-secondary backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6 border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span>General Settings</span>
            </h3>
          </div>

          {/* --- Avatar Settings --- */}
          <SettingsRow
            title="Profile Picture"
            description="Click the image to choose a new avatar."
          >
            <button onClick={() => setIsModalOpen(true)} className="rounded-full transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50">
              <img
                src={userSettingsInfo?.profileImageUrl || '/default-avatar.png'}
                alt="Current Profile Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            </button>
          </SettingsRow>

          {/* --- Theme Settings --- */}
          <SettingsRow
            title="Appearance"
            description="Customize the look and feel of the application."
          >
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
              <ThemeButton icon={Sun} label="Light" currentTheme={theme} onClick={() => handleToggle('light')} />
              <ThemeButton icon={Moon} label="Dark" currentTheme={theme} onClick={() => handleToggle('dark')} />
            </div>
          </SettingsRow>
        </div>
      </div>
      
      <AvatarSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAvatarChange}
      />
    </div>
  );
}

// Helper component for a consistent settings row layout
const SettingsRow = ({ title, description, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b"
    style={{ borderColor: 'var(--border-primary)' }}
  >
    <div className="mb-4 sm:mb-0">
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

// Helper component for the theme toggle buttons
const ThemeButton = ({ icon: Icon, label, currentTheme, onClick }) => {
  const isActive = currentTheme === label.toLowerCase();
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-full px-2 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-green-600 text-white shadow' // Active state: Purple background, white icon
          : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10' // Inactive state: Transparent background, gray icon, subtle hover
      }`}
      aria-label={`Set theme to ${label}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};


// The Modal component for selecting an avatar
const AvatarSelectionModal = ({ isOpen, onClose, onSelect, onSubmit }) => {
  const { 
    data: availableAvatars, 
    isLoading, 
    isError,
    error // You can use this to show an error message
  } = useQuery({
    queryKey: ['avatars'], // Changed to 'avatars' for simplicity
    queryFn: fetchAvatars,
    enabled: isOpen, // This correctly uses the 'isOpen' prop
    staleTime: 1000 * 60 * 5,
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="card-secondary rounded-xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">Choose Your Avatar</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* --- ADDED LOADING AND ERROR STATES --- */}
        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <p>Loading avatars...</p>
          </div>
        )}

        {isError && (
          <div className="flex justify-center items-center h-48 text-red-500">
            <p>Error fetching avatars: {error.message}</p>
          </div>
        )}

        {/* --- CORRECTED MAPPING LOGIC --- */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {availableAvatars && availableAvatars.map((avatar) => (
            <button
              key={avatar.id || avatar.name} // Use a stable key from your data
              onClick={() => onSelect(avatar.url)}
              className="rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75"
            >
              <img
                src={avatar.url} // Use avatar.url
                alt={avatar.name || 'Avatar option'} // Use avatar.name
                className="w-full h-full rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Your style tag is fine */}
      <style>{`
        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};