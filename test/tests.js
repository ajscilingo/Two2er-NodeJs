// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');

describe('loading express', () => {
    
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
    beforeEach( () => {
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

    afterEach( (done) => {
         server.close(done);
    });

    it('responds to /', (done) => {
        request(server)
        .get('/')
        .expect(200, done);
    });

    it('responds to /api/users', (done) =>{
        request(server)
        .get('/api/users')
        .expect(200, done);
    });
});