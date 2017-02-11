// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');
const assert = require('assert');

// NOTE: Passing arrow functions (“lambdas”) to Mocha is discouraged. 
// Due to the lexical binding of 'this', such functions are unable to 
// access the Mocha context.  More Info here: https://mochajs.org/#arrow-functions

describe('loading express', function () {
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
    
    beforeEach( function () {
        
        // each call to require caches the object and path internally
        // in nodejs, so when we close the server object nodejs 
        // this server object doesn't get recreated because 
        // node already keeps track of the first creation of it
        // therefore we need to force delete it from node's cache.
        // so we can re-instantiate server.

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

    it('responds to /', function testSlash(done) {
        request(server)
        .get('/')
        .expect(200, done);
    });

    it('responds to /api/users', function testPath(done) {
        request(server)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
            var cnt = 0;
            res.body.forEach(function(elem) {
                assert.notEqual(elem["_id"], undefined, "_id is undefined");
                assert.notEqual(elem["name"], undefined, "name is undefined");
                assert.notEqual(elem["email"], undefined, "email is undefined");
                //assert.notEqual(elem["age"], undefined, "age is undefined");
                //assert.notEqual(elem["location"], undefined, "location is undefined");
                //assert.notEqual(elem.location["coordinates"], undefined);
                //assert.notEqual(elem.location["type"], undefined);
                cnt++;
            });

            assert.notEqual(cnt, 0);

            done();
        });
    });
});