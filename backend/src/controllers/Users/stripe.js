const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../../middleware/prisma');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                
                // Only process if this was a subscription checkout
                if (session.mode !== 'subscription') break;

                const userId = parseInt(session.metadata.userId);
                const tierName = session.metadata.tierName || 'BRONZE';
                const billingCycle = session.metadata.billingCycle || 'MONTHLY';

                if (!userId) break;

                console.log(`Checkout session completed for User ${userId}: Tier - ${tierName}`);

                // 1. Get the requested tier from the database
                const tier = await prisma.subscriptionTier.findUnique({ where: { name: tierName } });

                // 2. Safely archive any existing active subscriptions (like the FREE tier)
                await prisma.subscription.updateMany({
                    where: { userId: userId, status: 'ACTIVE' },
                    data: { status: 'INACTIVE', endDate: new Date() }
                });

                // 3. Create the brand new active subscription
                await prisma.subscription.create({
                    data: {
                        userId: userId,
                        tierId: tier.id,
                        status: 'ACTIVE',
                        billingCycle: billingCycle,
                        startDate: new Date(),
                    }
                });
                
                console.log(`Activated new ${tierName} subscription for User ${userId} via Checkout`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const userId = parseInt(subscription.metadata.userId);
                const tierName = subscription.metadata.tierName || 'BRONZE';
                const billingCycle = subscription.metadata.billingCycle || 'MONTHLY';

                console.log(`Received subscription update for User ${userId}: Status - ${subscription.status}, Tier - ${tierName}`);

                if (!userId) break; // Ignore if there's no userId attached

                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    // 1. Get the requested tier from the database
                    const tier = await prisma.subscriptionTier.findUnique({ where: { name: tierName } });
                    
                    // 2. Find their CURRENT active subscription
                    const existingSub = await prisma.subscription.findFirst({
                        where: { userId: userId, status: 'ACTIVE' }
                    });

                    if (!existingSub) {
                        // SCENARIO A: Brand new payment (or free trial conversion)
                        await prisma.subscription.create({
                            data: {
                                userId: userId,
                                tierId: tier.id,
                                status: 'ACTIVE',
                                startDate: new Date(),
                            }
                        });
                        console.log(`Activated ${tierName} for User ${userId}`);
                        
                    } else if (existingSub.tierId !== tier.id || existingSub.billingCycle !== billingCycle) {
                        // SCENARIO B: Switching plans! Preserve the history.
                        // Mark the old one INACTIVE, and create the new one ACTIVE.
                        await prisma.$transaction([
                            prisma.subscription.update({
                                where: { id: existingSub.id },
                                data: { status: 'INACTIVE', endDate: new Date() }
                            }),
                            prisma.subscription.create({
                                data: {
                                    userId: userId,
                                    tierId: tier.id,
                                    status: 'ACTIVE',
                                    billingCycle: billingCycle,
                                    startDate: new Date(),
                                }
                            })
                        ]);
                        console.log(`Switched User ${userId} to new ${tierName} plan`);
                    } else {
                        // SCENARIO D: Normal billing cycle renewal. 
                        // The tier hasn't changed, so we don't need a new database row.
                        console.log(`User ${userId} subscription renewed for ${tierName}. No DB change needed.`);
                    }
                } 
                else if (['canceled', 'past_due', 'unpaid'].includes(subscription.status)) {
                    // THEIR SUBSCRIPTION EXPIRED OR CARD FAILED
                    await prisma.subscription.updateMany({
                        where: { userId: userId, status: 'ACTIVE' },
                        data: { status: 'INACTIVE', endDate: new Date() }
                    });
                    console.log(`Deactivated subscription for User ${userId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
              console.log('Received subscription deletion event:', event.data.object);
                const subscription = event.data.object;
                let userId = subscription.metadata.userId ? parseInt(subscription.metadata.userId) : null;

                console.log(`Processing subscription deletion for User ${userId}, Subscription ID: ${subscription.id}`);
                // --- NEW: Bulletproof Fallback ---
                // If metadata is missing (e.g., manual dashboard creation), find them by email
                if (!userId) {
                    try {
                        const customer = await stripe.customers.retrieve(subscription.customer);
                        if (customer.email) {
                            const dbUser = await prisma.user.findUnique({ where: { email: customer.email } });
                            if (dbUser) userId = dbUser.id;
                        }
                        console.log(`Fallback lookup for deleted subscription: Found User ID ${userId} using email ${customer.email}`);
                    } catch (err) {
                        console.error("Failed to retrieve customer fallback for deleted sub:", err);
                    }
                }
                // ---------------------------------

                if (userId) {
                    await prisma.subscription.updateMany({
                        where: { userId: userId, status: 'ACTIVE' },
                        data: { status: 'CANCELLED', endDate: new Date() }
                    });
                    console.log(`Cancelled subscription for User ${userId}`);
                } else {
                    console.log(`CRITICAL: Could not find Prisma User for cancelled Stripe Sub ${subscription.id}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to Stripe to stop retries
        res.json({ received: true });
    } catch (error) {
        console.error("Error processing webhook data:", error);
        res.status(200).json({ error: "Processed with internal errors" });
    }
};

exports.fetchStripeSubscription = async (email) => {

    let paymentInfo = {
      brand: "No card",
      last4: "",
      nextPaymentDate: "N/A",
      planName: "FREE",
      amount: "0.00",
    };

    const customers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customer = customers.data[0];

      // 1. Fetch ALL subs to find the newest one
      const subscriptions = await stripe.subscriptions.list({ 
        customer: customer.id, 
        status: 'all', 
        expand: ['data.plan.product'],
      });

      // 2. Sort by 'created' DESC to get the latest plan (March 2026 instead of Dec 2025)
      const activeSub = subscriptions.data
        .filter(s => ['active', 'trialing'].includes(s.status))
        .sort((a, b) => b.created - a.created)[0];

      if (activeSub) {
        // Use trial_end if it exists for the 7-day trial period
        const rawDate = activeSub.trial_end || activeSub.current_period_end;
        
        if (rawDate) {
            const dateObj = new Date(rawDate * 1000);
            paymentInfo.nextPaymentDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
        }

        paymentInfo.planName = activeSub.plan.product.name; 
        paymentInfo.amount = (activeSub.plan.amount / 100).toFixed(2);

        // Payment Method Logic
        let pmId = activeSub.default_payment_method || customer.invoice_settings.default_payment_method;
        if (!pmId) {
          const pms = await stripe.paymentMethods.list({ customer: customer.id, type: 'card', limit: 1 });
          if (pms.data.length > 0) pmId = pms.data[0];
        }

        if (pmId) {
          const pm = typeof pmId === 'string' ? await stripe.paymentMethods.retrieve(pmId) : pmId;
          if (pm.card) {
            paymentInfo.brand = pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1);
            paymentInfo.last4 = `**** ${pm.card.last4}`;
          }
        }
      }
    }

    // 3. CLEANING THE TIER NAME
    let cleanedTierName;
    // Extract just "BRONZE" from "BRONZE-SUBSCRIPTION"
    if (paymentInfo.planName.includes('-')) {
        cleanedTierName = paymentInfo.planName.split('-')[0].toUpperCase();
    } else {
        cleanedTierName = paymentInfo.planName.toUpperCase();
    }

    console.log("Final payment info for user:", {
      email,
      paymentInfo,
      subscriptionTier: cleanedTierName,
    });

    return {
      paymentMethod: paymentInfo.brand === "No card" ? "No Payment Method" : `${paymentInfo.brand} ${paymentInfo.last4}`,
      nextPaymentDate: paymentInfo.nextPaymentDate,
      subscriptionAmount: paymentInfo.amount,
      subscriptionTier: cleanedTierName
    };
};