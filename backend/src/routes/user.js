const express = require('express');
const controller = require('../controllers/Users/user');
const { authenticator } = require('../middleware/authenticator');

const router = express.Router();

router.post('/create', controller.createUser);
router.get('/me', authenticator, controller.getCurrentUser);
router.get('/all', controller.getAllUsers);
router.put('/update', authenticator, controller.updateUserInfo);
router.put('/update-password', authenticator, controller.updateUserPassword);
router.put('/update-email', authenticator, controller.updateUserEmail);
router.get('/settings-info', authenticator, controller.getSettingsInfo);
router.get('/community-suspension-status', authenticator, controller.getCommunitySuspensionStatus);
router.put('/viewed-welcome-modal', authenticator, controller.updateWelcomeModalStatus);
router.put('/viewed-community-intro-modal', authenticator, controller.updateCommunityIntroModalStatus);
router.put('/dismiss-welcome-modal', authenticator, controller.dismissWelcomeModal);

module.exports = router;