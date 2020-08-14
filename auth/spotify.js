const passport = require('passport')
const router = require('express').Router()
const SpotifyStrategy = require('passport-spotify').Strategy
const { User } = require('../db/models')
module.exports = router


if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.log('Spotify client ID / secret not found. Skipping Spotify OAuth.')
} else {

  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        callbackURL: process.env.SPOTIFY_CALLBACK 
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
        const spotifyId = profile.id
        const email = profile.emails[0].value
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;

        User.findOrCreate({
          where: { spotifyId, firstName, lastName },
          defaults: { email }
        })
          .then(([user]) => done(null, user))
          .catch(done)
      }
    )
  )

  router.get('/', passport.authenticate('spotify'), function(req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  });
  
  router.get(
    '/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      console.log('Successfully authenticated!!!')
      res.redirect('/profile');
    }
  );

  router.get('/credentials', (req, res, next) => {
    const clientID = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    res.json({
      clientID,
      clientSecret,
      redirectUri,
    })
  })
}
