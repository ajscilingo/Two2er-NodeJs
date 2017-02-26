const router = require('express').Router();
const Tutor = require('../models/tutor.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

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

router.post('/update', (req, res) => {
    if (req.body.user_id != null)
        var userid = req.body.user_id;
    else
        var userid = req.user.customData.user_id;
    Tutor.findOne({user_id : userid}, (err, tut) => {
        if (err)
            console.log(err);
        if (req.body.subjects != null)
            tut.subjects = req.body.subjects;
        if (req.body.rating != null)
            tut.rating = req.body.rating;
        if (req.body.qualification != null)
            tut.qualification = req.body.qualification;
        if (req.body.score != null)
            tut.score = req.body.score;
        if (req.body.availabilitynow != null)
            tut.availabilitynow = req.body.availabilitynow;
        tut.save((err) => {
            if (err)
                console.log(err);
        });
        res.json(tut);
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

// delete tutor by user_id
router.get('/deleteByUserId/:user_id', (req, res) => {
    console.log(`${req.ip} is doing a GET via /tutors/deleteByUserId/${req.params.user_id}`);
    
    var user_id = mongoose.Types.ObjectId(req.params.user_id);

    Tutor.remove({user_id: req.params.user_id}, (err, commandResult) => {
        if(err)
            res.status(404).send(err);
        // commandResult is a command result, maybe investigate this further later
        res.json({message: `Tutor ${req.params.user_id} removed`});
        console.log(`Tutor ${req.params.user_id} removed`);
    });
});

module.exports = router;