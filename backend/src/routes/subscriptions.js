const express = require('express');
const controller = require('../controllers/Users/subscriptions');
const { authenticator } = require('../middleware/authenticator');

const router = express.Router();

router.post('/create', authenticator, controller.createSubscription);
router.post('/change', authenticator, controller.createCheckOutOrChange);
router.post('/portal', authenticator, controller.createPortalSession);
router.post('/cancel', authenticator, controller.cancelSubscription);

module.exports = router;
