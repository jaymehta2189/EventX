const express = require('express');
const { createTokenForUser } = require("../service/token");
// const { googleCallback } = require('../controller/authController');
const { UserSuccess, UserError } = require('../utils/Constants/User.js');
const router = express.Router();
const User = require('../models/user.model'); // Adjust the path to your User model
const cacheData = require('../service/cacheData.js');
const moment = require("moment-timezone");
const Authority = require('../models/authority.model.js');

const { OAuth2Client } = require('google-auth-library');

require('dotenv').config();

const axios = require('axios');
const ApiError = require('../utils/ApiError.js');
const { RedisClient } = require('../service/configRedis.js');
const { default: mongoose } = require('mongoose');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    // prompt: 'consent',
    hd: 'ddu.ac.in',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });
  res.redirect(authUrl);
});

// change in fronted side 
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

    if (!email.endsWith('@ddu.ac.in')) {
      // error handle it
      return res.status(403).send('Only DDU email allowed');
    }

    if (email.match(User.emailPattern)) {
      let user = await User.findOne({ email });

      let isAccessCalender = false;

      if (tokens.scope && tokens.scope.includes('https://www.googleapis.com/auth/calendar.events')) {
        isAccessCalender = true;
      }

      if (!user) {

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

      } else {

        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || user.refreshToken;

        if (!user.isGoogleUser) {
          user.avatar = profile.picture,
            user.googleId = profile.id;
          user.isGoogleUser = true;
          user.isAccessCalender = isAccessCalender;
        }
      }

      console.log("abc", token);

      await user.save();
      await cacheData.cacheUser(user);

      const token = createTokenForUser(user);
      
      console.log("abc", token);
      
      return res
        .status(UserSuccess.LOG_IN.statusCode)
        .cookie('token', token, { path: '/' })
        .redirect(`${process.env.FRONTEND_URL}/home`);

    }

    let authority = await Authority.findOne({ email });

    if (!authority) {

      const role = email.match(Authority.StaffEmailPattern) ? 'staff' : 'admin';

      authority = new User({
        name: profile.name,
        email,
        avatar: profile.picture,
        isGoogleUser: true,
        role
      });

    } else {
      if (!authority.isGoogleUser) {
        authority.avatar = profile.picture,
        authority.isGoogleUser = true;
      }
    }

    await authority.save();
    await cacheData.cacheAuthority(authority);

    const token = createTokenForUser(authority);

    return res
      .status(UserSuccess.LOG_IN.statusCode)
      .cookie('token', token, { path: '/' })
      .redirect(`${process.env.FRONTEND_URL}/home`);
  } catch (error) {
    console.error('Error during Google OAuth:', error);
    res.status(500).send('OAuth error');
  }
});

async function isAccessTokenValid(accessToken) {
  try {
    await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Access token is valid.');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Access token expired.');
      return false;
    }
    console.error('Error checking access token:', error);
    return false;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    console.log('New access token:', credentials.access_token);
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

async function getValidAccessToken(userId) {

  const users = await cacheData.GetUserDataById('$', userId);

  if (users.length === 0) {
    throw new ApiError(UserError.USER_NOT_FOUND);
  }

  const user = users[0];

  if (!user.isGoogleUser) {
    throw new ApiError(UserError.IS_NOT_GOOGLE_USER);
  }

  const isValid = user.accessToken && (await isAccessTokenValid(user.accessToken));

  if (isValid) {
    return { accessToken: user.accessToken };
  }

  const newTokens = user.refershToken && (await refreshAccessToken(user.refreshToken));

  if (newTokens) {
    user.accessToken = newTokens.access_token;

    const userUpdated = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set : {accessToken: newTokens.access_token} },
      { new : true}
    );

    await cacheData.cacheUser(userUpdated);

    return { accessToken: newTokens.access_token, token: createTokenForUser(user) };
  }

  console.log("ndkjvnkjdvjk");

  throw new ApiError(UserError.REFRESH_TOKEN_EXPIRY);
}

async function getValidAccessTokenForUserObj(user) {

  if (!user.isGoogleUser) {
    throw new ApiError(UserError.IS_NOT_GOOGLE_USER);
  }

  const isValid = user.accessToken && (await isAccessTokenValid(user.accessToken));

  if (isValid) {
    return { accessToken: user.accessToken };
  }

  const newTokens = user.refershToken && (await refreshAccessToken(user.refreshToken));

  if (newTokens) {
    user.accessToken = newTokens.access_token;

    const userUpdated = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { accessToken: newTokens.access_token },
      { new : true}
    );

    await cacheData.cacheUser(userUpdated);

    return { accessToken: newTokens.access_token, token: createTokenForUser(user._id) };
  }

  throw new ApiError(UserError.REFRESH_TOKEN_EXPIRY);
}

module.exports = {
  AuthRouter: router,
  getValidAccessToken,
  getValidAccessTokenForUserObj
};