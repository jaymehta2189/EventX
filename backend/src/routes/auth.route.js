const express = require('express');
const { createTokenForUser } = require("../service/token");
// const { googleCallback } = require('../controller/authController');
const { UserSuccess } = require('../utils/Constants/User.js');
const ApiResponse = require('../utils/ApiResponse');
const router = express.Router();
const User = require('../models/user.model'); // Adjust the path to your User model
const cacheData = require('../service/cacheData.js');
const moment = require("moment-timezone");

const { OAuth2Client } = require('google-auth-library');

require('dotenv').config();

const axios = require('axios');


const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    hd:'ddu.ac.in',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });
  res.redirect(authUrl);
});

// router.get(
//   '/google',
//   passport.authenticate('google', {
//     scope: [
//       'https://www.googleapis.com/auth/userinfo.email',
//       'https://www.googleapis.com/auth/userinfo.profile',
//       'https://www.googleapis.com/auth/calendar.events'
//     ]
//   })
// );

// router.get(
//   '/google/callback',
//   passport.authenticate('google', { session: false }),
//   async (req, res) => {
//     try {
//       const user = req.user;
//       console.log(user);

//       if (!user.sem) {
//         // Redirect to complete-profile with the user ID as a query parameter
//         return res.redirect(
//           `http://localhost:5173/edit-profile?id=${user.id}`
//         );
//       }
//       // Retrieved from GoogleStrategy
//       const token = createTokenForUser(user);
//       console.log(token);

//       return res
//         .status(UserSuccess.LOG_IN.statusCode)
//         .cookie('token', token, { path: '/' })
//         .redirect(`http://localhost:5173`); // Adjust your frontend URL
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Google Sign-In failed');
//     }
//   }
// );

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {

    const { tokens } = await oauth2Client.getToken(code);
    console.log("tokens", tokens);

    oauth2Client.setCredentials(tokens);

    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    const profile = response.data;
    const email = profile.email.toLowerCase().trim();

    if(!email.endsWith('@ddu.ac.in')){
      // error handle it
    }

    let user = await User.findOne({ email });

    if (!user) {

      let isAccessCalender = false;

      if (tokens.scope && tokens.scope.includes('https://www.googleapis.com/auth/calendar.events')) {
        isAccessCalender = true;
      }

      user = new User({
        name: profile.name,
        email,
        avatar: profile.picture,
        googleId: profile.id,
        isGoogleUser: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        setProfile: false,
        isAccessCalender
      });

      await user.save();
      await cacheData.cacheUser(user);

      return res.redirect(
        `http://localhost:5173/edit-profile?id=${user.id}`
      );
    }

    user.accessToken = tokens.access_token;
    user.refreshToken = tokens.refresh_token || user.refreshToken;
    const token = createTokenForUser(user);
    
    await user.save();
    await cacheData.cacheUser(user);

    return res
      .status(UserSuccess.LOG_IN.statusCode)
      .cookie('token', token, { path: '/', expires: moment(new Date(tokens.expiry_date), "Asia/Kolkata").toDate() })
      .redirect(`http://localhost:5173`);

  } catch (error) {
    console.error('Error during Google OAuth:', error);
    res.status(500).send('OAuth error');
  }
});

module.exports = router;