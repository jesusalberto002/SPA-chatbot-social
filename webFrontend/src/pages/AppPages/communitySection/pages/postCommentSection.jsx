import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import { Send } from 'lucide-react';
import api from '@/api/axios';
import toastService from "@/services/toastService";
import PostCard from '@/pages/AppPages/communitySection/components/postCard';
import Comment from '@/pages/AppPages/communitySection/components/comment';
import PostAIChat from '@/pages/AppPages/communitySection/components/postAIChat';

    const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        window.addEventListener('resize', handleResize);
        // Clean up event listener
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    
    return isMobile;
};

export default function CommentSection({ post, onBack }) {
    const { user } = useAuth();
    const isMobileView = useIsMobile();
    const [comments, setComments] = useState([]);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null); // NEW STATE
    const [replyToAuthorName, setReplyToAuthorName] = useState('');
    const observer = useRef();

    const profileImageUrl = user?.profileImageUrl;

    const fetchComments = useCallback(async (pageNum) => {
        if (!post?.id) return;
        setIsLoading(true);

        const maxDepth = isMobileView ? 3 : 100; // 100 acts as 'infinite' depth

        try {
            const response = await api.get(`/community/post/comment/get/${post.id}?page=${pageNum}&depth=${maxDepth}`);
            const newComments = response.data.comments;

            setComments(prev => pageNum === 1 ? newComments : [...prev, ...newComments]);
            
            if (newComments.length < 10) {
                setHasMoreComments(false);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            toastService.error("Could not load comments.");
        } finally {
            setIsLoading(false);
        }
    }, [post?.id, isMobileView]);

    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    useEffect(() => {
        if (commentPage > 1 && hasMoreComments) {
            fetchComments(commentPage);
        }
    }, [commentPage, hasMoreComments, fetchComments]);
    
    const lastCommentElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreComments) {
                setCommentPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMoreComments]);


const addReplyRecursively = (comments, reply, parentId) => {
        return comments.map(c => {
            if (c.id === parentId) {
                return { ...c, replies: [reply, ...(c.replies || [])] };
            }

            if (c.replies?.length) {
                return { ...c, replies: addReplyRecursively(c.replies, reply, parentId) };
            }

            return c;
        });
    };

    const replaceCommentRecursively = (comments, optimisticId, realComment) => {
        return comments.map(c => {
            if (c.id === optimisticId) {
                return realComment;
            }

            if (c.replies?.length) {
                return { ...c, replies: replaceCommentRecursively(c.replies, optimisticId, realComment) };
            }

            return c;
        });
    };

    const removeCommentRecursively = (comments, idToRemove) => {
        const filtered = comments.filter(c => c.id !== idToRemove);

        return filtered.map(c => {
            if (c.replies?.length) {
                return { ...c, replies: removeCommentRecursively(c.replies, idToRemove) };
            }
            return c;
        });
    };

    // ------------------------------------
    // HANDLE SUBMIT COMMENT
    // ------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedComment = newComment.trim();
        if (!trimmedComment || isSubmitting) return;

        setIsSubmitting(true);

        const isHaivenQuery = trimmedComment.toLowerCase().startsWith('@haivens');

        // ---------- OPTIMISTIC USER COMMENT ----------
        const optimisticUserComment = {
            id: `optimistic-${Date.now()}`,
            text: trimmedComment,
            authorName: `${user.firstName} ${user.lastName}`.trim(),
            authorId: user.id,
            createdAt: new Date().toISOString(),
            replies: [],
            isOptimistic: true,
            profileImageUrl: user?.profileImageUrl,
        };

        // Add "thinking…" HAIVEN placeholder reply
        if (isHaivenQuery) {
            optimisticUserComment.replies.push({
                id: `thinking-${Date.now()}`,
                authorName: "Haiven AI",
                text: "Thinking...",
                createdAt: new Date().toISOString(),
                isPlaceholder: true,
                profileImageUrl: "/haiven-ai-avatar.png",
            });
        }

        // Insert optimistic user comment at TOP LEVEL
        setComments(prev => [optimisticUserComment, ...prev]);
        setNewComment("");

        try {
            let response;

            // ---------- HAIVEN QUERY ----------
            if (isHaivenQuery) {
                response = await api.post(
                    `/community/post/comment/ask-haiven/${post.id}`,
                    { userCommentText: trimmedComment }
                );

                const realUserComment = response.data.userComment;

                setComments(prev =>
                    replaceCommentRecursively(prev, optimisticUserComment.id, realUserComment)
                );

            } else {
                // ---------- STANDARD COMMENT ----------
                response = await api.post(
                    `/community/post/comment/create/${post.id}`,
                    { text: trimmedComment }
                );

                const realComment = response.data;

                setComments(prev =>
                    replaceCommentRecursively(prev, optimisticUserComment.id, realComment)
                );

                toastService.success("Comment posted!");
            }

        } catch (error) {
            console.error("Failed to post comment:", error);
            toastService.error("Could not post comment.");

            // rollback optimistic comment
            setComments(prev =>
                removeCommentRecursively(prev, optimisticUserComment.id)
            );

        } finally {
            setIsSubmitting(false);
        }
    };

    // ------------------------------------
    // HANDLE REPLIES CREATED BY <Comment />
    // ------------------------------------
    const handleReplyCreated = (newReply, parentId) => {
        setComments(prev => addReplyRecursively(prev, newReply, parentId));
    };

    // ------------------------------------
    // HANDLE DELETING COMMENTS
    // ------------------------------------
    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/community/post/comment/delete/${commentId}`);
            toastService.success("Comment deleted successfully.");

            setComments(prev =>
                removeCommentRecursively(prev, commentId)
            );

        } catch (error) {
            toastService.error("Failed to delete comment.");
            console.error("Delete failed:", error);
        }
    };

    return (
        <>
        {/* Add the typing indicator CSS directly here */}
        <style>{`
            .typing-indicator { display: flex; align-items: center; justify-content: center; height: 24px; }
            .typing-indicator span { height: 6px; width: 6px; background-color: var(--text-tertiary, #6b7280); border-radius: 50%; display: inline-block; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out both; }
            .typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        `}</style>
        <div className='p-0'>
            <button 
                onClick={onBack}
                className="mb-4 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--interactive-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
            >
                &larr; Back
            </button>
            <PostCard post={post} onPostClick={() => {}} />
            <div className="mt-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0">
                        <img
                            src={profileImageUrl || '/default-avatar.png'}
                            alt="Current Profile Avatar"
                            className="rounded-full object-cover"
                        />
                    </div>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment or ask @Haivens..."
                        className="w-full form-input rounded-full py-2 px-4 text-sm"
                        disabled={isSubmitting}
                    />
                    <button type="submit" className="p-2 rounded-full button-primary transition-opacity flex-shrink-0" disabled={isSubmitting}>
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
            <div className="mt-3 space-y-1 min-w-0"> 
                {comments.map((comment, index) => {
                     const elementRef = comments.length === index + 1 ? lastCommentElementRef : null;
                     return (
                         <div ref={elementRef} key={comment.id}>
                             <Comment
                                 comment={comment}
                                 onReplyCreated={handleReplyCreated}
                                 onDelete={handleDeleteComment}
                             />
                         </div>
                     );
                })}
                {isLoading && <div className="text-center p-4 secondary-text">Loading...</div>}
                {!hasMoreComments && comments.length > 0 && <div className="text-center p-4 tertiary-text">No more comments.</div>}
                {!isLoading && comments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="secondary-text">No comments yet.</p>
                        <p className="tertiary-text text-sm">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
            <PostAIChat post={post} />
        </div>
        </>
    );
}