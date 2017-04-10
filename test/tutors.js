// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');

// using nodejs's built-in assert
const assert = require('assert');

const schemas = require('./schemadefinitions.js');

// module for making authenticated calls
// .set('Authorization', 'Bearer ' + getToken())
require('../stormpathclient.js');

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

    /*it('Test GET all tutors from /api/tutors', function (done) {
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
    });*/

    it('Test GET all tutors from /apiauth/tutors', function (done) {
        request(server)
        .get('/apiauth/tutors')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + getToken())
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

    /*it('Test POST to /api/tutors/update', function test(done) {
        request(server)
        .post('/api/tutors/update')
        .set('Accept', 'application/json')
        .send({
            user_id: "58b203f17a1674544d639a9e",
            subjects: ["subjectA", "subjectB"],
            rating: 100,
            qualification: ["qualA", "qualB"],
            score: {
                name: "ScoreName",
                score: 99
            },
            availabilitynow: "true",
            badfield: "bad"
        })
        .expect(200)
        .end(done);
    });*/

    it('Test POST to /apiauth/tutors/update', function test(done) {
        request(server)
        .post('/apiauth/tutors/update')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + getToken())
        .send({
            user_id: "58b203f17a1674544d639a9e",
            subjects: ["subjectA", "subjectB"],
            rating: 4.0,
            availabilitynow: "true",
            badfield: "bad"
        })
        .expect(200)
        .end(done);
    });
});