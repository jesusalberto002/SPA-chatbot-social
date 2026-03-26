import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    ThumbsUp, 
    ThumbsDown, 
    CornerUpLeft, 
    MessageSquare, 
    Flag, 
    Send, 
    ChevronDown, 
    ChevronUp, 
    SmilePlus, 
    MoreHorizontal, 
    Trash2, 
    Bot, 
    BrainCircuit 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './reportModal';
import toastService from '@/services/toastService';
import api from '@/api/axios';
import { useAuth } from '@/context/authContext';
import { useModal } from '@/context/modalContext';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function Comment({ comment, onReplyCreated, onDelete, onSetReplyContext }) {
    const { showModal, hideModal } = useModal();
    const { user } = useAuth();
    const { authorName, text, createdAt, replies, id, postId, authorId, isPlaceholder, profileImageUrl, isTruncated } = comment;

    const hasPlaceholderReply = comment.replies?.some(r => r.isPlaceholder);
    const [showReplies, setShowReplies] = useState(hasPlaceholderReply || false);
    const [likes, setLikes] = useState(comment.likeCount || 0);
    const [userVote, setUserVote] = useState(comment.userVote || null);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reactions, setReactions] = useState(comment.reactions || []);
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

    useEffect(() => {
        setLikes(comment.likeCount || 0);
        setUserVote(comment.userVote || null);
        setReactions(comment.reactions || []);
        if (comment.replies?.some(r => r.isPlaceholder)) {
            setShowReplies(true);
        }
    }, [comment]);

    const reactionSummary = useMemo(() => {
        const summary = reactions.reduce((acc, reaction) => {
            acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(summary).sort((a, b) => b[1] - a[1]);
    }, [reactions]);

    const isHaivenAI = authorId === 100; // Check if the author is the bot

    const handleVote = async (voteType) => {
        const originalLikes = likes;
        const originalUserVote = userVote;
        let newLikes = likes;
        if (voteType === userVote) {
            setUserVote(null);
            if (voteType === 'UP') newLikes--;
        } else {
            if (userVote === 'UP') newLikes--;
            if (voteType === 'UP') newLikes++;
            setUserVote(voteType);
        }
        setLikes(newLikes);
        try {
            const response = await api.post(`/community/post/comment/vote/${id}`, { voteType });
            setLikes(response.data.likeCount);
            setUserVote(response.data.userVote);
        } catch (error) {
            toastService.error("Your vote could not be saved.");
            setLikes(originalLikes);
            setUserVote(originalUserVote);
        }
    };
    
    const handleReaction = async (emoji) => {
        const originalReactions = [...reactions];
        const userReactionIndex = reactions.findIndex(r => r.userId === user.id);

        if (userReactionIndex > -1) {
            if (reactions[userReactionIndex].reaction === emoji) {
                setReactions(prev => prev.filter((_, index) => index !== userReactionIndex));
            } else {
                const newReactions = [...reactions];
                newReactions[userReactionIndex].reaction = emoji;
                setReactions(newReactions);
            }
        } else {
            setReactions(prev => [...prev, { reaction: emoji, userId: user.id }]);
        }

        setShowEmojiPicker(false);
        try {
            const response = await api.post(`/community/post/comment/react/${id}`, { reaction: emoji });
            setReactions(response.data);
        } catch (error) {
            toastService.error("Couldn't add reaction.");
            setReactions(originalReactions);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await api.post(`/community/post/comment/reply/${id}`, { text: replyText.trim() });
            onReplyCreated(response.data, id);
            setReplyText('');
            setShowReplyBox(false);
            toastService.success("Reply posted!");
        } catch (error) {
            toastService.error("Failed to post reply.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReport = () => {
        showModal(
            <ReportModal
                contentId={id}
                contentType="COMMENT"
                onCancel={hideModal}
            />
        );
        setIsMenuOpen(false); // Close the three-dots menu
    };

    const handleDelete = () => {
        onDelete(id);
        setIsMenuOpen(false);
    };

    const formatDate = (dateString) => {
        const timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true });
        return timeAgo;
    };

    if (isPlaceholder) {
        return (
            // Minimal gap, no padding, relying on parent's padding
            <div className="flex items-start gap-2"> 
                 <div className="mt-4 h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500/20 border border-purple-500/30">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0"> 
                    <div className="p-3 rounded-lg bg-purple-500/10">
                        <p className="font-semibold text-sm text-purple-300">{authorName}</p>
                        <p className="text-sm text-purple-200 mt-1 animate-pulse">{text}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Minimal gap, no padding, relying on parent's padding
        <div className="flex items-start gap-1"> 
            {isHaivenAI ? (
                <div className="ml-0.5 mt-4 h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500/20 border border-purple-500/30">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                </div>
            ) : (
                <div className="ml-0.5 mt-4 h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-purple)", color: "white" }}>
                    <img
                        src={profileImageUrl || '/default-avatar.png'}
                        alt="Current Profile Avatar"
                        className="rounded-full object-cover"
                    />
                </div>
            )}

            {/* Crucial fix: min-w-0 on the main content flex item */}
            <div className="flex-1 min-w-0"> 
                <div className={`p-2 mt-1 rounded-lg ${isHaivenAI ? 'bg-purple-500/10' : ''}`}>
                    <div className="flex items-baseline gap-2">
                        <p className={`font-semibold text-sm ${isHaivenAI ? 'text-purple-300' : 'main-text'}`}>{authorName}</p>
                        <p className="text-xs tertiary-text">{formatDate(createdAt)}</p>
                    </div>
                        {/* Added wordBreak: 'break-word' */}
                        <div style={{ wordBreak: 'break-word' }}> 
                            <p className="text-sm secondary-text mt-1">{text}</p>
                        </div>
                         {reactionSummary.length > 0 && (
                            <div className="relative mt-2" ref={reactionRef}>
                                    <button onMouseEnter={() => setShowReactionDetails(true)} onMouseLeave={() => setShowReactionDetails(false)} 
                                        className="flex items-center px-2 py-0 rounded-full border border-transparent hover:border-[var(--border-hover)]"
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                    >
                                        {reactionSummary.slice(0, 2).map(([emoji]) => (<span key={emoji} className="text-lg">{emoji}</span>))}
                                        <span className="text-xs main-text ml-1">{reactions.length}</span>
                                    </button>
                                    {showReactionDetails && (
                                        <div className="absolute bottom-full mb-2 p-2 rounded-lg shadow-lg border" style={{ backgroundColor: 'var(--bg-modal)', borderColor: 'var(--border-primary)' }}>
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
                    
                    {/* Action bar needs a fixed amount of space from the left, but NOT proportional to nesting depth. 
                        We use ml-1 to align it right next to the border line of the next nested comment. */}
                    <div className="mt-0 ml-2 md:ml-3 flex items-center justify-between">
                        <div className="relative flex items-center gap-3 text-xs tertiary-text">
                            <div className="relative" ref={emojiRef}>
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 rounded-full hover-interactive"><SmilePlus className="w-4 h-4" /></button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full mb-2 flex gap-2 p-2 rounded-lg card-secondary shadow-lg">
                                        {EMOJI_OPTIONS.map(emoji => ( <button key={emoji} onClick={() => handleReaction(emoji)} className="p-1 rounded-full text-lg hover-interactive transition-colors">{emoji}</button>))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleVote('UP')} className={`flex items-center gap-1 hover:text-green-500 transition-colors ${userVote === 'UP' ? 'text-green-500' : ''}`}><ThumbsUp className="w-4 h-4" />{likes > 0 && <span className="text-xs">{likes}</span>}</button>
                            <button onClick={() => handleVote('DOWN')} className={`hover:text-red-500 transition-colors ${userVote === 'DOWN' ? 'text-red-500' : ''}`}><ThumbsDown className="w-4 h-4" /></button>
                            <button 
                                onClick={() => setShowReplyBox(!showReplyBox)} 
                                disabled={isTruncated}
                                className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${isTruncated ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <CornerUpLeft className="w-4 h-4" /><span>Reply</span>
                            </button>
                            {replies && replies.length > 0 && !isTruncated && (
                                <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                    {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    <span>{replies.length} Replies</span>
                                </button>
                            )}
                        </div>
                         <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="tertiary-text hover:text-yellow-500 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                            {isMenuOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-32 rounded-md shadow-lg z-10 border" style={{ backgroundColor: "var(--bg-modal)", borderColor: "var(--border-primary)" }}>
                                    <button onClick={handleReport} className="flex items-center w-full px-3 py-2 text-sm text-left hover-interactive"><Flag className="w-4 h-4 mr-2" /> Report</button>
                                    {(user?.id === authorId || user?.role === 'ADMIN') && (
                                        <button onClick={handleDelete} className="flex items-center w-full px-3 py-2 text-sm text-left text-red-500 hover-interactive"><Trash2 className="w-4 h-4 mr-2" /> Delete</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {showReplyBox && (
                         // Reduced reply box indentation.
                         <form onSubmit={handleReplySubmit} className="ml-1 md:ml-3 mt-2 flex items-center gap-3">
                            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Replying to ${authorName}`} className="w-full form-input rounded-full py-2 px-4 text-sm" disabled={isSubmitting}/>
                            <button type="submit" className="p-2 rounded-full button-primary transition-opacity flex-shrink-0" disabled={isSubmitting}><Send className="w-5 h-5" /></button>
                        </form>
                    )}
                    {showReplies && replies && (
                        // CRITICAL FIX: Aggressive indentation (ml-2 on mobile) applied to this container.
                        <div className="md:ml-2 mt-2 space-y-2 border-l-2" style={{ borderColor: 'var(--border-secondary)' }}>
                            {/* Recursive call to Comment component */}
                            {replies.map(reply => (<Comment key={reply.id} comment={reply} onReplyCreated={onReplyCreated} onDelete={onDelete} />))}
                        </div>
                    )}
                    {isTruncated && (
                        <div className="mt-4 ml-2 md:ml-6 p-3 bg-[var(--interactive-hover)] rounded-lg text-sm tertiary-text font-medium border border-[var(--border-primary)]">
                            View deeper replies on a desktop application for better viewing experience.
                        </div>
                    )}
                </div>
            </div>
    );
};