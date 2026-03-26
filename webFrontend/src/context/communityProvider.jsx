import React, { useState, useEffect, useCallback } from 'react';
import { CommunityContext } from './communityContext';
import { useAuth } from './authContext';
import api from '../api/axios';

export const CommunityProvider = ({ children }) => {
    const { user } = useAuth();
    const [joinedCommunityIds, setJoinedCommunityIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserCommunities = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const response = await api.get('/community/user-communities');
            const communityIds = new Set(response.data.allUserCommunities.map(c => c.id));
            setJoinedCommunityIds(communityIds);
        } catch (error) {
            console.error("Failed to fetch user's communities for context:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUserCommunities();
    }, [fetchUserCommunities]);

    const joinCommunity = (communityId) => {
        setJoinedCommunityIds(prevIds => new Set(prevIds).add(communityId));
    };

    const leaveCommunity = (communityId) => {
        setJoinedCommunityIds(prevIds => {
            const newIds = new Set(prevIds);
            newIds.delete(communityId);
            return newIds;
        });
    };

    const value = {
        joinedCommunityIds,
        isLoading,
        joinCommunity,
        leaveCommunity,
        refetch: fetchUserCommunities, // Expose a refetch function
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};