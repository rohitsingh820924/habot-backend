// Authentication routes
const express = require('express');
const { PostRequirements, Feedback } = require('../controllers/requirementsController');

const router = express.Router();

router.post('/post-requirements', PostRequirements);
router.post('/feedback', Feedback);

module.exports = router;
