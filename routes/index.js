const router = require('express').Router();
const dateFormat = require('dateformat');

// loading the different possible routes
const users = require('./users.js');
const tutors = require('./tutors.js');
const students = require('./students.js');
const tutorLocations = require('./tutorlocations.js');
const studentLocations = require('./studentlocations.js');

// using arrays to store the route method (e.g. GET,POST) and http endpoint
var userRoutes = [];
var tutorRoutes = [];
var studentRoutes = [];
var tutorLocationRoutes = [];
var studentLocationRoutes = [];

// populate userRoutes
users.stack.forEach( (r) => {
    var route = getRoute("users", r) 
    if(route != null)
        userRoutes.push(route);
});

// populate tutorRoutes
tutors.stack.forEach( (r) => {
    var route = getRoute("tutors", r) 
    if(route != null)
        tutorRoutes.push(route);
});

// populate studentRoutes
students.stack.forEach( (r) => {
    var route = getRoute("students", r) 
    if(route != null)
        studentRoutes.push(route);
});

// populate tutorLocationRoutes
tutorLocations.stack.forEach( (r) => {
    var route = getRoute("tutorlocations", r) 
    if(route != null)
        tutorLocationRoutes.push(route);
});

// populate studentLocationRoutes
studentLocations.stack.forEach( (r) => {
    var route = getRoute("studentlocations", r) 
    if(route != null)
        studentLocationRoutes.push(route);
});

router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

router.get('/', (req, res) =>{
    res.render("index", {
        captionSection: "Routes",
        userRoutes : userRoutes,
        tutorRoutes: tutorRoutes,
        studentRoutes: studentRoutes,
        tutorLocationRoutes: tutorLocationRoutes,
        studentLocationRoutes: studentLocationRoutes   
    });
});

// helper function to populate route arrays with method (e.g. GET, POST) and http endpoint
// takes in the route name definited in app.js as well as the actual router r definied by the separate routes
function getRoute(rname, r) {
     var route = null;
     if(r.route && r.route.path){
        if(r.route.methods){
            var methods = r.route.methods;
            if(methods.get && methods.get == true){
               route = ["GET", "/api/" + rname + r.route.path];
            }
            else if(methods.post && methods.post == true){
                route = ["POST", "/api/" + rname + r.route.path];
            }
        }
        
    }
    return route;
}    


module.exports = router;