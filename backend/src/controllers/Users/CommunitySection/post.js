const prisma = require('../../../middleware/prisma');
const userController = require('../user');

exports.createPost = async (req, res) => {
    // 1. Get data from the request
    const { title, content, tags: tagsJSON } = req.body;
    const { communityId } = req.params; // The community to post in
    const userId = req.user.id; // The user creating the post

    // 2. Basic validation
    if (!title || !content || !communityId) {
        return res.status(400).json({ error: 'Title, content, and communityId are required.' });
    }

    let parsedTags = [];
    if (tagsJSON) {
        try {
            parsedTags = JSON.parse(tagsJSON);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid tags format. Must be a JSON array.' });
        }
    }

    try {
        // 3. (Optional but Recommended) Check if the community exists
        const community = await prisma.community.findUnique({
            where: { id: communityId },
        });

        if (!community) {
            return res.status(404).json({ error: 'Community not found.' });
        }

        const author = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!author) {
            return res.status(404).json({ error: 'Author not found.' });
        }

        // 4. Handle the optional image upload
        const imageUrl = req.file 
            ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/").replace('public/', '')}` 
            : null;

        // 5. Create the new post in the database
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                imageUrl,
                authorId: userId,
                communityId: communityId,
                tags: parsedTags,
            },
        });

        if (parsedTags && parsedTags.length > 0) {
            await userController._updateUserTagsLogic(userId, parsedTags, userController.TAG_WEIGHTS.CREATE_POST);
        }

        const formattedPost = ({
            ...newPost,
            profileImageUrl: author.profileImageUrl
        })

        // 6. Send a success response
        res.status(201).json({
            message: 'Post created successfully',
            post: formattedPost,
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this post.' });
        }
        if (post.authorId === userId || req.user.role === 'ADMIN') {
            await prisma.post.delete({
                where: { id: postId },
            });
            return res.status(200).json({ message: 'Post deleted successfully.' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.voteOnPost = async (req, res) => {
    const { postId } = req.params;
    const { voteType } = req.body; // Expecting 'UP' or 'DOWN'
    const userId = req.user.id;

    if (!['UP', 'DOWN'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type.' });
    }

    //We find the post first
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { tags: true } // Just get what we need
    });

    if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
    }

    const voteWhere = {
        userId_postId: {
            userId: userId,
            postId: postId,
        },
    };

    try {
        const existingVote = await prisma.postVote.findUnique({ where: voteWhere });

        let newUserVote = null; // 1. Variable to hold the final vote state

        if (existingVote) {
            if (existingVote.type === voteType) {
                // --- User is UNDOING their vote ---
                await prisma.postVote.delete({ where: voteWhere });
                // Decrement the appropriate count
                if (voteType === 'UP') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { upVoteCount: { decrement: 1 } },
                    });
                } else if (voteType === 'DOWN') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { downVoteCount: { decrement: 1 } },
                    });
                }
                newUserVote = null;
            } else {
                // --- User is CHANGING their vote ---
                await prisma.postVote.update({
                    where: voteWhere,
                    data: { type: voteType },
                });
                // We update the post counts accordingly
                if (voteType === 'UP') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { downVoteCount: { decrement: 1 }, upVoteCount: { increment: 1 } },
                    });
                } else if (voteType === 'DOWN') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { upVoteCount: { decrement: 1 }, downVoteCount: { increment: 1 } },
                    });
                }
                newUserVote = voteType;
            }
        } else {
            // --- User is CREATING a new vote ---
            await prisma.postVote.create({
                data: {
                    userId: userId,
                    postId: postId,
                    type: voteType,
                },
            });
            // Increment the appropriate count
            if (voteType === 'UP') {
                await prisma.post.update({
                    where: { id: postId },
                    data: { upVoteCount: { increment: 1 } },
                });
            } else if (voteType === 'DOWN') {
                await prisma.post.update({
                    where: { id: postId },
                    data: { downVoteCount: { increment: 1 } },
                });
            }
            newUserVote = voteType;
        }

        if (voteType === 'UP') {
            // Check if the data exists and then update the tags
            if (post.tags && post.tags.length > 0) {
                console.log("Updating user tags for UP vote:", post.tags);
                await userController._updateUserTagsLogic(userId, post.tags, userController.TAG_WEIGHTS.INTERACTION);
            }
        }

        // 4. Get the NEW, updated count
        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            select: { upVoteCount: true } // Only get the count we need
        });

        // 5. Send the correct response
        res.status(200).json({ 
            likeCount: updatedPost.upVoteCount, 
            userVote: newUserVote 
        });

    } catch (error) {
        console.error("Error processing vote:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.togglePostReaction = async (req, res) => {
    const { postId } = req.params;
    const { reaction } = req.body; // The emoji, e.g., '👍'
    const userId = req.user.id;

    if (!reaction) {
        return res.status(400).json({ error: 'Reaction is required.' });
    }

    // This is the unique identifier for a reaction based on your schema
    const uniqueIdentifier = {
        userId,
        postId,
    };

    try {
        const existingReaction = await prisma.postReaction.findUnique({
            where: { userId_postId: uniqueIdentifier },
        });

        if (existingReaction) {
            // A reaction from this user already exists on this post.
            if (existingReaction.reaction === reaction) {
                // The user clicked the same reaction again, so we delete it (toggle off).
                await prisma.postReaction.delete({
                    where: { userId_postId: uniqueIdentifier },
                });
            } else {
                // The user clicked a different reaction, so we update the existing one.
                await prisma.postReaction.update({
                    where: { userId_postId: uniqueIdentifier },
                    data: {
                        reaction: reaction, // Change the emoji
                    },
                });
            }
        } else {
            // No reaction exists, so we create a new one.
            await prisma.postReaction.create({
                data: {
                    userId,
                    postId,
                    reaction,
                },
            });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { tags: true },
        });

        // Check if the data exists and then update the tags
        if (post.tags && post.tags.length > 0) {
            await userController._updateUserTagsLogic(userId, post.tags, userController.TAG_WEIGHTS.INTERACTION);
        }

        // Return the updated list of all reactions for the post
        const reactions = await prisma.postReaction.findMany({
            where: { postId },
            select: { reaction: true, userId: true },
        });

        res.status(200).json(reactions);
    } catch (error) {
        console.error('Error toggling post reaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
