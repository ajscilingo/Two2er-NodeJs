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
    if(route != null){
        userRoutes.push(route.api);
        userRoutes.push(route.apiauth);
    }
});

// populate tutorRoutes
tutors.stack.forEach( (r) => {
    var route = getRoute("tutors", r) 
    if(route != null){
        tutorRoutes.push(route.api);
        tutorRoutes.push(route.apiauth);
    }
});

// populate studentRoutes
students.stack.forEach( (r) => {
    var route = getRoute("students", r) 
    if(route != null){
        studentRoutes.push(route.api);
        studentRoutes.push(route.apiauth);
    }
});

// populate tutorLocationRoutes
tutorLocations.stack.forEach( (r) => {
    var route = getRoute("tutorlocations", r) 
    if(route != null){
        tutorLocationRoutes.push(route.api);
        tutorLocationRoutes.push(route.apiauth);
    }
});

// populate studentLocationRoutes
studentLocations.stack.forEach( (r) => {
    var route = getRoute("studentlocations", r) 
    if(route != null){
        studentLocationRoutes.push(route.api);
        studentLocationRoutes.push(route.apiauth);
    }
        
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
               route = {apiauth:["GET", "/apiauth/" + rname + r.route.path], api:["GET", "/api/" + rname + r.route.path]};
            }
            else if(methods.post && methods.post == true){
                route = {apiauth:["POST", "/apiauth/" + rname + r.route.path], api:["POST", "/api/" + rname + r.route.path]};
            }
            else if(methods.delete && methods.delete == true){
                route = {apiauth:["DELETE", "/apiauth/" + rname + r.route.path], api:["DELETE", "/api/" + rname + r.route.path]};
            }
        }
        
    }
    return route;
}    


module.exports = router;