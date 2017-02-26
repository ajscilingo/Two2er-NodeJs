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
const Student = require('../models/student.js');
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

            var student = new Student();
            assert.notEqual(student, undefined);

            student.user_id = user._id;
            student.courses = ["MAT 101", "ENG 200", "SCI 200", "HIS 220"]

            student.save( (err, student_product, numAffected) => {
                if(err)
                    done(err);
                // assert that new document exists
                assert.notEqual(student_product, undefined);
                // assert only 1 document affected
                assert.equal(numAffected, 1);
                // assert properties of document as specified 
                // above
                assert.equal(student_product.user_id, user._id);
                assert.equal(student_product.courses.length, 4);
                assert.equal(student_product.courses.includes("MAT 101"), true);
                assert.equal(student_product.courses.includes("ENG 200"), true);
                assert.equal(student_product.courses.includes("SCI 200"), true);
                assert.equal(student_product.courses.includes("HIS 220"), true);
                assert.equal(student_product.courses.includes("GEO 400"), false);
                done();
            });

        });

    });

    it("Search For Student Document By Email", function searchForStudent(done) {
        
        User.findOne({email : "studentUser1234@two2er.com"}, (err, user) => {
            if(err)
                done(err);
            else{
                assert.notEqual(user, undefined);
                assert.notEqual(user._id, undefined);
                assert.equal(user.email, "studentUser1234@two2er.com");
                Student.findOne({user_id: user._id}, (err, student) =>{
                    if(err)
                        done(err);
                    else{
                        //assert.equal(student.user_id, user._id);
                        assert.equal(user.email, "studentUser1234@two2er.com");
                        done();          
                    }
                });
            }
        });

    });

    it("Delete User and Student Document By Email", function deleteStudentByEmail(done) {
    
        User.findOne({email : "studentUser1234@two2er.com"}, (err, user) => {
            if(err)
                done(err);
            else{
                assert.notEqual(user, undefined);
                assert.notEqual(user._id, undefined);
                assert.equal(user.email, "studentUser1234@two2er.com");
                Student.remove({user_id: user._id}, (err) =>{
                    if(err)
                        done(err);
                    else{
                        user.remove( (err, product) => {
                            if(err)
                                done(err);
                            else{
                                done();
                            }
                        });    
                    }
                });
            }
        });
    });
});