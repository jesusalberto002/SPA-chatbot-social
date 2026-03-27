import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import PostCard from '../components/postCard'; // Make sure you have this component
import CommunityCard from '../components/communityCard';
import { Hash, Zap } from 'lucide-react';
import CompactCommunityGrid from '../components/compactCommunityGrid';

export default function CommunityPopular({ onPostClick, onCommunityClick }) {
    const [popularTags, setPopularTags] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]); // State for trending posts
    const [trendingCommunities, setTrendingCommunities] = useState([]); // State for trending communities
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPopularData = async () => {
            setIsLoading(true);
            try {
                // Fetch both popular tags and trending posts
                const [tagsResponse, postsResponse, communitiesResponse] = await Promise.all([
                    api.get('/community/popular/popular-tags'),
                    api.get('/community/popular/trending-posts'), // Corrected API endpoint
                    api.get('/community/popular/trending-communities') // Fetch trending communities
                ]);
                setPopularTags(tagsResponse.data);
                setTrendingPosts(postsResponse.data); // Set the trending posts state
                setTrendingCommunities(communitiesResponse.data); // Set the trending communities state
            } catch (error) {
                console.error("Error fetching popular data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPopularData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-12 secondary-text">Loading...</div>;
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold main-text">Popular & Trending</h1>
                <p className="text-lg secondary-text mt-2">See what's currently popular in the community.</p>
            </div>

            {/* Trending Tags Section */}
            <div className="my-12">
                 <h2 className="text-3xl font-bold main-text mb-6 flex items-center gap-3">
                    Trending Topics
                </h2>
                <div className="flex flex-wrap gap-3">
                    {popularTags.map(({ tag, count }) => (
                        <div key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{backgroundColor: 'var(--bg-tertiary)'}}>
                           <Hash className="w-4 h-4 tertiary-text" />
                           <span className="font-semibold main-text text-sm">{tag.replace(/_/g, ' ').toLowerCase()}</span>
                           <span className="text-xs font-bold tertiary-text px-2 py-0.5 rounded-full" style={{backgroundColor: 'var(--bg-secondary)'}}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Trending Communities Section */}
            <CompactCommunityGrid
                title="Trending Communities"
                communities={trendingCommunities}
                onCommunityClick={onCommunityClick}
            />

            {/* Trending Posts Section */}
            <div className="my-12">
                <h2 className="text-3xl font-bold main-text mb-6 flex items-center gap-3">
                    Trending Posts
                </h2>
                <div>
                    {trendingPosts.map(post => (
                        <PostCard key={post.id} post={post} onPostClick={onPostClick} />
                    ))}
                </div>
            </div>
        </div>
    );
};