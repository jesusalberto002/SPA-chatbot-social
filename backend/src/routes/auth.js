const express = require('express');
const controller = require('../controllers/Users/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/check-email', controller.checkEmailAvailability);
router.post('/login', controller.login);
router.get('/authenticate', controller.authenticate);

module.exports = router;