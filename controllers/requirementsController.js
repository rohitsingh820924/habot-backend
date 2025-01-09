// Controller functions for Requirements
const Requirements = require('../models/Requirements');
const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

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

exports.PostRequirements = async (req, res) => {
  try {
    const { jobTitle, service, location, referralCode, description } = req.body.values;
    const { email } = req.body;
    const requirement = new Requirements({ jobTitle, service, location, referralCode, description, email });
    // Send email
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: 'New Requirement Listed',
        html: `<h1>New Requirement</h1><p>sent ${requirement} to  your email.</p>`,
    });
    await requirement.save();
    res.status(201).json({ message: 'Requirements sent successfully', requirement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.Feedback = async (req, res) => {
  try {
    const { subject, description } = req.body.values;
    const { email } = req.body;
    const feedback = new Feedback({ subject, description, email });
    // Send email
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: 'New Feedback Listed',
        html: `<h1>New Feedback</h1><p>sent ${feedback} to  your email.</p>`,
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback sent successfully', feedback });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

