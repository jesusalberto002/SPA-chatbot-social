const express = require('express');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const subscriptionsRoutes = require('./subscriptions');
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');
const communityRoutes = require('./CommunitySection/community');
const avatarsRoutes = require('./avatars');
const tagsRoutes = require('./tags');
const therapistsRoutes = require('./therapists');
const portfolioRagRoutes = require('../rag/routes/ragChat');

const { authenticator } = require('../middleware/authenticator');
const { adminAuthenticator } = require('../middleware/adminAuth');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/community', authenticator, communityRoutes);
router.use('/chat', authenticator, chatRoutes);
router.use('/admin', authenticator, adminAuthenticator, adminRoutes);
router.use('/avatars', avatarsRoutes);
router.use('/therapists', authenticator, therapistsRoutes);
router.use('/tags', tagsRoutes);
/** Public portfolio / recruiter RAG (health + future chat). Add rate limits before production. */
router.use('/portfolio-rag', portfolioRagRoutes);

module.exports = router;


