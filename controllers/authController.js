// Controller functions for authentication
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const upload = require('../config/multerUpload');
const fs = require('fs');

dotenv.config();

console.log(process.env.SMTP_PASS);
// Email Transporter
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER, // your SMTP username
    pass: process.env.SMTP_PASS, // your SMTP password
  },
  // Note: You may need to include additional settings for Gmail, such as `tls` options:
  tls: {
    rejectUnauthorized: false // You may need to disable this for self-signed certs or similar issues
  }
});

exports.register = async (req, res) => {
  try {
    const { fullname, password, email, phoneNumber, country  } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(404).json({ message: 'User already exist', status:false });
    }

    user = new User({ fullname, password, email, phoneNumber, country });
    await user.save();
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if ID exists
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(id);

    // Check if user was found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Send Verification Email Route
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!', status:false });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.', status:true });
    }

    // Generate new token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new token
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify Your Email',
      html: `<h1>Email Verification</h1><p>Click ${otp} to verify your email.</p>`,
    });

    res.status(200).json({ message: 'Verification email sent!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'User not found!', status:false });
    }

    // Generate new token
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Update user with new token
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Forgot Password',
      html: `<h1>Forgot Password</h1><p>Click ${otp} to verify your email.</p>`,
    });

    res.status(200).json({ message: 'Verification email sent!', status: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (!user.otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or invalid.' });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if(isOtpValid) {
      res.status(200).json({ message: 'OTP verified successfully!', status:true });
    }

  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
      user.password = await password;
      await user.save();
      res.status(200).json({ message: 'Password Reset successfully!', status:true });

  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};





// Email Verification Route
exports.verifyEmail = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    if (!user.otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or invalid.' });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if(isOtpValid) {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      res.status(200).json({ message: 'Email verified successfully!', status:true });
    }

  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    upload.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message, status: false });
      }

      const { id, name, email, phoneNumber, country } = req.body;

      // Validate if the user ID is provided
      if (!id) {
        return res.status(400).json({ message: 'User ID is required', status: false });
      }

      // Validate if the user exists
      let user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found', status: false });
      }

      // Update fields if provided
      if (name) user.name = name;
      if (email) {
        // Check if email already exists for another user
        const emailExists = await User.findOne({ email, _id: { $ne: id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use', status: false });
        }
        user.email = email;
        user.isVerified = false;
      }
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (country) user.country = country;

      // Save profile picture URL if file is uploaded
      if (req.file) {
        // Delete old profile picture if it exists
        if (user.profilePicture) {
          const oldPath = user.profilePicture;
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        user.profilePicture = `http://localhost:5000/uploads/${req.file.filename}`;
      }

      // Save updated user
      await user.save();

      res.status(200).json({ message: 'User details updated successfully', status: true, user });
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};



