import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

// A new, compact card design for list views
const CommunityListCard = ({ community, onCommunityClick }) => (
    <button 
        onClick={() => onCommunityClick(community.id)}
        className="w-full flex items-center text-left p-3 rounded-lg transition-colors hover:bg-interactive-hover"
    >
        <img 
            src={community.imageUrl || `https://placehold.co/100x100/${community.id}/ffffff?text=${community.name.charAt(0)}`} 
            alt={community.name}
            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
        />
        <div className="ml-4 min-w-0">
            <p className="font-bold main-text truncate">{community.name}</p>
            <div className="flex items-center text-sm tertiary-text">
                <Users className="w-4 h-4 mr-1.5" />
                <span>{community.memberCount.toLocaleString()} Members</span>
            </div>
        </div>
    </button>
);

// The main expandable list component
const ExpandableCommunityList = ({ title, communities, onCommunityClick, initialLimit = 3 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleCommunities = isExpanded ? communities : communities.slice(0, initialLimit);

    return (
        <section className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold main-text mb-4">{title}</h2>
            <div className="space-y-2">
                {visibleCommunities.map(community => (
                    <CommunityListCard 
                        key={community.id}
                        community={community}
                        onCommunityClick={onCommunityClick}
                    />
                ))}
            </div>
            {communities.length > initialLimit && (
                <div className="mt-3">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold tertiary-text hover:bg-interactive-hover hover:main-text transition-colors"
                    >
                        {isExpanded ? 'Show less' : `Show all ${communities.length} communities`}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </section>
    );
};

export default ExpandableCommunityList;