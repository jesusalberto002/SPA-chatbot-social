const prisma = require('../../middleware/prisma');

// A helper function to get content details
const getContentDetails = async (reports) => {
    const postIds = reports.filter(r => r.type === 'POST').map(r => r.postId);
    const commentIds = reports.filter(r => r.type === 'COMMENT').map(r => r.commentId);

    const postsPromise = postIds.length 
        ? prisma.post.findMany({ 
            where: { id: { in: postIds } }, 
            // Switch from 'include' to 'select'
            select: {
                id: true,
                content: true,
                authorId: true,
                reportCount: true,
                imageUrl: true, // Now you can select the scalar field
                author: {       // And you can still select relations
                    select: { 
                        id: true, 
                        email: true 
                    } 
                }
            } 
        }) 
        : Promise.resolve([]);
    const commentsPromise = commentIds.length ? prisma.comment.findMany({ where: { id: { in: commentIds } }, include: { author: { select: { id: true, email: true } } } }) : Promise.resolve([]);
    
    const [posts, comments] = await Promise.all([
        postsPromise,
        commentsPromise
    ]);

    const postsById = new Map(posts.map(p => [p.id, p]));
    const commentsById = new Map(comments.map(c => [c.id, c]));

    return { postsById, commentsById, };
};


exports.getReports = async (req, res) => {
    const { page = 1, limit = 10, status = 'PENDING' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = status === 'ALL' ? {} : { status };

    try {
        // Step 1: Aggregate reports to find the most reported content
        const reportedContentGroups = await prisma.report.groupBy({
            by: ['postId', 'commentId'],
            where: whereClause,
            _count: {
                reporterId: true, // Counts unique reporters
            },
            orderBy: {
                _count: {
                    reporterId: 'desc',
                },
            },
            skip,
            take: limitNum,
        });

        // Step 2: Get the total count for pagination
        const totalGroups = await prisma.report.groupBy({
            by: ['postId', 'commentId'],
            where: whereClause,
        });
        const totalItems = totalGroups.length;

        if (reportedContentGroups.length === 0) {
            return res.status(200).json({ reports: [], totalPages: 0, currentPage: 1 });
        }
        
        // Step 3: Fetch all individual reports for the content groups on the current page
        const detailedReports = await prisma.report.findMany({
            where: {
                OR: reportedContentGroups.map(group => ({
                    postId: group.postId,
                    commentId: group.commentId
                })),
                ...whereClause
            },
            include: {
                reporter: { select: { id: true, email: true } },
            },
        });

        const { postsById, commentsById } = await getContentDetails(detailedReports);

        // Step 4: Combine the data into a clean, grouped structure for the frontend
        const groupedForFrontend = reportedContentGroups.map(group => {
            const contentId = group.postId || group.commentId;
            const type = group.postId ? 'POST' : 'COMMENT';
            const individualReports = detailedReports.filter(r => r.postId === group.postId && r.commentId === group.commentId);
            const contentDetails = type === 'POST' ? postsById.get(contentId) : commentsById.get(contentId);
            
            return {
                contentId,
                type,
                content: contentDetails?.content || contentDetails?.text,
                author: contentDetails?.author,
                uniqueReportCount: group._count.reporterId,
                imageUrl: contentDetails?.imageUrl,
                reports: individualReports,
            };
        });

        res.status(200).json({
            reports: groupedForFrontend,
            totalPages: Math.ceil(totalItems / limitNum),
            currentPage: pageNum,
        });

    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Dismiss a report as invalid
exports.dismissContentReports = async (req, res) => {
    const { contentId, type } = req.body;

    const whereClause = type === 'POST' ? { postId: contentId } : { commentId: contentId };

    try {
        await prisma.report.updateMany({
            where: { ...whereClause, status: 'PENDING' },
            data: { status: 'DISMISSED' },
        });

        res.status(200).json({ message: 'All pending reports for this content have been dismissed.' });
    } catch (error) {
        console.error("Error dismissing content reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Resolve all reports and delete the content ---
exports.resolveContentReports = async (req, res) => {
    const { contentId, type } = req.body;

    const whereClause = type === 'POST' ? { postId: contentId } : { commentId: contentId };

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Mark all pending reports as RESOLVED
            await tx.report.updateMany({
                where: { ...whereClause, status: 'PENDING' },
                data: { status: 'RESOLVED' },
            });

            // 2. Delete the actual content
            if (type === 'POST') {
                await tx.post.delete({ where: { id: contentId } });
            } else {
                await tx.comment.delete({ where: { id: contentId } });
            }
        });

        res.status(200).json({ message: 'Content has been removed and all reports resolved.' });
    } catch (error) {
        console.error("Error resolving content reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};