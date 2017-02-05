var router = require('express').Router();
const StudentLocation = require('../models/studentlocation.js');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.route('/')
// add to student location (accessed via post http://localhost:8080/api/studentlocations)
.post ( (req, res) => {
    var date = new Date();
    
    var stuLocation = new StudentLocation();
    stuLocation.user_id = req.body.user_id;
    stuLocation.createdAt = date.getTime();
    stuLocation.location = req.body.location;

    stuLocation.save( (err) => {
        if(err) 
            req.send(err);
        
        res.json({message: `A student location has been created!`});
    });
})
// Get all student locations
.get( (req, res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations`)

    StudentLocation.find( (err, locations) => {
        if(err) 
            res.send(err);
        
        res.json(locations);
    })
});

// Get student location by userName
router.route('/:userName')
.get( (req,res) => {
    console.log(`${req.ip} is doing a GET via /studentlocations/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        StudentLocation.findOne({ user_id: user._id }, (err, loc) => {
            if (err)
                res.send(err);
            
            res.json(loc);
        }); 
    });
});

module.exports = router;