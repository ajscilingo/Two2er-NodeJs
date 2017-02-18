const request = require('supertest');
const assert = require('assert');

describe('Running root server tests\n', function() {
    this.timeout(10000);
    var server;
    
    beforeEach( function () {
        delete require.cache[require.resolve('../app')];
        server = require('../app');
    });

    afterEach( function (done) {
            server.close(done);
    });

    it('responds to /', function testSlash(done) {
        request(server)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});