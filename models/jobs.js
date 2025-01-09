// Jobs model that imports the schema
const mongoose = require('mongoose');
const jobsSchema = require('../schemas/jobsSchema');

const Jobs = mongoose.model('Jobs', jobsSchema);
module.exports = Jobs;
