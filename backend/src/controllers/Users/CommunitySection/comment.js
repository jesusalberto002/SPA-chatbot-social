const prisma = require('../../../middleware/prisma');
const userController = require('../user');

// A recursive function to delete a comment and all its replies
async function deleteCommentAndReplies(commentId, tx) {
    // Find all direct replies to the current comment
    const replies = await tx.comment.findMany({
        where: { replyToId: commentId },
        select: { id: true },
    });

    // Recursively delete each reply and its children
    for (const reply of replies) {
        await deleteCommentAndReplies(reply.id, tx);
    }

    // After all children are deleted, delete the comment itself
    await tx.comment.delete({
        where: { id: commentId },
    });
}

exports.createComment = async (req, res) => {
    // 1. Expect 'text' from the body to match the frontend
    const { text } = req.body;
    const { postId } = req.params;
    const user = req.user;
    const userId = req.user.id;

    if (!postId || !text || text.trim() === '') {
        return res.status(400).json({ error: 'Post ID and comment text are required.' });
    }

    try {
        // Post ID is a string (CUID)
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await prisma.comment.create({
            data: {
                text: text,           // Use the correct field name 'text'
                postId: post.id,
                authorId: user.id, // The schema uses 'authorId' for the relation
            },
            include: { // Also include the author's name in the response
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true,
                    }
                }
            }
        });

        if (post.tags && post.tags.length > 0) {
            await userController._updateUserTagsLogic(userId, post.tags, userController.TAG_WEIGHTS.COMMENT_POST);
        }
        
        // Format the response to include authorName, so the frontend can display it
        const formattedComment = {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            authorName: `${comment.author.firstName} ${comment.author.lastName}`,
            profileImageUrl: comment.author.profileImageUrl,
            postId: comment.postId,
        }

        res.status(201).json(formattedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createReply = async (req, res) => {
    const { parentCommentId } = req.params;
    const { text } = req.body; // We only need the text now
    const userId = req.user.id;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text is required.' });
    }

    try {
        // Find the parent comment to get its postId
        const parentComment = await prisma.comment.findUnique({
            where: { id: parentCommentId },
            select: { postId: true } // We only need the postId from the parent
        });

        if (!parentComment) {
            return res.status(404).json({ error: 'Parent comment not found.' });
        }

        const newReply = await prisma.comment.create({
            data: {
                text: text.trim(),
                postId: parentComment.postId, // Use the postId from the parent comment
                authorId: userId,
                replyToId: parentCommentId, // This links it to the parent
            },
            include: {
                author: { 
                    select: { 
                        firstName: true, 
                        lastName: true, 
                        profileImageUrl: true, 
                    } 
                },
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: parentComment.postId },
            select: { tags: true },
        });

        // Check if the data exists and then update the tags
        if (post.tags && post.tags.length > 0) {
            await userController._updateUserTagsLogic(userId, post.tags, userController.TAG_WEIGHTS.JOIN_COMMUNITY);
        }

        // Format the response consistently
        const formattedReply = {
            id: newReply.id,
            text: newReply.text,
            createdAt: newReply.createdAt,
            authorName: `${newReply.author.firstName} ${newReply.author.lastName}`,
            profileImageUrl: newReply.author.profileImageUrl,
            postId: newReply.postId, // Also return the postId
            replies: [], // A new reply has no replies of its own yet
        };

        res.status(201).json(formattedReply);
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        if (comment.authorId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not authorized to delete this comment.' });
        }

        // Use a transaction to ensure all or nothing is deleted
        await prisma.$transaction(async (tx) => {
            await deleteCommentAndReplies(commentId, tx);
        });

        res.status(200).json({ message: 'Comment and all replies deleted successfully.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Fetches a single post and its entire nested comment tree
// In your comment controller file

// Helper function to format comments and their replies recursively
const formatCommentsWithVotes = (comments, userId) => {
    return comments.map(comment => {
        // 1. Calculate the like count from the _count relation
        const likeCount = comment._count.votes;

        // 2. Determine the current user's vote ('UP', 'DOWN', or null)
        const userVote = comment.votes.length > 0 ? comment.votes[0].type : null;

        // 3. Recursively format the replies
        const formattedReplies = comment.replies ? formatCommentsWithVotes(comment.replies, userId) : [];

        // 4. Return the structured comment object
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            authorName: `${comment.author.firstName} ${comment.author.lastName}`,
            authorId: comment.author.id,
            profileImageUrl: comment.author.profileImageUrl,
            postId: comment.postId,
            reactions: comment.reactions,
            replies: formattedReplies,
            likeCount: likeCount,
            userVote: userVote,
            isTruncated: comment.isTruncated || false,
        };
    });
};

// Fetches a single post and its entire nested comment tree
exports.getPostComments = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const MAX_DEPTH = parseInt(req.query.depth, 10) || 10;

    try {
        // This function recursively fetches replies for a given comment ID
        const fetchRepliesRecursive = async (commentId, currentDepth) => {
            const replies = await prisma.comment.findMany({
                where: { replyToId: commentId },
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true, } },
                    // IMPORTANT: Get the count of 'UP' votes
                    _count: { select: { votes: { where: { type: 'UP' } } } },
                    // IMPORTANT: Get the current user's vote
                    votes: { where: { userId: userId } },
                    reactions: { select: { reaction: true, userId: true } },
                }
            });

            for (const reply of replies) {
                if (currentDepth >= MAX_DEPTH) {
                    // 2. Stop recursion and dynamically add the 'isTruncated' flag
                    reply.replies = [];
                    reply.isTruncated = true; 
                } else {
                    // 3. Continue recursion
                    reply.replies = await fetchRepliesRecursive(reply.id, currentDepth + 1);
                    // Add the flag here too, just to be explicit (it will be false)
                    reply.isTruncated = false;
                }
            }
            return replies;
        };

        const topLevelComments = await prisma.comment.findMany({
            where: { postId: postId, replyToId: null },
            orderBy: { createdAt: 'desc' },
            skip: skip,
            take: limit,
            include: {
                author: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
                // Get the count of 'UP' votes
                _count: { select: { votes: { where: { type: 'UP' } } } },
                // Get the current user's vote
                votes: { where: { userId: userId } },
                reactions: { select: { reaction: true, userId: true } }
            }
        });

        // Fetch all nested replies for each top-level comment
        for (const comment of topLevelComments) {
            comment.replies = await fetchRepliesRecursive(comment.id, 1);
        }

        // Use the helper function to format the entire tree
        const formattedComments = formatCommentsWithVotes(topLevelComments, userId);
        console.log("Formatted comments with votes:", formattedComments[0]);
        res.status(200).json({ comments: formattedComments });

    } catch (error) {
        console.error("Error fetching post comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.toggleCommentReaction = async (req, res) => {
    const { commentId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    if (!reaction) {
        return res.status(400).json({ error: 'Reaction is required.' });
    }

    // The unique identifier based on your schema
    const uniqueIdentifier = {
        userId,
        commentId,
    };

    try {
        const existingReaction = await prisma.commentReaction.findUnique({
            where: { userId_commentId: uniqueIdentifier },
        });

        if (existingReaction) {
            // A reaction from this user already exists.
            if (existingReaction.reaction === reaction) {
                // The user clicked the same emoji again, so delete it (toggle off).
                await prisma.commentReaction.delete({
                    where: { userId_commentId: uniqueIdentifier },
                });
            } else {
                // The user clicked a different emoji, so update the reaction.
                await prisma.commentReaction.update({
                    where: { userId_commentId: uniqueIdentifier },
                    data: {
                        reaction: reaction,
                    },
                });
            }
        } else {
            // No reaction exists, so create a new one.
            await prisma.commentReaction.create({
                data: {
                    userId,
                    commentId,
                    reaction,
                },
            });
        }

        // Return the updated list of all reactions for the comment
        const reactions = await prisma.commentReaction.findMany({
            where: { commentId },
            select: { reaction: true, userId: true },
        });

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: {
                // We only need the 'post' relation from the comment
                post: {
                    select: {
                        // And from that post, we only need the 'tags'
                        tags: true,
                    },
                },
            },
        });

        // the 'comment' object will look like this:
        // { post: { tags: ['HEALTH', 'FITNESS'] } }

        // Check if the data exists and then update the tags
        if (comment && comment.post && comment.post.tags.length > 0) {
            await userController._updateUserTagsLogic(
                userId,
                comment.post.tags,
                userController.TAG_WEIGHTS.INTERACTION
            );
        }

        res.status(200).json(reactions);
    } catch (error) {
        console.error('Error toggling comment reaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.voteOnComment = async (req, res) => {
    const { commentId } = req.params;
    const { voteType } = req.body; // Expecting 'UP' or 'DOWN'
    const userId = req.user.id;

    if (!['UP', 'DOWN'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type.' });
    }

    const voteWhere = {
        userId_commentId: {
            userId: userId,
            commentId: commentId,
        },
    };

    try {
        const existingVote = await prisma.commentVote.findUnique({ where: voteWhere });

        let newUserVote = null;

        if (existingVote) {
            if (existingVote.type === voteType) {
                // User is undoing their vote
                await prisma.commentVote.delete({ where: voteWhere });
                newUserVote = null;
            } else {
                // User is changing their vote
                await prisma.commentVote.update({
                    where: voteWhere,
                    data: { type: voteType },
                });
                newUserVote = voteType;
            }
        } else {
            // User is creating a new vote
            await prisma.commentVote.create({
                data: {
                    userId: userId,
                    commentId: commentId,
                    type: voteType,
                },
            });
            newUserVote = voteType;
        }

        // Calculate the new like count for the comment
        const likeCount = await prisma.commentVote.count({
            where: {
                commentId: commentId,
                type: 'UP',
            },
        });

        if (voteType === 'UP') {
            // Update user tags recommendation weights based on the comment's post tags
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
                select: {
                    // We only need the 'post' relation from the comment
                    post: {
                        select: {
                            // And from that post, we only need the 'tags'
                            tags: true,
                        },
                    },
                },
            });

            // the 'comment' object will look like this:
            // { post: { tags: ['HEALTH', 'FITNESS'] } }

            // Check if the data exists and then update the tags
            if (comment && comment.post && comment.post.tags.length > 0) {
                await userController._updateUserTagsLogic(
                    userId,
                    comment.post.tags,
                    userController.TAG_WEIGHTS.INTERACTION
                );
            }
        }

        // Return the new count and the user's vote status
        res.status(200).json({ likeCount, userVote: newUserVote });

    } catch (error) {
        console.error("Error processing comment vote:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};