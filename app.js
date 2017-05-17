// making a comment

// connect to our MongoDB through mongoose module
const mongoose = require('mongoose');
// built in package for getting path data
const path = require('path');
// // Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';

// fix for event emitters / memory leak error
// https://github.com/npm/npm/issues/13806
require('events').EventEmitter.defaultMaxListeners = Infinity;

// Connect to MongoDB through mongoose
// connection seems to timeout after sometime
// going to add some attributes as noted here
// http://stackoverflow.com/questions/40585705/connection-timeout-for-mongodb-using-mongoose
// mongoose.connect(url)
// updated the socketOption connectionTimeout to connectTimeoutMS as stated here
// http://mongodb.github.io/node-mongodb-native/2.1/api/Server.html

// change mongoose to use NodeJS global promises to supress promise deprication warning.
// and to use NodeJS's Promises.
// https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

// if mongoose connection disconnected, connect to it.
if(mongoose.connection.readyState == 0){
  mongoose.connect(url, {
      server : {
          socketOptions : {
              socketTimeoutMS: 0,
              connectTimeoutMS: 30000
          }
      }
  });
}

// express module is needed for running as an http server
const express = require('express');
const stormpath = require('express-stormpath');

// bodyparse is needed for letting us get data from post
const bodyParser = require('body-parser');
const app = express();

app.use('/',express.static(path.join(__dirname, '', 'admin-client'),{ redirect: false }));

app.use(stormpath.init(app, {
  apiKey: {
    id: '1CRUFRGX863CDWSZFBLB66JS9',
    secret: '2HoQ5havQ7+tj24VwjfXKtAwPuoF/2W2NuOdSqwCMsU'
  },
  application: {
    href: `https://api.stormpath.com/v1/applications/6yJKvDR268ysl0JYmZyJLp`
  },
  expand: {
    customData: true
  },
  web: {

    // This produces option will disable the default HTML pages that express-stormpath
    // will serve, we don't need them because our Angular app is responsible for them.

    produces: ['application/json']
  }
}));

// use pug view engine for rendering HTML
app.set("view engine", "pug");
// set the views directory
app.set("views", path.join(__dirname, "views"));

// Making following globals (no var keyword)
// so all our modules can access it

// Miles in terms of Meters for geospatial queries
METERS_IN_MILES = 1609.34;

// Bounding Box Used For Geospatial Tests Using geojson-random
// generated points, Bounding Box Keeps Points Within the US
BBOX_USA = [-124.848974,24.396308,-66.885444,49.384358];

var users = require('./routes/users');
var tutors = require('./routes/tutors');
var students = require('./routes/students');
var tutorLocations = require('./routes/tutorlocations');
var locations = require('./routes/locations');
var studentLocations = require('./routes/studentlocations');
var booking = require('./routes/booking');
var subjects = require('./routes/subjects');
var dev = require('./routes/dev');
var index = require('./routes/index');


// We have to load bodyparser before loading any routes
// otherwise the routes cannot access the body property on
// requests!

// remove powered-by from headers
app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/users', users);
app.use('/api/tutors', tutors);
app.use('/api/students', students);
app.use('/api/studentlocations', studentLocations);
app.use('/api/tutorlocations', tutorLocations);
app.use('/api/locations', locations);
app.use('/api/booking', booking);
app.use('/api/subjects', subjects);
app.use('/api', index);

app.use('/apiauth/users', stormpath.authenticationRequired, users);
app.use('/apiauth/tutors', stormpath.authenticationRequired, tutors);
app.use('/apiauth/students', stormpath.authenticationRequired, students);
app.use('/apiauth/studentlocations', stormpath.authenticationRequired, studentLocations);
app.use('/apiauth/tutorlocations', stormpath.authenticationRequired, tutorLocations);
app.use('/apiauth/locations', stormpath.authenticationRequired, locations);
app.use('/apiauth/booking', stormpath.authenticationRequired, booking);
app.use('/apiauth/subjects', stormpath.authenticationRequired, subjects);
app.use('/dev', stormpath.authenticationRequired, dev);

app.get('/s3', stormpath.authenticationRequired, function(req, res) {
  req.app.get('stormpathApplication').getCustomData(function(err, customData) {
    if(!customData) {
      return res.status(500).send("Internal Server Error")
    }
    res.send(customData.AccessKey + ":" + customData.SecretKey)
  })
});

var request = require("request");
require('./stormpathclient.js');

app.get('/apiauth/stormpathusers', stormpath.groupsRequired(['Two2er Admins']), function (req, res) {
  res.send(getAccounts());
});

app.get('/apiauth/stormpathusers/:email', stormpath.groupsRequired(['Two2er Admins']), function (req, res) {
  var email = req.params.email;
  console.log(email);
  res.send(getAccount(email));
});

app.post('/apiauth/stormpathusers', stormpath.groupsRequired(['Two2er Admins']), function (req, res) {
  saveAccount(req.body);
});

app.route('/*')
  .get(function(req, res) {
    res.sendFile(path.join(__dirname, '', 'admin-client','index.html'));
  });

// used to catch errors
app.use(errorHandler);

// catches errors
function errorHandler (err, req, res, next) {
  if (err.statusCode >= 100 && err.statusCode < 600)
    res.status(err.status).render("error", {
        status: err.status,
        message: err.message
      });
  else
    res.render("error", {
      status: err.status,
      message: err.message
    });
}


// listen on port 80 unless otherwise specified
var port = process.env.PORT || 80;

// make a reference to the http.Server object that
// is returned by app.listen() that we'll want to
// export out for out test cases
var server = app.listen(port);
console.log(`Listening on port ${port}`);

// Stormpath will let you know when it's ready to start authenticating users.
app.on('stormpath.ready', function () {
  console.log('Stormpath Ready!');
});

// if this process has been signaled to end
// close the connection to mongodb
process.on('SIGINT', () => {
  mongoose.connection.close( () => {
    console.log('Process ending, closing connection to mongodb');
    process.exit(0);
  });
});


// exporting http.Server from app.listen() out so we
// can use it in our test cases
module.exports = server;
