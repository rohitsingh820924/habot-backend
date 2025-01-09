const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  console.log("Invalid credentials")
  // LocalStrategy for Login
  passport.use(new LocalStrategy(
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          console.log("Invalid credentials")
          return done(null, false, { message: 'Invalid credentials' }) 
        };
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){ 
          console.log("Mismatch credentials")
          return done(null, false, { message: 'Invalid credentials' })
        };

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Serialize User
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize User
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
