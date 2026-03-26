import React from 'react';
import { Users, Check } from 'lucide-react';
import { useCommunity } from '../../../../context/communityContext';
import api from '../../../../api/axios';
import toastService from '../../../../services/toastService';

export default function CommunityCard({ community, onCommunityClick }) {
  const { joinedCommunityIds, joinCommunity } = useCommunity();
  const { name, memberCount, imageUrl, id } = community || {};
  const isMember = joinedCommunityIds.has(id);

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    if (isMember) return;
    try {
      const response = await api.post(`/community/join/${id}`);
      toastService.success(response.data.message);
      joinCommunity(id);
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Could not join community.');
    }
  };

  const placeholderBanner = 'https://placehold.co/600x150/a78bfa/ffffff?text=Community';

  return (
    <div
      className="group rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col h-full min-w-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
      }}
      onClick={() => onCommunityClick(id)}
    >
      {/* Banner */}
      <div
        className="h-32 sm:h-40 w-full bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${imageUrl || placeholderBanner})` }}
      />

      {/* Body */}
      <div className="p-4 flex flex-col flex-grow min-w-0">
        <h3 className="text-lg font-bold truncate main-text">{name || 'Unnamed Community'}</h3>

        {/* Member count */}
        <div className="flex items-center mt-2 tertiary-text">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {memberCount != null ? Number(memberCount).toLocaleString() : '0'} Members
          </span>
        </div>

        {/* Join / Joined button */}
        <div className="mt-auto pt-4 flex justify-center">
          {isMember ? (
            <button
              disabled
              className="py-2 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Joined
            </button>
          ) : (
            <button
              onClick={handleJoinClick}
              className="py-2 px-8 rounded-full text-sm font-semibold button-primary transition-colors duration-200"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
