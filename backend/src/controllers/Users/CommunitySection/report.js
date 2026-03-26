const prisma = require('../../../middleware/prisma');

exports.createReport = async (req, res) => {
    const { type, reason, contentId } = req.body;
    const reporterId = req.user.id;

    if (!['POST', 'COMMENT'].includes(type) || !reason || !contentId) {
        return res.status(400).json({ error: 'Type, reason, and contentId are required.' });
    }

    try {
        // Use a transaction to create the report and increment the content's report count
        const [report, _] = await prisma.$transaction([
            prisma.report.create({
                data: {
                    type,
                    reason,
                    reporterId,
                    postId: type === 'POST' ? contentId : undefined,
                    commentId: type === 'COMMENT' ? contentId : undefined,
                },
            }),
            // Increment the report count on the corresponding post or comment
            type === 'POST'
                ? prisma.post.update({ where: { id: contentId }, data: { reportCount: { increment: 1 } } })
                : prisma.comment.update({ where: { id: contentId }, data: { reportCount: { increment: 1 } } }),
        ]);

        res.status(201).json({ message: 'Report submitted successfully. Our moderation team will review it.' });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};