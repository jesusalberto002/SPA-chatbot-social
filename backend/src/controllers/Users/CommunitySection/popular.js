const prisma = require('../../../middleware/prisma');
// Fetches the most used tags to display on the "Popular" page
exports.getPopularTags = async (req, res) => {
    try {
        // This query groups posts by their tags, counts them, and orders by the most popular
        const popularPostTags = await prisma.post.groupBy({
            by: ['tags'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 10, // Get the top 10 trending tags
        });
        
        // The result is complex, so we need to flatten and count it
        const tagCounts = popularPostTags.reduce((acc, { tags, _count }) => {
            tags.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + _count.id;
            });
            return acc;
        }, {});

        const sortedTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
            
        console.log("Popular tags fetched:", sortedTags);
        res.status(200).json(sortedTags);
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTrendingPosts = async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userId = req.user.id;

    try {
        // 1. Fetch all posts with necessary data for display
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true,
                    },
                },
                community: {
                    select: {
                        name: true,
                    }
                },
                // Get TOTAL counts for display on the card
                _count: {
                    select: {
                        votes: { where: { type: 'UP' } },
                        comments: true,
                    },
                },
                // Get the current user's vote status
                votes: {
                    where: { userId: userId },
                    select: { type: true }
                },
                // Get all reactions for display
                reactions: {
                    select: {
                        reaction: true,
                        userId: true,
                    },
                },
            },
        });

        // 2. Calculate the trending score for each post
        const postsWithInteractionCount = await Promise.all(posts.map(async (post) => {
            // Count comments for this post within the last 7 days
            const recentCommentsCount = await prisma.comment.count({
                where: {
                    postId: post.id,
                    createdAt: {
                        gte: sevenDaysAgo,
                    },
                }
            });

            // Count reactions for this post within the last 7 days
            const recentReactionsCount = await prisma.postReaction.count({
                where: {
                    postId: post.id,
                    createdAt: {
                        gte: sevenDaysAgo,
                    },
                }
            });

            const recentVotesCount = await prisma.postVote.count({
                where: {
                    postId: post.id,
                    type: 'UP',
                    createdAt: {
                        gte: sevenDaysAgo,
                    },
                }
            });

            // The trending score is the sum of ALL upvotes + RECENT comments + RECENT reactions
            const interactionCount = recentVotesCount + recentCommentsCount + recentReactionsCount;

            return {
                ...post,
                interactionCount, // The calculated trending score
                userVote: post.votes.length > 0 ? post.votes[0].type : null,
                authorName: `${post.author.firstName} ${post.author.lastName}`,
                profileImageUrl: post.author.profileImageUrl,
                communityName: post.community.name,
                likeCount: post._count.votes, // Total upvotes for display
                commentsCount: post._count.comments, // Total comments for display
            };
        }));

        // 3. Sort posts by the calculated interaction score
        const sortedPosts = postsWithInteractionCount.sort(
            (a, b) => b.interactionCount - a.interactionCount
        );

        // 4. Return only the top 10 posts
        const top10Posts = sortedPosts.slice(0, 10);

        res.status(200).json(top10Posts);
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTrendingCommunities = async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
        // Step 1: Efficiently aggregate recent activity data in parallel
        const [
            newPostsCounts,
            newMembersCounts,
            recentComments,
            recentVotes
        ] = await Promise.all([
            // Count posts created in each community in the last 7 days
            prisma.post.groupBy({
                by: ['communityId'],
                where: { createdAt: { gte: sevenDaysAgo } },
                _count: { _all: true },
            }),
            // Count new members who joined each community in the last 7 days
            // ADJUSTED: Uses CommunityMember model and joinedAt field
            prisma.communityMember.groupBy({
                by: ['communityId'],
                where: { joinedAt: { gte: sevenDaysAgo } },
                _count: { _all: true },
            }),
            // Fetch all recent comments to associate them with their communities
            prisma.comment.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { post: { select: { communityId: true } } },
            }),
            // Fetch all recent upvotes to associate them with their communities
            prisma.postVote.findMany({
                where: { 
                    createdAt: { gte: sevenDaysAgo },
                    type: 'UP',
                },
                select: { post: { select: { communityId: true } } },
            })
        ]);

        // Step 2: Process the aggregated data into easy-to-use Maps
        const newPostsMap = new Map(newPostsCounts.map(c => [c.communityId, c._count._all]));
        const newMembersMap = new Map(newMembersCounts.map(c => [c.communityId, c._count._all]));
        const newCommentsMap = recentComments.reduce((acc, comment) => {
            const communityId = comment.post.communityId;
            acc.set(communityId, (acc.get(communityId) || 0) + 1);
            return acc;
        }, new Map());
        const newVotesMap = recentVotes.reduce((acc, vote) => {
            const communityId = vote.post.communityId;
            acc.set(communityId, (acc.get(communityId) || 0) + 1);
            return acc;
        }, new Map());

        // Step 3: Fetch all communities with their total member count
        // CORRECT: The relation on Community is named `members`, so this works perfectly.
        const allCommunities = await prisma.community.findMany({
             include: {
                _count: {
                    select: { members: true }
                }
             }
        });

        // Step 4: Calculate score for each community
        const communitiesWithScores = allCommunities.map(community => {
            const postsScore = newPostsMap.get(community.id) || 0;
            const membersScore = newMembersMap.get(community.id) || 0;
            const commentsScore = newCommentsMap.get(community.id) || 0;
            const votesScore = newVotesMap.get(community.id) || 0;

            const trendingScore = (postsScore * 1.5) + (commentsScore * 1.2) + votesScore + (membersScore * 2);

            return {
                id: community.id,
                name: community.name,
                imageUrl: community.imageUrl,
                memberCount: community._count.members,
                trendingScore, // Keep score for sorting
            };
        });

        // Step 5: Sort by score, take top 10, and format the final output
        const formattedCommunities = communitiesWithScores
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, 10)
            .map(({ trendingScore, ...communityData }) => communityData); // Remove trendingScore

        res.status(200).json(formattedCommunities);
    } catch (error) {
        console.error('Error fetching trending communities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
