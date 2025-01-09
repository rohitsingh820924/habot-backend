// Separate schema file for Feedback
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: false },
  description: {type: String, required: true},
}, {timestamps: true 
});

module.exports = feedbackSchema;
