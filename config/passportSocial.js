const passportGoogle = require('passport-google-oauth20').Strategy;
const passportFacebook = require('passport-facebook').Strategy;
const passportLinkedIn = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config(); 
module.exports = function(passport) {
  // Google Strategy
  passport.use(new passportGoogle({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('Google Profile:', profile);
    try {
      let existingUser = await User.findOne({ gmail: profile.emails[0].value });
      if (existingUser) {
        return done(null, existingUser);
      }
      existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        // other fields you may want to save
      });
      console.log(newUser);
      await newUser.save()
  .then(() => console.log('New user saved!'))
  .catch(err => console.error('Error saving user:', err));
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }));

  // Facebook Strategy (configure as needed)
  passport.use(new passportFacebook({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ facebookId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }));

  // LinkedIn Strategy (configure as needed)
  passport.use(new passportLinkedIn({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ linkedinId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = new User({
        linkedinId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }));

  // Serialize and deserialize user
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
