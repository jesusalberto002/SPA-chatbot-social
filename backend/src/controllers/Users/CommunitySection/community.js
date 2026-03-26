const prisma = require('../../../middleware/prisma');
const userController = require('../user');
// You don't need to require 'upload' here anymore as it's handled by the route

exports.createCommunity = async (req, res) => {
    const { name, description, tags: tagsJSON } = req.body;
    // IMPORTANT: userId from FormData will be a string, so parse it.
    const userId = req.user.id; 

    if (!name || !userId) {
        return res.status(400).json({ error: 'Name and userId are required.' });
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
        const existingCommunity = await prisma.community.findUnique({
            where: { name },
        });

        if (existingCommunity) {
            return res.status(400).json({ error: 'Community already exists' });
        }

        // Construct the URL. Replace backslashes with forward slashes for web compatibility.
        const imageUrl = req.file 
            ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/").replace('public/', '')}`
            : null;

        // Use a transaction to create the community and add the creator as a member
        const newCommunity = await prisma.$transaction(async (tx) => {
            // 1. Create the community
            const community = await tx.community.create({
                data: {
                    name,
                    description,
                    imageUrl,
                    creatorId: userId,
                    tags: parsedTags,
                },
            });

            // 2. Add the creator to the CommunityMember table as an OWNER
            await tx.communityMember.create({
                data: {
                    userId: userId,
                    communityId: community.id,
                    role: 'ADMIN', // Assumes you have an OWNER role in your CommunityRole enum
                },
            });

            return community;
        });

        if (parsedTags && parsedTags.length > 0) {
            await userController._updateUserTagsLogic(userId, parsedTags, userController.TAG_WEIGHTS.CREATE_COMMUNITY);
        }

        res.status(201).json({
            message: 'Community created successfully',
            community: newCommunity,
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.editCommunity = async (req, res) => {
    const { communityId } = req.params;
    const { name, description, tags: tagsJSON } = req.body; // Add tags
    const userId = req.user.id;

    try {
        const community = await prisma.community.findUnique({
            where: { id: communityId },
        });

        if (!community) {
            return res.status(404).json({ error: 'Community not found.' });
        }

        // Authorization check (this is correct)
        if (community.creatorId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not authorized to edit this community.' });
        }

        // --- START: NEW UPDATE LOGIC ---
        let updateData = {
            name,
            description,
        };

        // Check if new tags are provided
        if (tagsJSON) {
            try {
                updateData.tags = JSON.parse(tagsJSON);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid tags format. Must be a JSON array.' });
            }
        }

        // Check if a new banner image is uploaded
        if (req.file) {
            updateData.imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/").replace('public/', '')}`;
        }
        // --- END: NEW UPDATE LOGIC ---

        const updatedCommunity = await prisma.community.update({
            where: { id: communityId },
            data: updateData, // Use the dynamic updateData object
        });

        res.status(200).json({ message: 'Community updated successfully.', community: updatedCommunity });
    } catch (error) {
        console.error('Error editing community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    try {
        const community = await prisma.community.findUnique({
            where: { id: communityId },
        });

        if (!community) {
            return res.status(404).json({ error: 'Community not found.' });
        }

        if (community.creatorId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not authorized to delete this community.' });
        }

        await prisma.community.delete({
            where: { id: communityId },
        });

        res.status(200).json({ message: 'Community deleted successfully.' });
    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.joinCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.id; // From authenticator middleware

    try {
        // Check if the user is already a member
        const existingMember = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: userId,
                    communityId: communityId,
                },
            },
        });

        if (existingMember) {
            return res.status(409).json({ message: 'User is already a member of this community.' });
        }

        // If not a member, create the new membership record
        await prisma.communityMember.create({
            data: {
                userId: userId,
                communityId: communityId,
                role: 'MEMBER', // Default role upon joining
            },
        });

        const community = await prisma.community.findUnique({
            where: { id: communityId },
            select: { tags: true }
        });

        if (community.tags && community.tags.length > 0) {
            await userController._updateUserTagsLogic(userId, community.tags, userController.TAG_WEIGHTS.JOIN_COMMUNITY);
        }

        res.status(200).json({ message: 'Successfully joined the community.' });

    } catch (error) {
        // Handle cases where the community might not exist
        if (error.code === 'P2003') { // Foreign key constraint failed
            return res.status(404).json({ error: 'Community not found.' });
        }
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.leaveCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    try {
        // Find the community to check if the user is the creator
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true }
        });

        if (!community) {
            return res.status(404).json({ error: 'Community not found.' });
        }

        // Prevent the creator from leaving their own community
        if (community.creatorId === userId) {
            return res.status(403).json({ message: 'Creators cannot leave their own community.' });
        }

        // Delete the membership record for the user
        await prisma.communityMember.delete({
            where: {
                userId_communityId: {
                    userId: userId,
                    communityId: communityId,
                },
            },
        });

        res.status(200).json({ message: 'You have successfully left the community.' });

    } catch (error) {
        // This Prisma error code means the record to be deleted was not found
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'You are not a member of this community.' });
        }
        console.error('Error leaving community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// This function retrieves all communities a user is associated with.
exports.getUserCommunities = async (req, res) => {
    const userId = req.user.id;

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'A valid user ID is required.' });
    }

    try {
        // Step 1: Fetch all communities where the user is a member.
        const memberOfCommunities = await prisma.community.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                imageUrl: true,
                creatorId: true, // Include creatorId for filtering later
                _count: {
                    select: { members: true },
                },
            },
        });
        
        // Step 2: Format the data for the frontend cards
        const formattedCommunities = memberOfCommunities.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            creatorId: c.creatorId,
            memberCount: c._count.members,
        }));

        // Step 3: Filter the formatted list to get only the communities owned by the user
        const ownedCommunities = formattedCommunities.filter(c => c.creatorId === userId);

        // Step 4: Send the two separate arrays in the response
        res.status(200).json({
            allUserCommunities: formattedCommunities, // All communities user is a member of (includes owned)
            ownedCommunities: ownedCommunities,       // Only communities user created
        });

    } catch (error) {
        console.error('Error retrieving user communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getCommunityDataById = async (req, res) => {
    const { communityId } = req.params;
    const { postFilter = 'latest', page = '1' } = req.query; 
    const userId = req.user.id;
    const pageNum = parseInt(page, 10);
    const limit = 25;
    const skip = (pageNum - 1) * limit;

    try {
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                _count: {
                    select: { members: true }
                },
            },
        });

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const generalPostQuery = {
            where: { communityId: communityId },
            skip: skip,
            take: limit,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true,
                    },
                },
                _count: {
                    select: {
                        votes: { where: { type: 'UP' } },
                        comments: true,
                    }
                },
                votes: {
                    where: { userId: userId }
                },
                reactions: { // Include reactions
                    select: {
                        reaction: true,
                        userId: true,
                    },
                },
            }
        };

        if (postFilter === 'popular') {
            generalPostQuery.orderBy = {
                upVoteCount: 'desc',
            };
        }

        if (postFilter === 'latest') {
            generalPostQuery.orderBy = {
                createdAt: 'desc',
            };
        }

        const posts = await prisma.post.findMany(generalPostQuery);

        const formattedCommunityData = {
            id: community.id,
            name: community.name,
            description: community.description,
            imageUrl: community.imageUrl,
            memberCount: community._count.members,
            creatorId: community.creatorId,
            tags: community.tags || [],
        };

        const communityPosts = posts.map(post => {
            const userVote = post.votes[0] ? post.votes[0].type : null;
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                authorId: post.author.id,
                authorName: post.author.firstName + ' ' + post.author.lastName,
                profileImageUrl: post.author.profileImageUrl,
                likeCount: post.upVoteCount,
                userVote: userVote,
                reactions: post.reactions, // Pass reactions to the frontend
                commentsCount: post._count.comments,
            };
        });

        res.status(200).json({
            communityData: formattedCommunityData,
            communityPosts: communityPosts,
        });

        console.log(`Post Filter: ${postFilter}`);
        console.log('Community Posts:', communityPosts);

    } catch (error) {
        console.error('Error retrieving community:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchCommunities = async (req, res) => {
    const { term } = req.query;

    if (!term || term.trim() === '') {
        // It's good practice to return an empty array if the search term is empty
        return res.status(200).json([]);
    }

    try {
        const communities = await prisma.community.findMany({
            where: {
                name: {
                    contains: term,
                    mode: 'insensitive', // This makes the search case-insensitive
                },
            },
            // Include the counts of related members and posts
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true,
                    },
                },
            },
            take: 10, // Limit to the top 10 results for performance
        });

        // Format the results to be clean and ready for the frontend
        const formattedResults = communities.map(community => ({
            id: community.id,
            name: community.name,
            imageUrl: community.imageUrl,
            memberCount: community._count.members,
            postCount: community._count.posts,
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error searching communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a feed of the latest posts from all communities the user has joined
exports.getJoinedCommunitiesFeed = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    try {
        const posts = await prisma.post.findMany({
            where: {
                community: {
                    members: {
                        some: { userId: userId },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: skip,
            take: limit,
            include: {
                author: {
                    select: { firstName: true, lastName: true, profileImageUrl: true},
                },
                community: {
                    select: { name: true },
                },
                _count: {
                    select: {
                        votes: { where: { type: 'UP' } },
                        comments: true,
                    }
                },
                votes: {
                    where: { userId: userId }
                },
                reactions: { // Include reactions
                    select: {
                        reaction: true,
                        userId: true,
                    },
                },
            },
        });

        const formattedPosts = posts.map(post => {
            const userVote = post.votes[0] ? post.votes[0].type : null;
            return {
                ...post,
                authorName: `${post.author.firstName} ${post.author.lastName}`,
                profileImageUrl: post.author.profileImageUrl,
                communityName: post.community.name,
                likeCount: post._count.votes,
                commentsCount: post._count.comments,
                userVote: userVote,
            }
        });

        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error('Error fetching community feed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a list of the top 20 communities by member count
exports.getTopCommunities = async (req, res) => {
    try {
        const communities = await prisma.community.findMany({
            orderBy: {
                members: {
                    _count: 'desc', // Order by the number of members
                },
            },
            take: 20,
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });
        
        const formattedCommunities = communities.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            memberCount: c._count.members,
        }));

        res.status(200).json(formattedCommunities);
    } catch (error) {
        console.error('Error fetching top communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMostActiveCommunities = async (req, res) => {
    try {
        // Calculate the date 30 days ago to define our "active" window
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const communities = await prisma.community.findMany({
            // Order communities by the number of posts created within the last 30 days
            orderBy: {
                posts: {
                    _count: 'desc',
                },
            },
            where: {
                posts: {
                    some: {
                        createdAt: {
                            gte: thirtyDaysAgo,
                        },
                    },
                },
            },
            take: 10, // Limit to the top 10 most active
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });
        
        const formattedCommunities = communities.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            memberCount: c._count.members,
        }));

        res.status(200).json(formattedCommunities);
    } catch (error) {
        console.error('Error fetching most active communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};