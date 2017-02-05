const router = require('express').Router();
const Tutor = require('../models/tutor.js');
const dateFormat = require('dateformat');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// add a new user (accessed via post http://localhost:8080/api/tutors)
router.post('/', (req, res) => {
    var tutor = new Tutor();
    tutor.subjects = req.body.subjects;
    tutor.user_id = req.body.user_id;

    console.log(`${req.ip} is doing a POST via /tutors`);

    tutor.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A tutor has been created!`});
    });
});

// Get all tutors
router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /tutors`);

    Tutor.find( (err, tutors) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(tutors);
    })
});

// Get tutor by email
router.get('/:email', (req,res) => {
    console.log(`${req.ip} is doing a GET via /tutors/${req.params.email}`)

    User.findOne({ email: req.params.email}, (err, user) => {
        Tutor.findOne({ user_id: user._id }, (err, tutor) => {
            if (err)
                res.status(404).send(err);
            
            res.json(tutor);
        }); 
    });
});

module.exports = router;