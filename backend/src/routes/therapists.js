const express = require('express');
const therapistsController = require('../controllers/Users/therapists');

const router = express.Router();

router.get('/get-all', therapistsController.getTherapists);
router.get('/get-selected', therapistsController.getSelectedTherapist);
router.post('/update', therapistsController.updateTherapist);

module.exports = router;