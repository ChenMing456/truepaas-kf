/**
 * Created by Domoke on 2017/7/17.
 */
"use strict";

var express = require('express');
var router = express.Router();

/*  */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;