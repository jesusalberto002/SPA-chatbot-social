import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../../api/axios';
import { useCommunity } from '../../../../context/communityContext';
import PostCard from '../components/postCard';
import CommunityCard from '../components/communityCard';
import './communityHome.css';

export default function CommunityHome({ onCommunityClick, onPostClick }) {
    const { joinedCommunityIds, isLoading: isContextLoading } = useCommunity();
    const [feedPosts, setFeedPosts] = useState([]);
    const [topCommunities, setTopCommunities] = useState([]);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const observer = useRef();

    const fetchingPage = useRef(null);
    const persistedPosts = useRef([]);
    const persistedPage = useRef(1);

    // Persist state before render
    useEffect(() => {
        persistedPosts.current = feedPosts;
        persistedPage.current = page;
    });

    useEffect(() => {
        console.log("CommunityHome mounted");
        return () => console.log("CommunityHome unmounted");
    }, []);
    
    const fetchFeed = useCallback(async (pageNum) => {
        // ... (fetchFeed logic is already correct)
        if (fetchingPage.current === pageNum) return;

        fetchingPage.current = pageNum;
        // 🛑 IMPORTANT: ONLY SET LOADING TO TRUE HERE, inside the fetch logic
        setIsLoading(true); 
        try {
            const response = await api.get(`/community/user-feed?page=${pageNum}`);
            if (response.data.length > 0) {
                setTimeout(() => {
                    setFeedPosts(prevPosts => pageNum === 1 ? response.data : [...prevPosts, ...response.data]);
                    setHasMore(true);
                    // 🛑 SET LOADING TO FALSE ONCE SUCCESSFUL
                    setIsLoading(false); 
                    fetchingPage.current = null;
                }, 300);
            } else {
                setHasMore(false);
                // 🛑 SET LOADING TO FALSE ONCE EMPTY
                setIsLoading(false);
                fetchingPage.current = null;
            }
        } catch (error) {
            console.error("Error fetching feed:", error);
            // 🛑 SET LOADING TO FALSE ON FAILURE
            setIsLoading(false); 
            fetchingPage.current = null;
        }
    }, []);

    // 2. --- 🛑 MODIFIED INITIAL LOAD / RESET EFFECT 🛑 ---
    useEffect(() => {
        if (isContextLoading) return;

        // Case A: User has joined communities (Feed View)
        if (joinedCommunityIds.size > 0) {
            
            // 1. Check for persisted state (navigating back from post/dashboard)
            if (persistedPosts.current.length > 0) {
                // Restore the state from the last visited position immediately
                setFeedPosts(persistedPosts.current);
                setPage(persistedPage.current);
                // 🛑 Crucial: If we have content, we are NOT loading.
                setIsLoading(false); 
                return; 
            }
            
            // 2. Initial load (page is 1 and no persisted content)
            if (page === 1) {
                fetchFeed(1);
                // The loading state is handled inside fetchFeed, but we keep the initial fetch
                // here for the first-time logic.
            }
            
        } 
        // Case B: User has no joined communities (Discovery View)
        else { 
            // Reset feed data, preventing it from showing old content briefly
            setFeedPosts([]);
            
            const fetchTopCommunities = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get('/community/explore/top-communities');
                    setTopCommunities(response.data);
                } catch (error) {
                    console.error("Error fetching top communities:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTopCommunities();
        }
    // Note: Removed `page` from dependencies, as restoring `page` should not re-trigger the fetch.
    }, [isContextLoading, joinedCommunityIds, fetchFeed]); 

    // 3. The infinite scroll useEffect is correct and handles subsequent pages.
    useEffect(() => {
        if (page > 1 && hasMore) {
            fetchFeed(page);
        }
    }, [page, hasMore, fetchFeed]);

    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    if (isContextLoading) {
        // Smaller text
        return <div className="text-center p-12 text-sm secondary-text">Loading...</div>;
    }

    // --- RENDER THE FEED ---
    if (joinedCommunityIds.size > 0) {
        return (
            // Added animation class
            <div className="content-fade-in">
                {/* Responsive text size */}
                <h1 className="text-3xl sm:text-4xl font-bold main-text mb-6 sm:mb-8">Your Feed</h1>
                {/* Added overflow-hidden and border for non-mobile */}
                <div className="space-y-0 -mx-4 md:mx-0 rounded-lg overflow-hidden">
                    {feedPosts.map((post, index) => {
                        // Wrapped PostCard in an animated div
                        const postCardWrapper = (
                            <div className="post-fade-in">
                                <PostCard post={post} onPostClick={onPostClick} />
                            </div>
                        );

                        // If this is the last post, attach the ref to it
                        if (feedPosts.length === index + 1) {
                             // Attaching ref to the outer wrapper
                            return <div ref={lastPostElementRef} key={post.id}>{postCardWrapper}</div>;
                        } else {
                            // Return the wrapped card
                            return <div key={post.id}>{postCardWrapper}</div>;
                        }
                    })}
                </div>
                {/* Show a loading indicator at the bottom while fetching more posts */}
                {/* Smaller text */}
                {isLoading && <div className="text-center p-8 text-sm secondary-text">Loading more posts...</div>}
                {!hasMore && feedPosts.length > 0 && (
                     // MODIFIED: Smaller text
                    <div className="text-center p-8 text-sm tertiary-text">You've reached the end of your feed.</div>
                )}
                {!isLoading && feedPosts.length === 0 && (
                     <div className="text-center py-12 card">
                         {/* MODIFIED: Smaller text */}
                        <h3 className="text-lg sm:text-xl font-semibold main-text">It's quiet in here...</h3>
                        <p className="secondary-text text-sm sm:text-base">The communities you've joined haven't posted anything yet.</p>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER THE DISCOVERY GRID ---
    return (
        // Added animation class
        <div className="content-fade-in">
            <div className="text-center mb-10">
                 {/* Responsive text size */}
                <h1 className="text-3xl sm:text-4xl font-bold main-text">Discover Communities</h1>
                <p className="text-base sm:text-lg secondary-text mt-2">You haven't joined any communities yet. Here are some popular ones to get you started!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCommunities.map((community) => (
                    <CommunityCard 
                        key={community.id} 
                        community={community} 
                        onCommunityClick={onCommunityClick} 
                    />
                ))}
            </div>
        </div>
    );
};