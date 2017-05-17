const router = require('express').Router();
const TutorLocation = require('../models/tutorlocation.js');
const Location = require('../models/schemas/location.js').model;
const dateFormat = require('dateformat');
const User = require('../models/user.js');
const mongoose = require('mongoose');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// Update logged in user location (accessed via post http://localhost:8080/api/locations/me/:lon/:lat)
router.put ('/me/:lon/:lat', (req, res) => {
  console.log(`${req.ip} is doing a PUT via /apiauth/locations/me/:lon/:lat`);

    if (req.user) {
        User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, user) => {
            if (err)
                res.status(404).send(err);

            user.location = { coordinates: [(req.params.lon).valueOf(), (req.params.lat).valueOf()], type: "Point" };
            // The modifiedAt filed contains latest time of update

            user.save( (err) => {
                if(err)
                    res.status(404).send(err);
                res.json("Location updated");
            });

        });
    }
    else
        res.json(null);

});


// Get logged in users locations
router.get('/me', (req, res) => {
  console.log(`${req.ip} is doing a GET via /apiauth/locations/me`);

    if (req.user) {
        User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, user) => {
            if (err)
                res.status(404).send(err);
            res.json(user.location);
        });
    }
    else
        res.json(null);
});

// Get tutor location by userName

// router.get('/:email', (req,res) => {
//     console.log(`${req.ip} is doing a GET via /tutorlocations/${req.params.email}`);
//
//     User.findOne({ email: req.params.email}, (err, user) => {
//         TutorLocation.findOne({ user_id: user._id }, (err, location) => {
//             if (err)
//                 res.status(404).send(err);
//
//             res.json(location);
//         });
//     });
// });

//do a spatial query given a distance in mile (:distance) and a longitude (:lon) and latitude (:lat) coordinate in decimal degrees

// router.get('/findWithin/milesLonLat/:distance/:lon/:lat', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /findWithin/milesLonLat/${req.params.distance}/${req.params.lon}/${req.params.lat}`);
//
//     // conversion to miles to meters
//     var distance = req.params.distance * METERS_IN_MILES;
//
//     var geoSpatialQuery = TutorLocation.find({
//         'location': {
//             $nearSphere: {
//                 $geometry: {
//                     type: "Point",
//                     coordinates: [req.params.lon, req.params.lat]
//                 },
//                 $maxDistance: distance
//             }
//         }
//     });
//
//     geoSpatialQuery.exec((err, tutors) => {
//         if (err)
//             res.status(404).send(err);
//
//         res.json(tutors);
//     });
// });

module.exports = router;
