var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');

// movie schema 
var MovieSchema = new Schema({
  title: { type: String, required: true, index: { unique: true }},
  year: { type: String, required: true },
  genre: { type: String, required: true, enum:['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Thriller','Western']},
  actor : { type : Array , "default" : [] }
});
  
//middleware that will check if connectedd to the database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection to data base error!'));
db.once('open', function() {
  console.log('we are connected to the movies collection!');
});

module.exports = mongoose.model('movie', MovieSchema);//the models contains(collection name, collection schema)