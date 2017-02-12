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
        
        user.save( (err, product, numAffected) => {
            if(err)
                done(err);
            // assert that new document exists
            assert.notEqual(product, undefined);
            // assert only 1 document affected
            assert.equal(numAffected, 1);
            // assert properties of document as specified 
            // above
            assert.equal(product.age, 27);
            assert.equal(product.email, "tutorUser1234@two2er.com");
            assert.equal(product.name, "Tutor User 1234");
            assert.equal(product.location.type, "Point");
            assert.equal(product.location.coordinates[0], -87.65263);
            assert.equal(product.location.coordinates[1], 41.934214);

            var tutor = new Tutor();
            assert.notEqual(tutor, undefined);

            tutor.user_id = user._id;
            tutor.subjects = ["Math", "English"];

            tutor.save( (err, product, numAffected) => {
                if(err)
                    done(err);
                // assert that new document exists
                assert.notEqual(product, undefined);
                // assert only 1 document affected
                assert.equal(numAffected, 1);
                // assert properties of document as specified 
                // above
                assert.equal(product.user_id, user._id);
                assert.equal(product.subjects[0], "Math");
                assert.equal(product.subjects[1], "English");
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
                        assert.equal(tutor.subjects[1], "English");
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