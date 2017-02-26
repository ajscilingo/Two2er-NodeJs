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
// Mongoose User and Tutor Models
const User = require('../models/user.js');
const Tutor = require('../models/tutor.js');
// Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';

// Enums used for Educational Degrees
const Degree = require('../enums/degree.js');
// Enums used for User UserType
const UserType = require('../enums/usertype.js');

// change mongoose to use NodeJS global promises to supress promise deprication warning.
// https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

describe("MongoDB Tutor Model Test", function () {

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

    it("Create New User and Tutor Document", function createNewTutor(done) {
        
        // create new instance of User Model
        var user = new User();
        assert.notEqual(user, undefined);
        
        user.age = 27;
        user.email = "tutorUser1234@two2er.com";
        user.name = "Tutor User 1234";
        user.location = {coordinates: [-87.65263, 41.934214], type: 'Point'};
        
        // Education History
        user.education.push({school: "UIC", field: "Computer Science", degree: "BS", year: 2004, inProgress: false});
        user.education.push({school: "UIC", field: "Software Engineering", degree: "MS", year: 2008, inProgress: false});
        user.education.push({school: "UIC", field: "Computer Science", degree: "PHD", year: 2011, inProgress: false});

        // Add to Tutors User Group
        user.usergroups.push('Tutor');

        user.save( (err, user_product, numAffected) => {
            if(err)
                done(err);
            // assert that new document exists
            assert.notEqual(user_product, undefined);
            // assert only 1 document affected
            assert.equal(numAffected, 1);
            // assert properties of document as specified 
            // above
            assert.equal(user_product.age, 27);
            assert.equal(user_product.email, "tutorUser1234@two2er.com");
            assert.equal(user_product.name, "Tutor User 1234");
            assert.equal(user_product.location.type, "Point");
            assert.equal(user_product.location.coordinates[0], -87.65263);
            assert.equal(user_product.location.coordinates[1], 41.934214);

            var tutor = new Tutor();
            assert.notEqual(tutor, undefined);

            tutor.user_id = user._id;
            tutor.subjects = ["Math", "Physics"];

            tutor.save( (err, tutor_product, numAffected) => {
                if(err)
                    done(err);
                // assert that new document exists
                assert.notEqual(tutor_product, undefined);
                // assert only 1 document affected
                assert.equal(numAffected, 1);
                // assert properties of document as specified 
                // above
                assert.equal(tutor_product.user_id, user._id);
                assert.equal(tutor_product.subjects[0], "Math");
                assert.equal(tutor_product.subjects[1], "Physics");
                assert.equal(user_product.education.length, 3);
                assert.equal(Degree.enumValueOf(user_product.education[0].degree), Degree.BS);
                assert.equal(Degree.enumValueOf(user_product.education[1].degree), Degree.MS);
                assert.equal(Degree.enumValueOf(user_product.education[2].degree), Degree.PHD);
                assert.equal(UserType.enumValueOf(user_product.usergroups[0]).isTutor(), true);
                done();
            });

        });

    });

    it("Search For Tutor Document By Email", function searchForTutor(done) {
        
        User.findOne({email : "tutorUser1234@two2er.com"}, (err, user) => {
            if(err)
                done(err);
            else{
                assert.notEqual(user, undefined);
                assert.notEqual(user._id, undefined);
                assert.equal(user.email, "tutorUser1234@two2er.com");
                Tutor.findOne({user_id: user._id}, (err, tutor) =>{
                    if(err)
                        done(err);
                    else{
                        //assert.equal(student.user_id, user._id);
                        assert.equal(tutor.subjects[0], "Math");
                        assert.equal(tutor.subjects[1], "Physics");
                        done();          
                    }
                });
            }
        });

    });

    it("Delete User and Tutor Document By Email", function deleteTutorByEmail(done) {
    
        User.findOne({email : "tutorUser1234@two2er.com"}, (err, user) => {
            if(err)
                done(err);
            else{
                assert.notEqual(user, undefined);
                assert.notEqual(user._id, undefined);
                assert.equal(user.email, "tutorUser1234@two2er.com");
                Tutor.remove({user_id: user._id}, (err) =>{
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