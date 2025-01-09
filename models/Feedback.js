// feedback model that imports the schema
const mongoose = require('mongoose');
const feedbackSchema = require('../schemas/feedbackSchema');

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;