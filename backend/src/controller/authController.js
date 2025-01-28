// const oauth2Client = require('../utils/google');
// const googleAuth = (req, res) => {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/calendar.events'],
//   });
//   res.redirect(authUrl);
// };

// const googleAuthCallback = async (req, res) => {
//   const { code } = req.query;

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // Store tokens in session, database, or cookies (as needed)
//     req.session.tokens = tokens;

//     res.status(200).json({ message: 'Google authentication successful', tokens });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during Google authentication', error: error.message });
//   }
// };

// module.exports = { googleAuth, googleAuthCallback };



const googleCallback = (req, res) => {
    // Save user session or redirect to the frontend dashboard
    res.redirect('https://localhost:5173/home'); // Adjust to your frontend route
  };
  
  module.exports = { googleCallback };
  