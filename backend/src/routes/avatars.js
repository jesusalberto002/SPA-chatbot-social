const express = require('express');
const avatarsController = require('../controllers/Users/avatars');

const router = express.Router();

router.get('/', avatarsController.getAvatars);

module.exports = router;