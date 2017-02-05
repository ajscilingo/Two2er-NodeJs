var router = require('express').Router();
const TutorLocation = require('../models/tutorlocation.js');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.route('/')
// add to student location (accessed via post http://localhost:8080/api/tutorlocations)
.post ( (req, res) => {
    var date = new Date();
    
    var tutorLocation = new TutorLocation();
    tutorLocation.user_id = req.body.user_id;
    tutorLocation.createdAt = date.getTime();
    tutorLocation.location = req.body.location;

    tutorLocation.save( (err) => {
        if(err) 
            req.send(err);
        
        res.json({message: `A tutor location has been created!`});
    });
})
// Get all tutor locations
.get( (req, res) => {
    console.log(`${req.ip} is doing a GET via /tutorlocations`)

    TutorLocation.find( (err, locations) => {
        if(err) 
            res.send(err);
        
        res.json(locations);
    })
});

// Get tutor location by userName
router.route('/:userName')
.get( (req,res) => {
    console.log(`${req.ip} is doing a GET via /tutorlocations/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        TutorLocation.findOne({ user_id: user._id }, (err, loc) => {
            if (err)
                res.send(err);
            
            res.json(loc);
        }); 
    });
});

module.exports = router;