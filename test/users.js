// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');

// using nodejs's built-in assert
const assert = require('assert');
const schemas = require('./schemadefinitions.js');

describe('Running user tests\n', function() {
    this.timeout(10000);
    
    // we need to create a new connection/instance 
    // and close the previous instance
    // of our server before each test so 
    // we know that previous requests had 
    // no effect on the current test
    // otherwise we introduce the 
    // possibility of calling methods
    // in a specific order as a 
    // condition as to whether something
    // fails or passes.
    var server;
    
    // each call to require caches the object and path internally
    // in nodejs, so when we close the server object nodejs 
    // this server object doesn't get recreated because 
    // node already keeps track of the first creation of it
    // therefore we need to force delete it from node's cache.
    // so we can re-instantiate server.

    beforeEach( function () {
        delete require.cache[require.resolve('../app')];
        server = require('../app');
    });

    // to properly close
    // expressjs server 
    // we need to wait for 
    // all connections to close
    // and only then let the mocha
    // test runtime know that it can
    // continue, even if we 
    // introduce a timeout the server
    // is NOT closed - we need to pass
    // mocha's done callback to close

    afterEach( function (done) {
            server.close(done);
    });

    it('Test GET all users from /api/users', function testPath(done) {
        request(server)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
            if (err) return done(err);
            
            var cnt = 0;
            res.body.forEach(function(elem) {
                schemas.userSchema.forEach(function(field) {
                    assert.notEqual(elem[field], undefined, 'Undefined field: ' + field);
                });
                schemas.locationSchema.forEach(function(field) {
                    var loc = elem['location'];
                    assert.notEqual(loc[field], undefined, 'Undefined field: location. ' + field);
                });
                cnt++;
            });

            assert.notEqual(cnt, 0);

            done();
        });
    });

    // it('Test post to /api/users', function test(done) {
    //     request(server)
    //     .post('/api/users')
    //     .send({
    //         name: 'TestUserName',
    //         email: 'test@gmail.com',
    //         age: '100',
    //         location: {
    //             coordinates: [10,10],
    //             type: 'Point'
    //         }
    //     })
    //     .end(done);
    // });

    // it('/getUserByName/:name returns user by name', function test(done) {
    //     request(server).post('/').send({
    //         name: 'TestUserName',
    //         email: 'test@gmail.com',
    //         age: '100',
    //         location: {
    //             coordinates: [10,10],
    //             type: 'Point'
    //         }
    //     });
    //     request(server)
    //     .get('api/getUserByName/TestUserName')
    //     .set('Accept', 'application/json')
    //     .expect(200, function (err, res) {
                // if (err) return done(err);
    //         var testUser = res.body[0];
    //         var loc = testUser['location'];
    //         assert.equal(testUser['name'], 'TestUserName');
    //         assert.equal(testUser['email'], 'test@gmail.com');
    //         assert.equal(testUser['age'], '100');
    //         console.log(loc['coordinates']);
    //         assert.equal(loc['type'], 'Point');
    //         done();
    //     });
    // });
});
