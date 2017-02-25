// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');

// using nodejs's built-in assert
const assert = require('assert');

const schemas = require('./schemadefinitions.js');

describe('Running students tests\n', function() {
    this.timeout(10000);
    var server;
    
    beforeEach( function () {
        delete require.cache[require.resolve('../app')];
        server = require('../app');
    });

    afterEach( function (done) {
            server.close(done);
    });

    var stuSchema = ['school'];

    it('Test GET all students from /api/students', function test(done) {
        request(server)
        .get('/api/students')
        .set('Accept', 'application/json')
        .expect(200, function (err, res) {
            if (err) return done(err);
            var cnt = 0;
            res.body.forEach(function (elem) {
                schemas.studentSchema.forEach(function (field) {
                    assert.notEqual(elem[field], undefined, 'Field is undefined: ' + field);
                });
                cnt++;
            });
            
            assert.notEqual(cnt, 0);

            done();
        });
    });

    it('Test POST to /students/update', function test(done) {
        request(server)
        .post('/api/students/update')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + getToken())
        .send({
            user_id: "58b203f17a1674544d639a9e",
            school: 'School',
            courses: ['course1', 'course2'],
            badfield: 'bad'
        })
        .expect(200)
        .end(done);
    });
});