const router = require('express').Router();
var request = require('request');
const Promise = require('bluebird');

require('../stormpathclient.js');

router.get('/getToken', (req, res) => {
   res.json(getToken());
});

router.get('/getMyToken', (req,res) => {
    res.render('token');
});

router.post('/getToken', (req, res) => {

    if (req.body.username != null && req.body.password != null) {

        getMyToken(req.body.username, req.body.password).then(function (token) {
            res.json(token);
        }).catch(function (err) {
            res.status(500).send(err);
        });

    }

    else {

        getMyToken().then(function (token) {
            res.json(token);
        }).catch(function (err) {
            res.status(500).send(err);
        });

    }

});

module.exports = router;