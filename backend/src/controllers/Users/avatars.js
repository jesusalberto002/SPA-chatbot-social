const prisma = require('../../middleware/prisma');
const { Tags } = require('@prisma/client');

exports.getAvatars = async (req, res) => {
    try {
        const avatars = await prisma.avatars.findMany({
            orderBy: { createdAt: 'asc'},
        });

        const formattedAvatars = avatars.map(avatar => ({
            id: avatar.id,
            name: avatar.name,
            url: avatar.url,
        }));

        res.status(200).json(formattedAvatars);
    } catch (error) {
        console.error('Error fetching avatars:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}