// CALL THE PACKAGES --------------------
var express    = require('express');		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser'); 	// get body-parser
var morgan     = require('morgan'); 		// used to see requests
var mongoose   = require('mongoose');		//methods for mongo db
var jwt = require('jsonwebtoken');			//for creating a web token
var passport = require('passport');
var bcrypt 		 = require('bcrypt-nodejs');
//CALL OTHER MODUELS --------------------
var User       = require('./user');
var Movie	   = require('./movies');
//define some vars for later use
var port       = process.env.PORT || 8080; // set the port for our app
var dotenv = require('dotenv').config();
var superSecret = process.env.superSecret;//this is for the webToken

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console 
app.use(morgan('dev'));

//requierd for the 'basic' authorization
app.use(passport.initialize());
app.use(passport.session());

// connect to our database 
//mongoose.connect('mongodb://localhost/homework3db');
mongoose.connect(process.env.DB);
//mongoose.connect('mongodb://admin:admin123@ds215019.mlab.com:15019/homework3webapi');
//=============================================================================================
//ROUTES FOR THE API=====================

// basic route for the home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

//=============================================================================================
//CREATE A USER ACCOUNT, WITH NAME, PASS, USERNAME
//=============================================================================================
// create a user (accessed at POST http://localhost:8080/signup)
apiRouter.post('/signup',function(req, res) {
	if (!req.body.username || !req.body.password) {
		res.json({success: false, msg: 'Please pass username and password.'});
	}else{
			var user = new User();		// create a new instance of the User model
			//get data from the request body
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
			
			//save the user with the mongoose .save method
			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});
		};
})
//=============================================================================================
//FINDS THE USERNAME AND GRANT TOKEN IF USERNAME EXISTS
//=============================================================================================
//this rout checks if the username and passwror are correct in the data base
apiRouter.post('/signin', function(req,res){

	var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;
	//find the user
	//select the name username and password explicitly
	User.findOne({
		username: req.body.username
	}).select('name username password').exec(function(err,user){
		if(err) throw err;

		//no user with that username was found
		if(!user){
			res.json({
				success: false,
				message: 'Athentication faild. user not found.'
			});
		}else if (user){

			//check if password mathches, using a function declared in the user.js
			var validPassword = user.comparePassword(req.body.password);

			if (!validPassword){
				res.json({
					success: false,
					message: 'Authentication faild. worng passoword.'
				});
			}else{

				//if user is found and the password is right 
				//create a token
				var token = jwt.sign({
					//this is the payload
					name: user.name,
					username: user.username  
				},superSecret,{
					expiresIn: 1440//expires in 24 hrs
				});

				//return the information including token as JSON
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});

//=============================================================================================
//MIDDLEWARE THAT MAKES EVERY METHOD DECLARED UNDER IT ASK FOR A TOKEN
//=============================================================================================
// middleware to use for all requests after this middleware
apiRouter.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	//deocode token
	if(token){

		//verifies secret and check exp
		jwt.verify(token, superSecret, function(err,decoded){
			if(err){
				return res.status(403).send({
					success: false,
					message: 'Faild to uathenticate token.'
				});
			}else{
				//if everything is good , save to request for use in other routes
				req.decoded = decoded;
				next();//this means that the user will only continue forward only if they have the token
			}
		});
	}else{

		//if ther is no token
		// return an HTTP response of 403 (access forbidden) and an error message
		return res.status(403).send({
			success: false,
			message: 'no token provided.'
		});
	}
	//remove the next() b/c its added elsewhere
	//next(); // make sure we go to the next routes and don't stop here
});
//=============================================================================================
//CRUD COMMANDS FOR MOVIES DATABASE
//=============================================================================================
//---------------------------------------------------------------------------------------------
//this route handles the getters and setter for the movie collection
apiRouter.route('/movies')
//---------------------------------------------------------------------------------------------
	// create a movie (accessed at POST http://localhost:8080/movies)
	.post(function(req, res) {
		
        var movie = new Movie();		// create a new instance of the User model
        //get data from the request body
		movie.title = req.body.title; 
		movie.year = req.body.year;
		movie.genre = req.body.genre;
		movie.actor = req.body.actor;
        //save the user with the mongoose .save method
		movie.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000) 
					return res.json({ success: false, message: 'A movie with that name already exists. '});
				else 
					return res.send(err);
			}

			// return a message
			res.json({ message: 'movie created!' });
		});

	})
//---------------------------------------------------------------------------------------------
	// get all the movies (accessed at GET http://localhost:8080/api/movies)
	.get(function(req, res) {
		Movie.find(function(err, aMovie) {
			if (err) return res.send(err);

			// return the users
			res.json(aMovie);
		});
	})
//---------------------------------------------------------------------------------------------
	.put(function(req, res) {
		Movie.find({title: req.query.movie_id}, function(err, movie) {

			if (err) return res.send(err);
			console.log(req.query.movie_id);
			// set the new movie information if it exists in the request
			if (req.body.title) movie.title = req.body.title;
			if (req.body.year) movie.year = req.body.year;
			if (req.body.genre) movie.genre = req.body.genre;
			if (req.body.actor) movie.actor = req.body.actor;
			console.log(movie.title);
			var newMovie = new Movie(movie);
			// update the movie
			
			Movie.findOneAndUpdate({title: req.query.movie_id},{$set: {title: newMovie.title,
				year: newMovie.year,genre: newMovie.genre,actor: newMovie.actor}},
				{returnOriginal:false},function(err) {
				console.log('saving new shit');
				if (err) {
					// duplicate entry
					if (err.code === 11000)
						return res.json({ success: false, message: 'no update was made.' });
					else
						return res.send(err);
				}
				res.json({ message: 'Movie Updated!' });
			});
			
		});
		
		console.log('end of functions');
	})
//---------------------------------------------------------------------------------------------
	.delete(function (req, res) {
		var oldTitle = req.query.movie_id;
		var count = Movie.find().count();
		console.log(count);
		if(count < 5){
			res.json('cant delete, cant have less than five movies in the database.');
		}else{
			Movie.remove({title: oldTitle},function (err, movie) {
				if (err) res.send(err);
				res.json({ message: 'Movie Deleted!' });
			});
		}
		console.log(count);
    });
//=============================================================================================
//PRINT THE LIST OF ALL USERS(NO CRUD COMMAND, B/C NOT REQUIERED IN HW)
//=============================================================================================
// get all the users (accessed at GET http://localhost:8080/api/users)
apiRouter.get('/users',function(req, res) {
	User.find(function(err, aUser) {
		if (err) return res.send(err);

		// return the users
		res.json(aUser);
	});
});
//=============================================================================================

    // REGISTER OUR ROUTES -------------------------------
app.use('/api', apiRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);