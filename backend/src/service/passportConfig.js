// // const passport = require('passport');
// // const GoogleStrategy = require('passport-google-oauth20').Strategy;
// // // require("dotenv").config({path:'../../.env'});
// // passport.use(
// //   new GoogleStrategy(
// //     {
// //       clientID: process.env.GOOGLE_CLIENT_ID,
// //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// //       callbackURL: process.env.GOOGLE_REDIRECT_URI,
// //     },
// //     (accessToken, refreshToken, profile, done) => {
// //       const info = { profile, accessToken, refreshToken };
// //       return done(null, info);
// //     }
// //   )
// // );
// // console.log(process.env.GOOGLE_CLIENT_ID);
// // passport.serializeUser((info, done) => done(null, info));
// // passport.deserializeUser((info, done) => done(null, info));

// // module.exports = passport;
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/user.model'); // Adjust the path to your User model

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_REDIRECT_URI,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value.toLowerCase().trim();

//         // // Validate email pattern
//         if (!User.emailPattern.test(email)) {
//           return done(new Error('Invalid email format'), null);
//         }

//         // Check if the user already exists
//         let user = await User.findOne({ email });

//         if (!user) {
//           // Create a new user if not exists
//           user = new User({
//             name: profile.displayName,
//             email,
//             role: User.allowedRoles[0], // Set the default role
//             avatar: profile.photos[0]?.value || User.schema.path('avatar').defaultValue,
//             googleId: profile.id,
//             isGoogleUser: true,
//           });

//           await user.save();
//         }
        
//         console.log("hello");
//         return done(null, user);
//       } catch (error) {
//         console.error('Error in Google OAuth:', error);
//         return done(error, null);
//       }
//     }
//   )
// );

// // Serialize user to the session
// passport.serializeUser((info, done) => {
//   console.log(info);
//   const info = { id: info.id, accessToken: info.accessToken };
//   done(null, info);
// });

// passport.deserializeUser(async (info, done) => {
//   try {
//     const user = await User.findById(info.id);
//     user.accessToken = info.accessToken; // Attach token to user object
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });
// module.exports = passport;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model'); // Adjust the path to your User model
const cacheData = require('./cacheData.js');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase().trim();

        // Validate email pattern
        if (!User.emailPattern.test(email)) {
          return done(new Error('Invalid email format'), null);
        }

        // Check if the user already exists
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email,
            avatar: profile.photos[0]?.value || User.schema.path('avatar').defaultValue,
            googleId: profile.id,
            isGoogleUser: true,
            accessToken: accessToken, // Attach the access token
          });

          await user.save();

          await cacheData.cacheUser(user);
        }

        // Pass both user and accessToken
        return done(null, user);
      } catch (error) {
        console.error('Error in Google OAuth:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user to the session (only store the user ID)
passport.serializeUser((user, done) => {
  done(null, user.user.id); // Only serialize the user ID
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const users = await cacheData.GetUserDataById('$',id);
    
    let user = null;

    // Fetch the user by ID
    if(users.lenth !== 0){
        user = users[0];
    }

    done(null, user); // Return the user object (without the access token)
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;