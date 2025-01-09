// User model that imports the schema
const mongoose = require('mongoose');
const userSchema = require('../schemas/userSchema');
const bcrypt = require('bcrypt');

userSchema.methods.comparePassword = async function(inputPassword) {
    try {
      // Compare the input password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(inputPassword, this.password);
      return isMatch;
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  };

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next(); // Skip hashing if the password hasn't been modified
    }
    
    try {
      // Hash the password with a salt rounds of 10
      this.password = await bcrypt.hash(this.password, 10);
      next(); // Proceed with saving the user
    } catch (error) {
      next(error); // Pass any error to the next middleware
    }
  });

const User = mongoose.model('User', userSchema);
module.exports = User;
