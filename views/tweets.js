
const express = require('express');
const app = express();
const LOG = require('./../models/log');
var Twitter = require('twitter');
const getBearerToken = require('get-twitter-bearer-token');
 
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

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

  app.get('/tweets', 
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
      client.get('search/tweets', {q: '#ios #swift'}, function(error, tweets, response) {
        const log = new LOG({details: 'Accessed tweets'});
            
       
       // console.log(log);
       // await log.save();
       
        res.render('tweets', { tweets: tweets.statuses });
        //res.send({tweets: tweets.statuses});
     });
      
    }
);
module.exports = app;