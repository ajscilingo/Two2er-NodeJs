var router = require('express').Router();
const User = require('../models/user.js');

// add a new user (accessed via post http://localhost:8080/api/users)
router.post ( '/', function (req, res) {
    
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
router.get( '/', function (req, res) {

    // some logging 
    console.log(`${req.ip} is doing a GET via /users`)

    User.find( (err, users) => {
        if(err) 
            res.send(err);
        
        res.json(users);
    })
});

router.get('/:user_name', function (req, res) {
// get user with name like user_name (accessed via GET http://localhost:8080/api/users/<username>)
    
    // some logging 
    console.log(`${req.ip} is doing a GET via /users/${req.params.user_name}`)
    
    User.findOne({ name: req.params.user_name}, (err, user) => {
        if(err) 
            res.send(err);
        res.json({message: user});
    });
});

module.exports = router;