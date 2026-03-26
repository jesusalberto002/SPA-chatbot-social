import React, { useEffect, useState } from 'react';
import CommunityCard from '../components/communityCard';
import { Plus, Users, Crown } from 'lucide-react';
import { useModal } from '../../../../context/modalContext';
import { useAuth } from '../../../../context/authContext';
import CreateCommunityModal from '../components/newCommunityModal';
import api from '../../../../api/axios';

// A simple selector component for switching views
const ViewSelector = ({ activeFilter, setFilter }) => {
    const getButtonClasses = (filterName) => {
        const baseClasses = "flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 flex items-center justify-center gap-2";
        if (activeFilter === filterName) {
            return `${baseClasses} button-primary shadow-md`;
        }
        // Using a transparent background for the inactive state
        return `${baseClasses} bg-transparent text-secondary`;
    };

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg w-full max-w-xs" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <button onClick={() => setFilter('all')} className={getButtonClasses('all')}>
                <Users className="w-4 h-4" />
                All
            </button>
            <button onClick={() => setFilter('owned')} className={getButtonClasses('owned')}>
                <Crown className="w-4 h-4" />
                Owned
            </button>
        </div>
    );
};


const MyCommunitiesPage = ({ onCommunityClick }) => {
    const { user } = useAuth();
    const { showModal, hideModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [allUserCommunities, setAllUserCommunities] = useState([]);
    const [ownedCommunities, setOwnedCommunities] = useState([]);
    const [viewFilter, setViewFilter] = useState('all'); // 'all' or 'owned'

    useEffect(() => {
        if (!user) return;

        const fetchUserCommunities = async () => {
            setIsLoading(true);
            try {
                // Pass the user ID to the backend to get their specific communities
                const response = await api.get('/community/user-communities');

                console.log("Fetched communities from backend:", response.data);

                setAllUserCommunities(response.data.allUserCommunities || []);
                setOwnedCommunities(response.data.ownedCommunities || []);
            } catch (error) {
                console.error('Error fetching user communities:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserCommunities();
    }, [user]);

    const handleCreateSubmit = async (communityData) => {
        const { name, description, bannerImage, tags } = communityData;
        if (!user) {
            console.error("Authentication error: User not found.");
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('userId', user.id);
        if (bannerImage) {
            formData.append('bannerImage', bannerImage);
        }
        if (tags && tags.length > 0) {
            formData.append('tags', JSON.stringify(tags));
        }
        try {
            await api.post('/community/create', formData);
            // Refetch communities after creating a new one
            const response = await api.get(`/community/user-communities`);
            setAllUserCommunities(response.data.allUserCommunities || []);
            setOwnedCommunities(response.data.ownedCommunities || []);
            hideModal();
        } catch (error) {
            console.error('Failed to create community:', error);
        }
    };

    const openCreateCommunityModal = () => {
        showModal(
            <CreateCommunityModal
                onCreate={handleCreateSubmit}
                onCancel={hideModal}
            />
        );
    };

    const communitiesToDisplay = viewFilter === 'all' ? allUserCommunities : ownedCommunities;

    return (
        <div>
            {/* --- TEXT SIZE and LAYOUT CHANGES --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    My Communities
                </h1>
                <button
                    className="flex items-center self-start md:self-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 border-none hover-interactive"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' }}
                    onClick={openCreateCommunityModal}
                >
                    <Plus className="w-4 h-4" />
                    New Community
                </button>
            </div>

            <ViewSelector activeFilter={viewFilter} setFilter={setViewFilter} />

            <div className="mt-8">
              {isLoading ? (
                  <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading your communities...</div>
              ) : communitiesToDisplay.length > 0 ? (
                  // --- GRID CHANGES ---
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {communitiesToDisplay.map(community => (
                          <CommunityCard
                              key={community.id}
                              community={community}
                              onCommunityClick={onCommunityClick}
                          />
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>No communities yet!</h3>
                      <p>It looks like you haven't {viewFilter === 'owned' ? 'created any' : 'joined any'} communities.</p>
                  </div>
              )}
            </div>
        </div>
    );
};

export default MyCommunitiesPage;