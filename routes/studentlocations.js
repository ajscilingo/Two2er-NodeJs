const router = require('express').Router();
const StudentLocation = require('../models/studentlocation.js');
const dateFormat = require('dateformat');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// add to student location (accessed via post http://localhost:8080/api/studentlocations)
router.post ('/', (req, res) => {
    var date = new Date();
    
    if (req.body.user_id != null)
        var user_id = req.body.user_id;
    else
        var user_id = req.user.customData.user_id;
    
    var studentLocation = new StudentLocation();
    studentLocation.user_id = user_id;
    studentLocation.createdAt = date.getTime();
    studentLocation.location = req.body.location;

    studentLocation.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A student location has been created!`});
    });
});

// Get all student locations
router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations`);

    StudentLocation.find( (err, locations) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(locations);
    });
});

// Get student location by userName
router.get('/:email', (req,res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        StudentLocation.findOne({ user_id: user._id }, (err, location) => {
            if (err)
                res.status(404).send(err);
            
            res.json(location);
        }); 
    });
});

//do a spatial query given a distance in mile (:distance) and a longitude (:lon) and latitude (:lat) coordinate in decimal degrees
router.get('/findWithin/milesLonLat/:distance/:lon/:lat', (req, res) => {
    console.log(`${req.ip} is doing a GET via /findWithin/milesLonLat/${req.params.distance}/${req.params.lon}/${req.params.lat}`);

    // conversion to miles to meters 
    var distance = req.params.distance * METERS_IN_MILES;

    var geoSpatialQuery = StudentLocation.find({
        'location': {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [req.params.lon, req.params.lat]
                },
                $maxDistance: distance
            }
        }
    });

    geoSpatialQuery.exec((err, students) => {
        if (err)
            res.status(404).send(err);

        res.json(students);
    });
});

module.exports = router;