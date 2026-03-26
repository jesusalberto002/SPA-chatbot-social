import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import CommunityCard from '../components/communityCard';
import HorizontalScrollSection from '../components/HorizontalScroller';
import CompactCommunityGrid from '../components/compactCommunityGrid';
import ExpandableCommunityList from '../components/expandableCommunityList';

export default function CommunityExplore({ onCommunityClick }) {
    const [topCommunities, setTopCommunities] = useState([]);
    const [activeCommunities, setActiveCommunities] = useState([]);
    const [recommendedCommunities, setRecommendedCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExploreData = async () => {
            setIsLoading(true);
            try {
                const [topResponse, activeResponse, recommendedResponse] = await Promise.all([
                    api.get('/community/explore/top-communities'),
                    api.get('/community/explore/most-active'),
                    api.get('/community/explore/recommended-communities')
                ]);
                setTopCommunities(topResponse.data || []);
                setActiveCommunities(activeResponse.data || []);
                setRecommendedCommunities(recommendedResponse.data || []);
                console.log("Explore Data:", {
                    recommended: recommendedResponse.data
                });
            } catch (error) {
                console.error("Error fetching explore data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExploreData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-12 secondary-text">Loading Communities...</div>;
    }

    return (
        <div className="w-full min-w-0">
            <div className="text-center mb-8 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-bold main-text">Explore Communities</h1>
                <p className="text-base md:text-lg secondary-text mt-2">
                    Connect with like-minded people and share your experiences.
                </p>
            </div>

            {/* Using the Compact Grid for visually prominent sections */}
            <CompactCommunityGrid
                title="Recommended For You"
                communities={recommendedCommunities}
                onCommunityClick={onCommunityClick}
            />
            
            <CompactCommunityGrid
                title="Top Communities by Members"
                communities={topCommunities}
                onCommunityClick={onCommunityClick}
            />
            
            {/* Using the Expandable List for a potentially longer, less critical list */}
            <ExpandableCommunityList
                title="Most Active Communities"
                communities={activeCommunities}
                onCommunityClick={onCommunityClick}
            />
        </div>
    );
}