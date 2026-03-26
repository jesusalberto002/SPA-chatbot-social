import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import Comment from './comment'; // Assuming Comment.jsx is in the same folder
import api from '../../../../api/axios'; // Adjust the import path as necessary
import toastService from "@/services/toastService"

export default function CommentsModal({ postId, postTitle, onCommentSubmitted, onClose }) {
    const [comments, setComments] = useState([]);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const observer = useRef();

    const fetchComments = useCallback(async (pageNum) => {
        if (!postId) return;
        setIsLoading(true);
        try {
            // Note: I've corrected your API route based on your backend logic
            const response = await api.get(`/community/post/comment/get/${postId}?page=${pageNum}`);
            const newComments = response.data;

            setComments(prev => pageNum === 1 ? newComments : [...prev, ...newComments]);
            
            if (newComments.length < 25) {
                setHasMoreComments(false);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            toastService.error("Could not load comments.");
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      // Call the new backend endpoint
      const response = await api.post(`/community/post/comment/create/${postId}`, {
        text: newComment.trim(),
      });

      const savedComment = response.data; // The comment returned from the API

      // Update the modal's internal state with the real data from the server
      setComments(prevComments => [savedComment, ...prevComments]);
      
      // Notify the parent PostCard to update its own state (e.g., the comment count)
      onCommentSubmitted(savedComment);

      setNewComment(''); // Clear the input field
      toastService.success("Comment posted!");

    } catch (error) {
      console.error("Failed to post comment:", error);
      toastService.error("Could not post comment.");
    } finally {
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  return (
        <motion.div
            className="modal p-0 shadow-2xl w-full max-w-2xl rounded-lg flex flex-col h-[80vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
        >
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <h3 className="text-xl font-semibold main-text truncate pr-4">Comments on "{postTitle}"</h3>
                <button onClick={onClose} className="p-1 rounded-full hover-interactive"><X className="w-6 h-6 tertiary-text" /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {comments.map((comment, index) => {
                    if (comments.length === index + 1) {
                        return <div ref={lastCommentElementRef} key={comment.id}><Comment comment={comment} /></div>;
                    }
                    return <Comment key={comment.id} comment={comment} />;
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

            <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <img src="https://placehold.co/100x100/c084fc/ffffff?text=U" alt="You" className="w-9 h-9 rounded-full" />
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full form-input rounded-full py-2 px-4 text-sm"
                        disabled={isSubmitting}
                    />
                    <button type="submit" className="p-2 rounded-full button-primary transition-opacity flex-shrink-0" disabled={isSubmitting}>
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}