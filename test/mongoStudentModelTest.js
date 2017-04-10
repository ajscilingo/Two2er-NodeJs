/**
 * 
 * This testing module is used to test our mongo database 
 * without explicitly connecting through our Express REST API
 * 
 */

// connect to our MongoDB through mongoose module
const mongoose = require('mongoose');
// using nodejs's built-in assert
const assert = require('assert');
// Mongoose User and Student Models
const User = require('../models/user.js');
const StudentSchema = require('../models/schemas/student.js').schema;
const Student = require('../models/schemas/student.js').model;
// Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';
// Enums used for Educational Degrees
const Degree = require('../enums/degree.js');
// Enums used for User UserType
const UserType = require('../enums/usertype.js');

// change mongoose to use NodeJS global promises to supress promise deprication warning.
// https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

describe("MongoDB Student Model Test", function () {

    // Mocha Context Timeout
    this.timeout(10000);

    before(function connectionState(done) {
        
        // assert that we aren't connected to the database
        assert.equal(mongoose.connection.readyState, 0);

        // connect to the database 
        mongoose.connect(url, {
            server : {
                socketOptions : {
                        socketTimeoutMS: 0,
                        connectTimeoutMS: 30000
                }
            }
        }, (err) => {
        
            if(err)
                done(err);
            else{
                done();
            }
        });
    });

     after(function (done) {
        
        // assert that connection is still open
        assert.equal(mongoose.connection.readyState, 1);

        // disconnect from database
        mongoose.disconnect(function (error) {
            if(error) 
                done(error);
            else
                done();
        });

    });

    it("Create New User and Student Document", function createNewStudent(done) {
        
        // create new instance of User Model
        var user = new User();
        assert.notEqual(user, undefined);
        
        user.age = 19;
        user.email = "studentUser1234@two2er.com";
        user.name = "Student User 1234";
        user.location = {coordinates: [-87.6563, 41.935314], type: 'Point'};

        // Education History
        user.education.push({school: "DePaul University", field: "History", degree: "BA", year: 2019, inProgress: true});
        user.usergroups.push("Student");
        user.student = new Student();
        user.student.courses = ["MAT101", "ENG200", "SCI200", "HIS220"];

        user.save( (err, user_product, numAffected) => {
            if(err)
                done(err);
            // assert that new document exists
            assert.notEqual(user_product, undefined);
            // assert only 1 document affected
            assert.equal(numAffected, 1);
            // assert properties of document as specified 
            // above
            assert.equal(user_product.age, 19);
            assert.equal(user_product.email, "studentUser1234@two2er.com");
            assert.equal(user_product.name, "Student User 1234");
            assert.equal(user_product.location.type, "Point");
            assert.equal(user_product.location.coordinates[0], -87.6563);
            assert.equal(user_product.location.coordinates[1], 41.935314);
            assert.equal(user_product.education.length, 1);
            assert.equal(user_product.education[0].school, "DePaul University");
            assert.equal(user_product.education[0].field, "History");
            assert.equal(Degree.enumValueOf(user_product.education[0].degree), Degree.BA);
            assert.equal(user_product.education[0].year, 2019);
            assert.equal(user_product.education[0].inProgress, true);
            assert.equal(user_product.usergroups.length, 1);
            assert.equal(UserType.enumValueOf(user_product.usergroups[0]).isStudent(), true);
            assert.notEqual(user_product.student, undefined);
            assert.equal(user_product.student.courses.length, 4);
            assert.equal(user_product.student.courses[0], "MAT101");
            assert.equal(user_product.student.courses[1], "ENG200");
            assert.equal(user_product.student.courses[2], "SCI200");
            assert.equal(user_product.student.courses[3], "HIS220");
            done();
        });

    });

    it("Update User With Student Document", function updateUserWithStudentDocument(done){

        User.findOne({email: "studentUser1234@two2er.com"}, (err, user) => {
            if(err)
                done(err);
            assert.notEqual(user, undefined);
            // assert properties of document as specified 
            // above
            // test properties before update
            assert.notEqual(user.age, undefined);
            assert.equal(user.age, 19);
            assert.notEqual(user.student, undefined);
            assert.equal(user.student.courses.length, 4);
            assert.equal(user.student.courses[0], "MAT101");
            assert.equal(user.student.courses[1], "ENG200");
            assert.equal(user.student.courses[2], "SCI200");
            assert.equal(user.student.courses[3], "HIS220");
            // update age 
            user.age = 21;
            // update student courses
            var newCourses = ["ECO512", "CSC421", "BUS221"];
            user.student.courses = user.student.courses.concat(newCourses); 
            user.markModified("student.courses");
            // save user with student document
            user.save( (err, user_product, numAffected) => {
                if(err)
                    done(err);
                // assert that new document exists
                assert.notEqual(user_product, undefined);
                // assert only 1 document affected
                assert.equal(numAffected, 1);
                // assert properties of document as specified 
                // above
                assert.equal(user_product.age, 21);
                assert.equal(user_product.email, "studentUser1234@two2er.com");
                assert.equal(user_product.name, "Student User 1234");
                assert.equal(user_product.location.type, "Point");
                assert.equal(user_product.location.coordinates[0], -87.6563);
                assert.equal(user_product.location.coordinates[1], 41.935314);
                assert.equal(user_product.education.length, 1);
                assert.equal(user_product.education[0].school, "DePaul University");
                assert.equal(user_product.education[0].field, "History");
                assert.equal(Degree.enumValueOf(user_product.education[0].degree), Degree.BA);
                assert.equal(user_product.education[0].year, 2019);
                assert.equal(user_product.education[0].inProgress, true);
                assert.equal(user_product.usergroups.length, 1);
                assert.equal(UserType.enumValueOf(user_product.usergroups[0]).isStudent(), true);
                assert.notEqual(user_product.student, undefined);
                assert.equal(user_product.student.courses.length, 7);
                assert.equal(user_product.student.courses[0], "MAT101");
                assert.equal(user_product.student.courses[1], "ENG200");
                assert.equal(user_product.student.courses[2], "SCI200");
                assert.equal(user_product.student.courses[3], "HIS220");
                assert.equal(user_product.student.courses[4], "ECO512");
                assert.equal(user_product.student.courses[5], "CSC421");
                assert.equal(user_product.student.courses[6], "BUS221");
                done();
            });
        });
    });

    it("Delete User With Student Document", function deleteUserByEmail(done) {
    
        User.remove({email : "studentUser1234@two2er.com"}, (err) => {
            if(err) 
                done(err);
            else{
                done();
            }
        });
    });
});