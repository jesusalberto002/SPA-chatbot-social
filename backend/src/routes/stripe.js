// src/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/Users/stripe');

// We use express.raw() here to ensure the Stripe signature can be verified
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleStripeWebhook);

module.exports = router;