const prisma = require('../../middleware/prisma');
const { Tags } = require('@prisma/client');

exports.getTags = async (req, res) => {
    try {
        
        const tagsList = Object.values(Tags);
        res.status(200).json(tagsList);

    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}