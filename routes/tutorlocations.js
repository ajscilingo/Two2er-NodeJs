const router = require('express').Router();
const TutorLocation = require('../models/tutorlocation.js');
const dateFormat = require('dateformat');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// add to student location (accessed via post http://localhost:8080/api/tutorlocations)
router.post ('/', (req, res) => {
    var date = new Date();
    
    if (req.body.user_id != null)
        var user_id = req.body.user_id;
    else
        var user_id = req.user.customData.user_id;

    var tutorLocation = new TutorLocation();
    tutorLocation.user_id = user_id;
    tutorLocation.createdAt = date.getTime();
    tutorLocation.location = req.body.location;

    tutorLocation.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A tutor location has been created!`});
    });
});

// Get all tutor locations
router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /tutorlocations`)

    TutorLocation.find( (err, locations) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(locations);
    })
});

// Get tutor location by userName
router.get('/:email', (req,res) => {
    console.log(`${req.ip} is doing a GET via /tutorlocations/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        TutorLocation.findOne({ user_id: user._id }, (err, location) => {
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

    var geoSpatialQuery = TutorLocation.find({
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

    geoSpatialQuery.exec((err, tutors) => {
        if (err)
            res.status(404).send(err);

        res.json(tutors);
    });
});

module.exports = router;