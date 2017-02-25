const router = require('express').Router();
const Student = require('../models/student.js');
const dateFormat = require('dateformat');
const mongoose = require('mongoose');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// add a new user (accessed via post http://localhost:8080/api/students)
router.post ('/', (req, res) => {
    var student = new Student();
    student.user_id = req.body.user_id;
    student.school = req.body.school;

    console.log(`${req.ip} is doing a POST via /students`);

    student.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A student has been created!`});
    });
});

router.post('/update', (req, res) => {
    var userid = req.user.customData.user_id;

    Student.findOne({user_id, userid}, (err, stu) => {
        if (req.body.courses != null)
            stu.courses = req.body.courses;
        if (req.body.school != null)
            stu.school = req.body.school;
        stu.save((err) => {
            if (err)
                console.log(err);
        });
        res.json(stu);
    });
});

// Get all students
router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /students`);

    Student.find( (err, students) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(students);
    })
});

// Get student by userName
router.get('/:email',(req,res) => {
    console.log(`${req.ip} is doing a GET via /students/${req.params.email}`);

    User.findOne({ email: req.params.email}, (err, user) => {
        Student.findOne({ user_id: user._id }, (err, student) => {
            if (err)
                res.status(404).send(err);
            
            res.json(student);
        }); 
    });
});

// delete student by user_id
router.get('/deleteByUserId/:user_id', (req, res) => {
    console.log(`${req.ip} is doing a GET via /students/deleteByUserId/${req.params.user_id}`);
    
    var user_id = mongoose.Types.ObjectId(req.params.user_id);

    Student.remove({user_id: req.params.user_id}, (err, commandResult) => {
        if(err)
            res.status(404).send(err);
        // commandResult is a command result, maybe investigate this further later
        res.json({message: `Student ${req.params.user_id} removed`});
        console.log(`Student ${req.params.user_id} removed`);
    });
});

module.exports = router;