const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetchStripeSubscription = require('./stripe').fetchStripeSubscription;
const prisma = require('../../middleware/prisma');
const bcrypt = require('bcryptjs');

exports.checkUserExists = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            return res.status(200).json({ exists: true });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        // req.user.id comes from your authentication middleware (e.g., JWT token verification)
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                // Fetch only the ACTIVE subscription and its tier details
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: { tier: true },
                    orderBy: { createdAt: 'desc' }, // Get the most recent one
                    take: 1
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Format the response to make it easy for the frontend context
        const activeSubscription = user.subscriptions[0] || null;
        const currentTier = activeSubscription ? activeSubscription.tier.name : 'FREE';

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscriptionTier: currentTier,
                subscriptionDetails: activeSubscription
            }
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.createUser = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password, // Password will be hashed by middleware
                updatedPasswordAt: new Date(), // Set the current date as the password update timestamp
            },
        });

        // Return the created user without the password
        res.status(201).json({
            message: 'User created successfully',
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }}

exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getSettingsInfo = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        subscriptions: { 
            include: { tier: true },
            orderBy: { createdAt: 'desc' },
        } 
      },
    });

    const stripeInfo = await fetchStripeSubscription(user.email);

    res.json({
      ...user,
      stripeInfo,
    });

  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

exports.updateUserInfo = async (req, res) => {
    const { firstName, lastName, profileImageUrl } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    console.log("Updating user info:", { firstName, lastName, profileImageUrl });
    try {
        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                firstName,
                lastName,
                profileImageUrl,
            },
        });

        console.log("User updated successfully:", updatedUser);

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                profileImageUrl: updatedUser.profileImageUrl,
            },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.updateUserEmail = async (req, res) => {
    const { email, recoveryEmail } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    try {

        const dataToUpdate = {};

        if (email) {
            dataToUpdate.email = email;
            dataToUpdate.isEmailVerified = false;
            dataToUpdate.emailVerificationCode = null;
            dataToUpdate.emailVerificationCodeExpiresAt = null;
        }

        if (recoveryEmail) {
            // NOTE: Make sure to add recoveryEmail and its verification fields
            // to your schema.prisma first!
            dataToUpdate.recoveryEmail = recoveryEmail;
            dataToUpdate.isRecoveryEmailVerified = false;
            dataToUpdate.recoveryEmailVerificationCode = null;
            dataToUpdate.recoveryEmailVerificationCodeExpiresAt = null;
        }

        // --- 3. Perform a single update to the database ---
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: dataToUpdate,
        });

        res.status(200).json({
            message: 'Email updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
            },
        });

    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update the user's password
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                password: newPassword, // Password will be hashed by middleware
                updatedPasswordAt: new Date(), // Update the timestamp
            },
        });

        res.status(200).json({
            message: 'Password updated successfully',
        });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Checks if the currently authenticated user has an ACTIVE community suspension.
 * If an old suspension has expired, this function will automatically update its
 * status to 'LIFTED'.
 * Returns an object with the suspension details if active, or { status: 'ACTIVE' } if not.
 */
exports.getCommunitySuspensionStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        const latestSuspension = await prisma.userCommunitySuspension.findFirst({
            where: {
                userId: userId,
                status: { in: ['SUSPENDED', 'BANNED'] },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        if (!latestSuspension) {
            // No active or banned records found, user is active.
            return res.status(200).json({ status: 'ACTIVE' });
        }

        if (latestSuspension.status === 'BANNED') {
            // User is permanently banned.
            return res.status(200).json(latestSuspension);
        }

        // It's a 'SUSPENDED' record, check if it has expired.
        const now = new Date();
        const hasExpired = latestSuspension.endDate && new Date(latestSuspension.endDate) < now;

        if (hasExpired) {
            // The suspension is over. Update the record to 'LIFTED'.
            await prisma.userCommunitySuspension.update({
                where: { id: latestSuspension.id },
                data: { status: 'LIFTED' },
            });
            // User is now active.
            return res.status(200).json({ status: 'ACTIVE' });
        }

        // The suspension is temporary and has not expired yet.
        return res.status(200).json(latestSuspension);

    } catch (error) {
        console.error('Error checking community suspension status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Define the weights for different user actions
exports.TAG_WEIGHTS = {
    INTEREST_MODAL: 15, // High weight for explicit user choice
    JOIN_COMMUNITY: 10,  // Medium-high weight for joining a community
    CREATE_POST: 8,     // Medium weight for creating content
    COMMENT_POST: 5,    // Lower weight for engaging with content
    INTERACTION: 2,     // Low weight for likes, comments, etc.
};

// This function will now be the central point for updating user interests.
exports._updateUserTagsLogic = async function(userId, tags, weight) {
    if (!Array.isArray(tags) || !weight || tags.length === 0) {
        console.error('Invalid input to _updateUserTagsLogic');
        return;
    }

    try {
        const profile = await prisma.userTagProfile.findUnique({
            where: { userId },
        });

        let currentTags = (profile && Array.isArray(profile.tags)) ? profile.tags : [];

        tags.forEach(tagToAdd => {
            const existingTag = currentTags.find(t => t.tag === tagToAdd);
            if (existingTag) {
                existingTag.score += weight;
            } else {
                currentTags.push({ tag: tagToAdd, score: weight });
            }
        });

        currentTags.sort((a, b) => b.score - a.score);
        const rankedTags = currentTags.slice(0, 25);

        await prisma.userTagProfile.upsert({
            where: { userId },
            update: { tags: rankedTags },
            create: {
                userId,
                tags: rankedTags,
            },
        });
    } catch (error) {
        console.error('Error in _updateUserTagsLogic:', error);
    }
};

// This function now just handles the HTTP request and calls the logic function.
exports.updateUserTags = async (req, res) => {
    const { tags, weight } = req.body;
    const userId = req.user.id;

    // We still validate the incoming HTTP request
    if (!Array.isArray(tags) || !weight || tags.length === 0) {
        return res.status(400).json({ error: 'An array of tags and a weight are required.' });
    }
    
    // Call the reusable logic function
    await _updateUserTagsLogic(userId, tags, weight);

    // The endpoint can now simply confirm success
    res.status(200).json({ message: 'Interests updated successfully!' });
};

exports.updateWelcomeModalStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { hasSeenWelcomeModal: true },
        });

        res.status(200).json({
            message: 'Welcome modal status updated successfully',
            user: {
                id: updatedUser.id,
                hasSeenWelcomeModal: updatedUser.hasSeenWelcomeModal,
            },
        });
    } catch (error) {
        console.error('Error updating welcome modal status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCommunityIntroModalStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { hasSeenCommunityIntroModal: true },
        });
        res.status(200).json({
            message: 'Community intro modal status updated successfully',
            user: {
                id: updatedUser.id,
                hasSeenCommunityIntroModal: updatedUser.hasSeenCommunityIntroModal,
            },
        });
    } catch (error) {
        console.error('Error updating community intro modal status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to flag that the user has dismissed the welcome modal, so it doesn't show again.
exports.dismissWelcomeModal = async (req, res) => {
    console.log("Received request to dismiss welcome modal for user ID:", req.user.id);
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { hasSeenWelcomeModal: true }
        });
        res.status(200).json({ message: "Modal dismissed successfully" });
    } catch (error) {
        console.error("Error dismissing modal:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};