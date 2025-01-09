// Separate schema file for Requirements
const mongoose = require('mongoose');

const requirementsSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true, unique: false },
  service: { type: String, required: true },
  location: {type: String, required: true},
  email: {type:String, required: true},
  referralCode: {type: String, required: false},
  description: {type: String, required: false},
}, {timestamps: true 
});

module.exports = requirementsSchema;
