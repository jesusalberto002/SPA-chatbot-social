const prisma = require('../../middleware/prisma');

exports.getTherapists = async (req, res) => {
    console.log("getTherapists controller called");
    try {
        const therapists = await prisma.therapist.findMany ({
            orderBy: { id: 'asc' },
        })

        res.status(200).json(therapists);

    } catch (error) {
        console.error('Error fetching therapists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.updateTherapist = async (req, res) => {
    const { therapistId } = req.body;
    console.log(`Received request to update therapist to ID ${therapistId}`);
    const userId = req.user.id;
    console.log(`Updating therapist for user ID ${userId}`);
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                therapist: { 
                    // This will replace the existing therapist with the new one
                    // If you want to allow multiple therapists, you would use connect instead of set
                    set: [{ id: therapistId }],
                 },
            },
            include: {
                therapist: true,
            },
        }) 
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating therapist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getSelectedTherapist = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                therapist: true,
            },
        })

        const therapists = user.therapist;

        res.status(200).json(therapists);
    } catch (error) {
        console.error('Error fetching selected therapist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}