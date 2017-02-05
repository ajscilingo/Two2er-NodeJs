// connect to our MongoDB through mongoose module
const mongoose = require('mongoose');

// // Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';

// Connect to MongoDB through mongoose
// connection seems to timeout after sometime
// going to add some attributes as noted here
// http://stackoverflow.com/questions/40585705/connection-timeout-for-mongodb-using-mongoose
// mongoose.connect(url)
// updated the socketOption connectionTimeout to connectTimeoutMS as stated here 
// http://mongodb.github.io/node-mongodb-native/2.1/api/Server.html
mongoose.connect(url, {
    server : {
        socketOptions : {
            socketTimeoutMS: 0,
            connectTimeoutMS: 30000
        }
    }
});

// express module is needed for running as an http server
const express = require('express');

// bodyparse is needed for letting us get data from post
const bodyParser = require('body-parser');
const app = express();

// Miles in terms of Meters for geospatial queries
// Making Global (no var keyword) so All our Modules can access it
METERS_IN_MILES = 1609.34;

var users = require('./routes/users');
var tutors = require('./routes/tutors');
var students = require('./routes/students');
var tutorLocations = require('./routes/tutorlocations');
var studentLocations = require('./routes/studentlocations');

// We have to load bodyparser before loading any routes 
// otherwise the routes cannot access the body property on 
// requests!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/users', users);
app.use('/api/tutors', tutors);
app.use('/api/students', students);
app.use('/api/studentlocations', studentLocations);
app.use('/api/tutorlocations', tutorLocations);


// listen on port 8080 unless otherwise specified
var port = process.env.PORT || 8080; 

app.listen(port);
console.log('Listening on port ' + port);

