import { createContext, useContext } from "react";

export const CommunityContext = createContext({
    joinedCommunityIds: new Set(),
    isLoading: true,
    joinCommunity: () => {},
    leaveCommunity: () => {},
});

export const useCommunity = () => {
    return useContext(CommunityContext);
};