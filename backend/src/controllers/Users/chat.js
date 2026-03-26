const prisma = require('../../middleware/prisma');

exports.getChatSessions = async (req, res) => {
    const user = req.user;

    try {
        const chatSessions = await prisma.chatSession.findMany({
            where: { userId: user.id },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(chatSessions);
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.deleteChatSession = async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;

    try {
        const deleteResult = await prisma.chatSession.deleteMany({
            where: {
                id: parseInt(sessionId),
                userId: user.id, // Security check is part of the delete operation
            },
        });

        // deleteMany returns a `count` of deleted records. If 0, the session wasn't found or didn't belong to the user.
        if (deleteResult.count === 0) {
            return res.status(404).json({ error: 'Chat session not found or access denied.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.updateChatSessionTitle = async (req, res) => {
    const { sessionId } = req.params;
    const { title } = req.body;
    const user = req.user;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'A valid title is required' });
    }

    try {
        // This single operation will only update the record if BOTH the id and userId match.
        const updateResult = await prisma.chatSession.updateMany({
            where: {
                id: parseInt(sessionId),
                userId: user.id, // Security check is part of the update operation
            },
            data: {
                title: title.trim(),
            },
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ error: 'Chat session not found or access denied.' });
        }
        
        // Since updateMany doesn't return the updated record, we fetch it to send back.
        const updatedSession = await prisma.chatSession.findUnique({
            where: { id: parseInt(sessionId) }
        });

        res.status(200).json(updatedSession);
    } catch (error) {
        console.error('Error updating chat session title:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


exports.getChatMessages = async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;

    try {
        const chatSession = await prisma.chatSession.findFirst({
            where: {
                id: parseInt(sessionId), // Ensure sessionId is an integer
                userId: user.id,
            },
        });

        if (!chatSession) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { sessionId: chatSession.id },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                therapist: {
                    select: { name: true, imageUrl: true }
                }
            }
        });

        console.log("Fetched chat messages for session", sessionId, ":", messages);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}