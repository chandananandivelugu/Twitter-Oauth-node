require('dotenv').config();

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;                    
var fs = require('fs'); 
var Twitter = require('twitter');
const getBearerToken = require('get-twitter-bearer-token');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "twitter"
});

const twitter_consumer_key = 'gXPyrnjJjgoCRFgSmYqddTWJn'
const twitter_consumer_secret = 'bgZNCMCRxh9H1JWD81LszldLpYy9ark3SI6cH6cwWkU8eY5BQH'
var twitter_bearer_token = 'AAAAAAAAAAAAAAAAAAAAAGFMAQEAAAAA7uT%2FMu9xDTxSmaBTUOh0R2UzCqw%3DLS7GbuJGoBHhG7QfWr3BZaKZzxZcDIAfuxv3Qr1cvRjSQ16U5P';
 
getBearerToken(twitter_consumer_key, twitter_consumer_secret, (err, res) => {
  if (err) {
    // handle error
  } else {
      // bearer token
    twitter_bearer_token = res.body.access_token;
  }
});

var client = new Twitter({
  consumer_key: twitter_consumer_key,
  consumer_secret: twitter_consumer_secret,
  bearer_token: twitter_bearer_token
});

var trustProxy = false;
if (process.env.DYNO) {
  trustProxy = true;
}

passport.use(new Strategy({
    consumerKey: 'gXPyrnjJjgoCRFgSmYqddTWJn',
    consumerSecret: 'bgZNCMCRxh9H1JWD81LszldLpYy9ark3SI6cH6cwWkU8eY5BQH',
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


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    console.log('ENV');
    console.log(process.env);
    console.log('Headers:');
    console.log(req.headers)
    res.render('login');
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/oauth/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {    
    con.connect(function(err) {
      if (err) throw err;
      //console.log("Connected!");
      var sql = "INSERT INTO user_oauth (user_id,oauth_token,oauth_verifier,username,apiurl) VALUES ('"+req.user.id+"', '"+req.query.oauth_token+"','"+req.query.oauth_verifier+"','"+req.user.username+"','"+req.url+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    });
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
  

  app.get('/tweets', 
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {  
      client.get('search/tweets', {q: '#ios #swift'}, function(error, tweets, response) {        
        res.render('tweets', { tweets: tweets.statuses });       
     });
    }
);

app.get('/sortbydate', 
require('connect-ensure-login').ensureLoggedIn(),
(req, res) => {  
  client.get('search/tweets', {q: '#ios #swift'}, function(error, tweets, response) { 
    tweets.statuses.sort(function compare(a, b) {
      var dateA = new Date(a.created_at);
      var dateB = new Date(b.created_at);
      return dateA - dateB;
    });
    res.render('sortbydate', { tweets: tweets.statuses });       
 });
}
);


//console.log(myArray);
app.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

app.listen(process.env['PORT'] || 8080);
