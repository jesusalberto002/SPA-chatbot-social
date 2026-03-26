const prisma = require('../../../middleware/prisma');
// Fetches a list of all communities that have a specific tag
exports.getCommunitiesByTag = async (req, res) => {
    const { tag } = req.params;

    if (!tag) {
        return res.status(400).json({ error: 'A tag is required.' });
    }

    try {
        const communities = await prisma.community.findMany({
            where: {
                tags: {
                    has: tag.toUpperCase(), // Use the tag from the URL, ensure it's uppercase to match the ENUM
                },
            },
            include: {
                _count: {
                    select: { members: true },
                },
            },
            orderBy: {
                members: {
                    _count: 'desc', // Show the most popular communities for that tag first
                },
            },
            take: 50, // Limit results for performance
        });

        const formattedCommunities = communities.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            memberCount: c._count.members,
        }));

        res.status(200).json(formattedCommunities);
    } catch (error) {
        console.error(`Error fetching communities for tag ${tag}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRecommendedCommunities = async (req, res) => {
    const userId = req.user.id;

    try {
        const userTagProfile = await prisma.userTagProfile.findUnique({
            where: { userId },
        });

        if (!userTagProfile || !userTagProfile.tags) {
            return res.status(200).json([]);
        }

        const userTags = userTagProfile.tags;

        console.log("User tags with scores:", userTags);

        // Since the tags are already sorted by score, we just take the top 5
        const topTags = userTags.slice(0, 5).map(t => t.tag);
        console.log("Top tags for recommendations:", topTags);

        if (topTags.length === 0) {
            return res.status(200).json([]);
        }

        const recommendedCommunities = await prisma.community.findMany({
            where: {
                tags: {
                    hasSome: topTags,
                },
                members: {
                    none: {
                        userId,
                    },
                },
            },
            include: {
                _count: {
                    select: { members: true },
                },
            },
            take: 10,
        });

        console.log("Raw recommended communities from DB:", recommendedCommunities);
        const formattedCommunities = recommendedCommunities.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            memberCount: c._count.members,
        }));

        console.log("Recommended communities based on tags:", formattedCommunities);

        res.status(200).json(formattedCommunities);
    } catch (error) {
        console.error('Error fetching recommended communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};