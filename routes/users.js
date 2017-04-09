const router = require('express').Router();
const User = require('../models/user.js');
const Tutor = require('../models/schemas/tutor.js');
const Student = require('../models/schemas/student.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');
// For Output to KML
const kml = require('tokml');
// For Random Location Generation
const geojsonRandom = require('geojson-random');

// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
    console.log('Time:', dateFormat(Date.now(), 'dd-mmm-yyyy HH:mm:ss'));
    next();
});


// add a new user (accessed via post http://localhost:8080/api/users)
router.post('/', function (req, res) {

    // JSON attribute order seems to be dictated here in reverse
    // so if your attribute to appear first in your JSON object enter it last
    // e.g if user.name is last it will appear first in the JSON 

    var user = new User();

    // generate a random location if needed
    var randomLocation = geojsonRandom.position(BBOX_USA);
    // if no location is provided create default location 
    user.location = (req.body.location ? req.body.location : { type: "Point", coordinates: [randomLocation[0], randomLocation[1]] });
    // if no age provided default to 0
    user.age = (req.body.age ? req.body.age : 0);
    user.email = req.body.email;
    user.name = req.body.name;
    // set image to empty string by default
    user.image_url = '';

    // some logging 
    console.log(`${req.ip} is doing a POST via /users`)

    user.save((err) => {
        if (err)
            res.status(404).send(err);

        else {

            // update StormPath to include user model id 
            // if route reached by StormPath
            // authenticated endpoint.
            // doing this for faster access to look ups in student
            // and tutor and locations collections

            if (req.user && req.body.isTest != true) {
                console.log(user._id);
                req.user.customData.user_id = user._id;
                req.user.customData.save((err) => {
                    if (err) {
                        res.status(400).send(`Oops! There was an error: ${err.userMessage}`);
                    }
                    else
                        console.log(`_id: ${user._id}`)
                    res.json({ message: `StormPath Authenticated User: ${user.name} has been created!` });
                });
            }
            // otherwise ignore stormpath if not 
            // authenticated.
            else {
                console.log(`_id: ${user._id}`)
                res.json({ message: `User: ${user.name} has been created!` });
            }
        }
    });
});

// update for the current user
router.post('/update', function (req, res) {
    console.log(`${req.ip} is doing a POST via /users/update`)

    try {
        if (req.body.user_id != null)
            var userid = req.body.user_id;
        else
            var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

        User.findOne({ _id: userid }, (err, user) => {
            if (req.body.name != null)
                user.name = req.body.name;
            if (req.body.age != null)
                user.age = req.body.age;
            if (req.body.email != null) {
                user.email = req.body.email;

                // If a Stormpath profile exists, change username on Stormpath account
                if (req.user && req.body.isTest != true) {
                    var oldEmail = req.user.email;
                    req.user.email = req.body.email;
                    req.user.username = req.body.email;
                    req.user.save();
                    console.log("username changed from " + oldEmail + " to " + req.user.email);
                }
            }
            if (req.body.education != null)
                user.education = req.body.education;
            if (req.body.location != null)
                user.location = req.body.location;
            if (req.body.isstudent != null)
                user.isstudent = req.body.isstudent;
            if (req.body.istutor != null)
                user.istutor = req.body.istutor;
            if (req.body.about != null)
                user.about = req.body.about;
            if (req.body.defaultlocation != null)
                user.defaultlocation = req.body.defaultlocation;
            if (req.body.image_url != null)
                user.image_url = req.body.image_url;

            user.save((err) => {
                if (err)
                    console.log(err);
            });

            res.json(user);
        });
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }
});

// get all the users (accessed via GET http://localhost:8080/api/users)
router.get('/', (req, res) => {

    // some logging 
    console.log(`${req.ip} is doing a GET via /users`);

    User.find((err, users) => {
        if (err)
            res.status(404).send(err);

        res.json(users);
    });
});

// get user attributes for currently logged in user
// only works if user is authenticated through stormpath
router.get('/me', (req, res) => {
    if (req.user) {
        User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, user) => {
            if(err)
                res.status(404).send(err);
            res.json(user);
        });
    }
    else
        res.json(null);
});

// get user with name like <name> (accessed via GET http://localhost:8080/api/users/<name>)
router.get('/getUserByName/:name?', (req, res) => {

    var fullname = req.params.name ? req.params.name : (req.user ? req.user.fullName : 'FindUserByNameTest');

    // some logging 
    console.log(`${req.ip} is doing a GET via /users/getUserByName/${req.params.name}`);

    User.findOne({ name: fullname }, (err, user) => {
        if (err)
            res.status(404).send(err);
        res.json(user);
    });
});

// get user by email 
router.get('/getUserByEmail/:email?', (req, res) => {

    var email = req.params.email ? req.params.email : (req.user ? req.user.email : 'fubnt@gmail.com');

    console.log(`${req.ip} is doing a GET via /users/getUserByEmail/${req.params.email}`);

    User.findOne({ email: email }, (err, user) => {
        if (err)
            res.status(404).send(err);
        res.json(user);
    });
});

//get user by mongo _id field
router.get('/getUserById/:id?', (req, res) => {

    console.log(`${req.ip} is doing a GET via /uses/getUserById/${req.params.id}`);

    try {
        var user_id = mongoose.Types.ObjectId(req.params.id);
        User.findOne({ _id: user_id }, (err, user) => {
            if (err)
                res.status(404).send(err);
            res.json(user);
        });
    }
    catch (ex) {
        //console.log(ex);
        res.json(null);
    }
});

// delete user from user collection by mongo _id field 
// does not delete from student or tutor collections
router.get('/deleteById/:id', (req, res) => {

    console.log(`${req.ip} is doing a GET via /users/deleteUserById/${req.params.id}`);

    var user_id = mongoose.Types.ObjectId(req.params.id);

    User.remove({ _id: user_id }, (err, commandResult) => {
        if (err)
            res.status(404).send(err);

        // If a Stormpath profile exists, delete Stormpath account
        if (req.user && req.body.isTest != true) {
            req.user.delete();
        }

        // commandResult is a command result, maybe investigate this further later
        res.json({ message: `User ${user_id} removed` });
        console.log(`User ${user_id} removed`);
    });
});

// deletes user by email, also deletes corresponding 
// document in tutors and students collections
router.get('/deleteByEmail/:email', (req, res) => {

    console.log(`${req.ip} is doing a GET via /users/deleteUserByEmail/${req.params.email}`);

    User.findOne({ email: req.params.email }, (err, user) => {
        if (err)
            res.status(404).send(err);
        else {
            Tutor.remove({ user_id: user._id }, (err, commandResult) => {
                if (err)
                    res.status(404).send(err);
                else {
                    Student.remove({ user_id: user._id }, (err, commandResult) => {
                        if (err)
                            res.status(404).send(err);
                        else
                            user.remove((err, product) => {
                                if (err)
                                    res.status(404).send(err);
                                else {
                                    // If a Stormpath profile exists, delete Stormpath account
                                    if (req.user && req.body.isTest != true) {
                                        req.user.delete();
                                    }
                                    res.json({ message: `User ${user._id} removed` });
                                }
                            });
                    });
                }
            });
        }
    });

});

//do a spatial query given a distance in mile (:distance) and a longitude (:lon) and latitude (:lat) coordinate in decimal degrees
router.get('/findWithin/milesLonLat/:distance/:lon/:lat', (req, res) => {
    console.log(`${req.ip} is doing a GET via /findWithin/milesLonLat/${req.params.distance}/${req.params.lon}/${req.params.lat}`);

    // conversion to miles to meters 
    var distance = req.params.distance * METERS_IN_MILES;

    var geoSpatialQuery = User.find({
        'location': {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [req.params.lon,
                    req.params.lat
                    ]
                },
                $maxDistance: distance
            }
        }
    });

    geoSpatialQuery.exec((err, users) => {
        if (err)
            res.status(404).send(err);

        res.json(users);
    });
});

router.get('/exportToKML', (req, res) => {
    console.log(`${req.ip} is doing a GET via /exportToKML`);

    // locations as KML
    var locations = { type: "FeatureCollection", features: [] };

    User.find((err, users) => {
        if (err)
            res.status(404).send(err);

        users.forEach((user) => {
            locations.features.push({ type: "Feature", geometry: user.location, properties: { name: user.name, age: user.age, email: user.email } });
        });

        var kmlDocument = kml(locations, {
            name: 'name',
            documentName: 'User Locations',
            documentDescription: 'Locations of all our users'
        });

        // render as xml not html
        res.set('Content-Type', 'application/vnd.google-earth.kml+xml').send(kmlDocument);
    });
});

// change password for the current user
router.post('/changepassword', function (req, res) {
    console.log(`${req.ip} is doing a POST via /users/changepassword`);

    try {
        if (req.user && req.body.password && req.body.isTest != true) {
            req.user.password = req.body.password;
            req.user.save();
            console.log("password changed for " + req.user.email);
            res.send("password changed for " + req.user.email);
        }
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }
});

// set fcm_token in order to communicate through firebase messaging 
// for current user
router.post('/setFCMToken', (req, res) => {
     console.log(`${req.ip} is doing a POST via /setFCMToken`);
     
     var fcm_token = req.body.fcm_token;

     if (req.user && fcm_token) {
         User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, user) => {
            if(err)
                res.status(404).send(err);
            user.fcm_tokens.push(fcm_token);
            user.save( (err, updated_user, numAffected) =>{
                if(err)
                    res.status(404).send(err);
                if(numAffected = 1){
                    res.json("{message: fcm_token updated}");
                }
            });
        });
     }
     else {
         res.json(null);
     }
})

module.exports = router;