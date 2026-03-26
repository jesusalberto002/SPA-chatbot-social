import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Rss, Zap, Plus, UserPlus, Check, MoreHorizontal, LogOut, Edit } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion" // Import motion components
import api from '../../../../api/axios'; // Adjust the import path as necessary
import CreatePostModal from '../components/newPostModal';
import EditCommunityModal from '../components/editCommunityModal'; // 1. Import the EditCommunityModal
import { useModal } from '../../../../context/modalContext';
import { useAuth } from '../../../../context/authContext';
import { useCommunity } from '@/context/communityContext'; // 1. Import the context
import PostCard from '../components/postCard'; // Assuming you have a PostCard component to display posts
import toastService from "@/services/toastService";
import { formatDistanceToNow } from 'date-fns';

// This component represents the main view for a single community
export default function CommunityDashboard({ communityId, onBack, onPostClick }) {
  const { showModal, hideModal } = useModal();
  const { user } = useAuth();
  const [ postFilter, setPostFilter ] = useState('latest'); // 'latest' or 'popular'
  const [ communityData, setCommunityData ] = useState([]);
  const [ communityPosts, setCommunityPosts ] = useState([]); // Placeholder for posts data
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isOptionsOpen, setIsOptionsOpen ] = useState(false); // State for the new dropdown
  const optionsRef = useRef(null); // Ref for the dropdown
  const { joinedCommunityIds, joinCommunity, leaveCommunity } = useCommunity(); // 2. Use the context
  const [ postPage, setPostPage ] = useState(1);
  const [ hasMorePosts, setHasMorePosts ] = useState(true);
  const postObserver = useRef();

  const isMember = joinedCommunityIds.has(communityId); // 3. Derive isMember from context
  const isCreator = user && communityData && user?.id === communityData.creatorId;

  useEffect(() => {
    console.log("CommunityDashboard mounted");
    return () => console.log("CommunityDashboard unmounted");
}, []);

  const fetchCommunityData = useCallback(async (pageToFetch) => {
      if (!communityId) return;
      setIsLoading(true);
      try {
          const response = await api.get(`/community/get-data/${communityId}?postFilter=${postFilter}&page=${pageToFetch}`);
          const { communityData, communityPosts: newPosts } = response.data;

          if (pageToFetch === 1) {
              setCommunityData(communityData || null);
              setCommunityPosts(newPosts || []);
          } else {
              setCommunityPosts(prev => [...prev, ...newPosts]);
          }
          if (!newPosts || newPosts.length < 25) {
              setHasMorePosts(false);
          }
      } catch (error) {
          console.error("Error fetching community data:", error);
      } finally {
          setIsLoading(false);
      }
  }, [communityId, postFilter]);

  useEffect(() => {
      setCommunityPosts([]);
      setPostPage(1);
      setHasMorePosts(true);
      fetchCommunityData(1);
  }, [communityId, postFilter, fetchCommunityData]);

  useEffect(() => {
      if (postPage > 1) {
          fetchCommunityData(postPage);
      }
  }, [postPage, fetchCommunityData]);

  const lastPostElementRef = useCallback(node => {
      if (isLoading) return;
      if (postObserver.current) postObserver.current.disconnect();
      postObserver.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMorePosts) {
              setPostPage(prevPage => prevPage + 1);
          }
      });
      if (node) postObserver.current.observe(node);
  }, [isLoading, hasMorePosts]);

  const handleJoinCommunity = async () => {
    try {
        const response = await api.post(`/community/join/${communityId}`);
        toastService.success(response.data.message);
        joinCommunity(communityId);
        fetchCommunityData();
    } catch (error) {
        console.error("Failed to join community:", error);
        toastService.error(error.response?.data?.message || "Could not join community.");
    }
  };

  const handleLeaveCommunity = async () => {
    try {
        const response = await api.delete(`/community/leave/${communityId}`);
        toastService.success(response.data.message);
        leaveCommunity(communityId);
        setIsOptionsOpen(false); // Close dropdown
        fetchCommunityData(); // Re-fetch to update member count
    } catch (error) {
        console.error("Failed to leave community:", error);
        toastService.error(error.response?.data?.message || "Could not leave community.");
    }
  };

  // Effect to close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setIsOptionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateSubmit = async (postData) => {
        const { title, content, postImage, tags } = postData;
        if (!user) {
            toastService.error("You must be logged in to post.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (postImage) {
            formData.append('postImage', postImage);
        }
        if (tags && tags.length > 0) {
            formData.append('tags', JSON.stringify(tags));
        }

        try {
            const response = await api.post(`/community/post/create/${communityId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Construct a complete post object for the UI
            const newPost = {
                ...response.data.post, // For server-generated fields like id, createdAt, imageUrl
                title: postData.title,     // <-- FIX: Add title from the form data
                content: postData.content, // <-- FIX: Add content from the form data
                authorName: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
                likeCount: 0,
                commentsCount: 0,
                userVote: null,
                reactions: []
            };
            
            // Update local state by adding the new post to the TOP of the array
            setCommunityPosts(prevPosts => [newPost, ...prevPosts]);

            hideModal();
            toastService.success("Post created successfully!");

        } catch (error) {
            console.error('Failed to create post:', error);
            toastService.error(error.response?.data?.message || "Failed to create post.");
        }
    };

  const openCreatePostModal = () => {
    showModal(<CreatePostModal onCreate={handleCreateSubmit} onCancel={hideModal} />);
  };

  if (isLoading) {
    return <div className="text-center p-12" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (!communityData) {
    return (
      <div className="text-center p-12" style={{ color: 'var(--text-secondary)' }}>
        Community not found.
      </div>
    );
  }

  const handleEditSubmit = async (editData) => {
      const { name, description, bannerImage, tags } = editData;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('tags', JSON.stringify(tags));
      
      // Only append the banner image if a new one was selected
      if (bannerImage) {
          formData.append('bannerImage', bannerImage);
      }

      try {
            const response = await api.put(`/community/edit/${communityId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Get the newly updated community data from the response
            const updatedCommunity = response.data.community;

            // Update the state by merging the new data with the previous data
            setCommunityData(prevData => ({
                ...prevData, // Keep all old data (like memberCount, creatorId)
                ...updatedCommunity // Overwrite with new data (like name, description, imageUrl)
            }));
          hideModal();
          toastService.success("Community updated successfully!");

      } catch (error) {
          console.error('Failed to edit community:', error);
          toastService.error(error.response?.data?.message || "Failed to edit community.");
      }
  };

  // --- NEW: FUNCTION TO OPEN THE EDIT MODAL ---
  const openEditModal = () => {
      setIsOptionsOpen(false); // Close the dropdown
      showModal(
          <EditCommunityModal 
              onSave={handleEditSubmit} 
              onCancel={hideModal} 
              communityData={communityData} // Pass in existing data
          />
      );
  };

  // Show loading skeleton on first load
  if (isLoading && !communityData) {
    return <div className="text-center p-12" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (!communityData) {
    return (
      <div className="text-center p-12" style={{ color: 'var(--text-secondary)' }}>
        Community not found.
      </div>
    );
  }

  return (
        <div className="animate-fade-in">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 px-1 mb-1 -mt-3 text-sm md:text-base font-medium rounded-full transition-all duration-200 hover:bg-[var(--interactive-hover)]"
                style={{ color: "var(--text-tertiary)" }}
            >
            <span className="text-lg">&larr;</span>
            <span>Back</span>
            </button>

            {/* Banner */}
            <div
            className="relative h-56 md:h-80 rounded-lg bg-cover bg-center flex flex-col justify-end"
            style={{ backgroundImage: `url(${communityData.imageUrl})` }}
            >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-lg"></div>
            <div className="relative p-4 md:p-6 text-white z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-5xl font-bold">
                    {communityData.name}
                    </h1>
                    <p
                    className="mt-1 md:mt-2 text-sm md:text-lg"
                    style={{
                        color: "var(--text-secondary-on-dark, #e5e7eb)",
                    }}
                    >
                    {communityData.description}
                    </p>
                </div>
                <div className="flex items-center text-sm md:text-lg font-semibold">
                    <Users className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span>{communityData.memberCount.toLocaleString()} Members</span>
                </div>
                </div>
            </div>
            </div>

            <div className="mt-3 md:mt-8">
            {/* Row 1: Action Buttons */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2" ref={optionsRef}>
                {isMember ? (
                    <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30 cursor-default">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> Joined
                    </button>
                ) : (
                    <button
                    onClick={handleJoinCommunity}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full button-primary transition-colors"
                    >
                    <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Join
                    </button>
                )}

                {/* Menu */}
                {isMember && (
                    <div className="relative">
                    <button
                        onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                        className="p-2 rounded-full hover-interactive"
                    >
                        <MoreHorizontal className="w-5 h-5 tertiary-text" />
                    </button>
                    <AnimatePresence>
                        {isOptionsOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-lg z-10"
                            style={{
                            backgroundColor: "var(--bg-modal)",
                            borderColor: "var(--border-primary)",
                            }}
                        >
                            <div className="p-2">
                            {isCreator && (
                                <button
                                    onClick={openEditModal}
                                    className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-colors main-text hover-interactive"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Community</span>
                                </button>
                            )}
                            {!isCreator && (
                                <button
                                    onClick={handleLeaveCommunity}
                                    className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-md transition-colors text-red-500 hover:bg-red-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Leave Community</span>
                                </button>
                            )}
                            </div>
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                )}
                </div>

                {/* New Post button */}
                <button
                onClick={openCreatePostModal}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-full transition-colors duration-200 border-none hover-interactive"
                style={{ color: "var(--text-secondary)" }}
                >
                <Plus className="w-4 h-4" />
                New Post
                </button>
            </div>

            {/* Row 2: Filter Buttons with Bottom Border */}
            <div className="flex items-center border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <button 
                    onClick={() => setPostFilter('latest')}
                    className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold transition-colors duration-200 ${postFilter === 'latest' ? 'border-b-2' : ''}`}
                    style={{ color: postFilter === 'latest' ? 'var(--brand-purple)' : 'var(--text-secondary)', borderColor: postFilter === 'latest' ? 'var(--brand-purple)' : 'transparent' }}
                >
                    <Rss className="w-4 h-4" />
                    Latest
                </button>
                <button 
                    onClick={() => setPostFilter('popular')}
                    className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold transition-colors duration-200 ${postFilter === 'popular' ? 'border-b-2' : ''}`}
                    style={{ color: postFilter === 'popular' ? 'var(--brand-purple)' : 'var(--text-secondary)', borderColor: postFilter === 'popular' ? 'var(--brand-purple)' : 'transparent' }}
                >
                    <Zap className="w-4 h-4" />
                    Popular
                </button>
            </div>

            {/* --- END: RESTRUCTURED SECTION --- */}

            <div className="mt-4 -mx-4 md:-mx-0 space-y-0">
              {communityPosts.map((post, index) => {
                  if (communityPosts.length === index + 1) {
                      return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} onPostClick={onPostClick} /></div>;
                  }
                  return <PostCard key={post.id} post={post} onPostClick={onPostClick}/>;
              })}
            </div>

            {isLoading && postPage > 1 && <div className="text-center p-8 secondary-text">Loading more posts...</div>}
            
            {!hasMorePosts && communityPosts.length > 0 && (
              <div className="text-center p-8 tertiary-text">You've reached the end of the posts.</div>
            )}
            
            {!isLoading && communityPosts.length === 0 && (
              <div className="text-center py-12 card" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <h3 className="text-xl font-semibold main-text">No posts yet!</h3>
                  <p className="secondary-text">Be the first to share something in this community.</p>
              </div>
            )}
        </div>
    </div>
  );
}
