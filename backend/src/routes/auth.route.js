const express = require('express');
const passport = require('passport');
const { createTokenForUser } = require("../service/token");
// const { googleCallback } = require('../controller/authController');
const { UserSuccess } = require('../utils/Constants/User.js');
const ApiResponse = require('../utils/ApiResponse');
const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user; 
      console.log(user);

     if (!user.sem) {
      // Redirect to complete-profile with the user ID as a query parameter
      return res.redirect(
        `http://localhost:5173/edit-profile?id=${user.id}`
      );
    }
      // Retrieved from GoogleStrategy
      const token = createTokenForUser(user);
      console.log(token);
     
      return res
        .status(UserSuccess.LOG_IN.statusCode)
        .cookie('token', token, { path: '/' })
        .redirect(`http://localhost:5173`); // Adjust your frontend URL
    } catch (error) {
      console.error(error);
      res.status(500).send('Google Sign-In failed');
    }
  }
);

module.exports = router;