const express = require('express');
const tagsController = require('../controllers/Users/tags');

const router = express.Router();

router.get('/', tagsController.getTags);

module.exports = router;