// NOTE 1: Be mindful not to commit usages of test cases with it.only() or 
// describe.only() to version control, unless you really mean it!

// NOTE 2: Use it.skip or describe.skip instead of commenting test cases out
// Don’t do nothing! A test should make an assertion or use this.skip().

// NOTE 3: Passing arrow functions (“lambdas”) to Mocha is discouraged. 
// Due to the lexical binding of 'this', such functions are unable to 
// access the Mocha context.  More Info here: https://mochajs.org/#arrow-functions

// supertest - a SuperAgent driven library for testing HTTP Servers
const request = require('supertest');

describe('Running Tests', function () {
    describe('Loading root test', function() {
        require('./root.js');
    })
    describe('Loading users tests', function() {
        require('./users.js');
    })
    describe('Loading student tests', function() {
        require('./students.js');
    })
    describe('Loading tutor tests', function() {
        require('./tutors.js');
    })
    describe('Loading user location tests', function() {
        require('./userlocations.js');
    })
});