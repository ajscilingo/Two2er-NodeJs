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
    
    var tutorLocation = new TutorLocation();
    tutorLocation.user_id = req.body.user_id;
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
router.get('/:userName', (req,res) => {
    console.log(`${req.ip} is doing a GET via /tutorlocations/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        TutorLocation.findOne({ user_id: user._id }, (err, loc) => {
            if (err)
                res.status(404).send(err);
            
            res.json(loc);
        }); 
    });
});

module.exports = router;