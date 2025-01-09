const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: String,
  facebookId: String,
  linkedinId: String,
  name: String,
  phoneNumber: String,
  otp: String,
  otpExpire: Date,
  country: String,
  profilePicture:String,
  isVerified: {
    type: Boolean,
    default: false
  }
});

module.exports = userSchema;
