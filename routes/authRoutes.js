const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
require('../config/passportLocal')(passport); // Local strategy
require('../config/passportSocial')(passport);
const jwt = require('jsonwebtoken');
const { register, login, verifyEmail,sendVerificationEmail, profile, forgotPassword, verifyPassword, resetPassword, updateProfile } = require('../controllers/authController');

module.exports = function(app, passport) {
  // Local Sign Up
  app.post('/signup', async (req, res) => {
    const { email, password, name, phoneNumber, country } = req.body;
  
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      user = new User({
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        country,
      });
  
      await user.save();
  
      // Authenticate the user after signup
      passport.authenticate('local', (err, user) => {
        if (err || !user) {
          return res.status(400).json({ message: 'Signup failed' });
        }
  
        // Generate a JWT token after successful signup
        const token = jwt.sign(
          { userId: user._id }, // Payload with user ID
          process.env.JWT_SECRET, // Secret key (store this in an env variable)
          { expiresIn: '1h' } // Token expiration time (e.g., 1 hour)
        );
  
        // Set the token in a cookie
        res.cookie('auth_token', token, {
          httpOnly: true, // Ensures the cookie is sent only via HTTP and not accessible via JavaScript
          secure: process.env.NODE_ENV === 'production', // Set secure flag in production
          maxAge: 3600000, // Cookie expiration time (1 hour)
        });
  
        // Redirect to homepage or another page
        res.redirect('/');
      })(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Login Route
  app.post('/login', (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error during login' });
      }
  
      if (!user) {
        // If authentication fails, send failure response with message
        return res.status(400).json({ message: info.message || 'Invalid credentials' });
      }
  
      try {
        // Generate a JWT token after successful login
        const token = jwt.sign(
          {user : req.user}, // Add the user's unique MongoDB ID to the payload
          process.env.JWT_SECRET, // The secret key used to sign the token
          { expiresIn: '1h' } // Token expiration time (optional)
        );
  
        // Set the token in a cookie
        res.cookie('auth_token', token, {
          httpOnly: true, // Ensures the cookie is sent only via HTTP (not accessible by JavaScript)
          secure: process.env.NODE_ENV === 'production', // Use 'secure' flag in production
          maxAge: 3600000, // Cookie expiration time (1 hour)
        });
  
        // Redirect to homepage or any other page after successful login
        res.redirect('/'); // Or send success message / data as needed
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating token after login' });
      }
    })(req, res, next); // Pass req, res, and next to the passport authenticate callback
  });

  app.post('/auth/login', login);
  app.post('/auth/signup', register);
  app.post('/auth/verify-email', verifyEmail);
  app.post('/auth/profile', profile);
  app.post('/auth/send-verification-email', sendVerificationEmail);
  app.post('/auth/reset-password', resetPassword);
  app.post('/auth/verify-password', verifyPassword);
  app.post('/auth/forgot-password', forgotPassword);
  app.patch('/auth/update-profile', updateProfile);
  


  app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({user : req.user}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.redirect(process.env.REDIRECT_URL);
  });
  
  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(process.env.REDIRECT_URL);
  });
  
  app.get('/auth/linkedin', passport.authenticate('linkedin'));
  app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(process.env.REDIRECT_URL);
  });

  // Logout
  app.get('/logout', (req, res) => {
    req.logout((err) => {
      res.redirect('/');
    });
  });
};
