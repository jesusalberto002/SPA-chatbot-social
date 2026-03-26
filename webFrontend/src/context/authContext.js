import { createContext, useContext } from "react";

export const AuthContext = createContext({
    checkAuthentication: () => {},
    refreshUser: () => {},
    isAuthenticated: false,
    user: null,
    setUser: () => {},
    isLoading: true,
    login: () => {},
    register: () => {},
    logout: () => {},
    updateUser: () => {},
    refreshSession: () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};