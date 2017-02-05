var users = require('./users');
var tutors = require('./tutors');
var students = require('./students');
var tutorLocs = require('./tutorlocations');
var studentLocs = require('./studentlocations');

module.exports.set = function (app) {

    users.set(app);
    tutors.set(app);
    students.set(app);
    tutorLocs.set(app);
    studentLocs.set(app);
}