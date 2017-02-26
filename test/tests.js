// NOTE 1: Be mindful not to commit usages of test cases with it.only() or 
// describe.only() to version control, unless you really mean it!

// NOTE 2: Use it.skip or describe.skip instead of commenting test cases out
// Don’t do nothing! A test should make an assertion or use this.skip().

// NOTE 3: Passing arrow functions (“lambdas”) to Mocha is discouraged. 
// Due to the lexical binding of 'this', such functions are unable to 
// access the Mocha context.  More Info here: https://mochajs.org/#arrow-functions

// Miles in terms of Meters for geospatial queries
// Making global (no var keyword) so all our test modules can access it
METERS_IN_MILES = 1609.34;

// Bounding Box Used For Geospatial Tests Using geojson-random 
// generated points, Bounding Box Keeps Points Within the US
BBOX_USA = [-124.848974,24.396308,-66.885444,49.384358];

// Set Port to 8080 for Tests as it won't run on Port 80
// on Dev machines
process.env.PORT = 8080;

describe('Running Tests', function () {
    
    describe('Loading Mongo tests', function () {
        require('./mongoConnectTest.js');
    });

    describe('Loading Mongo User Model tests', function () {
        require('./mongoUserModelTest.js');
    });

    describe('Loading Mongo Student Model tests', function () {
        require('./mongoStudentModelTest.js')
    });

    describe('Loading Mongo Tutor Model tests', function () {
        require('./mongoTutorModelTest.js')
    });

    describe('Loading root test', function() {
        require('./root.js');
    });
    describe('Loading users tests', function() {
        require('./users.js');
    });
    // describe('Loading student tests', function() {
    //     require('./students.js');
    // })
    // describe('Loading tutor tests', function() {
    //     require('./tutors.js');
    // })
    // describe('Loading user location tests', function() {
    //     require('./userlocations.js');
    // })
});