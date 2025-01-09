// Controller functions for authentication
const Jobs = require('../models/jobs');
const dotenv = require('dotenv');
dotenv.config();

exports.getAllJobs = async (req, res) => {
    try {
      const jobs = await Jobs.find();  // Get all jobs from the database
      res.status(200).json(jobs);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching jobs', error: err });
    }
  };