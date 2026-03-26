const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../middleware/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetchStripeSubscription = require('./stripe').fetchStripeSubscription;
const { addMonths, addYears } = require('date-fns');
require('dotenv').config();

exports.generateToken = (user, tierName) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            subscriptionTier: tierName,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );
}

exports.authenticate = async (req, res) => {
    // Prevent browser/proxy caching for auth checks.
    // This avoids revalidation responses (e.g., 304) that can cause auth guards to briefly treat the user as logged out.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // If caching is ever enabled by an intermediary, vary by authorization so tokens don't get mixed.
    res.setHeader('Vary', 'Authorization');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(400).json({message: 'Authentication Invalid'})
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                profileImageUrl: true,
                hasSeenWelcomeModal: true,
                // Fetch only the ACTIVE subscription
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    select: {
                        billingCycle: true,
                        tier: { select: { name: true } }
                    }
                }
            }
        });

        console.log('Authenticated user:', user);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if they have an active subscription in the DB, otherwise default to FREE
        const currentTier = user.subscriptions.length > 0 ? user.subscriptions[0].tier.name : 'FREE';
        const currentBillingCycle = user.subscriptions.length > 0 ? user.subscriptions[0].billingCycle : 'NONE';

        const userPayload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            subscriptionTier: currentTier, 
            billingCycle: currentBillingCycle,
            isNewUser: !user.hasSeenWelcomeModal
        };

        console.log('User payload for response:', userPayload);

        res.status(200).json({ user: userPayload }); // Wrapped in { user: ... } for consistency
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' }, // Ensure we only get active subscriptions
                    include: {
                        tier: true, // Include the subscription tier details
                    },
                },
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isNewUser = !user.hasSeenWelcomeModal && !user.hasSeenCommunityIntroModal;

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let tierName = 'FREE'; // Default to 'FREE' if no active subscription is found
        if (user.subscriptions && user.subscriptions.length > 0) {
            tierName = user.subscriptions[0].tier.name;
        }

        // Generate a JWT token
        const token = this.generateToken(user, tierName);

        // Return the user data and token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscriptionTier: tierName, // Default to 'FREE' if no tier is found
                isNewUser: isNewUser,
                profileImageUrl: user.profileImageUrl,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/** Public: whether this email can be used for a new account (same rules as register duplicate check). */
exports.checkEmailAvailability = async (req, res) => {
    const raw = req.body?.email;
    const email = typeof raw === 'string' ? raw.trim() : '';

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email is required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        return res.status(200).json({ available: !existingUser });
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ error: 'Could not verify email' });
    }
};

exports.register = async (req, res) => {
    const { email, firstName, lastName, password, subscriptionTier, billingCycle, tags, profileImageUrl, therapistId } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const tierToAssign = await prisma.subscriptionTier.findUnique({
            where: { name: subscriptionTier || 'FREE' }, // Default to 'FREE' if no tier is specified
        });

        if (!tierToAssign) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }

        const now = new Date();
        let newEndDate;

        if (billingCycle === 'MONTHLY') {
            newEndDate = addMonths(now, 1); // Add one month for monthly billing
        }
        else if (billingCycle === 'YEARLY') {
            newEndDate = addYears(now, 1); // Add one year for yearly billing
        } else {
            newEndDate = null; // No change in end date for other billing cycles
        }

        let formattedTags = [];
        if (Array.isArray(tags)) {
            formattedTags = tags.map(tagStr => ({
                tag: tagStr,
                score: 50 // Default starting score
            }));
        }

        let targetTherapist;

        if (therapistId) {
            // If the user explicitly chose one, find it
            targetTherapist = await prisma.therapist.findUnique({
                where: { id: parseInt(therapistId) }
            });
        }

        // If no therapist was selected, or the selected one wasn't found, get a default
        if (!targetTherapist) {
            // Option A: Find a specific default by name (e.g., "Luna")
            // targetTherapist = await prisma.therapist.findUnique({ where: { name: "Luna" } });

            // Option B: Just grab the first therapist available in the database
            targetTherapist = await prisma.therapist.findFirst();
        }

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password, // Password will be hashed by middleware
                profileImageUrl,
                subscriptions: {
                    create: {
                        tierId: tierToAssign.id,
                        status: 'ACTIVE',
                        startDate: now,
                        endDate: newEndDate, // Set the end date based on the billing cycle
                    }
                },
                tagProfile: {
                    create: {
                        tags: formattedTags
                    }
                },
                ...(targetTherapist && {
                    therapist: {
                        connect: { id: targetTherapist.id }
                    }
                })
            },
        });

        const assignedTierName = tierToAssign.name;

        // Generate a JWT token
        const token = this.generateToken(newUser, assignedTierName);

        // Return the created user and token without the password
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                subscriptionTier: assignedTierName,
                isNewUser: true,
                profileImageUrl: newUser.profileImageUrl,
                tags: formattedTags,
                assignedTherapist: targetTherapist ? targetTherapist.name : null,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}