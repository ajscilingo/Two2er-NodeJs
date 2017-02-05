var router = require('express').Router();
const Student = require('../models/student.js');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.route('/')
// add a new user (accessed via post http://localhost:8080/api/students)
.post ( (req, res) => {
    var student = new Student();
    student.user_id = req.body.user_id;
    student.school = req.body.school;

    console.log(`${req.ip} is doing a POST via /students`)

    student.save( (err) => {
        if(err) 
            req.send(err);
        
        res.json({message: `A student has been created!`});
    });
})
// Get all students
.get( (req, res) => {
    console.log(`${req.ip} is doing a GET via /students`)

    Student.find( (err, students) => {
        if(err) 
            res.send(err);
        
        res.json(students);
    })
});

// Get student by userName
router.route('/:userName')
.get( (req,res) => {
    console.log(`${req.ip} is doing a GET via /students/${req.params.userName}`)

    User.findOne({ userName: req.params.userName}, (err, user) => {
        Student.findOne({ user_id: user._id }, (err, stu) => {
            if (err)
                res.send(err);
            
            res.json(stu);
        }); 
    });
});

module.exports = router;