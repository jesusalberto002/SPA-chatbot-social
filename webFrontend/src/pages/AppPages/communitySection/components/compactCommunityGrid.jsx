import React from 'react';
import { Users } from 'lucide-react';

// A new, compact card design for grid views
const CommunityGridCard = ({ community, onCommunityClick }) => (
    <button 
        onClick={() => onCommunityClick(community.id)}
        className="group w-full text-left rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
        }}
    >
        <div
            className="h-28 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundImage: `url(${community.imageUrl || 'https://placehold.co/600x400/a78bfa/ffffff?text=Community'})` }}
        />
        <div className="p-3">
            <h3 className="font-bold main-text truncate">{community.name}</h3>
            <div className="flex items-center text-sm tertiary-text mt-1">
                <Users className="w-4 h-4 mr-1.5" />
                <span>{community.memberCount.toLocaleString()} Members</span>
            </div>
        </div>
    </button>
);

// The main grid component
const CompactCommunityGrid = ({ title, communities, onCommunityClick }) => {
    return (
        <section className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold main-text mb-4">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {communities.map(community => (
                    <CommunityGridCard 
                        key={community.id}
                        community={community}
                        onCommunityClick={onCommunityClick}
                    />
                ))}
            </div>
        </section>
    );
};

export default CompactCommunityGrid;