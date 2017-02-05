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
    
    var studentLocation = new StudentLocation();
    studentLocation.user_id = req.body.user_id;
    studentLocation.createdAt = date.getTime();
    studentLocation.location = req.body.location;

    studentLocation.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A student location has been created!`});
    });
});

// Get all student locations
router.get( (req, res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations`)

    StudentLocation.find( (err, locations) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(locations);
    })
});

// Get student location by userName
router.get('/:userName', (req,res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        StudentLocation.findOne({ user_id: user._id }, (err, loc) => {
            if (err)
                res.status(404).send(err);
            
            res.json(loc);
        }); 
    });
});

module.exports = router;