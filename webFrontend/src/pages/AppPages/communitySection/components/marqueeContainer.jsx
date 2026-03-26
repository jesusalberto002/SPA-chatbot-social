import React from 'react';
import CommunityCard from './communityCard';
import './marqueeContainer.css'; // We'll create this CSS file next

const MarqueeContainer = ({ title, communities, onCommunityClick, direction = 'left' }) => {
    if (!communities || communities.length === 0) {
        return null; // Don't render anything if there are no communities
    }

    const containerClassName = `marquee-container ${direction === 'right' ? 'marquee-reverse' : ''}`;

    return (
        <div className="my-12">
            <h2 className="text-3xl font-bold main-text mb-6">{title}</h2>
            <div className={containerClassName}>
                <div className="marquee-content">
                    {[...communities, ...communities].map((community, index) => (
                        <div key={`${community.id}-${index}`} className="marquee-item">
                            <CommunityCard community={community} onCommunityClick={onCommunityClick} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarqueeContainer;