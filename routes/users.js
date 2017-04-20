const router = require('express').Router();
const User = require('../models/user.js');
const Tutor = require('../models/schemas/tutor.js').model;
const Student = require('../models/schemas/student.js').model;
const dateFormat = require('dateformat');
const timekit = require('../timekit.js');
const mongoose = require('mongoose');
// For Output to KML
const kml = require('tokml');
// For Random Location Generation
const geojsonRandom = require('geojson-random');
const UserType = require('../enums/usertype.js');


// function to save stormpath user and mongo user
function saveUser(response, mongoUser, stormpathUser = undefined) {

    // if no stormpath user just save mongo document
    if (stormpathUser === undefined) {
        mongoUser.save((err) => {
            if (err)
                response.status(500).send(err);
            response.json(mongoUser);
        });
    }
    // if stormpath user, save stormpath user data then save mongo document
    else {
        
        // check to see if stormpathUser has a user_id property
        // if not set it to the mongoUser._id
        if(stormpathUser.customData.user_id == null)
            stormpathUser.customData.user_id = mongoUser._id;
        
        stormpathUser.save((err) => {
            if (err)
                response.status(500).send(err);
            // save mongo document
            mongoUser.save((err) => {
                if (err)
                    response.status(500).send(err);
                response.json(mongoUser);
            });
        });
    }
}

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
    user.defaultlocation = user.location;
    user.age = (req.body.age ? req.body.age : 0);
    user.email = req.body.email;
    user.name = req.body.name;
    user.image_url = req.body.image_url ? req.body.image_url : '';
    if (req.body.userMode != null && (req.body.userMode == UserType.Student.name) || (req.body.userMode == UserType.Tutor.name)) {
        user.usergroups.push(req.body.userMode);
        user.userMode = req.body.userMode;
        
        // create new Student document
        if(user.userMode == UserType.Student.name)
            user.student = new Student();
        // create new Tutor document
        if(user.userMode == UserType.Tutor.name){
            user.tutor = new Tutor();
            user.tutor.rating = 5.0;
            user.tutor.isAvailableNow = false;
        }

    }
    else {
        user.usergroups.push(UserType.Student.name);
        user.userMode = UserType.Student.name;
        // create new Student document
        user.student = new Student();
    }
    user.about = (req.body.about ? req.body.about : '');
    user.creationdate = dateFormat(Date.now(), 'dd-mmm-yyyy HH:mm:ss');

    console.log(`${req.ip} is doing a POST via /users`)

    /** TODO
     * Create New Timekit User and save token id
     * Create New Calendar 
     */

    if(req.user && req.body.isTest != true){
        timekit.createUser({
            email: req.user.email,
            timezone: (req.body.timezone ? req.body.timezone : 'America/Chicago'),
            first_name: req.user.givenName,
            last_name: req.user.surname
        }).then((response) => {
            user.timekit_token = response.data.api_token;
            
            // set timekit user to new user just created
            timekit.setUser(req.user.email, user.timekit_token);

            // create name for new calendar based on user's name
            var givenNameLastIndex = req.user.givenName.length - 1;
            var giveNameLastLetter = req.user.givenName.substring(givenNameLastIndex, 1).toLowerCase();
            var givenName = req.user.givenName;
            var calendar_name = ((giveNameLastLetter == 's') ? givenName + "' Bookings" : givenName + "'s Bookings");
            var calendar_description = "all bookings for " + req.user.fullName;

            // create new calendar
            timekit.createCalendar({
                name: calendar_name,
                description: calendar_description
            }).then((response) => {
                user.timekit_calendar_id = response.data.id;
                // save mongo user document and stormpath user
                saveUser(res, user, req.user);
            }).catch((response) => {
                res.status(500).send(response);
            });

        }).catch((response) => {
            res.status(500).send(response);
        });
    }
    // just save mongo user if isTest and stormpathuser is undefined
    else{
        saveUser(res, user);
    }


    // user.save((err) => {
    //     if (err)
    //         res.status(404).send(err);

    //     else {

    //         // update StormPath to include user model id 
    //         // if route reached by StormPath
    //         // authenticated endpoint.
    //         // doing this for faster access to look ups in student
    //         // and tutor and locations collections

    //         if (req.user && req.body.isTest != true) {
    //             console.log(user._id);

    //             req.user.customData.user_id = user._id;
    //             req.user.customData.save((err) => {
    //                 if (err) {
    //                     res.status(400).send(`Oops! There was an error: ${err.userMessage}`);
    //                 }
    //                 else
    //                     console.log(`_id: ${user._id}`)
    //                 res.json({ message: `StormPath Authenticated User: ${user.name} has been created!` });
    //             });
    //         }
    //         // otherwise ignore stormpath if not 
    //         // authenticated.
    //         else {
    //             console.log(`_id: ${user._id}`)
    //             res.json({ message: `User: ${user.name} has been created!` });
    //         }
    //     }
    // });
});

// update for the current user
// expects full objects, not meant for appending data
router.post('/update', function (req, res) {
    console.log(`${req.ip} is doing a POST via /users/update`)


    if (req.body.user_id != null)
        var userid = mongoose.Types.ObjectId(req.body.user_id);
    else
        var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

    User.findOne({ _id: userid }, (err, user) => {
        if (req.body.name != null)
            user.name = req.body.name;
        if (req.body.age != null)
            user.age = req.body.age;
        if (req.body.location != null)
            user.location = req.body.location;
        if (req.body.education != null)
            user.education = req.body.education;
        if (req.body.usergroups != null)
            user.usergroups = req.body.usergroups;
        if (req.body.image_url != null)
            user.image_url = req.body.image_url;
        if (req.body.fcm_tokens != null)
            user.fcm_tokens = req.body.fcm_tokens;
        if (req.body.about != null)
            user.about = req.body.about;
        if (req.body.defaultlocation != null)
            user.defaultlocation = req.body.defaultlocation;
        if (req.body.userMode != null)
            user.userMode = req.body.userMode;
        if (req.body.student != null)
            user.student = req.body.student;
        if (req.body.tutor != null)
            user.tutor = req.body.tutor;

        // change made to email and possibly also user_id
        if (req.body.email != null) {
            user.email = req.body.email;

            // If a Stormpath profile exists, change username on Stormpath account
            // and also update user model if stormpath save is successful
            if (req.user && req.body.isTest != true) {
                var oldEmail = req.user.email;
                req.user.email = req.body.email;
                req.user.username = req.body.email;
                // account for change in user_id
                if (req.body.user_id != null)
                    req.user.customData.user_id = userid;

                saveUser(res, user, req.user);
            }
            // If this is a test, regardless if req.user exists or not just update the mongodb user document
            else {
                saveUser(res, user);
            }
        }
        // change made to user_id but not email, update stormpath customData.user_id
        else if (req.body.user_id != null) {

            // If a Stormpath profile exists and not isTest, change customData.user_id 
            if (req.user && req.body.isTest != true) {

                // change user_id data to associate it with correct mongodb user document
                req.user.customData.user_id = userid;

                // save change
                saveUser(res, user, req.user);
            }
            // if test regardless of whether or not there's a stormpath user, just save mongodb user document
            else {
                saveUser(res, user);
            }

        }
        // no change to email or user_id just make change to mongodb document
        else {
            saveUser(res, user);
        }

    });
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
            if (err)
                res.status(404).send(err);
            res.json(user);
        });
    }
    else
        res.json(null);
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
router.delete('/deleteById/:id', (req, res) => {

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
router.delete('/deleteByEmail/:email', (req, res) => {

    console.log(`${req.ip} is doing a GET via /users/deleteUserByEmail/${req.params.email}`);

    User.remove({ email: req.params.email }, (err, commandResult) => {
        if (err) {
            res.status(404).send(err);
        }


        // If a Stormpath profile exists, delete Stormpath account
        if (req.user && req.body.isTest != true) {
            req.user.delete();
        }

        // commandResult is a command result, maybe investigate this further later
        res.json({ message: `${commandResult}` });
        console.log(`${commandResult}`);
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

        // FYI forEach is a blocking call, it is not asynchronous!!
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
            if (err)
                res.status(404).send(err);
            user.fcm_tokens.push(fcm_token);
            user.save((err, updated_user, numAffected) => {
                if (err)
                    res.status(404).send(err);
                if (numAffected = 1) {
                    res.json("{message: fcm_token updated}");
                }
            });
        });
    }
    else {
        res.json(null);
    }
});



router.get('/me/timekit', (req, res) => {
    console.log(`${req.ip} is doing a GET via /me/timekit`);

    if (req.user) {

        var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

        User.findOne({ _id: userid }, (err, user) => {
            if (err)
                res.status(404).send(err);

            // if timekit token already exists return user info
            if (user.timekit_token != null) {

                if (req.user.email != null) {
                    timekit.setUser(req.user.email, user.timekit_token);
                    // return user info
                    timekit.getUserInfo().then((response) => {
                        res.json(response.data);
                    }).catch((response) => {
                        res.status(500).send(response.error);
                    });
                }
                else
                    res.status(500).send({ message: 'email address required!' });
            }
            else
                res.status(500).send({ message: 'timekit_token is null!' });
        });
    }
    else {
        req.status(500).send({ message: 'this endpoint requires authentication!' });
    }

});

/**
 * checks to see if timekit token is set, if not creates one and
 * assigns it to this user, returns back timekit user info
 * requires authenticated stormpath user. 
 */
router.post('/me/timekit', (req, res) => {
    console.log(`${req.ip} is doing a POST via /me/timekit`);

    if (req.user) {

        var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

        User.findOne({ _id: userid }, (err, user) => {
            if (err)
                res.status(404).send(err);

            if (user.timekit_token == null) {

                if (req.user.email != null) {

                    timekit.createUser({
                        email: req.user.email,
                        timezone: (req.body.timezone ? req.body.timezone : 'America/Chicago'),
                        first_name: req.user.givenName,
                        last_name: req.user.surname
                    }).then((response) => {
                        user.timekit_token = response.data.api_token;
                        saveUser(res, user);
                    }).catch((response) => {
                        res.status(500).send(response);
                    });

                }
                else
                    res.status(500).send({ message: 'email address required!' });
            }
            else
                res.status(500).send({ message: 'timekit_token is already set' });
        });

    }
    else
        req.status(500).send({ message: 'this endpoint requires authentication!' });
});

/**
 * Returns the a list of timekit.io calendars for logged in users
 */
router.get('/me/timekit/calendar', (req, res) => {
    console.log(`${req.ip} is doing a GET via /me/timekit/calendars`);

    if (req.user) {

        var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

        User.findOne({ _id: userid }, (err, user) => {
            if (err)
                res.status(404).send(err);

            // if timekit token already exists return user info
            if (user.timekit_token != null) {

                if (req.user.email != null) {
                    timekit.setUser(req.user.email, user.timekit_token);
                    timekit.getCalendars().then((response) => {
                        res.json(response.data);
                    }).catch((response) => {
                        res.status(401).send(response);
                    });
                }
                else
                    res.status(500).send({ message: 'email address required!' });
            }
            else
                res.status(500).send({ message: 'timekit.io token required' });
        });
    }
    else {
        req.status(500).send({ message: 'this endpoint requires authentication!' });
    }
});

/**
 * Create New timekit.io Calendar for an existing user if one doesn't exist
 */
router.post('/me/timekit/calendar', (req, res) => {
    console.log(`${req.ip} is doing a POST via /me/timekit/calendars`);

    if (req.user) {

        var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

        User.findOne({ _id: userid }, (err, user) => {
            if (err)
                res.status(404).send(err);

            if (user.timekit_token != null) {

                if (req.user.email != null) {
                    
                    if(user.timekit_calendar_id == null){

                        timekit.setUser(req.user.email, user.timekit_token);

                        var givenNameLastIndex = req.user.givenName.length - 1;
                        var giveNameLastLetter = req.user.givenName.substring(givenNameLastIndex, 1).toLowerCase();
                        var givenName = req.user.givenName;
                        var calendar_name = ((giveNameLastLetter == 's') ? givenName + "' Bookings" : givenName + "'s Bookings");
                        var calendar_description = "all bookings for " + req.user.fullName;

                        // create new calendar
                        timekit.createCalendar({
                            name: calendar_name,
                            description: calendar_description
                        }).then((response) => {
                            user.timekit_calendar_id = response.data.id;
                            saveUser(res, user);

                        }).catch((response) => {
                            res.status(500).send(response);
                        });
                    }
                    else
                        res.status(500).send({ message: 'calendar already exists!' });
                }   
                else
                    res.status(500).send({ message: 'email address required!' });
            }
            else
                res.status(500).send({ message: 'timekit.io token required' });

        });
    }
    else {
        req.status(500).send({ message: 'this endpoint requires authentication!' });
    }
});


// need api to push new education objects
// if (req.body.education != null)
// {
//     console.log(req.body.education);
//     console.log(user.education);
//     user.education[0].school = req.body.eduction.school;
//     user.education[0].field = req.body.eduction.field;
//     user.education[0].degree = req.body.eduction.degree;
//     user.education[0].year = req.body.eduction.year;
//     user.education[0].inProgress = req.body.eduction.inProgress;
// }

module.exports = router;