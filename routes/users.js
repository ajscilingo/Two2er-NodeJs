const router = require('express').Router();
const User = require('../models/user.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

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
    user.location = req.body.location;
    user.age = req.body.age;
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
router.get( '/', function (req, res) {

    // some logging 
    console.log(`${req.ip} is doing a GET via /users`);

    User.find( (err, users) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(users);
    })
});

// get user with name like <name> (accessed via GET http://localhost:8080/api/users/<name>)
router.get('/getUserByName/:name', function (req, res) {    
    // some logging 
    console.log(`${req.ip} is doing a GET via /users/getUserByName/${req.params.name}`);
    
    User.findOne({ name: req.params.name}, (err, user) => {
        if(err) 
            res.status(404).send(err);
        res.json(user);
    });
});

// get user by email 
router.get('/getUserByEmail/:email', function (req, res) {

    console.log(`${req.ip} is doing a GET via /users/getUserByEmail/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        if(err)
            res.status(404).send(err);
        res.json(user);
    });
});

//get user by mongo _id field
router.get('/getUserById/:id', function(req, res){

    console.log(`${req.ip} is doing a GET via /uses/getUserById/${req.params.id}`);

    var user_id = mongoose.Types.ObjectId(req.params.id);

    User.findOne({ _id: user_id}, (err, user) => {
        if(err)
            res.status(404).send(err);
        res.json(user);
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


module.exports = router;