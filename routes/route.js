require('dotenv').config();
const express = require();
var app = new express.Router();
const LOG = require('./../models/log');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
 
const twitter_consumer_key = 'gXPyrnjJjgoCRFgSmYqddTWJn'
const twitter_consumer_secret = 'bgZNCMCRxh9H1JWD81LszldLpYy9ark3SI6cH6cwWkU8eY5BQH';

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'somesecretcode', resave: true, saveUninitialized: true }));



var trustProxy = false;
if (process.env.DYNO) {
  trustProxy = true;
}

passport.use(new Strategy({
    consumerKey: twitter_consumer_key,
    consumerSecret: twitter_consumer_secret,
    callbackURL: '/oauth/callback',
    proxy: trustProxy
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  async function(req, res) {
    const user = req.user;
    const log = new LOG({details: user.username + ' loggedin'});
    await log.save();
    res.render('home', { user: user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/oauth/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    
    res.redirect('/');
  });


app.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

  module.exports = app;
