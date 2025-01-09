const express = require('express');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User');
const LocalStrategy = require('passport-local').Strategy;
const connectDB = require('./config/db')
const dotenv = require('dotenv');
require('./config/passportLocal')(passport); // Local strategy
require('./config/passportSocial')(passport);
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const PostRequirements = require('./routes/requirementsRoutes');
const Feedback = require('./routes/requirementsRoutes');
const cors = require('cors');
const path = require('path');

dotenv.config(); 
const app = express();



connectDB();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());  // Allows all origins (for development purposes)
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key', // Use a secret key for session encryption
    resave: false,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

// Passport Local Strategy (Email/Password)
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ email: username });
      if (!user) return done(null, false);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Define routes (signup, login, social login)
app.use('/api', jobRoutes);
app.use('/api', PostRequirements);
app.use('/api', Feedback);

// Use routes for authentication
authRoutes(app, passport);

module.exports = app;