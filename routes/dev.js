const router = require('express').Router();
var request = require('request');

require('../stormpathclient.js');

router.get( '/getToken', (req, res) => {
    res.json(getToken());
});

module.exports = router;