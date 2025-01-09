// Requirements model that imports the schema
const mongoose = require('mongoose');
const requirementsSchema = require('../schemas/requirementsSchema');

const Requirements = mongoose.model('Requirements', requirementsSchema);
module.exports = Requirements;