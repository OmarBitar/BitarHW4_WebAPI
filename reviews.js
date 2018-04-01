var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');

// movie schema 
var ReviewsSchema = new Schema({
  reviewerName: { type: String, required: true },
  movieName: { type: String, required: true},
  rating: { type: Number,  required: true} ,
  quote: { type: String, required: true }
});
  
//middleware that will check if connectedd to the database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection to data base error!'));
db.once('open', function() {
  console.log('we are connected to the reviews collection!');
});

module.exports = mongoose.model('reviews', ReviewsSchema);//the models contains(collection name, collection schema)