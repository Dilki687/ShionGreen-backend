const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Make sure this is not undefined
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Avoid hardcoding
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      let user = await User.findOne({ googleId: id });
      if (!user) {
        user = new User({ googleId: id, name: displayName, email: emails[0].value });
        await user.save();
      }
      done(null, user);
    }
  )
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "/auth/facebook/callback",
//       profileFields: ["id", "displayName", "emails"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const { id, displayName, emails } = profile;
//       let user = await User.findOne({ facebookId: id });
//       if (!user) {
//         user = new User({ facebookId: id, name: displayName, email: emails[0].value });
//         await user.save();
//       }
//       done(null, user);
//     }
//   )
// );

module.exports = passport;
