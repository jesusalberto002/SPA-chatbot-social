const prisma = require('../../middleware/prisma');

exports.getTotalSubsMetrics = async (req, res) => {
    try {
        let days = parseInt(req.query.days, 10);
        if (isNaN(days) || days <= 0) {
            days = 7; // Default to 7 if the parameter is invalid, not provided, or zero/negative
        }

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        dateLimit.setHours(0, 0, 0, 0); // Set time to midnight (start of the day)
        // --- Step 1: Get all possible paid tier names from the database ---
        const allPaidTiers = await prisma.subscriptionTier.findMany({
            where: {
                name: {
                    not: 'FREE',
                },
            },
            select: {
                name: true, // We only need the names
            },
        });

        // --- Step 2: Get the active subscriptions ---
        const subscriptions = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                tier: {
                    name: {
                        not: 'FREE',
                    },
                },
            },
            include: {
                tier: true,
            },
        });

        // --- Step 3: Prepare the metrics object with all tiers initialized to zero ---
        const tierMetrics = {};
        for (const tier of allPaidTiers) {
            tierMetrics[tier.name] = { count: 0, revenue: 0 };
        }

        let totalCount = 0;
        let totalRevenue = 0;

        // --- Step 4: Loop through the active subscriptions to update the metrics ---
        for (const sub of subscriptions) {
            const tierName = sub.tier.name;
            const tierPrice = Number(sub.tier.price || 0);

            // Update overall totals
            totalCount += 1;
            totalRevenue += tierPrice;

            // Update the specific tier's metrics
            if (tierMetrics[tierName]) {
                tierMetrics[tierName].count += 1;
                tierMetrics[tierName].revenue += tierPrice;
            }
        }

        //Handle dated metrics (total and new subscriptions)
        const [totalDatedSubscriptions, newDatedSubscriptions] = await Promise.all([
            // Promise 1: Get the total count of all active subscriptions
            prisma.subscription.count({
                where: {
                    status: 'ACTIVE',
                    startDate: {
                        lte: dateLimit,
                    },
                }
            }),
            // Promise 2: Get the count of new subscriptions since the date limit
            prisma.subscription.count({
                where: {
                    status: 'ACTIVE',
                    startDate: {
                        gte: dateLimit,
                    },
                },
            })
        ]);
        
        res.status(200).json({
            totalMetrics: { totalCount, totalRevenue, totalDatedSubscriptions, newDatedSubscriptions }, 
            tierMetrics: tierMetrics
        });

        console.log(`Total Subscriptions Metrics in ${days} days:`, {
            totalDatedSubscriptions, 
            newDatedSubscriptions,
        });


    } catch (error) {
        console.error('Error fetching paid subscriptions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSubsChartData = async (req, res) => {
    try {
        let { timeRange = '7d', startDate, endDate } = req.query;

        // --- 1. Determine Date Range (your existing logic is good) ---
        let finalStartDate, finalEndDate;
        if (startDate && endDate) {
            finalStartDate = new Date(startDate);
            finalEndDate = new Date(endDate);
        } else {
            const days = parseInt(timeRange.replace('d', ''), 10);
            finalEndDate = new Date();
            finalStartDate = new Date();
            finalStartDate.setDate(finalEndDate.getDate() - days);
        }

        const totalDurationInMs = finalEndDate.getTime() - finalStartDate.getTime();
        const intervalMs = Math.max(totalDurationInMs / 9, 1);

        // --- 2. Get all paid tier names dynamically ---
        const paidTiers = await prisma.subscriptionTier.findMany({
            where: { name: { not: 'FREE' } },
            select: { name: true },
        });
        const paidTierNames = paidTiers.map(t => t.name); // e.g., ['BRONZE', 'PLATINUM']

        // --- 3. Build promises for each data point in the chart ---
        const dataPointPromises = [];
        for (let i = 0; i < 10; i++) {
            const currentPointDate = new Date(finalStartDate.getTime() + i * intervalMs);
            const previousPointDate = new Date(currentPointDate.getTime() - intervalMs);

            // Create a list of all queries to run in parallel for this time point
            const promises = [
                // Overall total subscriptions
                prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { lte: currentPointDate } } }),
                // Overall new subscriptions in this interval
                prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { gte: previousPointDate, lt: currentPointDate } } }),
            ];

            // Dynamically add queries for each paid tier
            paidTierNames.forEach(tierName => {
                promises.push(
                    // Total for this tier
                    prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { lte: currentPointDate }, tier: { name: tierName } } }),
                    // New for this tier
                    prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { gte: previousPointDate, lt: currentPointDate }, tier: { name: tierName } } })
                );
            });

            const queryPromise = Promise.all(promises).then(results => {
                // The 'results' array matches the order of our promises
                const [totalSubscriptions, newSubscriptions] = results;

                const dataPoint = {
                    date: currentPointDate.toISOString().split('T')[0],
                    totalSubscriptions,
                    newSubscriptions,
                };

                // Loop through our tier names again to correctly assign the results
                paidTierNames.forEach((tierName, index) => {
                    // Results for tiers start at index 2 of the array
                    const tierTotal = results[2 + (index * 2)];
                    const tierNew = results[2 + (index * 2) + 1];

                    // Add dynamic keys to the data point, e.g., "BRONZE_total"
                    dataPoint[`${tierName}_total`] = tierTotal;
                    dataPoint[`${tierName}_new`] = tierNew;
                });

                return dataPoint;
            });
            dataPointPromises.push(queryPromise);
        }

        const chartData = await Promise.all(dataPointPromises);
        res.status(200).json(chartData);

    } catch (error) {
        console.error("Error fetching subscription charts data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};