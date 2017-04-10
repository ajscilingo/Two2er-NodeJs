const router = require('express').Router();
const TutorSchema = require('../models/schemas/tutor.js').schema;
const Tutor = require('../models/schemas/tutor.js').model;
const User = require('../models/user.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// creates a new tutor document for user (accessed via post http://localhost:8080/api/tutors)
router.post('/', (req, res) => {
   
    console.log(`${req.ip} is doing a POST via /tutors`);
    
    // if case in place for testing purposes when not logged in through stormpath
    // if logged in through stormpath there's no need to post with a user_id 
    // parameter as this will be obtained through the req.user data
    if (req.body.user_id != null)
        var user_id = req.body.user_id;
    else
        var user_id = req.user.customData.user_id;

    if(user_id != null){ 
        
        User.findById(mongoose.Types.ObjectId(user_id), (err, user) => {
            if(err)
                res.status(404).send(err);
            
            // create new tutor document
            if(req.body.tutor != null)
                user.tutor = req.body.tutor;
            else{
                user.tutor = new Tutor();
                user.tutor.rating = 5;
                user.tutor.isAvailableNow = false;
                user.tutor.subjects = ["Math", "English"];
            }
            
             user.save((err) => {
                if (err)
                    res.status(404).send(err);
                res.json({message: `A tutor document has been created for ${user_id}!`});
            });
        });
    }
    else
        res.json({message: 'user_id not found'});
});

router.post('/update', (req, res) => {

    console.log(`${req.ip} is doing a POST via /tutors/update`);
    
    // if case in place for testing purposes when not logged in through stormpath
    // if logged in through stormpath there's no need to post with a user_id 
    // parameter as this will be obtained through the req.user data
    if (req.body.user_id != null)
        var user_id = req.body.user_id;
    else
        var user_id = req.user.customData.user_id;

    if(user_id != null){ 
        
        User.findById(mongoose.Types.ObjectId(user_id), (err, user) => {
            if(err)
                res.status(404).send(err);
            
            // create new tutor document
            if(user.tutor != null){
                
                if(req.body.rating != null){
                    user.tutor.rating = req.body.rating;
                    user.markModified("tutor.rating");
                }
                
                if(req.body.isAvailableNow != null){
                    user.tutor.isAvailableNow = req.body.isAvailableNow;
                    user.markModified("tutor.isAvailableNow");
                }
                
                if(req.body.subjects != null){
                    if(user.tutor.subjects != null)
                        user.tutor.subjects = user.tutor.subjects.concat(req.body.subjects);
                    else
                        user.tutor.subjects = req.body.subjects;
                    user.markModified("tutor.subjects");
                }
                
            }
        
            user.save((err) => {
                if (err)
                    res.status(404).send(err);
                res.json({message: `Tutor data updated for ${user_id}!`});
            });
        });
    }
    else
        res.json({message: 'user_id not found'});

});

// Get all tutors
// router.get('/', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /tutors`);

//     Tutor.find( (err, tutors) => {
//         if(err) 
//             res.status(404).send(err);
        
//         res.json(tutors);
//     })
// });


module.exports = router;