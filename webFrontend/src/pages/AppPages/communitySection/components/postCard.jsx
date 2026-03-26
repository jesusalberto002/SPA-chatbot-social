import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Flag, SmilePlus, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './reportModal';
import Comment from './comment';
import { useModal } from '../../../../context/modalContext';
import { useAuth } from '../../../../context/authContext';
import toastService from '@/services/toastService'; // For feedback messages
import api from '../../../../api/axios'; // Adjust the import path as necessary
import { menu } from 'framer-motion/client';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function PostCard({ post, onPostClick, onDelete }) {
    const { showModal, hideModal } = useModal();
    const { user } = useAuth();
    const [likes, setLikes] = useState(post.likeCount || 0);
    const [userVote, setUserVote] = useState(post.userVote || null);
    const [comments, setComments] = useState([]);
    const [reactions, setReactions] = useState(post.reactions || []);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReactionDetails, setShowReactionDetails] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useRef(null);
    const emojiRef = useRef(null);
    const reactionRef = useRef(null);

    // Click-Outside Logic Hook
    useEffect(() => {
        function handleClickOutside(event) {
            // Check for the MoreHorizontal menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Check for the Emoji Picker
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            // Check for the Reaction Details popup
            if (reactionRef.current && !reactionRef.current.contains(event.target)) {
                setShowReactionDetails(false);
            }
        }
        
        // Bind the event listener to the entire document
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on cleanup
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const reactionSummary = useMemo(() => {
        const summary = reactions.reduce((acc, reaction) => {
            acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(summary).sort((a, b) => b[1] - a[1]);
    }, [reactions]);

    const handleReaction = async (emoji) => {
        const originalReactions = [...reactions];
        const userReactionIndex = reactions.findIndex(r => r.userId === user.id && r.reaction === emoji);

        if (userReactionIndex > -1) {
            setReactions(prev => prev.filter((_, index) => index !== userReactionIndex));
        } else {
            setReactions(prev => [...prev, { reaction: emoji, userId: user.id }]);
        }
        setShowEmojiPicker(false);

        try {
            const response = await api.post(`/community/post/react/${post.id}`, { reaction: emoji });
            setReactions(response.data);
        } catch (error) {
            toastService.error("Couldn't add reaction.");
            setReactions(originalReactions);
        }
    };

    const handleVote = async (voteType) => {
        const originalLikes = likes;
        const originalUserVote = userVote;

        // Optimistic UI Update
        let newLikes = likes;
        if (voteType === userVote) { // Undoing a vote
            setUserVote(null);
            if (voteType === 'UP') newLikes--;
        } else { // Adding or changing a vote
            if (userVote === 'UP') newLikes--; // Was previously an upvote
            if (voteType === 'UP') newLikes++;
            setUserVote(voteType);
        }
        setLikes(newLikes);

        try {
            // API Call to the backend
            const response = await api.post(`/community/post/vote/${post.id}`, { voteType });
            // Update state with the definitive count from the server
            setLikes(response.data.likeCount);
        } catch (error) {
            console.error("Failed to vote:", error);
            toastService.error("Your vote could not be saved.");
            // Revert UI on failure
            setLikes(originalLikes);
            setUserVote(originalUserVote);
        }
    };

    useEffect(() => {
        if (post.userVote) {
            setUserVote(post.userVote);
        }
    }, [post.userVote]);

    const handleCommentSubmit = (newCommentText) => {
        // In a real app, you would send this to the backend and get the new comment back
        const newCommentObj = {
            id: Date.now(),
            author: { name: 'You', avatarUrl: 'https://placehold.co/100x100/c084fc/ffffff?text=U' },
            text: newCommentText,
            timestamp: 'Just now'
        };
        setComments([...comments, newCommentObj]);
        toastService.success("Comment posted!");
    };

    const handleDelete = () => {
        onDelete(id);
        setIsMenuOpen(false);
    };

    const handleReport = () => {
            showModal(
                <ReportModal
                    contentId={post.id}
                    contentType="POST"
                    onCancel={hideModal}
                />
            );
            setIsMenuOpen(false); // Close the three-dots menu
        };

    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <>
        <button
            onClick={() => onPostClick(post)}
            className="w-full text-left md:rounded-xl transition-colors duration-200 hover:bg-[var(--bg-tertiary)] cursor-pointer"
        >
            <div className="flex flex-col h-full bg-transparent py-4 px-4"> {/* Inner padding div */}
                {/* POST HEADER */}
                <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-purple)", color: "white" }}>
                        <img
                            src={post?.profileImageUrl || '/default-avatar.png'}
                            alt="Current Profile Avatar"
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className="ml-3">
                        {/* 3. Font sizes reduced for a more compact header */}
                        <p className="font-semibold main-text text-sm">{post.authorName}</p>
                        <div className="flex items-center text-xs tertiary-text">
                            {post.communityName && (
                                <>
                                    <span>in <strong>{post.communityName}</strong></span>
                                    <span className="mx-1">•</span>
                                </>
                            )}
                            <span>Posted {timeAgo}</span>
                        </div>
                    </div>
                </div>

                {/* POST BODY */}
                <div className="mb-2 flex-grow">
                     {/* 4. Font sizes for title and content are smaller */}
                    <h2 className="text-xl font-bold mb-1 main-text">{post.title}</h2>
                    {post.imageUrl && (
                        <div className="my-2 -mx-4 md:mx-0 md:rounded-lg overflow-hidden">
                             <img
                                src={post.imageUrl}
                                alt="Post content"
                                // 3. Increased max-height and adjusted object-fit.
                                className="w-full h-auto max-h-[550px] object-cover"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                    )}
                    <p className="secondary-text whitespace-pre-wrap text-sm">{post.content}</p>
                    
                    {/* 5. Reaction summary is preserved */}
                    {reactionSummary.length > 0 && (
                        <div className="relative mt-3" ref={reactionRef}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowReactionDetails(!showReactionDetails); }}
                                className="flex items-center px-2 py-1 rounded-full bg-gray-700/50 border border-transparent hover:border-gray-400"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                {reactionSummary.slice(0, 2).map(([emoji]) => (
                                    <span key={emoji} className="text-base">{emoji}</span>
                                ))}
                                <span className="text-xs main-text ml-1">{reactions.length}</span>
                            </button>

                            {showReactionDetails && (
                                <div className="absolute bottom-full mb-2 p-2 rounded-lg shadow-lg"
                                    style={{ backgroundColor: 'var(--bg-secondary)'}}
                                >
                                    {reactionSummary.map(([emoji, count]) => (
                                        <div key={emoji} className="flex items-center gap-2 px-2">
                                            <span className="text-lg">{emoji}</span>
                                            <span className="text-sm font-semibold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 6. POST ACTIONS FOOTER */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="relative flex items-center gap-4">
                        <div ref={emojiRef}>
                            <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} className="p-1 rounded-full hover-interactive">
                                <SmilePlus className="w-5 h-5" />
                            </button>
                            {showEmojiPicker && (
                                <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full mb-2 flex gap-2 p-2 rounded-lg card-secondary shadow-lg">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="p-1 rounded-full text-lg hover-interactive transition-colors">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleVote('UP'); }} className={`flex items-center gap-2 hover:text-green-500 transition-colors ${userVote === 'UP' ? 'text-green-500' : ''}`}>
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-sm font-medium">{likes}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleVote('DOWN'); }} className={`flex items-center gap-2 hover:text-red-500 transition-colors ${userVote === 'DOWN' ? 'text-red-500' : ''}`}>
                            <ThumbsDown className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onPostClick(post); }} className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.commentsCount}</span>
                        </button>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="tertiary-text hover:text-yellow-500 transition-colors p-1 rounded-full hover-interactive">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {isMenuOpen && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute right-0 bottom-full mb-2 w-32 rounded-md shadow-lg z-10 border" style={{ backgroundColor: "var(--bg-modal)", borderColor: "var(--border-primary)" }}>
                                <button onClick={handleReport} className="flex items-center w-full px-3 py-2 text-sm text-left hover-interactive"><Flag className="w-4 h-4 mr-2" /> Report</button>
                                {(user?.id === post.authorId || user?.role === 'ADMIN') && (
                                    <button onClick={handleDelete} className="flex items-center w-full px-3 py-2 text-sm text-left text-red-500 hover-interactive"><Trash2 className="w-4 h-4 mr-2" /> Delete</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
        <hr className="mx-4 border-t border-[var(--border-secondary)]" />
    </>
    );
}