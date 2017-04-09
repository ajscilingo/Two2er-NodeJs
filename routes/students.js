const router = require('express').Router();
const Student = require('../models/schemas/student.js');
const User = require('../models/user.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// add student course data (accessed via post http://localhost:8080/api/students)
router.post ('/', (req, res) => {
    
    console.log(`${req.ip} is doing a POST via /students`);
    // student documents are embedded into the user document
    // so now we always get user_id from current user
    
    // if case in place for testing purposes when not logged in through stormpath
    if (req.body.user_id != null)
        var user_id = req.body.user_id;
    else
        var user_id = req.user.customData.user_id;

    if(user_id != null){  
        User.findById(mongoose.Types.ObjectId(user_id), (err, user) => {
            if(err)
                res.status(404).send(err);
            // create new student document
            
            if(req.body.courses != null)
                user.student.courses = req.body.courses;

            user.save((err) => {
                if (err)
                    console.log(err);
                res.json({message: `A student has been created! for ${user_id}`});
            });
            
        });
    }
    else
        res.json({message: 'user_id not found'});
});

router.post('/update', (req, res) => {
    if (req.body.user_id != null)
        var userid = req.body.user_id;
    else
        var userid = req.user.customData.user_id;
    Student.findOne({user_id: userid}, (err, stu) => {
        if (err) 
            console.log(err);
        if (req.body.courses != null)
            stu.courses = req.body.courses;
        stu.save((err) => {
            if (err)
                console.log(err);
        });
        res.json(stu);
    });
});

// Get all students
// WE NEED TO DISCUSS THIS
// router.get('/', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /students`);

//     Student.find( (err, students) => {
//         if(err) 
//             res.status(404).send(err);
        
//         res.json(students);
//     })
// });

// Get student document for user by userName
router.get('/:email',(req,res) => {
    console.log(`${req.ip} is doing a GET via /students/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        if (err)
            res.status(404).send(err);
        res.json(user.student);
    });
});

// delete student by user_id
// NO LONGER APPLICABLE
// router.get('/deleteByUserId/:user_id', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /students/deleteByUserId/${req.params.user_id}`);
    
//     var user_id = mongoose.Types.ObjectId(req.params.user_id);

//     Student.remove({user_id: req.params.user_id}, (err, commandResult) => {
//         if(err)
//             res.status(404).send(err);
//         // commandResult is a command result, maybe investigate this further later
//         res.json({message: `Student ${req.params.user_id} removed`});
//         console.log(`Student ${req.params.user_id} removed`);
//     });
// });

module.exports = router;