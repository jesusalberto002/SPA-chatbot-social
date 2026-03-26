const { addMonths, addYears, sub } = require('date-fns');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../../middleware/prisma');
const authController = require('./auth');

const PRICE_MAP = {
    'BRONZE_MONTHLY': 'price_1SYiYRGTgb0pTdIDze66nPNJ',
    'BRONZE_YEARLY': 'price_1SYjt8GTgb0pTdIDGMqEYdpU',
    'PLATINUM_MONTHLY': 'price_1SYiZ2GTgb0pTdIDX9zqFGGi',
    'PLATINUM_YEARLY': 'price_1SYjtdGTgb0pTdIDYeZaeUJ6',
};

exports.createPortalSession = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // Find Stripe Customer by email
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length === 0) throw new Error('Stripe customer not found');

        const session = await stripe.billingPortal.sessions.create({
            customer: customers.data[0].id,
            return_url: req.body.returnUrl, // Frontend URL to come back to
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
};

exports.createSubscription = async (req, res) => {
    const { email, name, priceId, tierName, billingCycle } = req.body;

    try {
        // 1. Find or Create Customer
        const customers = await stripe.customers.list({ email: email, limit: 1 });
        let customer = customers.data[0];

        if (!customer) {
            customer = await stripe.customers.create({
                email: email,
                name: name,
            });
        }

        // 2. Create Subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            //These two settings force Stripe to generate a SetupIntent for the trial
            trial_period_days: 7, 
            trial_settings: {
                end_behavior: {
                    missing_payment_method: 'cancel',
                },
            },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
            metadata: {
                userId: req.user.id.toString(),
                tierName: tierName,
                billingCycle: billingCycle,
            }
        });

        // 3. Extract the correct Client Secret
        let clientSecret;
        
        // CASE A: It's a Trial (Use Setup Intent)
        if (subscription.pending_setup_intent) {
            clientSecret = subscription.pending_setup_intent.client_secret;
        } 
        // CASE B: Immediate Payment (Use Payment Intent)
        else if (subscription.latest_invoice && subscription.latest_invoice.payment_intent) {
            clientSecret = subscription.latest_invoice.payment_intent.client_secret;
        }
        else {
            throw new Error("Stripe failed to generate a payment or setup intent. Check your Price ID and Trial settings.");
        }

        res.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createCheckOutOrChange = async (req, res) => {
    const userId = req.user.id;
    const { tierName, billingCycle } = req.body;

    try {
        const mapKey = `${tierName}_${billingCycle}`;
        const newPriceId = PRICE_MAP[mapKey];

        if (!newPriceId) {
            return res.status(400).json({ error: 'Invalid configuration.' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        let customerId;
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length === 0) {
            console.log(`No Stripe customer found for ${user.email}. Creating one now...`);
            const newCustomer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            });
            customerId = newCustomer.id;
        } else {
            customerId = customers.data[0].id;
        }

        // 1. ONLY find subscriptions that are actually active or trialing
        // Canceled subscriptions cannot be "updated"; they must be replaced.
        const allSubscriptions = await stripe.subscriptions.list({ 
            customer: customerId, 
            status: 'all', // Important: don't use 'all' here
            limit: 5
        });

        const currentValidSub = allSubscriptions.data.find(
            sub => sub.status === 'active' || sub.status === 'trialing'
        );

        // 2. SCENARIO: NEW OR RETURNING USER (No active sub)
        if (!currentValidSub) {
            console.log(`No active sub found for user ${userId}. Creating new Checkout Session.`);
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: newPriceId, quantity: 1 }],
                success_url: `${process.env.FRONTEND_URL}/payment-success`,
                cancel_url: `${process.env.FRONTEND_URL}/subscription`,
                metadata: { 
                    // Useful for webhooks to link back to your user and tier
                    userId: userId.toString(), 
                    tierName: tierName,
                    billingCycle: billingCycle
                },
                subscription_data: {
                    metadata: {
                        userId: userId.toString(), 
                        tierName: tierName,
                        billingCycle: billingCycle 
                    }
                }
            });
            
            // Note: We don't update Prisma here because the user hasn't paid yet.
            // You should rely on a Webhook or your fetchStripeSubscription function to update Prisma after success.
            return res.json({ url: session.url });
        }

        // 4. SCENARIO: EXISTING USER (Switching plans mid-cycle or mid-trial)
        console.log(`Active/Trialing sub found for user ${userId}. Updating existing subscription.`);
        
        // Use the valid sub we found in Step 2!
        const subscriptionItemId = currentValidSub.items.data[0].id;
        const currentPriceId = currentValidSub.items.data[0].price.id;

        // Prevent updating to the exact same plan
        if (currentPriceId === newPriceId) {
            return res.status(400).json({ 
                error: 'You are already actively subscribed to this exact plan and billing cycle.' 
            });
        }

        // Tell Stripe to update the plan
        await stripe.subscriptions.update(currentValidSub.id, {
            items: [{
                id: subscriptionItemId,
                price: newPriceId,
            }],
            proration_behavior: 'always_invoice',
            // If they are on a trial, Stripe will automatically keep them on the trial 
            // but map them to the new Platinum plan when the trial ends!
            metadata: { 
                userId: userId.toString(), 
                tierName: tierName,
                billingCycle: billingCycle
            }
        });

        return res.status(200).json({
            message: "Subscription update initiated. Processing payment...", 
            requiresPolling: true 
        });

    } catch (error) {
        console.error('Error changing subscription:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

exports.getSubscription = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch the user's subscription
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
            include: {
                tier: true, // Include the subscription tier details
            },
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.status(200).json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.cancelSubscription = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Deactivate any ACTIVE subscriptions for this user
        const updateResult = await prisma.subscription.updateMany({
            where: { 
                userId: userId, 
                status: 'ACTIVE' 
            },
            data: {
                status: 'CANCELLED',
                endDate: new Date(), // End access immediately (or logic to keep until period end)
            }
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ message: "No active subscription found to cancel." });
        }

        // 2. Fetch updated user data to return to frontend
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // Generate a new token with the updated role/tier (likely 'FREE' or none)
        const newToken = authController.generateToken(user, 'FREE');

        res.status(200).json({
            message: "Subscription cancelled successfully",
            token: newToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                subscriptionTier: 'FREE', // Explicitly set to FREE
            }
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};