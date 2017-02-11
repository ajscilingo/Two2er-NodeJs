const request = require('supertest');
const assert = require('assert');
const schemas = require('./schemadefinitions.js');

describe('Running tutors tests\n', function() {
    this.timeout(10000);
    var server;
    
    beforeEach( function () {
        delete require.cache[require.resolve('../app')];
        server = require('../app');
    });

    afterEach( function (done) {
            server.close(done);
    });

    it('Test GET all tutors from /api/tutors', function (done) {
        request(server)
        .get('/api/tutors')
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
            if (err) return done(err);
            
            var cnt = 0;
            res.body.forEach(function(elem) {
                schemas.tutorSchema.forEach(function(field) {
                    assert.notEqual(elem[field], undefined, 'Undefined field: ' + field);
                });
                cnt++;
            });

            assert.notEqual(cnt, 0);

            done();
        });
    });
});