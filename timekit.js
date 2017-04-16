const timekit = require('timekit-sdk');

// set timekit parameters
// including default timezone 
// and api version
timekit.configure({
    app: 'two2er-754',
    apiVersion: 'v2',
    timezone: 'America/Chicago'
});

module.exports = timekit;