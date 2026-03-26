import { useState, useEffect } from 'react';
import axios from 'axios';
import api from "../api/axios"
import toastService from '@/services/toastService';
import { toast } from 'react-toastify';

// This runs globally before React even boots up!
const promotePendingCredentials = () => {
    const pendingToken = localStorage.getItem('pendingToken');
    if (pendingToken) {
        localStorage.setItem('token', pendingToken);
        const pendingUser = localStorage.getItem('pendingUser');
        if (pendingUser) {
            localStorage.setItem('user', pendingUser);
        }
        localStorage.removeItem('pendingToken');
        localStorage.removeItem('pendingUser');
    }
};
promotePendingCredentials();

import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    checkAuthentication();
    console.log('Authentication check completed. User:', user);
  }, []);

  const updateUser = (newUserData) => {
    // 1. Define the only keys you want to accept in your global user context.
    const allowedKeys = [
      'id', 
      'email', 
      'firstName', 
      'lastName', 
      'role', 
      'subscriptionTier',
      'billingCycle',
      'isNewUser',
      'profileImageUrl',
    ];
    const sanitizedUpdate = {};

    for (const key of allowedKeys) {
        if (newUserData[key] !== undefined) {
            sanitizedUpdate[key] = newUserData[key];
        }
    }

    setUser(currentUser => {
        // 1. Create the newly merged user object
        const updatedUser = { ...currentUser, ...sanitizedUpdate };
        
        // 2. Overwrite the stale local storage immediately!
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
        
        // 3. Update the React state
        return updatedUser;
    });
};

const checkAuthentication = async () => {
  const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await api.get('/auth/authenticate', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
            setIsAuthenticated(true);
            console.log('User authenticated:', response.data);
        } catch (error) {
            console.error('Error checking authentication status:', error);
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        }
    } else {
        setIsAuthenticated(false);
    }
    // Always stop loading, regardless of success or failure
    setIsLoading(false); 
  };

  const login = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user: loggedInUser } = response.data;

      // Store the token in localStorage
      localStorage.setItem('token', token);

      setIsAuthenticated(true);
      setUser(loggedInUser);
      toast.success('Welcome!');
    } catch (error) {
      console.error('Login failed:', error);
      toastService.error("Failed to log in. Please check your credentials.");
      throw error; // Re-throw the error to handle it in the component
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user: loggedInUser } = response.data;

      // Store the token in localStorage
      localStorage.setItem('token', token);

      setIsAuthenticated(true);
      setUser(loggedInUser);
      toast.success('Registration successful! Welcome!');
    } catch (error) {
      console.error('Registration failed:', error);
      toastService.error("Failed to create account. Please try again.");
      throw error; // Re-throw the error to handle it in the component
    }
  };

  const refreshSession = (updatedUser, newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    setUser(updatedUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('communityState');
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toastService.error('Failed to log out. Please try again.');
    }
  };

  const value = {
    checkAuthentication,
    refreshUser: checkAuthentication,
    isAuthenticated,
    user,
    setUser,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}