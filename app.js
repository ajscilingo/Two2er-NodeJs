// connect to our MongoDB through mongoose module
const mongoose = require('mongoose');

// // Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';

// Connect to MongoDB through mongoose
// connection seems to timeout after sometime
// going to add some attributes as noted here
// http://stackoverflow.com/questions/40585705/connection-timeout-for-mongodb-using-mongoose
// mongoose.connect(url)
// updated the socketOption connectionTimeout to connectTimeoutMS as stated here 
// http://mongodb.github.io/node-mongodb-native/2.1/api/Server.html
mongoose.connect(url, {
    server : {
        socketOptions : {
            socketTimeoutMS: 0,
            connectTimeoutMS: 30000
        }
    }
});


// express module is needed for running as an http server
const express = require('express');

// bodyparse is needed for letting us get data from post
const bodyParser = require('body-parser');

const User = require('./user.js');
const Student = require('./student.js');
const Tutor = require('./tutor.js');
const StudentLocation = require('./studentlocation.js');
const TutorLocation = require('./tutorlocation.js');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// listen on port 8080 unless otherwise specified
var port = process.env.PORT || 8081; 

//Route our APIs
var router = express.Router();  //get an instance of the express Router

// middleware for all our requests
router.use( (req, res, next) => {

    // do some logging 
    console.log(`${req.ip} has connected`);
    next(); // make sure we go to the next route and not stop here
});

router.get('/', (req, res) => {
    // some logging 
    console.log(`${req.ip} is doing a GET via /api`)
    res.json({message: 'Two2er API'});
});

router.route('/users')

// add a new user (accessed via post http://localhost:8080/api/users)
.post ( (req, res) => {

    // JSON attribute order seems to be dictated here in reverse
    // so if your attribute to appear first in your JSON object enter it last
    // e.g if user.name is last it will appear first in the JSON 

    var user = new User();
    user.location = req.body.location;
    user.age = req.body.age;
    user.userName = req.body.userName;
    user.name = req.body.name;
    
    // some logging 
    console.log(`${req.ip} is doing a POST via /users`)

    user.save( (err) => {
        if(err) 
            req.send(err);
        
        res.json({message: `User: ${user.name} has been created!`});
    });

})

// get all the users (accessed via GET http://localhost:8080/api/users)
.get( (req, res) => {

    // some logging 
    console.log(`${req.ip} is doing a GET via /users`)

    User.find( (err, users) => {
        if(err) 
            res.send(err);
        
        res.json(users);
    })

});

router.route('/users/:user_name')
// get user with name like user_name (accessed via GET http://localhost:8080/api/users/<username>)
.get( (req,res) => {
    
    // some logging 
    console.log(`${req.ip} is doing a GET via /users/${req.params.user_name}`)
    
    User.findOne({ name: req.params.user_name}, (err, user) => {
        if(err) 
            res.send(err);
        res.json({message: user});
    });
});

router.route('/students')
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

router.route('/tutors')
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
});

router.route('/studentlocations')
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

router.route('/tutorlocations')
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

app.use('/api', router);

app.listen(port);
console.log('Listening on port ' + port);

