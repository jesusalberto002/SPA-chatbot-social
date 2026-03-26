const prisma = require('../../middleware/prisma');

exports.getAllUsersMetrics = async (req, res) => {
    let days = parseInt(req.query.days, 10);
    if (isNaN(days) || days <= 0) {
        days = 7; // Default to 7 if the parameter is invalid, not provided, or zero/negative
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    dateLimit.setHours(0, 0, 0, 0); // Set time to midnight (start of the day)

    try {
        // Prepare all three database queries to run in parallel
        const [totalUsers, newUsers, activeUsers] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    createdAt: { 
                        gte: dateLimit, 
                    }
                }
            }),
            prisma.user.count({
                where: {
                    lastActiveAt: { 
                        gte: dateLimit, 
                    }
                }
            })
        ]);

        console.log("Total Users:", totalUsers);
        console.log("New Users in last", days, "days:", newUsers);
        console.log("Active Users in last", days, "days:", activeUsers);

        // Send all the data back in a single, clean JSON object
        res.status(200).json({
            totalUsers,
            newUsers,
            activeUsers
        });

    } catch (error) {
        console.error("Error fetching user metrics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAllUsersChartsData = async (req, res) => {

    try {
        let { timeRange = '7d', startDate, endDate } = req.query;

        let finalStartDate, finalEndDate;

        if (startDate && endDate) {
            // If specific dates are provided, calculate the range in days
            finalStartDate = new Date(startDate);
            finalEndDate = new Date(endDate);
            console.log("Using custom date range:", {
                startDate: finalStartDate.toISOString(),
                endDate: finalEndDate.toISOString(),
                finalStartDate,
                finalEndDate,
            });
        } else {
            timeRange = timeRange || '7d'; // Default to 7 days if no range is specified
            const days = parseInt(timeRange.replace('d', ''), 10);
            finalEndDate = new Date();
            finalStartDate = new Date();
            finalStartDate.setDate(finalEndDate.getDate() - days);
        }

        const totalDurationInMs = finalEndDate.getTime() - finalStartDate.getTime();

        const intervalMs = Math.max(totalDurationInMs / 9, 1); // Ensure at least 1 ms interval

        const dataPointPromises = [];

        // console.log("Fetching users charts data for range:", {
        //     startDate: finalStartDate.toISOString(),
        //     endDate: finalEndDate.toISOString(),
        //     intervalMs
        // });

        for (let i = 0; i < 10; i++){
            const currentPointDate = new Date(finalStartDate.getTime() + i * intervalMs);
            const previousPointDate = new Date(currentPointDate.getTime() - intervalMs);

            const queryPromise = Promise.all([
                prisma.user.count({ where: { createdAt: { lte: currentPointDate } } }),
                prisma.user.count({ where: { createdAt: { gte: previousPointDate, lt: currentPointDate } } }),
                prisma.user.count({ where: { lastActiveAt: { gte: previousPointDate, lt: currentPointDate } } })
            ]).then(([totalUsers, newUsers, activeUsers]) => ({
                date: currentPointDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                totalUsers,
                newUsers,
                activeUsers
            }));
            dataPointPromises.push(queryPromise);
        }

        const chartData = await Promise.all(dataPointPromises);
        res.status(200).json(chartData);
        //console.log("Users charts data fetched successfully:", chartData);

    } catch (error) {
        console.error("Error fetching users charts data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.searchAllUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const searchTerm = search.trim();

    let where = {};

    // If a search term is provided, build the dynamic query
    if (searchTerm) {
        const searchConditions = [
            // Search by email (case-insensitive)
            { email: { contains: searchTerm, mode: 'insensitive' } },
            // Search by first name (case-insensitive)
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            // Search by last name (case-insensitive)
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
        ];

        // Also search by ID if the term is a valid number
        const searchId = parseInt(searchTerm, 10);
        if (!isNaN(searchId)) {
            searchConditions.push({ id: searchId });
        }

        where = { OR: searchConditions };
    }

    try {
        // Run two queries in parallel for efficiency
        const [users, totalUsers] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    subscriptions: {
                        where: { status: 'ACTIVE' },
                        include: { tier: true },
                    },
                    // Fetch the most recent suspension record for each user
                    suspension: {
                        orderBy: { startDate: 'desc' },
                        take: 1,
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        // Format the user data correctly
        const formattedUsers = users.map(user => {
            const activeSubscription = user.subscriptions[0];
            const latestSuspension = user.suspension[0];
            let status = 'ACTIVE'; // Default status

            if (latestSuspension) {
                // Check for a permanent ban
                if (latestSuspension.status === 'BANNED') {
                    status = 'BANNED';
                }
                // Check for a temporary suspension that has not expired
                else if (latestSuspension.status === 'SUSPENDED') {
                    const now = new Date();
                    const endDate = latestSuspension.endDate ? new Date(latestSuspension.endDate) : null;
                    if (!endDate || endDate > now) {
                        status = 'SUSPENDED';
                    }
                }
                // If the status is 'LIFTED' or an old 'SUSPENDED' record, the user is considered ACTIVE.
            }

            return {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email,
                subscription: activeSubscription ? activeSubscription.tier.name : 'FREE',
                status: status,
                createdAt: user.createdAt,
            };
        });

        res.status(200).json({
            users: formattedUsers,
            totalPages: Math.ceil(totalUsers / limitNum),
            totalUsers,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.suspendUserCommunity = async (req, res) => {
    const { userId } = req.params;
    const { reason, duration } = req.body;
    const adminId = req.user.id; // Assuming the admin's ID is available in req.user

    if (!reason || !duration) {
        return res.status(400).json({ message: 'Reason and duration are required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId, 10) },
            include: { suspension: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.suspension && user.suspension.status === 'SUSPENDED') {
            return res.status(400).json({ message: 'User is already suspended.' });
        }

        let endDate = null;
        let status = null;
        if (duration !== 'indefinite') {
            const durationMap = {
                '1d': 1,
                '3d': 3,
                '7d': 7,
                '14d': 14,
                '1m': 30,
            };
            const days = durationMap[duration];
            if (days) {
                endDate = new Date();
                endDate.setDate(endDate.getDate() + days);
                status = 'SUSPENDED';
            }
        } else {
            status = 'BANNED';
        }

        await prisma.userCommunitySuspension.create({
            data: {
                userId: user.id,
                adminId,
                reason,
                status,
                startDate: new Date(),
                endDate,
            },
        });

        res.status(200).json({ message: 'User suspended successfully.' });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.liftSuspension = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the most recent active suspension for the user
        const activeSuspension = await prisma.userCommunitySuspension.findFirst({
            where: {
                userId: parseInt(userId, 10),
                status: { in: ['SUSPENDED', 'BANNED'] },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        if (!activeSuspension) {
            return res.status(404).json({ message: 'No active suspension found for this user.' });
        }

        // Update the suspension status to 'LIFTED'
        const updatedSuspension = await prisma.userCommunitySuspension.update({
            where: {
                id: activeSuspension.id,
            },
            data: {
                status: 'LIFTED',
                // Optionally, you can set the endDate to now to mark when it was lifted
                endDate: new Date(), 
            },
        });

        res.status(200).json({ 
            message: 'User suspension has been lifted successfully.',
            suspension: updatedSuspension 
        });

    } catch (error) {
        console.error('Error releasing suspension:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
