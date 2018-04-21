
module.exports = function (msg) { 
    res.json("omar");
};
/*

// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User       = require('./user');
var MongoClient = require('mongodb').MongoClient;


passport.use(new BasicStrategy(
    function(username, password, done) {
        
        var user = { name: "testuser" };
        if (username == user.name && password == "cu")
        {
            return done(null, user);
        }
        else
        {
            return done(null, false);
        }
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });


*/