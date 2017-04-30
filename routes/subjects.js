const router = require('express').Router();
const dateFormat = require('dateformat');
const mongoose = require('mongoose');
const Subject = require('../models/subject.js');

// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
    console.log('Subjects Time:', dateFormat(Date.now(), 'dd-mmm-yyyy HH:mm:ss'));
    next();
});

// Return all Subjects
router.get('/', (req, res) => {

    console.log(`${req.ip} is doing a GET via /subjects`)

    Subject.find( (err, subjects) => {
        if(err)
            res.status(500).send(err);
        
        res.send(subjects);
    });

});

module.exports = router;