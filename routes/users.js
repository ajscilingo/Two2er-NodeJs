const router = require('express').Router();
const User = require('../models/user.js');
const Tutor = require('../models/tutor.js');
const Student = require('../models/student.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');
const kml = require('tokml');

// a middleware function with no mount path. This code is executed for every request to the router
router.use( (req, res, next) => {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});


// add a new user (accessed via post http://localhost:8080/api/users)
router.post ( '/', function (req, res) {
    
    // JSON attribute order seems to be dictated here in reverse
    // so if your attribute to appear first in your JSON object enter it last
    // e.g if user.name is last it will appear first in the JSON 

    var user = new User();
    // if no location is provided create default location 
    user.location = (req.body.location ? req.body.location : {type: "Point", coordinates: [-87.625475, 41.878294]});
    // if no age provided default to 0
    user.age = (req.body.age ? req.body.age : 0);
    user.email = req.body.email;        
    user.name = req.body.name;
    
    // some logging 
    console.log(`${req.ip} is doing a POST via /users`)

    user.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `User: ${user.name} has been created!`});
    });
});

// get all the users (accessed via GET http://localhost:8080/api/users)
router.get( '/', (req, res) => {
    // some logging 
    console.log(`${req.ip} is doing a GET via /users`);

    User.find( (err, users) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(users);
    });
});

// get user with name like <name> (accessed via GET http://localhost:8080/api/users/<name>)
router.get('/getUserByName/:name', (req, res) => {    
    // some logging 
    console.log(`${req.ip} is doing a GET via /users/getUserByName/${req.params.name}`);
    
    User.findOne({ name: req.params.name}, (err, user) => {
        if(err) 
            res.status(404).send(err);
        res.json(user);
    });
});

// get user by email 
router.get('/getUserByEmail/:email', (req, res) => {

    console.log(`${req.ip} is doing a GET via /users/getUserByEmail/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        if(err)
            res.status(404).send(err);
        res.json(user);
    });
});

//get user by mongo _id field
router.get('/getUserById/:id', (req, res) => {
    console.log(`${req.ip} is doing a GET via /uses/getUserById/${req.params.id}`);
    
    try
    {
        var user_id = mongoose.Types.ObjectId(req.params.id);
        User.findOne({ _id: user_id}, (err, user) => {
            if(err)
                res.status(404).send(err);
            res.json(user);
        });
    }
    catch (ex)
    {
        //console.log(ex);
        res.json(null);
    }
});

// delete user from user collection by mongo _id field 
// does not delete from student or tutor collections
router.get('/deleteById/:id', (req, res) => {
   
    console.log(`${req.ip} is doing a GET via /users/deleteUserById/${req.params.id}`);

    var user_id = mongoose.Types.ObjectId(req.params.id);

    User.remove({_id : user_id}, (err, commandResult) => {
        if(err)
            res.status(404).send(err);
        // commandResult is a command result, maybe investigate this further later
        res.json({message: `User ${user_id} removed`});
        console.log(`User ${user_id} removed`);
    });
});

// deletes user by email, also deletes corresponding 
// document in tutors and students collections
router.get('/deleteByEmail/:email', (req, res) => {

    console.log(`${req.ip} is doing a GET via /users/deleteUserByEmail/${req.params.email}`);

    User.findOne({ email : req.params.email }, (err, user) => {
        if(err)
            res.status(404).send(err);
        else{
            Tutor.remove({ user_id: user._id}, (err, commandResult) => {
                if(err)
                    res.status(404).send(err);
                else{
                    Student.remove({ user_id: user._id}, (err, commandResult) => {
                        if(err)
                            res.status(404).send(err);
                        else
                            user.remove( (err, product) => {
                                if(err)
                                    res.status(404).send(err);
                                else
                                    res.json({message: `User ${user._id} removed`})
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
        'location' : {
            $nearSphere : {
                $geometry : {
                    type: "Point",
                    coordinates : [req.params.lon, 
                                   req.params.lat 
                                ]
                },
                $maxDistance : distance
            }
        }   
    });

    geoSpatialQuery.exec( (err, users) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(users);
    });
});

router.get('/exportToKML', (req, res) => {
     console.log(`${req.ip} is doing a GET via /exportToKML`);
     
     // locations as KML
     var locations = {type : "FeatureCollection", features : []};

     User.find( (err, users) => {
        if(err) 
            res.status(404).send(err);

        users.forEach( (user) => {
            locations.features.push({type: "Feature", geometry: user.location, properties: {name: user.name, age: user.age, email: user.email}});
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

module.exports = router;