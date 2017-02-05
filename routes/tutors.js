var router = require('express').Router();
const Tutor = require('../models/tutor.js');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.route('/')
// add a new user (accessed via post http://localhost:8080/api/tutors)
.post ( (req, res) => {
    var tutor = new Tutor();
    tutor.subjects = req.body.subjects;
    tutor.user_id = req.body.user_id;

    console.log(`${req.ip} is doing a POST via /tutors`)

    tutor.save( (err) => {
        if(err) 
            req.send(err);
        
        res.json({message: `A tutor has been created!`});
    });
})
// Get all tutors
.get( (req, res) => {
    console.log(`${req.ip} is doing a GET via /tutors`)

    Tutor.find( (err, tutors) => {
        if(err) 
            res.send(err);
        
        res.json(tutors);
    })
})

// Get tutor by userName
router.route('/:userName')
.get( (req,res) => {
    console.log(`${req.ip} is doing a GET via /tutors/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        Tutor.findOne({ user_id: user._id }, (err, tutor) => {
            if (err)
                res.send(err);
            
            res.json(tutor);
        }); 
    });
});

module.exports = router;