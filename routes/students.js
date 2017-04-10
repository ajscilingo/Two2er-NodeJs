const router = require('express').Router();
const StudentSchema = require('../models/schemas/student.js').schema;
const Student = require('../models/schemas/student.js').model;
const User = require('../models/user.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// creates new student document with course data for user (accessed via post http://localhost:8080/api/students)
router.post ('/', (req, res) => {
    
    console.log(`${req.ip} is doing a POST via /students`);
    // student documents are embedded into the user document
    // so now we always get user_id from current user
    
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
            // create new student document
            
            if(req.body.student != null)
                user.student = req.body.student;
            else
                user.student = new Student();

            user.save((err) => {
                if (err)
                    res.status(404).send(err);
                res.json({message: `A student document has been created for ${user_id}!`});
            });
            
        });
    }
    else
        res.json({message: 'user_id not found'});
});

// updates current user's student document with latest course data
router.post('/update', (req, res) => {
    
    console.log(`${req.ip} is doing a POST via /students/update`);

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
            // create new student document
            
            if(user.student != null && req.body.courses != null){
                user.student.courses = user.student.courses.concat(req.body.courses);
                user.markModified("student.courses");
            }

            user.save((err) => {
                if (err)
                    res.status(404).send(err);
                res.json({message: `student data updated for ${user_id}!`});
            });
            
        });
    }
    else
        res.json({message: 'user_id not found'});
    
});

router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /students`);

    User.find({student: {$exists: true}}, (err, students) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(students);
    });
});

module.exports = router;