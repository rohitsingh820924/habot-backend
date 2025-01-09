// Authentication routes
const express = require('express');
const { getAllJobs } = require('../controllers/jobsController');

const router = express.Router();

router.get('/getAllJobs', getAllJobs);

module.exports = router;
