/*
 * Developed by Koray Gocmen,
 * August, 2016
 * */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Open Forum API'});
});

router.get('/ping', function (req, res, next) {
    res.status(200).json("We are alive!");
});

router.get('/reset_password', function (req, res, next) {
    res.render('reset_password');
});

module.exports = router;
