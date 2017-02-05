const router = require('express').Router();
const Student = require('../models/student.js');
const dateFormat = require('dateformat');

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

    console.log(`${req.ip} is doing a POST via /students`)

    student.save( (err) => {
        if(err) 
            res.status(404).send(err);
        
        res.json({message: `A student has been created!`});
    });
});

// Get all students
router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /students`)

    Student.find( (err, students) => {
        if(err) 
            res.status(404).send(err);
        
        res.json(students);
    })
});

// Get student by userName
router.get('/:userName',(req,res) => {
    console.log(`${req.ip} is doing a GET via /students/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        Student.findOne({ user_id: user._id }, (err, stu) => {
            if (err)
                res.status(404).send(err);
            
            res.json(stu);
        }); 
    });
});

module.exports = router;