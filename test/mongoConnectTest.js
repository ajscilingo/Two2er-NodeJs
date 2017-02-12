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
// Connection String for our Two2er Mongodb Database
const url = 'mongodb://Admin:Password1@52.14.105.241:27017/Two2er';

describe('MongoDB Connection Test', function () {

    before(function () {
        // assert that we aren't connected to the database
        assert.equal(mongoose.connection.readyState, 0);
    });

    it('Test Connection to Database', function testConnect(done) {
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

    it('Test Disconnection from Database', function testDisconnect(done) {
        mongoose.disconnect( (error) => {
            if(error)
                done(error);
            else{
                done();    
            }
        });
    });

    after(function () {
        assert.equal(mongoose.connection.readyState, 0);
    });
});