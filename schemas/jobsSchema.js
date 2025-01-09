const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    createdDate: {
      type: Date,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Contract', 'Remote', 'Freelance', 'Part-time'],
    },
  });

module.exports = jobsSchema;